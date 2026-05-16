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
import TaskModal from "../components/TaskModal";

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
      const mappedTasks = backendTasks.map(mapTaskFromBackend);

      setTasks(mappedTasks);
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

    if (!selectedTask) return;
    if (!validateTaskForm(editTask)) return;

    try {
      setIsUpdating(true);

      const updatedBackendTask = await updateTask(selectedTask.id, {
        title: editTask.title.trim(),
        description: editTask.description.trim() || null,
        priority: priorityToBackend(editTask.priority),
        status: statusToBackend(editTask.status),
        estimated_duration: Number(editTask.pomodoros),
        deadline: editTask.deadline,
      });

      const mappedUpdatedTask = mapTaskFromBackend(updatedBackendTask);

      const updatedTaskWithDeadline: Task = {
        ...mappedUpdatedTask,
        deadline: updatedBackendTask.deadline ?? editTask.deadline,
      };

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id ? updatedTaskWithDeadline : task
        )
      );

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
        onAddTask={handleOpenAddModal}
      />

      {isLoading && <p className="tasks-message">Loading tasks...</p>}

      {error && <p className="tasks-message error">{error}</p>}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <p className="tasks-message">No tasks found.</p>
      )}

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