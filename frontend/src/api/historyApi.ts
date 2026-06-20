import api from "./axios";

export type BackendSessionType = "work" | "short_break" | "long_break";

export interface BackendAssociatedTask {
  task_id: number;
  title: string;
  time_spent: number | null;
  notes: string | null;
}

export interface BackendHistorySession {
  id: number;
  start_time: string;
  end_time: string | null;
  duration: number;
  actual_duration: number | null;
  session_type: BackendSessionType;
  completed: boolean;
  interruption_reason: string | null;
  tasks: BackendAssociatedTask[];
}

/**
 * Fetch the authenticated user's pomodoro session history logs
 */
export const getHistory = async (limit = 50, offset = 0): Promise<BackendHistorySession[]> => {
  const response = await api.get<BackendHistorySession[]>("/api/v1/history/", {
    params: { limit, offset }
  });
  return response.data;
};