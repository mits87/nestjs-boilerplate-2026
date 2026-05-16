import {
  configureE2ERuntimeStatePath,
  deleteE2ERuntimeState,
  writeE2ERuntimeState,
} from './containers/e2e-runtime-state';
import { getE2EMaxWorkers, getE2EWorkerSchemaName } from './containers/e2e-worker-schema';
import { preparePostgresTestDatabase, stopPostgresTestContainer } from './containers/postgres-test-container';

/**
 * Boots shared e2e infrastructure exactly once for the whole Vitest run.
 *
 * @returns Teardown callback invoked once after the whole e2e run completes.
 */
export async function setup(): Promise<() => Promise<void>> {
  configureE2ERuntimeStatePath();

  try {
    const workerSchemaNames = Array.from({ length: getE2EMaxWorkers() }, (_, index) =>
      getE2EWorkerSchemaName(index + 1),
    );

    const databaseUrl = await preparePostgresTestDatabase(workerSchemaNames);

    writeE2ERuntimeState({ databaseUrl });

    return async () => {
      deleteE2ERuntimeState();
      await stopPostgresTestContainer();
    };
  } catch (error) {
    deleteE2ERuntimeState();
    await Promise.allSettled([stopPostgresTestContainer()]);
    throw error;
  }
}
