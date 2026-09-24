import { User, CreateUserDTO } from './user.interface.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class UserService {
  // In-memory collection placeholder until database integration
  private users: User[] = [
    {
      id: 'usr_1',
      name: 'System Admin',
      email: 'admin@prasang.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  public async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  public async getUserById(id: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, `User with ID ${id} not found`);
    }
    return user;
  }

  public async createUser(data: CreateUserDTO): Promise<User> {
    const existingUser = this.users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, `User with email ${data.email} already exists`);
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }
}

export const userService = new UserService();
