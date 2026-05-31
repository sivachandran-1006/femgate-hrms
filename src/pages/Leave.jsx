import axios from "axios";
import { useState, useEffect } from "react";

const Leave = ({ leaveRequests, userRole, setShowLeaveModal, fetchLeaves }) => {

  // ✅ FIXED: useState must be inside the component, not outside
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => { fetchLeaves(); }, []);

  const total    = leaveRequests.length;
  const approved = leaveRequests.filter((l) => l.status === "Approved").length;
  const pending  = leaveRequests.filter((l) => l.status === "Pending").length;
  const rejected = leaveRequests.filter((l) => l.status === "Rejected").length;

  const cards = [
    {
      label: "Total Requests", value: total, color: "#2563eb", bg: "#eff6ff",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="#2563eb" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Approved", value: approved, color: "#16a34a", bg: "#f0fdf4",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Pending", value: pending, color: "#f97316", bg: "#fff7ed",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="2"/>
          <polyline points="12 6 12 12 16 14" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Rejected", value: rejected, color: "#ef4444", bg: "#fff1f2",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  // ✅ FIXED: Combined both search and status filters
  const filteredLeaves = leaveRequests.filter((leave) => {
    const matchStatus = selectedStatus === "All Status" || leave.status === selectedStatus;
    const matchSearch = !searchTerm || leave.employee?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
  <>
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Leave Management
        </h1>
        {["Employee", "HR", "Admin", "Manager"].includes(userRole) && (
          <button
            onClick={() => setShowLeaveModal(true)}
            style={{
              background: "#2563eb", color: "#fff", border: "none",
              borderRadius: 10, padding: "10px 18px", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Apply Leave
          </button>
        )}
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 14, padding: "18px 16px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: c.bg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
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

{/* LEAVE BALANCE CARDS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 16,
    marginBottom: 20,
  }}
>
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    }}
  >
    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
      Annual Leave
    </p>
    <h2 style={{ margin: "8px 0 0", color: "#2563eb" }}>
      12 Days
    </h2>
  </div>

  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    }}
  >
    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
      Sick Leave
    </p>
    <h2 style={{ margin: "8px 0 0", color: "#16a34a" }}>
      6 Days
    </h2>
  </div>

  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    }}
  >
    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
      Casual Leave
    </p>
    <h2 style={{ margin: "8px 0 0", color: "#f97316" }}>
      8 Days
    </h2>
  </div>

  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    }}
  >
    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
      Loss Of Pay
    </p>
    <h2 style={{ margin: "8px 0 0", color: "#ef4444" }}>
      0 Days
    </h2>
  </div>
</div>

{/* SEARCH + FILTER ROW */}

      {/* SEARCH + FILTER ROW */}
      {/* ✅ FIXED: Was two broken/duplicate <select> tags merged into one valid block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12 }}>
        <input
          type="text"
          placeholder="Search employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, maxWidth: 280, height: 44,
            border: "1px solid #e2e8f0", borderRadius: 10,
            padding: "0 16px", fontSize: 14, outline: "none",
          }}
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            height: 44, border: "1px solid #e2e8f0", borderRadius: 10,
            padding: "0 14px", fontSize: 14, background: "#fff",
            cursor: "pointer", outline: "none",
          }}
        >
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* TABLE CARD */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Leave Requests
          </h2>
          <span style={{ fontSize: 13, color: "#64748b" }}>{filteredLeaves.length} requests</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              {["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Action"].map((h) => (
                <th key={h} style={{
                  textAlign: "left", paddingBottom: 10,
                  fontSize: 13, fontWeight: 600, color: "#475569",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ✅ FIXED: Was mixing {filteredLeaves.map with const inside — invalid JSX */}
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
                  No {selectedStatus.toLowerCase()} requests found
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => {
                const ok = leave.status !== "Approved" && leave.status !== "Rejected";
                return (
                  <tr key={leave._id} style={{ borderBottom: "1px solid #f1f5f9" }}>

                    {/* EMPLOYEE */}
                    <td style={{ padding: "13px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: "#dbeafe", color: "#2563eb",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {leave.employee?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
                            {leave.employee}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>Employee</div>
                        </div>
                      </div>
                    </td>

                    {/* LEAVE TYPE */}
                    <td style={{ padding: "13px 0" }}>
                      <span style={{
                        display: "inline-block", background: "#eff6ff", color: "#2563eb",
                        padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      }}>
                        {leave.leaveType || "—"}
                      </span>
                    </td>

                    {/* FROM / TO / DAYS */}
                    <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.fromDate || "—"}</td>
                    <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.toDate || "—"}</td>
                    <td style={{ padding: "13px 0", fontSize: 14, color: "#334155" }}>{leave.days || "—"}</td>
                    {/* REASON */}
<td
  style={{
    padding: "13px 0",
    fontSize: 14,
    color: "#334155",
    maxWidth: 200,
  }}
>
  {leave.reason || "-"}
</td>

                    {/* STATUS BADGE */}
                    <td style={{ padding: "13px 0" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 12px", borderRadius: 999,
                        fontSize: 12, fontWeight: 600,
                        background:
                          leave.status === "Approved" ? "#dcfce7" :
                          leave.status === "Rejected" ? "#fee2e2" : "#fef9c3",
                        color:
                          leave.status === "Approved" ? "#15803d" :
                          leave.status === "Rejected" ? "#b91c1c" : "#a16207",
                      }}>
                        {leave.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: "13px 0" }}>
  <div style={{ display: "flex", gap: 6 }}>

    <button
      onClick={() => setSelectedLeave(leave)}
      style={{
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      View
    </button>

    <button
  onClick={() => {
    alert("Leave Approved");
  }}
  style={{
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  ✓ Approve
</button>

<button
  onClick={() => {
    alert("Leave Rejected");
  }}
  style={{
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  ✕ Reject
</button>

  </div>
</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Showing 1 to {filteredLeaves.length} of {filteredLeaves.length} entries
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {["‹", "1", "›"].map((btn, i) => (
              <button key={i} style={{
                width: 32, height: 32, borderRadius: 8,
                border: i === 1 ? "none" : "1px solid #e2e8f0",
                background: i === 1 ? "#2563eb" : "#fff",
                color: i === 1 ? "#fff" : "#64748b",
                fontWeight: i === 1 ? 700 : 400,
                fontSize: i === 1 ? 14 : 16,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {btn}
              </button>
            ))}
          </div>
        </div>

      </div>
      {/* LEAVE CALENDAR */}
<div
  style={{
    background: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    marginTop: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
  }}
>
  <h2
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: "#0f172a",
      marginBottom: 16,
    }}
  >
    Leave Calendar
  </h2>

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
    }}
  >
    <thead>
      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
        <th style={{ textAlign: "left", padding: "10px 0" }}>Date</th>
        <th style={{ textAlign: "left", padding: "10px 0" }}>Employee</th>
        <th style={{ textAlign: "left", padding: "10px 0" }}>Leave Type</th>
      </tr>
    </thead>

    <tbody>
      {leaveRequests.map((leave) => (
        <tr
          key={leave._id}
          style={{
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <td style={{ padding: "10px 0" }}>
            {leave.fromDate}
          </td>

          <td style={{ padding: "10px 0" }}>
            {leave.employee}
          </td>

          <td style={{ padding: "10px 0" }}>
            {leave.leaveType}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
    {selectedLeave && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 30,
        width: 500,
        maxWidth: "90%",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        Leave Details
      </h2>

      <p><strong>Employee:</strong> {selectedLeave.employee}</p>

      <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>

      <p><strong>From:</strong> {selectedLeave.fromDate}</p>

      <p><strong>To:</strong> {selectedLeave.toDate}</p>

      <p><strong>Days:</strong> {selectedLeave.days}</p>

      <p><strong>Reason:</strong> {selectedLeave.reason}</p>

      <p><strong>Status:</strong> {selectedLeave.status}</p>

      <button
        onClick={() => setSelectedLeave(null)}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          cursor: "pointer",
          marginTop: 10,
        }}
      >
        Close
      </button>
    </div>
  </div>
  
)}
</>

);
};

export default Leave;
