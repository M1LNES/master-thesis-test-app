import { Task } from "./types";

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Prepare thesis proposal",
    description: "Draft the scope and timeline for the upcoming milestone.",
    priority: "High",
    status: "Todo",
    owner: "admin@test.com",
    createdAt: new Date("2026-01-01T09:00:00.000Z").toISOString()
  },
  {
    id: "task-2",
    title: "Review related papers",
    description: "Summarize 5 papers and compare methodology sections.",
    priority: "Medium",
    status: "Todo",
    owner: "user@test.com",
    createdAt: new Date("2026-01-02T09:00:00.000Z").toISOString()
  },
  {
    id: "task-3",
    title: "Set up E2E baseline",
    description: "Create deterministic test scenarios for login and dashboard.",
    priority: "Low",
    status: "Done",
    owner: "admin@test.com",
    createdAt: new Date("2026-01-03T09:00:00.000Z").toISOString()
  }
];

let tasks: Task[] = [...initialTasks];

export const getTasks = (): Task[] => tasks;

export const createTask = (task: Task): Task => {
  tasks = [task, ...tasks];
  return task;
};

export const updateTask = (id: string, payload: Partial<Omit<Task, "id" | "createdAt">>): Task | null => {
  let updated: Task | null = null;

  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    updated = {
      ...task,
      ...payload
    };

    return updated;
  });

  return updated;
};

export const deleteTask = (id: string): boolean => {
  const before = tasks.length;
  tasks = tasks.filter((task) => task.id !== id);
  return tasks.length !== before;
};
