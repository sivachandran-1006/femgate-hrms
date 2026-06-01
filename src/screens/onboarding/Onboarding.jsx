import { useState } from "react";
import {
  UserPlus, Users, CheckSquare, Clock, TrendingUp,
  FileText, Monitor, Mail, BookOpen, Shield, Calendar,
  ChevronRight, Check, X, Plus, MapPin, Briefcase,
  ArrowUpRight, ChevronDown, ChevronUp,
} from "lucide-react";

import { COLORS }                              from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }       from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE, TRANSITION, Z_INDEX } from "../../theme/sizes";
import { getAvatarColor }                      from "../../utils/helpers";

// ── Data ─────────────────────────────────────────────────────────────────────

const TASK_DEFS = [
  { key: "documentCollection", label: "Document Collection", icon: FileText,  color: COLORS.primary },
  { key: "itAssetSetup",       label: "IT Asset Setup",      icon: Monitor,   color: COLORS.purple  },
  { key: "emailCreation",      label: "Email Creation",      icon: Mail,      color: COLORS.info    },
  { key: "trainingAssignment", label: "Training Assignment", icon: BookOpen,  color: COLORS.warning },
  { key: "policyAcceptance",   label: "Policy Acceptance",   icon: Shield,    color: COLORS.success },
];

const MOCK_EMPLOYEES = [
  { id: 1, name: "Arjun Kumar",   department: "IT",         role: "Software Engineer",    joiningDate: "2026-06-03", mentor: "Siva",      tasks: { documentCollection: true,  itAssetSetup: true,  emailCreation: true,  trainingAssignment: false, policyAcceptance: false } },
  { id: 2, name: "Priya Sharma",  department: "HR",         role: "HR Executive",          joiningDate: "2026-06-05", mentor: "Big Kundi", tasks: { documentCollection: true,  itAssetSetup: true,  emailCreation: false, trainingAssignment: false, policyAcceptance: false } },
  { id: 3, name: "Karthik Raj",   department: "Finance",    role: "Finance Analyst",       joiningDate: "2026-06-10", mentor: "Safeer",    tasks: { documentCollection: true,  itAssetSetup: false, emailCreation: false, trainingAssignment: false, policyAcceptance: false } },
  { id: 4, name: "Divya Nair",    department: "IT",         role: "Frontend Developer",    joiningDate: "2026-05-28", mentor: "Siva",      tasks: { documentCollection: true,  itAssetSetup: true,  emailCreation: true,  trainingAssignment: true,  policyAcceptance: true  } },
];

const UPCOMING_JOINERS = [
  { id: 1, name: "Rohit Menon",   department: "Marketing",  role: "Marketing Analyst",   joiningDate: "2026-06-12", offerAccepted: true  },
  { id: 2, name: "Sneha Pillai",  department: "Operations", role: "Operations Manager",  joiningDate: "2026-06-15", offerAccepted: true  },
  { id: 3, name: "Arun Nair",     department: "IT",         role: "DevOps Engineer",     joiningDate: "2026-06-20", offerAccepted: false },
  { id: 4, name: "Meera Krishnan",department: "Finance",    role: "Senior Accountant",   joiningDate: "2026-06-25", offerAccepted: true  },
];

const DEPT_COLORS = {
  IT:         { bg: COLORS.primaryMuted,  text: COLORS.primary },
  HR:         { bg: COLORS.purpleMuted,   text: COLORS.purple  },
  Finance:    { bg: COLORS.successLight,  text: COLORS.success },
  Management: { bg: COLORS.warningLight,  text: COLORS.warning },
  Marketing:  { bg: COLORS.infoLight,     text: COLORS.info    },
  Operations: { bg: COLORS.orangeLight,   text: COLORS.orange  },
};

const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
const getProgress = (tasks) => {
  const v = Object.values(tasks);
  return Math.round((v.filter(Boolean).length / v.length) * 100);
};
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const daysFrom = (dateStr) => Math.ceil((new Date(dateStr) - new Date("2026-06-01")) / 86400000);

// ── Component ─────────────────────────────────────────────────────────────────

const Onboarding = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab]     = useState("active");
  const [expanded, setExpanded]       = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState({ name: "", department: "", role: "", joiningDate: "", mentor: "" });

  const completedCount = MOCK_EMPLOYEES.filter((e) => getProgress(e.tasks) === 100).length;
  const pendingTasks   = MOCK_EMPLOYEES.reduce((s, e) => s + Object.values(e.tasks).filter((v) => !v).length, 0);
  const doneTasks      = MOCK_EMPLOYEES.reduce((s, e) => s + Object.values(e.tasks).filter(Boolean).length, 0);
  const avgProgress    = Math.round(MOCK_EMPLOYEES.reduce((s, e) => s + getProgress(e.tasks), 0) / MOCK_EMPLOYEES.length);

  const kpis = [
    { label: "Active Onboardings",   value: MOCK_EMPLOYEES.length, icon: Users,       color: COLORS.primary, bg: COLORS.primaryMuted, sub: `${completedCount} completed`     },
    { label: "Pending Tasks",        value: pendingTasks,           icon: Clock,       color: COLORS.warning, bg: COLORS.warningLight, sub: "across all joiners"              },
    { label: "Completed Tasks",      value: doneTasks,              icon: CheckSquare, color: COLORS.success, bg: COLORS.successLight, sub: `${doneTasks + pendingTasks} total`},
    { label: "Avg Completion Rate",  value: `${avgProgress}%`,      icon: TrendingUp,  color: COLORS.purple,  bg: COLORS.purpleMuted,  sub: "this onboarding cycle"           },
  ];

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
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Onboarding</h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: surface.subtext }}>Manage and track new joiner onboarding progress</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: GAP.xs, background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: PADDING.btn, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer" }}
        >
          <UserPlus size={ICON_SIZE.sm} /> Add New Joiner
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px ${SPACING[5]}px`, display: "flex", alignItems: "center", gap: GAP.md }}>
            <div style={{ width: LAYOUT.iconBoxLg, height: LAYOUT.iconBoxLg, borderRadius: RADIUS.xl, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <k.icon size={ICON_SIZE.lg} color={k.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{k.label}</p>
              <p style={{ margin: "2px 0 1px", fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1 }}>{k.value}</p>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: COLORS.gray400 }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: GAP.xs, marginBottom: SPACING[5], background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: GAP.xs, width: "fit-content" }}>
        {[
          { key: "active",   label: `Active (${MOCK_EMPLOYEES.length})`    },
          { key: "upcoming", label: `Upcoming (${UPCOMING_JOINERS.length})` },
          { key: "checklist",label: "Task Checklist"                        },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: `${GAP.sm}px ${SPACING[4]}px`, borderRadius: RADIUS.md, border: "none", cursor: "pointer",
            fontSize: FONT_SIZE.base, fontWeight: activeTab === key ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
            fontFamily: FONT_FAMILY.base,
            background: activeTab === key ? COLORS.primary : "transparent",
            color: activeTab === key ? COLORS.white : surface.subtext,
            transition: TRANSITION.fast,
          }}>{label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: ACTIVE ONBOARDINGS
      ══════════════════════════════════════════ */}
      {activeTab === "active" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: GAP.lg, alignItems: "start" }}>

          {/* Employee Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
            {MOCK_EMPLOYEES.map((emp) => {
              const progress  = getProgress(emp.tasks);
              const av        = getAvatarColor(emp.name);
              const dept      = DEPT_COLORS[emp.department] || { bg: COLORS.gray50, text: COLORS.gray700 };
              const completed = Object.values(emp.tasks).filter(Boolean).length;
              const isExpanded = expanded === emp.id;
              const isComplete = progress === 100;

              return (
                <div key={emp.id} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${isComplete ? COLORS.success + "40" : surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>

                  {/* Top strip for completed */}
                  {isComplete && <div style={{ height: 3, background: `linear-gradient(90deg,${COLORS.success},#34d399)` }} />}

                  <div style={{ padding: `${SPACING[4]}px ${SPACING[5]}px` }}>
                    {/* Row 1 — Avatar + Info + Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: GAP.md, marginBottom: SPACING[4] }}>
                      <div style={{ width: 48, height: 48, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                        {initials(emp.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, flexWrap: "wrap" }}>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{emp.name}</p>
                          <span style={{ padding: "2px 8px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: dept.bg, color: dept.text }}>{emp.department}</span>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>{emp.role}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: GAP.md, marginTop: 4 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                            <Calendar size={11} /> {fmtDate(emp.joiningDate)}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                            <Briefcase size={11} /> Mentor: {emp.mentor}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        padding: "4px 12px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, flexShrink: 0,
                        background: isComplete ? COLORS.successLight : COLORS.warningLight,
                        color:      isComplete ? COLORS.success       : COLORS.warning,
                      }}>
                        {isComplete ? "✓ Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: SPACING[4] }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{completed} of {TASK_DEFS.length} tasks done</span>
                        <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: isComplete ? COLORS.success : COLORS.primary }}>{progress}%</span>
                      </div>
                      <div style={{ height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: RADIUS.full, transition: "width 0.5s",
                          width: `${progress}%`,
                          background: isComplete
                            ? `linear-gradient(90deg,${COLORS.success},#34d399)`
                            : `linear-gradient(90deg,${COLORS.primary},${COLORS.info})`,
                        }} />
                      </div>
                    </div>

                    {/* Task Pills */}
                    <div style={{ display: "flex", gap: GAP.xs, flexWrap: "wrap", marginBottom: isExpanded ? SPACING[4] : 0 }}>
                      {TASK_DEFS.map(({ key, label, icon: Icon, color }) => {
                        const done = emp.tasks[key];
                        return (
                          <div key={key} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 10px", borderRadius: RADIUS.full,
                            background: done ? COLORS.successLight : surface.inputBg,
                            border: `1px solid ${done ? COLORS.success + "50" : surface.border}`,
                            fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium,
                            color: done ? COLORS.success : surface.subtext,
                          }}>
                            {done
                              ? <Check size={11} strokeWidth={2.5} />
                              : <Icon size={11} color={color} />
                            }
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : emp.id)}
                      style={{ display: "flex", alignItems: "center", gap: 4, marginTop: SPACING[3], background: "none", border: "none", cursor: "pointer", fontSize: FONT_SIZE.xs, color: COLORS.primary, fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium, padding: 0 }}
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {isExpanded ? "Show less" : "Show task details"}
                    </button>

                    {/* Expanded Task Detail */}
                    {isExpanded && (
                      <div style={{ marginTop: SPACING[3], borderTop: `1px solid ${surface.border}`, paddingTop: SPACING[4], display: "flex", flexDirection: "column", gap: GAP.sm }}>
                        {TASK_DEFS.map(({ key, label, icon: Icon, color }) => {
                          const done = emp.tasks[key];
                          return (
                            <div key={key} style={{
                              display: "flex", alignItems: "center", gap: GAP.md,
                              padding: `${GAP.sm}px ${GAP.md}px`,
                              borderRadius: RADIUS.lg,
                              background: done ? COLORS.successLight : surface.inputBg,
                              border: `1px solid ${done ? COLORS.success + "40" : surface.border}`,
                            }}>
                              <div style={{ width: 32, height: 32, borderRadius: RADIUS.md, background: done ? COLORS.success + "20" : surface.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon size={15} color={done ? COLORS.success : color} />
                              </div>
                              <span style={{ flex: 1, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: done ? COLORS.success : surface.text }}>{label}</span>
                              <div style={{ width: 22, height: 22, borderRadius: RADIUS.full, background: done ? COLORS.success : surface.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {done
                                  ? <Check size={12} color={COLORS.white} strokeWidth={2.5} />
                                  : <X size={10} color={COLORS.gray400} />
                                }
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>

            {/* Onboarding Summary */}
            <div style={{ background: `linear-gradient(135deg,${COLORS.primary},${COLORS.primaryHover})`, borderRadius: RADIUS["2xl"], padding: SPACING[5], color: COLORS.white }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.08em" }}>Summary</p>
              {[
                { label: "Active Onboardings",  value: MOCK_EMPLOYEES.length },
                { label: "Fully Completed",      value: completedCount        },
                { label: "In Progress",          value: MOCK_EMPLOYEES.length - completedCount },
                { label: "Pre-joining",          value: UPCOMING_JOINERS.length },
                { label: "Avg Completion",       value: `${avgProgress}%`     },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < arr.length - 1 ? GAP.sm : 0, marginBottom: i < arr.length - 1 ? GAP.sm : 0, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                  <span style={{ fontSize: FONT_SIZE.sm, opacity: 0.85 }}>{label}</span>
                  <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Upcoming Joiners preview */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}` }}>
                <h3 style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Upcoming Joiners</h3>
                <button onClick={() => setActiveTab("upcoming")} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: FONT_SIZE.xs, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium }}>
                  View all <ArrowUpRight size={12} />
                </button>
              </div>
              {UPCOMING_JOINERS.slice(0, 3).map((j, i, arr) => {
                const av   = getAvatarColor(j.name);
                const days = daysFrom(j.joiningDate);
                return (
                  <div key={j.id} style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: `${SPACING[3]}px ${SPACING[5]}px`, borderBottom: i < arr.length - 1 ? `1px solid ${surface.border}` : "none" }}>
                    <div style={{ width: 34, height: 34, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>{initials(j.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.name}</p>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{j.department}</p>
                    </div>
                    <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, padding: "2px 8px", borderRadius: RADIUS.full, background: days <= 7 ? COLORS.warningLight : COLORS.primaryMuted, color: days <= 7 ? COLORS.warning : COLORS.primary, whiteSpace: "nowrap" }}>{days}d</span>
                  </div>
                );
              })}
            </div>

            {/* Onboarding Timeline */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px ${SPACING[5]}px` }}>
              <h3 style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Onboarding Timeline</h3>
              {[
                { label: "Offer Accepted",          done: true,  color: COLORS.success  },
                { label: "Documents Submitted",      done: true,  color: COLORS.success  },
                { label: "IT Setup Complete",        done: true,  color: COLORS.success  },
                { label: "Training Assigned",        done: false, color: COLORS.warning  },
                { label: "Policy Sign-off",          done: false, color: COLORS.gray400  },
                { label: "Onboarding Complete",      done: false, color: COLORS.gray400  },
              ].map(({ label, done, color }, i, arr) => (
                <div key={label} style={{ display: "flex", gap: GAP.md, marginBottom: i < arr.length - 1 ? GAP.sm : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: RADIUS.full, background: done ? COLORS.success : surface.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {done ? <Check size={12} color={COLORS.white} strokeWidth={2.5} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
                    </div>
                    {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: done ? COLORS.success + "40" : surface.border, margin: "3px 0" }} />}
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.sm, color: done ? surface.text : COLORS.gray400, fontWeight: done ? FONT_WEIGHT.medium : FONT_WEIGHT.normal }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: UPCOMING JOINERS
      ══════════════════════════════════════════ */}
      {activeTab === "upcoming" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: GAP.lg }}>
          {UPCOMING_JOINERS.map((j) => {
            const av   = getAvatarColor(j.name);
            const dept = DEPT_COLORS[j.department] || { bg: COLORS.gray50, text: COLORS.gray700 };
            const days = daysFrom(j.joiningDate);
            return (
              <div key={j.id} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
                {/* Coloured top bar */}
                <div style={{ height: 4, background: j.offerAccepted ? `linear-gradient(90deg,${COLORS.success},#34d399)` : `linear-gradient(90deg,${COLORS.warning},${COLORS.orange})` }} />
                <div style={{ padding: SPACING[5] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.md, marginBottom: SPACING[4] }}>
                    <div style={{ width: 50, height: 50, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>{initials(j.name)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{j.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>{j.role}</p>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: j.offerAccepted ? COLORS.successLight : COLORS.warningLight, color: j.offerAccepted ? COLORS.success : COLORS.warning }}>
                      {j.offerAccepted ? "Offer Accepted" : "Pending"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.sm }}>
                    {[
                      { label: "Department", value: j.department, icon: <Briefcase size={13} color={dept.text} /> },
                      { label: "Joining",    value: fmtDate(j.joiningDate), icon: <Calendar size={13} color={COLORS.primary} /> },
                    ].map(({ label, value, icon }) => (
                      <div key={label} style={{ padding: `${GAP.sm}px ${GAP.md}px`, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>{icon}<span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{label}</span></div>
                        <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: GAP.md, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>Joining in</span>
                    <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, padding: "3px 12px", borderRadius: RADIUS.full, background: days <= 7 ? COLORS.warningLight : days <= 14 ? COLORS.primaryMuted : COLORS.successLight, color: days <= 7 ? COLORS.warning : days <= 14 ? COLORS.primary : COLORS.success }}>
                      {days} day{days !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: TASK CHECKLIST
      ══════════════════════════════════════════ */}
      {activeTab === "checklist" && (
        <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}` }}>
            <h3 style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>All Onboarding Tasks</h3>
            <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext }}>{doneTasks} of {doneTasks + pendingTasks} completed</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
            <thead>
              <tr style={{ background: surface.theadBg, borderBottom: `2px solid ${surface.border}` }}>
                {["Employee", "Department", ...TASK_DEFS.map((t) => t.label), "Progress"].map((h) => (
                  <th key={h} style={{ padding: PADDING.tableHeader, textAlign: "left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.gray700, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EMPLOYEES.map((emp) => {
                const av       = getAvatarColor(emp.name);
                const dept     = DEPT_COLORS[emp.department] || { bg: COLORS.gray50, text: COLORS.gray700 };
                const progress = getProgress(emp.tasks);
                return (
                  <tr key={emp.id} style={{ borderBottom: `1px solid ${surface.border}`, transition: TRANSITION.fast }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ width: 32, height: 32, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>{initials(emp.name)}</div>
                        <div>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{emp.name}</p>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell }}>
                      <span style={{ padding: "2px 8px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: dept.bg, color: dept.text }}>{emp.department}</span>
                    </td>
                    {TASK_DEFS.map(({ key }) => (
                      <td key={key} style={{ padding: PADDING.tableCell, textAlign: "center" }}>
                        <div style={{ width: 24, height: 24, borderRadius: RADIUS.full, background: emp.tasks[key] ? COLORS.success : surface.border, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                          {emp.tasks[key]
                            ? <Check size={13} color={COLORS.white} strokeWidth={2.5} />
                            : <X size={11} color={COLORS.gray400} />
                          }
                        </div>
                      </td>
                    ))}
                    <td style={{ padding: PADDING.tableCell, minWidth: 120 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
                        <div style={{ flex: 1, height: 6, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? COLORS.success : COLORS.primary, borderRadius: RADIUS.full, transition: "width 0.4s" }} />
                        </div>
                        <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: progress === 100 ? COLORS.success : COLORS.primary, minWidth: 30 }}>{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add New Joiner Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: Z_INDEX.modal, display: "flex", alignItems: "center", justifyContent: "center", padding: SPACING[5] }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["3xl"], width: "100%", maxWidth: 480, boxShadow: SHADOW.modal, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: PADDING.card, borderBottom: `1px solid ${surface.border}` }}>
              <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Add New Joiner</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, display: "flex" }}><X size={ICON_SIZE.md} /></button>
            </div>
            <div style={{ padding: SPACING[5], display: "flex", flexDirection: "column", gap: GAP.md }}>
              {[
                { label: "Full Name *",      key: "name",        type: "text", ph: "e.g. Arjun Kumar"        },
                { label: "Department",       key: "department",  type: "text", ph: "e.g. IT, HR, Finance"    },
                { label: "Role / Designation",key:"role",        type: "text", ph: "e.g. Software Engineer"  },
                { label: "Joining Date *",   key: "joiningDate", type: "date", ph: ""                        },
                { label: "Assigned Mentor",  key: "mentor",      type: "text", ph: "e.g. Siva"               },
              ].map(({ label, key, type, ph }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, marginBottom: GAP.xs }}>{label}</label>
                  <input type={type} placeholder={ph} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: GAP.sm, padding: `${GAP.lg}px ${SPACING[5]}px`, borderTop: `1px solid ${surface.border}` }}>
              <button onClick={() => setShowModal(false)} style={{ padding: PADDING.btn, background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: surface.subtext, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>Cancel</button>
              <button onClick={() => setShowModal(false)} style={{ padding: PADDING.btn, background: COLORS.primary, border: "none", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.white, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>Add Joiner</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Onboarding;
