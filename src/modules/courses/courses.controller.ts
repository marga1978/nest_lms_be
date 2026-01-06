import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CreateCourseWithLessonsDto } from './dto/course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo corso' })
  @ApiResponse({
    status: 201,
    description: 'Corso creato con successo',
    schema: {
      example: {
        id: 1,
        name: 'JavaScript Avanzato',
        description: 'Corso completo su JavaScript ES6+',
        code: 'JS301',
        credits: 6,
        maxStudents: 30,
        isActive: true,
        createdAt: '2026-01-02T10:00:00.000Z',
        updatedAt: '2026-01-02T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Post('with-lessons')
  @ApiOperation({
    summary: 'Crea un corso con le sue lezioni in un\'unica transazione',
    description: 'Permette di creare un corso e tutte le sue lezioni in una singola chiamata API transazionale. Se una lezione fallisce, l\'intero corso viene annullato.'
  })
  @ApiResponse({
    status: 201,
    description: 'Corso e lezioni creati con successo',
    schema: {
      example: {
        id: 6,
        name: 'Vue.js Masterclass',
        description: 'Corso completo su Vue.js 3 con Composition API',
        code: 'VUE301',
        credits: 8,
        maxStudents: 25,
        isActive: true,
        createdAt: '2026-01-02T10:43:53.026Z',
        updatedAt: '2026-01-02T10:43:53.026Z',
        enrollments: [],
        lessons: [
          {
            id: 1,
            courseId: 6,
            title: 'Introduzione a Vue.js',
            description: 'Panoramica su Vue.js e setup dell\'ambiente',
            type: 'video',
            content: null,
            videoUrl: 'https://example.com/vue-intro.mp4',
            orderIndex: 1,
            durationMinutes: 30,
            isActive: true,
            createdAt: '2026-01-02T10:43:53.036Z',
            updatedAt: '2026-01-02T10:43:53.036Z'
          },
          {
            id: 2,
            courseId: 6,
            title: 'Reactive Data con Vue 3',
            description: 'Approfondimento su ref, reactive e computed',
            type: 'video',
            content: null,
            videoUrl: 'https://example.com/vue-reactive.mp4',
            orderIndex: 2,
            durationMinutes: 45,
            isActive: true,
            createdAt: '2026-01-02T10:43:53.047Z',
            updatedAt: '2026-01-02T10:43:53.047Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  createWithLessons(@Body() createCourseWithLessonsDto: CreateCourseWithLessonsDto) {
    return this.coursesService.createWithLessons(createCourseWithLessonsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i corsi' })
  @ApiResponse({
    status: 200,
    description: 'Lista di tutti i corsi con enrollments e lessons',
    schema: {
      example: [
        {
          id: 1,
          name: 'JavaScript Avanzato',
          description: 'Corso completo su JavaScript ES6+',
          code: 'JS301',
          credits: 6,
          maxStudents: 30,
          isActive: true,
          createdAt: '2026-01-02T10:00:00.000Z',
          updatedAt: '2026-01-02T10:00:00.000Z',
          enrollments: [
            {
              id: 1,
              userId: 1,
              courseId: 1,
              enrollmentDate: '2026-01-02T10:00:00.000Z',
              status: 'active',
              grade: null
            }
          ],
          lessons: [
            {
              id: 1,
              courseId: 1,
              title: 'Introduzione a JavaScript',
              type: 'video',
              orderIndex: 1,
              durationMinutes: 45
            }
          ]
        }
      ]
    }
  })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un corso specifico' })
  @ApiParam({ name: 'id', description: 'ID del corso' })
  @ApiResponse({
    status: 200,
    description: 'Corso trovato',
    schema: {
      example: {
        id: 1,
        name: 'JavaScript Avanzato',
        description: 'Corso completo su JavaScript ES6+',
        code: 'JS301',
        credits: 6,
        maxStudents: 30,
        isActive: true,
        createdAt: '2026-01-02T10:00:00.000Z',
        updatedAt: '2026-01-02T10:00:00.000Z',
        enrollments: [
          {
            id: 1,
            userId: 1,
            user: {
              id: 1,
              email: 'mario.rossi@example.com',
              username: 'mariorossi'
            },
            enrollmentDate: '2026-01-02T10:00:00.000Z',
            status: 'active',
            grade: null
          }
        ],
        lessons: [
          {
            id: 1,
            title: 'Introduzione a JavaScript',
            description: 'Panoramica su JS',
            type: 'video',
            videoUrl: 'https://example.com/video.mp4',
            orderIndex: 1,
            durationMinutes: 45,
            isActive: true
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un corso' })
  @ApiParam({ name: 'id', description: 'ID del corso' })
  @ApiResponse({
    status: 200,
    description: 'Corso aggiornato con successo',
    schema: {
      example: {
        id: 1,
        name: 'JavaScript Avanzato - Edizione 2026',
        description: 'Corso completo su JavaScript ES6+ aggiornato',
        code: 'JS301',
        credits: 8,
        maxStudents: 35,
        isActive: true,
        createdAt: '2026-01-02T10:00:00.000Z',
        updatedAt: '2026-01-02T11:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un corso' })
  @ApiParam({ name: 'id', description: 'ID del corso' })
  @ApiResponse({ status: 204, description: 'Corso eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Corso non trovato' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
