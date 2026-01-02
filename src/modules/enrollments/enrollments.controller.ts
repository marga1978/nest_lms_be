import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../../dto/enrollment.dto';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea una nuova iscrizione (relazione M:N User ↔ Course)',
    description: 'Iscrive un utente a un corso. Un utente può iscriversi a più corsi e un corso può avere più studenti.'
  })
  @ApiResponse({ status: 201, description: 'Iscrizione creata con successo' })
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
  @ApiResponse({ status: 201, description: 'Iscrizioni create con successo' })
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
  @ApiOperation({
    summary: 'Ottieni iscrizioni con filtri opzionali',
    description: 'Ottiene tutte le iscrizioni, oppure filtra per utente o per corso usando i query params.'
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtra per ID utente', example: 1 })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filtra per ID corso', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista delle iscrizioni (tutte o filtrate)' })
  findAll(
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
  ) {
    if (userId) {
      return this.enrollmentsService.findByUser(parseInt(userId));
    }
    if (courseId) {
      return this.enrollmentsService.findByCourse(parseInt(courseId));
    }
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni una specifica iscrizione' })
  @ApiParam({ name: 'id', description: 'ID dell\'iscrizione' })
  @ApiResponse({ status: 200, description: 'Iscrizione trovata' })
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
  @ApiResponse({ status: 200, description: 'Iscrizione aggiornata con successo' })
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
