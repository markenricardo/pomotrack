import api from "./axios";

export type BackendPriority = "high" | "medium" | "low";

export type BackendTaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked";

export type BackendTask = {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  priority?: BackendPriority | null;
  status: BackendTaskStatus;
  parent_id?: number | null;
  color_code?: string | null;
  estimated_duration?: number | null;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  priority?: BackendPriority | null;
  status?: BackendTaskStatus;
  parent_id?: number | null;
  color_code?: string | null;
  estimated_duration?: number | null;
  deadline?: string | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export async function getTasks() {
  const response = await api.get<BackendTask[]>("/api/v1/tasks/");
  return response.data;
}

export async function createTask(payload: CreateTaskPayload) {
  const response = await api.post<BackendTask>("/api/v1/tasks/", payload);
  return response.data;
}

export async function updateTask(id: number, payload: UpdateTaskPayload) {
  const response = await api.patch<BackendTask>(`/api/v1/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id: number) {
  await api.delete(`/api/v1/tasks/${id}`);
}