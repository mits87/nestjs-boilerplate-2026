import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { createConfig } from './config/config.factory';
import { HttpExceptionFilter } from './filters';
import { AuthModule } from './modules/auth/auth.module';
import { JwtGuard } from './modules/auth/guards';
import { PrismaModule } from './modules/core/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { createLoggerOptions } from './providers/logger.provider';

/**
 * Root application module that wires global infrastructure and the sample feature modules.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [createConfig],
    }),
    LoggerModule.forRoot(createLoggerOptions()),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    HttpExceptionFilter,
    JwtGuard,
    { provide: APP_FILTER, useExisting: HttpExceptionFilter },
    { provide: APP_GUARD, useExisting: JwtGuard },
  ],
})
export class AppModule {}
