# 📚 Guida API Enrollments (Iscrizioni)

Documentazione completa dell'API per la gestione delle iscrizioni degli utenti ai corsi.

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Relazioni Database](#relazioni-database)
3. [Endpoints Disponibili](#endpoints-disponibili)
4. [Nuovo Endpoint: findByUsers](#endpoint-findbyusers)
5. [Esempi Pratici](#esempi-pratici)
6. [Protezione con Ruoli e Permessi](#protezione-con-ruoli-e-permessi)

---

## Panoramica

Il modulo **Enrollments** gestisce la relazione **Many-to-Many** tra **Users** e **Courses**.

### Caratteristiche Principali

✅ **Transazioni Database** - Tutte le operazioni usano transazioni per garantire consistenza
✅ **Validazioni Complete** - Controlli su utente attivo, corso attivo, posti disponibili
✅ **Prevenzione Duplicati** - Impedisce iscrizioni multiple allo stesso corso
✅ **Iscrizioni Multiple** - Endpoint bulk per iscrivere un utente a più corsi
✅ **Query Aggregate** - Vista raggruppata per utente con tutti i corsi
✅ **Gestione Stati** - Stati di iscrizione: pending, active, completed, cancelled

---

## Relazioni Database

```
┌─────────┐         ┌──────────────┐         ┌─────────┐
│  users  │◄────────┤  enrollments ├────────►│ courses │
└─────────┘         └──────────────┘         └─────────┘
    1                      M:N                     1
```

### Tabella: enrollments

```sql
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  enrollmentDate DATE NOT NULL,
  status ENUM('pending', 'active', 'completed', 'cancelled'),
  grade DECIMAL(5,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course (userId, courseId)
);
```

---

## Endpoints Disponibili

### 1. **POST** `/enrollments` - Crea iscrizione

Iscrive un utente a un corso.

**Request:**
```json
{
  "userId": 1,
  "courseId": 5,
  "enrollmentDate": "2026-01-03",
  "status": "pending"
}
```

**Response (201):**
```json
{
  "id": 10,
  "userId": 1,
  "courseId": 5,
  "enrollmentDate": "2026-01-03",
  "status": "pending",
  "grade": null,
  "createdAt": "2026-01-03T10:00:00.000Z",
  "updatedAt": "2026-01-03T10:00:00.000Z",
  "user": {
    "id": 1,
    "email": "mario@example.com",
    "username": "mario"
  },
  "course": {
    "id": 5,
    "name": "JavaScript Avanzato",
    "code": "JS301"
  }
}
```

**Validazioni:**
- ✅ Utente esiste e è attivo
- ✅ Corso esiste ed è attivo
- ✅ Utente non già iscritto
- ✅ Posti disponibili nel corso

---

### 2. **POST** `/enrollments/bulk` - Iscrizione multipla

Iscrive un utente a più corsi in una singola transazione.

**Request:**
```json
{
  "userId": 1,
  "courseIds": [5, 8, 12]
}
```

**Response (201):**
```json
[
  {
    "id": 10,
    "userId": 1,
    "courseId": 5,
    "status": "pending",
    "course": { ... }
  },
  {
    "id": 11,
    "userId": 1,
    "courseId": 8,
    "status": "pending",
    "course": { ... }
  },
  {
    "id": 12,
    "userId": 1,
    "courseId": 12,
    "status": "pending",
    "course": { ... }
  }
]
```

---

### 3. **GET** `/enrollments` - Tutte le iscrizioni

Restituisce tutte le iscrizioni con dettagli utente e corso.

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 5,
    "enrollmentDate": "2026-01-02",
    "status": "active",
    "grade": null,
    "user": {
      "id": 1,
      "email": "mario@example.com",
      "username": "mario"
    },
    "course": {
      "id": 5,
      "name": "JavaScript Avanzato",
      "code": "JS301",
      "credits": 6
    }
  }
]
```

---

### 4. **GET** `/enrollments/groupinguser` - 🆕 Iscrizioni raggruppate per utente

**NUOVO ENDPOINT** - Restituisce una vista aggregata con tutti i corsi per ogni utente.

#### Cosa Fa

Esegue una query SQL con:
- **GROUP BY** su utente
- **JSON_ARRAYAGG** per aggregare i corsi in un array JSON
- **INNER JOIN** con users e courses

#### SQL Generata

```sql
SELECT
  users.id,
  users.username,
  users.email,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'name', courses.name,
      'description', courses.description,
      'code', courses.code,
      'maxStudents', courses.maxStudents,
      'isActive', courses.isActive
    )
  ) AS corsi
FROM enrollments
INNER JOIN users ON enrollments.userId = users.id
INNER JOIN courses ON enrollments.courseId = courses.id
GROUP BY users.id, users.username, users.email;
```

#### Response (200)

```json
[
  {
    "users_id": 1,
    "users_username": "mariorossi",
    "users_email": "mario.rossi@example.com",
    "corsi": [
      {
        "name": "JavaScript Avanzato",
        "description": "Corso completo di JavaScript ES6+",
        "code": "JS301",
        "maxStudents": 30,
        "isActive": true
      },
      {
        "name": "TypeScript Fundamentals",
        "description": "Introduzione a TypeScript",
        "code": "TS101",
        "maxStudents": 25,
        "isActive": true
      },
      {
        "name": "React Advanced",
        "description": "Concetti avanzati di React",
        "code": "REACT301",
        "maxStudents": 20,
        "isActive": true
      }
    ]
  },
  {
    "users_id": 2,
    "users_username": "annabianchi",
    "users_email": "anna.bianchi@example.com",
    "corsi": [
      {
        "name": "Node.js Backend",
        "description": "Sviluppo backend con Node.js",
        "code": "NODE201",
        "maxStudents": 25,
        "isActive": true
      }
    ]
  }
]
```

#### Casi d'Uso

✅ **Dashboard Studente** - Mostrare tutti i corsi di uno studente
✅ **Report Amministrativi** - Vista aggregata delle iscrizioni
✅ **Statistiche** - Contare i corsi per utente
✅ **Export Dati** - Esportare iscrizioni in formato compatto

#### Confronto con altri endpoint

| Endpoint | Risultato | Uso |
|----------|-----------|-----|
| `GET /enrollments` | Lista piatta di tutte le iscrizioni | Vedere tutte le coppie utente-corso |
| `GET /enrollments/user/:userId` | Iscrizioni di UN utente | Profilo specifico utente |
| `GET /enrollments/groupinguser` | **Tutti gli utenti con i loro corsi aggregati** | **Dashboard generale, report** |

---

### 5. **GET** `/enrollments/user/:userId` - Iscrizioni di un utente

Trova tutte le iscrizioni di uno specifico utente.

**Request:**
```http
GET /enrollments/user/1
```

**Response (200):**
```json
[
  {
    "id": 10,
    "userId": 1,
    "courseId": 5,
    "enrollmentDate": "2026-01-02",
    "status": "active",
    "grade": null,
    "course": {
      "id": 5,
      "name": "JavaScript Avanzato",
      "code": "JS301",
      "credits": 6
    }
  }
]
```

---

### 6. **GET** `/enrollments/course/:courseId` - Iscrizioni di un corso

Trova tutte le iscrizioni per uno specifico corso.

**Request:**
```http
GET /enrollments/course/5
```

**Response (200):**
```json
[
  {
    "id": 10,
    "userId": 1,
    "courseId": 5,
    "enrollmentDate": "2026-01-02",
    "status": "active",
    "user": {
      "id": 1,
      "email": "mario@example.com",
      "username": "mario"
    }
  },
  {
    "id": 11,
    "userId": 2,
    "courseId": 5,
    "enrollmentDate": "2026-01-02",
    "status": "pending",
    "user": {
      "id": 2,
      "email": "anna@example.com",
      "username": "anna"
    }
  }
]
```

---

### 7. **GET** `/enrollments/:id` - Dettaglio iscrizione

Ottiene una specifica iscrizione con tutte le relazioni.

**Request:**
```http
GET /enrollments/10
```

**Response (200):**
```json
{
  "id": 10,
  "userId": 1,
  "courseId": 5,
  "enrollmentDate": "2026-01-02",
  "status": "active",
  "grade": null,
  "createdAt": "2026-01-02T10:00:00.000Z",
  "updatedAt": "2026-01-02T10:00:00.000Z",
  "user": {
    "id": 1,
    "email": "mario@example.com",
    "username": "mario",
    "profile": {
      "firstName": "Mario",
      "lastName": "Rossi"
    }
  },
  "course": {
    "id": 5,
    "name": "JavaScript Avanzato",
    "code": "JS301",
    "credits": 6,
    "maxStudents": 30
  }
}
```

---

### 8. **PATCH** `/enrollments/:id` - Aggiorna iscrizione

Aggiorna lo stato e/o il voto di un'iscrizione.

**Request:**
```http
PATCH /enrollments/10
Content-Type: application/json

{
  "status": "completed",
  "grade": 95.5
}
```

**Response (200):**
```json
{
  "id": 10,
  "userId": 1,
  "courseId": 5,
  "enrollmentDate": "2026-01-02",
  "status": "completed",
  "grade": 95.5,
  "createdAt": "2026-01-02T10:00:00.000Z",
  "updatedAt": "2026-01-03T15:30:00.000Z"
}
```

**Stati Possibili:**
- `pending` - In attesa di approvazione
- `active` - Iscrizione attiva
- `completed` - Corso completato
- `cancelled` - Iscrizione cancellata

---

### 9. **DELETE** `/enrollments/:id` - Elimina iscrizione

Elimina un'iscrizione (cancellazione logica tramite stato o fisica).

**Request:**
```http
DELETE /enrollments/10
```

**Response (204):**
```
No Content
```

---

## Esempi Pratici

### Scenario 1: Dashboard Studente

**Obiettivo:** Mostrare tutti i corsi di uno studente nella sua dashboard.

**Opzione A - Usando `/enrollments/user/:userId`:**

```bash
curl -X GET http://localhost:3000/enrollments/user/1
```

**Risultato:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 5,
    "status": "active",
    "course": { "name": "JavaScript", "code": "JS301" }
  },
  {
    "id": 2,
    "userId": 1,
    "courseId": 8,
    "status": "active",
    "course": { "name": "TypeScript", "code": "TS101" }
  }
]
```

**Opzione B - Usando `/enrollments/groupinguser` e filtrando:**

```bash
curl -X GET http://localhost:3000/enrollments/groupinguser
```

Poi filtri lato client per `users_id === 1`.

**Consiglio:** Usa **Opzione A** per dashboard di UN utente specifico.

---

### Scenario 2: Report Amministrativo

**Obiettivo:** Vedere tutti gli utenti e quanti/quali corsi hanno.

```bash
curl -X GET http://localhost:3000/enrollments/groupinguser
```

**Risultato:**
```json
[
  {
    "users_id": 1,
    "users_username": "mario",
    "users_email": "mario@example.com",
    "corsi": [ { "name": "JS" }, { "name": "TS" }, { "name": "React" } ]
  },
  {
    "users_id": 2,
    "users_username": "anna",
    "users_email": "anna@example.com",
    "corsi": [ { "name": "Node.js" } ]
  }
]
```

**Elaborazione Frontend:**
```typescript
const report = data.map(user => ({
  username: user.users_username,
  email: user.users_email,
  totalCourses: user.corsi.length,
  courses: user.corsi.map(c => c.name)
}));

// Output:
// [
//   { username: "mario", email: "mario@...", totalCourses: 3, courses: ["JS", "TS", "React"] },
//   { username: "anna", email: "anna@...", totalCourses: 1, courses: ["Node.js"] }
// ]
```

---

### Scenario 3: Iscrizione Massiva Inizio Anno

**Obiettivo:** Iscrivere uno studente a tutti i corsi del primo anno.

```bash
curl -X POST http://localhost:3000/enrollments/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 10,
    "courseIds": [1, 2, 3, 4, 5]
  }'
```

**Vantaggi:**
- ✅ Singola transazione (tutto o niente)
- ✅ Validazioni su tutti i corsi
- ✅ Rollback automatico in caso di errore

---

### Scenario 4: Lista Studenti di un Corso

**Obiettivo:** Vedere chi è iscritto al corso "JavaScript Avanzato" (ID 5).

```bash
curl -X GET http://localhost:3000/enrollments/course/5
```

**Risultato:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "status": "active",
    "user": { "username": "mario", "email": "mario@example.com" }
  },
  {
    "id": 5,
    "userId": 2,
    "status": "active",
    "user": { "username": "anna", "email": "anna@example.com" }
  }
]
```

**Uso:** Lista studenti per il docente.

---

## Protezione con Ruoli e Permessi

Quando integri il sistema di ruoli e permessi, ecco come proteggere gli endpoints:

### Esempio: Controller Protetto

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '../../decorators/permissions.decorator';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('enrollments')
export class EnrollmentsController {

  // PUBBLICO - Tutti possono vedere le iscrizioni raggruppate
  @Get('groupinguser')
  findByUsers() {
    return this.enrollmentsService.findByUsers();
  }

  // PROTETTO - Solo teacher/admin possono iscrivere studenti
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('enroll_students')
  create(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: User) {
    return this.enrollmentsService.create(dto);
  }

  // PROTETTO - Solo lo studente stesso o un teacher/admin
  @Get('user/:userId')
  @UseGuards(PermissionsGuard)
  @Permissions('view_users', 'view_own_profile')
  async findByUser(
    @Param('userId') userId: number,
    @CurrentUser() user: User
  ) {
    // Verifica aggiuntiva: lo studente può vedere solo le proprie
    if (user.id !== userId) {
      const canViewAll = await this.roleService.userHasPermission(
        user.id,
        'view_users'
      );
      if (!canViewAll) {
        throw new ForbiddenException('Can only view your own enrollments');
      }
    }

    return this.enrollmentsService.findByUser(userId);
  }

  // PROTETTO - Solo teacher/admin possono aggiornare i voti
  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('grade_students')
  update(@Param('id') id: number, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, dto);
  }
}
```

### Matrice Permessi Consigliata

| Azione | Permesso Richiesto | Ruoli con Permesso |
|--------|-------------------|-------------------|
| Vedere tutte iscrizioni raggruppate | Nessuno (pubblico) o `view_users` | Tutti o admin/manager/teacher |
| Iscrivere studenti | `enroll_students` | admin, manager, teacher |
| Vedere proprie iscrizioni | `view_own_grades` | student, tutti |
| Vedere iscrizioni altrui | `view_users` o `view_all_grades` | admin, manager, teacher, tutor |
| Aggiornare stato/voto | `grade_students` | admin, teacher |
| Eliminare iscrizione | `enroll_students` | admin, manager, teacher |

---

## Differenze tra gli Endpoints di Lettura

### Confronto Visuale

```
GET /enrollments
└─ Lista PIATTA di tutte le iscrizioni
   [
     { id: 1, userId: 1, courseId: 5, ... },
     { id: 2, userId: 1, courseId: 8, ... },
     { id: 3, userId: 2, courseId: 5, ... }
   ]

GET /enrollments/user/1
└─ Iscrizioni di UN utente
   [
     { id: 1, userId: 1, courseId: 5, course: {...} },
     { id: 2, userId: 1, courseId: 8, course: {...} }
   ]

GET /enrollments/course/5
└─ Iscrizioni di UN corso
   [
     { id: 1, userId: 1, courseId: 5, user: {...} },
     { id: 3, userId: 2, courseId: 5, user: {...} }
   ]

GET /enrollments/groupinguser 🆕
└─ AGGREGATO per utente
   [
     {
       users_id: 1,
       users_username: "mario",
       corsi: [
         { name: "JavaScript", code: "JS301" },
         { name: "TypeScript", code: "TS101" }
       ]
     }
   ]
```

---

## Note Tecniche

### Query Builder vs Repository

L'endpoint `findByUsers()` usa **QueryBuilder** invece di **Repository.find()** perché:

1. Richiede aggregazioni SQL complesse (`JSON_ARRAYAGG`)
2. Necessita di GROUP BY
3. Ritorna dati "raw" (non entità TypeORM)

### Performance

- ✅ **Singola Query** - Aggregazione fatta dal database
- ✅ **Efficient** - Evita N+1 queries
- ⚠️ **Large Datasets** - Considera paginazione per grandi quantità di dati

### Possibili Miglioramenti

```typescript
// Aggiungere paginazione
async findByUsers(page: number = 1, limit: number = 50) {
  return this.enrollmentsRepository
    .createQueryBuilder('enrollments')
    .select([...])
    .groupBy('users.id')
    .limit(limit)
    .offset((page - 1) * limit)
    .getRawMany();
}

// Filtrare per stato
async findByUsers(status?: EnrollmentStatus) {
  const qb = this.enrollmentsRepository
    .createQueryBuilder('enrollments')
    .select([...]);

  if (status) {
    qb.where('enrollments.status = :status', { status });
  }

  return qb.groupBy('users.id').getRawMany();
}
```

---

## Riepilogo

### Quando usare ogni endpoint?

| Scenario | Endpoint | Motivo |
|----------|----------|--------|
| Dashboard studente | `/enrollments/user/:userId` | Corsi di UN utente specifico |
| Lista studenti corso | `/enrollments/course/:courseId` | Studenti di UN corso |
| Report generale | `/enrollments/groupinguser` | Vista aggregata tutti gli utenti |
| Dettaglio iscrizione | `/enrollments/:id` | Informazioni complete su una specifica iscrizione |
| Export tutti i dati | `/enrollments` | Lista completa non aggregata |

### Modifiche al Sistema Ruoli

Se vuoi proteggere `/enrollments/groupinguser`:

1. Apri [enrollments.controller.ts](src/modules/enrollments/enrollments.controller.ts)
2. Aggiungi `@UseGuards(PermissionsGuard)`
3. Aggiungi `@Permissions('view_users')` o altro permesso appropriato

---

**Documentazione aggiornata** - 2026-01-04
**Branch**: `feature/user_role_permission`
