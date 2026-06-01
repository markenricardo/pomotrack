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
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
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
    </AppProvider>
  );
}

export default App;