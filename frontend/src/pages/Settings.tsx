import React, { useState } from "react";
import { User, Key, Timer, Sliders } from "lucide-react"; 
import SaveModal from "../components/SaveChangesModal"; 
import "../styles/Settings.css";

function Settings() {
  // Profile Information State
  const [fullName, setFullName] = useState("First Name Surname");
  const [email, setEmail] = useState("fnsn@gmail.com");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Timer Settings State
  const [focusDuration, setFocusDuration] = useState("25");
  const [shortBreak, setShortBreak] = useState("5");
  const [longBreak, setLongBreak] = useState("15");

  // Preferences State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Global Modal Visibility Toggle
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving profile changes...", { fullName, email });
    setIsModalOpen(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating password...", { currentPassword, newPassword, confirmPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsModalOpen(true);
  };

  const handleSaveTimer = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving timer settings...", { focusDuration, shortBreak, longBreak });
    setIsModalOpen(true);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving preferences...", { theme, notificationsEnabled });
    setIsModalOpen(true);
  };

  return (
    <div className="settings-page">
      {/* Settings Header Layout */}
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Update your account details and configure system preferences to suit your workflow.</p>
      </header>

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