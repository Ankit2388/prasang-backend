import { UserModel } from './user.model.js';
import { IUserDocument, CreateUserDTO } from './user.interface.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class UserService {
  public async getAllUsers(): Promise<IUserDocument[]> {
    return UserModel.find().sort({ createdAt: -1 });
  }

  public async getUserById(id: string): Promise<IUserDocument> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, `User with ID ${id} not found`);
    }
    return user;
  }

  public async getUserByMobile(mobileNumber: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ mobileNumber });
  }

  public async getUserByMobileWithPassword(mobileNumber: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ mobileNumber }).select('+password');
  }

  public async createUser(data: CreateUserDTO): Promise<IUserDocument> {
    const existingMobile = await UserModel.findOne({ mobileNumber: data.mobileNumber });
    if (existingMobile) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `User with mobile number ${data.mobileNumber} already exists`,
      );
    }

    if (data.email) {
      const existingEmail = await UserModel.findOne({ email: data.email.toLowerCase() });
      if (existingEmail) {
        throw new ApiError(StatusCodes.CONFLICT, `User with email ${data.email} already exists`);
      }
    }

    const user = new UserModel({
      mobileNumber: data.mobileNumber,
      name: data.name,
      email: data.email ? data.email.toLowerCase() : undefined,
      password: data.password,
      role: data.role,
    });

    return user.save();
  }

  public async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }
}

export const userService = new UserService();
