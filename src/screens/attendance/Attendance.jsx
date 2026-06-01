import { useEffect, useState } from "react";
import { fetchAttendance, createAttendanceRecord, checkOutAttendance } from "../../api/attendanceApi";
import { Search, Plus, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ── Theme token imports (NO hardcoded values) ─────────────────────────────
import { COLORS, STATUS_BADGE }                                          from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                           from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                                 from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE }  from "../../theme/sizes";
import { getAvatarColor, getStatusBadge }                                from "../../utils/helpers";

const TODAY = new Date().toISOString().split("T")[0];
const FMT_DATE = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const initials = (name = "") => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

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

const Attendance = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [attendance, setAttendance]     = useState(MOCK_ATTENDANCE);
  const [searchTerm, setSearchTerm]     = useState("");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter]     = useState(TODAY);
  const [currentPage, setCurrentPage]   = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [activeTab, setActiveTab]       = useState("records");

  // check-in modal form
  const [fName, setFName]     = useState("");
  const [fDept, setFDept]     = useState("IT");
  const [fStatus, setFStatus] = useState("Present");

  const loadAttendance = async () => {
    try {
      const data = await fetchAttendance();
      if (data && data.length > 0) setAttendance(data);
    } catch { /* keep mock */ }
  };

  useEffect(() => { loadAttendance(); }, []);

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
      await createAttendanceRecord({ ...newRecord, status: newRecord.status });
    } catch { /* offline — add locally */ }
    setAttendance(prev => [newRecord, ...prev]);
    setFName(""); setFDept("IT"); setFStatus("Present");
    setShowModal(false);
  };

  const handleCheckOut = async (id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    try { await checkOutAttendance(id, { checkOut: now }); } catch { /* offline */ }
    setAttendance(prev => prev.map(a => a._id === id ? { ...a, checkOut: now } : a));
  };

  const kpis = [
    { label: "Present Today", value: todayPresent, color: COLORS.success,  bg: COLORS.successMuted,  icon: <CheckCircle size={ICON_SIZE.lg} color={COLORS.success} /> },
    { label: "Late Arrivals", value: todayLate,    color: COLORS.warning,  bg: COLORS.warningMuted,  icon: <Clock       size={ICON_SIZE.lg} color={COLORS.warning} /> },
    { label: "Absent Today",  value: todayAbsent,  color: COLORS.danger,   bg: COLORS.dangerMuted,   icon: <XCircle     size={ICON_SIZE.lg} color={COLORS.danger} /> },
    { label: "On Leave",      value: todayLeave,   color: COLORS.primary,  bg: COLORS.primaryMuted,  icon: <UserCheck   size={ICON_SIZE.lg} color={COLORS.primary} /> },
  ];

  const inputStyle = {
    border: `1px solid ${surface.border}`,
    borderRadius: RADIUS.lg,
    padding: PADDING.input,
    fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: surface.inputBg,
    color: surface.text,
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: GAP.xl }}>
        <div>
          <h1 style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0, fontFamily: FONT_FAMILY.base }}>{`Attendance`}</h1>
          <p style={{ fontSize: FONT_SIZE.base, color: surface.subtext, marginTop: GAP.xs, fontFamily: FONT_FAMILY.base }}>{FMT_DATE(TODAY)} · {todayRecords.length} records today</p>
        </div>
        <div style={{ display: "flex", gap: GAP.sm }}>
          {["records", "overview"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: PADDING.btn,
              borderRadius: RADIUS.lg,
              border: "none",
              cursor: "pointer",
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.medium,
              fontFamily: FONT_FAMILY.base,
              textTransform: "capitalize",
              background: activeTab === t ? COLORS.gray100 : "transparent",
              color: activeTab === t ? surface.text : surface.subtext,
            }}>{t}</button>
          ))}
          <button onClick={() => setShowModal(true)} style={{
            display: "flex",
            alignItems: "center",
            gap: GAP.xs + GAP.xs - 1,
            background: COLORS.success,
            color: COLORS.white,
            border: "none",
            borderRadius: RADIUS.lg,
            padding: PADDING.btn,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.semibold,
            fontFamily: FONT_FAMILY.base,
            cursor: "pointer",
          }}>
            <Plus size={ICON_SIZE.sm} strokeWidth={2.5} /> Mark Attendance
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: GAP.xl }}>
        {kpis.map(c => (
          <div key={c.label} style={{
            background: surface.cardBg,
            borderRadius: RADIUS["2xl"],
            padding: `${SPACING[4]}px ${SPACING[4] + 2}px`,
            display: "flex",
            alignItems: "center",
            gap: SPACING[3] + 2,
            boxShadow: SHADOW.card,
            border: `1px solid ${surface.border}`,
          }}>
            <div style={{
              width: LAYOUT.iconBoxLg - 6,
              height: LAYOUT.iconBoxLg - 6,
              borderRadius: RADIUS.xl,
              background: c.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>{c.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base }}>{c.label}</p>
              <p style={{ margin: `${GAP.xs - 1}px 0 0`, fontSize: 24, fontWeight: FONT_WEIGHT.bold, color: c.color, lineHeight: 1, fontFamily: FONT_FAMILY.base }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECORDS TAB ── */}
      {activeTab === "records" && (
        <div style={{
          background: surface.cardBg,
          borderRadius: RADIUS["2xl"],
          padding: PADDING.card,
          boxShadow: SHADOW.card,
          border: `1px solid ${surface.border}`,
        }}>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: GAP.sm + 2, marginBottom: SPACING[4] + 2, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={ICON_SIZE.sm} color={COLORS.gray400} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search employee…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingLeft: SPACING[8] + 2 }}
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 160 }}
            />
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 150, cursor: "pointer" }}
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 130, cursor: "pointer" }}
            >
              {["All","Present","Absent","Late","Leave"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>
            <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400, display: "flex", alignItems: "center", fontFamily: FONT_FAMILY.base }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${surface.theadBg}` }}>
                {["Employee","Department","Date","Check In","Check Out","Hours","Status","Action"].map(h => (
                  <th key={h} style={{
                    textAlign: "left",
                    padding: PADDING.tableHeader,
                    fontSize: FONT_SIZE.sm,
                    fontWeight: FONT_WEIGHT.semibold,
                    color: COLORS.gray600,
                    fontFamily: FONT_FAMILY.base,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: SPACING[12], color: COLORS.gray400, fontSize: FONT_SIZE.md, fontFamily: FONT_FAMILY.base }}>No records found</td></tr>
              ) : paginated.map((item) => {
                const av    = getAvatarColor(item.employee);
                const badge = getStatusBadge(item.status);
                return (
                  <tr
                    key={item._id}
                    style={{ borderBottom: `1px solid ${surface.divider}` }}
                    onMouseEnter={e => e.currentTarget.style.background = surface.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm + 2 }}>
                        <div style={{
                          width: LAYOUT.avatar - 2,
                          height: LAYOUT.avatar - 2,
                          borderRadius: RADIUS.full,
                          background: av.bg,
                          color: av.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: FONT_SIZE.xs,
                          fontWeight: FONT_WEIGHT.bold,
                          fontFamily: FONT_FAMILY.base,
                          flexShrink: 0,
                        }}>
                          {initials(item.employee)}
                        </div>
                        <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text, fontFamily: FONT_FAMILY.base }}>{item.employee}</span>
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, fontFamily: FONT_FAMILY.base }}>{item.department}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, fontFamily: FONT_FAMILY.base }}>{FMT_DATE(item.date)}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: COLORS.gray700, fontFamily: FONT_FAMILY.base }}>{item.checkIn || "—"}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: COLORS.gray700, fontFamily: FONT_FAMILY.base }}>{item.checkOut || "—"}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text, fontFamily: FONT_FAMILY.base }}>{calcHours(item.checkIn, item.checkOut)}</td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{
                        display: "inline-block",
                        padding: PADDING.badge,
                        borderRadius: RADIUS.full,
                        fontSize: FONT_SIZE.xs,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        background: badge.bg,
                        color: badge.color,
                      }}>{item.status}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      {item.date === TODAY && !item.checkOut && item.checkIn ? (
                        <button onClick={() => handleCheckOut(item._id)} style={{
                          background: COLORS.danger,
                          color: COLORS.white,
                          border: "none",
                          borderRadius: RADIUS.md,
                          padding: `${GAP.sm - 2}px ${GAP.md}px`,
                          fontSize: FONT_SIZE.sm,
                          fontWeight: FONT_WEIGHT.semibold,
                          fontFamily: FONT_FAMILY.base,
                          cursor: "pointer",
                        }}>Check Out</button>
                      ) : item.checkOut ? (
                        <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray400, fontFamily: FONT_FAMILY.base }}>Done</span>
                      ) : (
                        <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray300, fontFamily: FONT_FAMILY.base }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${surface.divider}`, paddingTop: SPACING[3] + 1, marginTop: GAP.sm }}>
              <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400, fontFamily: FONT_FAMILY.base }}>
                {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: GAP.xs + 2 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    width: 32, height: 32,
                    borderRadius: RADIUS.md,
                    border: `1px solid ${surface.border}`,
                    background: surface.cardBg,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    color: currentPage === 1 ? COLORS.gray300 : COLORS.gray700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <ChevronLeft size={ICON_SIZE.sm} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} style={{
                    width: 32, height: 32,
                    borderRadius: RADIUS.md,
                    border: p === currentPage ? "none" : `1px solid ${surface.border}`,
                    background: p === currentPage ? COLORS.primary : surface.cardBg,
                    color: p === currentPage ? COLORS.white : COLORS.gray700,
                    fontWeight: p === currentPage ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
                    fontFamily: FONT_FAMILY.base,
                    fontSize: FONT_SIZE.base,
                    cursor: "pointer",
                  }}>{p}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    width: 32, height: 32,
                    borderRadius: RADIUS.md,
                    border: `1px solid ${surface.border}`,
                    background: surface.cardBg,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    color: currentPage === totalPages ? COLORS.gray300 : COLORS.gray700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <ChevronRight size={ICON_SIZE.sm} />
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
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS["2xl"],
            padding: PADDING.card,
            boxShadow: SHADOW.card,
            border: `1px solid ${surface.border}`,
            marginBottom: SPACING[3] + 1,
          }}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px`, fontFamily: FONT_FAMILY.base }}>Weekly Attendance (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekDays} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                <XAxis dataKey="day" tick={{ fontSize: FONT_SIZE.sm, fill: surface.subtext, fontFamily: FONT_FAMILY.base }} />
                <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext, fontFamily: FONT_FAMILY.base }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base }} />
                <Bar dataKey="Present" fill={COLORS.success}  radius={[4,4,0,0]} />
                <Bar dataKey="Late"    fill={COLORS.warning}  radius={[4,4,0,0]} />
                <Bar dataKey="Absent"  fill={COLORS.danger}   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: SPACING[4] + 2, justifyContent: "center", marginTop: GAP.sm + 2 }}>
              {[[`Present`, COLORS.success],[`Late`, COLORS.warning],[`Absent`, COLORS.danger]].map(([l,c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: GAP.xs + 2, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base }}>
                  <div style={{ width: 10, height: 10, borderRadius: RADIUS.sm - 3, background: c }} />
                  <span style={{ color: surface.subtext }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dept summary + today's progress */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING[3] + 1 }}>
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], padding: PADDING.card, boxShadow: SHADOW.card, border: `1px solid ${surface.border}` }}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px`, fontFamily: FONT_FAMILY.base }}>Department Attendance Today</h3>
              {deptSummary.map((d, i) => (
                <div key={d.dept} style={{ marginBottom: i < deptSummary.length - 1 ? SPACING[3] + 1 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: GAP.xs + 1 }}>
                    <span style={{ fontSize: FONT_SIZE.base, color: COLORS.gray700, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base }}>{d.dept}</span>
                    <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext, fontFamily: FONT_FAMILY.base }}>{d.present}/{d.total || "—"}</span>
                  </div>
                  <div style={{ height: 6, background: surface.theadBg, borderRadius: RADIUS.full }}>
                    <div style={{
                      height: "100%",
                      borderRadius: RADIUS.full,
                      background: COLORS.success,
                      width: d.total > 0 ? `${Math.round((d.present / d.total) * 100)}%` : "0%",
                      transition: "width 0.4s",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], padding: PADDING.card, boxShadow: SHADOW.card, border: `1px solid ${surface.border}` }}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px`, fontFamily: FONT_FAMILY.base }}>Today's Summary</h3>
              {[
                { label: "Total Expected", value: todayRecords.length, color: surface.text },
                { label: "Present",        value: todayPresent,        color: COLORS.success },
                { label: "Late Arrivals",  value: todayLate,           color: COLORS.warning },
                { label: "Absent",         value: todayAbsent,         color: COLORS.danger },
                { label: "On Leave",       value: todayLeave,          color: COLORS.primary },
                { label: "Checked Out",    value: checkedOut,          color: COLORS.purple },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${surface.divider}`, paddingBottom: GAP.sm + 2, marginBottom: GAP.sm + 2 }}>
                  <span style={{ fontSize: FONT_SIZE.base, color: surface.subtext, fontFamily: FONT_FAMILY.base }}>{row.label}</span>
                  <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: row.color, fontFamily: FONT_FAMILY.base }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MARK ATTENDANCE MODAL ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: Z_INDEX.modal,
        }}>
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS["3xl"],
            padding: PADDING.modal,
            width: "100%", maxWidth: 440,
            boxShadow: SHADOW.modal,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING[5] + 2 }}>
              <h2 style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0, fontFamily: FONT_FAMILY.base }}>Mark Attendance</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, fontSize: FONT_SIZE.xl + 4, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: SPACING[3] + 1 }}>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, display: "block", marginBottom: GAP.xs + 1 }}>Employee Name *</label>
                <input style={inputStyle} placeholder="Full name" value={fName} onChange={e => setFName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, display: "block", marginBottom: GAP.xs + 1 }}>Department</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={fDept} onChange={e => setFDept(e.target.value)}>
                  {["IT","HR","Finance","Management"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, display: "block", marginBottom: GAP.xs + 1 }}>Status</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  {["Present","Absent","Leave","Late"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div style={{
                background: COLORS.successMuted,
                border: `1px solid ${COLORS.successLight}`,
                borderRadius: RADIUS.lg,
                padding: PADDING.input,
                fontSize: FONT_SIZE.base,
                fontFamily: FONT_FAMILY.base,
                color: COLORS.success,
                fontWeight: FONT_WEIGHT.medium,
              }}>
                Check-in time: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                {new Date().getHours() >= 10 && fStatus === "Present" && (
                  <span style={{ color: COLORS.warning, marginLeft: GAP.sm, fontFamily: FONT_FAMILY.base }}>(will be marked Late)</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: GAP.sm + 2, marginTop: SPACING[5] + 2 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1,
                padding: SPACING[3],
                border: `1px solid ${surface.border}`,
                borderRadius: RADIUS.lg,
                background: surface.cardBg,
                fontSize: FONT_SIZE.md,
                fontWeight: FONT_WEIGHT.semibold,
                fontFamily: FONT_FAMILY.base,
                color: COLORS.gray600,
                cursor: "pointer",
              }}>Cancel</button>
              <button onClick={handleCheckIn} style={{
                flex: 2,
                padding: SPACING[3],
                border: "none",
                borderRadius: RADIUS.lg,
                background: COLORS.success,
                color: COLORS.white,
                fontSize: FONT_SIZE.md,
                fontWeight: FONT_WEIGHT.semibold,
                fontFamily: FONT_FAMILY.base,
                cursor: "pointer",
              }}>Mark Check In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
