import { ArgumentsHost, Catch, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import { HttpExceptionFilter } from '../../../filters';

/**
 * Normalizes Prisma client exceptions into stable HTTP responses for the public API surface.
 */
@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter {
  private readonly httpExceptionFilter = new HttpExceptionFilter();

  /**
   * Translates supported Prisma error codes into HTTP exceptions.
   *
   * @param exception - Prisma error thrown by the client.
   * @param host - Arguments host for the current request.
   */
  public catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    switch (exception.code) {
      case 'P2002':
        this.httpExceptionFilter.catch(new ConflictException('Row already exists'), host);
        break;
      case 'P2025':
        this.httpExceptionFilter.catch(new NotFoundException('Record not found'), host);
        break;
      default:
        throw exception;
        break;
    }
  }
}
