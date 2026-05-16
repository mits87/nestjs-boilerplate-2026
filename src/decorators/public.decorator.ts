import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route or controller as publicly accessible without JWT authentication.
 *
 * @returns A Nest metadata decorator for public routes.
 */
export function ApiPublicAccess(): CustomDecorator {
  return SetMetadata(IS_PUBLIC_KEY, true);
}
