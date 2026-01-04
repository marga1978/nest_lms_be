import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

/**
 * ════════════════════════════════════════════════════════════════
 * ENTITY: UserRole - Associazione utenti-ruoli (Many-to-Many)
 * ════════════════════════════════════════════════════════════════
 *
 * Tabella di associazione che permette:
 * - Un utente può avere più ruoli
 * - Un ruolo può essere assegnato a più utenti
 * - Tracciamento di chi ha assegnato il ruolo
 * - Possibilità di ruoli temporanei con scadenza
 */
@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roleId: number;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ nullable: true })
  assignedBy: number; // ID dell'utente che ha assegnato il ruolo

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // Ruolo temporaneo

  // Relazione Many-to-One con User
  @ManyToOne(() => User, user => user.userRoles)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Relazione Many-to-One con Role
  @ManyToOne(() => Role, role => role.userRoles)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  // Relazione Many-to-One con User (chi ha assegnato)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedBy' })
  assigner: User;
}
