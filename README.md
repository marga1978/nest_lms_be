# Sistema di Gestione Utenti e Corsi - NestJS + MySQL + Docker

Sistema completo per la gestione di utenti, corsi, profili e iscrizioni con NestJS, TypeORM e MySQL in Docker.

## 🚀 Caratteristiche

### Gestione Entità
- ✅ Gestione completa di **Utenti** (credenziali: email, username, password)
- ✅ Gestione completa di **Corsi** con lezioni
- ✅ Sistema di **Iscrizioni** con tabella di raccordo (M:N)
- ✅ **User Profiles** (relazione 1:1 con Users - dati personali separati)
- ✅ **Course Lessons** (relazione 1:N con Courses)

### Relazioni Database

Il sistema implementa tutte le tipologie di relazioni database:

| Tipo | Entità | Descrizione | Implementazione |
|------|--------|-------------|-----------------|
| **1:1** | User ↔ UserProfile | Un utente ha un solo profilo | `userId` UNIQUE in user_profiles |
| **1:N** | Course → CourseLessons | Un corso ha molte lezioni | `courseId` in course_lessons |
| **M:N** | User ↔ Course | Utenti iscritti a corsi | Tabella `enrollments` con dati extra |

#### 🔗 Relazione 1:1 - User ↔ UserProfile
**Un utente ha esattamente un profilo**
```
User (1) ←→ (1) UserProfile
  ↓                   ↓
users.id ← userId → user_profiles.userId (UNIQUE)
```
- **Implementazione**: Campo `userId` in `user_profiles` è **UNIQUE**
- **Separazione**: User contiene credenziali, UserProfile contiene dati personali
- **Caricamento**: Relazione caricata automaticamente in `GET /users/:id`

#### 🔗 Relazione 1:N - Course → CourseLessons
**Un corso ha molte lezioni, ogni lezione appartiene a un solo corso**
```
Course (1) ←→ (N) CourseLesson
   ↓                    ↓
courses.id ← courseId → course_lessons.courseId
```
- **Implementazione**: Campo `courseId` in `course_lessons` (NOT UNIQUE)
- **Ordinamento**: Le lezioni sono ordinate tramite campo `orderIndex`
- **Caricamento**: Relazione caricata con `relations: ['lessons']`
- **Cascade**: Se un corso viene eliminato, anche le sue lezioni vengono eliminate

#### 🔗 Relazione M:N - User ↔ Course (tramite Enrollments)
**Molti utenti possono iscriversi a molti corsi**
```
User (N) ←→ (N) Course
    ↓           ↓
    └─→ Enrollment ←─┘
         ↓       ↓
      userId  courseId
```
- **Tabella di raccordo**: `enrollments` con dati aggiuntivi (status, grade, enrollmentDate)
- **Vincoli**: Un utente non può iscriversi due volte allo stesso corso
- **Controllo posti**: Verifica automatica che non si superi `maxStudents`
- **Caricamento**: Relazione caricata con `relations: ['enrollments', 'enrollments.user']`

#### 📊 Diagramma Completo delle Relazioni
```
┌──────────────┐          ┌──────────────────┐
│    User      │          │   UserProfile    │
│──────────────│  1:1     │──────────────────│
│ id (PK)      │◄────────►│ id (PK)          │
│ email        │          │ userId (FK, UQ)  │
│ username     │          │ firstName        │
│ password     │          │ lastName         │
└──────┬───────┘          └──────────────────┘
       │ 1
       │
       │ N
┌──────▼───────────┐
│   Enrollment     │      ┌──────────────────┐
│──────────────────│  N   │     Course       │
│ id (PK)          │      │──────────────────│
│ userId (FK) ─────┼──────┤ id (PK)          │
│ courseId (FK) ───┼────N►│ code (UNIQUE)    │
│ status           │      │ maxStudents      │
│ grade            │      └──────┬───────────┘
│ enrollmentDate   │             │ 1
└──────────────────┘             │
                                 │ N
                         ┌───────▼──────────┐
                         │  CourseLesson    │
                         │──────────────────│
                         │ id (PK)          │
                         │ courseId (FK)    │
                         │ title            │
                         │ type             │
                         │ orderIndex       │
                         └──────────────────┘
```

### Funzionalità Avanzate
- ✅ **Transazioni** per garantire l'integrità dei dati
- ✅ Validazione automatica dei dati con class-validator
- ✅ Controllo numero massimo studenti per corso
- ✅ Iscrizioni multiple in una singola transazione (bulk enrollment)
- ✅ Supporto a 4 tipi di lezioni: video, text, quiz, assignment
- ✅ Stati iscrizione: pending, active, completed, cancelled
- ✅ Docker Compose per ambiente di sviluppo isolato

## 📋 Prerequisiti

- Node.js (v18 o superiore)
- Docker e Docker Compose
- npm o yarn

## 🛠️ Installazione

### Metodo 1: Con Docker (Raccomandato)

1. **Clona il repository**

2. **Installa le dipendenze**
```bash
npm install
```

3. **Avvia il database MySQL con Docker Compose**
```bash
docker-compose up -d
```

Questo avvierà MySQL 8.0 sulla porta **3307** (per evitare conflitti con installazioni locali).

4. **Configura le variabili d'ambiente**

Il file `.env` è già configurato per Docker:
```env
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=students_courses_db
PORT=3000
```

5. **Avvia l'applicazione**
```bash
npm run start:dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

### Metodo 2: Senza Docker

1. **Installa MySQL 8.0 localmente**

2. **Crea il database**
```sql
CREATE DATABASE students_courses_db;
```

3. **Modifica il file `.env`** con le tue credenziali MySQL:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tuo_username
DB_PASSWORD=tua_password
DB_DATABASE=students_courses_db
PORT=3000
```

4. **Installa dipendenze e avvia**
```bash
npm install
npm run start:dev
```

## 📊 Struttura del Database

### Tabella `users` (Solo Credenziali e Autenticazione)
- `id` - Chiave primaria
- `email` - Email (univoca)
- `username` - Username
- `password` - Password
- `isActive` - Stato attivo (default: true)
- `createdAt` - Data creazione
- `updatedAt` - Data ultimo aggiornamento

> **Nota**: I dati personali (firstName, lastName, dateOfBirth, ecc.) **NON** sono in `users`, ma in `user_profiles` per evitare ridondanza!

### Tabella `user_profiles` (Solo Dati Personali - Relazione 1:1)
- `id` - Chiave primaria
- `userId` - Foreign key verso users (**UNIQUE** - garantisce relazione 1:1)
- `firstName` - Nome
- `lastName` - Cognome
- `dateOfBirth` - Data di nascita
- `phoneNumber` - Numero di telefono
- `bio` - Biografia
- `avatarUrl` - URL avatar
- `createdAt` - Data creazione
- `updatedAt` - Data ultimo aggiornamento

> **Separazione dei dati**: User = credenziali, UserProfile = dati personali

### Tabella `courses`
- `id` - Chiave primaria
- `name` - Nome del corso
- `description` - Descrizione
- `code` - Codice corso (univoco)
- `credits` - Crediti
- `maxStudents` - Numero massimo studenti (default: 30)
- `isActive` - Stato attivo
- `createdAt` - Data creazione
- `updatedAt` - Data ultimo aggiornamento

### Tabella `course_lessons` (Relazione 1:N con courses)
- `id` - Chiave primaria
- `courseId` - Foreign key verso courses (NON unique - relazione 1:N)
- `title` - Titolo della lezione
- `description` - Descrizione
- `type` - Tipo lezione (video, text, quiz, assignment)
- `content` - Contenuto testuale (per text, quiz, assignment)
- `videoUrl` - URL video (per video)
- `orderIndex` - Ordine della lezione nel corso
- `durationMinutes` - Durata in minuti
- `isActive` - Stato attivo
- `createdAt` - Data creazione
- `updatedAt` - Data ultimo aggiornamento

### Tabella `enrollments` (Relazione M:N - users ↔ courses)
- `id` - Chiave primaria
- `userId` - Foreign key verso users
- `courseId` - Foreign key verso courses
- `status` - Stato iscrizione (pending, active, completed, cancelled)
- `enrollmentDate` - Data iscrizione
- `grade` - Voto (opzionale, 0-100)
- `createdAt` - Data creazione
- `updatedAt` - Data ultimo aggiornamento

## 🎓 Come Creare e Gestire un Corso - Guida Completa

### Panoramica
Un corso nel sistema è composto da tre elementi principali:
1. **Corso** - Informazioni base (nome, codice, crediti, numero max studenti)
2. **Lezioni** - Contenuti del corso (video, testo, quiz, esercizi)
3. **Iscrizioni** - Studenti iscritti al corso

### Workflow Completo

#### 1️⃣ Creare un Corso

Prima di tutto, crea il corso con le informazioni base:

```bash
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sviluppo Web con NestJS",
    "description": "Corso completo su NestJS, TypeORM e sviluppo backend moderno",
    "code": "NEST101",
    "credits": 8,
    "maxStudents": 25,
    "isActive": true
  }'
```

**Risposta:**
```json
{
  "id": 1,
  "name": "Sviluppo Web con NestJS",
  "description": "Corso completo su NestJS, TypeORM e sviluppo backend moderno",
  "code": "NEST101",
  "credits": 8,
  "maxStudents": 25,
  "isActive": true,
  "createdAt": "2025-12-27T10:00:00.000Z",
  "updatedAt": "2025-12-27T10:00:00.000Z"
}
```

**Campi del corso:**
- `name` *(obbligatorio)* - Nome del corso (max 200 caratteri)
- `description` *(obbligatorio)* - Descrizione dettagliata
- `code` *(obbligatorio)* - Codice univoco del corso (es. "CS101", "MATH202")
- `credits` *(obbligatorio)* - Numero di crediti (valore numerico)
- `maxStudents` *(opzionale)* - Numero massimo di studenti (default: 30)
- `isActive` *(opzionale)* - Stato del corso (default: true)

#### 2️⃣ Aggiungere Lezioni al Corso

Una volta creato il corso, aggiungi le lezioni. Il sistema supporta 4 tipi di lezioni:

##### Lezione Video
```bash
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "title": "Introduzione a NestJS",
    "description": "Panoramica del framework e setup iniziale",
    "type": "video",
    "videoUrl": "https://example.com/video/intro-nestjs.mp4",
    "orderIndex": 1,
    "durationMinutes": 45,
    "isActive": true
  }'
```

##### Lezione Testuale
```bash
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "title": "Dependency Injection in NestJS",
    "description": "Comprensione del pattern DI",
    "type": "text",
    "content": "# Dependency Injection\n\nLa Dependency Injection è un pattern fondamentale...",
    "orderIndex": 2,
    "durationMinutes": 30,
    "isActive": true
  }'
```

##### Quiz
```bash
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "title": "Quiz: Concetti Base di NestJS",
    "description": "Verifica le tue conoscenze",
    "type": "quiz",
    "content": "{\"questions\": [{\"question\": \"Cos è un modulo in NestJS?\", \"options\": [\"A\", \"B\", \"C\"], \"correct\": 0}]}",
    "orderIndex": 3,
    "durationMinutes": 15,
    "isActive": true
  }'
```

##### Esercizio (Assignment)
```bash
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "title": "Esercizio: Crea il tuo primo Controller",
    "description": "Implementa un controller REST completo",
    "type": "assignment",
    "content": "Crea un controller che gestisca CRUD per entità Product:\n- GET /products\n- POST /products\n- PATCH /products/:id\n- DELETE /products/:id",
    "orderIndex": 4,
    "durationMinutes": 120,
    "isActive": true
  }'
```

**Campi delle lezioni:**
- `courseId` *(obbligatorio)* - ID del corso a cui appartiene la lezione
- `title` *(obbligatorio)* - Titolo della lezione (max 200 caratteri)
- `description` *(obbligatorio)* - Descrizione della lezione
- `type` *(obbligatorio)* - Tipo: `video`, `text`, `quiz`, `assignment`
- `content` *(richiesto per text/quiz/assignment)* - Contenuto testuale
- `videoUrl` *(richiesto per video)* - URL del video
- `orderIndex` *(opzionale)* - Ordine della lezione (default: 0)
- `durationMinutes` *(opzionale)* - Durata in minuti
- `isActive` *(opzionale)* - Stato attivo (default: true)

#### 3️⃣ Iscrivere Studenti al Corso

Dopo aver creato il corso e le lezioni, puoi iscrivere gli studenti:

```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "courseId": 1,
    "status": "active",
    "enrollmentDate": "2025-12-27"
  }'
```

**Il sistema verifica automaticamente:**
- ✅ L'utente esiste ed è attivo
- ✅ Il corso esiste ed è attivo
- ✅ L'utente non è già iscritto al corso
- ✅ C'è ancora spazio disponibile (maxStudents)

#### 4️⃣ Visualizzare il Corso Completo

Per vedere il corso con tutte le lezioni e gli studenti iscritti:

```bash
curl http://localhost:3000/courses/1
```

**Risposta completa:**
```json
{
  "id": 1,
  "name": "Sviluppo Web con NestJS",
  "description": "Corso completo su NestJS, TypeORM e sviluppo backend moderno",
  "code": "NEST101",
  "credits": 8,
  "maxStudents": 25,
  "isActive": true,
  "createdAt": "2025-12-27T10:00:00.000Z",
  "updatedAt": "2025-12-27T10:00:00.000Z",
  "lessons": [
    {
      "id": 1,
      "title": "Introduzione a NestJS",
      "type": "video",
      "orderIndex": 1,
      "durationMinutes": 45
    },
    {
      "id": 2,
      "title": "Dependency Injection in NestJS",
      "type": "text",
      "orderIndex": 2,
      "durationMinutes": 30
    }
  ],
  "enrollments": [
    {
      "id": 1,
      "userId": 1,
      "status": "active",
      "enrollmentDate": "2025-12-27",
      "user": {
        "id": 1,
        "email": "mario.rossi@example.com",
        "username": "mrossi"
      }
    }
  ]
}
```

### Operazioni Comuni

#### Aggiornare un Corso
```bash
curl -X PATCH http://localhost:3000/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "maxStudents": 30,
    "description": "Corso aggiornato con nuovi contenuti"
  }'
```

#### Ottenere Tutte le Lezioni di un Corso
```bash
curl http://localhost:3000/course-lessons/course/1
```

#### Modificare l'Ordine delle Lezioni
```bash
curl -X PATCH http://localhost:3000/course-lessons/3 \
  -H "Content-Type: application/json" \
  -d '{
    "orderIndex": 5
  }'
```

#### Disattivare un Corso
```bash
curl -X PATCH http://localhost:3000/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Best Practices

1. **Codici Corso Univoci**: Usa codici significativi (es. "CS101", "MATH201")
2. **Ordinamento Lezioni**: Usa `orderIndex` incrementali (1, 2, 3...) per mantenere l'ordine
3. **Controllo Posti**: Imposta `maxStudents` appropriato per limitare le iscrizioni
4. **Stati del Corso**: Usa `isActive: false` per corsi non più disponibili (senza eliminarli)
5. **Tipi di Lezione**: Scegli il tipo appropriato e fornisci i campi richiesti:
   - `video` → richiede `videoUrl`
   - `text`/`quiz`/`assignment` → richiede `content`

## 🔌 API Endpoints

### 👤 Users

#### Crea un utente
```http
POST /users
Content-Type: application/json

{
  "email": "mario.rossi@example.com",
  "username": "mrossi",
  "password": "password123",
  "isActive": true
}
```

**Risposta:**
```json
{
  "id": 1,
  "email": "mario.rossi@example.com",
  "username": "mrossi",
  "password": "password123",
  "isActive": true,
  "createdAt": "2025-12-27T18:16:54.519Z",
  "updatedAt": "2025-12-27T18:16:54.519Z"
}
```

#### Ottieni tutti gli utenti (con profili)
```http
GET /users
```

#### Ottieni un utente (con profilo)
```http
GET /users/:id
```

#### Aggiorna un utente
```http
PATCH /users/:id
Content-Type: application/json

{
  "username": "mario.rossi.dev",
  "isActive": true
}
```

**Risposta:**
```json
{
  "id": 1,
  "email": "mario.rossi@example.com",
  "username": "mario.rossi.dev",
  "password": "password123",
  "isActive": true,
  "createdAt": "2025-12-27T18:16:54.519Z",
  "updatedAt": "2025-12-27T19:30:00.000Z"
}
```

**Campi aggiornabili:**
- `email` - Email (deve essere univoca)
- `username` - Username
- `password` - Password
- `isActive` - Stato attivo/disattivo

#### Elimina un utente
```http
DELETE /users/:id
```

**Risposta:** **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminando un utente, verranno eliminate in cascata anche il profilo associato e tutte le iscrizioni ai corsi.

### 📋 User Profiles (Relazione 1:1)

#### Crea un profilo utente
```http
POST /user-profiles
Content-Type: application/json

{
  "userId": 1,
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+39 333 1234567",
  "bio": "Sviluppatore software appassionato",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Risposta:**
```json
{
  "id": 1,
  "userId": 1,
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+39 333 1234567",
  "bio": "Sviluppatore software appassionato",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-12-27T18:17:04.678Z",
  "updatedAt": "2025-12-27T18:17:04.678Z"
}
```

#### Ottieni tutti i profili
```http
GET /user-profiles
```

#### Ottieni profilo per userId
```http
GET /user-profiles/user/:userId
```

#### Ottieni un profilo
```http
GET /user-profiles/:id
```

#### Aggiorna un profilo
```http
PATCH /user-profiles/:id
Content-Type: application/json

{
  "bio": "Senior Full Stack Developer",
  "phoneNumber": "+39 333 9999999"
}
```

#### Elimina un profilo
```http
DELETE /user-profiles/:id
```

**Risposta:** **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare un profilo non elimina l'utente associato, solo i dati personali.

### 📚 Courses

#### Crea un corso
```http
POST /courses
Content-Type: application/json

{
  "name": "JavaScript Fundamentals",
  "description": "Corso completo sui fondamenti di JavaScript",
  "code": "JS101",
  "credits": 6,
  "maxStudents": 30,
  "isActive": true
}
```

**Risposta:**
```json
{
  "id": 1,
  "name": "JavaScript Fundamentals",
  "description": "Corso completo sui fondamenti di JavaScript",
  "code": "JS101",
  "credits": 6,
  "maxStudents": 30,
  "isActive": true,
  "createdAt": "2025-12-27T18:17:09.722Z",
  "updatedAt": "2025-12-27T18:17:09.722Z"
}
```

#### Ottieni tutti i corsi (con enrollments e lessons)
```http
GET /courses
```

#### Ottieni un corso (con enrollments e lessons)
```http
GET /courses/:id
```

#### Aggiorna un corso
```http
PATCH /courses/:id
Content-Type: application/json

{
  "maxStudents": 40,
  "description": "Corso completo e aggiornato su JavaScript moderno",
  "isActive": true
}
```

**Risposta:**
```json
{
  "id": 1,
  "name": "JavaScript Fundamentals",
  "description": "Corso completo e aggiornato su JavaScript moderno",
  "code": "JS101",
  "credits": 6,
  "maxStudents": 40,
  "isActive": true,
  "createdAt": "2025-12-27T18:17:09.722Z",
  "updatedAt": "2025-12-27T19:45:00.000Z"
}
```

**Campi aggiornabili:**
- `name` - Nome del corso
- `description` - Descrizione
- `code` - Codice (deve rimanere univoco)
- `credits` - Numero di crediti
- `maxStudents` - Numero massimo studenti
- `isActive` - Stato attivo/disattivo

#### Elimina un corso
```http
DELETE /courses/:id
```

**Risposta:** **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminando un corso, verranno eliminate in cascata tutte le lezioni del corso e tutte le iscrizioni al corso.

### 📖 Course Lessons (Relazione 1:N)

#### Crea una lezione
```http
POST /course-lessons
Content-Type: application/json

{
  "courseId": 1,
  "title": "Introduzione al JavaScript",
  "description": "Una panoramica completa sui concetti base",
  "type": "video",
  "videoUrl": "https://example.com/video1.mp4",
  "orderIndex": 1,
  "durationMinutes": 45,
  "isActive": true
}
```

**Risposta:**
```json
{
  "id": 1,
  "courseId": 1,
  "title": "Introduzione al JavaScript",
  "description": "Una panoramica completa sui concetti base",
  "type": "video",
  "content": null,
  "videoUrl": "https://example.com/video1.mp4",
  "orderIndex": 1,
  "durationMinutes": 45,
  "isActive": true,
  "createdAt": "2025-12-27T18:17:15.000Z",
  "updatedAt": "2025-12-27T18:17:15.000Z"
}
```

**Tipi di lezione supportati:**
- `video` - Lezione video (richiede `videoUrl`)
- `text` - Lezione testuale (richiede `content`)
- `quiz` - Quiz (richiede `content` con JSON delle domande)
- `assignment` - Esercizio (richiede `content`)

#### Ottieni tutte le lezioni
```http
GET /course-lessons
```

#### Ottieni tutte le lezioni di un corso
```http
GET /course-lessons/course/:courseId
```

#### Ottieni una lezione
```http
GET /course-lessons/:id
```

#### Aggiorna una lezione
```http
PATCH /course-lessons/:id
Content-Type: application/json

{
  "orderIndex": 5,
  "durationMinutes": 60
}
```

#### Elimina una lezione
```http
DELETE /course-lessons/:id
```

**Risposta:** **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare una lezione non elimina il corso associato.

### 📝 Enrollments (Relazione M:N)

#### Crea un'iscrizione (CON TRANSAZIONE)
```http
POST /enrollments
Content-Type: application/json

{
  "userId": 1,
  "courseId": 1,
  "status": "active",
  "enrollmentDate": "2025-12-27"
}
```

**Risposta:**
```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "status": "active",
  "enrollmentDate": "2025-12-27",
  "grade": null,
  "createdAt": "2025-12-27T18:17:21.297Z",
  "updatedAt": "2025-12-27T18:17:21.297Z",
  "user": {
    "id": 1,
    "email": "mario.rossi@example.com",
    "username": "mrossi",
    "password": "password123",
    "isActive": true,
    "createdAt": "2025-12-27T18:16:54.519Z",
    "updatedAt": "2025-12-27T18:16:54.519Z"
  },
  "course": {
    "id": 1,
    "name": "JavaScript Fundamentals",
    "description": "Corso completo sui fondamenti di JavaScript",
    "code": "JS101",
    "credits": 6,
    "maxStudents": 30,
    "isActive": true,
    "createdAt": "2025-12-27T18:17:09.722Z",
    "updatedAt": "2025-12-27T18:17:09.722Z"
  }
}
```

**Questa API utilizza una transazione che:**
- Verifica che l'utente esista ed sia attivo
- Verifica che il corso esista ed sia attivo
- Controlla che l'utente non sia già iscritto al corso
- Verifica che ci sia spazio disponibile nel corso
- Se tutto va bene, crea l'iscrizione
- In caso di errore, fa il rollback completo

**Stati iscrizione disponibili:**
- `pending` - In attesa di conferma
- `active` - Attiva
- `completed` - Completata
- `cancelled` - Annullata

#### Iscrizione multipla a più corsi (CON TRANSAZIONE)
```http
POST /enrollments/bulk
Content-Type: application/json

{
  "userId": 1,
  "courseIds": [1, 2, 3]
}
```

**Risposta:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "status": "pending",
    "enrollmentDate": "2025-12-27",
    "grade": null,
    "createdAt": "2025-12-27T18:20:00.000Z",
    "updatedAt": "2025-12-27T18:20:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "courseId": 2,
    "status": "pending",
    "enrollmentDate": "2025-12-27",
    "grade": null,
    "createdAt": "2025-12-27T18:20:00.000Z",
    "updatedAt": "2025-12-27T18:20:00.000Z"
  },
  {
    "id": 3,
    "userId": 1,
    "courseId": 3,
    "status": "pending",
    "enrollmentDate": "2025-12-27",
    "grade": null,
    "createdAt": "2025-12-27T18:20:00.000Z",
    "updatedAt": "2025-12-27T18:20:00.000Z"
  }
]
```

**Questa API usa una SINGOLA TRANSAZIONE per:**
- Iscrivere l'utente a tutti i corsi specificati
- Se anche una sola iscrizione fallisce, viene fatto il rollback di tutto
- Garantisce atomicità: o vengono create tutte le iscrizioni o nessuna

#### Ottieni tutte le iscrizioni
```http
GET /enrollments
```

#### Ottieni iscrizioni per utente
```http
GET /enrollments?userId=1
```

#### Ottieni iscrizioni per corso
```http
GET /enrollments?courseId=1
```

#### Ottieni un'iscrizione
```http
GET /enrollments/:id
```

#### Aggiorna un'iscrizione (CON TRANSAZIONE)
```http
PATCH /enrollments/:id
Content-Type: application/json

{
  "status": "completed",
  "grade": 95.5
}
```

**Note sul voto:**
- Il campo `grade` accetta valori da 0 a 100
- È opzionale e può essere aggiunto/modificato in qualsiasi momento

#### Elimina un'iscrizione (CON TRANSAZIONE)
```http
DELETE /enrollments/:id
```

**Risposta:** **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare un'iscrizione non elimina né l'utente né il corso, solo il collegamento tra loro.

## 🔒 Transazioni Implementate

Il sistema utilizza transazioni database per garantire l'integrità dei dati:

### 1. Creazione Iscrizione
- Verifica esistenza e validità di utente e corso
- Controlla duplicati (stesso utente non può iscriversi due volte allo stesso corso)
- Verifica posti disponibili (maxStudents)
- Rollback automatico in caso di errore

### 2. Iscrizioni Multiple (Bulk Enrollment)
- Tutte le iscrizioni in una singola transazione
- Atomicità garantita: o tutte le iscrizioni vengono create o nessuna
- Validazioni per ogni singolo corso
- In caso di errore su una qualsiasi iscrizione, rollback completo

### 3. Aggiornamento ed Eliminazione
- Operazioni wrapped in transazioni
- Consistenza dei dati garantita
- Rollback automatico in caso di errore

## 📝 Esempi di Utilizzo

### Scenario Completo: Creazione di un Sistema Educativo

#### 1. Crea un utente
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Mario",
    "lastName": "Rossi",
    "email": "mario.rossi@example.com",
    "password": "password123",
    "dateOfBirth": "1990-05-15",
    "isActive": true
  }'
```

#### 2. Crea un profilo per l'utente (Relazione 1:1)
```bash
curl -X POST http://localhost:3000/user-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "firstName": "Mario",
    "lastName": "Rossi",
    "dateOfBirth": "1990-05-15",
    "phoneNumber": "+39 333 1234567",
    "bio": "Sviluppatore software appassionato"
  }'
```

#### 3. Crea un corso
```bash
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript Fundamentals",
    "description": "Corso completo sui fondamenti di JavaScript",
    "code": "JS101",
    "credits": 6,
    "maxStudents": 30,
    "isActive": true
  }'
```

#### 4. Crea lezioni per il corso (Relazione 1:N)
> **Nota Importante**: L'API permette di creare **solo una lezione alla volta**. Non esiste un endpoint bulk per le lezioni (a differenza degli enrollments). Per aggiungere più lezioni, devi chiamare POST ripetutamente.

```bash
# Lezione 1 - Video
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "title": "Introduzione al JavaScript",
    "description": "Una panoramica completa sui concetti base",
    "type": "video",
    "videoUrl": "https://example.com/video1.mp4",
    "orderIndex": 1,
    "durationMinutes": 45
  }'

# Lezione 2 - Text (chiamata POST separata)
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "title": "Variabili e Tipi di Dati",
    "description": "Approfondimento su var, let, const",
    "type": "text",
    "content": "# Variabili in JavaScript\n\n## Let, Const, Var...",
    "orderIndex": 2,
    "durationMinutes": 30
  }'
```

#### 5. Iscrivi l'utente al corso (Relazione M:N)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "courseId": 1,
    "status": "active",
    "enrollmentDate": "2025-12-27"
  }'
```

#### 6. Iscrivi l'utente a più corsi contemporaneamente
```bash
curl -X POST http://localhost:3000/enrollments/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "courseIds": [1, 2, 3]
  }'
```

#### 7. Completa il corso e aggiungi il voto
```bash
curl -X PATCH http://localhost:3000/enrollments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "grade": 95.5
  }'
```

#### 8. Visualizza l'utente con profilo e iscrizioni
```bash
curl http://localhost:3000/users/1
```

## 🏗️ Architettura

```
src/
├── entities/              # Entità TypeORM (modelli database)
│   ├── user.entity.ts           # Utenti (con enrollments 1:N)
│   ├── user-profile.entity.ts   # Profili utente (1:1 con users)
│   ├── course.entity.ts         # Corsi (con lessons 1:N)
│   ├── course-lesson.entity.ts  # Lezioni (1:N con courses)
│   └── enrollment.entity.ts     # Iscrizioni (M:N users ↔ courses)
├── dto/                   # Data Transfer Objects (validazione)
│   ├── user.dto.ts
│   ├── user-profile.dto.ts
│   ├── course.dto.ts
│   ├── course-lesson.dto.ts
│   └── enrollment.dto.ts
├── modules/
│   ├── users/             # Modulo utenti
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── user-profiles/     # Modulo profili (Relazione 1:1)
│   │   ├── user-profiles.controller.ts
│   │   ├── user-profiles.service.ts
│   │   └── user-profiles.module.ts
│   ├── courses/           # Modulo corsi
│   │   ├── courses.controller.ts
│   │   ├── courses.service.ts
│   │   └── courses.module.ts
│   ├── course-lessons/    # Modulo lezioni (Relazione 1:N)
│   │   ├── course-lessons.controller.ts
│   │   ├── course-lessons.service.ts
│   │   └── course-lessons.module.ts
│   └── enrollments/       # Modulo iscrizioni (Relazione M:N + TRANSAZIONI)
│       ├── enrollments.controller.ts
│       ├── enrollments.service.ts
│       └── enrollments.module.ts
├── app.module.ts          # Modulo principale (ConfigModule + TypeORM)
└── main.ts               # Entry point + ValidationPipe + CORS
```

## 🎯 Validazioni Implementate

### Validazioni su Users
- ✅ Email univoca
- ✅ Controllo stato attivo
- ✅ Validazione formato email
- ✅ Validazione date (dateOfBirth)
- ✅ Password minimo 6 caratteri (se presente)

### Validazioni su User Profiles (1:1)
- ✅ Un utente può avere un solo profilo (userId UNIQUE)
- ✅ Verifica esistenza utente prima di creare profilo
- ✅ Impedisce creazione di profili duplicati

### Validazioni su Courses
- ✅ Codice corso univoco
- ✅ Controllo stato attivo
- ✅ Numero massimo studenti (maxStudents) default 30
- ✅ Validazione crediti

### Validazioni su Course Lessons (1:N)
- ✅ Verifica esistenza corso
- ✅ Verifica che il corso sia attivo
- ✅ Validazione tipo lezione (video, text, quiz, assignment)
- ✅ Ordinamento tramite orderIndex
- ✅ Campo videoUrl richiesto per tipo "video"
- ✅ Campo content richiesto per tipi "text", "quiz", "assignment"

### Validazioni su Enrollments (M:N)
- ✅ Prevenzione iscrizioni duplicate (stesso utente + stesso corso)
- ✅ Controllo numero massimo studenti per corso
- ✅ Verifica esistenza e stato attivo di utente e corso
- ✅ Validazione stato iscrizione (pending, active, completed, cancelled)
- ✅ Validazione voto (grade): valore tra 0 e 100
- ✅ Validazione formato data (enrollmentDate)

## 🔧 Tecnologie Utilizzate

- **NestJS** (v10.x) - Framework progressivo per Node.js
- **TypeORM** (v0.3.x) - ORM per TypeScript e JavaScript con supporto transazioni
- **MySQL** (v8.0) - Database relazionale in Docker
- **Docker & Docker Compose** - Containerizzazione e gestione servizi
- **class-validator** - Validazione automatica DTO con decoratori
- **class-transformer** - Trasformazione e serializzazione dati
- **@nestjs/config** - Gestione variabili d'ambiente e configurazione
- **TypeScript** (v5.x) - Tipizzazione statica e sviluppo type-safe

## 📚 Note Importanti

### 🚨 Sicurezza e Produzione
- ⚠️ **`synchronize: true`** è attivo SOLO per sviluppo - **In produzione usa TypeORM migrations!**
- ⚠️ Le credenziali nel file `.env` sono SOLO per sviluppo locale
- ⚠️ In produzione: usa variabili d'ambiente sicure e gestione secrets (es. AWS Secrets Manager, HashiCorp Vault)
- ⚠️ Le password sono attualmente in chiaro - **implementa hashing con bcrypt in produzione!**
- ⚠️ CORS è abilitato per tutti gli origin - **restrivi in produzione!**

### 🗃️ Relazioni Database
- **1:1 (User ↔ UserProfile)**: Implementata con campo UNIQUE su `userId` in `user_profiles`
  - Garantisce che ogni utente abbia esattamente un profilo
  - Separazione netta tra credenziali (users) e dati personali (profiles)
- **1:N (Course → CourseLessons)**: Un corso può avere infinite lezioni
  - Ordinamento tramite `orderIndex`
  - Cascade delete: eliminando un corso, si eliminano tutte le sue lezioni
- **M:N (User ↔ Course)**: Gestita tramite tabella `enrollments` con dati aggiuntivi
  - Supporta informazioni extra: status, grade, enrollmentDate
  - Controllo automatico posti disponibili (maxStudents)

### 🔐 Transazioni Database
- ✅ Tutte le operazioni critiche sono wrappate in transazioni
- ✅ Rollback automatico in caso di errore
- ✅ Atomicità garantita per:
  - Creazione iscrizioni (verifica utente, corso, posti disponibili)
  - Bulk enrollment (tutte le iscrizioni o nessuna)
  - Aggiornamenti e cancellazioni
- ✅ Isolamento e consistenza dei dati garantiti

### ✅ Validazioni e Caricamento Relazioni
- **Validazioni automatiche**: Tutti gli endpoint validati tramite `class-validator`
  - Formato email, lunghezza stringhe, valori numerici
  - Date valide, enum per stati e tipi
  - Validazioni custom per business logic (duplicati, limiti)
- **Caricamento eager delle relazioni**:
  - `GET /users/:id` → carica automaticamente `profile` e `enrollments`
  - `GET /courses/:id` → carica automaticamente `lessons` e `enrollments`
  - `GET /enrollments` → carica automaticamente `user` e `course`
- **Integrità referenziale**: Garantita tramite foreign keys e vincoli database
- **CORS**: Abilitato globalmente (da restringere in produzione)

### Testare le Relazioni

#### Verifica Relazione 1:1 (User ↔ UserProfile)
```bash
# 1. Crea un utente
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "pass123"}'

# 2. Crea il profilo (relazione 1:1 - userId UNIQUE)
curl -X POST http://localhost:3000/user-profiles \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "firstName": "Test", "lastName": "User", "dateOfBirth": "1990-01-01"}'

# 3. Verifica la relazione (includerà automaticamente il profile)
curl http://localhost:3000/users/1
```

#### Verifica Relazione 1:N (Course → Lessons)
```bash
# 1. Crea un corso
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Course", "code": "TEST01", "description": "Test", "credits": 5}'

# 2. Aggiungi lezioni (relazione 1:N - courseId NOT unique)
curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "title": "Lezione 1", "description": "Test", "type": "text", "content": "Content", "orderIndex": 1}'

curl -X POST http://localhost:3000/course-lessons \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "title": "Lezione 2", "description": "Test", "type": "text", "content": "Content", "orderIndex": 2}'

# 3. Verifica la relazione (includerà automaticamente tutte le lessons)
curl http://localhost:3000/courses/1
```

#### Verifica Relazione M:N (User ↔ Course via Enrollments)
```bash
# 1. Iscrivi l'utente al corso (relazione M:N tramite enrollments)
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "courseId": 1, "status": "active", "enrollmentDate": "2025-12-27"}'

# 2. Verifica dal lato utente (includerà enrollments con i corsi)
curl http://localhost:3000/users/1

# 3. Verifica dal lato corso (includerà enrollments con gli utenti)
curl http://localhost:3000/courses/1

# 4. Iscrivi lo stesso utente a un altro corso (M:N permette multiple iscrizioni)
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -d '{"name": "Advanced Course", "code": "TEST02", "description": "Advanced", "credits": 8}'

curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "courseId": 2, "status": "active", "enrollmentDate": "2025-12-27"}'
```

### File di Riferimento
- Consulta [RELAZIONI.md](RELAZIONI.md) per esempi dettagliati di tutte le relazioni
- Usa [relazioni-examples.http](relazioni-examples.http) per testare gli endpoint con REST Client

## 🐳 Docker

Il progetto include Docker Compose per MySQL:

```bash
# Avvia MySQL
docker-compose up -d

# Ferma MySQL
docker-compose down

# Ferma MySQL e rimuovi i volumi (reset completo)
docker-compose down -v
```

**Porta MySQL**: 3307 (per evitare conflitti con installazioni locali)

## 📖 Documentazione Aggiuntiva

- **[RELAZIONI.md](RELAZIONI.md)** - Guida completa alle relazioni 1:1, 1:N e M:N con esempi HTTP
- **[relazioni-examples.http](relazioni-examples.http)** - File REST Client con tutti gli esempi testabili

## 🚀 Prossimi Passi e Miglioramenti Futuri

### Autenticazione e Autorizzazione
- [ ] Implementare JWT authentication
- [ ] Sistema di ruoli (admin, teacher, student)
- [ ] Proteggere gli endpoint con Guards
- [ ] Implementare password hashing con bcrypt

### Funzionalità Aggiuntive
- [ ] Sistema di notifiche per nuove iscrizioni
- [ ] Dashboard per statistiche corsi e studenti
- [ ] Sistema di review/rating per i corsi
- [ ] Progress tracking per studenti (% corso completato)
- [ ] Certificati di completamento corso

### Performance e Scalabilità
- [ ] Implementare caching con Redis
- [ ] Paginazione per le liste
- [ ] Ottimizzazione query con indices database
- [ ] Rate limiting per API

### Database
- [ ] Migrare a TypeORM migrations (invece di synchronize)
- [ ] Soft delete per user e courses
- [ ] Audit logs per tracking modifiche

### Testing
- [ ] Unit tests per services
- [ ] E2E tests per endpoints
- [ ] Integration tests per database

### DevOps
- [ ] CI/CD pipeline
- [ ] Containerizzazione completa (app + db)
- [ ] Health checks e monitoring
- [ ] Logging strutturato

## 🐛 Troubleshooting

### Problema: MySQL non si avvia
**Soluzione:**
```bash
# Ferma e rimuovi i container
docker-compose down -v

# Riavvia
docker-compose up -d

# Verifica lo stato
docker-compose ps
```

### Problema: Errore di connessione al database
**Soluzione:**
```bash
# Verifica che MySQL sia in esecuzione
docker ps

# Controlla i log di MySQL
docker-compose logs mysql

# Verifica le variabili d'ambiente nel .env
cat .env
```

### Problema: Porta 3307 già in uso
**Soluzione:**
```bash
# Cambia la porta in docker-compose.yml
# Modifica "3307:3306" in "3308:3306"
# Aggiorna DB_PORT nel file .env
```

### Problema: Validazione fallisce sempre
**Soluzione:**
- Controlla che i campi obbligatori siano tutti presenti
- Verifica il formato dei dati (date, email, enum)
- Leggi attentamente il messaggio di errore HTTP

## 🤝 Contributi

Sentiti libero di contribuire a questo progetto! Pull requests sono benvenute.

### Come Contribuire
1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

MIT - Sentiti libero di usare questo progetto per scopi educativi e commerciali.

## 👨‍💻 Autore

Progetto educativo per dimostrare l'implementazione di relazioni database con NestJS e TypeORM.

---

**⭐ Se questo progetto ti è stato utile, considera di lasciare una stella su GitHub!**
