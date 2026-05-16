/** Union of supported deployment stages. */
export type AppStage = 'local' | 'dev' | 'testing' | 'prod';

/** Supported deployment stages for the starter. */
export const APP_STAGES = ['local', 'dev', 'testing', 'prod'] satisfies ReadonlyArray<AppStage>;

/** Stable URI version used by the sample API surface. */
export const API_V1 = '1';

/** Whether debug-only behavior should be enabled. */
export const IS_DEBUG = process.env.DEBUG === '1';

/** Whether the current Node process is running a production build. */
export const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';

/** Normalized deployment stage used by runtime helpers before Nest config is available. */
export const STAGE = resolveAppStage(process.env.STAGE);

/** Whether the active stage should use production runtime defaults. */
export const IS_PRODUCTION = STAGE === 'prod';

/**
 * Normalizes a raw stage string into one of the supported application stages.
 *
 * @param value - Raw `STAGE` environment value.
 * @returns Normalized stage identifier.
 * @throws When the provided value is not one of the supported stages.
 */
function resolveAppStage(value: string | undefined): AppStage {
  const stage = value?.trim() || 'local';

  for (const appStage of APP_STAGES) {
    if (appStage === stage) {
      return appStage;
    }
  }

  throw new Error(`STAGE must be one of: ${APP_STAGES.join(', ')}.`);
}
