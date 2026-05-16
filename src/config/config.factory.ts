import { IS_PRODUCTION, STAGE } from '../app.constants';
import { getEnv, getIntegerEnv } from '../utils';
import type { IConfig } from './config.interface';

/**
 * Builds the application configuration object from environment variables.
 *
 * @returns The normalized runtime configuration.
 */
export function createConfig(): IConfig {
  return {
    database: {
      url: getEnv('DATABASE_URL'),
      poolSize: getIntegerEnv('DATABASE_POOL_SIZE', 10),
    },
    stage: STAGE,
    jwt: {
      expiresIn: IS_PRODUCTION ? '48h' : '30d',
      secret: getEnv('JWT_SECRET_KEY'),
    },
  };
}
