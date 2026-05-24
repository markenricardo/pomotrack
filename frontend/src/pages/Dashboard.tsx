import React from 'react';
import '../styles/Dashboard.css';
import {
  Clock3,
  CheckCircle2,
  Flame,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function Dashboard() {
  const userData = {
    name: "User",
    todayFocusTime: "2h 15m",
    completedSessions: 4,
    currentStreak: 5,
    pendingTasks: [
      {
        id: 1,
        title: "Software Design Documentation",
        status: "In Progress",
        priority: "High",
        pomodoros: 4,
        deadline: "May 16, 2026",
      },
      {
        id: 2,
        title: "Database Architecture Setup",
        status: "Pending",
        priority: "Medium",
        pomodoros: 2,
        deadline: "May 18, 2026",
      },
    ],
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER SECTION */}
        <header className="dashboard-header">
          <div className="header-badge">
            <Sparkles size={16} />
            Productivity Dashboard
          </div>
          <h1>Welcome back, {userData.name}</h1>
          <p>Stay focused, manage your priorities, and track your daily progress with Pomodoro sessions.</p>
        </header>

        {/* CORE STATS SECTION */}
        <section className="stats-grid">
          
          {/* Focus Time */}
          <div className="stat-card">
            <div className="stat-icon blue">
              <Clock3 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="stat-label">Today's Focus Time</p>
              <h2 className="stat-value">{userData.todayFocusTime}</h2>
            </div>
          </div>

          {/* Completed Sessions */}
          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="stat-label">Completed Sessions</p>
              <h2 className="stat-value">{userData.completedSessions}</h2>
            </div>
          </div>

          {/* Streak */}
          <div className="stat-card">
            <div className="stat-icon orange">
              <Flame size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="stat-label">Current Streak</p>
              <div className="stat-value-container">
                <h2 className="stat-value">{userData.currentStreak}</h2>
                <span className="stat-unit">Days</span>
              </div>
            </div>
          </div>

        </section>

        {/* PENDING TASKS SECTION */}
        <section className="tasks-section">
          
          <div className="tasks-header">
            <div>
              <h2>Pending Tasks</h2>
              <p>Continue where you left off.</p>
            </div>
            <button className="btn-secondary">
              View All Tasks
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="tasks-grid">
            {userData.pendingTasks.map((task) => (
              <div key={task.id} className="task-card">
                
                <div className="task-info">
                  <div className="task-header-row">
                    <h3 className="task-title">{task.title}</h3>
                    <span className={`task-status ${task.status === 'In Progress' ? 'status-progress' : 'status-pending'}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="task-meta">
                    <span className={`meta-tag meta-priority ${task.priority}`}>
                      {task.priority} Priority
                    </span>
                    <span className="meta-tag">
                      {task.pomodoros} Pomodoros
                    </span>
                    <span className="meta-tag">
                      Due: {task.deadline}
                    </span>
                  </div>
                </div>

                {/* THE FIX: Inline styles applied here to force vertical stacking */}
                <div 
                  className="task-actions"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.25rem', 
                    width: '100%', 
                    marginTop: 'auto' 
                  }}
                >
                  <div 
                    className="progress-container"
                    style={{ width: '100%', display: 'block' }}
                  >
                    <div className={`progress-bar ${task.status === 'In Progress' ? 'active' : 'inactive'}`}></div>
                  </div>

                  <button 
                    className="btn-primary"
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    <Play size={16} fill="currentColor" />
                    Start Timer
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;