import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import type { IConfig } from '../../../config/config.interface';
import { parsePrismaPgConnectionDetails } from './prisma-pg-connection.helper';

/**
 * Owns the lifecycle of the application's Prisma client.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Creates a Prisma client configured for Postgres via the Prisma PG adapter.
   *
   * @param config - Provides the database configuration.
   */
  constructor(config: ConfigService<IConfig, true>) {
    const dbConfig = config.getOrThrow('database', { infer: true });
    const connectionDetails = parsePrismaPgConnectionDetails(dbConfig.url);
    const adapter = new PrismaPg(
      { connectionString: connectionDetails.connectionString, max: dbConfig.poolSize },
      connectionDetails.schema === null ? undefined : { schema: connectionDetails.schema },
    );

    super({ adapter });
  }

  /**
   * Disconnects Prisma when the Nest module is destroyed.
   *
   * @returns Resolves once Prisma has disconnected from the database.
   */
  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Connects Prisma when the Nest module initializes.
   *
   * @returns Resolves once Prisma has connected to the database.
   */
  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
