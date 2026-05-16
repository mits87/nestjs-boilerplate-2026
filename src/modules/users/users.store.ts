import type { User } from '@prisma/client';

import type { CreateUserRequestDto, UpdateUserRequestDto } from './dto';

/**
 * Persistence contract used by the sample users service.
 */
export abstract class UsersStore {
  /**
   * Persists a new user row.
   *
   * @param payload - Validated create payload.
   * @returns Created user record.
   */
  public abstract create(payload: CreateUserRequestDto): Promise<User>;

  /**
   * Deletes a user by identifier.
   *
   * @param id - User identifier.
   * @returns Resolves once the row has been removed.
   */
  public abstract delete(id: string): Promise<void>;

  /**
   * Returns every user in deterministic reverse creation order.
   *
   * @returns Persisted user rows.
   */
  public abstract findMany(): Promise<Array<User>>;

  /**
   * Returns a single user row or throws when it does not exist.
   *
   * @param id - User identifier.
   * @returns Matching user record.
   */
  public abstract findUniqueOrThrow(id: string): Promise<User>;

  /**
   * Updates a user by identifier.
   *
   * @param id - User identifier.
   * @param payload - Validated update payload.
   * @returns Updated user record.
   */
  public abstract update(id: string, payload: UpdateUserRequestDto): Promise<User>;
}
