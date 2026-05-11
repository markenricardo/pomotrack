import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-white border-r border-slate-200 p-6">
      <h1 className="text-2xl font-bold text-red-600">PomoTrack </h1>

      <p className="text-sm text-slate-500 mt-1">
        Focus. Track. Improve.
      </p>

      <nav className="mt-8 flex flex-col gap-3">
        <Link to="/dashboard" className="hover:text-red-600">
          Dashboard
        </Link>

        <Link to="/timer" className="hover:text-red-600">
          Timer
        </Link>

        <Link to="/tasks" className="hover:text-red-600">
          Tasks
        </Link>

        <Link to="/analytics" className="hover:text-red-600">
          Analytics
        </Link>

        <Link to="/achievements" className="hover:text-red-600">
          Achievements
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;