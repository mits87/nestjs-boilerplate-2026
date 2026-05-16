import type { INestApplication } from '@nestjs/common';

import { createNestHttpApp } from '../../src/app.factory';

/** Port value passed to `app.listen` to request a random ephemeral port from the OS. */
const RANDOM_AVAILABLE_PORT = 0;

/**
 * Shared Nest application data reused by every e2e spec running in the current Vitest worker.
 */
export interface SharedE2EApp {
  /** Fully initialized Nest application instance. */
  readonly app: INestApplication;
  /** Base URL of the listening Nest application. */
  readonly baseUrl: string;
  /** Supertest-compatible HTTP target exposed by the shared app. */
  readonly httpServer: string;
}

/**
 * Process-global storage used to cache the shared e2e Nest app across spec files.
 */
type E2EAppGlobal = typeof globalThis & {
  /** Resolved shared e2e app for the current worker. */
  __nestjsBoilerplateE2ESharedApp?: SharedE2EApp;
  /** In-flight bootstrap promise so concurrent callers reuse the same initialization. */
  __nestjsBoilerplateE2ESharedAppPromise?: Promise<SharedE2EApp>;
};

/**
 * Returns the process-global object narrowed with the e2e singleton fields.
 *
 * @returns Global object carrying the worker-local app singleton.
 */
function getE2EAppGlobal(): E2EAppGlobal {
  return globalThis;
}

/**
 * Boots the shared Nest e2e application once per Vitest worker and reuses it across spec files.
 *
 * @returns Shared Nest application data for the current worker.
 */
export async function getSharedE2EApp(): Promise<SharedE2EApp> {
  const globalState = getE2EAppGlobal();

  if (globalState.__nestjsBoilerplateE2ESharedApp !== undefined) {
    return globalState.__nestjsBoilerplateE2ESharedApp;
  }

  if (globalState.__nestjsBoilerplateE2ESharedAppPromise === undefined) {
    globalState.__nestjsBoilerplateE2ESharedAppPromise = (async () => {
      const app = await createNestHttpApp();

      await app.init();
      await app.listen(RANDOM_AVAILABLE_PORT, '127.0.0.1');

      const baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');

      const sharedApp: SharedE2EApp = {
        app,
        baseUrl,
        httpServer: baseUrl,
      };

      globalState.__nestjsBoilerplateE2ESharedApp = sharedApp;
      return sharedApp;
    })();
  }

  return globalState.__nestjsBoilerplateE2ESharedAppPromise;
}
