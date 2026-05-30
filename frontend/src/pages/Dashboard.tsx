import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import {
  Clock3,
  CheckCircle2,
  Flame,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// 1. Define the exact shape of our Task objects
interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  pomodoros: number;
  deadline: string;
}

// 2. Define the exact shape of our Dashboard Data
interface UserData {
  name: string;
  todayFocusTime: string;
  completedSessions: number;
  currentStreak: number;
  pendingTasks: Task[];
}

function Dashboard() {
  // 3. Add TypeScript generics < > to our state hooks
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
          // --- THIS IS WHERE SOLUTION #1 GOES ---
          // 1. Get the saved token (adjust 'token' if you saved it under a different name)
          const token = localStorage.getItem('token'); 

          // 2. Add the token to the headers of the axios request
          const response = await axios.get('http://127.0.0.1:8000/api/v1/dashboard', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          // --------------------------------------
        const data = response.data;

        // 4. Type the parameter as a number
        const formatTime = (totalMinutes: number) => {
          if (!totalMinutes) return "0h 0m";
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          return `${h > 0 ? h + 'h ' : ''}${m}m`;
        };

        // 5. Type the incoming API task as 'any' so TS knows how to read it
        const formattedTasks = data.pending_tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          status: task.status === 'in_progress' ? 'In Progress' : 'Pending',
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          pomodoros: task.estimated_duration || 0,
          deadline: "Upcoming",
        }));

        setUserData({
          name: data.user_name || "User",
          todayFocusTime: formatTime(data.today_focus_minutes),
          completedSessions: data.completed_pomodoros,
          currentStreak: data.current_streak,
          pendingTasks: formattedTasks
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading your focus data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>{error}</h2>
      </div>
    );
  }

  // 6. We add a quick safety check so TypeScript knows userData is definitely not null here
  if (!userData) return null; 

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
            {userData.pendingTasks.length > 0 ? (
              userData.pendingTasks.map((task) => (
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
              ))
            ) : (
              <p>No pending tasks! Time to relax or add a new one.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;