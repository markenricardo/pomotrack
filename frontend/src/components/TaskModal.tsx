import { useState } from "react";
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
  const subtitle = isEditMode ? "Update your task details." : "Add a task for your next focus session.";
  const submitText = isEditMode ? "Save Changes" : "Create";
  const submittingText = isEditMode ? "Saving..." : "Creating...";

  const [openDropdown, setOpenDropdown] = useState<"priority" | "status" | "pomodoros" | null>(null);

  const toggleDropdown = (type: "priority" | "status" | "pomodoros") => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const handleSelectOption = (field: keyof NewTaskForm, value: any) => {
    onChange({ ...formData, [field]: value });
    setOpenDropdown(null);
  };

  // Reusable SVG Arrow Component
  const ArrowIcon = () => (
    <svg className="arrow-icon" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 2L6 7L11 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

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
              onChange={(event) => onChange({ ...formData, title: event.target.value })}
            />
          </div>

          <div className="modal-field full">
            <label>Description</label>
            <textarea
              placeholder="Optional description"
              value={formData.description}
              onChange={(event) => onChange({ ...formData, description: event.target.value })}
            />
          </div>

          {/* CUSTOM PRIORITY DROPDOWN */}
          <div className="modal-field">
            <label>Priority</label>
            <div 
              className={`filter-select-custom ${openDropdown === "priority" ? "variant2" : "default"}`}
              onClick={() => toggleDropdown("priority")}
            >
              {formData.priority || "Select priority"}
              <ArrowIcon />
              
              {openDropdown === "priority" && (
                <div className="dropdown-menu">
                  <div className="dropdown-option" onClick={() => handleSelectOption("priority", "")}>Select priority</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("priority", "High")}>High</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("priority", "Medium")}>Medium</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("priority", "Low")}>Low</div>
                </div>
              )}
            </div>
          </div>

          {/* CUSTOM STATUS DROPDOWN */}
          <div className="modal-field">
            <label>Status</label>
            <div 
              className={`filter-select-custom ${openDropdown === "status" ? "variant2" : "default"}`}
              onClick={() => toggleDropdown("status")}
            >
              {formData.status || "Select status"}
              <ArrowIcon />
              
              {openDropdown === "status" && (
                <div className="dropdown-menu">
                  <div className="dropdown-option" onClick={() => handleSelectOption("status", "")}>Select status</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("status", "Pending")}>Pending</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("status", "In Progress")}>In Progress</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("status", "Completed")}>Completed</div>
                  <div className="dropdown-option" onClick={() => handleSelectOption("status", "Blocked")}>Blocked</div>
                </div>
              )}
            </div>
          </div>

          {/* CUSTOM POMODOROS DROPDOWN */}
          <div className="modal-field">
            <label>Pomodoros</label>
            <div 
              className={`filter-select-custom ${openDropdown === "pomodoros" ? "variant2" : "default"}`}
              onClick={() => toggleDropdown("pomodoros")}
            >
              {formData.pomodoros ? `${formData.pomodoros} Pomodoro${formData.pomodoros === "1" ? "" : "s"}` : "Select count"}
              <ArrowIcon />
              
              {openDropdown === "pomodoros" && (
                <div className="dropdown-menu">
                  <div className="dropdown-option" onClick={() => handleSelectOption("pomodoros", "")}>Select count</div>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <div 
                      key={num} 
                      className="dropdown-option" 
                      onClick={() => handleSelectOption("pomodoros", String(num))}
                    >
                      {num} Pomodoro{num === 1 ? "" : "s"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-field">
            <label>Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(event) => onChange({ ...formData, deadline: event.target.value })}
            />
          </div>

          <div className="task-modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="modal-create-btn" disabled={isSubmitting}>
              {isSubmitting ? submittingText : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;