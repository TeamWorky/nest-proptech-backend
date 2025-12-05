import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AdminUserSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminUserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      // Get admin credentials from environment variables
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'admin';
      const adminFirstName = this.configService.get<string>('ADMIN_FIRST_NAME') || 'Admin';
      const adminLastName = this.configService.get<string>('ADMIN_LAST_NAME') || 'User';
      
      // Check if admin user already exists
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Create default admin user
      const adminUser = this.userRepository.create({
        email: adminEmail,
        password: adminPassword, // Will be hashed by the entity hook
        firstName: adminFirstName,
        lastName: adminLastName,
        role: Role.SUPER_ADMIN,
        isActive: true,
      });

      await this.userRepository.save(adminUser);

      this.logger.warn('========================================');
      this.logger.warn('DEFAULT ADMIN USER CREATED');
      this.logger.warn(`Email: ${adminEmail}`);
      this.logger.warn(`Password: ${adminPassword.replace(/./g, '*')}`); // Hide password in logs
      this.logger.warn('⚠️  IMPORTANT: Change these credentials in production!');
      this.logger.warn('========================================');
    } catch (error) {
      this.logger.error('Error seeding admin user:', error.message);
    }
  }
}
