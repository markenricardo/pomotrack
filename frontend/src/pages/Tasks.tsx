import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "../styles/Tasks.css";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasksApi";

import type {
  BackendTask,
  BackendPriority,
  BackendTaskStatus,
} from "../api/tasksApi";

import TaskFilterBar from "../components/TaskFilterBar";
import TaskCard from "../components/TaskCard";

import type {
  FilterStatus,
  NewTaskForm,
  Priority,
  SortOption,
  Task,
  TaskStatus,
} from "../types/taskTypes";

const priorityToFrontend = (priority?: BackendPriority | null): Priority => {
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Medium";
};

const priorityToBackend = (priority: Priority): BackendPriority => {
  if (priority === "High") return "high";
  if (priority === "Low") return "low";
  return "medium";
};

const statusToFrontend = (status: BackendTaskStatus): TaskStatus => {
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (status === "blocked") return "Blocked";
  return "Pending";
};

const statusToBackend = (status: TaskStatus): BackendTaskStatus => {
  if (status === "In Progress") return "in_progress";
  if (status === "Completed") return "completed";
  if (status === "Blocked") return "blocked";
  return "pending";
};

const mapTaskFromBackend = (task: BackendTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: priorityToFrontend(task.priority),
  status: statusToFrontend(task.status),
  pomodoros: task.estimated_duration ?? 1,
  deadline: task.deadline ?? "",
  createdAt: task.created_at,
});

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    priority: "",
    status: "",
    pomodoros: "",
    deadline: "",
  });

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError("");

      const backendTasks = await getTasks();
      setTasks(backendTasks.map(mapTaskFromBackend));
    } catch (err) {
      console.error(err);
      setError("Unable to load tasks. Please make sure you are logged in.");
    } finally {
      setIsLoading(false);
    }
  };

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
      result.sort((a, b) => {
        const firstDate = a.deadline
          ? new Date(a.deadline).getTime()
          : Number.MAX_SAFE_INTEGER;

        const secondDate = b.deadline
          ? new Date(b.deadline).getTime()
          : Number.MAX_SAFE_INTEGER;

        return firstDate - secondDate;
      });
    }

    if (sortBy === "Priority") {
      const priorityOrder: Record<Priority, number> = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      result.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }

    return result;
  }, [tasks, priorityFilter, statusFilter, sortBy]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setNewTask({
      title: "",
      description: "",
      priority: "",
      status: "",
      pomodoros: "",
      deadline: "",
    });
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !newTask.title.trim() ||
      !newTask.priority ||
      !newTask.status ||
      !newTask.pomodoros ||
      !newTask.deadline
    ) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setIsCreating(true);

      const createdBackendTask = await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority: priorityToBackend(newTask.priority),
        status: statusToBackend(newTask.status),
        estimated_duration: Number(newTask.pomodoros),
        deadline: newTask.deadline,
      });

      const mappedTask = mapTaskFromBackend(createdBackendTask);

      const taskWithDeadline: Task = {
        ...mappedTask,
        deadline: createdBackendTask.deadline ?? newTask.deadline,
      };

      setTasks((prev) => [taskWithDeadline, ...prev]);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create task.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartTimer = async (id: number) => {
    try {
      const updatedBackendTask = await updateTask(id, {
        status: "in_progress",
      });

      const updatedTask = mapTaskFromBackend(updatedBackendTask);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...updatedTask,
                deadline: updatedTask.deadline || task.deadline,
              }
            : task
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to start task.");
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      const updatedBackendTask = await updateTask(id, {
        status: "completed",
      });

      const updatedTask = mapTaskFromBackend(updatedBackendTask);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...updatedTask,
                deadline: updatedTask.deadline || task.deadline,
              }
            : task
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to complete task.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task.");
    }
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

      <TaskFilterBar
        priorityFilter={priorityFilter}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onPriorityChange={setPriorityFilter}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
        onAddTask={handleOpenModal}
      />

      {isLoading && <p className="tasks-message">Loading tasks...</p>}
      {error && <p className="tasks-message error">{error}</p>}

      <section className="tasks-grid">
        {!isLoading &&
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStartTimer={handleStartTimer}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDelete}
            />
          ))}
      </section>

      {isModalOpen && (
        <div className="task-modal-overlay">
          <div className="task-modal">
            <div className="task-modal-header">
              <h2>Create Task</h2>
              <p>Add a task for your next focus session.</p>
            </div>

            <form className="task-modal-form" onSubmit={handleCreateTask}>
              <div className="modal-field full">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g., Software Design Documentation"
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="modal-field full">
                <label>Description</label>
                <textarea
                  placeholder="Optional description"
                  value={newTask.description}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="modal-field">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: event.target.value as "" | Priority,
                    }))
                  }
                >
                  <option value="">Select priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Status</label>
                <select
                  value={newTask.status}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      status: event.target.value as "" | TaskStatus,
                    }))
                  }
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Pomodoros</label>
                <select
                  value={newTask.pomodoros}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      pomodoros: event.target.value,
                    }))
                  }
                >
                  <option value="">Select count</option>
                  <option value="1">1 Pomodoro</option>
                  <option value="2">2 Pomodoros</option>
                  <option value="3">3 Pomodoros</option>
                  <option value="4">4 Pomodoros</option>
                  <option value="5">5 Pomodoros</option>
                  <option value="6">6 Pomodoros</option>
                  <option value="7">7 Pomodoros</option>
                  <option value="8">8 Pomodoros</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      deadline: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="task-modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-create-btn"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Tasks;