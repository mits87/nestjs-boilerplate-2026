import type { User } from '@prisma/client';

import type { UserResponseDto } from './dto';

/**
 * Maps a Prisma user record into the public API response DTO.
 *
 * @param user - Database record returned by Prisma.
 * @returns User response payload exposed by the sample module.
 */
export function mapUserToResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
