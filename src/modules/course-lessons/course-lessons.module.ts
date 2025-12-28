import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseLessonsController } from './course-lessons.controller';
import { CourseLessonsService } from './course-lessons.service';
import { CourseLesson } from '../../entities/course-lesson.entity';
import { Course } from '../../entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseLesson, Course])],
  controllers: [CourseLessonsController],
  providers: [CourseLessonsService],
  exports: [CourseLessonsService],
})
export class CourseLessonsModule {}
