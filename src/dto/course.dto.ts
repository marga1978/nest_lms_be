import { IsString, IsInt, IsBoolean, IsOptional, Min, ValidateNested, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '../entities/course-lesson.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'JavaScript Avanzato', description: 'Nome del corso' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Corso completo su JavaScript ES6+', description: 'Descrizione dettagliata del corso' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'JS301', description: 'Codice univoco del corso' })
  @IsString()
  code: string;

  @ApiProperty({ example: 6, description: 'Numero di crediti formativi', minimum: 1 })
  @IsInt()
  @Min(1)
  credits: number;

  @ApiPropertyOptional({ example: 30, description: 'Numero massimo di studenti', minimum: 1, default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;

  @ApiPropertyOptional({ example: true, description: 'Se il corso è attivo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO per le lezioni quando si crea un corso con lezioni
export class CreateLessonForCourseDto {
  @ApiProperty({ example: 'Introduzione a JavaScript', description: 'Titolo della lezione' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Panoramica su JavaScript e setup ambiente', description: 'Descrizione della lezione' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'video', enum: ['video', 'text', 'quiz'], description: 'Tipo di lezione' })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiPropertyOptional({ example: 'Contenuto testuale della lezione...', description: 'Contenuto per lezioni di tipo text' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4', description: 'URL del video per lezioni di tipo video' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ example: 1, description: 'Ordine della lezione nel corso', minimum: 0 })
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ example: 45, description: 'Durata in minuti', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: true, description: 'Se la lezione è attiva', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO per creare un corso con le sue lezioni in un'unica chiamata
export class CreateCourseWithLessonsDto {
  @ApiProperty({ type: CreateCourseDto, description: 'Dati del corso da creare' })
  @ValidateNested()
  @Type(() => CreateCourseDto)
  course: CreateCourseDto;

  @ApiProperty({
    type: [CreateLessonForCourseDto],
    description: 'Array delle lezioni da creare',
    example: [{
      title: 'Introduzione a Vue.js',
      description: 'Panoramica su Vue.js e setup dell\'ambiente',
      type: 'video',
      videoUrl: 'https://example.com/vue-intro.mp4',
      orderIndex: 1,
      durationMinutes: 30
    }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonForCourseDto)
  lessons: CreateLessonForCourseDto[];
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  credits?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
