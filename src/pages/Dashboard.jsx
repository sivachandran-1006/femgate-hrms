import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { Search, Bell } from "lucide-react";

const Dashboard = ({ employees = [], leaves = [], darkMode = false }) => {
  /* ── derived data ── */
  const present = employees.filter((e) => e.status === "Present").length;
  const onLeave = employees.filter((e) => e.status === "Leave").length;
  const pending = leaves.filter((l) => l.status === "Pending").length;
  const total   = employees.length;

  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;
  const onLeavePct    = total > 0 ? Math.round((onLeave / total) * 100) : 0;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const deptMap = {};
  employees.forEach((e) => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
  const depts   = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxDept = depts[0]?.[1] || 1;

  const pendingLeaves    = leaves.filter((l) => l.status === "Pending").slice(0, 3);
  const recentEmployees  = [...employees].slice(0, 4);
  const totalPayroll     = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);

  const chartData = [
    { name: "Present",  value: present || 0 },
    { name: "On Leave", value: onLeave  || 0 },
  ];

  /* ── design tokens ── */
  const t = darkMode
    ? {
        pageBg:         "#0f172a",
        cardBg:         "#1e293b",
        text:           "#f1f5f9",
        subtext:        "#94a3b8",
        muted:          "#64748b",
        border:         "#334155",
        inputBg:        "#0f172a",
        inputBorder:    "#334155",
        tableRowHover:  "#1e293b",
        tableHeaderBg:  "#172033",
      }
    : {
        pageBg:         "#f1f5f9",
        cardBg:         "#ffffff",
        text:           "#0f172a",
        subtext:        "#64748b",
        muted:          "#94a3b8",
        border:         "#e2e8f0",
        inputBg:        "#ffffff",
        inputBorder:    "#e2e8f0",
        tableRowHover:  "#f8fafc",
        tableHeaderBg:  "#f8fafc",
      };

  /* ── helpers ── */
  const card = {
    background:   t.cardBg,
    borderRadius: 14,
    border:       "1px solid " + t.border,
    boxShadow:    "0 1px 3px rgba(0,0,0,0.06)",
  };

  const initials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarPalette = [
    { bg: "#dbeafe", color: "#2563eb" },
    { bg: "#dcfce7", color: "#16a34a" },
    { bg: "#fef9c3", color: "#ca8a04" },
    { bg: "#fee2e2", color: "#dc2626" },
    { bg: "#f3e8ff", color: "#9333ea" },
  ];
  const avatarColor = (i) => avatarPalette[i % avatarPalette.length];

  const badgeStyle = (status) => {
    if (darkMode) {
      if (status === "Present" || status === "Active" || status === "Paid" || status === "Approved" || status === "Completed")
        return { background: "#14532d33", color: "#4ade80" };
      if (status === "Pending" || status === "In Progress" || status === "Late" || status === "On leave")
        return { background: "#71350044", color: "#fbbf24" };
      if (status === "Leave" || status === "Info")
        return { background: "#1e3a5f", color: "#60a5fa" };
      return { background: "#450a0a55", color: "#f87171" };
    }
    if (status === "Present" || status === "Active" || status === "Paid" || status === "Approved" || status === "Completed")
      return { background: "#dcfce7", color: "#15803d" };
    if (status === "Pending" || status === "In Progress" || status === "Late" || status === "On leave")
      return { background: "#fef9c3", color: "#a16207" };
    if (status === "Leave" || status === "Info")
      return { background: "#dbeafe", color: "#1d4ed8" };
    return { background: "#fee2e2", color: "#b91c1c" };
  };

  const iconBtn = {
    width: 34, height: 34, borderRadius: 9,
    background: t.cardBg, border: "1px solid " + t.border,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  };

  /* ── render ── */
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: t.pageBg, minHeight: "100vh", padding: "24px" }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1.2 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 12, fontWeight: 400, color: t.subtext, marginTop: 4, marginBottom: 0 }}>
            {today}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={iconBtn} aria-label="Search">
            <Search size={15} color={t.subtext} strokeWidth={1.8} />
          </button>

          <button style={{ ...iconBtn, position: "relative" }} aria-label="Notifications">
            <Bell size={15} color={t.subtext} strokeWidth={1.8} />
            <span style={{
              position: "absolute", top: 7, right: 7,
              width: 6, height: 6, borderRadius: "50%",
              background: "#ef4444", border: "1.5px solid " + t.cardBg,
            }} />
          </button>

          <div style={{
            height: 34, borderRadius: 9,
            background: t.cardBg, border: "1px solid " + t.border,
            display: "flex", alignItems: "center", padding: "0 12px",
            fontSize: 12, fontWeight: 700, color: t.text, cursor: "pointer",
            userSelect: "none",
          }}>
            AD
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          {
            emoji: "👥", tag: "Employees", tagColor: "#2563eb", tagBg: darkMode ? "#1e3a5f" : "#eff6ff",
            value: total,   valueColor: t.text,    sub: "Total headcount",
          },
          {
            emoji: "✅", tag: "Present",   tagColor: darkMode ? "#4ade80" : "#16a34a", tagBg: darkMode ? "#14532d33" : "#f0fdf4",
            value: present, valueColor: darkMode ? "#4ade80" : "#16a34a", sub: `Today · ${attendancePct}%`,
          },
          {
            emoji: "📋", tag: "On Leave",  tagColor: darkMode ? "#fbbf24" : "#d97706", tagBg: darkMode ? "#71350044" : "#fefce8",
            value: onLeave, valueColor: darkMode ? "#fbbf24" : "#d97706", sub: "Active leaves",
          },
          {
            emoji: "🕐", tag: "Pending",   tagColor: darkMode ? "#f87171" : "#ef4444", tagBg: darkMode ? "#450a0a55" : "#fef2f2",
            value: pending, valueColor: darkMode ? "#f87171" : "#ef4444", sub: "Leave requests",
          },
        ].map((c, i) => (
          <div key={i} style={{ ...card, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: c.tagBg, color: c.tagColor,
                fontSize: 11, fontWeight: 600,
                padding: "4px 10px", borderRadius: 999,
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>{c.emoji}</span>
                {c.tag}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: c.valueColor, margin: "10px 0 4px", lineHeight: 1 }}>
              {c.value}
            </p>
            <p style={{ fontSize: 12, fontWeight: 500, color: t.subtext, margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ── MIDDLE ROW: leave requests | attendance chart | dept headcount ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 12, marginBottom: 16 }}>

        {/* Pending leave requests */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>
              Pending Leaves
            </h3>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>
              View all
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>No pending requests</p>
          ) : pendingLeaves.map((lv, i) => {
            const ac = avatarColor(i);
            return (
              <div key={lv._id || i} style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: i < pendingLeaves.length - 1 ? 14 : 0,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: ac.bg, color: ac.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>
                  {initials(lv.employee)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: t.text, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lv.employee}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 400, color: t.subtext, margin: 0 }}>
                    {lv.leaveType} · {lv.days || "—"} days
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "3px 10px", borderRadius: 999,
                  ...badgeStyle("Pending"),
                  flexShrink: 0,
                }}>
                  Pending
                </span>
              </div>
            );
          })}
        </div>

        {/* Attendance breakdown (donut) */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 14px" }}>
            Attendance Breakdown
          </h3>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ width: 130, height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.some((d) => d.value > 0) ? chartData : [{ name: "No data", value: 1 }]}
                    dataKey="value" nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={58} innerRadius={35}
                    paddingAngle={chartData.some((d) => d.value > 0) ? 3 : 0}
                    startAngle={90} endAngle={-270}
                  >
                    {chartData.some((d) => d.value > 0)
                      ? <><Cell fill="#16a34a" /><Cell fill="#d97706" /></>
                      : <Cell fill={t.border} />}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8, border: "1px solid " + t.border,
                      background: t.cardBg, color: t.text, fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {[
            { label: "Present",  pct: attendancePct, color: "#16a34a" },
            { label: "On Leave", pct: onLeavePct,    color: "#d97706" },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: t.subtext }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{item.pct}%</span>
              </div>
              <div style={{ height: 5, background: t.border, borderRadius: 99 }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: item.color,
                  width: `${item.pct}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Department headcount */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>
              Department Headcount
            </h3>
            <span style={{ fontSize: 12, fontWeight: 500, color: t.muted }}>this month</span>
          </div>

          {depts.length === 0
            ? <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>No data</p>
            : depts.map(([dept, count], i) => (
              <div key={dept} style={{ marginBottom: i < depts.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{dept}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{count}</span>
                </div>
                <div style={{ height: 5, background: t.border, borderRadius: 99 }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    background: "#2563eb",
                    width: `${Math.round((count / maxDept) * 100)}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── BOTTOM ROW: employee activity table | payroll snapshot ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>

        {/* Recent employee activity */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>
              Recent Employee Activity
            </h3>
            <span style={{ fontSize: 12, fontWeight: 500, color: t.muted }}>today</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.tableHeaderBg }}>
                {["Employee", "Department", "Check-in", "Status"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left",
                    padding: "10px 14px 12px",
                    fontSize: 12, fontWeight: 600,
                    color: t.subtext,
                    letterSpacing: "0.02em",
                    background: t.tableHeaderBg,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "13px 14px", fontSize: 13, color: t.muted }}>
                    No recent activity
                  </td>
                </tr>
              ) : recentEmployees.map((emp, i) => {
                const ac = avatarColor(i);
                const statusLabel =
                  emp.status === "Present" ? "Present"
                  : emp.status === "Leave"   ? "On leave"
                  : "Absent";
                const bs = badgeStyle(statusLabel);

                return (
                  <tr key={emp._id || i} style={{ borderBottom: "1px solid " + t.border }}>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: ac.bg, color: ac.color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, flexShrink: 0,
                        }}>
                          {initials(emp.name)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 400, color: t.subtext }}>
                      {emp.department}
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 400, color: t.subtext }}>—</td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: "3px 10px", borderRadius: 999,
                        ...bs,
                      }}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Payroll snapshot */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>
              Payroll Snapshot
            </h3>
            <span style={{ fontSize: 12, fontWeight: 500, color: t.muted }}>
              {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>

          <p style={{ fontSize: 12, fontWeight: 500, color: t.subtext, margin: "6px 0 4px" }}>
            Total payroll
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: t.text, margin: "0 0 16px", lineHeight: 1.1 }}>
            ₹{totalPayroll.toLocaleString("en-IN")}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Processed", value: present, color: "#16a34a" },
              { label: "Pending",   value: pending,  color: "#d97706" },
            ].map((s) => (
              <div key={s.label} style={{
                background: t.tableHeaderBg,
                borderRadius: 10, padding: "11px 14px",
                border: "1px solid " + t.border,
              }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: t.subtext, margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: "0 0 6px" }}>
            Processing status
          </p>
          <div style={{ height: 6, background: t.border, borderRadius: 99, marginBottom: 6 }}>
            <div style={{
              height: "100%", borderRadius: 99, background: "#16a34a",
              width: total > 0 ? `${attendancePct}%` : "0%",
              transition: "width 0.4s ease",
            }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 400, color: t.subtext, margin: 0 }}>
            {present} of {total} processed · {attendancePct}%
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
