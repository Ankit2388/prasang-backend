export interface SystemHealthStatus {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  memoryUsage: NodeJS.MemoryUsage;
}

export class HealthService {
  public getHealthStatus(): SystemHealthStatus {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: process.memoryUsage(),
    };
  }
}

export const healthService = new HealthService();
