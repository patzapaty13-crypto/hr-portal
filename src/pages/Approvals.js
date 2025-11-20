// src/pages/Approvals.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { API_BASE } from "../config";

function Approvals() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    positionTitle: "",
    department: "",
  });

  useEffect(() => {
    async function fetchRequests() {
      try {
        setError("");
        setLoading(true);
       
        const res = await fetch(`${API_BASE}/api/headcount-requests`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "โหลดคำขออัตราไม่สำเร็จ");
        }

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchRequests();
  }, [token]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    if (!form.positionTitle.trim() || !form.department.trim()) {
      alert("กรุณากรอกชื่อตำแหน่งและหน่วยงานให้ครบ");
      return;
    }

    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/headcount-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          positionTitle: form.positionTitle.trim(),
          department: form.department.trim(),
        }),
      });
      

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "ไม่สามารถสร้างคำขอใหม่ได้");
      }

      const newRequest = await res.json();
      setRequests((prev) => [...prev, newRequest]);
      setForm({ positionTitle: "", department: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdvance = async (id) => {
    try {
      setError("");
      const res = await fetch(
        `${API_BASE}/api/headcount-requests/${id}/advance`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "ไม่สามารถเปลี่ยนขั้นตอนได้");
      }

      const updated = await res.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  function getStatusLabel(req) {
    switch (req.status) {
      case "HR_REVIEW":
        return "รอ HR ตรวจสอบ";
      case "HEAD_REVIEW":
        return "รอหัวหน้าหน่วยงานอนุมัติ";
      case "RECTOR_REVIEW":
        return "รอผู้บริหารอนุมัติ";
      case "APPROVED":
        return "อนุมัติเรียบร้อย";
      default:
        return req.status;
    }
  }

  function canAdvance(req) {
    if (req.status === "APPROVED") return false;
    if (user.role === "HR" && req.currentStep === "HR") return true;
    if (user.role === "HEAD" && req.currentStep === "HEAD") return true;
    if (user.role === "RECTOR" && req.currentStep === "RECTOR") return true;
    return false;
  }

  return (
    <div>
      <h1>Headcount Requests (คำขออัตรา)</h1>
      <p>ขั้นตอน: HR → หัวหน้าหน่วยงาน → ผู้บริหาร</p>

      {error && <div className="error-box">{error}</div>}
      {loading && <div>กำลังโหลดรายการคำขอ...</div>}

      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อตำแหน่ง</th>
              <th>หน่วยงาน</th>
              <th>ขั้นตอนปัจจุบัน</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.positionTitle}</td>
                <td>{req.department}</td>
                <td>{req.currentStep}</td>
                <td>{getStatusLabel(req)}</td>
                <td>
                  {canAdvance(req) ? (
                    <button
                      className="btn-primary small"
                      onClick={() => handleAdvance(req.id)}
                    >
                      อนุมัติและส่งต่อ
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      ไม่มีสิทธิ์ในขั้นนี้
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  ยังไม่มีคำขออัตรา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {(user.role === "HR" || user.role === "HEAD") && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>สร้างคำขออัตราใหม่</h3>
          <form className="form-grid" onSubmit={handleCreateRequest}>
            <input
              type="text"
              name="positionTitle"
              placeholder="ชื่อตำแหน่ง"
              value={form.positionTitle}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="department"
              placeholder="หน่วยงาน/คณะ"
              value={form.department}
              onChange={handleFormChange}
            />
            <button type="submit" className="btn-primary">
              บันทึกคำขอ
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Approvals;
