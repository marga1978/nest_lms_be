import { IsInt, IsDateString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
  @IsInt()
  userId: number;

  @IsInt()
  courseId: number;

  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade?: number;
}
