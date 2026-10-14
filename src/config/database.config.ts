import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from './logger.config.js';

/**
 * Configure Mongoose event listeners for monitoring connection health
 */
const setupConnectionEvents = (): void => {
  mongoose.connection.on('connected', () => {
    logger.info('🍃 MongoDB database connection established successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`💥 MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB connection disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('🔄 MongoDB connection reestablished');
  });
};

setupConnectionEvents();

/**
 * Connect to MongoDB Atlas database
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    logger.info('🍃 MongoDB already connected');
    return mongoose;
  }

  try {
    logger.info('⏳ Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: 'prasang',
      autoIndex: env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    return conn;
  } catch (error) {
    logger.error(`💥 Failed to connect to MongoDB Atlas: ${error}`);
    throw error;
  }
};

/**
 * Gracefully disconnect from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      logger.info('🔌 MongoDB connection closed gracefully');
    } catch (error) {
      logger.error(`💥 Error disconnecting from MongoDB: ${error}`);
    }
  }
};
