import { DataSource } from 'typeorm';
import { seedRolesAndPermissions } from './roles-permissions.seed';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

/**
 * Script per eseguire il seed del database
 * Uso: npm run seed
 */
async function runSeed() {
  // Configurazione DataSource
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db',
    synchronize: false,
  });

  try {
    console.log('📦 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected!');

    // Esegui il seed dei ruoli e permessi
    await seedRolesAndPermissions(dataSource);

    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('💥 Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

// Esegui il seed
runSeed();
