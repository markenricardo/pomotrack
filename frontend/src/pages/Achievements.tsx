import React from 'react';
import '../styles/Achievements.css'; 
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  Medal,
  Lock,
  Unlock
} from 'lucide-react';

function Achievements() {
  // Mock data based on the PDF requirements
  const userProgress = {
    level: 3,
    title: "Focus Learner",
    currentXP: 450,
    requiredXP: 700,
    currentStreak: 7,
    totalBadges: 3,
  };

  const xpPercentage = (userProgress.currentXP / userProgress.requiredXP) * 100;

  const achievementsData = [
    {
      id: 1,
      title: "First Focus Session",
      description: "Successfully complete your very first Pomodoro session.",
      icon: <Trophy size={28} strokeWidth={2.5} />,
      colorClass: "yellow",
      isUnlocked: true,
    },
    {
      id: 2,
      title: "Completed 5 Pomodoros",
      description: "Finish 5 full Pomodoro intervals.",
      icon: <Target size={28} strokeWidth={2.5} />,
      colorClass: "blue",
      isUnlocked: true,
    },
    {
      id: 3,
      title: "7-Day Study Streak",
      description: "Maintain a daily focus streak for an entire week.",
      icon: <Flame size={28} strokeWidth={2.5} />,
      colorClass: "red",
      isUnlocked: true,
    },
    {
      id: 4,
      title: "Focused for 10 Hours",
      description: "Accumulate a total of 10 hours of pure focus time.",
      icon: <Clock size={28} strokeWidth={2.5} />,
      colorClass: "locked",
      isUnlocked: false,
    },
    {
      id: 5,
      title: "Task Finisher",
      description: "Mark 10 pending tasks as fully completed.",
      icon: <CheckCircle2 size={28} strokeWidth={2.5} />,
      colorClass: "locked",
      isUnlocked: false,
    },
  ];

  return (
    <div className="achievements-page">
      <div className="achievements-container">

        {/* HEADER SECTION */}
        <header className="page-header">
          <h1>Achievements</h1>
          <p>Track your progress, build streaks, and earn badges for your productivity.</p>
        </header>

        {/* LEVEL & XP BANNER */}
        <section className="level-banner">
          <div className="level-header">
            <div className="level-title-block">
              <p>Current Level: {userProgress.level}</p>
              <h2>{userProgress.title}</h2>
            </div>
            <div className="xp-text">
              <span>{userProgress.currentXP}</span> / {userProgress.requiredXP} XP
            </div>
          </div>
          
          <div className="xp-bar-container">
            <div 
              className="xp-bar-fill" 
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orange">
              <Flame size={28} strokeWidth={2.5} />
            </div>
            <div className="stat-info">
              <p>Current Streak</p>
              <h3>{userProgress.currentStreak} Days</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Medal size={28} strokeWidth={2.5} />
            </div>
            <div className="stat-info">
              <p>Total XP</p>
              <h3>{userProgress.currentXP}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Trophy size={28} strokeWidth={2.5} />
            </div>
            <div className="stat-info">
              <p>Badges Earned</p>
              <h3>{userProgress.totalBadges}</h3>
            </div>
          </div>
        </section>

        {/* BADGES GRID */}
        <h2 className="section-title">Your Badges</h2>
        
        <section className="badges-grid">
          {achievementsData.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`badge-card ${achievement.isUnlocked ? '' : 'locked'}`}
            >
              <div className={`badge-icon ${achievement.isUnlocked ? achievement.colorClass : ''}`}>
                {achievement.icon}
              </div>
              
              <div className="badge-details">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                
                <div className={`badge-status ${achievement.isUnlocked ? 'status-unlocked' : 'status-locked'}`}>
                  {achievement.isUnlocked ? (
                    <><Unlock size={14} /> Unlocked</>
                  ) : (
                    <><Lock size={14} /> Locked</>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}

export default Achievements;