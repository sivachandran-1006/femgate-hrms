import { useState } from "react";
import {
  Briefcase, Users, CalendarCheck, CheckCircle,
  Search, Eye, Plus, X, ChevronDown, ChevronLeft,
  ChevronRight, MapPin, Clock, TrendingUp, Star,
  ArrowUpRight, MoreHorizontal,
} from "lucide-react";

import { COLORS }                              from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }       from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE, TRANSITION, Z_INDEX } from "../../theme/sizes";
import { getAvatarColor }                      from "../../utils/helpers";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_JOBS = [
  { id: 1,  title: "Software Engineer",       department: "IT",         location: "Chennai",   type: "Full-time", postedDate: "2026-05-01", applications: 12, status: "Open",   priority: "High"   },
  { id: 2,  title: "HR Manager",              department: "HR",         location: "Remote",    type: "Full-time", postedDate: "2026-04-20", applications: 8,  status: "Open",   priority: "Medium" },
  { id: 3,  title: "Finance Analyst",         department: "Finance",    location: "Chennai",   type: "Full-time", postedDate: "2026-04-15", applications: 5,  status: "Closed", priority: "Low"    },
  { id: 4,  title: "DevOps Engineer",         department: "IT",         location: "Hybrid",    type: "Full-time", postedDate: "2026-05-10", applications: 9,  status: "Open",   priority: "High"   },
  { id: 5,  title: "UI/UX Designer",          department: "IT",         location: "Remote",    type: "Contract",  postedDate: "2026-05-12", applications: 7,  status: "Open",   priority: "Medium" },
  { id: 6,  title: "Recruiter",               department: "HR",         location: "Chennai",   type: "Full-time", postedDate: "2026-04-28", applications: 4,  status: "Closed", priority: "Low"    },
  { id: 7,  title: "Product Manager",         department: "Management", location: "Hybrid",    type: "Full-time", postedDate: "2026-05-15", applications: 15, status: "Open",   priority: "High"   },
  { id: 8,  title: "Backend Developer",       department: "IT",         location: "Chennai",   type: "Full-time", postedDate: "2026-05-18", applications: 11, status: "Open",   priority: "High"   },
];

const MOCK_CANDIDATES = [
  { id: 1, name: "Aisha Patel",      initials: "AP", position: "Software Engineer",  appliedDate: "2026-05-03", status: "Applied",    rating: 4, experience: "3 yrs" },
  { id: 2, name: "Marcus Johnson",   initials: "MJ", position: "HR Manager",         appliedDate: "2026-04-22", status: "Screening",  rating: 4, experience: "6 yrs" },
  { id: 3, name: "Priya Nair",       initials: "PN", position: "Finance Analyst",    appliedDate: "2026-04-18", status: "Interview",  rating: 5, experience: "4 yrs" },
  { id: 4, name: "Liam O'Brien",     initials: "LO", position: "DevOps Engineer",    appliedDate: "2026-05-12", status: "Selected",   rating: 5, experience: "5 yrs" },
  { id: 5, name: "Fatima Al-Hassan", initials: "FA", position: "UI/UX Designer",     appliedDate: "2026-05-14", status: "Applied",    rating: 3, experience: "2 yrs" },
  { id: 6, name: "Carlos Rivera",    initials: "CR", position: "Software Engineer",  appliedDate: "2026-05-05", status: "Rejected",   rating: 2, experience: "1 yr"  },
  { id: 7, name: "Yuki Tanaka",      initials: "YT", position: "Recruiter",          appliedDate: "2026-04-30", status: "On Hold",    rating: 3, experience: "3 yrs" },
  { id: 8, name: "Daniela Ferreira", initials: "DF", position: "HR Manager",         appliedDate: "2026-04-25", status: "Screening",  rating: 4, experience: "5 yrs" },
  { id: 9, name: "Arjun Mehta",      initials: "AM", position: "Product Manager",    appliedDate: "2026-05-16", status: "Interview",  rating: 5, experience: "7 yrs" },
  { id: 10,name: "Sofia Rossi",      initials: "SR", position: "Backend Developer",  appliedDate: "2026-05-19", status: "Applied",    rating: 4, experience: "4 yrs" },
];

const PIPELINE_STAGES = [
  { key: "Applied",   label: "Applied",   color: COLORS.primary, bg: COLORS.primaryMuted },
  { key: "Screening", label: "Screening", color: COLORS.info,    bg: COLORS.infoLight    },
  { key: "Interview", label: "Interview", color: COLORS.warning, bg: COLORS.warningLight },
  { key: "Selected",  label: "Selected",  color: COLORS.success, bg: COLORS.successLight },
  { key: "Rejected",  label: "Rejected",  color: COLORS.danger,  bg: COLORS.dangerMuted  },
  { key: "On Hold",   label: "On Hold",   color: COLORS.gray700, bg: COLORS.gray50       },
];

const STATUS_STYLE = {
  Applied:   { bg: COLORS.primaryMuted, text: COLORS.primary },
  Screening: { bg: COLORS.infoLight,    text: COLORS.info    },
  Interview: { bg: COLORS.warningLight, text: COLORS.warning },
  Selected:  { bg: COLORS.successLight, text: COLORS.success },
  Rejected:  { bg: COLORS.dangerMuted,  text: COLORS.danger  },
  "On Hold": { bg: COLORS.gray50,       text: COLORS.gray700 },
};

const PRIORITY_STYLE = {
  High:   { bg: COLORS.dangerMuted,  text: COLORS.danger,  dot: COLORS.danger  },
  Medium: { bg: COLORS.warningLight, text: COLORS.warning, dot: COLORS.warning },
  Low:    { bg: COLORS.successLight, text: COLORS.success, dot: COLORS.success },
};

const DEPT_COLORS = {
  IT:         { bg: COLORS.primaryMuted,  text: COLORS.primary },
  HR:         { bg: COLORS.purpleMuted,   text: COLORS.purple  },
  Finance:    { bg: COLORS.successLight,  text: COLORS.success },
  Management: { bg: COLORS.warningLight,  text: COLORS.warning },
};

const ROWS_PER_PAGE = 5;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Recruitment({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab]       = useState("overview");
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [currentPage, setCurrentPage]   = useState(1);
  const [viewJob, setViewJob]           = useState(null);
  const [viewCandidate, setViewCandidate] = useState(null);
  const [showPostJob, setShowPostJob]   = useState(false);

  // ── Derived stats ──
  const openJobs        = MOCK_JOBS.filter((j) => j.status === "Open").length;
  const totalApps       = MOCK_JOBS.reduce((s, j) => s + j.applications, 0);
  const interviewCount  = MOCK_CANDIDATES.filter((c) => c.status === "Interview").length;
  const selectedCount   = MOCK_CANDIDATES.filter((c) => c.status === "Selected").length;

  const kpis = [
    { label: "Open Positions",       value: openJobs,       icon: <Briefcase   size={ICON_SIZE.lg} color={COLORS.primary} />, color: COLORS.primary, bg: COLORS.primaryMuted, trend: "+2 this week"  },
    { label: "Total Applications",   value: totalApps,      icon: <Users       size={ICON_SIZE.lg} color={COLORS.purple}  />, color: COLORS.purple,  bg: COLORS.purpleMuted,  trend: "+12 this week" },
    { label: "Interviews Scheduled", value: interviewCount, icon: <CalendarCheck size={ICON_SIZE.lg} color={COLORS.warning} />, color: COLORS.warning, bg: COLORS.warningLight, trend: "3 today"       },
    { label: "Offers Made",          value: selectedCount,  icon: <CheckCircle size={ICON_SIZE.lg} color={COLORS.success} />, color: COLORS.success, bg: COLORS.successLight, trend: "+1 this week"  },
  ];

  // ── Filtered candidates ──
  const filteredCandidates = MOCK_CANDIDATES.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.position.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / ROWS_PER_PAGE));
  const paginated  = filteredCandidates.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // ── Filtered jobs ──
  const filteredJobs = MOCK_JOBS.filter((j) =>
    deptFilter === "All" || j.department === deptFilter
  );

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg,
    padding: PADDING.input, fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base, background: surface.inputBg,
    color: surface.text, outline: "none",
  };

  const TABS = ["overview", "jobs", "pipeline", "candidates"];

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[5], flexWrap: "wrap", gap: GAP.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Recruitment & ATS</h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: surface.subtext }}>Manage job openings, track applicants, and streamline your hiring pipeline</p>
        </div>
        <button
          onClick={() => setShowPostJob(true)}
          style={{ display: "flex", alignItems: "center", gap: GAP.xs, background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: PADDING.btn, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}
        >
          <Plus size={ICON_SIZE.sm} /> Post Job
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px ${SPACING[5]}px`, display: "flex", alignItems: "center", gap: GAP.md }}>
            <div style={{ width: LAYOUT.iconBoxLg, height: LAYOUT.iconBoxLg, borderRadius: RADIUS.xl, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{k.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{k.label}</p>
              <p style={{ margin: `2px 0 2px`, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1 }}>{k.value}</p>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: COLORS.success, fontWeight: FONT_WEIGHT.medium, display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUp size={10} /> {k.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: GAP.xs, marginBottom: SPACING[5], background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: GAP.xs, width: "fit-content" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: `${GAP.sm}px ${SPACING[4]}px`,
            borderRadius: RADIUS.md, border: "none", cursor: "pointer",
            fontSize: FONT_SIZE.base, fontWeight: activeTab === t ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
            fontFamily: FONT_FAMILY.base, textTransform: "capitalize",
            background: activeTab === t ? COLORS.primary : "transparent",
            color: activeTab === t ? COLORS.white : surface.subtext,
            transition: TRANSITION.fast,
          }}>{t === "pipeline" ? "Pipeline" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: GAP.lg }}>

          {/* Open Jobs Summary */}
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Active Job Openings</h3>
                <p style={{ margin: `2px 0 0`, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{openJobs} open positions</p>
              </div>
              <button onClick={() => setActiveTab("jobs")} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: FONT_SIZE.sm, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium }}>
                View all <ArrowUpRight size={14} />
              </button>
            </div>
            <div>
              {MOCK_JOBS.filter((j) => j.status === "Open").slice(0, 5).map((job, i, arr) => {
                const dept   = DEPT_COLORS[job.department] || { bg: COLORS.gray50, text: COLORS.gray700 };
                const prio   = PRIORITY_STYLE[job.priority] || PRIORITY_STYLE.Medium;
                return (
                  <div key={job.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px ${SPACING[5]}px`, borderBottom: i < arr.length - 1 ? `1px solid ${surface.border}` : "none", gap: GAP.md }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: RADIUS.md, background: dept.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Briefcase size={16} color={dept.text} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</p>
                        <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={10} /> {job.location} &nbsp;·&nbsp; <Clock size={10} /> {job.type}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, flexShrink: 0 }}>
                      <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, display: "flex", alignItems: "center", gap: 3 }}>
                        <Users size={12} /> {job.applications}
                      </span>
                      <span style={{ padding: "2px 8px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: prio.bg, color: prio.text }}>
                        {job.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline Funnel */}
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px ${SPACING[5]}px` }}>
            <h3 style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Hiring Pipeline</h3>
            {PIPELINE_STAGES.filter((s) => s.key !== "On Hold").map((stage) => {
              const count = MOCK_CANDIDATES.filter((c) => c.status === stage.key).length;
              const pct   = Math.round((count / MOCK_CANDIDATES.length) * 100);
              return (
                <div key={stage.key} style={{ marginBottom: SPACING[3] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{stage.label}</span>
                    <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext }}>{count} <span style={{ color: COLORS.gray400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: stage.color, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: SPACING[5], paddingTop: SPACING[4], borderTop: `1px solid ${surface.border}` }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>RECENT ACTIVITY</p>
              {[
                { text: "Liam O'Brien selected for DevOps",    time: "2h ago",  color: COLORS.success },
                { text: "Priya Nair interview scheduled",       time: "5h ago",  color: COLORS.warning },
                { text: "3 new applications for SE role",       time: "1d ago",  color: COLORS.primary },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: GAP.sm, marginTop: GAP.md }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: FONT_SIZE.sm, color: surface.text, flex: 1 }}>{item.text}</span>
                  <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray400, whiteSpace: "nowrap" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: JOBS
      ══════════════════════════════════════════════ */}
      {activeTab === "jobs" && (
        <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: GAP.md, padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}`, flexWrap: "wrap", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, flex: 1 }}>All Job Openings <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal, color: surface.subtext }}>({MOCK_JOBS.length} positions)</span></h3>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              style={{ ...inputStyle, width: 160, cursor: "pointer" }}>
              {["All", "IT", "HR", "Finance", "Management"].map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
            </select>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr style={{ background: surface.theadBg, borderBottom: `2px solid ${surface.border}` }}>
                {["Job Title", "Department", "Location", "Type", "Posted", "Applications", "Priority", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: PADDING.tableHeader, textAlign: "left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.gray700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const dept = DEPT_COLORS[job.department] || { bg: COLORS.gray50, text: COLORS.gray700 };
                const prio = PRIORITY_STYLE[job.priority] || PRIORITY_STYLE.Medium;
                return (
                  <tr key={job.id} style={{ borderBottom: `1px solid ${surface.border}`, transition: TRANSITION.fast }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ width: 32, height: 32, borderRadius: RADIUS.md, background: dept.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Briefcase size={14} color={dept.text} />
                        </div>
                        <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{job.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: dept.bg, color: dept.text }}>{job.department}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{job.location}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext }}>{job.type}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, whiteSpace: "nowrap" }}>{job.postedDate}</td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}><Users size={14} color={surface.subtext} />{job.applications}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: prio.bg, color: prio.text }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: prio.dot }} />{job.priority}
                      </span>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ padding: "4px 12px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: job.status === "Open" ? COLORS.successLight : COLORS.dangerMuted, color: job.status === "Open" ? COLORS.success : COLORS.danger }}>{job.status}</span>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <button onClick={() => setViewJob(job)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.inputBg, color: COLORS.primary, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PIPELINE (Kanban)
      ══════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <div style={{ display: "flex", gap: GAP.md, overflowX: "auto", paddingBottom: SPACING[2] }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = MOCK_CANDIDATES.filter((c) => c.status === stage.key);
            return (
              <div key={stage.key} style={{ minWidth: 220, flex: "0 0 220px" }}>
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: GAP.md, padding: `${GAP.sm}px ${GAP.md}px`, background: stage.bg, borderRadius: RADIUS.lg }}>
                  <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: stage.color }}>{stage.label}</span>
                  <span style={{ width: 22, height: 22, borderRadius: RADIUS.full, background: stage.color, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold }}>{stageCandidates.length}</span>
                </div>
                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: GAP.sm }}>
                  {stageCandidates.map((c) => {
                    const av = getAvatarColor(c.name);
                    return (
                      <div key={c.id}
                        onClick={() => setViewCandidate(c)}
                        style={{ background: surface.cardBg, borderRadius: RADIUS.xl, border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: SPACING[4], cursor: "pointer", transition: TRANSITION.fast }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = SHADOW.modal)}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW.card)}>
                        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, marginBottom: GAP.sm }}>
                          <div style={{ width: 34, height: 34, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                            {c.initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.position}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{c.experience}</span>
                          <div style={{ display: "flex", gap: 1 }}>
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={10} fill={s <= c.rating ? COLORS.warning : "none"} color={s <= c.rating ? COLORS.warning : surface.border} />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stageCandidates.length === 0 && (
                    <div style={{ padding: SPACING[5], textAlign: "center", color: COLORS.gray400, fontSize: FONT_SIZE.sm, border: `2px dashed ${surface.border}`, borderRadius: RADIUS.lg }}>No candidates</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: CANDIDATES
      ══════════════════════════════════════════════ */}
      {activeTab === "candidates" && (
        <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: GAP.md, padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}`, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={15} color={COLORS.gray400} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
              <input placeholder="Search candidates…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingLeft: SPACING[8] }} />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 150, cursor: "pointer" }}>
              {["All", "Applied", "Screening", "Interview", "Selected", "Rejected", "On Hold"].map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Stages" : s}</option>
              ))}
            </select>
            <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400, marginLeft: "auto" }}>{filteredCandidates.length} candidates</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr style={{ background: surface.theadBg, borderBottom: `2px solid ${surface.border}` }}>
                {["Candidate", "Position", "Applied", "Rating", "Stage", "Action"].map((h) => (
                  <th key={h} style={{ padding: PADDING.tableHeader, textAlign: "left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.gray700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: `${SPACING[10]}px`, color: COLORS.gray400, fontSize: FONT_SIZE.md }}>No candidates found</td></tr>
              ) : paginated.map((c) => {
                const av = getAvatarColor(c.name);
                const st = STATUS_STYLE[c.status] || STATUS_STYLE.Applied;
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${surface.border}`, transition: TRANSITION.fast }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ width: 36, height: 36, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>{c.initials}</div>
                        <div>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{c.name}</p>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{c.experience} experience</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext }}>{c.position}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.base, color: surface.subtext, whiteSpace: "nowrap" }}>{c.appliedDate}</td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1,2,3,4,5].map((s) => <Star key={s} size={13} fill={s <= c.rating ? COLORS.warning : "none"} color={s <= c.rating ? COLORS.warning : surface.border} />)}
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: st.bg, color: st.text }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.text }} />{c.status}
                      </span>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <button onClick={() => setViewCandidate(c)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: RADIUS.md, border: `1px solid ${surface.border}`, background: surface.inputBg, color: COLORS.primary, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING[3]}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
              <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400 }}>{(currentPage-1)*ROWS_PER_PAGE+1}–{Math.min(currentPage*ROWS_PER_PAGE, filteredCandidates.length)} of {filteredCandidates.length}</span>
              <div style={{ display: "flex", gap: GAP.xs }}>
                <button onClick={() => setCurrentPage((p) => Math.max(p-1,1))} disabled={currentPage===1} style={{ width:32, height:32, borderRadius:RADIUS.md, border:`1px solid ${surface.border}`, background:surface.cardBg, cursor:currentPage===1?"not-allowed":"pointer", color:currentPage===1?COLORS.gray400:COLORS.gray700, display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronLeft size={15}/></button>
                {Array.from({length:totalPages},(_,i)=>i+1).map((p)=>(
                  <button key={p} onClick={()=>setCurrentPage(p)} style={{ width:32, height:32, borderRadius:RADIUS.md, border:p===currentPage?"none":`1px solid ${surface.border}`, background:p===currentPage?COLORS.primary:surface.cardBg, color:p===currentPage?COLORS.white:COLORS.gray700, fontWeight:p===currentPage?FONT_WEIGHT.bold:FONT_WEIGHT.normal, fontSize:FONT_SIZE.base, cursor:"pointer" }}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} style={{ width:32, height:32, borderRadius:RADIUS.md, border:`1px solid ${surface.border}`, background:surface.cardBg, cursor:currentPage===totalPages?"not-allowed":"pointer", color:currentPage===totalPages?COLORS.gray400:COLORS.gray700, display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronRight size={15}/></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Job Detail Modal ── */}
      {viewJob && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:Z_INDEX.modal, display:"flex", alignItems:"center", justifyContent:"center", padding:SPACING[5] }}
          onClick={(e) => e.target===e.currentTarget && setViewJob(null)}>
          <div style={{ background:surface.cardBg, borderRadius:RADIUS["3xl"], width:"100%", maxWidth:500, boxShadow:SHADOW.modal, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:PADDING.card, borderBottom:`1px solid ${surface.border}` }}>
              <h2 style={{ margin:0, fontSize:FONT_SIZE.lg, fontWeight:FONT_WEIGHT.bold, color:surface.text }}>{viewJob.title}</h2>
              <button onClick={()=>setViewJob(null)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.gray400, display:"flex" }}><X size={ICON_SIZE.md}/></button>
            </div>
            <div style={{ padding:SPACING[5], display:"flex", flexDirection:"column", gap:GAP.md }}>
              {[["Department",viewJob.department],["Location",viewJob.location],["Type",viewJob.type],["Posted",viewJob.postedDate],["Applications",viewJob.applications],["Priority",viewJob.priority],["Status",viewJob.status]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${surface.border}`, paddingBottom:GAP.sm }}>
                  <span style={{ fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext }}>{l}</span>
                  <span style={{ fontSize:FONT_SIZE.base, color:surface.text }}>{String(v)}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:GAP.sm, padding:`${GAP.lg}px ${SPACING[5]}px`, borderTop:`1px solid ${surface.border}` }}>
              <button onClick={()=>setViewJob(null)} style={{ padding:PADDING.btn, background:COLORS.primary, border:"none", borderRadius:RADIUS.lg, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.semibold, color:COLORS.white, cursor:"pointer", fontFamily:FONT_FAMILY.base }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Candidate Detail Modal ── */}
      {viewCandidate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:Z_INDEX.modal, display:"flex", alignItems:"center", justifyContent:"center", padding:SPACING[5] }}
          onClick={(e) => e.target===e.currentTarget && setViewCandidate(null)}>
          <div style={{ background:surface.cardBg, borderRadius:RADIUS["3xl"], width:"100%", maxWidth:440, boxShadow:SHADOW.modal, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:PADDING.card, borderBottom:`1px solid ${surface.border}` }}>
              <h2 style={{ margin:0, fontSize:FONT_SIZE.lg, fontWeight:FONT_WEIGHT.bold, color:surface.text }}>Candidate Profile</h2>
              <button onClick={()=>setViewCandidate(null)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.gray400, display:"flex" }}><X size={ICON_SIZE.md}/></button>
            </div>
            <div style={{ padding:SPACING[5] }}>
              {(() => { const av = getAvatarColor(viewCandidate.name); return (
                <div style={{ display:"flex", alignItems:"center", gap:GAP.lg, marginBottom:SPACING[5], padding:SPACING[4], background:surface.inputBg, borderRadius:RADIUS.xl }}>
                  <div style={{ width:56, height:56, borderRadius:RADIUS.full, background:av.bg, color:av.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:FONT_SIZE.xl, fontWeight:FONT_WEIGHT.bold, flexShrink:0 }}>{viewCandidate.initials}</div>
                  <div>
                    <p style={{ margin:0, fontSize:FONT_SIZE.lg, fontWeight:FONT_WEIGHT.bold, color:surface.text }}>{viewCandidate.name}</p>
                    <p style={{ margin:0, fontSize:FONT_SIZE.sm, color:surface.subtext }}>{viewCandidate.position}</p>
                    <div style={{ display:"flex", gap:2, marginTop:4 }}>
                      {[1,2,3,4,5].map((s)=><Star key={s} size={12} fill={s<=viewCandidate.rating?COLORS.warning:"none"} color={s<=viewCandidate.rating?COLORS.warning:surface.border}/>)}
                    </div>
                  </div>
                </div>
              ); })()}
              <div style={{ display:"flex", flexDirection:"column", gap:GAP.md }}>
                {[["Experience",viewCandidate.experience],["Applied Date",viewCandidate.appliedDate],["Position",viewCandidate.position]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${surface.border}`, paddingBottom:GAP.sm }}>
                    <span style={{ fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext }}>{l}</span>
                    <span style={{ fontSize:FONT_SIZE.base, color:surface.text }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext }}>Stage</span>
                  {(() => { const st = STATUS_STYLE[viewCandidate.status]||STATUS_STYLE.Applied; return <span style={{ padding:"4px 12px", borderRadius:RADIUS.full, fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, background:st.bg, color:st.text }}>{viewCandidate.status}</span>; })()}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:GAP.sm, padding:`${GAP.lg}px ${SPACING[5]}px`, borderTop:`1px solid ${surface.border}` }}>
              <button onClick={()=>setViewCandidate(null)} style={{ padding:PADDING.btn, background:COLORS.primary, border:"none", borderRadius:RADIUS.lg, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.semibold, color:COLORS.white, cursor:"pointer", fontFamily:FONT_FAMILY.base }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post Job Modal ── */}
      {showPostJob && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:Z_INDEX.modal, display:"flex", alignItems:"center", justifyContent:"center", padding:SPACING[5] }}
          onClick={(e) => e.target===e.currentTarget && setShowPostJob(false)}>
          <div style={{ background:surface.cardBg, borderRadius:RADIUS["3xl"], width:"100%", maxWidth:480, boxShadow:SHADOW.modal, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:PADDING.card, borderBottom:`1px solid ${surface.border}` }}>
              <h2 style={{ margin:0, fontSize:FONT_SIZE.lg, fontWeight:FONT_WEIGHT.bold, color:surface.text }}>Post New Job</h2>
              <button onClick={()=>setShowPostJob(false)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.gray400, display:"flex" }}><X size={ICON_SIZE.md}/></button>
            </div>
            <div style={{ padding:SPACING[5], display:"flex", flexDirection:"column", gap:GAP.md }}>
              {[{label:"Job Title *",key:"title",type:"text",ph:"e.g. Software Engineer"},{label:"Department",key:"dept",type:"text",ph:"e.g. IT"},{label:"Location",key:"loc",type:"text",ph:"e.g. Chennai / Remote"},{label:"Job Type",key:"type",type:"text",ph:"Full-time / Contract"}].map(({label,key,type,ph})=>(
                <div key={key}>
                  <label style={{ display:"block", fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.medium, color:surface.subtext, marginBottom:GAP.xs }}>{label}</label>
                  <input type={type} placeholder={ph} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:GAP.sm, padding:`${GAP.lg}px ${SPACING[5]}px`, borderTop:`1px solid ${surface.border}` }}>
              <button onClick={()=>setShowPostJob(false)} style={{ padding:PADDING.btn, background:"transparent", border:`1px solid ${surface.border}`, borderRadius:RADIUS.lg, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.medium, color:surface.subtext, cursor:"pointer", fontFamily:FONT_FAMILY.base }}>Cancel</button>
              <button onClick={()=>setShowPostJob(false)} style={{ padding:PADDING.btn, background:COLORS.primary, border:"none", borderRadius:RADIUS.lg, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.semibold, color:COLORS.white, cursor:"pointer", fontFamily:FONT_FAMILY.base }}>Post Job</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
