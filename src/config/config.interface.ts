import type { AppStage } from '../app.constants';

/**
 * Strongly typed application configuration exposed by the config factory.
 */
export interface IConfig {
  /** Database connection settings used by Prisma. */
  readonly database: {
    /** Maximum number of connections reserved for Prisma's pool. */
    readonly poolSize: number;
    /** Full PostgreSQL connection string for the active environment. */
    readonly url: string;
  };

  /** Deployment stage identifier used to toggle environment-specific defaults. */
  readonly stage: AppStage;

  /** JWT configuration used by the global auth guard and strategy. */
  readonly jwt: {
    /** Token lifetime passed to the JWT module. */
    readonly expiresIn: string;
    /** Secret used to sign and verify access tokens. */
    readonly secret: string;
  };
}
