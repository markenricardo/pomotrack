import { useEffect, useMemo, useState } from "react";
import "../styles/Timer.css";

type SessionType = "Focus" | "Short Break" | "Long Break";

type Task = {
  id: number;
  title: string;
  due: string;
};

const sessionDurations: Record<SessionType, number> = {
  Focus: 25 * 60,
  "Short Break": 5 * 60,
  "Long Break": 15 * 60,
};

const tasks: Task[] = [
  { id: 1, title: "Analytics Page", due: "Today, 11:00 AM" },
  { id: 2, title: "Software Design Documentation", due: "Today, 2:00 PM" },
  { id: 3, title: "Database Schema Update", due: "Tomorrow" },
];

function Timer() {
  const [sessionType, setSessionType] = useState<SessionType>("Short Break");
  const [timeLeft, setTimeLeft] = useState<number>(
    sessionDurations["Short Break"]
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(7);
  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotesEnabled, setSessionNotesEnabled] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      setIsRunning(false);

      if (sessionType === "Focus") {
        setCompletedSessions((prev) => prev + 1);

        if (autoStartBreak) {
          setSessionType("Short Break");
          setTimeLeft(sessionDurations["Short Break"]);
          setIsRunning(true);
        }
      }

      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, timeLeft, sessionType, autoStartBreak]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleSessionChange = (type: SessionType): void => {
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsRunning(false);
  };

  const progress = useMemo(() => {
    return (
      ((sessionDurations[sessionType] - timeLeft) /
        sessionDurations[sessionType]) *
      100
    );
  }, [sessionType, timeLeft]);

  return (
    <div className="timer-page">
      <main className="timer-content">
        <header className="timer-header">
          <h1>Focus Timer</h1>
          <p>Stay focused, complete your tasks, and achieve your goals.</p>
        </header>

        <section className="timer-grid">
          <div className="timer-left">
            <section className="timer-card">
              <div className="session-tabs">
                {(Object.keys(sessionDurations) as SessionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={sessionType === type ? "active" : ""}
                    onClick={() => handleSessionChange(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="timer-circle-wrapper">
                <div
                  className="timer-ring"
                  style={{
                    background: `conic-gradient(#003a70 ${progress}%, #d9d9d9 ${progress}%)`,
                  }}
                >
                  <div className="timer-inner">
                    <span>{sessionType}</span>
                    <h2>{formatTime(timeLeft)}</h2>
                    <p>time left</p>
                  </div>
                </div>
              </div>

              <div className="timer-controls">
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(sessionDurations[sessionType]);
                  }}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="start-btn"
                  onClick={() => setIsRunning((prev) => !prev)}
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
              </div>
            </section>

            <section className="notes-card">
              <h2>Session Notes</h2>

              <textarea
                placeholder="Write notes after this session..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </section>
          </div>

          <aside className="timer-right">
            <section className="progress-card">
              <h2>Today’s Progress</h2>

              <div className="progress-item">
                <div className="progress-icon green">⏱</div>

                <div className="progress-info">
                  <h3>Today’s Focus Time</h3>
                  <strong>3h 4m</strong>
                  <span>/ 8h goal</span>
                  <div className="progress-bar">
                    <div style={{ width: "43%" }} />
                  </div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-icon yellow">✓</div>

                <div className="progress-info">
                  <h3>Completed Sessions</h3>
                  <strong>{completedSessions}</strong>
                  <span>/ 12 sessions</span>
                  <div className="progress-bar">
                    <div style={{ width: `${(completedSessions / 12) * 100}%` }} />
                  </div>
                </div>
              </div>
            </section>

            <section className="tasks-card">
              <h2>Upcoming Tasks</h2>

              <div className="upcoming-list">
                {tasks.map((task) => (
                  <div className="upcoming-task" key={task.id}>
                    <span className="task-circle"></span>
                    <p>{task.title}</p>
                    <small>{task.due}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="settings-card">
              <h2>Session Settings</h2>

              <div className="settings-row">
                <span>Auto-start Breaks</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={autoStartBreak}
                    onChange={() => setAutoStartBreak((prev) => !prev)}
                  />
                  <b></b>
                </label>
              </div>

              <div className="settings-row">
                <span>Sound</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled((prev) => !prev)}
                  />
                  <b></b>
                </label>
              </div>

              <div className="settings-row">
                <span>Session Notes</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={sessionNotesEnabled}
                    onChange={() => setSessionNotesEnabled((prev) => !prev)}
                  />
                  <b></b>
                </label>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default Timer;