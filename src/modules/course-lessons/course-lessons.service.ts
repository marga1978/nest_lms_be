import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseLesson } from './entities/course-lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateCourseLessonDto, UpdateCourseLessonDto } from './dto/course-lesson.dto';

@Injectable()
export class CourseLessonsService {
  constructor(
    @InjectRepository(CourseLesson)
    private courseLessonsRepository: Repository<CourseLesson>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(createCourseLessonDto: CreateCourseLessonDto): Promise<CourseLesson> {
    // Verifica che il corso esista
    const course = await this.coursesRepository.findOne({
      where: { id: createCourseLessonDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Corso con ID ${createCourseLessonDto.courseId} non trovato`,
      );
    }

    if (!course.isActive) {
      throw new BadRequestException(
        `Il corso con ID ${createCourseLessonDto.courseId} non è attivo`,
      );
    }

    const lesson = this.courseLessonsRepository.create(createCourseLessonDto);
    return await this.courseLessonsRepository.save(lesson);
  }

  async findAll(): Promise<CourseLesson[]> {
    return await this.courseLessonsRepository.find({
      relations: ['course'],
      order: { courseId: 'ASC', orderIndex: 'ASC' },
    });
  }

  async findOne(id: number): Promise<CourseLesson> {
    const lesson = await this.courseLessonsRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lezione con ID ${id} non trovata`);
    }

    return lesson;
  }

  async findByCourse(courseId: number): Promise<CourseLesson[]> {
    // Verifica che il corso esista
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Corso con ID ${courseId} non trovato`);
    }

    return await this.courseLessonsRepository.find({
      where: { courseId },
      relations: ['course'],
      order: { orderIndex: 'ASC' },
    });
  }

  async update(id: number, updateCourseLessonDto: UpdateCourseLessonDto): Promise<CourseLesson> {
    const lesson = await this.findOne(id);
    Object.assign(lesson, updateCourseLessonDto);
    return await this.courseLessonsRepository.save(lesson);
  }

  async remove(id: number): Promise<void> {
    const lesson = await this.findOne(id);
    await this.courseLessonsRepository.remove(lesson);
  }
}
