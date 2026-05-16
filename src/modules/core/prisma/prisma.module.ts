import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { PrismaService } from './prisma.service';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

/**
 * Registers the shared Prisma service and global Prisma exception translation.
 */
@Global()
@Module({
  exports: [PrismaService],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    PrismaService,
  ],
})
export class PrismaModule {}
