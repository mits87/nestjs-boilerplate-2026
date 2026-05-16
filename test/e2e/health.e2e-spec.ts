import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { setupE2EApplication } from '../helpers/e2e.helpers';

describe('Health E2E', () => {
  const e2e = setupE2EApplication();

  it('returns the public health payload without authentication', async () => {
    const response = await request(e2e.httpServer).get('/api/v1/health/ping').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
    });
  });
});
