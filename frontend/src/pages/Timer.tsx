import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Timer.css";
import PageHeader from "../components/Pageheader";
import TimerCard from "../components/TimerCard";

import {
  associateTaskWithPomodoro,
  completePomodoro,
  createPomodoro,
  deletePomodoro,
  pausePomodoro,
  resumePomodoro,
} from "../api/pomodorosApi";

import type { BackendSessionType } from "../api/pomodorosApi";
import { getTasks, updateTask as updateTaskApi } from "../api/tasksApi";
import type { BackendTask } from "../api/tasksApi";
import { useAppContext } from "../context/AppContext";
import type { SessionType, TimerTask } from "../types/timerTypes";

const sessionDurations: Record<SessionType, number> = {
  Focus: 25 * 60,
  "Short Break": 5 * 60,
  "Long Break": 15 * 60,
};

const sessionTypeToBackend = (sessionType: SessionType): BackendSessionType => {
  if (sessionType === "Short Break") return "short_break";
  if (sessionType === "Long Break") return "long_break";
  return "work";
};

const mapBackendTaskToTimerTask = (task: BackendTask): TimerTask => ({
  id: task.id,
  title: task.title,
  priority: task.priority ?? "medium",
  status: task.status,
  estimatedPomodoros: task.estimated_duration ?? 1,
});

const formatFocusTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
};

type CompletionToast = {
  title: string;
  pomodoros: number;
};

function Timer() {
  const {
    todayFocusSeconds,
    todaySessionCount,
    addFocusSession,
    pendingTaskId,
    pendingTaskTitle,
    clearPendingTask,
    notifyTaskCompleted,
    statsLoaded,
  } = useAppContext();

  const [sessionType, setSessionType] = useState<SessionType>("Focus");
  const [timeLeft, setTimeLeft] = useState<number>(sessionDurations.Focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [activePomodoroId, setActivePomodoroId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [, setSelectedTaskTitle] = useState<string | null>(null);

  const [tasks, setTasks] = useState<TimerTask[]>([]);
  const [completedPomodorosForTask, setCompletedPomodorosForTask] = useState<Record<number, number>>({});

  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [completionToast, setCompletionToast] = useState<CompletionToast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalDuration = sessionDurations[sessionType];
  const elapsedSeconds = totalDuration - timeLeft;

  const didApplyPending = useRef(false);
  useEffect(() => {
    if (didApplyPending.current) return;
    if (pendingTaskId !== null && pendingTaskTitle !== null) {
      didApplyPending.current = true;
      setSelectedTaskId(pendingTaskId);
      setSelectedTaskTitle(pendingTaskTitle);
      clearPendingTask();
    }
  }, [pendingTaskId, pendingTaskTitle, clearPendingTask]);

  useEffect(() => { loadTasks(); }, []);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) { handleTimerFinished(); return; }
    const timer = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      setError("");
      const backendTasks = await getTasks();
      setTasks(backendTasks.filter((t) => t.status !== "completed").map(mapBackendTaskToTimerTask));
    } catch (err) {
      console.error(err);
      setError("Unable to load tasks. Please make sure you are logged in.");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = useMemo(() => ((totalDuration - timeLeft) / totalDuration) * 100, [timeLeft, totalDuration]);
  const ringColor = isRunning || elapsedSeconds > 0 ? "#0d2b4e" : "#008080";
  const dailyGoalSeconds = 8 * 60 * 60;
  const focusBarWidth = Math.min((todayFocusSeconds / dailyGoalSeconds) * 100, 100);
  const sessionBarWidth = Math.min((todaySessionCount / 12) * 100, 100);

  const showToast = (toast: CompletionToast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setCompletionToast(toast);
    toastTimer.current = setTimeout(() => setCompletionToast(null), 4500);
  };

  const handleSessionChange = async (type: SessionType) => {
    if (activePomodoroId && isRunning) {
      if (!window.confirm("Changing the session will reset your active timer. Continue?")) return;
    }
    if (activePomodoroId) {
      try { await deletePomodoro(activePomodoroId); } catch (err) { console.error(err); }
    }
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsRunning(false);
    setActivePomodoroId(null);
    setSessionNotes("");
    setError("");
  };

  const startNewPomodoro = async () => {
    const created = await createPomodoro({
      start_time: new Date().toISOString(),
      duration: sessionDurations[sessionType],
      session_type: sessionTypeToBackend(sessionType),
    });
    setActivePomodoroId(created.id);
    return created.id;
  };

  const handleStartPause = async () => {
    try {
      setError("");
      if (!isRunning) {
        if (!activePomodoroId) await startNewPomodoro();
        else await resumePomodoro(activePomodoroId);
        setIsRunning(true);
        return;
      }
      if (activePomodoroId) await pausePomodoro(activePomodoroId);
      setIsRunning(false);
    } catch (err) {
      console.error(err);
      setError("Failed to start or pause the timer.");
    }
  };

  const handleReset = async () => {
    try {
      setError("");
      if (activePomodoroId) await deletePomodoro(activePomodoroId);
      setIsRunning(false);
      setActivePomodoroId(null);
      setTimeLeft(sessionDurations[sessionType]);
      setSessionNotes("");
    } catch (err) {
      console.error(err);
      setError("Failed to reset the timer.");
    }
  };

  const maybeCompleteTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newCount = (completedPomodorosForTask[taskId] ?? 0) + 1;
    setCompletedPomodorosForTask((prev) => ({ ...prev, [taskId]: newCount }));
    if (newCount >= task.estimatedPomodoros) {
      try {
        await updateTaskApi(taskId, { status: "completed" });
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setSelectedTaskId(null);
        setSelectedTaskTitle(null);
        notifyTaskCompleted();
        showToast({ title: task.title, pomodoros: task.estimatedPomodoros });
      } catch (err) {
        console.error("Failed to auto-complete task:", err);
      }
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
      addFocusSession(duration);
      if (selectedTaskId) await maybeCompleteTask(selectedTaskId);
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
      await finaliseSession(pomodoroId, Math.max(elapsedSeconds, 1));
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
    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  };

  const priorityClass = (p: string) => p.toLowerCase();
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const completedForSelected = selectedTaskId ? (completedPomodorosForTask[selectedTaskId] ?? 0) : 0;

  return (
    <div className="timer-page">
      <main className="timer-content">
        <PageHeader
          title="Focus Timer"
          subtitle="Stay focused, complete your tasks, and achieve your goals."
        />

        {error && <p className="timer-error">{error}</p>}

        {completionToast && (
          <div className="completion-toast">
            <div className="completion-toast__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="completion-toast__body">
              <p className="completion-toast__title">Task completed</p>
              <p className="completion-toast__sub">
                {completionToast.title} &mdash; {completionToast.pomodoros} pomodoro{completionToast.pomodoros !== 1 ? "s" : ""}
              </p>
            </div>
            <button type="button" className="completion-toast__close" onClick={() => setCompletionToast(null)} aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="completion-toast__progress" />
          </div>
        )}

        <section className="timer-grid">
          <div className="timer-left">
            <TimerCard
              sessionType={sessionType}
              timeLeft={timeLeft}
              isRunning={isRunning}
              isSavingSession={isSavingSession}
              progress={progress}
              ringColor={ringColor}
              elapsedSeconds={elapsedSeconds}
              selectedTask={selectedTask}
              completedForSelected={completedForSelected}
              sessionDurations={sessionDurations}
              onSessionChange={handleSessionChange}
              onReset={handleReset}
              onStartPause={handleStartPause}
              onCompleteNow={handleCompleteNow}
              formatTime={formatTime}
            />
            <section className="notes-card">
              <h2>Session Notes</h2>
              <p className="notes-prompt">Jot down anything from your session — blockers, progress, or ideas.</p>
              <textarea
                placeholder="What did you work on? Any blockers? How was your focus?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </section>
          </div>

          <aside className="timer-right">
            <section className="progress-card">
              <h2>Today's Progress</h2>
              {!statsLoaded ? (
                <p className="small-muted">Loading stats...</p>
              ) : (
                <>
                  <div className="progress-item">
                    <div className="progress-icon green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="progress-info">
                      <h3>Today's Focus Time</h3>
                      <strong>{formatFocusTime(todayFocusSeconds)}</strong>
                      <span>/ 8h goal</span>
                      <div className="progress-bar"><div style={{ width: `${focusBarWidth}%` }} /></div>
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
                      <div className="progress-bar"><div style={{ width: `${sessionBarWidth}%` }} /></div>
                    </div>
                  </div>
                </>
              )}
            </section>

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
                      className={`upcoming-task ${selectedTaskId === task.id ? "selected" : ""}`}
                      key={task.id}
                      onClick={() => {
                        if (selectedTaskId === task.id) { setSelectedTaskId(null); setSelectedTaskTitle(null); }
                        else { setSelectedTaskId(task.id); setSelectedTaskTitle(task.title); }
                      }}
                      disabled={isRunning}
                    >
                      <span className="task-circle" />
                      <p>{task.title}</p>
                      <span className={`task-priority-badge ${priorityClass(task.priority)}`}>{task.priority}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedTaskId && <p className="task-selected-hint">Task linked — it will be saved with your next session.</p>}
            </section>

            <section className="settings-card">
              <h2>Session Settings</h2>
              <div className="settings-row">
                <span>Auto-start Breaks</span>
                <label className="switch">
                  <input type="checkbox" checked={autoStartBreak} onChange={() => setAutoStartBreak((p) => !p)} /><b />
                </label>
              </div>
              <div className="settings-row">
                <span>Sound on Complete</span>
                <label className="switch">
                  <input type="checkbox" checked={soundEnabled} onChange={() => setSoundEnabled((p) => !p)} /><b />
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