import { useEffect, useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const TODAY = new Date().toISOString().split("T")[0];
const FMT_DATE = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#2563eb" }, { bg: "#dcfce7", color: "#16a34a" },
  { bg: "#fef9c3", color: "#ca8a04" }, { bg: "#fee2e2", color: "#dc2626" },
  { bg: "#f3e8ff", color: "#9333ea" }, { bg: "#fce7f3", color: "#db2777" },
];
const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials    = (name = "") => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const calcHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";
  try {
    const s = new Date(`1970-01-01 ${checkIn}`);
    const e = new Date(`1970-01-01 ${checkOut}`);
    const diff = e - s;
    if (diff <= 0) return "—";
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  } catch { return "—"; }
};

const statusStyle = (s) => ({
  Present: { bg: "#dcfce7", color: "#15803d" },
  Absent:  { bg: "#fee2e2", color: "#b91c1c" },
  Late:    { bg: "#fef3c7", color: "#d97706" },
  Leave:   { bg: "#dbeafe", color: "#2563eb" },
}[s] || { bg: "#f1f5f9", color: "#64748b" });

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const MOCK_ATTENDANCE = [
  // Today
  { _id: "a01", employee: "Mani",       department: "IT",         date: TODAY,        checkIn: "09:05 AM", checkOut: "06:10 PM", status: "Present" },
  { _id: "a02", employee: "P Santhosh", department: "IT",         date: TODAY,        checkIn: "09:15 AM", checkOut: "06:00 PM", status: "Present" },
  { _id: "a03", employee: "C Santhosh", department: "IT",         date: TODAY,        checkIn: "09:30 AM", checkOut: "",         status: "Present" },
  { _id: "a04", employee: "Suriya",     department: "IT",         date: TODAY,        checkIn: "10:20 AM", checkOut: "07:15 PM", status: "Late"    },
  { _id: "a05", employee: "Siva",       department: "Management", date: TODAY,        checkIn: "08:50 AM", checkOut: "05:55 PM", status: "Present" },
  { _id: "a06", employee: "Aravinth",   department: "IT",         date: TODAY,        checkIn: "09:10 AM", checkOut: "",         status: "Present" },
  { _id: "a07", employee: "Safeer",     department: "Finance",    date: TODAY,        checkIn: "",         checkOut: "",         status: "Leave"   },
  { _id: "a08", employee: "Sabari",     department: "IT",         date: TODAY,        checkIn: "09:08 AM", checkOut: "06:05 PM", status: "Present" },
  { _id: "a09", employee: "Vignesh",    department: "IT",         date: TODAY,        checkIn: "",         checkOut: "",         status: "Absent"  },
  // 2026-05-29
  { _id: "a10", employee: "Mani",       department: "IT",         date: "2026-05-29", checkIn: "09:02 AM", checkOut: "06:00 PM", status: "Present" },
  { _id: "a11", employee: "P Santhosh", department: "IT",         date: "2026-05-29", checkIn: "09:50 AM", checkOut: "06:45 PM", status: "Late"    },
  { _id: "a12", employee: "C Santhosh", department: "IT",         date: "2026-05-29", checkIn: "09:05 AM", checkOut: "06:10 PM", status: "Present" },
  { _id: "a13", employee: "Aravinth",   department: "IT",         date: "2026-05-29", checkIn: "09:00 AM", checkOut: "05:50 PM", status: "Present" },
  { _id: "a14", employee: "Vignesh",    department: "IT",         date: "2026-05-29", checkIn: "",         checkOut: "",         status: "Absent"  },
  { _id: "a15", employee: "Siva",       department: "Management", date: "2026-05-29", checkIn: "08:55 AM", checkOut: "06:05 PM", status: "Present" },
  // 2026-05-28
  { _id: "a16", employee: "Mani",       department: "IT",         date: "2026-05-28", checkIn: "09:10 AM", checkOut: "06:05 PM", status: "Present" },
  { _id: "a17", employee: "Suriya",     department: "IT",         date: "2026-05-28", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present" },
  { _id: "a18", employee: "Siva",       department: "Management", date: "2026-05-28", checkIn: "08:55 AM", checkOut: "05:55 PM", status: "Present" },
  { _id: "a19", employee: "Safeer",     department: "Finance",    date: "2026-05-28", checkIn: "09:15 AM", checkOut: "06:20 PM", status: "Present" },
  { _id: "a20", employee: "Sabari",     department: "IT",         date: "2026-05-28", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present" },
  { _id: "a21", employee: "Vignesh",    department: "IT",         date: "2026-05-28", checkIn: "10:30 AM", checkOut: "07:00 PM", status: "Late"    },
];

const DEPARTMENTS = ["All", "IT", "HR", "Finance", "Management"];
const ROWS_PER_PAGE = 8;

const inputStyle = {
  border: "1px solid #e2e8f0", borderRadius: 10,
  padding: "10px 14px", fontSize: 14, outline: "none",
  width: "100%", boxSizing: "border-box",
};

const Attendance = () => {
  const [attendance, setAttendance]       = useState(MOCK_ATTENDANCE);
  const [searchTerm, setSearchTerm]       = useState("");
  const [deptFilter, setDeptFilter]       = useState("All");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [dateFilter, setDateFilter]       = useState(TODAY);
  const [currentPage, setCurrentPage]     = useState(1);
  const [showModal, setShowModal]         = useState(false);
  const [activeTab, setActiveTab]         = useState("records");

  // check-in modal form
  const [fName, setFName]   = useState("");
  const [fDept, setFDept]   = useState("IT");
  const [fStatus, setFStatus] = useState("Present");

  const fetchAttendance = async () => {
    try {
      const res = await Promise.resolve({ data: [] });
      if (res.data && res.data.length > 0) setAttendance(res.data);
    } catch { /* keep mock */ }
  };

  useEffect(() => { fetchAttendance(); }, []);

  // ── derived ──
  const todayRecords = attendance.filter(a => a.date === TODAY);
  const todayPresent = todayRecords.filter(a => a.status === "Present").length;
  const todayLate    = todayRecords.filter(a => a.status === "Late").length;
  const todayAbsent  = todayRecords.filter(a => a.status === "Absent").length;
  const todayLeave   = todayRecords.filter(a => a.status === "Leave").length;
  const checkedOut   = todayRecords.filter(a => a.checkOut).length;

  const filtered = attendance.filter(a => {
    const matchDate   = !dateFilter || a.date === dateFilter;
    const matchSearch = !searchTerm || a.employee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept   = deptFilter === "All"   || a.department === deptFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchDate && matchSearch && matchDept && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // weekly chart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const recs = attendance.filter(a => a.date === iso);
    return {
      day: label,
      Present: recs.filter(a => a.status === "Present").length,
      Late:    recs.filter(a => a.status === "Late").length,
      Absent:  recs.filter(a => a.status === "Absent").length,
    };
  });

  // dept summary for today
  const deptSummary = ["IT","HR","Finance","Management"].map(dept => ({
    dept,
    present: todayRecords.filter(a => a.department === dept && (a.status === "Present" || a.status === "Late")).length,
    total:   todayRecords.filter(a => a.department === dept).length,
  }));

  const handleCheckIn = async () => {
    if (!fName.trim()) { alert("Employee name is required"); return; }
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const isLate = new Date().getHours() >= 10;
    const newRecord = {
      _id: `a${Date.now()}`, employee: fName, department: fDept,
      date: TODAY, checkIn: now, checkOut: "",
      status: fStatus === "Present" && isLate ? "Late" : fStatus,
    };
    try {
      await Promise.resolve({ data: [] });
    } catch { /* offline — add locally */ }
    setAttendance(prev => [newRecord, ...prev]);
    setFName(""); setFDept("IT"); setFStatus("Present");
    setShowModal(false);
  };

  const handleCheckOut = async (id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    try { await Promise.resolve({ data: [] }); } catch { /* offline */ }
    setAttendance(prev => prev.map(a => a._id === id ? { ...a, checkOut: now } : a));
  };

  const kpis = [
    { label: "Present Today",  value: todayPresent, color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircle size={20} color="#16a34a" /> },
    { label: "Late Arrivals",  value: todayLate,    color: "#d97706", bg: "#fef3c7", icon: <Clock size={20} color="#d97706" /> },
    { label: "Absent Today",   value: todayAbsent,  color: "#ef4444", bg: "#fee2e2", icon: <XCircle size={20} color="#ef4444" /> },
    { label: "On Leave",       value: todayLeave,   color: "#2563eb", bg: "#dbeafe", icon: <UserCheck size={20} color="#2563eb" /> },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Attendance</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{FMT_DATE(TODAY)} · {todayRecords.length} records today</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["records", "overview"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500, textTransform: "capitalize",
              background: activeTab === t ? "#f1f5f9" : "transparent",
              color: activeTab === t ? "#0f172a" : "#64748b",
            }}>{t}</button>
          ))}
          <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#16a34a", color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            <Plus size={16} strokeWidth={2.5} /> Mark Attendance
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {kpis.map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8eaed" }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 500 }}>{c.label}</p>
              <p style={{ margin: "3px 0 0", fontSize: 24, fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECORDS TAB ── */}
      {activeTab === "records" && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8eaed" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input placeholder="Search employee…" value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingLeft: 34 }} />
            </div>
            <input type="date" value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 160 }} />
            <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 150, cursor: "pointer" }}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 130, cursor: "pointer" }}>
              {["All","Present","Absent","Late","Leave"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>
            <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                {["Employee","Department","Date","Check In","Check Out","Hours","Status","Action"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px 12px", fontSize: 12, fontWeight: 600, color: "#475569" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>No records found</td></tr>
              ) : paginated.map((item) => {
                const av = avatarColor(item.employee);
                const ss = statusStyle(item.status);
                return (
                  <tr key={item._id}
                    style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {initials(item.employee)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.employee}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px", fontSize: 13, color: "#64748b" }}>{item.department}</td>
                    <td style={{ padding: "12px 10px", fontSize: 13, color: "#64748b" }}>{FMT_DATE(item.date)}</td>
                    <td style={{ padding: "12px 10px", fontSize: 13, color: "#334155" }}>{item.checkIn || "—"}</td>
                    <td style={{ padding: "12px 10px", fontSize: 13, color: "#334155" }}>{item.checkOut || "—"}</td>
                    <td style={{ padding: "12px 10px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{calcHours(item.checkIn, item.checkOut)}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color }}>{item.status}</span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {item.date === TODAY && !item.checkOut && item.checkIn ? (
                        <button onClick={() => handleCheckOut(item._id)} style={{
                          background: "#ef4444", color: "#fff", border: "none",
                          borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>Check Out</button>
                      ) : item.checkOut ? (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Done</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? "#cbd5e1" : "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: p === currentPage ? "none" : "1px solid #e2e8f0",
                    background: p === currentPage ? "#2563eb" : "#fff",
                    color: p === currentPage ? "#fff" : "#334155",
                    fontWeight: p === currentPage ? 700 : 500, fontSize: 13, cursor: "pointer",
                  }}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? "#cbd5e1" : "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <>
          {/* Weekly chart */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8eaed", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Weekly Attendance (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekDays} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Present" fill="#16a34a" radius={[4,4,0,0]} />
                <Bar dataKey="Late"    fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="Absent"  fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 10 }}>
              {[["Present","#16a34a"],["Late","#f59e0b"],["Absent","#ef4444"]].map(([l,c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#64748b" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dept summary + today's progress */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8eaed" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Department Attendance Today</h3>
              {deptSummary.map((d, i) => (
                <div key={d.dept} style={{ marginBottom: i < deptSummary.length - 1 ? 14 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{d.dept}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{d.present}/{d.total || "—"}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                    <div style={{ height: "100%", borderRadius: 99, background: "#16a34a", width: d.total > 0 ? `${Math.round((d.present / d.total) * 100)}%` : "0%", transition: "width 0.4s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8eaed" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Today's Summary</h3>
              {[
                { label: "Total Expected",    value: todayRecords.length, color: "#0f172a" },
                { label: "Present",           value: todayPresent,        color: "#16a34a" },
                { label: "Late Arrivals",     value: todayLate,           color: "#d97706" },
                { label: "Absent",            value: todayAbsent,         color: "#ef4444" },
                { label: "On Leave",          value: todayLeave,          color: "#2563eb" },
                { label: "Checked Out",       value: checkedOut,          color: "#8b5cf6" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MARK ATTENDANCE MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mark Attendance</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Employee Name *</label>
                <input style={inputStyle} placeholder="Full name" value={fName} onChange={e => setFName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Department</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={fDept} onChange={e => setFDept(e.target.value)}>
                  {["IT","HR","Finance","Management"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Status</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  {["Present","Absent","Leave","Late"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#16a34a", fontWeight: 500 }}>
                Check-in time: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                {new Date().getHours() >= 10 && fStatus === "Present" && (
                  <span style={{ color: "#d97706", marginLeft: 8 }}>(will be marked Late)</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCheckIn} style={{ flex: 2, padding: "12px", border: "none", borderRadius: 10, background: "#16a34a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Mark Check In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
