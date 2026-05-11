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
    <aside className="min-h-screen w-64 bg-white border-r border-slate-200 px-5 py-6 flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-red-600">PomoTrack</h1>
        <p className="text-sm text-slate-500 mt-1">Focus. Track. Improve.</p>
      </div>

      <nav className="mt-8 flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Main
          </p>

          <div className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-red-600"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Productivity
          </p>

          <div className="flex flex-col gap-1">
            {productivityNav.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-red-600"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-red-50 text-red-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-red-600"
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;