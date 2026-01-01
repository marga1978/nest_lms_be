import * as winston from 'winston';
import * as path from 'path';

// Definizione dei formati
const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato personalizzato per i log testuali (solo console)
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;

  // Aggiungi metadata se presente
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  // Aggiungi stack trace se presente
  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

// Filtro per loggare solo uno specifico livello
const levelFilter = (targetLevel: string) => {
  return winston.format((info) => {
    return info.level === targetLevel ? info : false;
  })();
};

// Formato JSON con ordine consistente dei campi
const orderedJson = winston.format.printf((info) => {
  // Ordine dei campi: i più importanti prima
  const ordered: any = {
    timestamp: info.timestamp,
    level: info.level,
    message: info.message,
  };

  // Aggiungi statusCode se presente (per risposte HTTP)
  if (info.statusCode !== undefined) {
    ordered.statusCode = info.statusCode;
  }

  // Aggiungi metodo e URL (sempre presenti nelle richieste HTTP)
  if (info.method) ordered.method = info.method;
  if (info.url) ordered.url = info.url;

  // Aggiungi tempo di risposta se presente
  if (info.responseTime) ordered.responseTime = info.responseTime;

  // Aggiungi informazioni client
  if (info.ip) ordered.ip = info.ip;
  if (info.userAgent) ordered.userAgent = info.userAgent;

  // Aggiungi errore se presente
  if (info.error) ordered.error = info.error;

  // Aggiungi parametri della richiesta
  if (info.params && Object.keys(info.params).length > 0) ordered.params = info.params;
  if (info.query && Object.keys(info.query).length > 0) ordered.query = info.query;
  if (info.body && Object.keys(info.body).length > 0) ordered.body = info.body;

  // Aggiungi stack trace alla fine (è lungo)
  if (info.stack) ordered.stack = info.stack;

  return JSON.stringify(ordered);
});

// Configurazione dei trasporti per i diversi livelli di log
export const winstonConfig = {
  transports: [
    // Console transport per tutti i log
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat,
      ),
    }),

    // File transport per i log di tipo ERROR (formato JSON ordinato)
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        orderedJson,
      ),
    }),

    // File transport per i log di tipo WARN (solo warn, formato JSON ordinato)
    new winston.transports.File({
      filename: path.join('logs', 'warn.log'),
      level: 'warn',
      format: combine(
        levelFilter('warn'),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        orderedJson,
      ),
    }),

    // File transport per i log di tipo INFO (solo info, formato JSON ordinato)
    new winston.transports.File({
      filename: path.join('logs', 'info.log'),
      level: 'info',
      format: combine(
        levelFilter('info'),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        orderedJson,
      ),
    }),

    // File transport per i log di tipo HTTP (solo http, formato JSON ordinato)
    new winston.transports.File({
      filename: path.join('logs', 'http.log'),
      level: 'http',
      format: combine(
        levelFilter('http'),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        orderedJson,
      ),
    }),

    // File transport per tutti i log combinati (formato JSON ordinato)
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        orderedJson,
      ),
    }),
  ],
};

// Crea l'istanza del logger
export const logger = winston.createLogger(winstonConfig);
