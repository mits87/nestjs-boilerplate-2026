import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IUser } from '../auth.types';

/**
 * Passport strategy that validates access tokens and maps them to the app's auth shape.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secretOrKey = configService.getOrThrow<string>('jwt.secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  /**
   * Maps a decoded JWT payload to the authenticated user shape used by the app.
   *
   * @param payload - The decoded JWT payload.
   * @returns The authenticated user payload.
   * @throws When the token payload does not contain a subject claim.
   */
  public validate({ sub }: JwtPayload): IUser {
    if (!sub) {
      throw new UnauthorizedException('JWT payload is missing a subject.');
    }

    return { id: sub };
  }
}
