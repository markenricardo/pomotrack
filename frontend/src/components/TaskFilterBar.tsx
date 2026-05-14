import type { FilterStatus, Priority, SortOption } from "../types/taskTypes";

type TaskFilterBarProps = {
  priorityFilter: "All" | Priority;
  statusFilter: FilterStatus;
  sortBy: SortOption;
  onPriorityChange: (priority: "All" | Priority) => void;
  onStatusChange: (status: FilterStatus) => void;
  onSortChange: (sort: SortOption) => void;
  onAddTask: () => void;
};

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
    <section className="tasks-filter-card">
      <div className="filter-group">
        <label>Priority</label>
        <select
          value={priorityFilter}
          onChange={(event) =>
            onPriorityChange(event.target.value as "All" | Priority)
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
          onChange={(event) =>
            onStatusChange(event.target.value as FilterStatus)
          }
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          <option value="Most Recent">Most Recent</option>
          <option value="Deadline">Deadline</option>
          <option value="Priority">Priority</option>
        </select>
      </div>

      <button className="add-task-btn" onClick={onAddTask}>
        Add New Task
      </button>
    </section>
  );
}

export default TaskFilterBar;