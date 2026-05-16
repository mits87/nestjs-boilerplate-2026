import { BadRequestException, type ValidationError } from '@nestjs/common';

export class BadRequestValidationException extends BadRequestException {
  public readonly validationErrors: ValidationError[];

  /**
   * Creates a bad-request exception that preserves the original validation errors.
   *
   * @param validationErrors - The original class-validator errors.
   * @param objectOrError - The custom response body or message.
   * @param description - The optional short exception description.
   */
  constructor(validationErrors: ValidationError[], objectOrError?: string | object, description?: string) {
    super(objectOrError, description);
    this.validationErrors = validationErrors;
  }
}
