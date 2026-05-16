import { afterEach, describe, expect, it } from 'vitest';

import { createLoggerOptions } from './logger.provider';

/**
 * Restores process environment mutations performed by logger configuration tests.
 */
describe('createLoggerOptions', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  /**
   * Narrows the `nestjs-pino` params bag to its HTTP logger configuration object.
   *
   * @returns The concrete `pinoHttp` configuration used by the boilerplate.
   */
  const getPinoHttpOptions = () => {
    const pinoHttp = createLoggerOptions().pinoHttp;

    if (
      !pinoHttp ||
      typeof pinoHttp !== 'object' ||
      Array.isArray(pinoHttp) ||
      !('customLogLevel' in pinoHttp) ||
      !('level' in pinoHttp)
    ) {
      throw new Error('Expected pinoHttp to be configured as an options object.');
    }

    return pinoHttp;
  };

  it('uses debug logging with pretty transport during local development', () => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: '',
      LOG_PRETTY: 'true',
      NODE_ENV: 'development',
      STAGE: 'local',
    };

    const pinoHttp = getPinoHttpOptions();

    expect(pinoHttp).toMatchObject({
      level: 'debug',
      transport: { target: 'pino-pretty' },
      redact: {
        censor: '[Redacted]',
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      },
    });
  });

  it('uses info logging without pretty transport in production', () => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: '',
      LOG_PRETTY: 'true',
      NODE_ENV: 'production',
      STAGE: 'prod',
    };

    const pinoHttp = getPinoHttpOptions();

    expect(pinoHttp.level).toBe('info');
    expect(('transport' in pinoHttp ? pinoHttp.transport : undefined) ?? undefined).toBeUndefined();
  });

  it('honors explicit log env overrides', () => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: 'silent',
      LOG_PRETTY: 'false',
      NODE_ENV: 'development',
      STAGE: 'dev',
    };

    const pinoHttp = getPinoHttpOptions();

    expect(pinoHttp.level).toBe('silent');
    expect(('transport' in pinoHttp ? pinoHttp.transport : undefined) ?? undefined).toBeUndefined();
  });
});
