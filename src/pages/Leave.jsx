import { useState } from "react";

const Leave = ({
  leaveRequests = [],
  userRole,
  setShowLeaveModal,
  fetchLeaves,
  darkMode = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);

  // ── Color tokens ──────────────────────────────────────────────
  const theme = darkMode
    ? {
        pageBg: "#0f172a",
        cardBg: "#1e293b",
        text: "#f1f5f9",
        subtext: "#94a3b8",
        muted: "#64748b",
        border: "#334155",
        inputBg: "#0f172a",
        inputBorder: "#334155",
        tableRowHover: "#1e293b",
        tableHeaderBg: "#172033",
      }
    : {
        pageBg: "#f1f5f9",
        cardBg: "#ffffff",
        text: "#0f172a",
        subtext: "#64748b",
        muted: "#94a3b8",
        border: "#e2e8f0",
        inputBg: "#ffffff",
        inputBorder: "#e2e8f0",
        tableRowHover: "#f8fafc",
        tableHeaderBg: "#f8fafc",
      };

  // ── Status badge helper ───────────────────────────────────────
  const badgeStyle = (status) => {
    if (status === "Approved")
      return darkMode
        ? { background: "#14532d33", color: "#4ade80" }
        : { background: "#dcfce7", color: "#15803d" };
    if (status === "Rejected")
      return darkMode
        ? { background: "#450a0a55", color: "#f87171" }
        : { background: "#fee2e2", color: "#b91c1c" };
    // Pending
    return darkMode
      ? { background: "#71350044", color: "#fbbf24" }
      : { background: "#fef9c3", color: "#a16207" };
  };

  // ── KPI counts ───────────────────────────────────────────────
  const total    = leaveRequests.length;
  const approved = leaveRequests.filter((l) => l.status === "Approved").length;
  const pending  = leaveRequests.filter((l) => l.status === "Pending").length;
  const rejected = leaveRequests.filter((l) => l.status === "Rejected").length;

  const kpiCards = [
    {
      label: "Total Requests",
      value: total,
      accent: "#2563eb",
      iconBg: darkMode ? "#1e3a5f" : "#eff6ff",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="#2563eb" strokeWidth="1.8" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Approved",
      value: approved,
      accent: "#16a34a",
      iconBg: darkMode ? "#14532d33" : "#f0fdf4",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Pending",
      value: pending,
      accent: "#d97706",
      iconBg: darkMode ? "#71350044" : "#fffbeb",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="1.8" />
          <polyline points="12 6 12 12 16 14" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Rejected",
      value: rejected,
      accent: "#ef4444",
      iconBg: darkMode ? "#450a0a55" : "#fef2f2",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.8" />
          <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  // ── Leave balance data ────────────────────────────────────────
  const balanceCards = [
    { label: "Annual Leave",  days: 12, accent: "#2563eb",  iconBg: darkMode ? "#1e3a5f" : "#eff6ff" },
    { label: "Sick Leave",    days: 6,  accent: "#16a34a",  iconBg: darkMode ? "#14532d33" : "#f0fdf4" },
    { label: "Casual Leave",  days: 8,  accent: "#d97706",  iconBg: darkMode ? "#71350044" : "#fffbeb" },
    { label: "Loss of Pay",   days: 0,  accent: "#ef4444",  iconBg: darkMode ? "#450a0a55" : "#fef2f2" },
  ];

  // ── Filtered list ─────────────────────────────────────────────
  const filteredLeaves = leaveRequests.filter((leave) => {
    const matchStatus =
      selectedStatus === "All Status" || leave.status === selectedStatus;
    const matchSearch =
      !searchTerm ||
      (leave.employee || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Upcoming leaves for calendar (approved, future) ───────────
  const today = new Date().toISOString().split("T")[0];
  const upcomingLeaves = leaveRequests
    .filter((l) => l.status === "Approved" && l.fromDate >= today)
    .sort((a, b) => (a.fromDate > b.fromDate ? 1 : -1));

  // ── Shared style helpers ──────────────────────────────────────
  const cardStyle = {
    background: theme.cardBg,
    borderRadius: 14,
    border: `1px solid ${theme.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    padding: "20px 24px",
  };

  const inputStyle = {
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 400,
    background: theme.inputBg,
    color: theme.text,
    outline: "none",
    height: 38,
    boxSizing: "border-box",
  };

  return (
    <>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          minHeight: "100vh",
          background: theme.pageBg,
        }}
      >
        {/* ── PAGE HEADER ────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: theme.text,
            }}
          >
            Leave Management
          </h1>

          {["Employee", "HR", "Admin", "Manager"].includes(userRole) && (
            <button
              onClick={() => setShowLeaveModal(true)}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Apply Leave
            </button>
          )}
        </div>

        {/* ── KPI STAT CARDS ─────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {kpiCards.map((c) => (
            <div key={c.label} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: c.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 500,
                      color: theme.subtext,
                    }}
                  >
                    {c.label}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 2px",
                      fontSize: 28,
                      fontWeight: 700,
                      color: c.accent,
                      lineHeight: 1,
                    }}
                  >
                    {c.value}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 500,
                      color: theme.muted,
                    }}
                  >
                    This Month
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── LEAVE BALANCE CARDS ────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {balanceCards.map((b) => (
            <div key={b.label} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: b.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="3" stroke={b.accent} strokeWidth="1.8" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke={b.accent} strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke={b.accent} strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke={b.accent} strokeWidth="1.8" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: theme.subtext,
                  }}
                >
                  {b.label}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 700,
                  color: b.accent,
                  lineHeight: 1,
                }}
              >
                {b.days}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  fontWeight: 500,
                  color: theme.muted,
                }}
              >
                Days Available
              </p>
            </div>
          ))}
        </div>

        {/* ── SEARCH + FILTER ROW ────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 300 }}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" stroke={theme.muted} strokeWidth="1.8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={theme.muted} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: "100%", paddingLeft: 36 }}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", minWidth: 140 }}
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* ── LEAVE REQUESTS TABLE ───────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 20, padding: 0, overflow: "hidden" }}>
          {/* Card header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              Leave Requests
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: theme.subtext,
              }}
            >
              {filteredLeaves.length}{" "}
              {filteredLeaves.length === 1 ? "request" : "requests"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theme.tableHeaderBg }}>
                  {[
                    "Employee",
                    "Leave Type",
                    "From",
                    "To",
                    "Days",
                    "Reason",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: theme.subtext,
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "40px 14px",
                        fontSize: 13,
                        color: theme.muted,
                      }}
                    >
                      No{" "}
                      {selectedStatus !== "All Status"
                        ? selectedStatus.toLowerCase() + " "
                        : ""}
                      leave requests found
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const isPending = leave.status === "Pending";
                    const initials = (leave.employee || "?")
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <tr
                        key={leave._id}
                        style={{
                          borderBottom: `1px solid ${theme.border}`,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            theme.tableRowHover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* Employee */}
                        <td style={{ padding: "13px 14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: darkMode ? "#1e3a5f" : "#dbeafe",
                                color: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 13,
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: theme.text,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {leave.employee || "—"}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: theme.muted,
                                }}
                              >
                                Employee
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td style={{ padding: "13px 14px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: darkMode ? "#1e3a5f" : "#dbeafe",
                              color: "#2563eb",
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {leave.leaveType || "—"}
                          </span>
                        </td>

                        {/* From */}
                        <td
                          style={{
                            padding: "13px 14px",
                            fontSize: 13,
                            fontWeight: 400,
                            color: theme.subtext,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {leave.fromDate || "—"}
                        </td>

                        {/* To */}
                        <td
                          style={{
                            padding: "13px 14px",
                            fontSize: 13,
                            fontWeight: 400,
                            color: theme.subtext,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {leave.toDate || "—"}
                        </td>

                        {/* Days */}
                        <td
                          style={{
                            padding: "13px 14px",
                            fontSize: 13,
                            fontWeight: 500,
                            color: theme.text,
                          }}
                        >
                          {leave.days || "—"}
                        </td>

                        {/* Reason */}
                        <td
                          style={{
                            padding: "13px 14px",
                            fontSize: 13,
                            fontWeight: 400,
                            color: theme.subtext,
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {leave.reason || "—"}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "13px 14px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              ...badgeStyle(leave.status),
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {leave.status || "—"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "13px 14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              flexWrap: "nowrap",
                            }}
                          >
                            {/* View */}
                            <button
                              onClick={() => setSelectedLeave(leave)}
                              style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2" />
                              </svg>
                              View
                            </button>

                            {/* Approve — only if Pending */}
                            {isPending && (
                              <button
                                onClick={() => alert("Leave Approved")}
                                style={{
                                  background: darkMode ? "#14532d33" : "#dcfce7",
                                  color: "#16a34a",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <polyline points="20 6 9 17 4 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Approve
                              </button>
                            )}

                            {/* Reject — only if Pending */}
                            {isPending && (
                              <button
                                onClick={() => alert("Leave Rejected")}
                                style={{
                                  background: "#fef2f2",
                                  color: "#ef4444",
                                  border: "1px solid #fecaca",
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                  <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 24px",
              borderTop: `1px solid ${theme.border}`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.subtext }}>
              Showing 1 – {filteredLeaves.length} of {filteredLeaves.length}{" "}
              {filteredLeaves.length === 1 ? "entry" : "entries"}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["‹", "1", "›"].map((btn, i) => (
                <button
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border:
                      i === 1 ? "none" : `1px solid ${theme.border}`,
                    background: i === 1 ? "#2563eb" : theme.cardBg,
                    color: i === 1 ? "#fff" : theme.subtext,
                    fontWeight: i === 1 ? 700 : 400,
                    fontSize: i === 1 ? 13 : 15,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LEAVE CALENDAR ─────────────────────────────────── */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 24px",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="1.8" />
              <line x1="16" y1="2" x2="16" y2="6" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" stroke="#2563eb" strokeWidth="1.8" />
            </svg>
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              Upcoming Leave Calendar
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theme.tableHeaderBg }}>
                  {["Date", "Employee", "Leave Type", "Days", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: theme.subtext,
                          letterSpacing: "0.02em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {upcomingLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "40px 14px",
                        fontSize: 13,
                        color: theme.muted,
                      }}
                    >
                      No upcoming approved leaves
                    </td>
                  </tr>
                ) : (
                  upcomingLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      style={{
                        borderBottom: `1px solid ${theme.border}`,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          theme.tableRowHover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: theme.text,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {leave.fromDate || "—"}
                        {leave.toDate && leave.toDate !== leave.fromDate
                          ? ` – ${leave.toDate}`
                          : ""}
                      </td>
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: theme.text,
                        }}
                      >
                        {leave.employee || "—"}
                      </td>
                      <td style={{ padding: "13px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            background: darkMode ? "#1e3a5f" : "#dbeafe",
                            color: "#2563eb",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {leave.leaveType || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 14px",
                          fontSize: 13,
                          fontWeight: 400,
                          color: theme.subtext,
                        }}
                      >
                        {leave.days || "—"}
                      </td>
                      <td style={{ padding: "13px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            ...badgeStyle(leave.status),
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── VIEW LEAVE MODAL ─────────────────────────────────── */}
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
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLeave(null);
          }}
        >
          <div
            style={{
              background: theme.cardBg,
              borderRadius: 16,
              border: `1px solid ${theme.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              width: 480,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: darkMode ? "#1e3a5f" : "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="1.8" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#2563eb" strokeWidth="1.8" />
                  </svg>
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: theme.text,
                  }}
                >
                  Leave Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: theme.muted,
                  display: "flex",
                  alignItems: "center",
                  padding: 4,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Employee row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                  padding: "14px 16px",
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: darkMode ? "#1e3a5f" : "#dbeafe",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {(selectedLeave.employee || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: theme.text,
                    }}
                  >
                    {selectedLeave.employee || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: theme.muted }}>
                    Employee
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span
                    style={{
                      display: "inline-block",
                      ...badgeStyle(selectedLeave.status),
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {selectedLeave.status}
                  </span>
                </div>
              </div>

              {/* Detail rows */}
              {[
                { label: "Leave Type",  value: selectedLeave.leaveType },
                { label: "From Date",   value: selectedLeave.fromDate },
                { label: "To Date",     value: selectedLeave.toDate },
                { label: "Days",        value: selectedLeave.days },
                { label: "Reason",      value: selectedLeave.reason },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: theme.subtext,
                      flexShrink: 0,
                      minWidth: 100,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: theme.text,
                      textAlign: "right",
                    }}
                  >
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "16px 24px",
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              <button
                onClick={() => setSelectedLeave(null)}
                style={{
                  background: theme.cardBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              {selectedLeave.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      alert("Leave Approved");
                      setSelectedLeave(null);
                    }}
                    style={{
                      background: darkMode ? "#14532d33" : "#dcfce7",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      borderRadius: 10,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      alert("Leave Rejected");
                      setSelectedLeave(null);
                    }}
                    style={{
                      background: "#fef2f2",
                      color: "#ef4444",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leave;
