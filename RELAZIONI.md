# Gestione delle Relazioni nel Sistema

Questo documento fornisce una guida completa e dettagliata su come utilizzare le relazioni database implementate nel sistema.

## 🏗️ Architettura Ibrida: MySQL + MongoDB

Il sistema utilizza un'**architettura ibrida** con due database:

### MySQL (TypeORM) - Dati Relazionali
- **User** ↔ **UserProfile** (1:1)
- **Course** → **CourseLessons** (1:N)
- **User** ↔ **Course** tramite **Enrollments** (M:N)

### MongoDB (Mongoose) - Dati Non-Relazionali
- **UserPreferences** - Preferenze utente (UI, apprendimento, accessibilità)
- Collegato a MySQL tramite `user_id` (riferimento a `users.id`)
- Schema flessibile, senza relazioni rigide

## 📖 Indice
- [Workflow Completo: Come Creare un Corso](#-workflow-completo-come-creare-un-corso)
- [Relazione 1:1 - User ↔ UserProfile (MySQL)](#relazione-11---user--userprofile-mysql)
- [Relazione 1:N - Course → CourseLessons (MySQL)](#relazione-1n---course--courselessons-mysql)
- [Relazione M:N - User ↔ Course tramite Enrollments (MySQL)](#relazione-mn---user--course-tramite-enrollments-mysql)
- [User Preferences (MongoDB)](#user-preferences-mongodb)
- [Tipi di Lezione](#tipi-di-lezione)
- [Endpoints Completi](#endpoints-completi)
- [Validazioni e Controlli](#validazioni-e-controlli)

## 📚 Workflow Completo: Come Creare un Corso

### Step 1: Creare il Corso
```http
POST http://localhost:3000/courses
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

Risposta:
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

### Step 2: Aggiungere Lezioni al Corso
```http
POST http://localhost:3000/course-lessons
Content-Type: application/json

{
  "courseId": 1,
  "title": "Introduzione al JavaScript",
  "description": "Una panoramica sui concetti base",
  "type": "video",
  "videoUrl": "https://example.com/video1.mp4",
  "orderIndex": 1,
  "durationMinutes": 45
}
```

Risposta:
```json
{
  "id": 1,
  "courseId": 1,
  "title": "Introduzione al JavaScript",
  "description": "Una panoramica sui concetti base",
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

### Step 3: Iscrivere Studenti al Corso
```http
POST http://localhost:3000/enrollments
Content-Type: application/json

{
  "userId": 1,
  "courseId": 1,
  "status": "active",
  "enrollmentDate": "2025-12-27"
}
```

Risposta:
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

### Step 4: Visualizzare il Corso Completo
```http
GET http://localhost:3000/courses/1
```

Risposta:
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
  "updatedAt": "2025-12-27T18:17:09.722Z",
  "lessons": [
    {
      "id": 1,
      "courseId": 1,
      "title": "Introduzione al JavaScript",
      "description": "Una panoramica sui concetti base",
      "type": "video",
      "content": null,
      "videoUrl": "https://example.com/video1.mp4",
      "orderIndex": 1,
      "durationMinutes": 45,
      "isActive": true,
      "createdAt": "2025-12-27T18:17:15.000Z",
      "updatedAt": "2025-12-27T18:17:15.000Z"
    }
  ],
  "enrollments": [
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
        "isActive": true
      }
    }
  ]
}
```

---

## Relazione 1:1 - User ↔ UserProfile

### Caratteristiche
- Un utente ha **UN SOLO** profilo
- Il campo `userId` in `user_profiles` è **UNIQUE**
- Non è possibile creare due profili per lo stesso utente
- **Separazione dati**:
  - **User**: solo credenziali (email, username, password, isActive)
  - **UserProfile**: solo dati personali (firstName, lastName, dateOfBirth, bio, avatar, ecc.)

### Esempi di Utilizzo

#### 1. Creare un Utente
```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "email": "mario.rossi@example.com",
  "username": "mrossi",
  "password": "password123",
  "isActive": true
}
```

Risposta:
```json
{
  "email": "mario.rossi@example.com",
  "username": "mrossi",
  "password": "password123",
  "isActive": true,
  "id": 1,
  "createdAt": "2025-12-27T18:16:54.519Z",
  "updatedAt": "2025-12-27T18:16:54.519Z"
}
```

#### 2. Creare un Profilo per l'Utente
```http
POST http://localhost:3000/user-profiles
Content-Type: application/json

{
  "userId": 1,
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+39 333 1234567",
  "bio": "Sviluppatore software appassionato di tecnologia",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

Risposta:
```json
{
  "id": 1,
  "userId": 1,
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+39 333 1234567",
  "bio": "Sviluppatore software appassionato di tecnologia",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-12-27T18:17:04.678Z",
  "updatedAt": "2025-12-27T18:17:04.678Z"
}
```

#### 3. Ottenere Utente con Profilo
```http
GET http://localhost:3000/users/1
```

Risposta:
```json
{
  "id": 1,
  "email": "mario.rossi@example.com",
  "username": "mrossi",
  "password": "password123",
  "isActive": true,
  "createdAt": "2025-12-27T18:16:54.519Z",
  "updatedAt": "2025-12-27T18:16:54.519Z",
  "profile": {
    "id": 1,
    "userId": 1,
    "firstName": "Mario",
    "lastName": "Rossi",
    "dateOfBirth": "1990-05-15",
    "phoneNumber": "+39 333 1234567",
    "bio": "Sviluppatore software appassionato di tecnologia",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2025-12-27T18:17:04.678Z",
    "updatedAt": "2025-12-27T18:17:04.678Z"
  }
}
```

> **Nota**: I dati personali (firstName, lastName, dateOfBirth) sono **solo** nel profilo, non nella tabella users!

#### 4. Aggiornare un Utente (PATCH)
```http
PATCH http://localhost:3000/users/1
Content-Type: application/json

{
  "username": "mario.rossi.dev",
  "isActive": true
}
```

Risposta:
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

#### 5. Eliminare un Utente (DELETE)
```http
DELETE http://localhost:3000/users/1
```

Risposta: **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminando un utente, verranno eliminate **in cascata** anche:
> - Il profilo associato (relazione 1:1)
> - Tutte le iscrizioni ai corsi (relazione M:N)

#### 4. Aggiornare un Profilo (PATCH)
```http
PATCH http://localhost:3000/user-profiles/1
Content-Type: application/json

{
  "bio": "Senior Full Stack Developer specializzato in NestJS",
  "phoneNumber": "+39 333 9999999"
}
```

Risposta:
```json
{
  "id": 1,
  "userId": 1,
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+39 333 9999999",
  "bio": "Senior Full Stack Developer specializzato in NestJS",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-12-27T18:17:04.678Z",
  "updatedAt": "2025-12-27T19:30:00.000Z"
}
```

#### 5. Ottenere Profilo per UserId
```http
GET http://localhost:3000/user-profiles/user/1
```

Risposta:
```json
{
  "id": 1,
  "userId": 1,
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+39 333 9999999",
  "bio": "Senior Full Stack Developer specializzato in NestJS",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-12-27T18:17:04.678Z",
  "updatedAt": "2025-12-27T19:30:00.000Z"
}
```

#### 6. Eliminare un Profilo (DELETE)
```http
DELETE http://localhost:3000/user-profiles/1
```

Risposta: **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare un profilo non elimina l'utente associato, solo i dati personali.

#### 7. Tentativo di Creare Secondo Profilo (ERRORE)
```http
POST http://localhost:3000/user-profiles
Content-Type: application/json

{
  "userId": 1,
  "firstName": "Altro",
  "lastName": "Profilo"
}
```

Risposta (errore):
```json
{
  "statusCode": 409,
  "message": "L'utente con ID 1 ha già un profilo",
  "error": "Conflict"
}
```

---

## Relazione 1:N - Course → CourseLessons

### Caratteristiche
- Un corso ha **MOLTE** lezioni
- Ogni lezione appartiene a **UN SOLO** corso
- Il campo `courseId` NON è unique → infinite lezioni per corso
- Le lezioni sono ordinate tramite `orderIndex`

### Esempi di Utilizzo

#### 0. Creare un Corso (Prima delle Lezioni)
```http
POST http://localhost:3000/courses
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

Risposta:
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

**Campi del corso:**
- `name` *(obbligatorio)* - Nome del corso (max 200 caratteri)
- `description` *(obbligatorio)* - Descrizione dettagliata
- `code` *(obbligatorio)* - Codice univoco del corso (es. "JS101", "MATH202")
- `credits` *(obbligatorio)* - Numero di crediti (valore numerico)
- `maxStudents` *(opzionale)* - Numero massimo di studenti (default: 30)
- `isActive` *(opzionale)* - Stato del corso (default: true)

#### 1. Creare Lezioni per un Corso
```http
POST http://localhost:3000/course-lessons
Content-Type: application/json

{
  "courseId": 1,
  "title": "Introduzione al JavaScript",
  "description": "Una panoramica sui concetti base di JavaScript",
  "type": "video",
  "videoUrl": "https://example.com/video1.mp4",
  "orderIndex": 1,
  "durationMinutes": 45,
  "isActive": true
}
```

Risposta:
```json
{
  "id": 1,
  "courseId": 1,
  "title": "Introduzione al JavaScript",
  "description": "Una panoramica sui concetti base di JavaScript",
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

#### 2. Creare una Seconda Lezione per lo Stesso Corso
> **Nota**: L'API permette di creare **solo una lezione alla volta**. Per aggiungere più lezioni allo stesso corso, è necessario chiamare l'endpoint POST più volte.

```http
POST http://localhost:3000/course-lessons
Content-Type: application/json

{
  "courseId": 1,
  "title": "Variabili e Tipi di Dati",
  "description": "Approfondimento su var, let, const e tipi primitivi",
  "type": "video",
  "videoUrl": "https://example.com/video2.mp4",
  "orderIndex": 2,
  "durationMinutes": 60
}
```

Risposta:
```json
{
  "id": 2,
  "courseId": 1,
  "title": "Variabili e Tipi di Dati",
  "description": "Approfondimento su var, let, const e tipi primitivi",
  "type": "video",
  "content": null,
  "videoUrl": "https://example.com/video2.mp4",
  "orderIndex": 2,
  "durationMinutes": 60,
  "isActive": true,
  "createdAt": "2025-12-27T18:17:18.000Z",
  "updatedAt": "2025-12-27T18:17:18.000Z"
}
```

#### 3. Creare una Terza Lezione (tipo Quiz)
> **Nota**: Puoi continuare ad aggiungere lezioni allo stesso corso chiamando POST ripetutamente con `courseId` uguale.

```http
POST http://localhost:3000/course-lessons
Content-Type: application/json

{
  "courseId": 1,
  "title": "Quiz: Concetti Base",
  "description": "Verifica le tue conoscenze sui concetti base",
  "type": "quiz",
  "content": "{\"questions\": [...]}",
  "orderIndex": 3,
  "durationMinutes": 15
}
```

Risposta:
```json
{
  "id": 3,
  "courseId": 1,
  "title": "Quiz: Concetti Base",
  "description": "Verifica le tue conoscenze sui concetti base",
  "type": "quiz",
  "content": "{\"questions\": [...]}",
  "videoUrl": null,
  "orderIndex": 3,
  "durationMinutes": 15,
  "isActive": true,
  "createdAt": "2025-12-27T18:17:20.000Z",
  "updatedAt": "2025-12-27T18:17:20.000Z"
}
```

#### 4. Ottenere Tutte le Lezioni di un Corso
```http
GET http://localhost:3000/course-lessons/course/1
```

Risposta:
```json
[
  {
    "id": 1,
    "courseId": 1,
    "title": "Introduzione al JavaScript",
    "description": "Una panoramica sui concetti base di JavaScript",
    "type": "video",
    "content": null,
    "videoUrl": "https://example.com/video1.mp4",
    "orderIndex": 1,
    "durationMinutes": 45,
    "isActive": true,
    "createdAt": "2025-12-27T18:00:00.000Z",
    "updatedAt": "2025-12-27T18:00:00.000Z",
    "course": {
      "id": 1,
      "name": "JavaScript Fundamentals",
      "code": "JS101",
      ...
    }
  },
  {
    "id": 2,
    "courseId": 1,
    "title": "Variabili e Tipi di Dati",
    ...
  },
  {
    "id": 3,
    "courseId": 1,
    "title": "Quiz: Concetti Base",
    ...
  }
]
```

#### 5. Ottenere un Corso con Tutte le Sue Lezioni
```http
GET http://localhost:3000/courses/1
```

Risposta:
```json
{
  "id": 1,
  "name": "JavaScript Fundamentals",
  "description": "Corso completo su JavaScript",
  "code": "JS101",
  "credits": 6,
  "maxStudents": 30,
  "isActive": true,
  "createdAt": "2025-12-27T18:00:00.000Z",
  "updatedAt": "2025-12-27T18:00:00.000Z",
  "enrollments": [...],
  "lessons": [
    {
      "id": 1,
      "title": "Introduzione al JavaScript",
      "orderIndex": 1,
      ...
    },
    {
      "id": 2,
      "title": "Variabili e Tipi di Dati",
      "orderIndex": 2,
      ...
    }
  ]
}
```

#### 6. Aggiornare un Corso (PATCH)
```http
PATCH http://localhost:3000/courses/1
Content-Type: application/json

{
  "maxStudents": 40,
  "description": "Corso completo e aggiornato su JavaScript moderno",
  "isActive": true
}
```

Risposta:
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

#### 7. Eliminare un Corso (DELETE)
```http
DELETE http://localhost:3000/courses/1
```

Risposta: **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminando un corso, verranno eliminate **in cascata** anche:
> - Tutte le lezioni del corso (relazione 1:N)
> - Tutte le iscrizioni al corso (relazione M:N)

#### 8. Aggiornare l'Ordine delle Lezioni
```http
PATCH http://localhost:3000/course-lessons/2
Content-Type: application/json

{
  "orderIndex": 5
}
```

Risposta:
```json
{
  "id": 2,
  "courseId": 1,
  "title": "Variabili e Tipi di Dati",
  "description": "Approfondimento su var, let, const e tipi primitivi",
  "type": "video",
  "content": null,
  "videoUrl": "https://example.com/video2.mp4",
  "orderIndex": 5,
  "durationMinutes": 60,
  "isActive": true,
  "createdAt": "2025-12-27T18:17:18.000Z",
  "updatedAt": "2025-12-27T19:30:00.000Z"
}
```

#### 9. Eliminare una Lezione (DELETE)
```http
DELETE http://localhost:3000/course-lessons/3
```

Risposta: **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare una lezione non elimina il corso associato.

---

## Relazione M:N - User ↔ Course (tramite Enrollments)

### Caratteristiche
- Un utente può iscriversi a **MOLTI** corsi
- Un corso può avere **MOLTI** utenti iscritti
- La tabella `enrollments` gestisce la relazione M:N
- Ogni iscrizione ha informazioni aggiuntive (status, data, voto)

### Esempi di Utilizzo

#### 1. Creare un'Iscrizione (User → Course)
```http
POST http://localhost:3000/enrollments
Content-Type: application/json

{
  "userId": 1,
  "courseId": 1,
  "status": "active",
  "enrollmentDate": "2025-12-27"
}
```

Risposta:
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

#### 2. Iscrizione Multipla (Bulk Enrollment), in caso di errore non inserisce neppure un record
```http
POST http://localhost:3000/enrollments/bulk
Content-Type: application/json

{
  "userId": 1,
  "courseIds": [1, 2, 3]
}
```

Risposta:
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "status": "pending",
    "enrollmentDate": "2025-12-27",
    ...
  },
  {
    "id": 2,
    "userId": 1,
    "courseId": 2,
    "status": "pending",
    "enrollmentDate": "2025-12-27",
    ...
  },
  {
    "id": 3,
    "userId": 1,
    "courseId": 3,
    "status": "pending",
    "enrollmentDate": "2025-12-27",
    ...
  }
]
```

#### 3. Ottenere Tutte le Iscrizioni di un Utente
```http
GET http://localhost:3000/enrollments?userId=1
```

Risposta:
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "status": "active",
    "enrollmentDate": "2025-12-27",
    "grade": null,
    "createdAt": "2025-12-27T18:17:21.297Z",
    "updatedAt": "2025-12-27T18:17:21.297Z",
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
]
```

#### 4. Ottenere Tutti gli Iscritti a un Corso
```http
GET http://localhost:3000/enrollments?courseId=1
```

Risposta:
```json
[
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
    }
  }
]
```

#### 5. Aggiornare un'Iscrizione (es. aggiungere voto)
```http
PATCH http://localhost:3000/enrollments/1
Content-Type: application/json

{
  "status": "completed",
  "grade": 95.5
}
```

Risposta:
```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "status": "completed",
  "enrollmentDate": "2025-12-27",
  "grade": 95.5,
  "createdAt": "2025-12-27T18:17:21.297Z",
  "updatedAt": "2025-12-27T19:30:00.000Z",
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

#### 6. Eliminare un'Iscrizione (DELETE)
```http
DELETE http://localhost:3000/enrollments/1
```

Risposta: **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare un'iscrizione non elimina né l'utente né il corso, solo il collegamento tra loro.

#### 7. Stati Possibili delle Iscrizioni
- `pending`: Iscrizione in attesa di conferma
- `active`: Iscrizione attiva
- `completed`: Corso completato
- `cancelled`: Iscrizione annullata

---

## User Preferences (MongoDB)

### Caratteristiche
- **Database**: MongoDB (non MySQL)
- **Collection**: `preferences_user`
- **Collegamento**: Campo `user_id` (string) che fa riferimento a `users.id` di MySQL
- **Schema flessibile**: Preferenze UI, apprendimento e accessibilità
- **Operazioni atomiche**: Utilizzo di `$push`, `$pull`, `$addToSet` per array
- **Timestamps automatici**: `created_at` e `updated_at`

### Schema Documento MongoDB
```javascript
{
  "_id": ObjectId("..."),
  "user_id": "1",  // Riferimento a MySQL users.id
  "ui_settings": {
    "theme": "light",           // light, dark
    "language": "it",           // it, en, fr, es
    "notifications_enabled": true,
    "playback_speed": 1.0       // 0.5, 1.0, 1.5, 2.0
  },
  "learning_preferences": {
    "favorite_topics": ["JavaScript", "TypeScript", "NestJS"],
    "completed_courses": ["1", "2", "5"],
    "bookmarks": [
      {
        "course_id": "1",
        "lesson_id": "3",
        "timestamp": ISODate("2025-12-27T18:30:00.000Z")
      }
    ]
  },
  "accessibility": {
    "subtitles_default": false,
    "high_contrast": false
  },
  "created_at": ISODate("2025-12-27T18:00:00.000Z"),
  "updated_at": ISODate("2025-12-27T18:00:00.000Z")
}
```

### Esempi di Utilizzo

#### 1. Creare Preferenze per un Utente
```http
POST http://localhost:3000/user-preferences
Content-Type: application/json

{
  "user_id": "1",
  "ui_settings": {
    "theme": "dark",
    "language": "it",
    "notifications_enabled": true,
    "playback_speed": 1.0
  },
  "learning_preferences": {
    "favorite_topics": ["JavaScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": {
    "subtitles_default": false,
    "high_contrast": false
  }
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": {
    "theme": "dark",
    "language": "it",
    "notifications_enabled": true,
    "playback_speed": 1.0
  },
  "learning_preferences": {
    "favorite_topics": ["JavaScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": {
    "subtitles_default": false,
    "high_contrast": false
  },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:00:00.000Z"
}
```

#### 2. Ottenere Tutte le Preferenze (MongoDB)
```http
GET http://localhost:3000/user-preferences
```

Risposta:
```json
[
  {
    "_id": "67a5f3c8e9b0d1234567890a",
    "user_id": "1",
    "ui_settings": {
      "theme": "dark",
      "language": "it",
      "notifications_enabled": true,
      "playback_speed": 1.0
    },
    "learning_preferences": {
      "favorite_topics": ["JavaScript"],
      "completed_courses": [],
      "bookmarks": []
    },
    "accessibility": {
      "subtitles_default": false,
      "high_contrast": false
    },
    "created_at": "2025-12-27T18:00:00.000Z",
    "updated_at": "2025-12-27T18:00:00.000Z"
  },
  {
    "_id": "67a5f3c8e9b0d1234567890b",
    "user_id": "2",
    "ui_settings": {
      "theme": "light",
      "language": "en",
      "notifications_enabled": false,
      "playback_speed": 1.5
    },
    "learning_preferences": {
      "favorite_topics": ["Python", "Docker"],
      "completed_courses": ["3"],
      "bookmarks": []
    },
    "accessibility": {
      "subtitles_default": true,
      "high_contrast": false
    },
    "created_at": "2025-12-27T19:00:00.000Z",
    "updated_at": "2025-12-27T19:00:00.000Z"
  }
]
```

#### 3. Ottenere Preferenze di un Utente Specifico
```http
GET http://localhost:3000/user-preferences/1
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": {
    "theme": "dark",
    "language": "it",
    "notifications_enabled": true,
    "playback_speed": 1.0
  },
  "learning_preferences": {
    "favorite_topics": ["JavaScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": {
    "subtitles_default": false,
    "high_contrast": false
  },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:00:00.000Z"
}
```

#### 4. Aggiungere un Bookmark (MongoDB $push)
```http
POST http://localhost:3000/user-preferences/1/bookmarks
Content-Type: application/json

{
  "course_id": "1",
  "lesson_id": "3"
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": {
    "favorite_topics": ["JavaScript"],
    "completed_courses": [],
    "bookmarks": [
      {
        "course_id": "1",
        "lesson_id": "3",
        "timestamp": "2025-12-27T18:30:00.000Z"
      }
    ]
  },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:30:00.000Z"
}
```

#### 5. Rimuovere un Bookmark (MongoDB $pull)
```http
DELETE http://localhost:3000/user-preferences/1/bookmarks/1/3
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": {
    "favorite_topics": ["JavaScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:35:00.000Z"
}
```

#### 6. Aggiungere un Topic Preferito (MongoDB $addToSet - no duplicati)
```http
POST http://localhost:3000/user-preferences/1/favorite-topics
Content-Type: application/json

{
  "topic": "TypeScript"
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": {
    "favorite_topics": ["JavaScript", "TypeScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:40:00.000Z"
}
```

#### 7. Rimuovere un Topic Preferito (MongoDB $pull)
```http
DELETE http://localhost:3000/user-preferences/1/favorite-topics/JavaScript
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": {
    "favorite_topics": ["TypeScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:45:00.000Z"
}
```

#### 8. Marcare un Corso come Completato (MongoDB $addToSet)
```http
POST http://localhost:3000/user-preferences/1/completed-courses
Content-Type: application/json

{
  "course_id": "1"
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": {
    "favorite_topics": ["TypeScript"],
    "completed_courses": ["1"],
    "bookmarks": []
  },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:50:00.000Z"
}
```

#### 9. Rimuovere un Corso Completato (MongoDB $pull)
```http
DELETE http://localhost:3000/user-preferences/1/completed-courses/1
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": {
    "favorite_topics": ["TypeScript"],
    "completed_courses": [],
    "bookmarks": []
  },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T18:55:00.000Z"
}
```

#### 10. Aggiornare UI Settings (PATCH parziale)
```http
PATCH http://localhost:3000/user-preferences/1/ui-settings
Content-Type: application/json

{
  "theme": "light",
  "playback_speed": 1.5
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": {
    "theme": "light",
    "language": "it",
    "notifications_enabled": true,
    "playback_speed": 1.5
  },
  "learning_preferences": { ... },
  "accessibility": { ... },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T19:00:00.000Z"
}
```

#### 11. Aggiornare Accessibility Settings (PATCH parziale)
```http
PATCH http://localhost:3000/user-preferences/1/accessibility
Content-Type: application/json

{
  "subtitles_default": true,
  "high_contrast": true
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": { ... },
  "learning_preferences": { ... },
  "accessibility": {
    "subtitles_default": true,
    "high_contrast": true
  },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T19:05:00.000Z"
}
```

#### 12. Aggiornare Preferenze Complete (PUT)
```http
PUT http://localhost:3000/user-preferences/1
Content-Type: application/json

{
  "ui_settings": {
    "theme": "dark",
    "language": "en",
    "notifications_enabled": false,
    "playback_speed": 2.0
  },
  "learning_preferences": {
    "favorite_topics": ["NestJS", "MongoDB"],
    "completed_courses": ["1", "2"],
    "bookmarks": []
  },
  "accessibility": {
    "subtitles_default": false,
    "high_contrast": false
  }
}
```

Risposta:
```json
{
  "_id": "67a5f3c8e9b0d1234567890a",
  "user_id": "1",
  "ui_settings": {
    "theme": "dark",
    "language": "en",
    "notifications_enabled": false,
    "playback_speed": 2.0
  },
  "learning_preferences": {
    "favorite_topics": ["NestJS", "MongoDB"],
    "completed_courses": ["1", "2"],
    "bookmarks": []
  },
  "accessibility": {
    "subtitles_default": false,
    "high_contrast": false
  },
  "created_at": "2025-12-27T18:00:00.000Z",
  "updated_at": "2025-12-27T19:10:00.000Z"
}
```

#### 13. Eliminare Preferenze di un Utente (DELETE)
```http
DELETE http://localhost:3000/user-preferences/1
```

Risposta: **`204 No Content`** (nessun body nella risposta)

> **Nota**: Eliminare le preferenze MongoDB non elimina l'utente MySQL, solo i suoi dati di preferenza.

### Validazioni e Controlli (MongoDB)

**Validazioni implementate:**
- ✅ Campo `user_id` è **UNIQUE** nella collection MongoDB
- ✅ Prevenzione duplicati: impossibile creare due documenti per lo stesso user_id
- ✅ Validazione temi: solo "light" o "dark"
- ✅ Validazione lingue: "it", "en", "fr", "es"
- ✅ Validazione playback_speed: solo 0.5, 1.0, 1.5, 2.0
- ✅ Operazioni atomiche per array (bookmark, topics, completed courses)
- ✅ Timestamps automatici con `created_at` e `updated_at`

**Errori gestiti:**
- ❌ Tentativo di creare preferenze duplicate → HTTP 409 Conflict
- ❌ User ID non trovato → HTTP 404 Not Found
- ❌ Valori invalidi (theme, language, speed) → HTTP 400 Bad Request
- ❌ Formato bookmark/topic invalido → HTTP 400 Bad Request

### Operazioni MongoDB Atomiche

**$push** - Aggiunge elemento ad array:
```javascript
// Aggiungi bookmark con timestamp automatico
db.preferences_user.updateOne(
  { user_id: "1" },
  { $push: { "learning_preferences.bookmarks": { course_id: "1", lesson_id: "3", timestamp: new Date() } } }
)
```

**$pull** - Rimuove elemento da array:
```javascript
// Rimuovi bookmark specifico
db.preferences_user.updateOne(
  { user_id: "1" },
  { $pull: { "learning_preferences.bookmarks": { course_id: "1", lesson_id: "3" } } }
)
```

**$addToSet** - Aggiunge solo se non esiste (previene duplicati):
```javascript
// Aggiungi topic solo se non già presente
db.preferences_user.updateOne(
  { user_id: "1" },
  { $addToSet: { "learning_preferences.favorite_topics": "TypeScript" } }
)
```

### Collegamento MySQL ↔ MongoDB

**Come funziona il linking:**
1. L'utente viene creato in **MySQL** (`POST /users`) → ottieni `id: 1`
2. Le preferenze vengono create in **MongoDB** (`POST /user-preferences`) con `user_id: "1"`
3. Il campo `user_id` (string) in MongoDB fa riferimento a `users.id` (integer) in MySQL
4. Non c'è foreign key (database diversi), ma il collegamento è logico tramite `user_id`

**Workflow completo:**
```http
# 1. Crea utente in MySQL
POST http://localhost:3000/users
{ "email": "test@example.com", "username": "test", "password": "password" }
# Risposta: { "id": 1, ... }

# 2. Crea preferenze in MongoDB
POST http://localhost:3000/user-preferences
{ "user_id": "1", "ui_settings": {...}, ... }
# Risposta: { "_id": "...", "user_id": "1", ... }

# 3. Recupera preferenze
GET http://localhost:3000/user-preferences/1
```

### Endpoints User Preferences (MongoDB)

- `POST /user-preferences` - Crea preferenze (verifica unicità user_id)
- `GET /user-preferences` - Lista tutte le preferenze
- `GET /user-preferences/:userId` - Preferenze specifiche per user_id
- `PUT /user-preferences/:userId` - Aggiorna preferenze complete
- `DELETE /user-preferences/:userId` - Elimina preferenze

**Gestione Bookmarks:**
- `POST /user-preferences/:userId/bookmarks` - Aggiungi bookmark ($push)
- `DELETE /user-preferences/:userId/bookmarks/:courseId/:lessonId` - Rimuovi bookmark ($pull)

**Gestione Favorite Topics:**
- `POST /user-preferences/:userId/favorite-topics` - Aggiungi topic ($addToSet)
- `DELETE /user-preferences/:userId/favorite-topics/:topic` - Rimuovi topic ($pull)

**Gestione Completed Courses:**
- `POST /user-preferences/:userId/completed-courses` - Marca corso completato ($addToSet)
- `DELETE /user-preferences/:userId/completed-courses/:courseId` - Rimuovi corso completato ($pull)

**Aggiornamenti Parziali:**
- `PATCH /user-preferences/:userId/ui-settings` - Aggiorna solo UI settings
- `PATCH /user-preferences/:userId/accessibility` - Aggiorna solo accessibility

---

## Tipi di Lezione

### Video
```json
{
  "type": "video",
  "videoUrl": "https://example.com/video.mp4",
  "durationMinutes": 45
}
```

### Testo
```json
{
  "type": "text",
  "content": "Contenuto della lezione in formato testo o markdown",
  "durationMinutes": 20
}
```

### Quiz
```json
{
  "type": "quiz",
  "content": "{\"questions\": [...]}",
  "durationMinutes": 15
}
```

### Assignment
```json
{
  "type": "assignment",
  "content": "Descrizione dell'esercizio da completare",
  "durationMinutes": 120
}
```

---

## Endpoints Completi

### Users
- `POST /users` - Crea utente
- `GET /users` - Lista tutti gli utenti (con profili)
- `GET /users/:id` - Dettaglio utente (con profilo)
- `PATCH /users/:id` - Aggiorna utente
- `DELETE /users/:id` - Elimina utente

### User Profiles
- `POST /user-profiles` - Crea profilo (verifica unicità userId)
- `GET /user-profiles` - Lista tutti i profili
- `GET /user-profiles/:id` - Dettaglio profilo
- `GET /user-profiles/user/:userId` - Profilo per userId
- `PATCH /user-profiles/:id` - Aggiorna profilo
- `DELETE /user-profiles/:id` - Elimina profilo

### Courses
- `POST /courses` - Crea corso
- `GET /courses` - Lista tutti i corsi (con enrollments e lessons)
- `GET /courses/:id` - Dettaglio corso (con enrollments e lessons)
- `PATCH /courses/:id` - Aggiorna corso
- `DELETE /courses/:id` - Elimina corso

### Course Lessons
- `POST /course-lessons` - Crea lezione
- `GET /course-lessons` - Lista tutte le lezioni (ordinate)
- `GET /course-lessons/:id` - Dettaglio lezione
- `GET /course-lessons/course/:courseId` - Tutte le lezioni di un corso
- `PATCH /course-lessons/:id` - Aggiorna lezione
- `DELETE /course-lessons/:id` - Elimina lezione

### Enrollments
- `POST /enrollments` - Crea iscrizione singola
- `POST /enrollments/bulk` - Iscrizione multipla (un utente a più corsi)
- `GET /enrollments` - Lista tutte le iscrizioni
- `GET /enrollments?userId=X` - Iscrizioni filtrate per utente
- `GET /enrollments?courseId=X` - Iscrizioni filtrate per corso
- `GET /enrollments/:id` - Dettaglio iscrizione
- `PATCH /enrollments/:id` - Aggiorna iscrizione (status, grade)
- `DELETE /enrollments/:id` - Elimina iscrizione

### User Preferences (MongoDB)
- `POST /user-preferences` - Crea preferenze utente (MongoDB)
- `GET /user-preferences` - Lista tutte le preferenze (MongoDB)
- `GET /user-preferences/:userId` - Preferenze specifiche utente (MongoDB)
- `PUT /user-preferences/:userId` - Aggiorna preferenze complete (MongoDB)
- `DELETE /user-preferences/:userId` - Elimina preferenze (MongoDB)
- `POST /user-preferences/:userId/bookmarks` - Aggiungi bookmark (MongoDB $push)
- `DELETE /user-preferences/:userId/bookmarks/:courseId/:lessonId` - Rimuovi bookmark (MongoDB $pull)
- `POST /user-preferences/:userId/favorite-topics` - Aggiungi topic preferito (MongoDB $addToSet)
- `DELETE /user-preferences/:userId/favorite-topics/:topic` - Rimuovi topic preferito (MongoDB $pull)
- `POST /user-preferences/:userId/completed-courses` - Marca corso completato (MongoDB $addToSet)
- `DELETE /user-preferences/:userId/completed-courses/:courseId` - Rimuovi corso completato (MongoDB $pull)
- `PATCH /user-preferences/:userId/ui-settings` - Aggiorna UI settings (MongoDB)
- `PATCH /user-preferences/:userId/accessibility` - Aggiorna accessibility (MongoDB)

---

## Validazioni e Controlli

### 🔒 User Profiles (1:1)
**Validazioni implementate:**
- ✅ Verifica esistenza utente prima di creare il profilo
- ✅ Impedisce creazione di profili duplicati per lo stesso utente
- ✅ Campo `userId` è **UNIQUE** nel database → garantisce relazione 1:1
- ✅ Cascading delete: eliminando un utente, viene eliminato automaticamente il profilo
- ✅ Validazione formato data (dateOfBirth deve essere valida)
- ✅ Validazione campi opzionali (phoneNumber, bio, avatarUrl)

**Errori gestiti:**
- ❌ Tentativo di creare secondo profilo → HTTP 409 Conflict
- ❌ Utente inesistente → HTTP 404 Not Found
- ❌ Data di nascita invalida → HTTP 400 Bad Request

### 📚 Course Lessons (1:N)
**Validazioni implementate:**
- ✅ Verifica esistenza corso prima di creare la lezione
- ✅ Verifica che il corso sia attivo (`isActive: true`)
- ✅ Campo `courseId` NON è unique → permette infinite lezioni per corso
- ✅ Ordinamento automatico tramite `orderIndex`
- ✅ Validazione tipo lezione: `video`, `text`, `quiz`, `assignment`
- ✅ Validazione campi richiesti per tipo:
  - `video` → richiede `videoUrl`
  - `text`/`quiz`/`assignment` → richiede `content`
- ✅ Filtro per corso specifico disponibile
- ✅ Cascade delete: eliminando un corso, si eliminano tutte le sue lezioni

**Errori gestiti:**
- ❌ Corso inesistente → HTTP 404 Not Found
- ❌ Corso non attivo → HTTP 400 Bad Request
- ❌ Tipo lezione invalido → HTTP 400 Bad Request
- ❌ Campo richiesto mancante (es. videoUrl per tipo video) → HTTP 400 Bad Request

### 🎓 Enrollments (M:N)
**Validazioni implementate:**
- ✅ Verifica esistenza e stato attivo dell'utente
- ✅ Verifica esistenza e stato attivo del corso
- ✅ Prevenzione iscrizioni duplicate (stesso utente + stesso corso)
- ✅ Controllo posti disponibili (numero iscritti < maxStudents)
- ✅ **Transazioni database** per atomicità delle operazioni
- ✅ Validazione stato iscrizione: `pending`, `active`, `completed`, `cancelled`
- ✅ Validazione voto (grade): deve essere tra 0 e 100
- ✅ Validazione formato data (enrollmentDate)
- ✅ Bulk enrollment: iscrizione multipla in una singola transazione atomica
- ✅ Filtri query: per utente (`?userId=X`) e per corso (`?courseId=X`)

**Errori gestiti:**
- ❌ Utente inesistente o non attivo → HTTP 400 Bad Request
- ❌ Corso inesistente o non attivo → HTTP 400 Bad Request
- ❌ Utente già iscritto al corso → HTTP 409 Conflict
- ❌ Corso pieno (maxStudents raggiunto) → HTTP 400 Bad Request
- ❌ Stato iscrizione invalido → HTTP 400 Bad Request
- ❌ Voto fuori range (< 0 o > 100) → HTTP 400 Bad Request
- ❌ Data invalida → HTTP 400 Bad Request

### 🔐 Transazioni e Integrità
**Operazioni transazionali:**
1. **Creazione iscrizione** (`POST /enrollments`):
   - Verifica utente attivo
   - Verifica corso attivo
   - Controlla duplicati
   - Verifica posti disponibili
   - Crea iscrizione
   - Rollback automatico se qualsiasi controllo fallisce

2. **Bulk enrollment** (`POST /enrollments/bulk`):
   - Tutte le iscrizioni in un'unica transazione
   - Se una fallisce, rollback completo (tutto o niente)
   - Garantisce atomicità

3. **Aggiornamento/Cancellazione**:
   - Wrapped in transazioni
   - Consistenza garantita

**Integrità referenziale:**
- Foreign keys su tutte le relazioni
- Cascade delete configurato dove appropriato
- Vincoli UNIQUE per relazioni 1:1

---

## 💡 Best Practices e Suggerimenti

### 📝 Creazione Dati
1. **Ordine corretto**:
   - Prima crea gli utenti (`POST /users`)
   - Poi crea i profili utente (`POST /user-profiles`)
   - Crea i corsi (`POST /courses`)
   - Aggiungi lezioni ai corsi (`POST /course-lessons`)
   - Infine, iscrivi gli utenti (`POST /enrollments`)

2. **Codici univoci**:
   - Usa codici corso significativi (es. "CS101", "MATH202", "ENG301")
   - Mantieni una convenzione di naming consistente

3. **Ordinamento lezioni**:
   - Usa `orderIndex` incrementali: 1, 2, 3, 4...
   - Lascia spazio tra i numeri (10, 20, 30...) per inserimenti futuri

### 🔍 Gestione Errori
1. **Controlla sempre lo status code della risposta**:
   - `200/201` = Successo
   - `400` = Bad Request (validazione fallita)
   - `404` = Risorsa non trovata
   - `409` = Conflict (duplicato)

2. **Leggi i messaggi di errore**: contengono informazioni utili per il debug

### 🎯 Performance
1. **Caricamento relazioni**:
   - Le relazioni sono caricate automaticamente negli endpoint GET
   - Usa filtri query per ridurre il carico (`?userId=X`, `?courseId=X`)

2. **Bulk operations**:
   - Usa `POST /enrollments/bulk` per iscrivere un utente a più corsi in una volta
   - Molto più efficiente di chiamate multiple

### 🔐 Sicurezza (Per Produzione)
1. **Password**: Implementa hashing con bcrypt
2. **Validazione input**: Già implementata con class-validator
3. **Rate limiting**: Considera l'aggiunta per prevenire abusi
4. **Authentication**: Implementa JWT o sessioni
5. **Authorization**: Aggiungi controlli basati sui ruoli

### 📊 Monitoring
1. Monitora il numero di iscrizioni per corso (vs maxStudents)
2. Tieni traccia degli stati delle iscrizioni
3. Analizza i voti (grade) per statistiche

---

## 🔗 Link Utili

- **File di test MySQL**: [relazioni-examples.http](relazioni-examples.http) - Contiene tutti gli esempi HTTP testabili con REST Client per MySQL
- **File di test MongoDB**: [user-preferences-examples.http](user-preferences-examples.http) - Contiene tutti gli esempi HTTP testabili per User Preferences MongoDB
- **README principale**: [README.md](README.md) - Documentazione completa del progetto
- **Docker Compose**: Configurazione database MySQL + MongoDB già pronta

---

## 📞 Supporto

Per problemi o domande:
1. Controlla i messaggi di errore HTTP
2. Verifica che Docker e MySQL siano in esecuzione
3. Consulta la documentazione nel README.md
4. Usa il file `relazioni-examples.http` per testare gli endpoint
