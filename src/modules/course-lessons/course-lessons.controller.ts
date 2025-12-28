import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CourseLessonsService } from './course-lessons.service';
import { CreateCourseLessonDto, UpdateCourseLessonDto } from '../../dto/course-lesson.dto';

@Controller('course-lessons')
export class CourseLessonsController {
  constructor(private readonly courseLessonsService: CourseLessonsService) {}

  @Post()
  create(@Body() createCourseLessonDto: CreateCourseLessonDto) {
    return this.courseLessonsService.create(createCourseLessonDto);
  }

  @Get()
  findAll() {
    return this.courseLessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseLessonsService.findOne(id);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseLessonsService.findByCourse(courseId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseLessonDto: UpdateCourseLessonDto,
  ) {
    return this.courseLessonsService.update(id, updateCourseLessonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseLessonsService.remove(id);
  }
}
