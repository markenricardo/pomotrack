import { useState } from "react";
import type { FilterStatus, Priority, SortOption } from "../types/taskTypes";

interface TaskFilterBarProps {
  priorityFilter: "All" | Priority;
  statusFilter: FilterStatus;
  sortBy: SortOption;
  onPriorityChange: (value: "All" | Priority) => void;
  onStatusChange: (value: FilterStatus) => void;
  onSortChange: (value: SortOption) => void;
  onAddTask: () => void;
}

function TaskFilterBar({
  priorityFilter,
  statusFilter,
  sortBy,
  onPriorityChange,
  onStatusChange,
  onSortChange,
  onAddTask,
}: TaskFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<"priority" | "status" | "sort" | null>(null);

  const toggleDropdown = (type: "priority" | "status" | "sort") => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const handleSelectOption = (callback: (val: any) => void, value: any) => {
    callback(value);
    setOpenDropdown(null);
  };

  // Reusable SVG Arrow Component
  const ArrowIcon = () => (
    <svg className="arrow-icon" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 2L6 7L11 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="tasks-filter-card">
      {/* PRIORITY FILTER */}
      <div className="filter-group">
        <label>Priority</label>
        <div 
          className={`filter-select-custom ${openDropdown === "priority" ? "variant2" : "default"}`}
          onClick={() => toggleDropdown("priority")}
        >
          {priorityFilter === "All" ? "All Priorities" : priorityFilter}
          <ArrowIcon />
          
          {openDropdown === "priority" && (
            <div className="dropdown-menu">
              <div className="dropdown-option" onClick={() => handleSelectOption(onPriorityChange, "All")}>All Priorities</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onPriorityChange, "High")}>High</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onPriorityChange, "Medium")}>Medium</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onPriorityChange, "Low")}>Low</div>
            </div>
          )}
        </div>
      </div>

      {/* STATUS FILTER */}
      <div className="filter-group">
        <label>Status</label>
        <div 
          className={`filter-select-custom ${openDropdown === "status" ? "variant2" : "default"}`}
          onClick={() => toggleDropdown("status")}
        >
          {statusFilter === "All" ? "All Status" : statusFilter}
          <ArrowIcon />
          
          {openDropdown === "status" && (
            <div className="dropdown-menu">
              <div className="dropdown-option" onClick={() => handleSelectOption(onStatusChange, "All")}>All Status</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onStatusChange, "Pending")}>Pending</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onStatusChange, "In Progress")}>In Progress</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onStatusChange, "Completed")}>Completed</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onStatusChange, "Blocked")}>Blocked</div>
            </div>
          )}
        </div>
      </div>

      {/* SORT FILTER */}
      <div className="filter-group">
        <label>Sort By</label>
        <div 
          className={`filter-select-custom ${openDropdown === "sort" ? "variant2" : "default"}`}
          onClick={() => toggleDropdown("sort")}
        >
          {sortBy}
          <ArrowIcon />
          
          {openDropdown === "sort" && (
            <div className="dropdown-menu">
              <div className="dropdown-option" onClick={() => handleSelectOption(onSortChange, "Most Recent")}>Most Recent</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onSortChange, "Deadline")}>Deadline</div>
              <div className="dropdown-option" onClick={() => handleSelectOption(onSortChange, "Priority")}>Priority</div>
            </div>
          )}
        </div>
      </div>

      <button type="button" className="add-task-btn" onClick={onAddTask}>
        Add New Task
      </button>
    </div>
  );
}

export default TaskFilterBar;