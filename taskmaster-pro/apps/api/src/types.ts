export type TaskPriority = "Low" | "Medium" | "High";

export type TaskStatus = "Todo" | "Done";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  owner: string;
  createdAt: string;
};

export type UserRole = "admin" | "user";

export type User = {
  email: string;
  role: UserRole;
};

export type StoredUser = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
  user: User;
};
