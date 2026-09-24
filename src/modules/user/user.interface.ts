export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'caterer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role?: 'user' | 'caterer' | 'admin';
}
