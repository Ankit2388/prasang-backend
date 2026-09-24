import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/index.js';
import { requestLogger, errorHandler, notFoundHandler } from './middlewares/index.js';
import { appRouter } from './routes/index.js';

const createApp = (): Application => {
  const app: Application = express();

  // Security headers middleware
  app.use(helmet());

  // Enable CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Request logging middleware
  app.use(requestLogger);

  // Body parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root welcome endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'prasang-server',
      version: '1.0.0',
      description: 'Prasang API Services Infrastructure',
      documentation: `${env.API_PREFIX}/health`,
    });
  });

  // Mount API routers
  app.use(appRouter);

  // Handle 404 - Not Found routes
  app.use(notFoundHandler);

  // Centralized Error Handler Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
