import type { SessionType, TimerTask } from "../types/timerTypes";

interface TimerCardProps {
  sessionType: SessionType;
  timeLeft: number;
  isRunning: boolean;
  isSavingSession: boolean;
  progress: number;
  ringColor: string;
  elapsedSeconds: number;
  selectedTask: TimerTask | null | undefined;
  completedForSelected: number;
  sessionDurations: Record<SessionType, number>;
  onSessionChange: (type: SessionType) => Promise<void>;
  onReset: () => Promise<void>;
  onStartPause: () => Promise<void>;
  onCompleteNow: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

export default function TimerCard({
  sessionType,
  timeLeft,
  isRunning,
  isSavingSession,
  progress,
  ringColor,
  elapsedSeconds,
  selectedTask,
  completedForSelected,
  sessionDurations,
  onSessionChange,
  onReset,
  onStartPause,
  onCompleteNow,
  formatTime,
}: TimerCardProps) {
  return (
    <section className="timer-card">
      {/* Session tabs */}
      <div className="session-tabs">
        {(Object.keys(sessionDurations) as SessionType[]).map((type) => (
          <button
            key={type}
            type="button"
            className={sessionType === type ? "active" : ""}
            onClick={() => onSessionChange(type)}
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

      {/* Active task hint pill with progress pips */}
      {selectedTask && (
        <p className="active-task-hint">
          <span className="active-task-hint__dot" />
          <span className="active-task-hint__title">{selectedTask.title}</span>
          <span className="active-task-hint__sep">·</span>
          <span className="active-task-hint__poms">
            {Array.from({ length: selectedTask.estimatedPomodoros }).map((_, i) => (
              <span
                key={i}
                className={`pom-pip${i < completedForSelected ? " done" : ""}`}
              />
            ))}
          </span>
          <span className="active-task-hint__count">
            {completedForSelected}/{selectedTask.estimatedPomodoros}
          </span>
        </p>
      )}

      {/* Controls */}
      <div className="timer-controls">
        <button
          type="button"
          className="reset-btn"
          onClick={onReset}
          disabled={isSavingSession}
        >
          Reset
        </button>
        <button
          type="button"
          className="start-btn"
          onClick={onStartPause}
          disabled={isSavingSession}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>

      {(isRunning || (elapsedSeconds > 0 && !isSavingSession)) && (
        <button
          type="button"
          className="complete-early-btn"
          onClick={onCompleteNow}
          disabled={isSavingSession}
        >
          Mark complete early
        </button>
      )}
    </section>
  );
}