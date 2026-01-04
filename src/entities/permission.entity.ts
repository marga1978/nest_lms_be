import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from 'typeorm';
import { Role } from './role.entity';

/**
 * ════════════════════════════════════════════════════════════════
 * ENTITY: Permission - Permessi del sistema
 * ════════════════════════════════════════════════════════════════
 *
 * Categorie di permessi:
 * - users: Gestione utenti
 * - courses: Gestione corsi
 * - content: Gestione contenuti didattici
 * - assessments: Quiz e valutazioni
 * - reports: Report e statistiche
 * - system: Impostazioni di sistema
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  category: string; // Es: 'courses', 'users', 'content', 'reports'

  @CreateDateColumn()
  createdAt: Date;

  // Relazione Many-to-Many con Role
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
