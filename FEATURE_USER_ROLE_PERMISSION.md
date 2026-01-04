# Feature: Sistema di Ruoli e Permessi

Branch: `feature/user_role_permission`

## Panoramica

Implementazione completa di un sistema di gestione ruoli e permessi (RBAC - Role-Based Access Control) per il Learning Management System.

## File Creati

### Entities (src/entities/)
- ✅ `role.entity.ts` - Entità per i ruoli
- ✅ `permission.entity.ts` - Entità per i permessi
- ✅ `user-role.entity.ts` - Associazione utenti-ruoli (Many-to-Many)
- ✅ `course-user-role.entity.ts` - Ruoli specifici per corso

### DTOs (src/dto/)
- ✅ `role.dto.ts` - DTOs per la gestione dei ruoli
  - CreateRoleDto
  - UpdateRoleDto
  - AssignRoleToUserDto
  - AssignCourseRoleDto
- ✅ `permission.dto.ts` - DTOs per la gestione dei permessi
  - CreatePermissionDto
  - UpdatePermissionDto

### Services (src/services/)
- ✅ `role.service.ts` - Logica di business per i ruoli
- ✅ `permission.service.ts` - Logica di business per i permessi

### Controllers (src/controllers/)
- ✅ `role.controller.ts` - API endpoints per i ruoli
- ✅ `permission.controller.ts` - API endpoints per i permessi

### Guards (src/guards/)
- ✅ `permissions.guard.ts` - Guard per verificare permessi
- ✅ `roles.guard.ts` - Guard per verificare ruoli

### Decorators (src/decorators/)
- ✅ `permissions.decorator.ts` - Decorator @Permissions()
- ✅ `roles.decorator.ts` - Decorator @Roles()
- ✅ `current-user.decorator.ts` - Decorator @CurrentUser()

### Module (src/modules/)
- ✅ `auth.module.ts` - Modulo principale per autenticazione e autorizzazione

### Seeds (src/seeds/)
- ✅ `roles-permissions.seed.ts` - Seed per popolare ruoli e permessi
- ✅ `run-seed.ts` - Script eseguibile per il seed

### Documentation
- ✅ `ROLES_PERMISSIONS_GUIDE.md` - Guida completa all'utilizzo
- ✅ `FEATURE_USER_ROLE_PERMISSION.md` - Questo file

## Modifiche ai File Esistenti

### src/entities/user.entity.ts
- Aggiunte relazioni `userRoles` e `courseUserRoles`

### src/entities/course.entity.ts
- Aggiunta relazione `courseUserRoles`

### src/app.module.ts
- Importato `AuthModule`
- Aggiunte nuove entità all'array di TypeORM

### package.json
- Aggiunto script `seed` per eseguire il popolamento del database

## Struttura Database

### Nuove Tabelle

1. **roles**
   - id (PK)
   - name (UNIQUE)
   - description
   - level (gerarchia)
   - createdAt

2. **permissions**
   - id (PK)
   - name (UNIQUE)
   - description
   - category
   - createdAt

3. **role_permissions** (tabella di join)
   - role_id (FK)
   - permission_id (FK)
   - PRIMARY KEY (role_id, permission_id)

4. **user_roles**
   - id (PK)
   - userId (FK)
   - roleId (FK)
   - assignedAt
   - assignedBy (FK)
   - expiresAt (nullable)

5. **course_user_roles**
   - id (PK)
   - courseId (FK)
   - userId (FK)
   - roleId (FK)
   - assignedAt

## Funzionalità Implementate

### Gestione Ruoli
- ✅ CRUD completo per ruoli
- ✅ Assegnazione ruoli agli utenti
- ✅ Ruoli globali e ruoli specifici per corso
- ✅ Ruoli temporanei con scadenza
- ✅ Tracciamento di chi ha assegnato il ruolo

### Gestione Permessi
- ✅ CRUD completo per permessi
- ✅ Categorizzazione dei permessi
- ✅ Associazione permessi ai ruoli
- ✅ Verifica automatica dei permessi

### Sistema di Autorizzazione
- ✅ Guards per proteggere gli endpoints
- ✅ Decorators per specificare permessi/ruoli richiesti
- ✅ Supporto per permessi multipli
- ✅ Permessi a livello globale e per corso

### Seed Iniziale
- ✅ 7 ruoli predefiniti (admin, manager, teacher, content_creator, tutor, student, guest)
- ✅ 22 permessi categorizzati
- ✅ Associazioni ruoli-permessi preconfigurate

## Come Usare

### 1. Setup Iniziale

```bash
# Assicurati di essere nel branch corretto
git checkout feature/user_role_permission

# Installa le dipendenze (se necessario)
cd BE
npm install

# Avvia il server (creerà automaticamente le tabelle)
npm run start:dev

# In un altro terminale, esegui il seed
npm run seed
```

### 2. Testare le API

```bash
# Ottieni tutti i ruoli
curl http://localhost:3000/roles

# Ottieni tutti i permessi
curl http://localhost:3000/permissions

# Assegna un ruolo a un utente
curl -X POST http://localhost:3000/roles/assign \
  -H "Content-Type: application/json" \
  -d '{"roleId": 6, "userId": 1}'
```

### 3. Proteggere un Endpoint

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';

@Controller('courses')
export class CoursesController {

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('create_courses')
  async createCourse() {
    // Solo utenti con 'create_courses' possono accedere
  }
}
```

## Ruoli Predefiniti

| Ruolo | Level | Permessi Principali |
|-------|-------|---------------------|
| admin | 1 | Tutti i permessi |
| manager | 2 | Supervisione corsi e utenti, report |
| teacher | 3 | Creazione corsi, gestione contenuti, valutazione |
| content_creator | 4 | Creazione e modifica contenuti |
| tutor | 5 | Visualizzazione corsi e voti |
| student | 6 | Visualizzazione propri voti |
| guest | 7 | Sola visualizzazione corsi |

## API Endpoints Principali

### Ruoli
- `GET /roles` - Lista tutti i ruoli
- `POST /roles` - Crea nuovo ruolo
- `GET /roles/:id` - Dettagli ruolo
- `PUT /roles/:id` - Aggiorna ruolo
- `DELETE /roles/:id` - Elimina ruolo
- `POST /roles/assign` - Assegna ruolo a utente
- `GET /roles/user/:userId` - Ruoli di un utente
- `GET /roles/user/:userId/permissions` - Permessi di un utente

### Permessi
- `GET /permissions` - Lista tutti i permessi
- `POST /permissions` - Crea nuovo permesso
- `GET /permissions/:id` - Dettagli permesso
- `GET /permissions/category/:category` - Permessi per categoria
- `PUT /permissions/:id` - Aggiorna permesso
- `DELETE /permissions/:id` - Elimina permesso

### Ruoli per Corso
- `POST /roles/course/assign` - Assegna ruolo per un corso
- `GET /roles/course/:courseId/user/:userId` - Ruoli utente in un corso
- `DELETE /roles/course/:courseId/user/:userId/role/:roleId` - Rimuovi ruolo da corso

## Testing

### Verifica Creazione Tabelle

```bash
# Connettiti al database MySQL
mysql -u root -p

# Usa il database
USE students_courses_db;

# Verifica le tabelle
SHOW TABLES;

# Dovrai vedere:
# - roles
# - permissions
# - role_permissions
# - user_roles
# - course_user_roles
```

### Verifica Seed

```bash
# Dopo aver eseguito npm run seed
# Verifica i dati

# Ruoli
SELECT * FROM roles;

# Permessi
SELECT * FROM permissions;

# Associazioni
SELECT r.name, p.name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
ORDER BY r.level, p.category;
```

## Prossimi Passi

### Integrazioni Necessarie

1. **Sistema di Autenticazione**
   - Implementare JWT o sessioni
   - Middleware per popolare `request.user`

2. **Middleware di Autenticazione**
   - Guard per verificare che l'utente sia autenticato
   - Combinare con PermissionsGuard e RolesGuard

3. **Logging e Audit**
   - Tracciare tutte le modifiche ai ruoli
   - Log delle verifiche di permessi fallite

4. **Gestione Ruoli Scaduti**
   - Cron job per rimuovere ruoli scaduti
   - Notifiche prima della scadenza

### Miglioramenti Futuri

- [ ] Cache dei permessi per migliorare le performance
- [ ] API per visualizzare la matrice ruoli-permessi
- [ ] Dashboard amministrativa per la gestione
- [ ] Export/Import configurazioni ruoli
- [ ] Permessi dinamici basati su risorse specifiche

## Note Importanti

⚠️ **IMPORTANTE**: Questo sistema richiede un middleware di autenticazione che imposti `request.user` con almeno il campo `id`. Senza questo, i Guards non funzioneranno correttamente.

⚠️ **PRODUZIONE**: Ricordati di:
- Disabilitare `synchronize: true` in TypeORM
- Usare migrations invece di synchronize
- Implementare rate limiting sugli endpoints di gestione ruoli
- Aggiungere logging completo
- Validare tutte le operazioni critiche

## Documentazione Completa

Per la guida completa all'utilizzo, esempi dettagliati e best practices, consulta:
📚 [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md)

## Contatti e Supporto

Per domande o problemi con questa feature, contatta il team di sviluppo.

---

**Status**: ✅ Implementazione Completa
**Data**: 2026-01-03
**Branch**: feature/user_role_permission
