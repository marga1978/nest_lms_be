import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UsersModule } from './modules/users/users.module';
import { UserProfilesModule } from './modules/user-profiles/user-profiles.module';
import { CourseLessonsModule } from './modules/course-lessons/course-lessons.module';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { CourseLesson } from './entities/course-lesson.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'students_courses_db',
      entities: [User, Course, Enrollment, UserProfile, CourseLesson],
      synchronize: true, // In produzione usa migrations!
      logging: true,
    }),
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    UserProfilesModule,
    CourseLessonsModule,
  ],
})
export class AppModule {}
