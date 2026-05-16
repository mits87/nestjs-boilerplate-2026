import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../core/prisma/prisma.service';
import { CreateUserRequestDto, UpdateUserRequestDto } from './dto';
import { UsersStore } from './users.store';

/**
 * Thin persistence layer for the sample users module.
 */
@Injectable()
export class UsersRepository extends UsersStore {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Persists a new user row.
   *
   * @param payload - Validated create payload.
   * @returns Created user record.
   */
  public override create(payload: CreateUserRequestDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: payload.email,
      },
    });
  }

  /**
   * Deletes a user by identifier.
   *
   * @param id - User identifier.
   * @returns Resolves once the row has been removed.
   */
  public override async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Returns every user in deterministic reverse creation order.
   *
   * @returns Persisted user rows.
   */
  public override findMany(): Promise<Array<User>> {
    return this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  /**
   * Returns a single user row or throws when it does not exist.
   *
   * @param id - User identifier.
   * @returns Matching user record.
   */
  public override findUniqueOrThrow(id: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  /**
   * Updates a user by identifier.
   *
   * @param id - User identifier.
   * @param payload - Validated update payload.
   * @returns Updated user record.
   */
  public override update(id: string, payload: UpdateUserRequestDto): Promise<User> {
    return this.prisma.user.update({
      data: {
        ...(payload.email !== undefined ? { email: payload.email } : {}),
      },
      where: { id },
    });
  }
}
