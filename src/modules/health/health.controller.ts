import { Request, Response } from 'express';
import { healthService } from './health.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';

export class HealthController {
  public checkHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const healthData = healthService.getHealthStatus();
    ApiResponse.success(res, 'System is healthy and operational', healthData);
  });
}

export const healthController = new HealthController();
