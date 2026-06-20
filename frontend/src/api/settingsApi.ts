import api from "./axios";

export interface BackendUserSettings {
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  pomodoros_until_long_break: number;
  theme: string;
  notification_enabled: boolean;
  full_name: string;
  email: string;
  user_id?: number;
  updated_at?: string;
}

export interface UISettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  theme: string;
  soundEnabled: boolean;
  fullName: string;
  email: string;
}

export const getSettings = async (): Promise<UISettings> => {
  const response = await api.get<BackendUserSettings>("/api/v1/settings");
  const data = response.data;

  return {
    focusDuration: Math.round(data.pomodoro_duration / 60),
    shortBreakDuration: Math.round(data.short_break_duration / 60),
    longBreakDuration: Math.round(data.long_break_duration / 60),
    longBreakInterval: data.pomodoros_until_long_break,
    theme: data.theme,
    soundEnabled: data.notification_enabled,
    fullName: data.full_name,
    email: data.email,
  };
};

export const updateSettings = async (updates: Partial<UISettings>): Promise<UISettings> => {
  const backendPayload: Partial<BackendUserSettings> = {};
  
  if (updates.focusDuration !== undefined) backendPayload.pomodoro_duration = updates.focusDuration * 60;
  if (updates.shortBreakDuration !== undefined) backendPayload.short_break_duration = updates.shortBreakDuration * 60;
  if (updates.longBreakDuration !== undefined) backendPayload.long_break_duration = updates.longBreakDuration * 60;
  if (updates.longBreakInterval !== undefined) backendPayload.pomodoros_until_long_break = updates.longBreakInterval;
  if (updates.theme !== undefined) backendPayload.theme = updates.theme;
  if (updates.soundEnabled !== undefined) backendPayload.notification_enabled = updates.soundEnabled;
  if (updates.fullName !== undefined) backendPayload.full_name = updates.fullName;
  if (updates.email !== undefined) backendPayload.email = updates.email;

  const response = await api.patch<BackendUserSettings>("/api/v1/settings", backendPayload);
  const data = response.data;
  
  return {
    focusDuration: Math.round(data.pomodoro_duration / 60),
    shortBreakDuration: Math.round(data.short_break_duration / 60),
    longBreakDuration: Math.round(data.long_break_duration / 60),
    longBreakInterval: data.pomodoros_until_long_break,
    theme: data.theme,
    soundEnabled: data.notification_enabled,
    fullName: data.full_name,
    email: data.email,
  };
};

/**
 * Dispatches raw strings directly to security verification endpoints
 */
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.put("/api/v1/settings/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
};