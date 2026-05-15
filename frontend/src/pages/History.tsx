import React, { useState, useRef, useEffect } from 'react';
import '../styles/History.css';

// --- SUB-COMPONENT: FilterDropdown ---
interface FilterProps {
  label: string;
  options: string[];
  placeholder: string;
}

const FilterDropdown: React.FC<FilterProps> = ({ label, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(placeholder);
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
                  setSelected(option);
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
const TableRow = ({ data }: { data: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`history-table-row ${isExpanded ? 'is-clicked' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="row-main-content">
        <div className="col-date">{data.date}</div>
        <div className="col-task">{data.task}</div>
        <div className="col-duration">{data.duration}</div>
        <div className="col-type">{data.type}</div>
        <div className="col-status">{data.status}</div>
        <div className="col-rate">{data.rate}</div>
      </div>
      {isExpanded && (
        <div className="row-notes">
          Session Notes: {data.notes}
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
function History() {
  // Replace this with your real backend data later
  const dummyData = [
    { 
      date: '2026-05-15 13:00:00', 
      task: 'PUP Library Database Sync', 
      duration: '25 minutes', 
      type: 'Focus', 
      status: 'Completed', 
      rate: '100%', 
      notes: 'Finalized the SQL schema for student logs.' 
    },
    { 
      date: '2026-05-15 14:00:00', 
      task: 'AIFMS UI Debugging', 
      duration: '25 minutes', 
      type: 'Focus', 
      status: 'Unfinished', 
      rate: '85%', 
      notes: 'Emergeny. Had to attend to a family matter.' 
    },
  ];

  return (
    <div className="history-page">
      <header className="history-header">
        <h1>Session History</h1>
        <p>Review and analyze your past focus sessions and completion history.</p>
      </header>

      {/* Filter Section */}
      <section className="filter-container">
        <FilterDropdown 
          label="All Date" 
          placeholder="All Date" 
          options={['All Dates', 'Today', 'This Week', 'This Month', 'Custom Date']} 
        />
        <FilterDropdown 
          label="Session Type" 
          placeholder="All Types" 
          options={['All Types', 'Focus', 'Short Break', 'Long Break']} 
        />
        <FilterDropdown 
          label="Status" 
          placeholder="All Status" 
          options={['All Status','Completed', 'Unfinished']} 
        />
        <FilterDropdown 
          label="Sort by" 
          placeholder="Latest" 
          options={['Latest', 'Oldest']} 
        />
      </section>

      {/* Table Section */}
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
          {dummyData.map((row, index) => (
            <TableRow key={index} data={row} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;