import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TaskPayload, TaskPriority } from "@/types/task";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: TaskPayload;
  disableCreateTitleValidation: boolean;
  onSubmit: (payload: TaskPayload) => Promise<void>;
};

const defaultFormState: TaskPayload = {
  title: "",
  description: "",
  priority: "Medium",
};

export function TaskDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  disableCreateTitleValidation,
  onSubmit,
}: TaskDialogProps) {
  const [formState, setFormState] = useState<TaskPayload>(defaultFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(initialValues ?? defaultFormState);
    setError(null);
  }, [initialValues, open]);

  const titleIsRequired = useMemo(() => {
    if (mode === "edit") {
      return true;
    }

    return !disableCreateTitleValidation;
  }, [disableCreateTitleValidation, mode]);

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (titleIsRequired && !formState.title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        ...formState,
        title: formState.title,
      });
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("Could not save task");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const dialogTitle = mode === "create" ? "Create New Task" : "Edit Task";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a task to your workflow."
              : "Update your task details."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onFormSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              required={titleIsRequired}
              placeholder="Enter task title"
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              placeholder="Add optional details"
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <select
              id="task-priority"
              name="priority"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formState.priority}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  priority: event.target.value as TaskPriority,
                }))
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
