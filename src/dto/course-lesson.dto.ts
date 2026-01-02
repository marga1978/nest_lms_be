import { IsString, IsInt, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '../entities/course-lesson.entity';

export class CreateCourseLessonDto {
  @ApiProperty({
    example: 1,
    description: 'ID del corso a cui aggiungere la lezione (relazione 1:N)'
  })
  @IsInt()
  courseId: number;

  @ApiProperty({
    example: 'Introduzione a TypeScript',
    description: 'Titolo della lezione'
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Panoramica su TypeScript e setup dell\'ambiente di sviluppo',
    description: 'Descrizione dettagliata della lezione'
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'video',
    enum: ['video', 'text', 'quiz'],
    description: 'Tipo di lezione'
  })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiPropertyOptional({
    example: 'Contenuto testuale della lezione in formato Markdown...',
    description: 'Contenuto testuale (per lezioni di tipo text o quiz)'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/videos/typescript-intro.mp4',
    description: 'URL del video (per lezioni di tipo video)'
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Ordine della lezione nel corso (0-based index)',
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({
    example: 45,
    description: 'Durata della lezione in minuti',
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Se la lezione è attiva e visibile agli studenti',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCourseLessonDto {
  @ApiPropertyOptional({
    example: 'TypeScript Avanzato',
    description: 'Nuovo titolo della lezione'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Concetti avanzati di TypeScript: generics, decorators, e type guards',
    description: 'Nuova descrizione della lezione'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'video',
    enum: ['video', 'text', 'quiz'],
    description: 'Nuovo tipo di lezione'
  })
  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @ApiPropertyOptional({
    example: 'Contenuto aggiornato della lezione...',
    description: 'Nuovo contenuto testuale'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/videos/typescript-advanced.mp4',
    description: 'Nuovo URL del video'
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Nuovo ordine della lezione',
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Nuova durata in minuti',
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Stato attivo/inattivo della lezione'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
