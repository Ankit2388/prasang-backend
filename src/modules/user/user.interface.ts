import { Document } from 'mongoose';
import { UserRole } from '../../constants/roles.js';

export interface IUser {
  mobileNumber: string;
  firstName: string;
  lastName?: string;
  email?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
}

export interface CreateUserDTO {
  mobileNumber: string;
  firstName: string;
  lastName?: string;
  password?: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponseDTO {
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
