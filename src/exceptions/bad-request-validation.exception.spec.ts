import type { ValidationError } from '@nestjs/common';

import { BadRequestValidationException } from './bad-request-validation.exception';

describe('BadRequestValidationException', () => {
  it('should use BadRequestValidationException', () => {
    const validationErrors: ValidationError[] = [{ property: 'email', value: 'data' }];

    const exception = new BadRequestValidationException(validationErrors, 'Validation failed');

    expect(exception.validationErrors).toEqual(validationErrors);
  });
});
