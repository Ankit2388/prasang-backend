import { Server } from 'http';
import { app } from './app.js';
import { env, logger, connectDatabase, disconnectDatabase } from './config/index.js';

let server: Server;

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDatabase();

    // 2. Start Express HTTP Server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Prasang Server is running on port: ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📍 Base API URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`🏥 Health Check URL: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    });
  } catch (error) {
    logger.error(`💥 Startup error: Failed to initialize database connection.\n${error}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error(`💥 UNHANDLED REJECTION! Shutting down process...\n${reason?.stack || reason}`);

  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error(`💥 UNCAUGHT EXCEPTION! Shutting down process...\n${error?.stack || error}`);
  process.exit(1);
});

// Handle graceful shutdown (SIGTERM & SIGINT)
const gracefulShutdown = (signal: string) => {
  logger.info(`⚠️ ${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed. Disconnecting from database...');
      await disconnectDatabase();
      logger.info('Exiting process.');
      process.exit(0);
    });
  } else {
    disconnectDatabase()
      .then(() => {
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

void startServer();
