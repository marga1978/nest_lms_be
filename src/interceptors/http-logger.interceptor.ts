import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { logger } from '../config/winston.config';

// logs/
// ├── info.log      ← Solo 200-299 (successo)
// ├── http.log      ← Solo 300-399 (redirect)
// ├── warn.log      ← Solo 400-499 (errori client)
// ├── error.log     ← Solo 500+     (errori server)
// └── combined.log  ← Tutti i log insieme

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly nestLogger = new Logger(HttpLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, ip, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log della richiesta in arrivo (INFO level)
    logger.info('Incoming HTTP Request', {
      method,
      url: originalUrl,
      ip,
      userAgent,
      body: this.sanitizeBody(body),
      query,
      params,
    });

    return next.handle().pipe(
      tap((data) => {
        const { statusCode } = response;
        const responseTime = Date.now() - startTime;

        // Log della risposta in base allo status code
        if (statusCode >= 200 && statusCode < 300) {
          // Success - INFO level
          logger.info('HTTP Request Completed', {
            method,
            url: originalUrl,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
          });
        } else if (statusCode >= 300 && statusCode < 400) {
          // Redirect - HTTP level
          logger.log('http', 'HTTP Request Redirected', {
            method,
            url: originalUrl,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
          });
        } else if (statusCode >= 400 && statusCode < 500) {
          // Client Error - WARN level
          logger.warn('HTTP Client Error', {
            method,
            url: originalUrl,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
            body: this.sanitizeBody(body),
          });
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Determina il livello di log in base allo status code
        if (statusCode >= 400 && statusCode < 500) {
          // Client Error (4xx) - WARN level
          logger.warn('HTTP Client Error', {
            method,
            url: originalUrl,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
            error: error.message,
            stack: error.stack,
            body: this.sanitizeBody(body),
          });
        } else {
          // Server Error (5xx) - ERROR level
          logger.error('HTTP Server Error', {
            method,
            url: originalUrl,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
            error: error.message,
            stack: error.stack,
            body: this.sanitizeBody(body),
          });
        }

        // Rilancia l'errore per permettere la normale gestione
        throw error;
      }),
    );
  }

  /**
   * Sanitizza il body rimuovendo informazioni sensibili
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
