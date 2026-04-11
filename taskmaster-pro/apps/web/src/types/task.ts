export type TaskPriority = 'Low' | 'Medium' | 'High'

export type TaskStatus = 'Todo' | 'Done'

export type Task = {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
}

export type TaskPayload = {
  title: string
  description: string
  priority: TaskPriority
}
