import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Abilita la validazione globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Abilita CORS se necessario
  app.enableCors();

  // Configurazione Swagger
  const config = new DocumentBuilder()
    .setTitle('LMS - Learning Management System API')
    .setDescription('API per la gestione di corsi, studenti, lezioni e iscrizioni con MySQL e MongoDB')
    .setVersion('1.0')
    .addTag('users', 'Gestione utenti')
    .addTag('user-profiles', 'Profili utente (relazione 1:1 con users)')
    .addTag('courses', 'Gestione corsi')
    .addTag('course-lessons', 'Lezioni dei corsi (relazione 1:N con courses)')
    .addTag('enrollments', 'Iscrizioni studenti ai corsi (relazione M:N)')
    .addTag('user-preferences', 'Preferenze utente (MongoDB)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Applicazione in esecuzione su: http://localhost:${port}`);
  console.log(`📖 Documentazione Swagger: http://localhost:${port}/api`);
  console.log(`📚 Endpoints disponibili:`);
  console.log(`\n   👤 Utenti (con Profili 1:1 e Iscrizioni M:N):`);
  console.log(`   - GET/POST    /users`);
  console.log(`   - GET/PATCH/DELETE /users/:id`);
  console.log(`   - GET/POST    /user-profiles`);
  console.log(`   - GET         /user-profiles/user/:userId`);
  console.log(`   - GET/PATCH/DELETE /user-profiles/:id`);
  console.log(`\n   📚 Corsi (con Lezioni 1:N):`);
  console.log(`   - GET/POST    /courses`);
  console.log(`   - POST        /courses/with-lessons (transazionale)`);
  console.log(`   - GET/PATCH/DELETE /courses/:id`);
  console.log(`   - GET/POST    /course-lessons`);
  console.log(`   - GET         /course-lessons/course/:courseId`);
  console.log(`   - GET/PATCH/DELETE /course-lessons/:id`);
  console.log(`\n   📝 Iscrizioni (User ↔ Course M:N):`);
  console.log(`   - GET/POST    /enrollments`);
  console.log(`   - POST        /enrollments/bulk`);
  console.log(`   - GET/PATCH/DELETE /enrollments/:id`);
  console.log(`   - GET         /enrollments?userId=X`);
  console.log(`   - GET         /enrollments?courseId=X`);
  console.log(`\n   ⚙️  Preferenze (MongoDB):`);
  console.log(`   - GET/POST    /user-preferences`);
  console.log(`   - GET/PUT/DELETE /user-preferences/:userId`);
}

bootstrap();
