import mongoose from 'mongoose';

export interface SystemHealthStatus {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    connected: boolean;
    readyState: number;
    stateLabel: string;
  };
  memoryUsage: NodeJS.MemoryUsage;
}

const readyStateLabels: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export class HealthService {
  public getHealthStatus(): SystemHealthStatus {
    const readyState = mongoose.connection.readyState;
    const isDbConnected = readyState === 1;

    return {
      status: isDbConnected ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: isDbConnected,
        readyState,
        stateLabel: readyStateLabels[readyState] || 'unknown',
      },
      memoryUsage: process.memoryUsage(),
    };
  }
}

export const healthService = new HealthService();
