import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from '../../dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
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
}
