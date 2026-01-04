import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'create_courses',
    description: 'Nome univoco del permesso'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Creare nuovi corsi',
    description: 'Descrizione del permesso'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'courses',
    description: 'Categoria del permesso (users, courses, content, assessments, reports, system)'
  })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'create_courses',
    description: 'Nome univoco del permesso'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Creare nuovi corsi',
    description: 'Descrizione del permesso'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'courses',
    description: 'Categoria del permesso'
  })
  @IsOptional()
  @IsString()
  category?: string;
}
