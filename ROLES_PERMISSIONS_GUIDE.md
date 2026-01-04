# Guida al Sistema di Ruoli e Permessi

Sistema completo di gestione ruoli e permessi per l'LMS (Learning Management System).

## Struttura del Database

### Tabelle Principali

1. **roles** - Ruoli del sistema
2. **permissions** - Permessi disponibili
3. **role_permissions** - Associazione Many-to-Many tra ruoli e permessi
4. **user_roles** - Assegnazione ruoli agli utenti
5. **course_user_roles** - Ruoli specifici per corso

## Ruoli Predefiniti

| Ruolo | Livello | Descrizione |
|-------|---------|-------------|
| **admin** | 1 | Amministratore di sistema - accesso completo |
| **manager** | 2 | Manager - supervisiona corsi e docenti |
| **teacher** | 3 | Docente - crea e gestisce corsi |
| **content_creator** | 4 | Creatore di contenuti didattici |
| **tutor** | 5 | Tutor - assiste gli studenti |
| **student** | 6 | Studente - fruisce dei corsi |
| **guest** | 7 | Ospite - accesso limitato in sola lettura |

## Categorie di Permessi

### Users
- `manage_users` - Gestire tutti gli utenti
- `view_users` - Visualizzare gli utenti
- `edit_own_profile` - Modificare il proprio profilo

### Courses
- `create_courses` - Creare nuovi corsi
- `edit_all_courses` - Modificare tutti i corsi
- `edit_own_courses` - Modificare i propri corsi
- `delete_courses` - Eliminare corsi
- `view_all_courses` - Visualizzare tutti i corsi
- `enroll_students` - Iscrivere studenti ai corsi

### Content
- `create_content` - Creare contenuti didattici
- `edit_content` - Modificare contenuti
- `delete_content` - Eliminare contenuti
- `upload_files` - Caricare file

### Assessments
- `create_assessments` - Creare quiz e valutazioni
- `grade_students` - Valutare gli studenti
- `view_own_grades` - Visualizzare i propri voti
- `view_all_grades` - Visualizzare tutti i voti

### Reports
- `view_reports` - Visualizzare report e statistiche
- `export_data` - Esportare dati

### System
- `manage_roles` - Gestire ruoli e permessi
- `manage_settings` - Gestire impostazioni di sistema
- `view_logs` - Visualizzare log di sistema

## Setup Iniziale

### 1. Installare le dipendenze

Il progetto include già ts-node come dipendenza di sviluppo. Se non presente, installarlo:

```bash
npm install --save-dev ts-node
```

### 2. Avviare il server

```bash
npm run start:dev
```

### 3. Popolare il database (Seed)

Eseguire il seed per creare ruoli e permessi iniziali:

```bash
npm run seed
```

Questo creerà:
- 7 ruoli predefiniti
- 22 permessi categorizzati
- Associazioni ruoli-permessi

## Utilizzo nei Controller

### Esempio 1: Proteggere un endpoint con permessi

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
    // Solo utenti con il permesso 'create_courses' possono accedere
  }
}
```

### Esempio 2: Proteggere con ruoli

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

@Controller('admin')
export class AdminController {

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async getDashboard() {
    // Solo admin e manager possono accedere
  }
}
```

### Esempio 3: Ottenere l'utente corrente

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('profile')
export class ProfileController {

  @Get()
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

### Esempio 4: Permessi multipli

```typescript
@Post('advanced-operation')
@UseGuards(PermissionsGuard)
@Permissions('create_content', 'upload_files', 'edit_content')
async advancedOperation() {
  // L'utente deve avere TUTTI i permessi specificati
}
```

## API Endpoints

### Ruoli

#### GET /roles
Ottieni tutti i ruoli

#### GET /roles/:id
Ottieni un ruolo per ID

#### GET /roles/name/:name
Ottieni un ruolo per nome

#### POST /roles
Crea un nuovo ruolo
```json
{
  "name": "instructor",
  "description": "Istruttore specializzato",
  "level": 4,
  "permissionIds": [1, 2, 3]
}
```

#### PUT /roles/:id
Aggiorna un ruolo

#### DELETE /roles/:id
Elimina un ruolo

### Assegnazione Ruoli

#### POST /roles/assign
Assegna un ruolo a un utente
```json
{
  "roleId": 3,
  "userId": 5,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### DELETE /roles/user/:userId/role/:roleId
Rimuovi un ruolo da un utente

#### GET /roles/user/:userId
Ottieni tutti i ruoli di un utente

#### GET /roles/user/:userId/permissions
Ottieni tutti i permessi di un utente

### Ruoli per Corso

#### POST /roles/course/assign
Assegna un ruolo a un utente per un corso specifico
```json
{
  "courseId": 1,
  "userId": 5,
  "roleId": 3
}
```

#### DELETE /roles/course/:courseId/user/:userId/role/:roleId
Rimuovi un ruolo di un utente da un corso

#### GET /roles/course/:courseId/user/:userId
Ottieni i ruoli di un utente in un corso

#### GET /roles/course/:courseId/user/:userId/permissions
Ottieni i permessi di un utente in un corso

### Permessi

#### GET /permissions
Ottieni tutti i permessi

#### GET /permissions/category/:category
Ottieni permessi per categoria (users, courses, content, assessments, reports, system)

#### GET /permissions/:id
Ottieni un permesso per ID

#### GET /permissions/name/:name
Ottieni un permesso per nome

#### POST /permissions
Crea un nuovo permesso
```json
{
  "name": "approve_courses",
  "description": "Approvare nuovi corsi",
  "category": "courses"
}
```

#### PUT /permissions/:id
Aggiorna un permesso

#### DELETE /permissions/:id
Elimina un permesso

## Esempi di Utilizzo

### 1. Assegnare il ruolo "student" a un nuovo utente

```bash
curl -X POST http://localhost:3000/roles/assign \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 6,
    "userId": 10
  }'
```

### 2. Assegnare "teacher" a un utente per un corso specifico

```bash
curl -X POST http://localhost:3000/roles/course/assign \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 5,
    "userId": 3,
    "roleId": 3
  }'
```

### 3. Verificare i permessi di un utente

```bash
curl http://localhost:3000/roles/user/10/permissions
```

### 4. Creare un nuovo ruolo personalizzato

```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "course_reviewer",
    "description": "Revisore dei corsi",
    "level": 4,
    "permissionIds": [8, 18, 19]
  }'
```

## Utilizzo Programmatico nel Codice

### Verificare se un utente ha un permesso

```typescript
import { RoleService } from '../services/role.service';

@Injectable()
export class MyService {
  constructor(private roleService: RoleService) {}

  async checkPermission(userId: number) {
    const hasPermission = await this.roleService.userHasPermission(
      userId,
      'create_courses'
    );

    if (hasPermission) {
      // L'utente può creare corsi
    }
  }
}
```

### Verificare permessi a livello di corso

```typescript
async checkCoursePermission(userId: number, courseId: number) {
  const hasPermission = await this.roleService.userHasPermission(
    userId,
    'edit_content',
    courseId  // Controlla i permessi specifici per questo corso
  );
}
```

### Ottenere tutti i ruoli di un utente

```typescript
async getUserRoles(userId: number) {
  const roles = await this.roleService.getUserRoles(userId);
  console.log(roles); // Array di oggetti Role
}
```

### Ottenere tutti i permessi di un utente

```typescript
async getUserPermissions(userId: number) {
  const permissions = await this.roleService.getUserPermissions(userId);
  console.log(permissions); // Array di oggetti Permission
}
```

## Note Importanti

### Gerarchia dei Ruoli
Il campo `level` indica la gerarchia (1 = massimo potere). Questo può essere usato per implementare logiche come "un manager può gestire solo utenti con level > 2".

### Ruoli Temporanei
Il campo `expiresAt` nella tabella `user_roles` permette di assegnare ruoli con scadenza automatica.

### Ruoli Globali vs Ruoli per Corso
- **Ruoli Globali** (`user_roles`): Validi in tutto il sistema
- **Ruoli per Corso** (`course_user_roles`): Validi solo per un corso specifico

Un utente può essere "student" globalmente ma "teacher" in un corso specifico.

### Sicurezza
- Tutti gli endpoint di modifica richiedono permessi appropriati
- I Guards verificano automaticamente i permessi prima di eseguire le azioni
- Le password non vengono mai restituite nelle API (assicurati di escluderle nelle entità)

## Estensione del Sistema

### Aggiungere un nuovo permesso

1. Inserire nel database tramite API:
```bash
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new_permission",
    "description": "Descrizione del nuovo permesso",
    "category": "custom"
  }'
```

2. Assegnare ai ruoli appropriati tramite update del ruolo

### Creare un ruolo personalizzato

I ruoli possono essere creati dinamicamente via API o aggiunti al seed iniziale modificando `src/seeds/roles-permissions.seed.ts`.

## Troubleshooting

### Le entità non vengono create
- Verificare che `synchronize: true` sia impostato in `app.module.ts` (solo in sviluppo!)
- In produzione, usare le migrations

### Errore "User not authenticated"
- Assicurarsi che il sistema di autenticazione imposti `request.user` correttamente
- I Guards si aspettano un oggetto user nella richiesta

### Permessi non funzionano
- Verificare che l'utente abbia il ruolo assegnato
- Verificare che il ruolo abbia il permesso
- Controllare i log per vedere eventuali errori

## Best Practices

1. **Non usare synchronize in produzione** - Usare le migrations
2. **Validare sempre i permessi** - Anche se un utente ha un ruolo, verificare i permessi specifici
3. **Logging** - Loggare tutte le operazioni di assegnazione/rimozione ruoli
4. **Audit Trail** - Usare il campo `assignedBy` per tracciare chi ha assegnato i ruoli
5. **Ruoli temporanei con cautela** - Implementare un job che rimuove automaticamente i ruoli scaduti
