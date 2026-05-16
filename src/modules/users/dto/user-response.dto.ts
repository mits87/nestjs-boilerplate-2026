import { ApiProperty } from '@nestjs/swagger';

/**
 * Public user representation returned by the sample CRUD module.
 */
export class UserResponseDto {
  @ApiProperty({ description: 'User identifier.', format: 'uuid' })
  public id!: string;

  @ApiProperty({ description: 'Normalized email address.', example: 'user@company.com' })
  public email!: string;

  @ApiProperty({ description: 'Creation timestamp.', format: 'date-time' })
  public createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp.', format: 'date-time' })
  public updatedAt!: Date;
}
