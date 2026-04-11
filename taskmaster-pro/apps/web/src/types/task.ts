export type TaskPriority = 'Low' | 'Medium' | 'High'

export type TaskStatus = 'Todo' | 'Done'

export type UserRole = 'admin' | 'user'

export type AuthUser = {
  email: string
  role: UserRole
}

export type Task = {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  owner: string
  createdAt: string
}

export type TaskPayload = {
  title: string
  description: string
  priority: TaskPriority
}
