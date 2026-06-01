import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import Pageheader from '../components/Pageheader';
import {
  Clock3,
  CheckCircle2,
  Flame,
  Play,
  ArrowRight,
} from "lucide-react";
import { useAppContext } from '../context/AppContext';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  pomodoros: number;
  deadline: string;
}

interface UserData {
  name: string;
  todayFocusTime: string;
  completedSessions: number;
  currentStreak: number;
  pendingTasks: Task[];
}

function Dashboard() {
  const navigate = useNavigate();
  
  const { selectTaskForTimer, 
          todayFocusSeconds, // <-- Grab the live seconds
          todaySessionCount  // <-- Grab the live count  
        } = useAppContext();
// Converts raw seconds into "Xh Ym"
  const formatLiveTime = (totalSeconds: number) => {
    if (!totalSeconds) return "0h 0m";
    const totalMinutes = Math.floor(totalSeconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
          const token = localStorage.getItem('token'); 
          const response = await axios.get('http://127.0.0.1:8000/api/v1/dashboard', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        const data = response.data;

        const formatTime = (totalMinutes: number) => {
          if (!totalMinutes) return "0h 0m";
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          return `${h > 0 ? h + 'h ' : ''}${m}m`;
        };

        const formattedTasks = data.pending_tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          status: task.status === 'in_progress' ? 'In Progress' : 'Pending',
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          pomodoros: task.estimated_duration || 0,
          deadline: task.deadline || "Upcoming",
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
        <p className="dashboard-message">Loading your focus data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p className="dashboard-message error">{error}</p>
      </div>
    );
  }

  if (!userData) return null; 

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        <Pageheader 
          title={`Welcome back, ${userData.name}`}
          subtitle="Stay focused, manage your priorities, and track your daily progress with Pomodoro sessions."
        />

        {/* CORE STATS SECTION */}
        <section className="dashboard-stats-grid">
          
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon blue">
              <Clock3 size={24} strokeWidth={2} />
            </div>
            <div>
              <p>Today's Focus Time</p>
              {/* REPLACED WITH LIVE CONTEXT */}
              <h2>{formatLiveTime(todayFocusSeconds)}</h2>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon green">
              <CheckCircle2 size={24} strokeWidth={2} />
            </div>
            <div>
              <p>Completed Sessions</p>
              {/* REPLACED WITH LIVE CONTEXT */}
              <h2>{todaySessionCount}</h2>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon yellow">
              <Flame size={24} strokeWidth={2} />
            </div>
            <div>
              <p>Current Streak</p>
              <h2>{userData.currentStreak} <span style={{fontSize: '14px', fontWeight: 600, color: '#6b7280'}}>Days</span></h2>
            </div>
          </div>

        </section>

        {/* PENDING TASKS SECTION */}
        <section className="dashboard-tasks-section">
          
          <div className="dashboard-tasks-header">
            <div>
              <h2>Pending Tasks</h2>
              <p>Continue where you left off.</p>
            </div>
            <button className="view-all-btn"
              onClick={() => navigate('/tasks')} >
              View All Tasks
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="dashboard-tasks-grid">
            {userData.pendingTasks.length > 0 ? (
              userData.pendingTasks.map((task) => (
                <div key={task.id} className="task-card">
                  
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className={`status-pill ${task.status === 'In Progress' ? 'in-progress' : 'pending'}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="task-info">
                    <p>
                      Priority: 
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </p>
                    <p>
                      Pomodoros: <strong>{task.pomodoros}</strong>
                    </p>
                    <p>
                      Due: <strong>{task.deadline}</strong>
                    </p>
                  </div>

                  <div className="task-actions">
                    <button 
                      className="start-timer-btn"
                      onClick={() => {
                        selectTaskForTimer(task.id, task.title); /* <-- 1. Save the task */
                        navigate('/timer');                      /* <-- 2. Go to Timer */
                      }}
                    >
                      <Play size={14} fill="currentColor" style={{ marginRight: '6px' }} />
                      Start Timer
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <p className="dashboard-message">No pending tasks! Time to relax or add a new one.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;