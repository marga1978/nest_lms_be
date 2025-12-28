import { IsString, IsEmail, IsBoolean, IsOptional, MinLength } from 'class-validator';

/**
 * DTO per User - SOLO credenziali e autenticazione
 * I dati personali (firstName, lastName, dateOfBirth) sono in UserProfileDto
 */
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
