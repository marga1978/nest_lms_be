# 📁 Struttura del Progetto - LMS Backend

Struttura organizzata a **moduli** seguendo le best practices di NestJS.

---

## 🏗️ Struttura Completa

```
BE/src/
├── app.module.ts              # Modulo principale
├── main.ts                    # Entry point dell'applicazione
│
├── entities/                  # Entità condivise tra moduli
│   ├── user.entity.ts
│   ├── course.entity.ts
│   ├── enrollment.entity.ts
│   ├── user-profile.entity.ts
│   └── course-lesson.entity.ts
│
├── dto/                       # DTOs condivisi
│   ├── user.dto.ts
│   ├── course.dto.ts
│   ├── enrollment.dto.ts
│   ├── user-profile.dto.ts
│   ├── user-with-courses.dto.ts
│   └── course-lesson.dto.ts
│
├── schemas/                   # Schemi MongoDB (se usati)
│   └── user-preferences.schema.ts
│
├── database/                  # Database utilities
│   └── seeds/
│       ├── roles-permissions.seed.ts
│       └── run-seed.ts
│
└── modules/                   # ⭐ MODULI DELL'APPLICAZIONE
    │
    ├── auth/                  # 🔐 Modulo Autenticazione e Autorizzazione
    │   ├── auth.module.ts
    │   ├── entities/          # Entità specifiche auth
    │   │   ├── role.entity.ts
    │   │   ├── permission.entity.ts
    │   │   ├── user-role.entity.ts
    │   │   └── course-user-role.entity.ts
    │   ├── dto/
    │   │   ├── role.dto.ts
    │   │   └── permission.dto.ts
    │   ├── services/
    │   │   ├── role.service.ts
    │   │   └── permission.service.ts
    │   ├── controllers/
    │   │   ├── role.controller.ts
    │   │   └── permission.controller.ts
    │   ├── guards/            # Guards specifici auth
    │   │   ├── permissions.guard.ts
    │   │   └── roles.guard.ts
    │   └── decorators/        # Decorators specifici auth
    │       ├── permissions.decorator.ts
    │       ├── roles.decorator.ts
    │       └── current-user.decorator.ts
    │
    ├── users/                 # 👥 Modulo Utenti
    │   ├── users.module.ts
    │   ├── users.controller.ts
    │   └── users.service.ts
    │
    ├── user-profiles/         # 👤 Modulo Profili Utente
    │   ├── user-profiles.module.ts
    │   ├── user-profiles.controller.ts
    │   └── user-profiles.service.ts
    │
    ├── courses/               # 📚 Modulo Corsi
    │   ├── courses.module.ts
    │   ├── courses.controller.ts
    │   └── courses.service.ts
    │
    ├── course-lessons/        # 📝 Modulo Lezioni
    │   ├── course-lessons.module.ts
    │   ├── course-lessons.controller.ts
    │   └── course-lessons.service.ts
    │
    ├── enrollments/           # 🎓 Modulo Iscrizioni
    │   ├── enrollments.module.ts
    │   ├── enrollments.controller.ts
    │   └── enrollments.service.ts
    │
    └── user-preferences/      # ⚙️ Modulo Preferenze (MongoDB)
        ├── user-preferences.module.ts
        ├── user-preferences.controller.ts
        └── user-preferences.service.ts
```

---

## 📊 Organizzazione per Tipo

### 🔐 Modulo Auth (Sistema Ruoli e Permessi)

**Percorso:** `src/modules/auth/`

Questo modulo contiene tutto il sistema di autenticazione e autorizzazione:

```
auth/
├── entities/           # 4 entità del sistema RBAC
├── dto/               # DTOs per role e permission
├── services/          # Logica business (RoleService, PermissionService)
├── controllers/       # API endpoints
├── guards/            # PermissionsGuard, RolesGuard
└── decorators/        # @Permissions(), @Roles(), @CurrentUser()
```

**Esporta:**
- `RoleService`
- `PermissionService`
- `PermissionsGuard`
- `RolesGuard`

**Usato da:** Tutti i moduli che necessitano protezione

---

### 👥 Moduli Feature

Ogni modulo feature contiene:
- `*.module.ts` - Configurazione del modulo
- `*.controller.ts` - Endpoints API
- `*.service.ts` - Logica business

**Moduli disponibili:**
1. **users** - Gestione utenti (credenziali)
2. **user-profiles** - Profili utente (dati personali)
3. **courses** - Gestione corsi
4. **course-lessons** - Lezioni dei corsi
5. **enrollments** - Iscrizioni utenti ai corsi
6. **user-preferences** - Preferenze utente (MongoDB)
7. **auth** - Autenticazione e autorizzazione

---

## 🔄 Relazioni tra Moduli

```
                    ┌─────────────┐
                    │  AuthModule │
                    │  (guards &  │
                    │  decorators)│
                    └──────┬──────┘
                           │
                           │ exports
                           ▼
         ┌─────────────────────────────────────┐
         │    Tutti gli altri moduli           │
         │    possono usare:                   │
         │    - @Permissions()                 │
         │    - @Roles()                       │
         │    - PermissionsGuard               │
         │    - RolesGuard                     │
         └─────────────────────────────────────┘

┌──────────────┐      ┌──────────────────┐      ┌────────────┐
│ UsersModule  │◄────►│ UserProfilesModule│◄────►│ AuthModule │
└──────┬───────┘      └──────────────────┘      └────────────┘
       │
       │
       ▼
┌──────────────────┐      ┌────────────────┐
│ EnrollmentsModule│◄────►│ CoursesModule  │
└──────────────────┘      └────────────────┘
       │                          │
       │                          ▼
       │                  ┌──────────────────┐
       └─────────────────►│ CourseLessonsModule│
                          └──────────────────┘
```

---

## 📝 Convenzioni

### Nomenclatura File

- **Module**: `*.module.ts` (es. `auth.module.ts`)
- **Controller**: `*.controller.ts` (es. `role.controller.ts`)
- **Service**: `*.service.ts` (es. `permission.service.ts`)
- **Entity**: `*.entity.ts` (es. `role.entity.ts`)
- **DTO**: `*.dto.ts` (es. `create-role.dto.ts`)
- **Guard**: `*.guard.ts` (es. `permissions.guard.ts`)
- **Decorator**: `*.decorator.ts` (es. `current-user.decorator.ts`)

### Import Path

**Entità condivise:**
```typescript
import { User } from '../../../entities/user.entity';
import { Course } from '../../../entities/course.entity';
```

**Entità del modulo auth:**
```typescript
// Da dentro auth module
import { Role } from '../entities/role.entity';

// Da fuori auth module
import { Role } from '../modules/auth/entities/role.entity';
```

**Guards e Decorators:**
```typescript
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
```

---

## 🎯 Best Practices Implementate

### ✅ Separazione delle Responsabilità

- **Entities**: Solo definizione dati
- **DTOs**: Validazione input/output
- **Services**: Logica business
- **Controllers**: Gestione HTTP
- **Guards**: Logica autorizzazione
- **Decorators**: Metadata e utilities

### ✅ Modularità

Ogni modulo è:
- **Autonomo**: Contiene tutto ciò di cui ha bisogno
- **Riutilizzabile**: Può essere esportato e importato
- **Testabile**: Facilmente mockabile

### ✅ DRY (Don't Repeat Yourself)

- Entità condivise in `entities/`
- DTOs condivisi in `dto/`
- Guards e Decorators nel modulo auth

### ✅ Scalabilità

Facile aggiungere nuovi moduli:
```bash
# Creare un nuovo modulo
nest generate module modules/notifications
nest generate service modules/notifications
nest generate controller modules/notifications
```

---

## 🚀 Come Usare i Guards

### Esempio in un Controller

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '../modules/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../modules/auth/guards/permissions.guard';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';

@Controller('courses')
export class CoursesController {

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('create_courses')
  async createCourse(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: User
  ) {
    // Solo utenti con permesso 'create_courses'
    return this.coursesService.create(dto, user.id);
  }
}
```

### Importare AuthModule

Nel tuo feature module:
```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,  // ← Importa per usare Guards e Services
  ],
  controllers: [...],
  providers: [...],
})
export class CoursesModule {}
```

---

## 📦 Dependencies tra Moduli

```
app.module.ts
  ├── imports: ConfigModule
  ├── imports: TypeOrmModule.forRoot()
  ├── imports: MongooseModule.forRoot()
  ├── imports: UsersModule
  ├── imports: UserProfilesModule
  ├── imports: CoursesModule
  ├── imports: CourseLessonsModule
  ├── imports: EnrollmentsModule
  ├── imports: UserPreferencesModule
  └── imports: AuthModule          ← Sistema autorizzazione

AuthModule
  └── exports: RoleService, PermissionService, Guards

CoursesModule
  └── imports: AuthModule          ← Per usare i guards

EnrollmentsModule
  └── imports: AuthModule          ← Per usare i guards
```

---

## 🗂️ Database Seeds

**Percorso:** `src/database/seeds/`

- `roles-permissions.seed.ts` - Popola ruoli e permessi
- `run-seed.ts` - Script eseguibile

**Comando:**
```bash
npm run seed
```

---

## 📚 Documentazione Correlata

- [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md) - Sistema ruoli
- [COME_FUNZIONA.md](./COME_FUNZIONA.md) - Come funzionano decorators e guards
- [ENROLLMENTS_API_GUIDE.md](./ENROLLMENTS_API_GUIDE.md) - API Enrollments
- [API_ENDPOINTS_SUMMARY.md](./API_ENDPOINTS_SUMMARY.md) - Tutti gli endpoints

---

## ✅ Checklist Migrazione Completata

- ✅ Decorators spostati in `auth/decorators/`
- ✅ Guards spostati in `auth/guards/`
- ✅ Services auth in `auth/services/`
- ✅ Controllers auth in `auth/controllers/`
- ✅ Entità auth in `auth/entities/`
- ✅ DTOs auth in `auth/dto/`
- ✅ Seeds in `database/seeds/`
- ✅ Tutti gli imports aggiornati
- ✅ Build funzionante ✅

---

**Struttura aggiornata:** 2026-01-06
**Branch:** feature/user_role_permission
