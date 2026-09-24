import { Response } from 'express';
import { StatusCodes } from '../constants/index.js';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  public static send<T>({
    res,
    statusCode = StatusCodes.OK,
    message = 'Success',
    data,
    meta,
  }: ApiResponseOptions<T>): Response {
    return res.status(statusCode).json({
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    });
  }

  public static success<T>(
    res: Response,
    message = 'Request successful',
    data?: T,
    statusCode = StatusCodes.OK,
    meta?: Record<string, unknown>,
  ): Response {
    return ApiResponse.send({ res, statusCode, message, data, meta });
  }

  public static created<T>(
    res: Response,
    message = 'Resource created successfully',
    data?: T,
    meta?: Record<string, unknown>,
  ): Response {
    return ApiResponse.send({ res, statusCode: StatusCodes.CREATED, message, data, meta });
  }
}
