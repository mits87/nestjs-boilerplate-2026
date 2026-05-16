import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { API_V1 } from '../../app.constants';
import { ApiDefaultErrorsResponse, Auth } from '../../decorators';
import { IUser } from '../auth/auth.types';
import { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';

/**
 * Sample protected CRUD controller backed by Prisma.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: API_V1 })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a user using the supplied request payload.
   *
   * @param payload - The validated create-user payload.
   * @returns Created user record.
   */
  @Post('/')
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ description: 'New user payload.', type: CreateUserRequestDto })
  @ApiCreatedResponse({ description: 'Created user record.', type: UserResponseDto })
  @ApiDefaultErrorsResponse()
  public create(@Body() payload: CreateUserRequestDto): Promise<UserResponseDto> {
    return this.usersService.create(payload);
  }

  /**
   * Returns the authenticated user record.
   *
   * @param auth - Authenticated user extracted from the JWT subject claim.
   * @returns User record matching the caller's subject id.
   */
  @Get('/me')
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiOkResponse({ description: 'Authenticated user record.', type: UserResponseDto })
  @ApiDefaultErrorsResponse()
  public getCurrentUser(@Auth() auth: IUser): Promise<UserResponseDto> {
    return this.usersService.showCurrentUser(auth.id);
  }

  /**
   * Returns the list of users visible to the caller.
   *
   * @returns Persisted users ordered by most recent first.
   */
  @Get('/')
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'List of users.', type: UserResponseDto, isArray: true })
  @ApiDefaultErrorsResponse()
  public list(): Promise<Array<UserResponseDto>> {
    return this.usersService.list();
  }

  /**
   * Deletes a user by identifier.
   *
   * @param id - UUID of the user to delete.
   * @returns Resolves once the row has been removed.
   */
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiNoContentResponse({ description: 'User deleted.' })
  @ApiDefaultErrorsResponse()
  public remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  /**
   * Returns a single user by identifier.
   *
   * @param id - UUID of the requested user.
   * @returns Matching user record.
   */
  @Get('/:id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ description: 'User record.', type: UserResponseDto })
  @ApiDefaultErrorsResponse()
  public show(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<UserResponseDto> {
    return this.usersService.show(id);
  }

  /**
   * Updates a user by identifier.
   *
   * @param id - UUID of the user to update.
   * @param payload - The validated update payload.
   * @returns Updated user record.
   */
  @Patch('/:id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ description: 'Update user payload.', type: UpdateUserRequestDto })
  @ApiOkResponse({ description: 'Updated user record.', type: UserResponseDto })
  @ApiDefaultErrorsResponse()
  public update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() payload: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, payload);
  }
}
