import { Request } from 'express';
import { UserRole } from '../constants/roles.js';

export interface AuthUserPayload {
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
  isAnonymous?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
