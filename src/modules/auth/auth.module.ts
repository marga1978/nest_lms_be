import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { CourseUserRole } from './entities/course-user-role.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      UserRole,
      CourseUserRole,
      User,
      Course,
    ]),
  ],
  controllers: [RoleController, PermissionController],
  providers: [RoleService, PermissionService, PermissionsGuard, RolesGuard],
  exports: [RoleService, PermissionService, PermissionsGuard, RolesGuard],
})
export class AuthModule {}
