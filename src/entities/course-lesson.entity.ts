import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './course.entity';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment'
}

@Entity('course_lessons')
export class CourseLesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  courseId: number;

  @ManyToOne(() => Course, course => course.lessons)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.TEXT
  })
  type: LessonType;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 255, nullable: true })
  videoUrl: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
