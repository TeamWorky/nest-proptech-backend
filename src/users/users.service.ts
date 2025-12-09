import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AlreadyExistsException, NotFoundException } from '../common/exceptions/business.exception';
import { Role, RoleHierarchy } from '../common/enums/role.enum';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await SoftDeleteRepositoryHelper.findOneBy(
      this._userRepository,
      { email: createUserDto.email },
      { includeDeleted: true },
    );

    if (existingUser && !SoftDeleteRepositoryHelper.isDeleted(existingUser)) {
      throw new AlreadyExistsException('Email');
    }

    // If user exists but is deleted, restore it instead of creating new
    if (existingUser && SoftDeleteRepositoryHelper.isDeleted(existingUser)) {
      this.logger.warn(
        `Attempting to create user with deleted email: ${createUserDto.email}. Restoring instead.`,
        UsersService.name,
        { email: createUserDto.email },
      );
      const restoredUser = await SoftDeleteRepositoryHelper.restoreEntity(
        this._userRepository,
        existingUser,
      );
      Object.assign(restoredUser, createUserDto);
      return await this._userRepository.save(restoredUser);
    }

    const user = this._userRepository.create(createUserDto);
    return await this._userRepository.save(user);
  }

  async findAll(pagination: PaginationDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10, includeDeleted = false } = pagination;

    const [data, total] = await SoftDeleteRepositoryHelper.findAll(
      this._userRepository,
      {
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
        includeDeleted,
      },
    );

    return { data, total };
  }

  async findOne(id: string, includeDeleted = false): Promise<User> {
    const user = await SoftDeleteRepositoryHelper.findOneById(
      this._userRepository,
      id,
      {
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
        includeDeleted,
      },
    );

    if (!user) {
      throw new NotFoundException('User');
    }

    return user;
  }

  async findByEmail(email: string, includeDeleted = false): Promise<User | null> {
    return await SoftDeleteRepositoryHelper.findOneBy(
      this._userRepository,
      { email },
      { includeDeleted },
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserRole?: Role): Promise<User> {
    const user = await this.findOne(id);

    // Prevent role escalation - users cannot assign themselves higher roles
    if (updateUserDto.role && currentUserRole) {
      const currentRoleLevel = RoleHierarchy[currentUserRole];
      const newRoleLevel = RoleHierarchy[updateUserDto.role];

      // Only SUPER_ADMIN can assign SUPER_ADMIN role
      if (updateUserDto.role === Role.SUPER_ADMIN && currentUserRole !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can assign SUPER_ADMIN role');
      }

      // Cannot assign a role higher than your own
      if (newRoleLevel >= currentRoleLevel && currentUserRole !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('You cannot assign a role equal to or higher than your own');
      }
    }

    Object.assign(user, updateUserDto);
    return await this._userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await SoftDeleteRepositoryHelper.softDeleteEntity(this._userRepository, user);
    this.logger.log(`User soft deleted: ${id}`, UsersService.name, { userId: id });
  }

  /**
   * Restore a soft deleted user
   */
  async restore(id: string): Promise<User> {
    const user = await this.findOne(id, true);

    if (!SoftDeleteRepositoryHelper.isDeleted(user)) {
      throw new NotFoundException('User is not deleted');
    }

    const restoredUser = await SoftDeleteRepositoryHelper.restoreEntity(
      this._userRepository,
      user,
    );

    this.logger.log(`User restored: ${id}`, UsersService.name, { userId: id });

    return restoredUser;
  }

  /**
   * Permanently delete a user (hard delete)
   */
  async hardDelete(id: string): Promise<void> {
    const user = await this.findOne(id, true);
    await SoftDeleteRepositoryHelper.hardDeleteEntity(this._userRepository, user);
    this.logger.warn(`User permanently deleted: ${id}`, UsersService.name, { userId: id });
  }

  /**
   * Find only soft deleted users
   */
  async findDeleted(pagination: PaginationDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;

    // Get all deleted users first to get accurate count
    const allDeleted = await SoftDeleteRepositoryHelper.findDeleted(
      this._userRepository,
      {
        order: { deletedAt: 'DESC' },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
      },
    );

    const total = allDeleted.length;
    const paginatedDeleted = allDeleted.slice((page - 1) * limit, page * limit);

    return { data: paginatedDeleted, total };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this._userRepository.update(userId, { 
      refreshToken: refreshToken ?? undefined 
    });
  }
}
