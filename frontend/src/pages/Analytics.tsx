import { useState, useEffect } from "react";
import type { AnalyticsOverview, WeeklyData } from "../api/analyticsApi";
import analyticsApi from "../api/analyticsApi";

type TimePeriod = "week" | "month" | "all_time";

interface StatCard {
  label: string;
  value: string;
  unit?: string;
  change?: string;
}

function Analytics() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewData, weekData] = await Promise.all([
          analyticsApi.getOverview(timePeriod),
          analyticsApi.getWeeklyData(),
        ]);
        setAnalytics(overviewData);
        setWeeklyData(weekData);
        setError("");
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timePeriod]);

  const currentStats: StatCard[] = analytics ? [
    { label: "Total Pomodoros", value: String(analytics.total_pomodoros), unit: "sessions" },
    { label: "Focus Time", value: String(analytics.focus_time_hours), unit: "hours" },
    { label: "Tasks Completed", value: String(analytics.tasks_completed), unit: "tasks" },
    { label: "Current Streak", value: String(analytics.current_streak), unit: "days", change: "🔥" },
  ] : [];

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--color-bg)", minHeight: "100vh", fontFamily: "var(--font-main)" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: "var(--weight-extrabold)",
            color: "var(--color-text)",
            margin: "0 0 0.5rem 0",
          }}
        >
          Analytics
        </h1>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          Track your productivity, focus patterns, and task completion insights.
        </p>
      </div>

      {/* Time Period Selector */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          backgroundColor: "var(--color-surface)",
          padding: "1rem",
          borderRadius: "0.75rem",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        {(["week", "month", "all_time"] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: "var(--weight-bold)",
              cursor: "pointer",
              backgroundColor: timePeriod === period ? "var(--color-primary)" : "var(--color-bg-soft)",
              color: timePeriod === period ? "var(--color-text-white)" : "var(--color-text-muted)",
              transition: "all 0.3s",
            }}
          >
            {period === "all_time" ? "All Time" : period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading analytics...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "var(--color-danger-light)",
            color: "var(--color-danger)",
            padding: "1rem",
            borderRadius: "0.75rem",
            marginBottom: "2rem",
            border: "1px solid var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}

      {!loading && analytics && (
        <div>
          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {currentStats.map((stat, index) => {
              const textColors = [
                "var(--color-primary)",
                "var(--color-success)",
                "var(--color-warning)",
                "var(--color-danger)",
              ];
              const textColor = textColors[index % textColors.length];

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    boxShadow: "var(--shadow-lg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 0.5rem 0" }}>
                    {stat.label}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "2rem", fontWeight: "var(--weight-extrabold)", color: textColor, margin: 0 }}>
                      {stat.value}
                    </h3>
                    {stat.unit && (
                      <span style={{ fontSize: "0.875rem", color: "var(--color-text-light)" }}>{stat.unit}</span>
                    )}
                  </div>
                  {stat.change && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: stat.change.includes("+") ? "var(--color-success)" : "var(--color-text-muted)",
                        margin: "0.5rem 0 0 0",
                      }}
                    >
                      {stat.change}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

      {/* Weekly Breakdown */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--color-border)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)", margin: "0 0 1.5rem 0" }}>
          Weekly Breakdown
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "1rem",
          }}
        >
          {weeklyData.length > 0 ? (
            weeklyData.map((day, index) => {
              const maxPom = Math.max(...weeklyData.map((d) => d.pomodoros), 1);
              const barColors = [
                "var(--color-primary-light)",
                "var(--color-success-light)",
                "var(--color-warning-light)",
                "var(--color-info-light)",
                "var(--color-secondary-light)",
                "var(--color-danger-light)",
                "var(--color-primary-light)",
              ];
              const barColor = barColors[index % barColors.length];
              const darkBarColors = [
                "var(--color-primary)",
                "var(--color-success)",
                "var(--color-warning)",
                "var(--color-info)",
                "var(--color-secondary)",
                "var(--color-danger)",
                "var(--color-primary)",
              ];
              const darkBarColor = darkBarColors[index % darkBarColors.length];

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${(day.pomodoros / maxPom) * 150}px`,
                      backgroundColor: barColor,
                      borderRadius: "0.5rem",
                      transition: "background-color 0.3s",
                      cursor: "pointer",
                      minHeight: "20px",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor = darkBarColor)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor = barColor)
                    }
                  />
                  <p style={{ fontSize: "0.875rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)", margin: 0 }}>
                    {day.day}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)", margin: 0 }}>
                    {day.pomodoros}
                  </p>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--color-text-muted)" }}>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Productivity Insights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Most Productive Time */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ fontSize: "1.125rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)", margin: "0 0 1rem 0" }}>
            Most Productive Time
          </h3>
          <div
            style={{
              backgroundColor: "var(--color-success-light)",
              padding: "1rem",
              borderRadius: "0.5rem",
              borderLeft: "4px solid var(--color-success)",
            }}
          >
            <p style={{ fontSize: "1.5rem", fontWeight: "var(--weight-bold)", color: "var(--color-success)", margin: 0 }}>
              9:00 AM - 12:00 PM
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0.5rem 0 0 0" }}>
              Your peak focus time based on Pomodoro sessions
            </p>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ fontSize: "1.125rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)", margin: "0 0 1rem 0" }}>
            Task Completion Rate
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "conic-gradient(var(--color-info) 0deg 264deg, var(--color-border) 264deg 360deg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "1.5rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)" }}>73%</span>
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 0.5rem 0" }}>
                Tasks completed on time
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)", margin: 0 }}>
                73 of 100 tasks
              </p>
            </div>
          </div>
        </div>

        {/* Focus Consistency */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ fontSize: "1.125rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)", margin: "0 0 1rem 0" }}>
            Focus Consistency
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Weekdays", value: 89, color: "var(--color-primary-light)", textColor: "var(--color-primary)" },
              { label: "Weekends", value: 45, color: "var(--color-warning-light)", textColor: "var(--color-warning)" },
              { label: "Evenings", value: 62, color: "var(--color-info-light)", textColor: "var(--color-info)" },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: "var(--weight-bold)", color: "var(--color-text)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: "var(--weight-bold)", color: item.textColor }}>
                    {item.value}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "var(--color-border)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: "100%",
                      backgroundColor: item.color,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;