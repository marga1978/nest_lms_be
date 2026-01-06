import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO per rappresentare i dati di un corso all'interno dell'aggregazione
 * Contiene solo i campi restituiti dalla query aggregata
 */
export class CourseInUserDto {
  @ApiProperty({
    example: 'JavaScript Avanzato',
    description: 'Nome del corso'
  })
  name: string;

  @ApiProperty({
    example: 'Corso completo di JavaScript ES6+',
    description: 'Descrizione del corso'
  })
  description: string;

  @ApiProperty({
    example: 'JS301',
    description: 'Codice identificativo del corso'
  })
  code: string;

  @ApiProperty({
    example: 30,
    description: 'Numero massimo di studenti'
  })
  maxStudents: number;

  @ApiProperty({
    example: true,
    description: 'Se il corso è attivo'
  })
  isActive: boolean;
}

/**
 * DTO per rappresentare un utente con i suoi corsi aggregati
 * Usato dall'endpoint GET /enrollments/groupinguser
 */
export class UserWithCoursesDto {
  @ApiProperty({
    example: 1,
    description: 'ID dell\'utente'
  })
  id: number;

  @ApiProperty({
    example: 'mariorossi',
    description: 'Username dell\'utente'
  })
  username: string;

  @ApiProperty({
    example: 'mario.rossi@example.com',
    description: 'Email dell\'utente'
  })
  email: string;

  @ApiProperty({
    type: [CourseInUserDto],
    description: 'Array dei corsi a cui l\'utente è iscritto',
    example: [
      {
        name: 'JavaScript Avanzato',
        description: 'Corso completo di JavaScript ES6+',
        code: 'JS301',
        maxStudents: 30,
        isActive: true
      },
      {
        name: 'TypeScript Fundamentals',
        description: 'Introduzione a TypeScript',
        code: 'TS101',
        maxStudents: 25,
        isActive: true
      }
    ]
  })
  courses: CourseInUserDto[];
}
