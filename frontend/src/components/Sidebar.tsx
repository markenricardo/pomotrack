import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Timer,
  ListTodo,
  History,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import LogoutModal from "./LogoutModal";
import "./Sidebar.css";

// --- SUB-COMPONENT: ProfileDropdown ---
interface ProfileDropdownProps {
  onLogoutClick: () => void;
}

const ProfileDropdown = ({ onLogoutClick }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-section-container" ref={dropdownRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="profile-dropdown-menu">
          <div 
            className="profile-dropdown-option"
            onClick={() => {
              setIsOpen(false);
              navigate("/settings");
            }}
          >
            <Settings size={20} />
            <span>Settings</span>
          </div>
          <div 
            className="profile-dropdown-option"
            onClick={() => {
              setIsOpen(false);
              onLogoutClick();
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div
        className={`profile-account-card ${isOpen ? "is-clicked" : "default"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="profile-avatar"></div>
        <div className="profile-info">
          <span className="profile-name">First Name Surname</span>
          <span className="profile-email">fnsn@gmail.com</span>
        </div>
        <div className={`profile-chevron ${isOpen ? "rotated" : ""}`}>
          <ChevronDown size={20} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

// --- MAIN SIDEBAR COMPONENT ---
function Sidebar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const mainNav = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Timer", path: "/timer", icon: Timer },
    { name: "Tasks", path: "/tasks", icon: ListTodo },
    { name: "Session History", path: "/history", icon: History },
  ];

  const productivityNav = [
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Achievements", path: "/achievements", icon: Trophy },
  ];

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    navigate("/login"); 
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top-wrapper">
        {/* Header Section */}
        <header className="sidebar-header">
          <div className="title-group centered">
            <h2 className="brand-name">PomoTrack</h2>
            <p className="slogan">Focus. Track. Improve.</p> 
          </div>
        </header>

        {/* MAIN Group */}
        <div className="sidebar-main-nav">
          <p className="section-label">MAIN</p>
          <nav className="nav-group">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "nav-item active" : "nav-item"
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* PRODUCTIVITY Group */}
        <div className="sidebar-productivity-nav">
          <p className="section-label">PRODUCTIVITY</p>
          <nav className="nav-group">
            {productivityNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "nav-item active" : "nav-item"
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Weekly Streak Display */}
        <div className="sidebar-streak-display">
          <p className="streak-title">Weekly Streak</p>
          <div className="streak-progress-container">
            <div className="streak-icon">
              <svg width="25" height="30" viewBox="0 0 25 35" fill="none">
                <path d="M12.5 0C12.5 0 25 10 25 20C25 28.2843 19.4036 35 12.5 35C5.59644 35 0 28.2843 0 20C0 10 12.5 0 12.5 0Z" fill="#FF383C"/>
                <path d="M12.5 7C12.5 7 18 15 18 22C18 25 15.5 28 12.5 28C9.5 28 7 25 7 22C7 15 12.5 7 12.5 7Z" fill="#FF8D28" opacity="0.8"/>
              </svg>
            </div>
            <div className="streak-bar"></div>
          </div>
          <p className="streak-subtitle">5/5 days completed</p>
        </div>
      </div>
      
      <ProfileDropdown onLogoutClick={() => setShowLogoutModal(true)} />

      {showLogoutModal && (
        <LogoutModal 
          onClose={() => setShowLogoutModal(false)} 
          onConfirm={handleLogoutConfirm} 
        />
      )}
    </aside>
  );
}

export default Sidebar;