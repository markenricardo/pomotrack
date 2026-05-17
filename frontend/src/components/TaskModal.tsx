import type { FormEvent } from "react";
import type { NewTaskForm, Priority, TaskStatus } from "../../types/taskTypes";

type TaskModalMode = "create" | "edit";

type TaskModalProps = {
  mode: TaskModalMode;
  formData: NewTaskForm;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (data: NewTaskForm) => void;
};

function TaskModal({
  mode,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}: TaskModalProps) {
  const isEditMode = mode === "edit";

  const title = isEditMode ? "Edit Task" : "Create Task";
  const subtitle = isEditMode
    ? "Update your task details."
    : "Add a task for your next focus session.";

  const submitText = isEditMode ? "Save Changes" : "Create";
  const submittingText = isEditMode ? "Saving..." : "Creating...";

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <div className="task-modal-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <form className="task-modal-form" onSubmit={onSubmit}>
          <div className="modal-field full">
            <label>Task Title</label>
            <input
              type="text"
              placeholder="e.g., Software Design Documentation"
              value={formData.title}
              onChange={(event) =>
                onChange({
                  ...formData,
                  title: event.target.value,
                })
              }
            />
          </div>

          <div className="modal-field full">
            <label>Description</label>
            <textarea
              placeholder="Optional description"
              value={formData.description}
              onChange={(event) =>
                onChange({
                  ...formData,
                  description: event.target.value,
                })
              }
            />
          </div>

          <div className="modal-field">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(event) =>
                onChange({
                  ...formData,
                  priority: event.target.value as "" | Priority,
                })
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
              value={formData.status}
              onChange={(event) =>
                onChange({
                  ...formData,
                  status: event.target.value as "" | TaskStatus,
                })
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
              value={formData.pomodoros}
              onChange={(event) =>
                onChange({
                  ...formData,
                  pomodoros: event.target.value,
                })
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
              value={formData.deadline}
              onChange={(event) =>
                onChange({
                  ...formData,
                  deadline: event.target.value,
                })
              }
            />
          </div>

          <div className="task-modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="modal-create-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingText : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;