import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';

/**
 * ════════════════════════════════════════════════════════════════
 * ENTITY: CourseUserRole - Ruoli specifici per corso
 * ════════════════════════════════════════════════════════════════
 *
 * Permette di assegnare ruoli specifici per un corso:
 * - Un utente può essere "teacher" in un corso e "student" in un altro
 * - Gestione granulare dei permessi a livello di corso
 */
@Entity('course_user_roles')
export class CourseUserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  userId: number;

  @Column()
  roleId: number;

  @CreateDateColumn()
  assignedAt: Date;

  // Relazione Many-to-One con Course
  @ManyToOne(() => Course, course => course.courseUserRoles)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  // Relazione Many-to-One con User
  @ManyToOne(() => User, user => user.courseUserRoles)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Relazione Many-to-One con Role
  @ManyToOne(() => Role, role => role.courseUserRoles)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
