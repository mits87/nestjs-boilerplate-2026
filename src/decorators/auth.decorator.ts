import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import type { IUser } from '../modules/auth/auth.types';

/**
 * Extracts the authenticated user from the current HTTP request.
 *
 * @param request - The current HTTP request.
 * @returns The authenticated user payload.
 * @throws When the request does not carry a valid authenticated user.
 */
function getRequestUser(request: Request): IUser {
  const { user } = request;

  if (typeof user === 'object' && user !== null && 'id' in user && typeof user.id === 'string') {
    return { id: user.id };
  }

  throw new UnauthorizedException('Authenticated user is not available on the request.');
}

/**
 * Provides the authenticated user payload to a route handler parameter.
 */
export const Auth = createParamDecorator((_data: unknown, ctx: ExecutionContext): IUser => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return getRequestUser(request);
});
