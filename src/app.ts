import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env, swaggerSpec, customSwaggerUiOptions } from './config/index.js';
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

  // Handle common browser probes (favicon & DevTools)
  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
  });
  app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
    res.status(204).end();
  });

  // Swagger Documentation Endpoints (/api-docs & /api-docs.json)
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(
    '/api-docs',
    (_req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: validator.swagger.io;",
      );
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, customSwaggerUiOptions),
  );

  // Root welcome endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'prasang-server',
      version: '1.0.0',
      description: 'Prasang API Services Infrastructure',
      documentation: '/api-docs',
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
