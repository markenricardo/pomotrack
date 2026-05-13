import { useMemo, useState } from "react";
import "../styles/Tasks.css";

type Priority = "High" | "Medium" | "Low";
type TaskStatus = "Pending" | "In Progress" | "Completed";
type FilterStatus = "All" | TaskStatus;
type SortOption = "Most Recent" | "Deadline" | "Priority";

type Task = {
  id: number;
  title: string;
  priority: Priority;
  status: TaskStatus;
  pomodoros: number;
  deadline: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Software Design Documentation",
    priority: "High",
    status: "In Progress",
    pomodoros: 7,
    deadline: "2026-05-16",
  },
  {
    id: 2,
    title: "Software Design Documentation",
    priority: "High",
    status: "In Progress",
    pomodoros: 7,
    deadline: "2026-05-16",
  },
  {
    id: 3,
    title: "Software Design Documentation",
    priority: "High",
    status: "In Progress",
    pomodoros: 7,
    deadline: "2026-05-16",
  },
  {
    id: 4,
    title: "Software Design Documentation",
    priority: "High",
    status: "In Progress",
    pomodoros: 7,
    deadline: "2026-05-16",
  },
  {
    id: 5,
    title: "Software Design Documentation",
    priority: "High",
    status: "In Progress",
    pomodoros: 7,
    deadline: "2026-05-16",
  },
  {
    id: 6,
    title: "Software Design Documentation",
    priority: "High",
    status: "In Progress",
    pomodoros: 7,
    deadline: "2026-05-16",
  },
  {
    id: 7,
    title: "Database Schema Update",
    priority: "Medium",
    status: "Pending",
    pomodoros: 4,
    deadline: "2026-05-20",
  },
];

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (priorityFilter !== "All") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (statusFilter !== "All") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (sortBy === "Most Recent") {
      result.sort((a, b) => b.id - a.id);
    }

    if (sortBy === "Deadline") {
      result.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    }

    if (sortBy === "Priority") {
      const priorityOrder: Record<Priority, number> = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return result;
  }, [tasks, priorityFilter, statusFilter, sortBy]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStartTimer = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: "In Progress" } : task
      )
    );
  };

  const handleDelete = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: Date.now(),
      title: "New Pomodoro Task",
      priority: "Medium",
      status: "Pending",
      pomodoros: 3,
      deadline: "2026-05-24",
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  return (
    <main className="tasks-page">
      <section className="tasks-header">
        <h1>Tasks</h1>
        <p>Organize your tasks and connect them with your Pomodoro sessions.</p>
      </section>

      <section className="tasks-stats-grid">
        <div className="task-stat-card">
          <div className="task-stat-icon total">▣</div>
          <div>
            <p>Total Tasks</p>
            <h2>{totalTasks}</h2>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon completed">✓</div>
          <div>
            <p>Completed</p>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon progress">◌</div>
          <div>
            <p>In Progress</p>
            <h2>{inProgressTasks}</h2>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon pending">!</div>
          <div>
            <p>Pending</p>
            <h2>{pendingTasks}</h2>
          </div>
        </div>
      </section>

      <section className="tasks-filter-card">
        <div className="filter-group">
          <label>Priority</label>
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as "All" | Priority)
            }
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
          >
            <option value="Most Recent">Most Recent</option>
            <option value="Deadline">Deadline</option>
            <option value="Priority">Priority</option>
          </select>
        </div>

        <button className="add-task-btn" onClick={handleAddTask}>
          Add New Task
        </button>
      </section>

      <section className="tasks-grid">
        {filteredTasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="task-card-header">
              <h3>{task.title}</h3>
              <span className={`status-pill ${task.status.toLowerCase().replace(" ", "-")}`}>
                {task.status}
              </span>
            </div>

            <div className="task-info">
              <p>
                <span>Priority:</span>
                <strong className={`priority-pill ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </strong>
              </p>

              <p>
                <span>Estimated Pomodoros:</span>
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
                onClick={() => handleStartTimer(task.id)}
              >
                Start Timer
              </button>

              <button className="edit-task-btn" aria-label="Edit task">
                ✎
              </button>

              <button
                className="delete-task-btn"
                aria-label="Delete task"
                onClick={() => handleDelete(task.id)}
              >
                🗑
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Tasks;