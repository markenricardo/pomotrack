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
  return (
    <div className="tasks-filter-card">
      <div className="filter-group">
        <label htmlFor="priority-filter">Priority</label>
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as "All" | Priority)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-filter">Sort By</label>
        <select
          id="sort-filter"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="Most Recent">Most Recent</option>
          <option value="Deadline">Deadline</option>
          <option value="Priority">Priority</option>
        </select>
      </div>

      <button type="button" className="add-task-btn" onClick={onAddTask}>
        Add New Task
      </button>
    </div>
  );
}

export default TaskFilterBar;