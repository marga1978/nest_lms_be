import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CourseLessonsService } from './course-lessons.service';
import { CreateCourseLessonDto, UpdateCourseLessonDto } from '../../dto/course-lesson.dto';

@ApiTags('course-lessons')
@Controller('course-lessons')
export class CourseLessonsController {
  constructor(private readonly courseLessonsService: CourseLessonsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea una nuova lezione per un corso (relazione 1:N)',
    description: 'Aggiunge una lezione a un corso esistente. Ogni corso può avere più lezioni.'
  })
  @ApiResponse({ status: 201, description: 'Lezione creata con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  create(@Body() createCourseLessonDto: CreateCourseLessonDto) {
    return this.courseLessonsService.create(createCourseLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutte le lezioni' })
  @ApiResponse({ status: 200, description: 'Lista di tutte le lezioni ordinate per orderIndex' })
  findAll() {
    return this.courseLessonsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni una lezione specifica' })
  @ApiParam({ name: 'id', description: 'ID della lezione' })
  @ApiResponse({ status: 200, description: 'Lezione trovata' })
  @ApiResponse({ status: 404, description: 'Lezione non trovata' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseLessonsService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiOperation({
    summary: 'Ottieni tutte le lezioni di un corso',
    description: 'Trova tutte le lezioni associate a uno specifico corso (relazione 1:N)'
  })
  @ApiParam({ name: 'courseId', description: 'ID del corso' })
  @ApiResponse({ status: 200, description: 'Lista delle lezioni del corso' })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseLessonsService.findByCourse(courseId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna una lezione' })
  @ApiParam({ name: 'id', description: 'ID della lezione' })
  @ApiResponse({ status: 200, description: 'Lezione aggiornata con successo' })
  @ApiResponse({ status: 404, description: 'Lezione non trovata' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseLessonDto: UpdateCourseLessonDto,
  ) {
    return this.courseLessonsService.update(id, updateCourseLessonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una lezione' })
  @ApiParam({ name: 'id', description: 'ID della lezione' })
  @ApiResponse({ status: 204, description: 'Lezione eliminata con successo' })
  @ApiResponse({ status: 404, description: 'Lezione non trovata' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseLessonsService.remove(id);
  }
}
