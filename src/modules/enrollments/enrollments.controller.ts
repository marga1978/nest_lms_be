import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../../dto/enrollment.dto';
import { SwaggerExamples } from '../../swagger-examples';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea una nuova iscrizione (relazione M:N User ↔ Course)',
    description: 'Iscrive un utente a un corso. Un utente può iscriversi a più corsi e un corso può avere più studenti.'
  })
  @ApiResponse({ status: 201, description: 'Iscrizione creata con successo', schema: { example: SwaggerExamples.enrollments.create } })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  @ApiResponse({ status: 404, description: 'Utente o corso non trovato' })
  @ApiResponse({ status: 409, description: 'Utente già iscritto al corso o corso pieno' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Iscrizione multipla - Iscrive un utente a più corsi',
    description: 'Permette di iscrivere un singolo utente a più corsi contemporaneamente.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1, description: 'ID dell\'utente' },
        courseIds: { type: 'array', items: { type: 'number' }, example: [1, 2, 3], description: 'Array di ID dei corsi' }
      },
      required: ['userId', 'courseIds']
    }
  })
  @ApiResponse({ status: 201, description: 'Iscrizioni create con successo', schema: { example: SwaggerExamples.enrollments.bulk } })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  @ApiResponse({ status: 404, description: 'Utente o uno dei corsi non trovato' })
  enrollUserInMultipleCourses(
    @Body() body: { userId: number; courseIds: number[] },
  ) {
    return this.enrollmentsService.enrollUserInMultipleCourses(
      body.userId,
      body.courseIds,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutte le iscrizioni' })
  @ApiResponse({ status: 200, description: 'Lista di tutte le iscrizioni', schema: { example: SwaggerExamples.enrollments.findAll } })
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('groupinguser')
  @ApiOperation({
    summary: 'Ottieni tutte le iscrizioni raggruppate per utente',
    description: `Restituisce una vista aggregata delle iscrizioni, raggruppando i corsi per ogni utente.

    Ogni elemento della risposta contiene:
    - Informazioni dell'utente (id, username, email)
    - Array di corsi a cui l'utente è iscritto (con dettagli completi del corso)

    Utile per:
    - Dashboard studenti con tutti i loro corsi
    - Report delle iscrizioni per utente
    - Visualizzazioni aggregate`
  })
  @ApiResponse({
    status: 200,
    description: 'Lista degli utenti con i loro corsi raggruppati',
    schema: { example: SwaggerExamples.enrollments.findByUsers }
  })
  findByUsers() {
    return this.enrollmentsService.findByUsers();
  }

  

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Ottieni tutte le iscrizioni di un utente',
    description: 'Trova tutte le iscrizioni di uno specifico utente'
  })
  @ApiParam({ name: 'userId', description: 'ID dell\'utente' })
  @ApiResponse({ status: 200, description: 'Lista delle iscrizioni dell\'utente', schema: { example: SwaggerExamples.enrollments.findAll } })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.enrollmentsService.findByUser(userId);
  }

  @Get('course/:courseId')
  @ApiOperation({
    summary: 'Ottieni tutte le iscrizioni di un corso',
    description: 'Trova tutte le iscrizioni per uno specifico corso'
  })
  @ApiParam({ name: 'courseId', description: 'ID del corso' })
  @ApiResponse({ status: 200, description: 'Lista delle iscrizioni al corso', schema: { example: SwaggerExamples.enrollments.findAll } })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni una specifica iscrizione' })
  @ApiParam({ name: 'id', description: 'ID dell\'iscrizione' })
  @ApiResponse({ status: 200, description: 'Iscrizione trovata', schema: { example: SwaggerExamples.enrollments.findOne } })
  @ApiResponse({ status: 404, description: 'Iscrizione non trovata' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Aggiorna un\'iscrizione',
    description: 'Permette di aggiornare lo stato dell\'iscrizione (pending, active, completed, cancelled) e il voto finale.'
  })
  @ApiParam({ name: 'id', description: 'ID dell\'iscrizione' })
  @ApiResponse({ status: 200, description: 'Iscrizione aggiornata con successo', schema: { example: SwaggerExamples.enrollments.update } })
  @ApiResponse({ status: 404, description: 'Iscrizione non trovata' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un\'iscrizione' })
  @ApiParam({ name: 'id', description: 'ID dell\'iscrizione' })
  @ApiResponse({ status: 204, description: 'Iscrizione eliminata con successo' })
  @ApiResponse({ status: 404, description: 'Iscrizione non trovata' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
