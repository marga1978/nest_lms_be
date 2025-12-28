import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

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
