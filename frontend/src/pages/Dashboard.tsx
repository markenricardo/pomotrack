import {
  Edit2,
  Trash2,
  Clock3,
  CheckCircle2,
  Flame,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  const userData = {
    name: "User",
    todayFocusTime: "2h 15m",
    completedSessions: 4,
    currentStreak: 5,
    pendingTasks: [
      {
        id: 1,
        title: "Software Design Documentation",
        status: "In Progress",
        priority: "High",
        pomodoros: 7,
        deadline: "May 16, 2026",
      },
      {
        id: 2,
        title: "Database Architecture Setup",
        status: "Pending",
        priority: "Medium",
        pomodoros: 4,
        deadline: "May 18, 2026",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 lg:p-10 font-sans text-black">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[32px] font-bold text-[#003366] leading-tight">
              Welcome back, {userData.name}
            </h1>
            <p className="mt-2 text-[14px] font-medium text-[#708090] max-w-xl">
              Overview of your focus sessions, tasks, streaks, and productivity.
            </p>
          </div>
          <button className="group text-[#008080] hover:text-[#006666] transition-colors flex items-center gap-2 text-[14px] font-bold">
            View Analytics
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* STATS ROW - Removed the massive height, stacked neatly horizontally */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Focus Time */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080] shrink-0">
              <Clock3 size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#708090] mb-1">Today's Focus Time</p>
              <h2 className="text-[32px] font-bold text-[#008080] leading-none">{userData.todayFocusTime}</h2>
            </div>
          </div>

          {/* Sessions Done */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-[#003366]/10 flex items-center justify-center text-[#003366] shrink-0">
              <CheckCircle2 size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#708090] mb-1">Completed Sessions</p>
              <h2 className="text-[32px] font-bold text-[#003366] leading-none">{userData.completedSessions}</h2>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-[#FFE4E1] flex items-center justify-center text-[#ef4444] shrink-0">
              <Flame size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#708090] mb-1">Current Streak</p>
              <h2 className="text-[32px] font-bold text-[#ef4444] leading-none">
                {userData.currentStreak} <span className="text-[18px] text-[#708090] font-semibold">Days</span>
              </h2>
            </div>
          </div>
        </div>

        {/* TASK SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-semibold text-black">Pending Tasks</h2>
            <button className="text-[14px] font-medium text-[#708090] hover:text-[#003366] transition-colors underline decoration-transparent hover:decoration-[#003366] underline-offset-4">
              View All Tasks
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userData.pendingTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                
                <div>
                  {/* Task Header & Status Badge */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h3 className="text-[18px] font-semibold text-black leading-snug w-3/4">
                      {task.title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
                      task.status === "In Progress"
                        ? "border-[#eab308] text-[#eab308] bg-[#fefce8]" 
                        : "border-[#708090] text-[#708090] bg-gray-50"   
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Task Metadata - Removed the w-48 so items sit naturally next to each other */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#708090]">Priority:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        task.priority === "High" 
                          ? "border-[#ef4444] text-[#ef4444] bg-[#fef2f2]" 
                          : "border-[#eab308] text-[#eab308] bg-[#fefce8]"
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#708090]">Estimated Pomodoros:</span>
                      <span className="text-[14px] font-bold text-black">{task.pomodoros}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#708090]">Deadline:</span>
                      <span className="text-[14px] font-bold text-black">{task.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto">
                  <button className="flex-1 bg-[#008080] hover:bg-[#006666] text-white text-[14px] py-2 rounded-md font-medium transition-colors">
                    Start Timer
                  </button>
                  <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
                    <Edit2 size={18} className="text-[#708090]" />
                  </button>
                  <button className="p-2 bg-[#FFE4E1] hover:bg-red-200 rounded-md transition-colors">
                    <Trash2 size={18} className="text-[#ef4444]" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;