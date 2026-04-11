import cors from "cors";
import express, { Request, Response } from "express";

import { createTask, deleteTask, getTasks, updateTask } from "./data";
import { LoginRequest, LoginResponse, Task } from "./types";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/login", (req: Request<unknown, unknown, LoginRequest>, res: Response<LoginResponse | { message: string }>) => {
  const { email, password } = req.body;

  if (email === "admin@test.com" && password === "password123") {
    return res.json({ token: "fake-jwt-token" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

app.get("/api/tasks", (_req: Request, res: Response<Task[]>) => {
  res.json(getTasks());
});

app.post("/api/tasks", (req: Request<unknown, unknown, { title: string; description: string; priority: Task["priority"] }>, res: Response<Task | { message: string }>) => {
  const { title, description, priority } = req.body;

  if (!title || !priority) {
    return res.status(400).json({ message: "Title and priority are required" });
  }

  const task: Task = {
    id: `task-${Date.now()}`,
    title,
    description: description ?? "",
    priority,
    status: "Todo",
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
