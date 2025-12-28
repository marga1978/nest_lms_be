import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Enrollment } from './enrollment.entity';

/**
 * ════════════════════════════════════════════════════════════════
 * RELAZIONE 1:1 - User ↔ UserProfile
 * ════════════════════════════════════════════════════════════════
 *
 * USER: Contiene SOLO credenziali e autenticazione
 * - email, username, password, isActive
 *
 * USERPROFILE: Contiene SOLO dati personali
 * - firstName, lastName, dateOfBirth, bio, avatar, phone, ecc.
 *
 * ⚠️ I dati personali (firstName, lastName, dateOfBirth)
 *    NON sono in User, ma in UserProfile per evitare ridondanza!
 * ════════════════════════════════════════════════════════════════
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100 })
  username: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relazione 1:1 con UserProfile
  @OneToOne(() => UserProfile, userProfile => userProfile.user)
  profile: UserProfile;

  // Relazione 1:N con Enrollments (ex Student)
  @OneToMany(() => Enrollment, enrollment => enrollment.user)
  enrollments: Enrollment[];
}
