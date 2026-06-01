import { useState } from "react";
import {
  Users, CheckCircle, Clock, XCircle,
  Search, Plus, Eye, Check, X, Calendar,
  ChevronLeft, ChevronRight,
} from "lucide-react";

import { COLORS }                            from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }     from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, ICON_SIZE, TRANSITION } from "../../theme/sizes";
import { getAvatarColor, getStatusBadge }    from "../../utils/helpers";

const MOCK_LEAVES = [
  { _id: "lv001", employee: "Safeer",     leaveType: "Sick Leave",   fromDate: "2026-05-20", toDate: "2026-05-22", days: 3, reason: "Fever",           status: "Approved" },
  { _id: "lv002", employee: "Suriya",     leaveType: "Casual Leave", fromDate: "2026-05-28", toDate: "2026-05-28", days: 1, reason: "Personal work",    status: "Pending"  },
  { _id: "lv003", employee: "Aravinth",   leaveType: "Casual Leave", fromDate: "2026-06-02", toDate: "2026-06-03", days: 2, reason: "Family function",  status: "Pending"  },
  { _id: "lv004", employee: "C Santhosh", leaveType: "Sick Leave",   fromDate: "2026-05-30", toDate: "2026-05-30", days: 1, reason: "Doctor visit",     status: "Pending"  },
  { _id: "lv005", employee: "Mani",       leaveType: "Annual Leave", fromDate: "2026-04-10", toDate: "2026-04-14", days: 5, reason: "Vacation",         status: "Approved" },
  { _id: "lv006", employee: "P Santhosh", leaveType: "Casual Leave", fromDate: "2026-03-15", toDate: "2026-03-15", days: 1, reason: "Personal",         status: "Rejected" },
  { _id: "lv007", employee: "Vignesh",    leaveType: "Annual Leave", fromDate: "2026-05-05", toDate: "2026-05-07", days: 3, reason: "Travel",           status: "Approved" },
  { _id: "lv008", employee: "Siva",       leaveType: "Sick Leave",   fromDate: "2026-02-18", toDate: "2026-02-19", days: 2, reason: "Cold & flu",       status: "Approved" },
  { _id: "lv009", employee: "Sabari",     leaveType: "Casual Leave", fromDate: "2026-06-05", toDate: "2026-06-05", days: 1, reason: "Personal work",    status: "Pending"  },
];

const LEAVE_TYPE_COLORS = {
  "Sick Leave":   { bg: COLORS.dangerMuted,  text: COLORS.danger  },
  "Casual Leave": { bg: COLORS.warningLight, text: COLORS.warning },
  "Annual Leave": { bg: COLORS.primaryMuted, text: COLORS.primary },
  "Earned Leave": { bg: COLORS.purpleMuted,  text: COLORS.purple  },
};

const STATUS_COLORS = {
  Approved: { bg: COLORS.successLight, text: COLORS.success, dot: COLORS.success },
  Pending:  { bg: COLORS.warningLight, text: COLORS.warning, dot: COLORS.warning },
  Rejected: { bg: COLORS.dangerMuted,  text: COLORS.danger,  dot: COLORS.danger  },
};

const LEAVE_BALANCE = [
  { label: "Annual Leave",  total: 18, used: 5,  color: COLORS.primary, bg: COLORS.primaryMuted  },
  { label: "Sick Leave",    total: 12, used: 5,  color: COLORS.danger,  bg: COLORS.dangerMuted   },
  { label: "Casual Leave",  total: 10, used: 4,  color: COLORS.warning, bg: COLORS.warningLight  },
  { label: "Loss of Pay",   total: 0,  used: 0,  color: COLORS.gray700, bg: COLORS.gray50        },
];

const ROWS_PER_PAGE = 6;

const Leave = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [leaves, setLeaves]             = useState(MOCK_LEAVES);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter]     = useState("All");
  const [currentPage, setCurrentPage]   = useState(1);
  const [viewLeave, setViewLeave]       = useState(null);
  const [showApply, setShowApply]       = useState(false);
  const [form, setForm]                 = useState({ employee: "", leaveType: "Casual Leave", fromDate: "", toDate: "", reason: "" });

  const total    = leaves.length;
  const approved = leaves.filter((l) => l.status === "Approved").length;
  const pending  = leaves.filter((l) => l.status === "Pending").length;
  const rejected = leaves.filter((l) => l.status === "Rejected").length;

  const kpis = [
    { label: "Total Requests", value: total,    color: COLORS.primary, bg: COLORS.primaryMuted, icon: <Users     size={ICON_SIZE.lg} color={COLORS.primary} /> },
    { label: "Approved",       value: approved, color: COLORS.success, bg: COLORS.successLight, icon: <CheckCircle size={ICON_SIZE.lg} color={COLORS.success} /> },
    { label: "Pending",        value: pending,  color: COLORS.warning, bg: COLORS.warningLight, icon: <Clock     size={ICON_SIZE.lg} color={COLORS.warning} /> },
    { label: "Rejected",       value: rejected, color: COLORS.danger,  bg: COLORS.dangerMuted,  icon: <XCircle   size={ICON_SIZE.lg} color={COLORS.danger}  /> },
  ];

  const filtered = leaves.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || (l.employee || "").toLowerCase().includes(q) || (l.leaveType || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchType   = typeFilter   === "All" || l.leaveType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleApprove = (id) => setLeaves((prev) => prev.map((l) => l._id === id ? { ...l, status: "Approved" } : l));
  const handleReject  = (id) => setLeaves((prev) => prev.map((l) => l._id === id ? { ...l, status: "Rejected" } : l));

  const handleApply = () => {
    if (!form.employee.trim() || !form.fromDate || !form.toDate) return;
    const from = new Date(form.fromDate), to = new Date(form.toDate);
    const days = Math.max(1, Math.round((to - from) / 86400000) + 1);
    setLeaves((prev) => [{ _id: `lv${Date.now()}`, ...form, days, status: "Pending" }, ...prev]);
    setForm({ employee: "", leaveType: "Casual Leave", fromDate: "", toDate: "", reason: "" });
    setShowApply(false);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg,
    padding: PADDING.input, fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base, background: surface.inputBg,
    color: surface.text, outline: "none",
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[5], flexWrap: "wrap", gap: GAP.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Leave Management</h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: surface.subtext }}>Track and manage employee leave requests</p>
        </div>
        <button
          onClick={() => setShowApply(true)}
          style={{
            display: "flex", alignItems: "center", gap: GAP.xs,
            background: COLORS.primary, color: COLORS.white,
            border: "none", borderRadius: RADIUS.lg,
            padding: PADDING.btn, fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer",
          }}
        >
          <Plus size={ICON_SIZE.sm} /> Apply Leave
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {kpis.map((k) => (
          <div key={k.label} style={{
            background: surface.cardBg, borderRadius: RADIUS["2xl"],
            border: `1px solid ${surface.border}`, boxShadow: SHADOW.card,
            padding: `${SPACING[4]}px ${SPACING[5]}px`,
            display: "flex", alignItems: "center", gap: GAP.md,
          }}>
            <div style={{
              width: LAYOUT.iconBoxLg, height: LAYOUT.iconBoxLg,
              borderRadius: RADIUS.xl, background: k.bg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>{k.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{k.label}</p>
              <p style={{ margin: `2px 0 0`, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: k.color, lineHeight: 1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Leave Balance ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {LEAVE_BALANCE.map((b) => {
          const remaining = b.total - b.used;
          const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
          return (
            <div key={b.label} style={{
              background: surface.cardBg, borderRadius: RADIUS["2xl"],
              border: `1px solid ${surface.border}`, boxShadow: SHADOW.card,
              padding: SPACING[4],
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: GAP.sm }}>
                <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{b.label}</span>
                <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{remaining}/{b.total} left</span>
              </div>
              <div style={{ height: 6, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: b.color, borderRadius: RADIUS.full, transition: "width 0.4s" }} />
              </div>
              <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.xs, color: b.color, fontWeight: FONT_WEIGHT.semibold }}>{b.used} days used</p>
            </div>
          );
        })}
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: GAP.md, padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}`, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} color={COLORS.gray400} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
            <input
              placeholder="Search employee or leave type…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, paddingLeft: SPACING[8] }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ ...inputStyle, width: 140, cursor: "pointer" }}>
            {["All", "Approved", "Pending", "Rejected"].map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            style={{ ...inputStyle, width: 160, cursor: "pointer" }}>
            {["All", "Sick Leave", "Casual Leave", "Annual Leave", "Earned Leave"].map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
          </select>
          <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400, marginLeft: "auto" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr style={{ background: surface.theadBg, borderBottom: `2px solid ${surface.border}` }}>
                {["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: PADDING.tableHeader, textAlign: "left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.gray700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: `${SPACING[10]}px`, color: COLORS.gray400, fontSize: FONT_SIZE.md }}>No leave requests found</td></tr>
              ) : paginated.map((leave) => {
                const av    = getAvatarColor(leave.employee);
                const st    = STATUS_COLORS[leave.status] || STATUS_COLORS.Pending;
                const lt    = LEAVE_TYPE_COLORS[leave.leaveType] || { bg: COLORS.gray50, text: COLORS.gray700 };
                return (
                  <tr key={leave._id} style={{ borderBottom: `1px solid ${surface.border}`, transition: TRANSITION.fast }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>

                    {/* Employee */}
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ width: 36, height: 36, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                          {leave.employee?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{leave.employee}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: lt.bg, color: lt.text }}>
                        {leave.leaveType}
                      </span>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, whiteSpace: "nowrap" }}>{leave.fromDate}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, whiteSpace: "nowrap" }}>{leave.toDate}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{leave.days}d</td>

                    {/* Reason */}
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leave.reason}</td>

                    {/* Status */}
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: st.bg, color: st.text }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                        {leave.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", gap: GAP.xs }}>
                        <button onClick={() => setViewLeave(leave)} title="View" style={{ width: 30, height: 30, borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.inputBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary }}>
                          <Eye size={14} />
                        </button>
                        {leave.status === "Pending" && (
                          <>
                            <button onClick={() => handleApprove(leave._id)} title="Approve" style={{ width: 30, height: 30, borderRadius: RADIUS.md, border: "none", background: COLORS.successLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.success }}>
                              <Check size={14} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => handleReject(leave._id)} title="Reject" style={{ width: 30, height: 30, borderRadius: RADIUS.md, border: "none", background: COLORS.dangerMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.danger }}>
                              <X size={14} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
            <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400 }}>
              {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: GAP.xs }}>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.cardBg, cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? COLORS.gray400 : COLORS.gray700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: p === currentPage ? "none" : `1px solid ${surface.border}`, background: p === currentPage ? COLORS.primary : surface.cardBg, color: p === currentPage ? COLORS.white : COLORS.gray700, fontWeight: p === currentPage ? FONT_WEIGHT.bold : FONT_WEIGHT.normal, fontSize: FONT_SIZE.base, cursor: "pointer" }}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.cardBg, cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? COLORS.gray400 : COLORS.gray700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Apply Leave Modal ── */}
      {showApply && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: Z_INDEX.modal, display: "flex", alignItems: "center", justifyContent: "center", padding: SPACING[5] }}
          onClick={(e) => e.target === e.currentTarget && setShowApply(false)}>
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["3xl"], width: "100%", maxWidth: 480, boxShadow: SHADOW.modal, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: PADDING.card, borderBottom: `1px solid ${surface.border}` }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Apply Leave</h2>
              <button onClick={() => setShowApply(false)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, display: "flex" }}><X size={ICON_SIZE.md} /></button>
            </div>
            <div style={{ padding: SPACING[5], display: "flex", flexDirection: "column", gap: GAP.md }}>
              {[
                { label: "Employee Name *", key: "employee", type: "text", placeholder: "Your name" },
                { label: "From Date *",     key: "fromDate", type: "date" },
                { label: "To Date *",       key: "toDate",   type: "date" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, marginBottom: GAP.xs }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, marginBottom: GAP.xs }}>Leave Type</label>
                <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["Sick Leave", "Casual Leave", "Annual Leave", "Earned Leave"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, marginBottom: GAP.xs }}>Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Reason for leave…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: GAP.sm, padding: `${GAP.lg}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
              <button onClick={() => setShowApply(false)} style={{ padding: PADDING.btn, background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleApply} style={{ padding: PADDING.btn, background: COLORS.primary, border: "none", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.white, cursor: "pointer" }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Leave Modal ── */}
      {viewLeave && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: Z_INDEX.modal, display: "flex", alignItems: "center", justifyContent: "center", padding: SPACING[5] }}
          onClick={(e) => e.target === e.currentTarget && setViewLeave(null)}>
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["3xl"], width: "100%", maxWidth: 460, boxShadow: SHADOW.modal, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: PADDING.card, borderBottom: `1px solid ${surface.border}` }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Leave Details</h2>
              <button onClick={() => setViewLeave(null)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, display: "flex" }}><X size={ICON_SIZE.md} /></button>
            </div>
            <div style={{ padding: SPACING[5], display: "flex", flexDirection: "column", gap: GAP.md }}>
              {[
                ["Employee",   viewLeave.employee],
                ["Leave Type", viewLeave.leaveType],
                ["From",       viewLeave.fromDate],
                ["To",         viewLeave.toDate],
                ["Days",       `${viewLeave.days} day${viewLeave.days !== 1 ? "s" : ""}`],
                ["Reason",     viewLeave.reason],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${surface.border}`, paddingBottom: GAP.sm }}>
                  <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext }}>{label}</span>
                  <span style={{ fontSize: FONT_SIZE.base, color: surface.text }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext }}>Status</span>
                {(() => { const st = STATUS_COLORS[viewLeave.status] || STATUS_COLORS.Pending; return (
                  <span style={{ padding: "4px 12px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: st.bg, color: st.text }}>{viewLeave.status}</span>
                ); })()}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: `${GAP.lg}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
              <button onClick={() => setViewLeave(null)} style={{ padding: PADDING.btn, background: COLORS.primary, border: "none", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.white, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leave;
