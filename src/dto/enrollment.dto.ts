import { IsInt, IsDateString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID dell\'utente da iscrivere al corso'
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del corso a cui iscrivere l\'utente'
  })
  @IsInt()
  courseId: number;

  @ApiPropertyOptional({
    example: '2026-01-02T10:00:00Z',
    description: 'Data di iscrizione (formato ISO 8601). Se non specificata, usa la data corrente.',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiPropertyOptional({
    example: 'pending',
    enum: ['pending', 'active', 'completed', 'cancelled'],
    description: 'Stato dell\'iscrizione',
    default: 'pending'
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({
    example: 'active',
    enum: ['pending', 'active', 'completed', 'cancelled'],
    description: 'Nuovo stato dell\'iscrizione'
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({
    example: 95.5,
    description: 'Voto finale del corso (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade?: number;
}
