import { repl } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * Boots the interactive Nest REPL for the application module.
 *
 * @returns A promise that resolves when the REPL has been started.
 */
async function bootstrap(): Promise<void> {
  await repl(AppModule);
}

void bootstrap();
