import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

/**
 * Registers the public health endpoint.
 */
@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
