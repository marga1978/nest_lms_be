-- Script di inizializzazione del database
CREATE DATABASE IF NOT EXISTS db_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE db_lms;

-- Il resto delle tabelle verrà creato automaticamente da TypeORM con synchronize: true
