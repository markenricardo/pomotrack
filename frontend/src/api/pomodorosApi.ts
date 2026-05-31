import api from "./axios";

export type BackendSessionType = "work" | "short_break" | "long_break";

export type PomodoroSession = {
  id: number;
  user_id: number;
  start_time?: string | null;
  end_time?: string | null;
  duration: number;
  actual_duration?: number | null;
  session_type: BackendSessionType;
  completed: boolean;
  interruption_reason?: string | null;
  created_at: string;
};

export type CreatePomodoroPayload = {
  start_time?: string | null;
  duration: number;
  session_type: BackendSessionType;
};

export type UpdatePomodoroPayload = {
  start_time?: string | null;
  end_time?: string | null;
  duration?: number;
  actual_duration?: number;
  session_type?: BackendSessionType;
  completed?: boolean;
  interruption_reason?: string | null;
};

export type PomodoroTaskAssociationPayload = {
  pomodoro_session_id: number;
  task_id: number;
  time_spent?: number | null;
  notes?: string | null;
};

export type PomodoroTaskAssociation = {
  id: number;
  pomodoro_session_id: number;
  task_id: number;
  time_spent?: number | null;
  notes?: string | null;
  created_at: string;
};

export type PomodoroPauseStats = {
  is_paused: boolean;
  current_pause_id?: number | null;
  total_pause_duration: number;
};

export async function createPomodoro(payload: CreatePomodoroPayload) {
  const response = await api.post<PomodoroSession>(
    "/api/v1/pomodoros/",
    payload
  );

  return response.data;
}

export async function createPresetPomodoro(sessionType: BackendSessionType) {
  const response = await api.post<PomodoroSession>(
    `/api/v1/pomodoros/preset?session_type=${sessionType}`
  );

  return response.data;
}

export async function getPomodoros() {
  const response = await api.get<PomodoroSession[]>("/api/v1/pomodoros/");
  return response.data;
}

export async function getPomodoro(id: number) {
  const response = await api.get<PomodoroSession>(`/api/v1/pomodoros/${id}`);
  return response.data;
}

export async function updatePomodoro(
  id: number,
  payload: UpdatePomodoroPayload
) {
  const response = await api.patch<PomodoroSession>(
    `/api/v1/pomodoros/${id}`,
    payload
  );

  return response.data;
}

export async function completePomodoro(
  id: number,
  actualDuration?: number,
  interruptionReason?: string
) {
  const params = new URLSearchParams();

  if (actualDuration !== undefined) {
    params.append("actual_duration", String(actualDuration));
  }

  if (interruptionReason) {
    params.append("interruption_reason", interruptionReason);
  }

  const queryString = params.toString();
  const url = queryString
    ? `/api/v1/pomodoros/${id}/complete?${queryString}`
    : `/api/v1/pomodoros/${id}/complete`;

  const response = await api.post<PomodoroSession>(url);
  return response.data;
}

export async function deletePomodoro(id: number) {
  await api.delete(`/api/v1/pomodoros/${id}`);
}

export async function pausePomodoro(id: number) {
  const response = await api.post<PomodoroSession>(
    `/api/v1/pomodoros/${id}/pause`
  );

  return response.data;
}

export async function resumePomodoro(id: number) {
  const response = await api.post<PomodoroSession>(
    `/api/v1/pomodoros/${id}/resume`
  );

  return response.data;
}

export async function getPomodoroPauseStats(id: number) {
  const response = await api.get<PomodoroPauseStats>(
    `/api/v1/pomodoros/${id}/pause-stats`
  );

  return response.data;
}

export async function associateTaskWithPomodoro(
  pomodoroId: number,
  payload: PomodoroTaskAssociationPayload
) {
  const response = await api.post<PomodoroTaskAssociation>(
    `/api/v1/pomodoros/${pomodoroId}/tasks`,
    payload
  );

  return response.data;
}