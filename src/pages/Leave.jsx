import axios from "axios";
import { useEffect } from "react";

const Leave = ({ leaveRequests, userRole, setShowLeaveModal, fetchLeaves }) => {
  useEffect(() => { fetchLeaves(); }, []);

  const total    = leaveRequests.length;
  const approved = leaveRequests.filter((l) => l.status === "Approved").length;
  const pending  = leaveRequests.filter((l) => l.status === "Pending").length;
  const rejected = leaveRequests.filter((l) => l.status === "Rejected").length;

  const cards = [
    { label: "Total Requests", value: total,    color: "#2563eb", bg: "#eff6ff",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="#2563eb" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: "Approved",       value: approved, color: "#16a34a", bg: "#f0fdf4",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: "Pending",        value: pending,  color: "#f97316", bg: "#fff7ed",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: "Rejected",       value: rejected, color: "#ef4444", bg: "#fff1f2",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg> },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>Leave Management</h1>
        {["Employee","HR","Admin","Manager"].includes(userRole) && (
          <button onClick={() => setShowLeaveModal(true)} style={{
            background: "#2563eb", color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 18px", fontSize: 14,
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Apply Leave
          </button>
        )}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 14, padding: "18px 16px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 500 }}>{c.label}</p>
              <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>This Month</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Leave List</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              {["Employee","Leave Type","From","To","Days","Status","Action"].map(h => (
                <th key={h} style={{ textAlign: "left", paddingBottom: 10, fontSize: 13, fontWeight: 600, color: "#475569" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave) => {
              const ok = leave.status !== "Approved" && leave.status !== "Rejected";
              return (
                <tr key={leave._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "13px 0", fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{leave.employee}</td>
                  <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.leaveType}</td>
                  <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.fromDate || "—"}</td>
                  <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.toDate || "—"}</td>
                  <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.days || "—"}</td>
                  <td style={{ padding: "13px 0" }}>
                    <span style={{
                      display: "inline-block", padding: "4px 12px", borderRadius: 999,
                      fontSize: 12, fontWeight: 600,
                      background: leave.status === "Approved" ? "#dcfce7" : leave.status === "Rejected" ? "#fee2e2" : "#fef9c3",
                      color:      leave.status === "Approved" ? "#15803d" : leave.status === "Rejected" ? "#b91c1c" : "#a16207",
                    }}>{leave.status}</span>
                  </td>
                  <td style={{ padding: "13px 0" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button disabled={!ok} onClick={async () => { await axios.put(`http://localhost:5000/leave-status/${leave._id}`, { status: "Approved" }); fetchLeaves(); }} style={{ background: ok ? "#16a34a" : "#94a3b8", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: ok ? "pointer" : "not-allowed" }}>Approve</button>
                      <button disabled={!ok} onClick={async () => { await axios.put(`http://localhost:5000/leave-status/${leave._id}`, { status: "Rejected" }); fetchLeaves(); }} style={{ background: ok ? "#ef4444" : "#94a3b8", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: ok ? "pointer" : "not-allowed" }}>Reject</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Showing 1 to {total} of {total} entries</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["‹","1","›"].map((btn,i) => (
              <button key={i} style={{
                width: 32, height: 32, borderRadius: 8,
                border: i===1 ? "none" : "1px solid #e2e8f0",
                background: i===1 ? "#2563eb" : "#fff",
                color: i===1 ? "#fff" : "#64748b",
                fontWeight: i===1 ? 700 : 400,
                fontSize: i===1 ? 14 : 16,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>{btn}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leave;
