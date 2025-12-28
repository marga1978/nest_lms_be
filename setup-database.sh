#!/bin/bash

# Script per inizializzare il database

echo "🚀 Inizializzazione del database..."

# Crea il database
docker exec -i nestjs-students-mysql mysql -uroot -ppassword <<EOF
CREATE DATABASE IF NOT EXISTS students_courses_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EOF

echo "✅ Database creato con successo!"
echo "📝 Ora puoi avviare l'applicazione con: npm run start:dev"
