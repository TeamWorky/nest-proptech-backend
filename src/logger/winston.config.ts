import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from './entities/log.entity';

/**
 * Creates Winston logger configuration
 */
export const createWinstonConfig = (
  configService: ConfigService,
  databaseTransport?: any,
) => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const logLevel = configService.get<string>('LOG_LEVEL') || 'info';

  const transports: winston.transport[] = [];

  // Console transport for development
  if (nodeEnv === 'development') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            const contextStr = context ? `[${context}]` : '';
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
          }),
        ),
      }),
    );
  } else {
    // Production: simple console format
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  // Database transport if provided
  if (databaseTransport) {
    transports.push(
      new winston.transports.Stream({
        stream: databaseTransport,
        format: winston.format.json(),
      }),
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports,
    // Handle uncaught exceptions
    exceptionHandlers: transports,
    // Handle unhandled promise rejections
    rejectionHandlers: transports,
  };
};
