import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from '../../entities/course.entity';
import { CourseLesson } from '../../entities/course-lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseLesson])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
