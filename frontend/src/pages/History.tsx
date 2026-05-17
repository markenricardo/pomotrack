import React, { useState, useRef, useEffect, useMemo } from 'react';
import '../styles/History.css';
import { getHistory } from '../api/historyApi';
import type { BackendHistorySession } from '../api/historyApi';

// --- SUB-COMPONENT: FilterDropdown ---
interface FilterProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}

const FilterDropdown: React.FC<FilterProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="filter-group" ref={dropdownRef}>
      <label>{label}</label>
      <div 
        className={`filter-select-custom ${isOpen ? 'variant2' : 'default'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected}</span>
        <div className="arrow-icon">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            {options.map((option, index) => (
              <div 
                key={index} 
                className="dropdown-option"
                onClick={(e) => {
                  e.stopPropagation(); 
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: TableRow ---
interface TableRowProps {
  session: BackendHistorySession;
}

const TableRow: React.FC<TableRowProps> = ({ session }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Formatting timestamps dynamically
  const dateFormatted = new Date(session.start_time).toLocaleString();
  
  // Extract primary task association title safely
  const mainTaskTitle = session.tasks && session.tasks.length > 0 
    ? session.tasks[0].title 
    : "No linked task";

  const durationFormatted = `${Math.round(session.duration / 60)} mins`;
  
  // Translate database values back to clean UI typography labels
  const typeDisplay = session.session_type === 'work' ? 'Focus' 
    : session.session_type === 'short_break' ? 'Short Break' 
    : 'Long Break';

  const statusDisplay = session.completed ? 'Completed' : 'Unfinished';

  // Calculate session completion percentages cleanly
  const completionRate = session.duration > 0 && session.actual_duration != null
    ? `${Math.min(100, Math.round((session.actual_duration / session.duration) * 100))}%`
    : session.completed ? '100%' : '0%';

  // Aggregate notes appended across task records
  const sessionNotes = session.tasks && session.tasks.map(t => t.notes).filter(Boolean).join("; ")
    || "No session notes captured.";

  return (
    <div 
      className={`history-table-row ${isExpanded ? 'is-clicked' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="row-main-content">
        <div className="col-date">{dateFormatted}</div>
        <div className="col-task">{mainTaskTitle}</div>
        <div className="col-duration">{durationFormatted}</div>
        <div className="col-type">{typeDisplay}</div>
        <div className="col-status">{statusDisplay}</div>
        <div className="col-rate">{completionRate}</div>
      </div>
      {isExpanded && (
        <div className="row-notes">
          <strong>Session Notes:</strong> {sessionNotes}
          {session.interruption_reason && (
            <p style={{ margin: '4px 0 0 0', color: '#ff4d4f' }}>
              <strong>Interruption Reason:</strong> "{session.interruption_reason}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
function History() {
  const [sessions, setSessions] = useState<BackendHistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Live Dropdown Selection States
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Latest");

  // Custom Inline Date Filter Boundaries
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Hook live query requests straight from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getHistory();
        setSessions(data);
      } catch (err) {
        console.error("Error pulling session data:", err);
        setError("Unable to load focus history. Make sure your server is active.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute live local filters against database array
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    // 1. Session Type Filter Processing
    if (typeFilter !== "All Types") {
      result = result.filter(s => {
        if (typeFilter === "Focus") return s.session_type === "work";
        if (typeFilter === "Short Break") return s.session_type === "short_break";
        if (typeFilter === "Long Break") return s.session_type === "long_break";
        return true;
      });
    }

    // 2. Status Filter Processing
    if (statusFilter !== "All Status") {
      result = result.filter(s => {
        if (statusFilter === "Completed") return s.completed === true;
        if (statusFilter === "Unfinished") return s.completed === false;
        return true;
      });
    }

    // 3. Date & Range Engine Processing
    if (dateFilter !== "All Dates") {
      const now = new Date();
      result = result.filter(s => {
        const sessionDate = new Date(s.start_time);
        if (dateFilter === "Today") {
          return sessionDate.toDateString() === now.toDateString();
        }
        if (dateFilter === "This Week") {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return sessionDate >= oneWeekAgo;
        }
        if (dateFilter === "This Month") {
          return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
        }
        if (dateFilter === "Custom Date") {
          if (!startDate && !endDate) return true; // Show all if boundaries aren't selected yet
          const targetTime = sessionDate.getTime();
          const startTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0;
          const endTime = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Number.MAX_SAFE_INTEGER;
          return targetTime >= startTime && targetTime <= endTime;
        }
        return true;
      });
    }

    // 4. Sort Sequence Processing
    if (sortBy === "Latest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === "Oldest") {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [sessions, typeFilter, statusFilter, dateFilter, sortBy, startDate, endDate]);

  return (
    <div className="history-page">
      <header className="history-header">
        <h1>Session History</h1>
        <p>Review and analyze your past focus sessions and completion history.</p>
      </header>

      {/* Filter Container Control Grid Row */}
      <section className="filter-container" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <FilterDropdown 
          label="All Date" 
          selected={dateFilter}
          onChange={(val) => {
            setDateFilter(val);
            if (val !== "Custom Date") {
              setStartDate("");
              setEndDate("");
            }
          }}
          options={['All Dates', 'Today', 'This Week', 'This Month', 'Custom Date']} 
        />
        
        {/* Conditional Custom Date Inline Ranges */}
        {dateFilter === "Custom Date" && (
          <div className="custom-date-inputs-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="filter-group">
              <label>Start Date</label>
              <input 
                type="date" 
                className="filter-select-custom default" 
                style={{ padding: '8px 12px', color: '#111827', cursor: 'text' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input 
                type="date" 
                className="filter-select-custom default" 
                style={{ padding: '8px 12px', color: '#111827', cursor: 'text' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <FilterDropdown 
          label="Session Type" 
          selected={typeFilter}
          onChange={setTypeFilter}
          options={['All Types', 'Focus', 'Short Break', 'Long Break']} 
        />
        <FilterDropdown 
          label="Status" 
          selected={statusFilter}
          onChange={setStatusFilter}
          options={['All Status', 'Completed', 'Unfinished']} 
        />
        <FilterDropdown 
          label="Sort by" 
          selected={sortBy}
          onChange={setSortBy}
          options={['Latest', 'Oldest']} 
        />
      </section>

      {/* History Layout Table Display Grid */}
      <div className="history-table-container">
        <div className="history-table-header">
          <div className="col-date">Date & Time</div>
          <div className="col-task">Task</div>
          <div className="col-duration">Duration</div>
          <div className="col-type">Session Type</div>
          <div className="col-status">Status</div>
          <div className="col-rate">Completion Rate</div>
        </div>

        <div className="history-table-body">
          {isLoading && <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Fetching focus logs...</p>}
          {error && <p style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>{error}</p>}
          
          {!isLoading && !error && filteredSessions.length === 0 && (
            <p style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              No session logs match your criteria.
            </p>
          )}

          {!isLoading && !error && filteredSessions.map((session) => (
            <TableRow key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;