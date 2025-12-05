import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AlreadyExistsException, NotFoundException } from '../common/exceptions/business.exception';
import { Role, RoleHierarchy } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this._userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new AlreadyExistsException('Email');
    }

    const user = this._userRepository.create(createUserDto);
    return await this._userRepository.save(user);
  }

  async findAll(pagination: PaginationDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;

    const [data, total] = await this._userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });

    return { data, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this._userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this._userRepository.findOne({ where: { email } });
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
    await this._userRepository.softRemove(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this._userRepository.update(userId, { 
      refreshToken: refreshToken ?? undefined 
    });
  }
}
