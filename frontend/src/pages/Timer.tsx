import { useEffect, useMemo, useState } from "react";
import "../styles/Timer.css";

import {
  associateTaskWithPomodoro,
  completePomodoro,
  createPomodoro,
  deletePomodoro,
  pausePomodoro,
  resumePomodoro,
} from "../api/pomodorosApi";

import type { BackendSessionType } from "../api/pomodorosApi";

import { getTasks } from "../api/tasksApi";
import type { BackendTask } from "../api/tasksApi";

type SessionType = "Focus" | "Short Break" | "Long Break";

type TimerTask = {
  id: number;
  title: string;
  due: string;
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

const formatDate = (date?: string | null) => {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mapBackendTaskToTimerTask = (task: BackendTask): TimerTask => ({
  id: task.id,
  title: task.title,
  due: formatDate(task.deadline ?? task.created_at),
  status: task.status,
});

function Timer() {
  const [sessionType, setSessionType] = useState<SessionType>("Focus");
  const [timeLeft, setTimeLeft] = useState<number>(sessionDurations.Focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [activePomodoroId, setActivePomodoroId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | "">("");

  const [tasks, setTasks] = useState<TimerTask[]>([]);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotesEnabled, setSessionNotesEnabled] =
    useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const totalDuration = sessionDurations[sessionType];
  const elapsedSeconds = totalDuration - timeLeft;

  useEffect(() => {
    loadTasks();
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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const progress = useMemo(() => {
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [timeLeft, totalDuration]);

  const todayFocusLabel = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes}m`;
  }, [elapsedSeconds]);

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

  const handleTimerFinished = async () => {
    try {
      setIsRunning(false);
      setIsSavingSession(true);
      setError("");

      let pomodoroId = activePomodoroId;

      if (!pomodoroId) {
        pomodoroId = await startNewPomodoro();
      }

      const actualDuration = sessionDurations[sessionType];

      await completePomodoro(pomodoroId, actualDuration);

      if (selectedTaskId) {
        await associateTaskWithPomodoro(pomodoroId, {
          pomodoro_session_id: pomodoroId,
          task_id: selectedTaskId,
          time_spent: actualDuration,
          notes: sessionNotes.trim() || null,
        });
      }

      if (sessionType === "Focus") {
        setCompletedSessions((prev) => prev + 1);
      }

      if (soundEnabled) {
        playFinishSound();
      }

      setActivePomodoroId(null);
      setSessionNotes("");

      if (sessionType === "Focus" && autoStartBreak) {
        setSessionType("Short Break");
        setTimeLeft(sessionDurations["Short Break"]);
        setIsRunning(false);
        return;
      }

      setTimeLeft(sessionDurations[sessionType]);
    } catch (err) {
      console.error(err);
      setError("Failed to complete the Pomodoro session.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleCompleteNow = async () => {
    if (!activePomodoroId && elapsedSeconds <= 0) {
      return;
    }

    try {
      setIsRunning(false);
      setIsSavingSession(true);
      setError("");

      let pomodoroId = activePomodoroId;

      if (!pomodoroId) {
        pomodoroId = await startNewPomodoro();
      }

      const actualDuration = Math.max(elapsedSeconds, 1);

      await completePomodoro(pomodoroId, actualDuration);

      if (selectedTaskId) {
        await associateTaskWithPomodoro(pomodoroId, {
          pomodoro_session_id: pomodoroId,
          task_id: selectedTaskId,
          time_spent: actualDuration,
          notes: sessionNotes.trim() || null,
        });
      }

      if (sessionType === "Focus") {
        setCompletedSessions((prev) => prev + 1);
      }

      setActivePomodoroId(null);
      setTimeLeft(sessionDurations[sessionType]);
      setSessionNotes("");
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

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  return (
    <div className="timer-page">
      <main className="timer-content">
        <header className="timer-header">
          <h1>Focus Timer</h1>
          <p>Stay focused, complete your tasks, and save your Pomodoro sessions.</p>
        </header>

        {error && <p className="timer-error">{error}</p>}

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

              <div className="task-select-group">
                <label>Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(event) =>
                    setSelectedTaskId(
                      event.target.value ? Number(event.target.value) : ""
                    )
                  }
                  disabled={isRunning}
                >
                  <option value="">No task selected</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="timer-circle-wrapper">
                <div
                  className="timer-ring"
                  style={{
                    background: `conic-gradient(var(--color-primary) ${progress}%, #d9d9d9 ${progress}%)`,
                  }}
                >
                  <div className="timer-inner">
                    <span>{sessionType}</span>
                    <h2>{formatTime(timeLeft)}</h2>
                    <p>{activePomodoroId ? "session active" : "ready"}</p>
                  </div>
                </div>
              </div>

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

                <button
                  type="button"
                  className="complete-btn"
                  onClick={handleCompleteNow}
                  disabled={isSavingSession || elapsedSeconds <= 0}
                >
                  Complete
                </button>
              </div>
            </section>

            {sessionNotesEnabled && (
              <section className="notes-card">
                <h2>Session Notes</h2>

                <textarea
                  placeholder="Write notes for this Pomodoro session..."
                  value={sessionNotes}
                  onChange={(event) => setSessionNotes(event.target.value)}
                />
              </section>
            )}
          </div>

          <aside className="timer-right">
            <section className="progress-card">
              <h2>Today’s Progress</h2>

              <div className="progress-item">
                <div className="progress-icon green">⏱</div>

                <div className="progress-info">
                  <h3>Current Focus Time</h3>
                  <strong>{todayFocusLabel}</strong>
                  <span>/ current session</span>
                  <div className="progress-bar">
                    <div style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-icon yellow">✓</div>

                <div className="progress-info">
                  <h3>Completed Sessions</h3>
                  <strong>{completedSessions}</strong>
                  <span>/ this page session</span>
                  <div className="progress-bar">
                    <div
                      style={{
                        width: `${Math.min((completedSessions / 12) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="tasks-card">
              <h2>Upcoming Tasks</h2>

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
                      onClick={() => setSelectedTaskId(task.id)}
                      disabled={isRunning}
                    >
                      <span className="task-circle"></span>
                      <p>{task.title}</p>
                      <small>{task.due}</small>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="settings-card">
              <h2>Session Settings</h2>

              <div className="settings-row">
                <span>Selected Task</span>
                <strong>{selectedTask ? selectedTask.title : "None"}</strong>
              </div>

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