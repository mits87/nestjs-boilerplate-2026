import { ApiProperty } from '@nestjs/swagger';

/**
 * Minimal health payload returned by the public health endpoint.
 */
export class HealthCheckResponseDto {
  @ApiProperty({ description: 'Application status.', example: 'ok' })
  public status!: string;
}
