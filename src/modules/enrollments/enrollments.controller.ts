import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../../dto/enrollment.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Post('bulk')
  enrollUserInMultipleCourses(
    @Body() body: { userId: number; courseIds: number[] },
  ) {
    return this.enrollmentsService.enrollUserInMultipleCourses(
      body.userId,
      body.courseIds,
    );
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
  ) {
    if (userId) {
      return this.enrollmentsService.findByUser(parseInt(userId));
    }
    if (courseId) {
      return this.enrollmentsService.findByCourse(parseInt(courseId));
    }
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
