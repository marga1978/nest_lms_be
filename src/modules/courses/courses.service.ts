import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseLesson } from '../course-lessons/entities/course-lesson.entity';
import { CreateCourseDto, UpdateCourseDto, CreateCourseWithLessonsDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(CourseLesson)
    private courseLessonsRepository: Repository<CourseLesson>,
    private dataSource: DataSource,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return await this.coursesRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.coursesRepository.find({
      relations: ['enrollments', 'enrollments.user', 'lessons'],
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.user', 'lessons'],
    });

    if (!course) {
      throw new NotFoundException(`Corso con ID ${id} non trovato`);
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return await this.coursesRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
  }

  async createWithLessons(createCourseWithLessonsDto: CreateCourseWithLessonsDto): Promise<Course> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crea il corso
      const course = this.coursesRepository.create(createCourseWithLessonsDto.course);
      const savedCourse = await queryRunner.manager.save(course);

      // 2. Crea le lezioni associate al corso
      const lessons = createCourseWithLessonsDto.lessons.map((lessonDto) => {
        return this.courseLessonsRepository.create({
          ...lessonDto,
          courseId: savedCourse.id,
        });
      });

      await queryRunner.manager.save(lessons);

      // 3. Commit della transazione
      await queryRunner.commitTransaction();

      // 4. Ritorna il corso con le lezioni
      return await this.findOne(savedCourse.id);
    } catch (error) {
      // Rollback in caso di errore
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Rilascia il query runner
      await queryRunner.release();
    }
  }
}
