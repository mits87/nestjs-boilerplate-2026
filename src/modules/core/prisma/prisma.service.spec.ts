import { describe, expect, it, vi } from 'vitest';

const { prismaPgMock } = vi.hoisted(() => ({
  prismaPgMock: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: prismaPgMock,
}));

vi.mock('@prisma/client', () => {
  class PrismaClient {
    public $connect = vi.fn();
    public $disconnect = vi.fn();
  }

  return { PrismaClient };
});

import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import type { IConfig } from '../../../config/config.interface';
import { PrismaService } from './prisma.service';

/**
 * Test-only ConfigService subclass exposing the database configuration PrismaService reads.
 */
class TestConfigService extends ConfigService<IConfig, true> {
  /**
   * Returns the database section expected by PrismaService.
   *
   * @returns Fixed database configuration used by the spec.
   */
  public override getOrThrow(propertyPath: 'database'): IConfig['database'];
  public override getOrThrow(propertyPath: string): unknown {
    if (propertyPath === 'database') {
      return {
        poolSize: 5,
        url: 'postgresql://localhost:5433/db?schema=tenant_1',
      };
    }

    throw new Error(`Unexpected config path: ${propertyPath}`);
  }
}

describe('PrismaService', () => {
  it('configures the Prisma PG adapter with the extracted schema', () => {
    new PrismaService(new TestConfigService());

    expect(prismaPgMock).toHaveBeenCalledWith(
      { connectionString: 'postgresql://localhost:5433/db', max: 5 },
      { schema: 'tenant_1' },
    );
  });

  it('is an instance of PrismaClient', () => {
    const service = new PrismaService(new TestConfigService());

    expect(service).toBeInstanceOf(PrismaClient);
  });

  it('connects on module init', async () => {
    const service = new PrismaService(new TestConfigService());
    const connectSpy = vi.spyOn(service, '$connect').mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledOnce();
  });

  it('disconnects on module destroy', async () => {
    const service = new PrismaService(new TestConfigService());
    const disconnectSpy = vi.spyOn(service, '$disconnect').mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});
