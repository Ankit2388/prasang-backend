import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error.js';
import { StatusCodes } from '../constants/index.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new ApiError(
    StatusCodes.NOT_FOUND,
    `Resource not found - [${req.method}] ${req.originalUrl}`,
  );
  next(error);
};
