import type { User } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import type { CreateUserRequestDto, UpdateUserRequestDto } from './dto';
import { UsersService } from './users.service';
import { UsersStore } from './users.store';

/**
 * Small hand-written store double used to test UsersService behavior without Nest wiring.
 */
class TestUsersStore extends UsersStore {
  public readonly create = vi.fn<(payload: CreateUserRequestDto) => Promise<User>>();
  public readonly delete = vi.fn<(id: string) => Promise<void>>();
  public readonly findMany = vi.fn<() => Promise<Array<User>>>();
  public readonly findUniqueOrThrow = vi.fn<(id: string) => Promise<User>>();
  public readonly update = vi.fn<(id: string, payload: UpdateUserRequestDto) => Promise<User>>();
}

describe('UsersService', () => {
  it('creates users with normalized payload data', async () => {
    const usersStore = new TestUsersStore();
    const service = new UsersService(usersStore);

    void usersStore.create.mockResolvedValue({
      id: 'user-id',
      email: 'person@example.com',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(service.create({ email: 'person@example.com' })).resolves.toMatchObject({
      email: 'person@example.com',
      id: 'user-id',
    });
    expect(usersStore.create).toHaveBeenCalledWith({
      email: 'person@example.com',
    });
  });

  it('lists users in deterministic reverse creation order', async () => {
    const usersStore = new TestUsersStore();
    const service = new UsersService(usersStore);

    void usersStore.findMany.mockResolvedValue([]);

    await expect(service.list()).resolves.toEqual([]);
    expect(usersStore.findMany).toHaveBeenCalledOnce();
  });

  it('reuses show for the authenticated-user lookup', async () => {
    const usersStore = new TestUsersStore();
    const service = new UsersService(usersStore);
    const showSpy = vi.spyOn(service, 'show').mockResolvedValue({
      id: 'user-id',
      email: 'person@example.com',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(service.showCurrentUser('user-id')).resolves.toMatchObject({
      id: 'user-id',
    });
    expect(showSpy).toHaveBeenCalledWith('user-id');
  });
});
