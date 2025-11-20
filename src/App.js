// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Approvals from "./pages/Approvals";

function Dashboard() {
  return <h1>HR Dashboard (ตัวอย่าง placeholder)</h1>;
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>กำลังตรวจสอบการเข้าสู่ระบบ...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { user, logout } = useAuth();   // ✅ ตอนนี้ useAuth จะไม่ null แล้วเพราะถูกครอบจาก index.js

  return (
    <Router>
      <div className="app-layout">
        {user && (
          <aside className="sidebar">
            <h2 className="logo">HR Portal</h2>
            <nav className="nav">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/approvals"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Approvals
              </NavLink>
            </nav>

            <div style={{ marginTop: "auto", fontSize: 14 }}>
              <p style={{ marginBottom: 8 }}>เข้าสู่ระบบเป็น: {user.name}</p>
              <button className="btn-danger" onClick={logout}>
                ออกจากระบบ
              </button>
            </div>
          </aside>
        )}

        <main className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/approvals"
              element={
                <RequireAuth>
                  <Approvals />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
