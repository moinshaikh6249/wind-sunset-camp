import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../logs');

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const devConsoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaKeys = Object.keys(meta).filter((key) => key !== 'service');
    const metaString = metaKeys.length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaString}`;
  })
);

const isServerlessOrProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

const transports = [
  new winston.transports.Console({
    format: isServerlessOrProd ? baseFormat : devConsoleFormat,
  }),
];

if (!isServerlessOrProd) {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: baseFormat,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: baseFormat,
      })
    );
  } catch {
    // Fallback safely if filesystem is restricted
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'wind-sunset-backend' },
  transports,
});

export default logger;
