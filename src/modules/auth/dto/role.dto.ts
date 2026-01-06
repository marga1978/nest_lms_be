import { IsString, IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'teacher',
    description: 'Nome univoco del ruolo'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Docente - crea e gestisce corsi',
    description: 'Descrizione del ruolo'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 3,
    description: 'Livello gerarchico (1 = massimo)',
    minimum: 1
  })
  @IsInt()
  @Min(1)
  level: number;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Array di ID dei permessi da assegnare al ruolo',
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'teacher',
    description: 'Nome univoco del ruolo'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Docente - crea e gestisce corsi',
    description: 'Descrizione del ruolo'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Livello gerarchico (1 = massimo)',
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Array di ID dei permessi da assegnare al ruolo',
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}

export class AssignRoleToUserDto {
  @ApiProperty({
    example: 1,
    description: 'ID del ruolo da assegnare'
  })
  @IsInt()
  roleId: number;

  @ApiProperty({
    example: 5,
    description: 'ID dell\'utente a cui assegnare il ruolo'
  })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'Data di scadenza del ruolo (opzionale per ruoli temporanei)'
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class AssignCourseRoleDto {
  @ApiProperty({
    example: 1,
    description: 'ID del corso'
  })
  @IsInt()
  courseId: number;

  @ApiProperty({
    example: 5,
    description: 'ID dell\'utente'
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 3,
    description: 'ID del ruolo da assegnare per questo corso'
  })
  @IsInt()
  roleId: number;
}
