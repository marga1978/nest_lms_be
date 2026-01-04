import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { UserRole } from './user-role.entity';
import { CourseUserRole } from './course-user-role.entity';

/**
 * ════════════════════════════════════════════════════════════════
 * ENTITY: Role - Ruoli del sistema LMS
 * ════════════════════════════════════════════════════════════════
 *
 * Ruoli principali:
 * - admin: Amministratore di sistema (accesso completo)
 * - manager: Manager/Coordinatore (supervisiona corsi e docenti)
 * - teacher: Docente (crea e gestisce corsi)
 * - content_creator: Creatore di contenuti didattici
 * - tutor: Tutor/Assistente (supporta gli studenti)
 * - student: Studente (fruisce dei corsi)
 * - guest: Ospite (accesso limitato in sola lettura)
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  level: number; // Livello gerarchico (1=massimo)

  @CreateDateColumn()
  createdAt: Date;

  // Relazione Many-to-Many con Permission
  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  // Relazione One-to-Many con UserRole
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  // Relazione One-to-Many con CourseUserRole
  @OneToMany(() => CourseUserRole, courseUserRole => courseUserRole.role)
  courseUserRoles: CourseUserRole[];
}
