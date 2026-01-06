import { IsString, IsEmail, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO per User - SOLO credenziali e autenticazione
 * I dati personali (firstName, lastName, dateOfBirth) sono in UserProfileDto
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'mario.rossi@example.com',
    description: 'Email dell\'utente (deve essere unica)',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'mariorossi',
    description: 'Username dell\'utente (deve essere unico)',
    minLength: 3
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Password dell\'utente',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Se l\'utente è attivo',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'nuovo.email@example.com',
    description: 'Nuova email dell\'utente',
    format: 'email'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'nuovousername',
    description: 'Nuovo username',
    minLength: 3
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'NuovaPassword123!',
    description: 'Nuova password',
    minLength: 6
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Stato attivo/inattivo dell\'utente'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
