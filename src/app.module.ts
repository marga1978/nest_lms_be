import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UsersModule } from './modules/users/users.module';
import { UserProfilesModule } from './modules/user-profiles/user-profiles.module';
import { CourseLessonsModule } from './modules/course-lessons/course-lessons.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { AuthModule } from './modules/auth/auth.module';
import { Course } from './modules/courses/entities/course.entity';
import { Enrollment } from './modules/enrollments/entities/enrollment.entity';
import { User } from './modules/users/entities/user.entity';
import { UserProfile } from './modules/user-profiles/entities/user-profile.entity';
import { CourseLesson } from './modules/course-lessons/entities/course-lesson.entity';
import { Role } from './modules/auth/entities/role.entity';
import { Permission } from './modules/auth/entities/permission.entity';
import { UserRole } from './modules/auth/entities/user-role.entity';
import { CourseUserRole } from './modules/auth/entities/course-user-role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // MySQL Database (TypeORM)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'students_courses_db',
      entities: [User, Course, Enrollment, UserProfile, CourseLesson, Role, Permission, UserRole, CourseUserRole],
      synchronize: true, // In produzione usa migrations!
      logging: true,
    }),
    // MongoDB Database (Mongoose)
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/db_lms'),
    // Feature Modules
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    UserProfilesModule,
    CourseLessonsModule,
    UserPreferencesModule,
    AuthModule,
  ],
})
export class AppModule {}
