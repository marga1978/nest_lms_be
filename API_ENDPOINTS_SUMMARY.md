# 🚀 Riepilogo API Endpoints - LMS Backend

Guida rapida a tutti gli endpoints disponibili nel sistema.

---

## 📚 Enrollments (Iscrizioni)

| Metodo | Endpoint | Descrizione | Dettagli |
|--------|----------|-------------|----------|
| **GET** | `/enrollments` | Tutte le iscrizioni | Lista piatta con user e course |
| **GET** | `/enrollments/groupinguser` | 🆕 Iscrizioni raggruppate per utente | Vista aggregata con array corsi |
| **GET** | `/enrollments/user/:userId` | Iscrizioni di un utente | Filtra per userId |
| **GET** | `/enrollments/course/:courseId` | Iscrizioni di un corso | Filtra per courseId |
| **GET** | `/enrollments/:id` | Dettaglio iscrizione | Include user e course completi |
| **POST** | `/enrollments` | Crea iscrizione | Iscrive utente a corso |
| **POST** | `/enrollments/bulk` | Iscrizione multipla | Iscrive utente a più corsi |
| **PATCH** | `/enrollments/:id` | Aggiorna iscrizione | Cambia status o grade |
| **DELETE** | `/enrollments/:id` | Elimina iscrizione | Rimuove iscrizione |

### 🆕 Nuovo: GET /enrollments/groupinguser

**Cosa fa:**
Restituisce tutti gli utenti con i loro corsi aggregati in un array JSON.

**Esempio risposta:**
```json
[
  {
    "users_id": 1,
    "users_username": "mariorossi",
    "users_email": "mario@example.com",
    "corsi": [
      { "name": "JavaScript", "code": "JS301", "maxStudents": 30 },
      { "name": "TypeScript", "code": "TS101", "maxStudents": 25 }
    ]
  }
]
```

**Quando usarlo:**
- Dashboard admin con report
- Statistiche iscrizioni
- Export dati aggregati

📖 **Guida completa:** [ENROLLMENTS_API_GUIDE.md](./ENROLLMENTS_API_GUIDE.md)

---

## 👥 Users

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| **GET** | `/users` | Tutti gli utenti |
| **GET** | `/users/:id` | Dettaglio utente |
| **POST** | `/users` | Crea utente |
| **PATCH** | `/users/:id` | Aggiorna utente |
| **DELETE** | `/users/:id` | Elimina utente |

---

## 📖 Courses

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| **GET** | `/courses` | Tutti i corsi |
| **GET** | `/courses/:id` | Dettaglio corso |
| **POST** | `/courses` | Crea corso |
| **PUT** | `/courses/:id` | Aggiorna corso |
| **DELETE** | `/courses/:id` | Elimina corso |

---

## 👤 User Profiles

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| **GET** | `/user-profiles` | Tutti i profili |
| **GET** | `/user-profiles/:id` | Dettaglio profilo |
| **GET** | `/user-profiles/user/:userId` | Profilo di un utente |
| **POST** | `/user-profiles` | Crea profilo |
| **PATCH** | `/user-profiles/:id` | Aggiorna profilo |
| **DELETE** | `/user-profiles/:id` | Elimina profilo |

---

## 📝 Course Lessons

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| **GET** | `/course-lessons` | Tutte le lezioni |
| **GET** | `/course-lessons/:id` | Dettaglio lezione |
| **GET** | `/course-lessons/course/:courseId` | Lezioni di un corso |
| **POST** | `/course-lessons` | Crea lezione |
| **PATCH** | `/course-lessons/:id` | Aggiorna lezione |
| **DELETE** | `/course-lessons/:id` | Elimina lezione |

---

## 🔐 Roles (Sistema Autorizzazione)

| Metodo | Endpoint | Descrizione | Permesso Richiesto |
|--------|----------|-------------|--------------------|
| **GET** | `/roles` | Tutti i ruoli | - |
| **GET** | `/roles/:id` | Dettaglio ruolo | - |
| **GET** | `/roles/name/:name` | Ruolo per nome | - |
| **POST** | `/roles` | Crea ruolo | `manage_roles` |
| **PUT** | `/roles/:id` | Aggiorna ruolo | `manage_roles` |
| **DELETE** | `/roles/:id` | Elimina ruolo | `manage_roles` |
| **POST** | `/roles/assign` | Assegna ruolo a utente | `manage_users` |
| **DELETE** | `/roles/user/:userId/role/:roleId` | Rimuovi ruolo | `manage_users` |
| **GET** | `/roles/user/:userId` | Ruoli di un utente | - |
| **GET** | `/roles/user/:userId/permissions` | Permessi di un utente | - |

### Ruoli per Corso

| Metodo | Endpoint | Descrizione | Permesso |
|--------|----------|-------------|----------|
| **POST** | `/roles/course/assign` | Assegna ruolo per corso | `enroll_students` |
| **DELETE** | `/roles/course/:courseId/user/:userId/role/:roleId` | Rimuovi ruolo corso | `enroll_students` |
| **GET** | `/roles/course/:courseId/user/:userId` | Ruoli utente in corso | - |
| **GET** | `/roles/course/:courseId/user/:userId/permissions` | Permessi in corso | - |

📖 **Guida completa:** [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md)

---

## 🔑 Permissions

| Metodo | Endpoint | Descrizione | Permesso Richiesto |
|--------|----------|-------------|--------------------|
| **GET** | `/permissions` | Tutti i permessi | - |
| **GET** | `/permissions/category/:category` | Permessi per categoria | - |
| **GET** | `/permissions/:id` | Dettaglio permesso | - |
| **GET** | `/permissions/name/:name` | Permesso per nome | - |
| **POST** | `/permissions` | Crea permesso | `manage_roles` |
| **PUT** | `/permissions/:id` | Aggiorna permesso | `manage_roles` |
| **DELETE** | `/permissions/:id` | Elimina permesso | `manage_roles` |

---

## 📊 Swagger Documentation

Accedi alla documentazione interattiva Swagger UI:

```
http://localhost:3000/api
```

Qui puoi:
- 📖 Vedere tutti gli endpoints con esempi
- 🧪 Testare le API direttamente dal browser
- 📝 Vedere schemi request/response
- 🔍 Filtrare per tag (users, courses, enrollments, etc.)

---

## 🎯 Quick Start Examples

### Iscrivere un utente a un corso

```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "courseId": 5,
    "status": "pending"
  }'
```

### Vedere tutti i corsi di uno studente

```bash
curl http://localhost:3000/enrollments/user/1
```

### Report iscrizioni aggregate

```bash
curl http://localhost:3000/enrollments/groupinguser
```

### Assegnare ruolo "student" a un utente

```bash
curl -X POST http://localhost:3000/roles/assign \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 10,
    "roleId": 6
  }'
```

### Vedere permessi di un utente

```bash
curl http://localhost:3000/roles/user/10/permissions
```

---

## 📚 Guide Dettagliate

| Guida | Descrizione |
|-------|-------------|
| [ENROLLMENTS_API_GUIDE.md](./ENROLLMENTS_API_GUIDE.md) | Guida completa API Enrollments |
| [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md) | Sistema ruoli e permessi |
| [COME_FUNZIONA.md](./COME_FUNZIONA.md) | Come funziona il sistema autorizzazione |
| [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md) | Esempi integrazione guards |
| [FEATURE_USER_ROLE_PERMISSION.md](./FEATURE_USER_ROLE_PERMISSION.md) | README del branch |

---

## 🔐 Sistema di Protezione

Usa decoratori e guards per proteggere gli endpoints:

```typescript
@Controller('courses')
export class CoursesController {

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('create_courses')
  async createCourse(@Body() dto: CreateCourseDto) {
    // Solo utenti con permesso 'create_courses'
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async deleteCourse(@Param('id') id: number) {
    // Solo admin o manager
  }
}
```

### Ruoli Predefiniti

| Ruolo | Level | Descrizione |
|-------|-------|-------------|
| admin | 1 | Accesso completo al sistema |
| manager | 2 | Supervisiona corsi e docenti |
| teacher | 3 | Crea e gestisce corsi |
| content_creator | 4 | Crea contenuti didattici |
| tutor | 5 | Assiste studenti |
| student | 6 | Fruisce dei corsi |
| guest | 7 | Accesso limitato in sola lettura |

### Permessi per Categoria

- **users**: `manage_users`, `view_users`, `edit_own_profile`
- **courses**: `create_courses`, `edit_courses`, `delete_courses`, `view_all_courses`, `enroll_students`
- **content**: `create_content`, `edit_content`, `delete_content`, `upload_files`
- **assessments**: `create_assessments`, `grade_students`, `view_own_grades`, `view_all_grades`
- **reports**: `view_reports`, `export_data`
- **system**: `manage_roles`, `manage_settings`, `view_logs`

---

## 🚀 Setup e Testing

### Avvia il server

```bash
npm run start:dev
```

### Popola ruoli e permessi

```bash
npm run seed
```

### Testa le API

```bash
# Con cURL
curl http://localhost:3000/enrollments

# Con httpie
http GET http://localhost:3000/enrollments

# Con Swagger UI
http://localhost:3000/api
```

---

## 📝 Note

- Tutti gli endpoints sono documentati in Swagger
- Le transazioni garantiscono consistenza dei dati
- I guards proteggono gli endpoints sensibili
- Gli esempi Swagger mostrano request/response reali

**Ultima modifica:** 2026-01-04
**Branch:** feature/user_role_permission
