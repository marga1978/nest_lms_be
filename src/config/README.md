# 📁 Configurazioni Centralizzate

Questa cartella contiene tutte le configurazioni dell'applicazione in modo centralizzato e type-safe.

## 📄 File di Configurazione

### `app.config.ts`
Configurazioni generali dell'applicazione:
- **port**: Porta su cui gira l'applicazione (default: 3000)
- **environment**: Ambiente di esecuzione (development, production)
- **apiPrefix**: Prefisso per le API (default: 'api')
- **corsOrigins**: Origini CORS permesse

**Variabili .env:**
```
PORT=3000
NODE_ENV=development
API_PREFIX=api
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

### `database.config.ts`
Configurazione MySQL (TypeORM):
- **type**: Tipo di database (mysql)
- **host**: Host del database
- **port**: Porta MySQL (default: 3307)
- **username**: Username database
- **password**: Password database
- **database**: Nome database
- **entities**: Array delle entità TypeORM
- **synchronize**: Auto-sync schema (solo development!)
- **logging**: Abilita logging SQL (solo development)

**Variabili .env:**
```
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=db_lms
```

### `mongodb.config.ts`
Configurazione MongoDB (Mongoose):
- **uri**: URI di connessione MongoDB

**Variabili .env:**
```
MONGODB_URI=mongodb://localhost:27017/db_lms
```

## 🔧 Come Usare le Configurazioni

### 1. In app.module.ts (già configurato)

```typescript
import configs from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('mongodb'),
    }),
  ],
})
```

### 2. In un Service o Controller

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  getAppPort() {
    return this.configService.get<number>('app.port');
  }

  getDatabaseHost() {
    return this.configService.get<string>('database.host');
  }

  getMongoUri() {
    return this.configService.get<string>('mongodb.uri');
  }
}
```

### 3. Accesso Tipizzato (raccomandato)

```typescript
// Crea un type per la configurazione
type AppConfig = {
  port: number;
  environment: string;
  apiPrefix: string;
  corsOrigins: string[];
};

// Usa il type
const appConfig = this.configService.get<AppConfig>('app');
console.log(appConfig.port); // Type-safe!
```

## ✅ Vantaggi di questa Struttura

1. **Centralizzazione**: Tutte le config in un unico posto
2. **Type Safety**: Configurazioni tipizzate
3. **Validazione**: Possibilità di validare le configurazioni al boot
4. **Environment-aware**: Diverse config per development/production
5. **Testabilità**: Facile mockare le configurazioni nei test
6. **Manutenibilità**: Chiaro dove modificare le configurazioni

## 🚀 Best Practices

1. **Mai hardcodare valori**: Usa sempre variabili d'ambiente
2. **Default sensati**: Fornisci sempre valori di default
3. **Documenta**: Aggiungi commenti per configurazioni complesse
4. **Validazione**: Valida le configurazioni obbligatorie al boot
5. **Secrets**: Non committare mai file .env con credenziali reali

## 🔐 Sicurezza

- ⚠️ Non committare mai il file `.env` su Git
- ⚠️ In produzione, usa variabili d'ambiente del sistema o secret manager
- ⚠️ `synchronize: true` va usato SOLO in development!
- ⚠️ Disabilita `logging` in produzione per performance

## 📚 Riferimenti

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [TypeORM Configuration](https://typeorm.io/data-source-options)
- [Mongoose Connection](https://mongoosejs.com/docs/connections.html)
