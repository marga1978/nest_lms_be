import { IsString, IsInt, IsBoolean, IsOptional, Min, ValidateNested, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LessonType } from '../entities/course-lesson.entity';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  code: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO per le lezioni quando si crea un corso con lezioni
export class CreateLessonForCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO per creare un corso con le sue lezioni in un'unica chiamata
export class CreateCourseWithLessonsDto {
  @ValidateNested()
  @Type(() => CreateCourseDto)
  course: CreateCourseDto;

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
