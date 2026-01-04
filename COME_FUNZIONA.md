# 🔐 Come Funziona il Sistema di Ruoli e Permessi

Questa guida spiega in dettaglio come funziona il sistema di autenticazione e autorizzazione, i decoratori utilizzati e il flusso di esecuzione completo.

---

## 📚 Indice

1. [Concetti Base](#concetti-base)
2. [Architettura del Sistema](#architettura-del-sistema)
3. [I Decoratori Spiegati](#i-decoratori-spiegati)
4. [I Guards Spiegati](#i-guards-spiegati)
5. [Flusso di Esecuzione Completo](#flusso-di-esecuzione-completo)
6. [Esempi Pratici Step-by-Step](#esempi-pratici-step-by-step)
7. [Database e Relazioni](#database-e-relazioni)
8. [Come Aggiungere Protezione a un Endpoint](#come-aggiungere-protezione-a-un-endpoint)

---

## 1. Concetti Base

### Cos'è RBAC?

**RBAC** (Role-Based Access Control) è un sistema di controllo degli accessi basato su ruoli:

- **Ruolo**: Un insieme di permessi (es. "teacher", "student")
- **Permesso**: Una capacità specifica (es. "create_courses", "view_grades")
- **Utente**: Ha uno o più ruoli
- **Risorsa**: Endpoint o funzionalità da proteggere

### Gerarchia del Sistema

```
Utente
  ├── ha → Ruolo(i)
  │     └── ha → Permesso(i)
  └── accede a → Endpoint Protetto
                  └── richiede → Permesso(i) o Ruolo(i)
```

**Esempio:**
```
Mario Rossi (Utente)
  ├── Ruolo: "teacher"
  │     ├── Permesso: "create_courses"
  │     ├── Permesso: "edit_own_courses"
  │     └── Permesso: "grade_students"
  └── Vuole accedere a → POST /courses
                          └── Richiede: "create_courses" ✅
```

---

## 2. Architettura del Sistema

### Schema Generale

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
│              POST /courses (body: {...})                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  NESTJS CONTROLLER                       │
│  @Controller('courses')                                  │
│  @Post()                                                 │
│  @UseGuards(PermissionsGuard) ◄──── DECORATORE          │
│  @Permissions('create_courses') ◄─── DECORATORE         │
│  createCourse(@CurrentUser() user) ◄─ DECORATORE        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   PERMISSIONS GUARD                      │
│  1. Legge @Permissions('create_courses')                │
│  2. Estrae user da request                              │
│  3. Chiama RoleService.userHasPermission()              │
│  4. Ritorna true ✅ o lancia ForbiddenException ❌      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    ROLE SERVICE                          │
│  1. Ottiene ruoli dell'utente dal DB                    │
│  2. Per ogni ruolo, ottiene i permessi                  │
│  3. Verifica se 'create_courses' è presente             │
│  4. Ritorna true/false                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      DATABASE                            │
│  Query su: users → user_roles → roles → role_permissions│
│           → permissions                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. I Decoratori Spiegati

I decoratori sono "annotazioni" che aggiungi al codice per configurare il comportamento.

### 3.1 `@Permissions(...permissions: string[])`

**File**: `src/decorators/permissions.decorator.ts`

```typescript
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

#### Come Funziona

1. **SetMetadata** è una funzione di NestJS che "attacca" dei dati all'endpoint
2. La chiave è `'permissions'` e il valore è l'array di permessi
3. Il Guard leggerà questi metadata per sapere quali permessi sono richiesti

#### Esempio d'Uso

```typescript
@Post()
@Permissions('create_courses')
async createCourse() { ... }
```

**Cosa succede internamente:**
```typescript
// NestJS memorizza:
metadata = {
  'permissions': ['create_courses']
}
```

#### Con Permessi Multipli

```typescript
@Put(':id')
@Permissions('edit_own_courses', 'edit_all_courses')
async updateCourse() { ... }
```

**Cosa succede:**
```typescript
metadata = {
  'permissions': ['edit_own_courses', 'edit_all_courses']
}
// Il Guard verificherà se l'utente ha ALMENO UNO di questi permessi
```

---

### 3.2 `@Roles(...roles: string[])`

**File**: `src/decorators/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
```

#### Come Funziona

Identico a `@Permissions`, ma lavora con i nomi dei ruoli invece che con i permessi.

#### Esempio d'Uso

```typescript
@Delete(':id')
@Roles('admin', 'manager')
async deleteCourse() { ... }
```

**Cosa succede:**
```typescript
metadata = {
  'roles': ['admin', 'manager']
}
// Solo admin O manager possono accedere
```

---

### 3.3 `@CurrentUser()`

**File**: `src/decorators/current-user.decorator.ts`

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### Come Funziona

1. **createParamDecorator** crea un decoratore per i parametri dei metodi
2. **ctx** è il contesto di esecuzione di NestJS
3. **switchToHttp()** passa al contesto HTTP
4. **getRequest()** ottiene l'oggetto `request` di Express
5. Ritorna `request.user` (l'utente autenticato)

#### Esempio d'Uso

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  console.log(user.id);    // ID dell'utente autenticato
  console.log(user.email); // Email dell'utente
  return user;
}
```

#### ⚠️ Prerequisito Importante

`request.user` deve essere popolato da un middleware di autenticazione (JWT, sessioni, etc.):

```typescript
// Esempio di middleware che popola request.user
async function authMiddleware(request, response, next) {
  const token = request.headers.authorization;
  const decoded = jwt.verify(token, SECRET);

  // Popola request.user
  request.user = await userRepository.findOne({ id: decoded.userId });

  next();
}
```

---

### 3.4 `@UseGuards(Guard)`

**Non è un nostro decoratore**, è fornito da NestJS.

```typescript
@Post()
@UseGuards(PermissionsGuard)
async createCourse() { ... }
```

#### Come Funziona

1. Dice a NestJS di eseguire il Guard **prima** del metodo
2. Se il Guard ritorna `true`, il metodo viene eseguito
3. Se il Guard ritorna `false` o lancia un'eccezione, il metodo NON viene eseguito

#### Ordine di Esecuzione

```typescript
@Post()
@UseGuards(AuthGuard, PermissionsGuard)
@Permissions('create_courses')
async createCourse() { ... }
```

**Ordine:**
1. `AuthGuard` - verifica se l'utente è autenticato
2. `PermissionsGuard` - verifica se ha i permessi
3. `createCourse()` - esegue il metodo

---

## 4. I Guards Spiegati

I Guards sono classi che decidono se una richiesta può procedere o no.

### 4.1 `PermissionsGuard`

**File**: `src/guards/permissions.guard.ts`

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Ottiene i permessi richiesti dai metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // 2. Se non ci sono permessi richiesti, consenti l'accesso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 3. Ottiene l'utente dalla richiesta
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 4. Ottiene courseId se presente (per permessi specifici del corso)
    const courseId = request.params.courseId
      ? parseInt(request.params.courseId)
      : undefined;

    // 5. Verifica ogni permesso richiesto
    for (const permission of requiredPermissions) {
      const hasPermission = await this.roleService.userHasPermission(
        user.id,
        permission,
        courseId
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `User does not have permission: ${permission}`
        );
      }
    }

    // 6. Se arriva qui, ha tutti i permessi
    return true;
  }
}
```

#### Spiegazione Step-by-Step

**Step 1: Legge i Metadata**

```typescript
const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
  PERMISSIONS_KEY,
  [context.getHandler(), context.getClass()]
);
```

- `reflector` è un servizio NestJS che legge i metadata
- `PERMISSIONS_KEY` è `'permissions'`
- Cerca prima sul metodo (`getHandler()`), poi sulla classe (`getClass()`)
- Ritorna l'array di permessi: `['create_courses']`

**Step 2: Controlla se ci sono permessi**

```typescript
if (!requiredPermissions || requiredPermissions.length === 0) {
  return true;
}
```

Se l'endpoint non ha `@Permissions()`, lascia passare.

**Step 3: Ottiene l'utente**

```typescript
const request = context.switchToHttp().getRequest();
const user = request.user;
```

Estrae l'utente autenticato dalla richiesta.

**Step 4: Estrae courseId (opzionale)**

```typescript
const courseId = request.params.courseId
  ? parseInt(request.params.courseId)
  : undefined;
```

Se l'URL è tipo `/courses/:courseId/...`, estrae l'ID del corso.

**Step 5: Verifica i permessi**

```typescript
for (const permission of requiredPermissions) {
  const hasPermission = await this.roleService.userHasPermission(
    user.id,
    permission,
    courseId
  );

  if (!hasPermission) {
    throw new ForbiddenException(...);
  }
}
```

Per ogni permesso richiesto, chiede al `RoleService` se l'utente ce l'ha.

**Step 6: Ritorna true**

Se tutti i controlli passano, ritorna `true` e la richiesta procede.

---

### 4.2 `RolesGuard`

**File**: `src/guards/roles.guard.ts`

Simile a `PermissionsGuard`, ma verifica i ruoli invece dei permessi.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Ottiene i ruoli richiesti
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Ottiene l'utente
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 3. Ottiene courseId se presente
    const courseId = request.params.courseId
      ? parseInt(request.params.courseId)
      : undefined;

    // 4. Ottiene i ruoli dell'utente
    let userRoles;
    if (courseId) {
      userRoles = await this.roleService.getUserRolesInCourse(user.id, courseId);
    } else {
      userRoles = await this.roleService.getUserRoles(user.id);
    }

    // 5. Verifica se ha almeno uno dei ruoli richiesti
    const hasRole = userRoles.some(role => requiredRoles.includes(role.name));

    if (!hasRole) {
      throw new ForbiddenException(
        `User does not have required role. Required: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
```

#### Differenza con PermissionsGuard

| PermissionsGuard | RolesGuard |
|------------------|------------|
| Verifica permessi specifici | Verifica ruoli |
| `@Permissions('create_courses')` | `@Roles('admin', 'teacher')` |
| Più granulare | Più semplice |
| Logica OR (almeno uno) | Logica OR (almeno uno) |

---

## 5. Flusso di Esecuzione Completo

### Scenario: Utente crea un corso

#### Endpoint

```typescript
@Controller('courses')
export class CoursesController {

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('create_courses')
  async createCourse(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: User
  ) {
    return this.coursesService.create(dto, user.id);
  }
}
```

#### Request

```http
POST /courses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Matematica Avanzata",
  "description": "Corso di matematica",
  "code": "MATH101",
  "credits": 6
}
```

#### Flusso Completo

```
1. REQUEST ARRIVA
   ├─ POST /courses
   └─ Headers: { Authorization: "Bearer ..." }

2. MIDDLEWARE DI AUTENTICAZIONE (da implementare)
   ├─ Estrae il token JWT
   ├─ Verifica e decodifica il token
   ├─ Trova l'utente nel database
   └─ Imposta request.user = { id: 5, email: "mario@example.com" }

3. NESTJS ROUTING
   ├─ Trova il controller: CoursesController
   ├─ Trova il metodo: createCourse()
   └─ Legge i decoratori: @UseGuards, @Permissions, @CurrentUser

4. ESECUZIONE GUARD: PermissionsGuard.canActivate()

   a) Legge metadata
      ├─ Reflector.getAllAndOverride('permissions', ...)
      └─ Trova: ['create_courses']

   b) Estrae utente
      ├─ request = context.switchToHttp().getRequest()
      └─ user = request.user = { id: 5, email: "..." }

   c) Verifica permesso
      ├─ Chiama: roleService.userHasPermission(5, 'create_courses')
      │
      └─ RoleService.userHasPermission()
         │
         ├─ Query 1: Trova ruoli dell'utente
         │  SELECT * FROM user_roles WHERE userId = 5
         │  Risultato: [{ roleId: 3 }]  ← utente ha ruolo "teacher"
         │
         ├─ Query 2: Ottiene dettagli ruolo con permessi
         │  SELECT * FROM roles r
         │  JOIN role_permissions rp ON r.id = rp.role_id
         │  JOIN permissions p ON p.id = rp.permission_id
         │  WHERE r.id = 3
         │  Risultato: Role { name: "teacher", permissions: [
         │    { name: "create_courses" },
         │    { name: "edit_own_courses" },
         │    ...
         │  ]}
         │
         └─ Verifica: "create_courses" è in permissions? → SÌ ✅

   d) Ritorna true ✅

5. ESECUZIONE DECORATORE @CurrentUser()
   ├─ createParamDecorator esegue
   ├─ Estrae request.user
   └─ Passa user come parametro al metodo

6. ESECUZIONE METODO createCourse()
   ├─ Riceve dto e user
   ├─ Chiama coursesService.create(dto, user.id)
   └─ Ritorna il corso creato

7. RESPONSE
   HTTP/1.1 201 Created
   {
     "id": 10,
     "name": "Matematica Avanzata",
     "code": "MATH101",
     ...
   }
```

#### Se l'utente NON ha il permesso

```
4. ESECUZIONE GUARD: PermissionsGuard.canActivate()

   c) Verifica permesso
      ├─ roleService.userHasPermission(5, 'create_courses')
      └─ Ritorna: false ❌

   d) Lancia eccezione
      throw new ForbiddenException(
        "User does not have permission: create_courses"
      )

5. NESTJS EXCEPTION FILTER
   └─ Intercetta l'eccezione

6. RESPONSE
   HTTP/1.1 403 Forbidden
   {
     "statusCode": 403,
     "message": "User does not have permission: create_courses",
     "error": "Forbidden"
   }
```

---

## 6. Esempi Pratici Step-by-Step

### Esempio 1: Studente visualizza i propri voti

#### Controller

```typescript
@Controller('grades')
export class GradesController {

  @Get('my-grades')
  @UseGuards(PermissionsGuard)
  @Permissions('view_own_grades')
  async getMyGrades(@CurrentUser() user: User) {
    return this.gradesService.getStudentGrades(user.id);
  }
}
```

#### Flusso

```
Request: GET /grades/my-grades
User: { id: 10, ruoli: ["student"] }

1. Guard: PermissionsGuard
   ├─ Richiede: 'view_own_grades'
   ├─ Utente ha ruolo "student"
   ├─ Ruolo "student" ha permesso "view_own_grades" ✅
   └─ Procede

2. @CurrentUser() → user = { id: 10, ... }

3. gradesService.getStudentGrades(10)
   └─ Ritorna solo i voti dell'utente 10

4. Response: [ { course: "Math", grade: 28 }, ... ]
```

---

### Esempio 2: Teacher valuta uno studente

#### Controller

```typescript
@Controller('grades')
export class GradesController {

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('grade_students')
  async assignGrade(
    @Body() dto: AssignGradeDto,
    @CurrentUser() teacher: User
  ) {
    return this.gradesService.assignGrade(dto, teacher.id);
  }
}
```

#### Flusso

```
Request: POST /grades
Body: { studentId: 10, courseId: 5, grade: 28 }
User: { id: 3, ruoli: ["teacher"] }

1. Guard: PermissionsGuard
   ├─ Richiede: 'grade_students'
   ├─ Utente ha ruolo "teacher"
   ├─ Ruolo "teacher" ha permesso "grade_students" ✅
   └─ Procede

2. @CurrentUser() → teacher = { id: 3, ... }

3. gradesService.assignGrade({ studentId: 10, grade: 28 }, 3)
   └─ Crea il voto nel database

4. Response: { id: 100, studentId: 10, grade: 28, assignedBy: 3 }
```

---

### Esempio 3: Admin elimina un corso

#### Controller

```typescript
@Controller('courses')
export class CoursesController {

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async deleteCourse(@Param('id') id: number) {
    return this.coursesService.delete(id);
  }
}
```

#### Flusso

```
Request: DELETE /courses/5
User: { id: 1, ruoli: ["admin"] }

1. Guard: RolesGuard
   ├─ Richiede: 'admin' OR 'manager'
   ├─ Utente ha ruolo "admin" ✅
   └─ Procede

2. coursesService.delete(5)
   └─ Elimina il corso

3. Response: 200 OK
```

#### Se fosse uno studente

```
Request: DELETE /courses/5
User: { id: 10, ruoli: ["student"] }

1. Guard: RolesGuard
   ├─ Richiede: 'admin' OR 'manager'
   ├─ Utente ha ruolo "student" ❌
   └─ Lancia ForbiddenException

2. Response: 403 Forbidden
   "User does not have required role. Required: admin, manager"
```

---

## 7. Database e Relazioni

### Schema delle Tabelle

```sql
┌──────────┐       ┌─────────────┐       ┌──────┐
│  users   │◄─────┤ user_roles  ├──────►│ roles│
└──────────┘       └─────────────┘       └───┬──┘
     │                                        │
     │             ┌──────────────────┐       │
     └────────────►│course_user_roles │◄──────┘
                   └──────────────────┘
                            │
                            ▼
                      ┌─────────┐
                      │ courses │
                      └─────────┘

┌──────┐       ┌──────────────────┐       ┌─────────────┐
│roles │◄─────┤ role_permissions ├──────►│ permissions │
└──────┘       └──────────────────┘       └─────────────┘
```

### Esempio di Dati

**users**
```
id | email             | username
---+-------------------+----------
1  | admin@lms.com     | admin
3  | mario@teacher.com | mario
10 | anna@student.com  | anna
```

**roles**
```
id | name    | level
---+---------+------
1  | admin   | 1
3  | teacher | 3
6  | student | 6
```

**permissions**
```
id | name            | category
---+-----------------+-----------
4  | create_courses  | courses
14 | grade_students  | assessments
16 | view_own_grades | assessments
```

**role_permissions** (chi ha cosa)
```
role_id | permission_id
--------+--------------
1       | 4              ← admin ha create_courses
1       | 14             ← admin ha grade_students
3       | 4              ← teacher ha create_courses
3       | 14             ← teacher ha grade_students
6       | 16             ← student ha view_own_grades
```

**user_roles** (chi è cosa)
```
id | userId | roleId | assignedAt
---+--------+--------+------------
1  | 1      | 1      | 2026-01-01  ← user 1 è admin
5  | 3      | 3      | 2026-01-02  ← user 3 è teacher
12 | 10     | 6      | 2026-01-03  ← user 10 è student
```

**course_user_roles** (chi fa cosa in un corso specifico)
```
id | courseId | userId | roleId
---+----------+--------+-------
1  | 5        | 3      | 3      ← user 3 è teacher del corso 5
2  | 5        | 10     | 6      ← user 10 è student del corso 5
```

### Query Esempio

**Trova tutti i permessi dell'utente 3:**

```sql
SELECT DISTINCT p.name
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
JOIN user_roles ur ON ur.roleId = r.id
WHERE ur.userId = 3;
```

**Risultato:**
```
name
-----------------
create_courses
edit_own_courses
grade_students
view_reports
...
```

---

## 8. Come Aggiungere Protezione a un Endpoint

### Step 1: Decidi cosa proteggere

- **Pubblico**: Nessuna protezione (es. lista corsi)
- **Solo autenticati**: Guard di autenticazione
- **Con permessi specifici**: `@Permissions()`
- **Con ruoli specifici**: `@Roles()`

### Step 2: Importa i necessari

```typescript
import { UseGuards } from '@nestjs/common';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesGuard } from '../guards/roles.guard';
```

### Step 3: Applica i decoratori

#### Protezione con Permesso

```typescript
@Post()
@UseGuards(PermissionsGuard)
@Permissions('create_courses')
async createCourse(@Body() dto: CreateCourseDto) {
  return this.service.create(dto);
}
```

#### Protezione con Ruolo

```typescript
@Delete(':id')
@UseGuards(RolesGuard)
@Roles('admin')
async deleteCourse(@Param('id') id: number) {
  return this.service.delete(id);
}
```

#### Con utente corrente

```typescript
@Get('profile')
@UseGuards(PermissionsGuard)
@Permissions('edit_own_profile')
async getProfile(@CurrentUser() user: User) {
  return this.service.getProfile(user.id);
}
```

### Step 4: Aggiorna il Module

Assicurati che il tuo module importi `AuthModule`:

```typescript
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([...]),
    AuthModule,  // ← Necessario per Guards e RoleService
  ],
  controllers: [...],
  providers: [...],
})
export class MyModule {}
```

---

## 🎯 Riassunto Finale

### I Decoratori

| Decoratore | Scopo | Esempio |
|------------|-------|---------|
| `@Permissions()` | Specifica permessi richiesti | `@Permissions('create_courses')` |
| `@Roles()` | Specifica ruoli richiesti | `@Roles('admin', 'teacher')` |
| `@CurrentUser()` | Ottiene utente autenticato | `getProfile(@CurrentUser() user)` |
| `@UseGuards()` | Applica un guard | `@UseGuards(PermissionsGuard)` |

### I Guards

| Guard | Verifica | Quando usarlo |
|-------|----------|---------------|
| `PermissionsGuard` | Se utente ha permessi specifici | Controllo granulare |
| `RolesGuard` | Se utente ha ruoli specifici | Controllo semplice |

### Il Flusso

```
Request → Middleware Auth → Guard → Decoratori → Metodo → Response
                           ↓
                      RoleService
                           ↓
                       Database
```

### Checklist Protezione Endpoint

- [ ] Importare decoratori e guards
- [ ] Aggiungere `@UseGuards()`
- [ ] Specificare `@Permissions()` o `@Roles()`
- [ ] Usare `@CurrentUser()` se necessario
- [ ] Importare `AuthModule` nel module
- [ ] Testare con utenti con/senza permessi

---

## 📞 Supporto

Per ulteriori domande:
- Vedi [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md) per esempi d'uso
- Vedi [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md) per pattern comuni

