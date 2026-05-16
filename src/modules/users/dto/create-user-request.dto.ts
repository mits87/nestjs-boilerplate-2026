import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

/**
 * Request payload used to create a user in the sample CRUD module.
 */
export class CreateUserRequestDto {
  @ApiProperty({ description: 'User email', example: 'user@company.com' })
  @Transform(({ value }: { readonly value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  public email!: string;
}
