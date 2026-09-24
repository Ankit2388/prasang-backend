import { Request, Response } from 'express';
import { userService } from './user.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';

export class UserController {
  public getUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const users = await userService.getAllUsers();
    ApiResponse.success(res, 'Users retrieved successfully', users);
  });

  public getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    ApiResponse.success(res, 'User retrieved successfully', user);
  });

  public createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.createUser(req.body);
    ApiResponse.created(res, 'User created successfully', user);
  });
}

export const userController = new UserController();
