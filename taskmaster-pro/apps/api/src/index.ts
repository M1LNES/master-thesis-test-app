import cors from "cors";
import express, { Request, Response } from "express";

import { createTask, deleteTask, getTasks, updateTask } from "./data";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  StoredUser,
  Task,
} from "./types";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let users: StoredUser[] = [
  {
    fullName: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "admin"
  },
  {
    fullName: "Regular User",
    email: "user@test.com",
    password: "password123",
    role: "user"
  }
];

app.post("/api/login", (req: Request<unknown, unknown, LoginRequest>, res: Response<LoginResponse | { message: string }>) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((item) => item.email === normalizedEmail && item.password === password);

  if (user) {
    return res.json({
      token: `fake-jwt-token-${user.role}`,
      user: {
        email: user.email,
        role: user.role
      }
    });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

app.post("/api/register", (req: Request<unknown, unknown, RegisterRequest>, res: Response<RegisterResponse | { message: string }>) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = users.find((item) => item.email === normalizedEmail);

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user: StoredUser = {
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: "user"
  };

  users = [...users, user];

  return res.status(201).json({
    message: "Registration successful",
    user: {
      email: user.email,
      role: user.role
    }
  });
});

app.get("/api/tasks", (_req: Request, res: Response<Task[]>) => {
  res.json(getTasks());
});

app.post("/api/tasks", (req: Request<unknown, unknown, { title: string; description: string; priority: Task["priority"]; owner: string }>, res: Response<Task | { message: string }>) => {
  const { title, description, priority, owner } = req.body;

  if (!title || !priority || !owner) {
    return res.status(400).json({ message: "Title, priority, and owner are required" });
  }

  const task: Task = {
    id: `task-${Date.now()}`,
    title,
    description: description ?? "",
    priority,
    status: "Todo",
    owner,
    createdAt: new Date().toISOString()
  };

  res.status(201).json(createTask(task));
});

app.put("/api/tasks/:id", (req: Request<{ id: string }, unknown, Partial<Omit<Task, "id" | "createdAt">>>, res: Response<Task | { message: string }>) => {
  const updated = updateTask(req.params.id, req.body);

  if (!updated) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.json(updated);
});

app.delete("/api/tasks/:id", (req: Request<{ id: string }>, res: Response<{ success: boolean; message?: string }>) => {
  const success = deleteTask(req.params.id);

  if (!success) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
