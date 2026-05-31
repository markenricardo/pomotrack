import api from "./axios";

export interface AnalyticsOverview {
  total_pomodoros: number;
  focus_time_hours: number;
  tasks_completed: number;
  current_streak: number;
}

export interface WeeklyData {
  day: string;
  pomodoros: number;
  focus_hours: number;
}

export const analyticsApi = {
  getOverview: async (timePeriod: "week" | "month" | "all_time" = "week"): Promise<AnalyticsOverview> => {
    const response = await api.get(`/api/v1/analytics/overview`, {
      params: { time_period: timePeriod },
    });
    return response.data;
  },

  getWeeklyData: async (): Promise<WeeklyData[]> => {
    const response = await api.get(`/api/v1/analytics/weekly`);
    return response.data;
  },
};

export default analyticsApi;
