import morgan from 'morgan';
import { logger } from '../config/index.js';

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export const requestLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream },
);
