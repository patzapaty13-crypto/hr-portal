// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { API_BASE } from "../config";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
              

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }

      const data = await res.json();
      auth.login(data.user, data.token);
      navigate("/approvals");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>เข้าสู่ระบบ HR Portal</h1>
        <p>กรุณาเข้าสู่ระบบเพื่อใช้งานระบบสรรหาบุคลากร</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            อีเมล
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="เช่น hr@example.com"
              required
            />
          </label>

          <label>
            รหัสผ่าน
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              required
            />
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 14 }}>
          <p>บัญชีทดสอบ:</p>
          <ul>
            <li>HR: hr@example.com / hr123</li>
            <li>Head: head@example.com / head123</li>
            <li>Rector: rector@example.com / rector123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
