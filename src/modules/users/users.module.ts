import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersStore } from './users.store';

/**
 * Sample protected CRUD module backed by Prisma.
 */
@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    {
      provide: UsersStore,
      useExisting: UsersRepository,
    },
  ],
})
export class UsersModule {}
