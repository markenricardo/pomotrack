import React, { useState, useEffect } from "react";
import { User, Key, Timer, Sliders } from "lucide-react"; 
import SaveModal from "../components/SaveChangesModal"; 
import { getSettings, updateSettings, updatePassword } from "../api/settingsApi";
import type { UISettings } from "../api/settingsApi";
import "../styles/Settings.css";

function Settings() {
  // Profile Information State 
  const [fullName, setFullName] = useState("First Name Surname");
  const [email, setEmail] = useState("fnsn@gmail.com");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Timer and Preferences State 
  const [focusDuration, setFocusDuration] = useState("25");
  const [shortBreak, setShortBreak] = useState("5");
  const [longBreak, setLongBreak] = useState("15");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Global Page Fetch Status Indicators
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Global Modal Visibility Toggle
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch saved preferences on component initialization mount
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        setIsLoading(true);
        setApiError("");
        const data = await getSettings();
        
        setFullName(data.fullName || "First Name Surname");
        setEmail(data.email || "fnsn@gmail.com");
        setFocusDuration(String(data.focusDuration));
        setShortBreak(String(data.shortBreakDuration));
        setLongBreak(String(data.longBreakDuration));
        setTheme(data.theme === "dark" ? "dark" : "light");
        
        setNotificationsEnabled(data.soundEnabled); 
      } catch (err) {
        console.error("Error pulling configurations from server:", err);
        setApiError("Unable to retrieve user preferences from the server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedPreferences();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    try {
      const updatedData = await updateSettings({
        fullName: fullName,
        email: email,
        focusDuration: parseInt(focusDuration) || 25,
        shortBreakDuration: parseInt(shortBreak) || 5,
        longBreakDuration: parseInt(longBreak) || 15,
        longBreakInterval: 4,
        theme: theme,
        soundEnabled: notificationsEnabled,
      });

      setFullName(updatedData.fullName);
      setEmail(updatedData.email);

      window.dispatchEvent(
        new CustomEvent("profileUpdate", {
          detail: { fullName: updatedData.fullName, email: updatedData.email },
        })
      );

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error updating profile data details:", err);
      setApiError("Failed to save profile changes onto the server.");
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setApiError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password entry fields must be completely filled out.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("Your new password cannot be identical to your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Confirmation entry mismatch. The new and confirm passwords must match.");
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Error tracking configuration security updates workflow:", err);
      const serverMessage = err.response?.data?.detail || "Failed to update security parameters on the server.";
      setPasswordError(serverMessage);
    }
  };

  const handleSaveTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    try {
      const updatedData = await updateSettings({
        fullName: fullName,
        email: email,
        focusDuration: parseInt(focusDuration) || 25,
        shortBreakDuration: parseInt(shortBreak) || 5,
        longBreakDuration: parseInt(longBreak) || 15,
        longBreakInterval: 4,
        theme: theme,
        soundEnabled: notificationsEnabled,
      });

      window.dispatchEvent(
        new CustomEvent("timerUpdate", {
          detail: {
            focusDuration: updatedData.focusDuration,
            shortBreakDuration: updatedData.shortBreakDuration,
            longBreakDuration: updatedData.longBreakDuration,
          },
        })
      );

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error updating timer changes:", err);
      setApiError("Failed to save timer setting adjustments.");
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    
    try {
      // Pass the complete requirements object up to your updateSettings payload mapper
      await updateSettings({
        fullName: fullName,
        email: email,
        focusDuration: parseInt(focusDuration) || 25,
        shortBreakDuration: parseInt(shortBreak) || 5,
        longBreakDuration: parseInt(longBreak) || 15,
        longBreakInterval: 4,
        theme: theme,
        soundEnabled: notificationsEnabled, // Direct binding mapping to notification_enabled on backend
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error synchronizing preference alterations workflow:", err);
      setApiError("Failed to update notification configuration changes on the server.");
    }
  };

  if (isLoading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading system configuration profile...</div>;
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Update your account details and configure system preferences to suit your workflow.</p>
      </header>

      {apiError && (
        <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
          ⚠ {apiError}
        </div>
      )}

      <div className="settings-cards-row">
        {/* Profile Information Card */}
        <section className="profile-card-container">
          <form className="profile-form-wrapper" onSubmit={handleSaveProfile}>
            <div className="profile-form-body">
              <div className="profile-card-title-group">
                <div className="profile-icon-frame">
                  <User size={20} color="#FFFFFF" strokeWidth={2.5} />
                </div>
                <h2>Profile Information</h2>
              </div>

              <div className="input-field-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-box-wrapper">
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="settings-text-input"
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-box-wrapper">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="settings-text-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-save-changes">
              <span>Save Changes</span>
            </button>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="profile-card-container">
          <form className="password-form-wrapper" onSubmit={handleSavePassword}>
            <div className="password-form-body">
              <div className="profile-card-title-group">
                <div className="profile-icon-frame">
                  <Key size={18} color="#FFFFFF" strokeWidth={2.5} />
                </div>
                <h2>Change Password</h2>
              </div>

              {passwordError && (
                <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px", fontWeight: "500" }}>
                  ⚠ {passwordError}
                </div>
              )}

              <div className="input-field-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="input-box-wrapper">
                  <input
                    id="currentPassword"
                    type="password"
                    placeholder="**********"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="settings-text-input"
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-box-wrapper">
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="**********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="settings-text-input"
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-box-wrapper">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="**********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="settings-text-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-save-changes">
              <span>Save Changes</span>
            </button>
          </form>
        </section>
      </div>

      {/* Timer Settings Card */}
      <section className="timer-card-container">
        <form className="timer-form-wrapper" onSubmit={handleSaveTimer}>
          <div className="timer-form-body">
            <div className="profile-card-title-group">
              <div className="profile-icon-frame">
                <Timer size={18} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <h2>Timer Settings</h2>
            </div>

            <div className="timer-inputs-inline-row">
              <div className="input-field-group duration-input">
                <label htmlFor="focusDuration">Focus Duration</label>
                <div className="input-box-wrapper input-with-suffix">
                  <input
                    id="focusDuration"
                    type="text"
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(e.target.value)}
                    className="settings-text-input"
                  />
                  <span className="input-suffix">min</span>
                </div>
              </div>

              <div className="input-field-group duration-input">
                <label htmlFor="shortBreak">Short Break Duration</label>
                <div className="input-box-wrapper input-with-suffix">
                  <input
                    id="shortBreak"
                    type="text"
                    value={shortBreak}
                    onChange={(e) => setShortBreak(e.target.value)}
                    className="settings-text-input"
                  />
                  <span className="input-suffix">min</span>
                </div>
              </div>

              <div className="input-field-group duration-input">
                <label htmlFor="longBreak">Long Break Duration</label>
                <div className="input-box-wrapper input-with-suffix">
                  <input
                    id="longBreak"
                    type="text"
                    value={longBreak}
                    onChange={(e) => setLongBreak(e.target.value)}
                    className="settings-text-input"
                  />
                  <span className="input-suffix">min</span>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-save-changes">
            <span>Save Changes</span>
          </button>
        </form>
      </section>

      {/* Preferences Card */}
      <section className="preferences-card-container">
        <form className="preferences-form-wrapper" onSubmit={handleSavePreferences}>
          <div className="preferences-form-body">
            <div className="profile-card-title-group">
              <div className="profile-icon-frame">
                <Sliders size={18} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <h2>Preferences</h2>
            </div>

            <div className="preferences-controls-row">
              <div className="preference-control-block theme-selection-group">
                <label>Theme</label>
                <div className="theme-toggle-container">
                  <button
                    type="button"
                    className={`theme-option-btn option-light ${theme === "light" ? "active" : ""}`}
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={`theme-option-btn option-dark ${theme === "dark" ? "active" : ""}`}
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div className="preference-control-block notification-group">
                <label>Notification</label>
                <div 
                  className={`toggle-wrapper-row ${notificationsEnabled ? "checked" : ""}`}
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <span className="toggle-label-text">Enable Notification</span>
                  <div className="switch-track-frame">
                    <div className="switch-handle-thumb" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-save-changes">
            <span>Save Changes</span>
          </button>
        </form>
      </section>

      {/* Shared Global Modal Instance */}
      <SaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default Settings;