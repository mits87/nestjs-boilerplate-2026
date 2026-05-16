import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';

import { BadRequestValidationException } from '../exceptions';
import { HTTP_EXCEPTION_NOT_FOUND_STATUS, HTTP_EXCEPTION_SERVER_ERROR_STATUS } from './http-exception.constants';
import type { ErrorResponseItem, ReducedValidationError } from './http-exception.types';
import { LocationType } from './http-exception.types';

/**
 * Converts supported Nest HTTP exceptions into the API's normalized error envelope.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Converts an HTTP exception into the project's standard error response shape.
   *
   * @param exception - The raised HTTP exception.
   * @param host - The active Nest arguments host.
   */
  public catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errors = this.mapValidationErrors(exception);
    const [primaryError] = errors;

    if (!primaryError) {
      throw new Error('Expected at least one normalized error response item.');
    }

    const error = {
      code: primaryError.code,
      errors,
      message: primaryError.message,
      path: request.url,
      response: exception.getResponse(),
      status: exception.getStatus(),
      ...(exception.getStatus() >= HTTP_EXCEPTION_SERVER_ERROR_STATUS ? { stack: exception.stack } : {}),
    };

    if (error.status >= HTTP_EXCEPTION_SERVER_ERROR_STATUS) {
      this.logger.error({ error }, 'Exception during HTTP request occured.');
    } else if (error.status === HTTP_EXCEPTION_NOT_FOUND_STATUS) {
      this.logger.debug(
        {
          error: {
            code: error.code,
            message: error.message,
            status: error.status,
          },
        },
        'Exception during HTTP request occured.',
      );
    } else {
      this.logger.log({ error }, 'Exception during HTTP request occured.');
    }

    response.status(error.status).json({
      code: error.code,
      errors: error.errors,
      message: error.message,
      status: error.status,
    });
  }

  /**
   * Converts a single class-validator error into the public API error format.
   *
   * @param error - The validation error to normalize.
   * @param parentPath - An optional parent property path for nested errors.
   * @returns The normalized validation error payload.
   */
  private formatValidationError(error: ValidationError, parentPath?: string): ReducedValidationError {
    const message = Object.values(
      Object.entries(error.constraints ?? {}).reduce<Record<string, string>>((acc, [key, constraint]) => {
        acc[key] = parentPath ? `${parentPath}.${constraint}` : constraint;
        return acc;
      }, {}),
    ).join(', ');

    return {
      location: parentPath ? `${parentPath}.${error.property}` : error.property,
      locationType: LocationType.REQUEST_BODY,
      message,
    };
  }

  /**
   * Flattens nested class-validator children into a linear list of API errors.
   *
   * @param error - The current validation error node.
   * @param parentPath - An optional parent property path for nested errors.
   * @returns A flat list of normalized validation errors.
   */
  private mapChildrenValidationErrors(error: ValidationError, parentPath?: string): ReducedValidationError[] {
    if (!(error.children && error.children.length)) {
      return [this.formatValidationError(error, parentPath)];
    }

    parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;

    return error.children.flatMap((err: ValidationError) => {
      if (err.children && err.children.length) {
        return this.mapChildrenValidationErrors(err, parentPath);
      }
      return this.formatValidationError(err, parentPath);
    });
  }

  /**
   * Normalizes supported exceptions to the project's public error response format.
   *
   * @param exception - The HTTP exception to normalize.
   * @returns A non-empty list of normalized error items.
   */
  private mapValidationErrors(exception: HttpException): ErrorResponseItem[] {
    if (exception instanceof BadRequestValidationException) {
      return exception.validationErrors
        .flatMap((error) => this.mapChildrenValidationErrors(error))
        .filter((item) => item.message)
        .map((item) => ({
          ...item,
          code: exception.name,
          message: `${exception.message}: ${item.message}`,
        }));
    }

    return [
      {
        code: exception.name,
        message: exception.message,
      },
    ];
  }
}
