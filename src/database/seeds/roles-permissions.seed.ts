import { DataSource } from 'typeorm';

/**
 * ════════════════════════════════════════════════════════════════
 * SEED: Ruoli e Permessi iniziali
 * ════════════════════════════════════════════════════════════════
 *
 * Popola il database con:
 * - 7 ruoli base (admin, manager, teacher, content_creator, tutor, student, guest)
 * - Tutti i permessi necessari per il sistema LMS
 * - Associazioni ruoli-permessi
 */
export async function seedRolesAndPermissions(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🌱 Seeding roles and permissions...');

    // ========== INSERIMENTO RUOLI ==========
    await queryRunner.query(`
      INSERT INTO roles (name, description, level) VALUES
      ('admin', 'Amministratore di sistema - accesso completo', 1),
      ('manager', 'Manager - supervisiona corsi e docenti', 2),
      ('teacher', 'Docente - crea e gestisce corsi', 3),
      ('content_creator', 'Creatore di contenuti didattici', 4),
      ('tutor', 'Tutor - assiste gli studenti', 5),
      ('student', 'Studente - fruisce dei corsi', 6),
      ('guest', 'Ospite - accesso limitato in sola lettura', 7);
    `);

    // ========== INSERIMENTO PERMESSI ==========
    await queryRunner.query(`
      INSERT INTO permissions (name, description, category) VALUES
      -- Permessi utenti
      ('manage_users', 'Gestire tutti gli utenti', 'users'),
      ('view_users', 'Visualizzare gli utenti', 'users'),
      ('edit_own_profile', 'Modificare il proprio profilo', 'users'),

      -- Permessi corsi
      ('create_courses', 'Creare nuovi corsi', 'courses'),
      ('edit_all_courses', 'Modificare tutti i corsi', 'courses'),
      ('edit_own_courses', 'Modificare i propri corsi', 'courses'),
      ('delete_courses', 'Eliminare corsi', 'courses'),
      ('view_all_courses', 'Visualizzare tutti i corsi', 'courses'),
      ('enroll_students', 'Iscrivere studenti ai corsi', 'courses'),

      -- Permessi contenuti
      ('create_content', 'Creare contenuti didattici', 'content'),
      ('edit_content', 'Modificare contenuti', 'content'),
      ('delete_content', 'Eliminare contenuti', 'content'),
      ('upload_files', 'Caricare file', 'content'),

      -- Permessi valutazioni
      ('create_assessments', 'Creare quiz e valutazioni', 'assessments'),
      ('grade_students', 'Valutare gli studenti', 'assessments'),
      ('view_own_grades', 'Visualizzare i propri voti', 'assessments'),
      ('view_all_grades', 'Visualizzare tutti i voti', 'assessments'),

      -- Permessi report
      ('view_reports', 'Visualizzare report e statistiche', 'reports'),
      ('export_data', 'Esportare dati', 'reports'),

      -- Permessi sistema
      ('manage_roles', 'Gestire ruoli e permessi', 'system'),
      ('manage_settings', 'Gestire impostazioni di sistema', 'system'),
      ('view_logs', 'Visualizzare log di sistema', 'system');
    `);

    // ========== ASSEGNAZIONE PERMESSI AI RUOLI ==========

    // ADMIN - Tutti i permessi
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'admin'),
        id
      FROM permissions;
    `);

    // MANAGER
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'manager'),
        id
      FROM permissions
      WHERE name IN (
        'view_users', 'view_all_courses', 'enroll_students',
        'view_all_grades', 'view_reports', 'export_data'
      );
    `);

    // TEACHER
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'teacher'),
        id
      FROM permissions
      WHERE name IN (
        'edit_own_profile', 'create_courses', 'edit_own_courses',
        'view_all_courses', 'enroll_students', 'create_content',
        'edit_content', 'upload_files', 'create_assessments',
        'grade_students', 'view_reports'
      );
    `);

    // CONTENT_CREATOR
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'content_creator'),
        id
      FROM permissions
      WHERE name IN (
        'edit_own_profile', 'view_all_courses', 'create_content',
        'edit_content', 'upload_files'
      );
    `);

    // TUTOR
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'tutor'),
        id
      FROM permissions
      WHERE name IN (
        'edit_own_profile', 'view_all_courses', 'view_users',
        'view_all_grades'
      );
    `);

    // STUDENT
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'student'),
        id
      FROM permissions
      WHERE name IN (
        'edit_own_profile', 'view_own_grades'
      );
    `);

    // GUEST
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT
        (SELECT id FROM roles WHERE name = 'guest'),
        id
      FROM permissions
      WHERE name IN (
        'view_all_courses'
      );
    `);

    await queryRunner.commitTransaction();
    console.log('✅ Roles and permissions seeded successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
