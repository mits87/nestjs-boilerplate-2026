import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createHttpExecutionContext } from '../../test/helpers/http-execution-context.helper';
import { BadRequestValidationException } from '../exceptions';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const createArgumentsHost = (path: string) => {
    const response = {
      json: vi.fn(),
      status: vi.fn(),
    };

    response.status.mockReturnValue(response);

    return {
      host: createHttpExecutionContext({
        classRef: HttpExceptionFilter,
        handler: HttpExceptionFilter.prototype.catch,
        path,
        response,
      }),
      response,
    };
  };

  const createValidationException = () => {
    return new BadRequestValidationException(
      [
        {
          children: [
            {
              children: [],
              constraints: { isString: 'street must be a string' },
              property: 'street',
            },
          ],
          property: 'customer',
        },
      ],
      'Validation failed',
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes validation errors into the public error envelope', () => {
    const filter = new HttpExceptionFilter();
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const { host, response } = createArgumentsHost('/api/v1/users');

    filter.catch(createValidationException(), host);

    expect(logSpy).toHaveBeenCalledOnce();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      code: 'BadRequestValidationException',
      errors: [
        {
          code: 'BadRequestValidationException',
          location: 'customer.street',
          locationType: 'requestBody',
          message: 'Validation failed: customer.street must be a string',
        },
      ],
      message: 'Validation failed: customer.street must be a string',
      status: 400,
    });
  });

  it('logs not found errors at debug level with a minimal payload', () => {
    const filter = new HttpExceptionFilter();
    const debugSpy = vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    const { host, response } = createArgumentsHost('/api/v1/missing');

    filter.catch(new NotFoundException('Route not found'), host);

    expect(debugSpy).toHaveBeenCalledWith(
      {
        error: {
          code: 'NotFoundException',
          message: 'Route not found',
          status: 404,
        },
      },
      'Exception during HTTP request occured.',
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      code: 'NotFoundException',
      errors: [{ code: 'NotFoundException', message: 'Route not found' }],
      message: 'Route not found',
      status: 404,
    });
  });

  it('logs server errors at error level and keeps the public envelope stable', () => {
    const filter = new HttpExceptionFilter();
    const errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { host, response } = createArgumentsHost('/api/v1/users');

    filter.catch(new InternalServerErrorException('Unexpected failure'), host);

    expect(errorSpy).toHaveBeenCalledWith(
      {
        error: expect.objectContaining({
          code: 'InternalServerErrorException',
          message: 'Unexpected failure',
          stack: expect.any(String),
          status: 500,
        }),
      },
      'Exception during HTTP request occured.',
    );
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      code: 'InternalServerErrorException',
      errors: [{ code: 'InternalServerErrorException', message: 'Unexpected failure' }],
      message: 'Unexpected failure',
      status: 500,
    });
  });

  it('logs client errors below 500 without a stack trace', () => {
    const filter = new HttpExceptionFilter();
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const { host, response } = createArgumentsHost('/api/v1/users');

    filter.catch(new BadRequestException('Malformed request'), host);

    expect(logSpy).toHaveBeenCalledWith(
      {
        error: {
          code: 'BadRequestException',
          errors: [{ code: 'BadRequestException', message: 'Malformed request' }],
          message: 'Malformed request',
          path: '/api/v1/users',
          response: {
            error: 'Bad Request',
            message: 'Malformed request',
            statusCode: 400,
          },
          status: 400,
        },
      },
      'Exception during HTTP request occured.',
    );
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      code: 'BadRequestException',
      errors: [{ code: 'BadRequestException', message: 'Malformed request' }],
      message: 'Malformed request',
      status: 400,
    });
  });
});
