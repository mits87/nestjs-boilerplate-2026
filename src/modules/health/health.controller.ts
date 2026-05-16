import { Controller, Get } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { API_V1 } from '../../app.constants';
import { ApiPublicAccess } from '../../decorators';
import { HealthCheckResponseDto } from './dtos';

/**
 * Public readiness-style health controller for local smoke tests and deployment checks.
 */
@ApiTags('Health')
@ApiPublicAccess()
@Controller({ path: 'health', version: API_V1 })
export class HealthController {
  /**
   * Confirms that the API is reachable and serving requests.
   *
   * @returns A health payload with the current application status.
   */
  @Get('/ping')
  @ApiOperation({
    summary: 'API Accessibility Check',
    description: 'Checks whether the API is accessible and functioning correctly.',
  })
  @ApiOkResponse({ description: 'The API is accessible and functioning correctly.', type: HealthCheckResponseDto })
  @ApiInternalServerErrorResponse({ description: 'The API is inaccessible due to an internal server error.' })
  public ping(): HealthCheckResponseDto {
    return { status: 'ok' };
  }
}
