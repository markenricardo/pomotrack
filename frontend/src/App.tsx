import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Timer from "./pages/Timer";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

function DashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f2ea]">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-[#2f2a26]">Dashboard</h1>
        <p className="text-gray-500 mt-2">Login successful.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/timer"
          element={
            <Layout>
              <Timer />
            </Layout>
          }
        />

        <Route
          path="/tasks"
          element={
            <Layout>
              <Tasks />
            </Layout>
          }
        />

        <Route
          path="/history"
          element={
            <Layout>
              <History />
            </Layout>
          }
        />

        <Route
          path="/analytics"
          element={
            <Layout>
              <Analytics />
            </Layout>
          }
        />

        <Route
          path="/achievements"
          element={
            <Layout>
              <Achievements />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;