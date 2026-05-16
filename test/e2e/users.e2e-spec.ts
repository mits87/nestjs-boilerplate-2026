import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { authedRequest, createAccessToken, expectResponseId, setupE2EApplication } from '../helpers/e2e.helpers';

type ValidationErrorBody = {
  readonly code: string;
  readonly errors: ReadonlyArray<{
    readonly code: string;
    readonly location?: string;
    readonly locationType?: string;
    readonly message: string;
  }>;
  readonly message: string;
};

/**
 * Narrows an unknown value to a plain key/value object.
 *
 * @param value - Value to validate.
 * @returns `true` when the value is a plain object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Narrows an unknown response body to a minimal user payload used by the e2e assertions.
 *
 * @param body - Response body of unknown shape.
 * @returns Narrowed user payload.
 */
function expectUserBody(body: unknown): { readonly email: string; readonly id: string } {
  if (!isRecord(body)) {
    throw new Error('Expected response body to be an object.');
  }
  const id = body['id'];
  const email = body['email'];

  if (typeof id !== 'string') {
    throw new Error('Expected response body to contain a string `id`.');
  }
  if (typeof email !== 'string') {
    throw new Error('Expected response body to contain a string `email`.');
  }

  return {
    email,
    id,
  };
}

/**
 * Narrows an unknown response body to the validation error envelope used by the API.
 *
 * @param body - Response body of unknown shape.
 * @returns Narrowed validation error payload.
 */
function expectValidationErrorBody(body: unknown): ValidationErrorBody {
  if (!isRecord(body)) {
    throw new Error('Expected error response body to be an object.');
  }
  const code = body['code'];
  const message = body['message'];
  const rawErrors = body['errors'];

  if (typeof code !== 'string') {
    throw new Error('Expected error response body to contain a string `code`.');
  }
  if (typeof message !== 'string') {
    throw new Error('Expected error response body to contain a string `message`.');
  }
  if (!Array.isArray(rawErrors)) {
    throw new Error('Expected error response body to contain an `errors` array.');
  }

  const errors = rawErrors.flatMap((item): ValidationErrorBody['errors'] =>
    isRecord(item) && typeof item['code'] === 'string' && typeof item['message'] === 'string'
      ? [
          {
            code: item['code'],
            ...(typeof item['location'] === 'string' ? { location: item['location'] } : {}),
            ...(typeof item['locationType'] === 'string' ? { locationType: item['locationType'] } : {}),
            message: item['message'],
          },
        ]
      : [],
  );

  return {
    code,
    errors,
    message,
  };
}

describe('Users E2E', () => {
  const e2e = setupE2EApplication();

  it('rejects protected routes without a bearer token', async () => {
    await request(e2e.httpServer).get('/api/v1/users').expect(401);
  });

  it('creates, lists, shows, updates, and deletes users', async () => {
    const actorId = randomUUID();
    const api = authedRequest(e2e.httpServer, actorId);

    const createResponse = await api.post('/api/v1/users').send({ email: '  Person@Example.COM  ' }).expect(201);
    const createdUser = expectUserBody(createResponse.body);

    expect(createdUser.email).toBe('person@example.com');
    expect(createdUser.id).toEqual(expect.any(String));

    const createdUserId = expectResponseId(createResponse.body);

    const listResponse = await api.get('/api/v1/users').expect(200);
    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdUserId,
          email: 'person@example.com',
        }),
      ]),
    );

    await api.get(`/api/v1/users/${createdUserId}`).expect(200);

    const meResponse = await request(e2e.httpServer)
      .get('/api/v1/users/me')
      .set('authorization', `Bearer ${createAccessToken(createdUserId)}`)
      .expect(200);
    const meBody = expectUserBody(meResponse.body);

    expect(meBody).toMatchObject({
      id: createdUserId,
      email: 'person@example.com',
    });

    const updateResponse = await api
      .patch(`/api/v1/users/${createdUserId}`)
      .send({ email: 'updated@example.com' })
      .expect(200);
    const updatedUser = expectUserBody(updateResponse.body);

    expect(updatedUser).toMatchObject({
      id: createdUserId,
      email: 'updated@example.com',
    });

    await api.delete(`/api/v1/users/${createdUserId}`).expect(204);
    await api.get(`/api/v1/users/${createdUserId}`).expect(404);
  });

  it('returns validation details for malformed payloads', async () => {
    const api = authedRequest(e2e.httpServer, randomUUID());

    const response = await api.post('/api/v1/users').send({ email: 'not-an-email' }).expect(400);
    const responseBody = expectValidationErrorBody(response.body);

    expect(responseBody.code).toBe('BadRequestValidationException');
    expect(responseBody.message).toEqual(expect.stringContaining('Validation failed'));
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'BadRequestValidationException',
          location: 'email',
          locationType: 'requestBody',
        }),
      ]),
    );
  });

  it('rejects malformed UUID route params before hitting Prisma', async () => {
    const api = authedRequest(e2e.httpServer, randomUUID());

    const response = await api.get('/api/v1/users/not-a-uuid').expect(400);

    expect(response.body).toMatchObject({
      code: 'BadRequestException',
    });
  });

  it('returns conflicts for duplicate email addresses', async () => {
    const api = authedRequest(e2e.httpServer, randomUUID());

    await api.post('/api/v1/users').send({ email: 'person@example.com' }).expect(201);

    const response = await api.post('/api/v1/users').send({ email: 'person@example.com' }).expect(409);

    expect(response.body).toMatchObject({
      code: 'ConflictException',
      message: 'Row already exists',
    });
  });
});
