import { Injectable } from '@nestjs/common';

import { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from './dto';
import { mapUserToResponse } from './users.mapper';
import { UsersStore } from './users.store';

/**
 * Implements the sample Prisma-backed user CRUD module.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersStore: UsersStore) {}

  /**
   * Creates a new user.
   *
   * @param payload - The validated create-user payload.
   * @returns Created user record.
   */
  public async create(payload: CreateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.usersStore.create(payload);

    return mapUserToResponse(user);
  }

  /**
   * Lists users in reverse creation order for deterministic API responses.
   *
   * @returns Every persisted user.
   */
  public async list(): Promise<Array<UserResponseDto>> {
    const users = await this.usersStore.findMany();

    return users.map(mapUserToResponse);
  }

  /**
   * Deletes a user by identifier.
   *
   * @param id - The identifier of the user to delete.
   * @returns Resolves once the row has been removed.
   */
  public async remove(id: string): Promise<void> {
    await this.usersStore.delete(id);
  }

  /**
   * Returns a single user by identifier.
   *
   * @param id - The identifier of the requested user.
   * @returns Matching user record.
   */
  public async show(id: string): Promise<UserResponseDto> {
    const user = await this.usersStore.findUniqueOrThrow(id);

    return mapUserToResponse(user);
  }

  /**
   * Returns the authenticated user identified by the JWT subject claim.
   *
   * @param userId - Authenticated user identifier from the JWT subject claim.
   * @returns Matching user record.
   */
  public showCurrentUser(userId: string): Promise<UserResponseDto> {
    return this.show(userId);
  }

  /**
   * Updates a user by identifier.
   *
   * @param id - The identifier of the user to update.
   * @param payload - The validated update payload.
   * @returns Updated user record.
   */
  public async update(id: string, payload: UpdateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.usersStore.update(id, payload);

    return mapUserToResponse(user);
  }
}
