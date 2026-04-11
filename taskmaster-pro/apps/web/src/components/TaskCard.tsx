import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
  hideDelete: boolean;
  onToggleStatus: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
};

const priorityColor = {
  Low: "secondary",
  Medium: "default",
  High: "destructive",
} as const;

export function TaskCard({
  task,
  hideDelete,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const checkboxId = `task-status-${task.id}`;

  return (
    <Card className="border-amber-100/80 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle
              className={
                task.status === "Done"
                  ? "text-muted-foreground line-through"
                  : ""
              }
            >
              {task.title || "(Untitled Task)"}
            </CardTitle>
          </div>
          <Badge variant={priorityColor[task.priority]}>{task.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{task.description || "No description provided."}</p>
        <div className="flex items-center gap-2">
          <input
            id={checkboxId}
            type="checkbox"
            checked={task.status === "Done"}
            onChange={() => {
              void onToggleStatus(task);
            }}
            className="h-4 w-4 rounded border-input"
          />
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-foreground"
          >
            Mark as done
          </label>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button type="button" variant="outline" onClick={() => onEdit(task)}>
          Edit
        </Button>
        {!hideDelete ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              void onDelete(task);
            }}
          >
            Delete
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
