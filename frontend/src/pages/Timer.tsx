import { useEffect, useMemo, useState } from "react";
import "../styles/Timer.css";
import PageHeader from "../components/PageHeader";

import {
  associateTaskWithPomodoro,
  completePomodoro,
  createPomodoro,
  deletePomodoro,
  pausePomodoro,
  resumePomodoro,
  getPomodoros,
} from "../api/pomodorosApi";

import type { BackendSessionType } from "../api/pomodorosApi";

import { getTasks } from "../api/tasksApi";
import type { BackendTask } from "../api/tasksApi";

type SessionType = "Focus" | "Short Break" | "Long Break";

type TimerTask = {
  id: number;
  title: string;
  priority: string;
  status: string;
};

const sessionDurations: Record<SessionType, number> = {
  Focus: 25 * 60,
  "Short Break": 5 * 60,
  "Long Break": 15 * 60,
};

const sessionTypeToBackend = (
  sessionType: SessionType
): BackendSessionType => {
  if (sessionType === "Short Break") return "short_break";
  if (sessionType === "Long Break") return "long_break";
  return "work";
};

const mapBackendTaskToTimerTask = (task: BackendTask): TimerTask => ({
  id: task.id,
  title: task.title,
  priority: task.priority ?? "medium",
  status: task.status,
});

const formatFocusTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
};

const isToday = (isoString: string): boolean => {
  const date = new Date(isoString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

function Timer() {
  const [sessionType, setSessionType] = useState<SessionType>("Focus");
  const [timeLeft, setTimeLeft] = useState<number>(sessionDurations.Focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [activePomodoroId, setActivePomodoroId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [tasks, setTasks] = useState<TimerTask[]>([]);

  const [todayFocusSeconds, setTodayFocusSeconds] = useState<number>(0);
  const [todaySessionCount, setTodaySessionCount] = useState<number>(0);

  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const totalDuration = sessionDurations[sessionType];
  const elapsedSeconds = totalDuration - timeLeft;

  useEffect(() => {
    loadTasks();
    loadTodayStats();
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      handleTimerFinished();
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, timeLeft]);

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      setError("");

      const backendTasks = await getTasks();
      const mappedTasks = backendTasks
        .filter((task) => task.status !== "completed")
        .map(mapBackendTaskToTimerTask);

      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      setError("Unable to load tasks. Please make sure you are logged in.");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadTodayStats = async () => {
    try {
      setIsLoadingStats(true);
      const allPomodoros = await getPomodoros();
      const todayCompleted = allPomodoros.filter(
        (p) =>
          p.status === "completed" &&
          p.session_type === "work" &&
          p.completed_at &&
          isToday(p.completed_at)
      );
      const totalSeconds = todayCompleted.reduce(
        (sum, p) => sum + (p.actual_duration ?? p.duration ?? 0),
        0
      );
      setTodayFocusSeconds(totalSeconds);
      setTodaySessionCount(todayCompleted.length);
    } catch (err) {
      console.error("Could not load today's stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const progress = useMemo(() => {
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [timeLeft, totalDuration]);

  // Teal ring at idle, navy once started
  const ringColor = isRunning || elapsedSeconds > 0 ? "#0d2b4e" : "#008080";

  const dailyGoalSeconds = 8 * 60 * 60;
  const focusBarWidth = Math.min((todayFocusSeconds / dailyGoalSeconds) * 100, 100);
  const sessionBarWidth = Math.min((todaySessionCount / 12) * 100, 100);

  const handleSessionChange = async (type: SessionType) => {
    if (activePomodoroId && isRunning) {
      const shouldChange = window.confirm(
        "Changing the session will reset your active timer. Continue?"
      );
      if (!shouldChange) return;
    }

    if (activePomodoroId) {
      try {
        await deletePomodoro(activePomodoroId);
      } catch (err) {
        console.error(err);
      }
    }

    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsRunning(false);
    setActivePomodoroId(null);
    setSessionNotes("");
    setError("");
  };

  const startNewPomodoro = async () => {
    const backendType = sessionTypeToBackend(sessionType);

    const createdPomodoro = await createPomodoro({
      start_time: new Date().toISOString(),
      duration: sessionDurations[sessionType],
      session_type: backendType,
    });

    setActivePomodoroId(createdPomodoro.id);
    return createdPomodoro.id;
  };

  const handleStartPause = async () => {
    try {
      setError("");

      if (!isRunning) {
        if (!activePomodoroId) {
          await startNewPomodoro();
        } else {
          await resumePomodoro(activePomodoroId);
        }
        setIsRunning(true);
        return;
      }

      if (activePomodoroId) {
        await pausePomodoro(activePomodoroId);
      }

      setIsRunning(false);
    } catch (err) {
      console.error(err);
      setError("Failed to start or pause the timer.");
    }
  };

  const handleReset = async () => {
    try {
      setError("");

      if (activePomodoroId) {
        await deletePomodoro(activePomodoroId);
      }

      setIsRunning(false);
      setActivePomodoroId(null);
      setTimeLeft(sessionDurations[sessionType]);
      setSessionNotes("");
    } catch (err) {
      console.error(err);
      setError("Failed to reset the timer.");
    }
  };

  const finaliseSession = async (pomodoroId: number, duration: number) => {
    await completePomodoro(pomodoroId, duration);
    if (selectedTaskId) {
      await associateTaskWithPomodoro(pomodoroId, {
        pomodoro_session_id: pomodoroId,
        task_id: selectedTaskId,
        time_spent: duration,
        notes: sessionNotes.trim() || null,
      });
    }
    if (sessionType === "Focus") {
      setTodayFocusSeconds((prev) => prev + duration);
      setTodaySessionCount((prev) => prev + 1);
    }
    if (soundEnabled) playFinishSound();
  };

  const handleTimerFinished = async () => {
    try {
      setIsRunning(false);
      setIsSavingSession(true);
      setError("");

      const pomodoroId = activePomodoroId ?? (await startNewPomodoro());
      await finaliseSession(pomodoroId, sessionDurations[sessionType]);

      setActivePomodoroId(null);
      setTimeLeft(sessionDurations[sessionType]);

      if (sessionType === "Focus" && autoStartBreak) {
        setSessionType("Short Break");
        setTimeLeft(sessionDurations["Short Break"]);
        return;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to complete the Pomodoro session.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleCompleteNow = async () => {
    if (!isRunning && elapsedSeconds <= 0) return;

    try {
      setIsRunning(false);
      setIsSavingSession(true);
      setError("");

      const pomodoroId = activePomodoroId ?? (await startNewPomodoro());
      const duration = Math.max(elapsedSeconds, 1);
      await finaliseSession(pomodoroId, duration);

      setActivePomodoroId(null);
      setTimeLeft(sessionDurations[sessionType]);
    } catch (err) {
      console.error(err);
      setError("Failed to complete the Pomodoro session.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const playFinishSound = () => {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const priorityClass = (p: string) => p.toLowerCase();

  return (
    <div className="timer-page">
      <main className="timer-content">
        <PageHeader
          title="Focus Timer"
          subtitle="Stay focused, complete your tasks, and achieve your goals."
        />

        {error && <p className="timer-error">{error}</p>}

        <section className="timer-grid">
          {/* ── Left column ── */}
          <div className="timer-left">
            <section className="timer-card">

              {/* Session tabs */}
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

              {/* Timer ring */}
              <div className="timer-circle-wrapper">
                <div
                  className="timer-ring"
                  style={{
                    background: `conic-gradient(${ringColor} ${progress}%, #e5e7eb ${progress}%)`,
                  }}
                >
                  <div className="timer-inner">
                    <span>{sessionType}</span>
                    <h2>{formatTime(timeLeft)}</h2>
                    <p>
                      {isRunning
                        ? "session active"
                        : elapsedSeconds > 0
                        ? "paused"
                        : "ready"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls: Reset | Start/Pause */}
              <div className="timer-controls">
                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleReset}
                  disabled={isSavingSession}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="start-btn"
                  onClick={handleStartPause}
                  disabled={isSavingSession}
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
              </div>

              {/* Complete early — secondary, only shown while active */}
              {(isRunning || (elapsedSeconds > 0 && !isSavingSession)) && (
                <button
                  type="button"
                  className="complete-early-btn"
                  onClick={handleCompleteNow}
                  disabled={isSavingSession}
                >
                  Mark complete early
                </button>
              )}
            </section>

            {/* Session Notes — always visible */}
            <section className="notes-card">
              <h2>Session Notes</h2>
              <p className="notes-prompt">
                Jot down anything from your session — blockers, progress, or ideas.
              </p>
              <textarea
                placeholder="What did you work on? Any blockers? How was your focus?"
                value={sessionNotes}
                onChange={(event) => setSessionNotes(event.target.value)}
              />
            </section>
          </div>

          {/* ── Right column ── */}
          <aside className="timer-right">

            {/* Today's Progress — real data from backend */}
            <section className="progress-card">
              <h2>Today's Progress</h2>

              {isLoadingStats ? (
                <p className="small-muted">Loading stats...</p>
              ) : (
                <>
                  <div className="progress-item">
                    <div className="progress-icon green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="progress-info">
                      <h3>Today's Focus Time</h3>
                      <strong>{formatFocusTime(todayFocusSeconds)}</strong>
                      <span>/ 8h goal</span>
                      <div className="progress-bar">
                        <div style={{ width: `${focusBarWidth}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="progress-item">
                    <div className="progress-icon yellow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="progress-info">
                      <h3>Completed Sessions</h3>
                      <strong>{todaySessionCount}</strong>
                      <span>/ 12 sessions</span>
                      <div className="progress-bar">
                        <div style={{ width: `${sessionBarWidth}%` }} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Focus on a Task — click to select, priority badge instead of due time */}
            <section className="tasks-card">
              <h2>Focus on a Task</h2>

              {isLoadingTasks ? (
                <p className="small-muted">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="small-muted">No pending tasks found.</p>
              ) : (
                <div className="upcoming-list">
                  {tasks.slice(0, 5).map((task) => (
                    <button
                      type="button"
                      className={`upcoming-task ${
                        selectedTaskId === task.id ? "selected" : ""
                      }`}
                      key={task.id}
                      onClick={() =>
                        setSelectedTaskId(
                          selectedTaskId === task.id ? null : task.id
                        )
                      }
                      disabled={isRunning}
                    >
                      <span className="task-circle" />
                      <p>{task.title}</p>
                      <span className={`task-priority-badge ${priorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedTaskId && (
                <p className="task-selected-hint">
                  ✓ Task linked — it will be saved with your next session.
                </p>
              )}
            </section>

            {/* Session Settings — 2 toggles, no clutter */}
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
                  <b />
                </label>
              </div>

              <div className="settings-row">
                <span>Sound on Complete</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled((prev) => !prev)}
                  />
                  <b />
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