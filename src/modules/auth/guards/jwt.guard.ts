import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../../../decorators/public.decorator';

/**
 * Global JWT guard that also honors the public-route metadata decorator.
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Allows public routes to bypass JWT auth and supports query-based access tokens.
   *
   * @param context - The current execution context.
   * @returns The guard result from the public-route check or Passport guard.
   */
  public override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request && typeof request.query['accessToken'] === 'string') {
      request.headers['authorization'] = `Bearer ${request.query['accessToken']}`;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
