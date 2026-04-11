import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useBug } from "@/context/BugContext";
import {
  createTaskRequest,
  deleteTaskRequest,
  getTasksRequest,
  updateTaskRequest,
} from "@/lib/api";
import type { Task, TaskPayload } from "@/types/task";

type TaskFilter = "All" | "Active" | "Completed";

const filterValues: TaskFilter[] = ["All", "Active", "Completed"];

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { bug, isBug } = useBug();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks = await getTasksRequest();
        setTasks(loadedTasks);
      } catch {
        setError("Could not load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    void loadTasks();
  }, []);

  const visibleTasks = useMemo(() => {
    if (bug === "filter_broken" || activeFilter === "All") {
      return tasks;
    }

    if (activeFilter === "Active") {
      return tasks.filter((task) => task.status === "Todo");
    }

    return tasks.filter((task) => task.status === "Done");
  }, [activeFilter, bug, tasks]);

  const openCreateDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (filter: TaskFilter) => {
    if (isBug("filter_broken")) {
      return;
    }

    setActiveFilter(filter);
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "Todo" ? "Done" : "Todo";
    const updatedTask = await updateTaskRequest(task.id, {
      status: nextStatus,
    });

    if (isBug("status_toggle_fail")) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id ? updatedTask : currentTask,
      ),
    );
  };

  const handleDeleteTask = async (task: Task) => {
    const shouldDelete = window.confirm(`Delete task "${task.title}"?`);
    if (!shouldDelete) {
      return;
    }

    await deleteTaskRequest(task.id);
    setTasks((currentTasks) =>
      currentTasks.filter((currentTask) => currentTask.id !== task.id),
    );
  };

  const handleDialogSubmit = async (payload: TaskPayload) => {
    if (!isBug("task_no_validation") && !editingTask && !payload.title.trim()) {
      throw new Error("Title is required");
    }

    if (editingTask) {
      const updated = await updateTaskRequest(editingTask.id, payload);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updated.id ? updated : currentTask,
        ),
      );
    } else {
      const created = await createTaskRequest(payload);
      setTasks((currentTasks) => [created, ...currentTasks]);
    }

    if (!isBug("modal_wont_close")) {
      setIsDialogOpen(false);
      setEditingTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="container py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TaskMaster Pro</h1>
          <p className="text-sm text-muted-foreground">
            Local-only test target for deterministic E2E scenarios.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <Card className="mb-6 border-amber-100/80 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <fieldset
            className="flex flex-wrap items-center gap-4"
            aria-label="Task filters"
          >
            <legend className="sr-only">Task filters</legend>
            {filterValues.map((filter) => {
              const radioId = `filter-${filter.toLowerCase()}`;
              return (
                <div key={filter} className="flex items-center gap-2">
                  <input
                    id={radioId}
                    name="task-filter"
                    type="radio"
                    checked={activeFilter === filter}
                    onChange={() => handleFilterChange(filter)}
                  />
                  <label htmlFor={radioId} className="text-sm font-medium">
                    {filter}
                  </label>
                </div>
              );
            })}
          </fieldset>

          <Button type="button" onClick={openCreateDialog}>
            New Task
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading tasks...</p> : null}
      {error ? (
        <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>
      ) : null}

      {!isLoading && !error ? (
        <section
          className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"
          aria-label="Task list"
        >
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              hideDelete={isBug("delete_btn_missing")}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
          {visibleTasks.length === 0 ? (
            <Card className="border-dashed bg-white/60">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No tasks found for this filter.
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsDialogOpen(nextOpen);
          if (!nextOpen) {
            setEditingTask(null);
          }
        }}
        mode={editingTask ? "edit" : "create"}
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                priority: editingTask.priority,
              }
            : undefined
        }
        disableCreateTitleValidation={isBug("task_no_validation")}
        onSubmit={handleDialogSubmit}
      />
    </main>
  );
}
