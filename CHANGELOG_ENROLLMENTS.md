# 📝 Changelog - Enrollments Module

Documentazione degli aggiornamenti al modulo Enrollments.

---

## 🆕 Nuovo Endpoint: `findByUsers()` - 2026-01-04

### Cosa è stato aggiunto

✅ Nuovo endpoint **GET `/enrollments/groupinguser`**
✅ Metodo `findByUsers()` nel service
✅ Query SQL aggregata con `JSON_ARRAYAGG`
✅ Documentazione Swagger completa
✅ Esempi nella guida API

---

## Dettagli Tecnici

### File Modificati

#### 1. `src/modules/enrollments/enrollments.service.ts`

**Aggiunto metodo (righe 124-150):**

```typescript
async findByUsers(): Promise<Enrollment[]> {
  return this.enrollmentsRepository
    .createQueryBuilder('enrollments')
    .select([
      'users.id',
      'users.username',
      'users.email',
    ])
    .addSelect(
      `JSON_ARRAYAGG(
        JSON_OBJECT(
          'name', courses.name,
          'description', courses.description,
          'code', courses.code,
          'maxStudents', courses.maxStudents,
          'isActive', courses.isActive
        )
      )`,
      'corsi'
    )
    .innerJoin('enrollments.user', 'users')
    .innerJoin('enrollments.course', 'courses')
    .groupBy('users.id')
    .addGroupBy('users.username')
    .addGroupBy('users.email')
    .getRawMany();
}
```

**Caratteristiche:**
- Usa TypeORM QueryBuilder
- Aggregazione SQL nativa con `JSON_ARRAYAGG`
- GROUP BY su utente
- INNER JOIN con users e courses
- Ritorna dati "raw" (non entità TypeORM)

---

#### 2. `src/modules/enrollments/enrollments.controller.ts`

**Aggiunto endpoint (righe 59-80):**

```typescript
@Get('groupinguser')
@ApiOperation({
  summary: 'Ottieni tutte le iscrizioni raggruppate per utente',
  description: `Restituisce una vista aggregata delle iscrizioni...`
})
@ApiResponse({
  status: 200,
  description: 'Lista degli utenti con i loro corsi raggruppati',
  schema: { example: SwaggerExamples.enrollments.findByUsers }
})
findByUsers() {
  return this.enrollmentsService.findByUsers();
}
```

**Documentazione Swagger:**
- Summary chiaro
- Descrizione dettagliata con casi d'uso
- Response example completo

---

#### 3. `src/swagger-examples.ts`

**Aggiunto esempio (righe 321-358):**

```typescript
findByUsers: [
  {
    users_id: 1,
    users_username: 'mariorossi',
    users_email: 'mario.rossi@example.com',
    corsi: [
      {
        name: 'JavaScript Avanzato',
        description: 'Corso completo di JavaScript ES6+',
        code: 'JS301',
        maxStudents: 30,
        isActive: true
      },
      {
        name: 'TypeScript Fundamentals',
        description: 'Introduzione a TypeScript',
        code: 'TS101',
        maxStudents: 25,
        isActive: true
      }
    ]
  },
  {
    users_id: 2,
    users_username: 'annabianchi',
    users_email: 'anna.bianchi@example.com',
    corsi: [
      {
        name: 'React Advanced',
        description: 'Concetti avanzati di React',
        code: 'REACT301',
        maxStudents: 20,
        isActive: true
      }
    ]
  }
]
```

---

#### 4. `ENROLLMENTS_API_GUIDE.md` (nuovo file)

**Creato file di documentazione completo** con:

- 📋 Panoramica del modulo
- 🗄️ Relazioni database
- 📚 Tutti gli endpoints documentati
- 🆕 Sezione dedicata a `findByUsers()`
- 💡 Esempi pratici di utilizzo
- 🔐 Integrazione con sistema ruoli/permessi
- 📊 Confronto tra diversi endpoints
- ⚡ Note su performance e ottimizzazioni

---

## Query SQL Generata

L'endpoint `findByUsers()` genera questa query MySQL:

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

### Vantaggi della Query

✅ **Singola query** - No N+1 problem
✅ **Aggregazione database-side** - Più efficiente
✅ **JSON nativo MySQL** - Supporto nativo per JSON
✅ **Scalabile** - Funziona con grandi dataset

---

## Formato Risposta

### Struttura JSON

```typescript
interface UserCoursesGrouped {
  users_id: number;
  users_username: string;
  users_email: string;
  corsi: Array<{
    name: string;
    description: string;
    code: string;
    maxStudents: number;
    isActive: boolean;
  }>;
}
```

### Esempio Reale

**Request:**
```bash
curl http://localhost:3000/enrollments/groupinguser
```

**Response:**
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
      }
    ]
  }
]
```

---

## Casi d'Uso

### 1. Dashboard Studente

**Scenario:** Mostrare tutti i corsi dello studente nella sua dashboard.

**Frontend (React/Vue/Angular):**
```typescript
async function loadStudentDashboard(userId: number) {
  // Opzione 1: Endpoint specifico utente
  const courses = await fetch(`/enrollments/user/${userId}`);

  // Opzione 2: Filtrare da endpoint aggregato
  const allData = await fetch('/enrollments/groupinguser');
  const userCourses = allData.find(u => u.users_id === userId);

  return userCourses?.corsi || [];
}
```

**Consiglio:** Usa `GET /enrollments/user/:userId` per un singolo utente (più efficiente).

---

### 2. Report Amministrativo

**Scenario:** L'admin vuole vedere quanti corsi ha ogni studente.

```typescript
async function generateEnrollmentReport() {
  const data = await fetch('/enrollments/groupinguser');

  const report = data.map(user => ({
    username: user.users_username,
    email: user.users_email,
    totalCourses: user.corsi.length,
    activeCourses: user.corsi.filter(c => c.isActive).length,
    coursesList: user.corsi.map(c => c.name).join(', ')
  }));

  return report;
}
```

**Output:**
```javascript
[
  {
    username: "mariorossi",
    email: "mario@example.com",
    totalCourses: 3,
    activeCourses: 3,
    coursesList: "JavaScript, TypeScript, React"
  },
  {
    username: "annabianchi",
    email: "anna@example.com",
    totalCourses: 1,
    activeCourses: 1,
    coursesList: "Node.js"
  }
]
```

---

### 3. Statistiche LMS

**Scenario:** Calcolare statistiche aggregate.

```typescript
async function getLMSStats() {
  const data = await fetch('/enrollments/groupinguser');

  const stats = {
    totalUsers: data.length,
    totalEnrollments: data.reduce((sum, u) => sum + u.corsi.length, 0),
    avgCoursesPerUser: data.reduce((sum, u) => sum + u.corsi.length, 0) / data.length,
    usersWithNoCourses: data.filter(u => u.corsi.length === 0).length,
    mostActiveCourse: getMostEnrolledCourse(data)
  };

  return stats;
}

function getMostEnrolledCourse(data) {
  const courseCounts = {};

  data.forEach(user => {
    user.corsi.forEach(course => {
      courseCounts[course.name] = (courseCounts[course.name] || 0) + 1;
    });
  });

  const mostEnrolled = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return { name: mostEnrolled[0], enrollments: mostEnrolled[1] };
}
```

---

## Confronto con Altri Endpoints

| Endpoint | Dati Ritornati | Quando Usarlo |
|----------|----------------|---------------|
| `GET /enrollments` | Lista piatta di tutte le iscrizioni | Export completo, lista generale |
| `GET /enrollments/user/:userId` | Iscrizioni di UN utente | Dashboard utente specifico |
| `GET /enrollments/course/:courseId` | Iscrizioni di UN corso | Lista studenti per teacher |
| `GET /enrollments/groupinguser` | **Aggregato per utente** | **Report, statistiche, dashboard admin** |

### Esempio Visuale

```
/enrollments
├─ { id: 1, userId: 1, courseId: 5 }
├─ { id: 2, userId: 1, courseId: 8 }
├─ { id: 3, userId: 2, courseId: 5 }
└─ { id: 4, userId: 2, courseId: 10 }

/enrollments/groupinguser
├─ { users_id: 1, corsi: [{ corso 5 }, { corso 8 }] }
└─ { users_id: 2, corsi: [{ corso 5 }, { corso 10 }] }
```

---

## Performance e Ottimizzazioni

### Performance Attuale

✅ **Singola query SQL** - Aggregazione database-side
✅ **Efficient joins** - INNER JOIN invece di LEFT JOIN
✅ **Indexed columns** - userId e courseId sono FK con index

### Possibili Ottimizzazioni Future

#### 1. Paginazione

```typescript
async findByUsers(page: number = 1, limit: number = 50) {
  return this.enrollmentsRepository
    .createQueryBuilder('enrollments')
    .select([...])
    .groupBy('users.id')
    .limit(limit)
    .offset((page - 1) * limit)
    .getRawMany();
}
```

#### 2. Filtro per Status

```typescript
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

#### 3. Cache con Redis

```typescript
@Injectable()
export class EnrollmentsService {
  constructor(
    private cacheManager: Cache
  ) {}

  async findByUsers() {
    const cacheKey = 'enrollments:grouped';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const data = await this.enrollmentsRepository
      .createQueryBuilder('enrollments')
      .select([...])
      .getRawMany();

    await this.cacheManager.set(cacheKey, data, 300); // 5 min TTL
    return data;
  }
}
```

---

## Protezione con Ruoli e Permessi

### Opzione 1: Endpoint Pubblico

Se vuoi che tutti possano vedere l'elenco aggregato:

```typescript
@Get('groupinguser')
// Nessun guard
findByUsers() {
  return this.enrollmentsService.findByUsers();
}
```

### Opzione 2: Solo Admin/Manager

```typescript
@Get('groupinguser')
@UseGuards(RolesGuard)
@Roles('admin', 'manager')
findByUsers() {
  return this.enrollmentsService.findByUsers();
}
```

### Opzione 3: Con Permesso Specifico

```typescript
@Get('groupinguser')
@UseGuards(PermissionsGuard)
@Permissions('view_users')
findByUsers() {
  return this.enrollmentsService.findByUsers();
}
```

**Consigliato:** Opzione 2 o 3, per evitare esposizione dati sensibili.

---

## Testing

### Test con cURL

```bash
# Test base
curl http://localhost:3000/enrollments/groupinguser

# Con headers
curl -X GET http://localhost:3000/enrollments/groupinguser \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"

# Formattato con jq
curl http://localhost:3000/enrollments/groupinguser | jq '.'
```

### Test in Swagger UI

1. Apri `http://localhost:3000/api` (Swagger UI)
2. Trova la sezione **enrollments**
3. Clicca su **GET /enrollments/groupinguser**
4. Clicca **Try it out**
5. Clicca **Execute**
6. Vedi la risposta

---

## Documentazione Aggiuntiva

### File Creati/Modificati

| File | Tipo | Descrizione |
|------|------|-------------|
| `enrollments.service.ts` | Modificato | Aggiunto metodo `findByUsers()` |
| `enrollments.controller.ts` | Modificato | Aggiunto endpoint GET `/groupinguser` |
| `swagger-examples.ts` | Modificato | Aggiunto esempio `findByUsers` |
| `ENROLLMENTS_API_GUIDE.md` | **Nuovo** | Guida completa API Enrollments |
| `CHANGELOG_ENROLLMENTS.md` | **Nuovo** | Questo file |

### Link Utili

- 📖 [ENROLLMENTS_API_GUIDE.md](./ENROLLMENTS_API_GUIDE.md) - Guida completa
- 📖 [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md) - Sistema ruoli
- 📖 [COME_FUNZIONA.md](./COME_FUNZIONA.md) - Come funziona il sistema

---

## Riepilogo

### ✅ Cosa è stato fatto

1. ✅ Implementato metodo `findByUsers()` nel service
2. ✅ Creato endpoint `GET /enrollments/groupinguser`
3. ✅ Aggiunta documentazione Swagger completa
4. ✅ Creato esempio nella collection Swagger
5. ✅ Scritto guida API completa (ENROLLMENTS_API_GUIDE.md)
6. ✅ Documentato changelog (questo file)

### 🎯 Benefici

- ✅ Vista aggregata efficiente delle iscrizioni
- ✅ Singola query invece di N+1
- ✅ Formato JSON comodo per frontend
- ✅ Utile per dashboard e report
- ✅ Documentazione completa per sviluppatori

### 📊 Metriche

- **Linee di codice aggiunte**: ~100
- **Nuovi endpoints**: 1
- **Query SQL ottimizzate**: 1
- **Documenti creati**: 2 (guida + changelog)
- **Esempi Swagger**: 1

---

**Data aggiornamento:** 2026-01-04
**Branch:** feature/user_role_permission
**Autore:** Marco Galante + Claude Sonnet 4.5
