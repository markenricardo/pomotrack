import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Timer,
  ListTodo,
  History,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

function Sidebar() {
  const mainNav = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Timer",
      path: "/timer",
      icon: Timer,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: ListTodo,
    },
    {
      name: "Session History",
      path: "/history",
      icon: History,
    },
  ];

  const productivityNav = [
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Achievements",
      path: "/achievements",
      icon: Trophy,
    },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="logo-box">P</div>

          <div>
            <h2>PomoTrack</h2>
            <p>Focus. Track. Improve.</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {mainNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="sidebar-section">
            <p className="sidebar-section-title">Productivity</p>

            {productivityNav.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;