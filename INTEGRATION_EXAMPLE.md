# Esempio di Integrazione del Sistema Ruoli e Permessi

Questo documento mostra come integrare il sistema di ruoli e permessi nei controller esistenti.

## Esempio Completo: Proteggere il Controller dei Corsi

### Prima (senza protezione)

```typescript
// src/modules/courses/courses.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from '../../dto/course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateCourseDto: any) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.coursesService.remove(id);
  }
}
```

### Dopo (con protezione ruoli e permessi)

```typescript
// src/modules/courses/courses.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from '../../dto/course.dto';
import { Permissions } from '../../decorators/permissions.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { User } from '../../entities/user.entity';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i corsi' })
  @ApiResponse({ status: 200, description: 'Lista dei corsi' })
  // Endpoint pubblico - nessun guard necessario
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un corso per ID' })
  @ApiResponse({ status: 200, description: 'Corso trovato' })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('create_courses')
  @ApiOperation({ summary: 'Crea un nuovo corso' })
  @ApiResponse({ status: 201, description: 'Corso creato con successo' })
  @ApiResponse({ status: 403, description: 'Permesso negato' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: User
  ) {
    // Solo utenti con il permesso 'create_courses' possono creare corsi
    // Tipicamente: admin, manager, teacher
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('edit_own_courses', 'edit_all_courses')
  @ApiOperation({ summary: 'Aggiorna un corso' })
  @ApiResponse({ status: 200, description: 'Corso aggiornato' })
  @ApiResponse({ status: 403, description: 'Permesso negato' })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: User
  ) {
    // L'utente deve avere 'edit_own_courses' O 'edit_all_courses'
    // Nel service, verificare se può modificare QUESTO corso specifico
    return this.coursesService.update(id, updateCourseDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Elimina un corso' })
  @ApiResponse({ status: 200, description: 'Corso eliminato' })
  @ApiResponse({ status: 403, description: 'Solo admin e manager possono eliminare corsi' })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    // Solo admin e manager possono eliminare corsi
    return this.coursesService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(PermissionsGuard)
  @Permissions('edit_all_courses')
  @ApiOperation({ summary: 'Pubblica un corso' })
  @ApiResponse({ status: 200, description: 'Corso pubblicato' })
  async publish(@Param('id', ParseIntPipe) id: number) {
    // Solo chi può modificare TUTTI i corsi può pubblicarli
    return this.coursesService.publish(id);
  }

  @Get(':id/students')
  @UseGuards(PermissionsGuard)
  @Permissions('view_users', 'enroll_students')
  @ApiOperation({ summary: 'Visualizza studenti iscritti al corso' })
  @ApiResponse({ status: 200, description: 'Lista studenti' })
  async getStudents(@Param('id', ParseIntPipe) id: number) {
    // Teacher, manager o admin possono vedere gli studenti
    return this.coursesService.getEnrolledStudents(id);
  }
}
```

## Esempio: Service con Controlli Avanzati

```typescript
// src/modules/courses/courses.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { RoleService } from '../../services/role.service';
import { CreateCourseDto, UpdateCourseDto } from '../../dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private roleService: RoleService,
  ) {}

  async create(createCourseDto: CreateCourseDto, creatorId: number): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      createdBy: creatorId, // Assumendo che esista questo campo
    });

    return this.courseRepository.save(course);
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    userId: number
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Verifica permessi specifici
    const canEditAll = await this.roleService.userHasPermission(userId, 'edit_all_courses');

    // Se non può modificare tutti i corsi, verifica se è il creatore
    if (!canEditAll) {
      const canEditOwn = await this.roleService.userHasPermission(userId, 'edit_own_courses');

      if (!canEditOwn || course.createdBy !== userId) {
        throw new ForbiddenException('You can only edit your own courses');
      }
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async publish(id: number): Promise<Course> {
    const course = await this.findOne(id);
    course.isActive = true;
    return this.courseRepository.save(course);
  }

  async getEnrolledStudents(courseId: number) {
    // Logica per ottenere gli studenti iscritti
    return [];
  }
}
```

## Esempio: Aggiornare il Module per Includere RoleService

```typescript
// src/modules/courses/courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course } from '../../entities/course.entity';
import { AuthModule } from '../auth.module';  // ← IMPORTA AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    AuthModule,  // ← Fornisce RoleService e Guards
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
```

## Esempio: Endpoints per Studenti

```typescript
// src/modules/enrollments/enrollments.controller.ts
import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { Permissions } from '../../decorators/permissions.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { User } from '../../entities/user.entity';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('enroll_students')
  @ApiOperation({ summary: 'Iscrivi uno studente a un corso' })
  async enrollStudent(
    @Body() enrollDto: { userId: number; courseId: number },
    @CurrentUser() currentUser: User
  ) {
    // Solo teacher, manager e admin possono iscrivere studenti
    return this.enrollmentsService.enroll(enrollDto, currentUser.id);
  }

  @Get('my-courses')
  @UseGuards(PermissionsGuard)
  @Permissions('view_own_grades')
  @ApiOperation({ summary: 'Visualizza i miei corsi' })
  async getMyCourses(@CurrentUser() user: User) {
    // Uno studente può vedere i propri corsi
    return this.enrollmentsService.getUserCourses(user.id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('enroll_students')
  @ApiOperation({ summary: 'Rimuovi iscrizione di uno studente' })
  async removeEnrollment(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
```

## Esempio: Proteggere Endpoint di Valutazione

```typescript
// src/modules/grades/grades.controller.ts
import { Controller, Get, Post, Put, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { Permissions } from '../../decorators/permissions.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { User } from '../../entities/user.entity';

@ApiTags('Grades')
@Controller('grades')
@UseGuards(PermissionsGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Permissions('grade_students')
  @ApiOperation({ summary: 'Assegna un voto a uno studente' })
  async assignGrade(
    @Body() gradeDto: { studentId: number; courseId: number; score: number },
    @CurrentUser() teacher: User
  ) {
    // Solo teacher può valutare gli studenti
    return this.gradesService.assignGrade(gradeDto, teacher.id);
  }

  @Get('my-grades')
  @Permissions('view_own_grades')
  @ApiOperation({ summary: 'Visualizza i miei voti' })
  async getMyGrades(@CurrentUser() student: User) {
    // Uno studente può vedere solo i propri voti
    return this.gradesService.getStudentGrades(student.id);
  }

  @Get('course/:courseId')
  @Permissions('view_all_grades')
  @ApiOperation({ summary: 'Visualizza tutti i voti di un corso' })
  async getCourseGrades(@Param('courseId', ParseIntPipe) courseId: number) {
    // Teacher, manager, admin possono vedere tutti i voti
    return this.gradesService.getCourseGrades(courseId);
  }

  @Get('student/:studentId')
  @Permissions('view_all_grades')
  @ApiOperation({ summary: 'Visualizza tutti i voti di uno studente' })
  async getStudentGrades(@Param('studentId', ParseIntPipe) studentId: number) {
    // Solo teacher, manager, admin
    return this.gradesService.getStudentGrades(studentId);
  }
}
```

## Pattern Comuni

### Pattern 1: Endpoint Pubblico

```typescript
@Get()
// Nessun guard - accessibile a tutti
async getPublicData() {
  return this.service.getPublicData();
}
```

### Pattern 2: Solo Autenticati

```typescript
@Get('profile')
@UseGuards(AuthGuard) // Guard di autenticazione (da implementare)
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Pattern 3: Permesso Specifico

```typescript
@Post()
@UseGuards(PermissionsGuard)
@Permissions('create_content')
async create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

### Pattern 4: Permessi Multipli (OR)

```typescript
@Put(':id')
@UseGuards(PermissionsGuard)
@Permissions('edit_own_courses', 'edit_all_courses')
async update(@Param('id') id: number, @Body() dto: UpdateDto) {
  // L'utente deve avere almeno UNO dei permessi
  return this.service.update(id, dto);
}
```

### Pattern 5: Ruoli Specifici

```typescript
@Delete(':id')
@UseGuards(RolesGuard)
@Roles('admin', 'manager')
async delete(@Param('id') id: number) {
  // Solo admin O manager
  return this.service.delete(id);
}
```

### Pattern 6: Controllo nel Service

```typescript
async canAccessCourse(userId: number, courseId: number): Promise<boolean> {
  // Verifica se l'utente ha un ruolo specifico per questo corso
  const roles = await this.roleService.getUserRolesInCourse(userId, courseId);
  return roles.some(role => ['teacher', 'student'].includes(role.name));
}
```

## Combinazione con Altri Guards

```typescript
import { AuthGuard } from '@nestjs/passport'; // Esempio con Passport

@Post()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Permissions('create_courses')
async create(@Body() dto: CreateCourseDto) {
  // 1. Prima verifica JWT (AuthGuard)
  // 2. Poi verifica permessi (PermissionsGuard)
  return this.service.create(dto);
}
```

## Checklist Integrazione

- [ ] Importare AuthModule nel tuo feature module
- [ ] Aggiungere @UseGuards() agli endpoint da proteggere
- [ ] Specificare @Permissions() o @Roles() richiesti
- [ ] Usare @CurrentUser() per ottenere l'utente autenticato
- [ ] Aggiungere controlli aggiuntivi nei service se necessario
- [ ] Documentare con Swagger (@ApiOperation, @ApiResponse)
- [ ] Testare tutti i casi d'uso (permesso ok, permesso negato, non autenticato)

## Conclusione

Questo sistema fornisce un controllo granulare degli accessi a livello di:
1. **Endpoint** (tramite Guards e Decorators)
2. **Business Logic** (tramite RoleService nel service)
3. **Risorse Specifiche** (verifiche personalizzate)

Per la documentazione completa, vedi [ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md)
