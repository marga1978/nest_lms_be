import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { Enrollment } from '../../entities/enrollment.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, User, Course])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
