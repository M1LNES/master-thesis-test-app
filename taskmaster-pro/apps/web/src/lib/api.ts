import type { Task, TaskPayload, TaskStatus } from '@/types/task'

const API_BASE_URL = 'http://localhost:3001/api'

type LoginSuccess = {
  ok: true
  token: string
}

type LoginFailure = {
  ok: false
  status: number
  message: string
}

export type LoginResult = LoginSuccess | LoginFailure

function readErrorMessage(payload: unknown): string {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = payload.message
    if (typeof message === 'string') {
      return message
    }
  }

  return 'Request failed'
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text) as T
}

export async function loginRequest(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (response.ok) {
    const payload = await parseJson<{ token: string }>(response)
    return {
      ok: true,
      token: payload?.token ?? '',
    }
  }

  const errorPayload = await parseJson<{ message?: string }>(response)
  return {
    ok: false,
    status: response.status,
    message: errorPayload?.message ?? 'Invalid credentials',
  }
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  const payload = await parseJson<T | { message?: string }>(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload))
  }

  return payload as T
}

export async function getTasksRequest(): Promise<Task[]> {
  return requestJson<Task[]>(`${API_BASE_URL}/tasks`)
}

export async function createTaskRequest(payload: TaskPayload): Promise<Task> {
  return requestJson<Task>(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function updateTaskRequest(
  id: string,
  payload: Partial<TaskPayload & { status: TaskStatus }>,
): Promise<Task> {
  return requestJson<Task>(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function deleteTaskRequest(id: string): Promise<void> {
  await requestJson<{ success: boolean }>(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  })
}
