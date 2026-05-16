import { createNestHttpApp } from './app.factory';
import { getIntegerEnv } from './utils';

/**
 * Boots the HTTP application and starts listening on the configured port.
 *
 * @returns A promise that resolves once the HTTP server starts listening.
 */
async function bootstrap(): Promise<void> {
  const app = await createNestHttpApp();
  const port = getIntegerEnv('PORT', 3000);

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
