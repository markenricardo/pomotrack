export type SessionType = "Focus" | "Short Break" | "Long Break";

export type TimerTask = {
  id: number;
  title: string;
  priority: string;
  status: string;
  estimatedPomodoros: number;
};
