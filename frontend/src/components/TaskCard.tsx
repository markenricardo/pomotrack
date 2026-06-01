import type { Task } from "../types/taskTypes";

interface TaskCardProps {
  task: Task;
  onStartTimer: (id: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const formatDeadline = (deadline: string) => {
  if (!deadline) return "No deadline";
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusClass = (status: string) => {
  if (status === "In Progress") return "in-progress";
  if (status === "Completed") return "completed";
  if (status === "Blocked") return "blocked";
  return "pending";
};

const priorityClass = (priority: string) => priority.toLowerCase();

function TaskCard({ task, onStartTimer, onEditTask, onDeleteTask }: TaskCardProps) {
  return (
    <div className="task-card">
      {/* Header: title + status pill */}
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`status-pill ${statusClass(task.status)}`}>
          {task.status}
        </span>
      </div>

      {/* Optional description */}
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {/* Info rows */}
      <div className="task-info">
        <p>
          <span>Priority:</span>
          <span className={`priority-pill ${priorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </p>
        <p>
          <span>Estimated Pomodoros:</span>
          <strong>{task.pomodoros}</strong>
        </p>
        <p>
          <span>Deadline:</span>
          <strong>{formatDeadline(task.deadline)}</strong>
        </p>
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button
          type="button"
          className="start-timer-btn"
          onClick={() => onStartTimer(task.id)}
        >
          Start Timer
        </button>

        <button
          type="button"
          className="edit-task-btn"
          onClick={() => onEditTask(task)}
          title="Edit task"
        >
          {/* Pencil icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          type="button"
          className="delete-task-btn"
          onClick={() => onDeleteTask(task.id)}
          title="Delete task"
        >
          {/* Trash icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TaskCard;