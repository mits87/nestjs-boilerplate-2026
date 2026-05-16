import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Restores environment mutations performed by config factory tests.
 */
describe('createConfig', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('builds typed config from the environment', async () => {
    process.env = {
      ...originalEnv,
      DATABASE_POOL_SIZE: '5',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/db?schema=public',
      JWT_SECRET_KEY: 'test-secret',
      STAGE: 'testing',
    };

    const { createConfig } = await import('./config.factory');

    expect(createConfig()).toEqual({
      database: {
        poolSize: 5,
        url: 'postgresql://postgres:postgres@localhost:5433/db?schema=public',
      },
      jwt: {
        expiresIn: '30d',
        secret: 'test-secret',
      },
      stage: 'testing',
    });
  });

  it('fails fast for invalid integer env values', async () => {
    process.env = {
      ...originalEnv,
      DATABASE_POOL_SIZE: 'invalid',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/db?schema=public',
      JWT_SECRET_KEY: 'test-secret',
      STAGE: 'dev',
    };

    const { createConfig } = await import('./config.factory');

    expect(() => createConfig()).toThrow('Environment variable "DATABASE_POOL_SIZE" must be a safe integer.');
  });

  it('fails fast for unsupported stages', async () => {
    process.env = {
      ...originalEnv,
      DATABASE_POOL_SIZE: '5',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/db?schema=public',
      JWT_SECRET_KEY: 'test-secret',
      STAGE: 'staging',
    };

    await expect(import('./config.factory')).rejects.toThrow('STAGE must be one of: local, dev, testing, prod.');
  });
});
