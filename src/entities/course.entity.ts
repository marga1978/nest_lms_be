import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CourseLesson } from './course-lesson.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50 })
  code: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ type: 'int', default: 30 })
  maxStudents: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => CourseLesson, lesson => lesson.course)
  lessons: CourseLesson[];
}
