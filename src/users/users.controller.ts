import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResponseUtil } from '../utils/response.util';
import { SUCCESS_MESSAGES } from '../common/constants/app.constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MinRoleGuard } from '../guards/min-role.guard';
import { CanModifyUserGuard } from '../guards/can-modify-user.guard';
import { MinRole } from '../common/decorators/min-role.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin+)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this._usersService.create(createUserDto);
    const { password, refreshToken, ...result } = user;
    return ResponseUtil.success(result, SUCCESS_MESSAGES.CREATED);
  }

  @Get()
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination (Admin+)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(@Query() pagination: PaginationDto) {
    const { data, total } = await this._usersService.findAll(pagination);
    return ResponseUtil.paginated(data, pagination.page || 1, pagination.limit || 10, total);
  }

  @Get(':id')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get user by ID (Users can see themselves, Admins can see anyone)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this._usersService.findOne(id);
    return ResponseUtil.success(user);
  }

  @Patch(':id')
  @Version('1')
  @MinRole(Role.USER)
  @UseGuards(CanModifyUserGuard)
  @ApiOperation({ summary: 'Update user by ID (Users can update themselves, Admins can update lower roles)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify users with higher roles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    const updatedUser = await this._usersService.update(id, updateUserDto, user.role);
    const { password, refreshToken, ...result } = updatedUser;
    return ResponseUtil.success(result, SUCCESS_MESSAGES.UPDATED);
  }

  @Delete(':id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @UseGuards(CanModifyUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID (Admin+ - Cannot delete higher roles)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete users with equal or higher roles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    await this._usersService.remove(id);
  }
}
