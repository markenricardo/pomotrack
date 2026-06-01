import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "../styles/Tasks.css";
import PageHeader from "../components/Pageheader";

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
import TaskModal from "../components/TaskModal";

import type {
  FilterStatus,
  NewTaskForm,
  Priority,
  SortOption,
  Task,
  TaskStatus,
} from "../types/taskTypes";

import { useAppContext } from "../context/AppContext";

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

const emptyTaskForm: NewTaskForm = {
  title: "",
  description: "",
  priority: "",
  status: "",
  pomodoros: "",
  deadline: "",
};

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState<NewTaskForm>(emptyTaskForm);
  const [editTask, setEditTask] = useState<NewTaskForm>(emptyTaskForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  // Listen to the timer completing a task — reload tasks when it fires
  const { taskCompletedSignal } = useAppContext();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

  useEffect(() => {
    loadTasks();
  }, []);

  // Re-fetch whenever the timer signals a task was completed
  useEffect(() => {
    if (taskCompletedSignal > 0) {
      loadTasks();
    }
  }, [taskCompletedSignal]);

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
    } else if (sortBy === "Deadline") {
      result.sort((a, b) => {
        const fa = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const fb = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return fa - fb;
      });
    } else if (sortBy === "Priority") {
      const order: Record<Priority, number> = { High: 1, Medium: 2, Low: 3 };
      result.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    return result;
  }, [tasks, priorityFilter, statusFilter, sortBy]);

  const handleOpenAddModal = () => {
    setNewTask(emptyTaskForm);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewTask(emptyTaskForm);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      pomodoros: String(task.pomodoros),
      deadline: task.deadline,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
    setEditTask(emptyTaskForm);
  };

  const validateTaskForm = (formData: NewTaskForm) => {
    if (
      !formData.title.trim() ||
      !formData.priority ||
      !formData.status ||
      !formData.pomodoros ||
      !formData.deadline
    ) {
      alert("Please complete all required fields.");
      return false;
    }
    return true;
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateTaskForm(newTask)) return;

    try {
      setIsCreating(true);
      const created = await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority: priorityToBackend(newTask.priority as Priority),
        status: statusToBackend(newTask.status as TaskStatus),
        estimated_duration: Number(newTask.pomodoros),
        deadline: newTask.deadline,
      });
      const mapped: Task = {
        ...mapTaskFromBackend(created),
        deadline: created.deadline ?? newTask.deadline,
      };
      setTasks((prev) => [mapped, ...prev]);
      handleCloseAddModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create task.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask || !validateTaskForm(editTask)) return;

    try {
      setIsUpdating(true);
      const updated = await updateTask(selectedTask.id, {
        title: editTask.title.trim(),
        description: editTask.description.trim() || null,
        priority: priorityToBackend(editTask.priority as Priority),
        status: statusToBackend(editTask.status as TaskStatus),
        estimated_duration: Number(editTask.pomodoros),
        deadline: editTask.deadline,
      });
      const mapped: Task = {
        ...mapTaskFromBackend(updated),
        deadline: updated.deadline ?? editTask.deadline,
      };
      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? mapped : t)));
      handleCloseEditModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update task.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartTimer = async (id: number) => {
    try {
      const updated = await updateTask(id, { status: "in_progress" });
      const mapped = mapTaskFromBackend(updated);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...mapped, deadline: mapped.deadline || t.deadline } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to start task.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task.");
    }
  };

  return (
    <main className="tasks-page">
      <PageHeader
        title="Tasks"
        subtitle="Organize your tasks and connect them with your Pomodoro sessions."
      />

      {/* Stats */}
      <section className="tasks-stats-grid">
        <div className="task-stat-card">
          <div className="task-stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="4" rx="1" />
              <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3" />
              <path d="M12 11h4M12 15h4M8 11h.01M8 15h.01" />
            </svg>
          </div>
          <div>
            <p>Total Tasks</p>
            <h2>{totalTasks}</h2>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon completed">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p>Completed</p>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon progress">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p>In Progress</p>
            <h2>{inProgressTasks}</h2>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p>Pending</p>
            <h2>{pendingTasks}</h2>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <TaskFilterBar
        priorityFilter={priorityFilter}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onPriorityChange={setPriorityFilter}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
        onAddTask={handleOpenAddModal}
      />

      {/* Messages */}
      {isLoading && <p className="tasks-message">Loading tasks...</p>}
      {error && <p className="tasks-message error">{error}</p>}
      {!isLoading && !error && filteredTasks.length === 0 && (
        <p className="tasks-message">No tasks found.</p>
      )}

      {/* Task cards */}
      <section className="tasks-grid">
        {!isLoading &&
          !error &&
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStartTimer={handleStartTimer}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDelete}
            />
          ))}
      </section>

      {/* Modals */}
      {isAddModalOpen && (
        <TaskModal
          mode="create"
          formData={newTask}
          isSubmitting={isCreating}
          onClose={handleCloseAddModal}
          onSubmit={handleCreateTask}
          onChange={setNewTask}
        />
      )}

      {isEditModalOpen && selectedTask && (
        <TaskModal
          mode="edit"
          formData={editTask}
          isSubmitting={isUpdating}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateTask}
          onChange={setEditTask}
        />
      )}
    </main>
  );
}

export default Tasks;