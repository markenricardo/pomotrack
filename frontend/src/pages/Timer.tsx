import { useEffect, useMemo, useState } from "react";
import "../styles/Timer.css";
import PageHeader from "../components/Pageheader";

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
  priority: (task as any).priority ?? "medium",
  status: task.status,
});

const formatFocusTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
};

function Timer() {
  const [sessionType, setSessionType] = useState<SessionType>("Focus");
  const [timeLeft, setTimeLeft] = useState<number>(sessionDurations.Focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [activePomodoroId, setActivePomodoroId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | "">("");

  const [tasks, setTasks] = useState<TimerTask[]>([]);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  // Change 1: track total focus time across completed sessions
  const [totalFocusSeconds, setTotalFocusSeconds] = useState<number>(0);

  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  // Change 4: notes shown automatically after session ends, no toggle needed
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);

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
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const progress = useMemo(() => {
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [timeLeft, totalDuration]);

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
    setShowNotes(false);
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
      // Hide notes panel when starting a new session
      setShowNotes(false);

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
      setShowNotes(false);
    } catch (err) {
      console.error(err);
      setError("Failed to reset the timer.");
    }
  };

  const finalizeSession = async (pomodoroId: number, duration: number) => {
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
      setCompletedSessions((prev) => prev + 1);
      // Change 1: accumulate total focus time
      setTotalFocusSeconds((prev) => prev + duration);
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
      await finalizeSession(pomodoroId, actualDuration);

      if (soundEnabled) {
        playFinishSound();
      }

      setActivePomodoroId(null);
      // Change 4: auto-show notes after session ends
      setShowNotes(true);

      if (sessionType === "Focus" && autoStartBreak) {
        setSessionType("Short Break");
        setTimeLeft(sessionDurations["Short Break"]);
        setIsRunning(false);
        setShowNotes(false);
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
    if (!activePomodoroId && elapsedSeconds <= 0) return;

    try {
      setIsRunning(false);
      setIsSavingSession(true);
      setError("");

      let pomodoroId = activePomodoroId;
      if (!pomodoroId) {
        pomodoroId = await startNewPomodoro();
      }

      const actualDuration = Math.max(elapsedSeconds, 1);
      await finalizeSession(pomodoroId, actualDuration);

      setActivePomodoroId(null);
      setTimeLeft(sessionDurations[sessionType]);
      // Change 4: auto-show notes after completing early
      setShowNotes(true);
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
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Change 5: idle ring shows a subtle 3% arc so it looks "ready"
  const ringProgress = isRunning || elapsedSeconds > 0 ? progress : 3;

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

              {/* Change 2: task dropdown removed — selection via Upcoming Tasks list only */}

              {/* Timer ring */}
              <div className="timer-circle-wrapper">
                <div
                  className="timer-ring"
                  style={{
                    // Change 5: idle state uses muted color so ring looks ready
                    background: isRunning || elapsedSeconds > 0
                      ? `conic-gradient(#0d2b4e ${ringProgress}%, #e5e7eb ${ringProgress}%)`
                      : `conic-gradient(#c7d4e8 ${ringProgress}%, #e5e7eb ${ringProgress}%)`,
                  }}
                >
                  <div className="timer-inner">
                    <span>{sessionType}</span>
                    <h2>{formatTime(timeLeft)}</h2>
                    <p>{activePomodoroId ? "session active" : "ready"}</p>
                  </div>
                </div>
              </div>

              {/* Change 3: Complete button only shown when session is running */}
              <div className={`timer-controls ${elapsedSeconds > 0 ? "show-complete" : ""}`}>
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
                  className={`start-btn ${elapsedSeconds > 0 ? "" : "start-btn--full"}`}
                  onClick={handleStartPause}
                  disabled={isSavingSession}
                >
                  {isRunning ? "Pause" : "Start"}
                </button>

                {elapsedSeconds > 0 && (
                  <button
                    type="button"
                    className="complete-btn"
                    onClick={handleCompleteNow}
                    disabled={isSavingSession}
                  >
                    Complete
                  </button>
                )}
              </div>
            </section>

            {/* Change 4: Notes shown automatically after session ends */}
            {showNotes && (
              <section className="notes-card">
                <h2>Session Notes</h2>
                <p className="notes-hint">Great work! Add any notes about this session.</p>
                <textarea
                  placeholder="What did you accomplish? Any blockers?"
                  value={sessionNotes}
                  onChange={(event) => setSessionNotes(event.target.value)}
                  autoFocus
                />
              </section>
            )}
          </div>

          {/* ── Right column ── */}
          <aside className="timer-right">
            {/* Today's Progress — Change 1: uses accumulated totalFocusSeconds */}
            <section className="progress-card">
              <h2>Today's Progress</h2>

              <div className="progress-item">
                <div className="progress-icon green">⏱</div>
                <div className="progress-info">
                  <h3>Today's Focus Time</h3>
                  <strong>{formatFocusTime(totalFocusSeconds)}</strong>
                  <span>/ today total</span>
                  <div className="progress-bar">
                    <div
                      style={{
                        width: `${Math.min((totalFocusSeconds / (4 * 25 * 60)) * 100, 100)}%`,
                      }}
                    />
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
                    <div
                      style={{
                        width: `${Math.min((completedSessions / 12) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Upcoming Tasks — Change 2: primary task selector, Change 6: priority badges */}
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
                      className={`upcoming-task ${selectedTaskId === task.id ? "selected" : ""}`}
                      key={task.id}
                      onClick={() =>
                        setSelectedTaskId(selectedTaskId === task.id ? "" : task.id)
                      }
                      disabled={isRunning}
                    >
                      <span className="task-circle" />
                      <p>{task.title}</p>
                      {/* Change 6: priority badge instead of due date */}
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Session Settings — Change 7: removed "Selected Task" row, Change 4: removed Session Notes toggle */}
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
                <span>Sound</span>
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