export type Priority = "High" | "Medium" | "Low";

export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Blocked";

export type FilterStatus = "All" | TaskStatus;

export type SortOption = "Most Recent" | "Deadline" | "Priority";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  pomodoros: number;
  deadline: string;
  createdAt: string;
};

export type NewTaskForm = {
  title: string;
  description: string;
  priority: "" | Priority;
  status: "" | TaskStatus;
  pomodoros: string;
  deadline: string;
};