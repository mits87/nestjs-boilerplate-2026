import { PartialType } from '@nestjs/swagger';

import { CreateUserRequestDto } from './create-user-request.dto';

/**
 * Partial update payload for the sample user module.
 */
export class UpdateUserRequestDto extends PartialType(CreateUserRequestDto) {}
