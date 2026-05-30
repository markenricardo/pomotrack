import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Star, 
  Award, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle,
  Lock,
  Unlock
} from "lucide-react";
import '../styles/Achievements.css'; 

interface XPProgress {
  current_level_xp: number;
  required_for_next: number;
  remaining: number;
}

interface Stats {
  total_pomodoros: number;
  total_hours: number;
}

interface Badges {
  first_session: boolean;
  completed_5_pomodoros: boolean;
  focused_10_hours: boolean;
  task_finisher: boolean;
}

interface AchievementData {
  level: number;
  title: string;
  total_xp: number;
  xp_progress: XPProgress;
  stats: Stats;
  badges: Badges;
}

function Achievements() {
  const [data, setData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/v1/achievements', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="achievements-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading your progress...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="achievements-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>{error || "Something went wrong."}</h2>
      </div>
    );
  }

  const progressPercentage = (data.xp_progress.current_level_xp / data.xp_progress.required_for_next) * 100;

  return (
    <div className="achievements-page">
      <div className="achievements-container">
        
        {/* HEADER */}
        <header className="page-header">
          <h1>Your Achievements</h1>
          <p>Level up by staying focused and completing your tasks.</p>
        </header>

        {/* LEVEL & XP SECTION */}
        <section className="level-banner">
          <div className="level-header">
            <div className="level-title-block">
              <p>Level {data.level}</p>
              <h2>{data.title}</h2>
            </div>
            <div className="xp-text">
              <span>{data.total_xp}</span> XP Total
            </div>
          </div>
          
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </section>

        {/* QUICK STATS GRID */}
        <section className="stats-grid">
           <div className="stat-card">
            <div className="stat-icon purple">
              <Star size={28} strokeWidth={2.5} />
            </div>
            <div className="stat-info">
              <p>Total Sessions</p>
              <h3>{data.stats.total_pomodoros}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">
              <Award size={28} strokeWidth={2.5} />
            </div>
            <div className="stat-info">
              <p>Lifetime Focus</p>
              <h3>{data.stats.total_hours}h</h3>
            </div>
          </div>
        </section>

        {/* BADGES & ACHIEVEMENTS GRID */}
        <section>
          <h2 className="section-title">Unlocked Badges</h2>
          <div className="badges-grid">
            
            <BadgeCard 
              unlocked={data.badges.first_session} 
              icon={<Zap size={28} strokeWidth={2} />} 
              colorClass="yellow"
              title="First Session" 
              desc="Completed your very first focus block." 
            />
            <BadgeCard 
              unlocked={data.badges.completed_5_pomodoros} 
              icon={<Target size={28} strokeWidth={2} />} 
              colorClass="green"
              title="Getting Serious" 
              desc="Completed 5 total pomodoro sessions." 
            />
            <BadgeCard 
              unlocked={data.badges.focused_10_hours} 
              icon={<Clock size={28} strokeWidth={2} />} 
              colorClass="red"
              title="Deep Worker" 
              desc="Logged over 10 hours of focus time." 
            />
            <BadgeCard 
              unlocked={data.badges.task_finisher} 
              icon={<CheckCircle size={28} strokeWidth={2} />} 
              colorClass="yellow"
              title="Task Finisher" 
              desc="Completed 10 specific tasks." 
            />

          </div>
        </section>

      </div>
    </div>
  );
}

// Reusable sub-component utilizing your specific CSS classes
function BadgeCard({ unlocked, icon, colorClass, title, desc }: { unlocked: boolean, icon: React.ReactNode, colorClass: string, title: string, desc: string }) {
  return (
    <div className={`badge-card ${unlocked ? '' : 'locked'}`}>
      <div className={`badge-icon ${colorClass}`}>
        {icon}
      </div>
      
      <div className="badge-details">
        <h4>{title}</h4>
        <p>{desc}</p>
        
        <div className={`badge-status ${unlocked ? 'status-unlocked' : 'status-locked'}`}>
          {unlocked ? <Unlock size={14} /> : <Lock size={14} />}
          {unlocked ? 'Unlocked' : 'Locked'}
        </div>
      </div>
    </div>
  );
}

export default Achievements;