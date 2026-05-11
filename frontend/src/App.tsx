import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Timer from "./pages/Timer";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Layout from "./components/Layout";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/login" element={<Login />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;