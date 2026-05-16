import type { Task } from "../types/taskTypes";

type TaskCardProps = {
  task: Task;
  onStartTimer: (id: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
};

const formatDate = (date: string) => {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusClassName = (status: string) => {
  return status.toLowerCase().replaceAll(" ", "-");
};

function TaskCard({
  task,
  onStartTimer,
  onEditTask,
  onDeleteTask,
}: TaskCardProps) {
  return (
    <article className="task-card">
      <div className="task-card-header">
        <h3>{task.title}</h3>

        <span className={`status-pill ${getStatusClassName(task.status)}`}>
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-info">
        <p>
          <span>Priority:</span>
          <strong className={`priority-pill ${task.priority.toLowerCase()}`}>
            {task.priority}
          </strong>
        </p>

        <p>
          <span>Pomodoros:</span>
          <strong>{task.pomodoros}</strong>
        </p>

        <p>
          <span>Deadline:</span>
          <strong>{formatDate(task.deadline)}</strong>
        </p>
      </div>

      <div className="task-actions">
        <button
          className="start-timer-btn"
          onClick={() => onStartTimer(task.id)}
        >
          Start Timer
        </button>

        <button
          className="edit-task-btn"
          aria-label="Edit task"
          onClick={() => onEditTask(task)}
        >
          ✎
        </button>

        <button
          className="delete-task-btn"
          aria-label="Delete task"
          onClick={() => onDeleteTask(task.id)}
        >
          🗑
        </button>
      </div>
    </article>
  );
}

export default TaskCard;