import { IsString, IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserProfileDto {
  @ApiProperty({
    example: 1,
    description: 'ID dell\'utente a cui associare il profilo (relazione 1:1)'
  })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    example: 'Mario',
    description: 'Nome dell\'utente'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Rossi',
    description: 'Cognome dell\'utente'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '1990-05-15',
    description: 'Data di nascita (formato ISO 8601)',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: '+39 333 1234567',
    description: 'Numero di telefono'
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'Sviluppatore Full Stack appassionato di tecnologia',
    description: 'Biografia dell\'utente'
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar/mario-rossi.jpg',
    description: 'URL dell\'immagine del profilo'
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    example: 'Giovanni',
    description: 'Nome dell\'utente'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Bianchi',
    description: 'Cognome dell\'utente'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '1985-12-20',
    description: 'Data di nascita (formato ISO 8601)',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: '+39 333 9876543',
    description: 'Numero di telefono'
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'Sviluppatore con 10 anni di esperienza in NestJS',
    description: 'Biografia dell\'utente'
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar/new-avatar.jpg',
    description: 'URL dell\'immagine del profilo'
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
