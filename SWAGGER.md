# 📖 Documentazione API con Swagger

Questo progetto include **Swagger UI** per esplorare e testare tutte le API in modo interattivo.

## 🚀 Come Accedere a Swagger

1. Avvia il server in modalità sviluppo:
   ```bash
   npm run start:dev
   ```

2. Apri il browser e vai a:
   ```
   http://localhost:3000/api
   ```

3. Vedrai l'interfaccia Swagger UI con tutte le API documentate.

## 📚 Cosa Trovi in Swagger

### Tag Disponibili

- **users** - Gestione utenti
- **user-profiles** - Profili utente (relazione 1:1 con users)
- **courses** - Gestione corsi
- **course-lessons** - Lezioni dei corsi (relazione 1:N con courses)
- **enrollments** - Iscrizioni studenti ai corsi (relazione M:N)
- **user-preferences** - Preferenze utente (MongoDB)

### Funzionalità Swagger UI

#### 🔍 Esplorare le API
- Clicca su un endpoint per vedere i dettagli
- Visualizza i parametri richiesti
- Consulta gli esempi di request/response

#### ✅ Testare le API
1. Clicca su un endpoint
2. Clicca su "Try it out"
3. Inserisci i dati (vengono precompilati con esempi)
4. Clicca su "Execute"
5. Vedi la risposta in tempo reale

#### 📋 Esempi Precompilati

Ogni endpoint ha esempi già pronti. Ad esempio per `POST /courses/with-lessons`:

```json
{
  "course": {
    "name": "JavaScript Avanzato",
    "description": "Corso completo su JavaScript ES6+",
    "code": "JS301",
    "credits": 6,
    "maxStudents": 30,
    "isActive": true
  },
  "lessons": [
    {
      "title": "Introduzione a Vue.js",
      "description": "Panoramica su Vue.js e setup dell'ambiente",
      "type": "video",
      "videoUrl": "https://example.com/vue-intro.mp4",
      "orderIndex": 1,
      "durationMinutes": 30
    }
  ]
}
```

## 🎯 Endpoint Più Importanti

### Creazione Corso con Lezioni (Transazionale) ⭐
**POST** `/courses/with-lessons`

Crea un corso e tutte le sue lezioni in un'unica transazione. Se una lezione fallisce, viene fatto rollback di tutto.

**Vantaggi:**
- ✅ Atomicità garantita
- ✅ Una sola chiamata HTTP
- ✅ Semplicità d'uso
- ✅ Consistenza dei dati

### Altre API Principali

- **POST** `/users` - Crea nuovo utente
- **POST** `/user-profiles` - Crea profilo utente (relazione 1:1)
- **POST** `/courses` - Crea solo il corso
- **POST** `/course-lessons` - Aggiungi lezione a corso esistente
- **POST** `/enrollments` - Iscrivi studente a corso
- **POST** `/enrollments/bulk` - Iscrizione multipla
- **POST** `/user-preferences` - Crea preferenze MongoDB

## 📊 Accedere alla Spec OpenAPI JSON

Se hai bisogno della specifica OpenAPI in formato JSON:

```
http://localhost:3000/api-json
```

Questo è utile per:
- Generare client API automaticamente
- Importare in Postman
- Integrare con altri tool

## 🛠️ Configurazione Swagger

La configurazione si trova in [src/main.ts](src/main.ts:22-35):

```typescript
const config = new DocumentBuilder()
  .setTitle('LMS - Learning Management System API')
  .setDescription('API per la gestione di corsi, studenti, lezioni e iscrizioni')
  .setVersion('1.0')
  .addTag('users', 'Gestione utenti')
  .addTag('courses', 'Gestione corsi')
  // ...
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

## 📝 Note

- **Validazione automatica**: Tutti i DTO hanno validazioni class-validator che sono documentate in Swagger
- **Esempi reali**: Gli esempi in Swagger usano dati realistici
- **Risposte HTTP**: Ogni endpoint documenta tutte le possibili risposte (200, 201, 400, 404, etc.)
- **Descrizioni dettagliate**: Ogni campo ha una descrizione chiara del suo scopo

## 🔗 Link Utili

- [Documentazione NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [File RELAZIONI.md](RELAZIONI.md) - Guida completa alle relazioni database
- [README principale](README.md) - Documentazione completa del progetto
