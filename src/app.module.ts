import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UsersModule } from './modules/users/users.module';
import { UserProfilesModule } from './modules/user-profiles/user-profiles.module';
import { CourseLessonsModule } from './modules/course-lessons/course-lessons.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { AuthModule } from './modules/auth/auth.module';
import configs from './config';

@Module({
  imports: [
    // Config Module - carica tutte le configurazioni
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: configs,
    }),
    // MySQL Database (TypeORM) - usa configurazione centralizzata
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    }),
    // MongoDB Database (Mongoose) - usa configurazione centralizzata
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('mongodb'),
    }),
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
