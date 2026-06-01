import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getPomodoros } from "../api/pomodorosApi";

type AppContextValue = {
  // Timer stats — persist across navigation
  todayFocusSeconds: number;
  todaySessionCount: number;
  addFocusSession: (durationSeconds: number) => void;

  // Task pre-selection from Tasks → Timer
  pendingTaskId: number | null;
  pendingTaskTitle: string | null;
  selectTaskForTimer: (id: number, title: string) => void;
  clearPendingTask: () => void;

  // Signal Tasks page to refresh its list
  taskCompletedSignal: number;
  notifyTaskCompleted: () => void;

  statsLoaded: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

const isToday = (isoString: string): boolean => {
  const date = new Date(isoString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);
  const [todaySessionCount, setTodaySessionCount] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
  const [pendingTaskTitle, setPendingTaskTitle] = useState<string | null>(null);

  // Incrementing counter — Tasks.tsx watches this to know when to reload
  const [taskCompletedSignal, setTaskCompletedSignal] = useState(0);

  // Load today's stats once on mount (not on every navigation)
  const didLoad = useRef(false);
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    (async () => {
      try {
        const all = await getPomodoros();
        const todayDone = all.filter(
          (p) =>
            p.completed === true &&
            p.session_type === "work" &&
            p.completed_at &&
            isToday(p.completed_at)
        );
        const totalSecs = todayDone.reduce(
          (sum, p) => sum + (p.actual_duration ?? p.duration ?? 0),
          0
        );
        setTodayFocusSeconds(totalSecs);
        setTodaySessionCount(todayDone.length);
      } catch (err) {
        console.error("AppContext: failed to load today stats", err);
      } finally {
        setStatsLoaded(true);
      }
    })();
  }, []);

  const addFocusSession = (durationSeconds: number) => {
    setTodayFocusSeconds((prev) => prev + durationSeconds);
    setTodaySessionCount((prev) => prev + 1);
  };

  const selectTaskForTimer = (id: number, title: string) => {
    setPendingTaskId(id);
    setPendingTaskTitle(title);
  };

  const clearPendingTask = () => {
    setPendingTaskId(null);
    setPendingTaskTitle(null);
  };

  const notifyTaskCompleted = () => {
    setTaskCompletedSignal((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        todayFocusSeconds,
        todaySessionCount,
        addFocusSession,
        pendingTaskId,
        pendingTaskTitle,
        selectTaskForTimer,
        clearPendingTask,
        taskCompletedSignal,
        notifyTaskCompleted,
        statsLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}