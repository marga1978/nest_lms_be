import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserProfile } from '../modules/user-profiles/entities/user-profile.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { CourseLesson } from '../modules/course-lessons/entities/course-lesson.entity';
import { Enrollment } from '../modules/enrollments/entities/enrollment.entity';
import { Role } from '../modules/auth/entities/role.entity';
import { Permission } from '../modules/auth/entities/permission.entity';
import { UserRole } from '../modules/auth/entities/user-role.entity';
import { CourseUserRole } from '../modules/auth/entities/course-user-role.entity';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3307,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'db_lms',
  entities: [
    User,
    UserProfile,
    Course,
    CourseLesson,
    Enrollment,
    Role,
    Permission,
    UserRole,
    CourseUserRole,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
}));
