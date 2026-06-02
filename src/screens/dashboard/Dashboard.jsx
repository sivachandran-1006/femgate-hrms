import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, UserCheck, UserMinus, Clock, Wallet,
  Calendar, Bell, ArrowUpRight, ArrowDownRight,
  AlertCircle, Award, CheckCheck,
} from "lucide-react";

import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useFetchAllLeaves }    from "../../queries/useLeaves";
import { AppLoader }            from "../../components/ui/AppLoader";
import { COLORS }               from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, GAP, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE } from "../../theme/sizes";
import { getAvatarColor, getInitials } from "../../utils/helpers";

// ── Static mock data ─────────────────────────────────────────────────────────

const MONTHLY_HEADCOUNT = [
  { month: "Jan", employees: 62, joiners: 4 },
  { month: "Feb", employees: 65, joiners: 5 },
  { month: "Mar", employees: 68, joiners: 6 },
  { month: "Apr", employees: 71, joiners: 5 },
  { month: "May", employees: 74, joiners: 6 },
  { month: "Jun", employees: 77, joiners: 5 },
  { month: "Jul", employees: 80, joiners: 6 },
  { month: "Aug", employees: 83, joiners: 5 },
  { month: "Sep", employees: 86, joiners: 6 },
  { month: "Oct", employees: 88, joiners: 5 },
  { month: "Nov", employees: 91, joiners: 6 },
  { month: "Dec", employees: 94, joiners: 6 },
];

const ATTENDANCE_WEEK = [
  { day: "Mon", present: 82, absent: 5, leave: 3 },
  { day: "Tue", present: 85, absent: 4, leave: 1 },
  { day: "Wed", present: 80, absent: 6, leave: 4 },
  { day: "Thu", present: 88, absent: 3, leave: 2 },
  { day: "Fri", present: 75, absent: 8, leave: 7 },
  { day: "Sat", present: 40, absent: 2, leave: 1 },
];

const PAYROLL_MONTHS = [
  { month: "Jan", payroll: 520000 },
  { month: "Feb", payroll: 535000 },
  { month: "Mar", payroll: 548000 },
  { month: "Apr", payroll: 562000 },
  { month: "May", payroll: 578000 },
  { month: "Jun", payroll: 591000 },
];

const DEPT_DIST = [
  { name: "IT",         value: 42, color: COLORS.primary },
  { name: "HR",         value: 12, color: COLORS.purple  },
  { name: "Finance",    value: 15, color: COLORS.success },
  { name: "Management", value: 10, color: COLORS.warning },
  { name: "Marketing",  value: 8,  color: COLORS.info    },
  { name: "Operations", value: 7,  color: COLORS.orange  },
];

const RECENT_ACTIVITY = [
  { id: 1, name: "Arjun Kumar",  action: "Joined onboarding",         time: "2h ago",  type: "join"     },
  { id: 2, name: "Safeer",       action: "Leave request approved",     time: "3h ago",  type: "leave"    },
  { id: 3, name: "Priya Sharma", action: "New hire added",             time: "5h ago",  type: "join"     },
  { id: 4, name: "Suriya",       action: "Performance review due",     time: "1d ago",  type: "alert"    },
  { id: 5, name: "Mani",         action: "Check-in recorded",          time: "1d ago",  type: "attend"   },
  { id: 6, name: "Divya Nair",   action: "Onboarding completed",       time: "2d ago",  type: "complete" },
];

const LEAVE_PIPELINE = [
  { name: "Casual Leave", value: 12, color: COLORS.warning },
  { name: "Sick Leave",   value: 8,  color: COLORS.danger  },
  { name: "Annual Leave", value: 5,  color: COLORS.primary },
  { name: "Earned Leave", value: 3,  color: COLORS.purple  },
];

const TOP_PERFORMERS = [
  { name: "Siva",      dept: "Management", score: 98, badge: "⭐ Top Manager" },
  { name: "Mani",      dept: "IT",         score: 95, badge: "🏆 Best Coder"  },
  { name: "Suriya",    dept: "IT",         score: 92, badge: "🚀 DevOps Hero" },
  { name: "Big Kundi", dept: "HR",         score: 90, badge: "💎 HR Star"     },
];

const ANNOUNCEMENTS = [
  { id: 1, title: "Q2 Appraisal Cycle Begins",    date: "Jun 5, 2026",  tag: "HR",      color: COLORS.primary },
  { id: 2, title: "Office Closed — National Day", date: "Jun 10, 2026", tag: "Admin",   color: COLORS.warning },
  { id: 3, title: "New Payroll Policy Effective",  date: "Jun 15, 2026", tag: "Finance", color: COLORS.success },
  { id: 4, title: "Team Building Event",           date: "Jun 20, 2026", tag: "HR",      color: COLORS.purple  },
];

const UPCOMING_EVENTS = [
  { label: "Arjun Kumar joining",  date: "Jun 3",  color: COLORS.success },
  { label: "Priya Sharma joining", date: "Jun 5",  color: COLORS.success },
  { label: "Q2 Appraisal kickoff", date: "Jun 5",  color: COLORS.primary },
  { label: "Payroll processing",   date: "Jun 10", color: COLORS.warning },
  { label: "Karthik Raj joining",  date: "Jun 10", color: COLORS.success },
  { label: "National Holiday",     date: "Jun 10", color: COLORS.danger  },
];

const ACTIVITY_ICON = {
  join:     { icon: <UserCheck   size={14} />, bg: COLORS.successLight, color: COLORS.success },
  leave:    { icon: <Calendar    size={14} />, bg: COLORS.warningLight, color: COLORS.warning },
  alert:    { icon: <AlertCircle size={14} />, bg: COLORS.dangerMuted,  color: COLORS.danger  },
  attend:   { icon: <Clock       size={14} />, bg: COLORS.primaryMuted, color: COLORS.primary },
  complete: { icon: <Award       size={14} />, bg: COLORS.purpleMuted,  color: COLORS.purple  },
};

const NOTIF_DATA = [
  { id: 1, title: "Arjun Kumar submitted a leave request", time: "2 min ago",  type: "leave",   dotColor: COLORS.orange   },
  { id: 2, title: "Payroll for May 2026 processed",        time: "1h ago",     type: "payroll", dotColor: COLORS.success  },
  { id: 3, title: "Priya Sharma onboarding completed",     time: "3h ago",     type: "success", dotColor: COLORS.success  },
  { id: 4, title: "Performance review cycle starts Jun 5", time: "1d ago",     type: "info",    dotColor: COLORS.info     },
  { id: 5, title: "Asset LT-009 assigned to Mani",         time: "2d ago",     type: "asset",   dotColor: COLORS.purple   },
  { id: 6, title: "Safeer's sick leave approved",          time: "2d ago",     type: "leave",   dotColor: COLORS.orange   },
];

const NOTIF_STRIP = {
  leave:   COLORS.orange,
  payroll: COLORS.success,
  success: COLORS.success,
  info:    COLORS.info,
  asset:   COLORS.purple,
};

const fmtINR = (v) => `₹${(v / 1000).toFixed(0)}k`;

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard = ({ darkMode: dark = false }) => {
  const { data: employees = [], isLoading: loadEmp  } = useFetchAllEmployees();
  const { data: leaves    = [], isLoading: loadLeave } = useFetchAllLeaves();

  const [showNotifs, setShowNotifs] = useState(false);
  const [allRead,    setAllRead]    = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (!showNotifs) return;
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifs]);

  if (loadEmp || loadLeave) return <AppLoader fullScreen />;

  // ── theme shortcuts ──
  const cardBg   = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const border   = dark ? COLORS.dark.border  : COLORS.borderLight;
  const text     = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext  = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const divider  = dark ? COLORS.dark.divider : COLORS.borderLight;
  const inputBg  = dark ? COLORS.dark.inputBg : COLORS.gray50;
  const axisTick = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const gridLine = dark ? COLORS.dark.border  : COLORS.borderLight;

  // ── computed stats ──
  const total         = employees.length;
  const present       = employees.filter((e) => e.status === "Present").length;
  const onLeave       = employees.filter((e) => e.status === "Leave").length;
  const absent        = Math.max(0, total - present - onLeave);
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;
  const totalPayroll  = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const avgSalary     = total > 0 ? Math.round(totalPayroll / total) : 0;
  const deptCount     = new Set(employees.map((e) => e.department).filter(Boolean)).size;

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    { label: "Total Employees",   value: total,   icon: Users,     color: COLORS.primary, bg: COLORS.primaryMuted, sub: `${deptCount} departments`,                            trend: "+3",  up: true  },
    { label: "Present Today",     value: present, icon: UserCheck, color: COLORS.success, bg: COLORS.successLight, sub: `${attendancePct}% attendance`,                        trend: "+2%", up: true  },
    { label: "On Leave",          value: onLeave, icon: UserMinus, color: COLORS.warning, bg: COLORS.warningLight, sub: "Active leave requests",                               trend: "-1",  up: false },
    { label: "Pending Approvals", value: pendingLeaves, icon: Clock, color: COLORS.danger, bg: COLORS.dangerMuted, sub: "Awaiting HR review",                                  trend: "+2",  up: false },
    { label: "Monthly Payroll",   value: `₹${(totalPayroll/1000).toFixed(0)}k`, icon: Wallet, color: COLORS.purple, bg: COLORS.purpleMuted, sub: `Avg ₹${avgSalary.toLocaleString("en-IN")}`, trend: "+4%", up: true },
  ];

  const attendancePie = [
    { name: "Present", value: present, color: COLORS.success },
    { name: "Absent",  value: absent,  color: COLORS.danger  },
    { name: "Leave",   value: onLeave, color: COLORS.warning },
  ].filter((d) => d.value > 0);

  // ── reusable sub-components (need dark tokens so defined inside) ──

  const CardBox = ({ children, style = {} }) => (
    <div style={{ background: cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${border}`, boxShadow: SHADOW.card, padding: PADDING.card, ...style }}>
      {children}
    </div>
  );

  const SectionTitle = ({ title, sub, action }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[4] }}>
      <div>
        <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>{title}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: subtext }}>{sub}</p>}
      </div>
      {action && (
        <button style={{ display: "flex", alignItems: "center", gap: 3, fontSize: FONT_SIZE.xs, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium }}>
          {action} <ArrowUpRight size={12} />
        </button>
      )}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: RADIUS.lg, padding: `${GAP.sm}px ${GAP.md}px`, boxShadow: SHADOW.card, fontSize: FONT_SIZE.xs, fontFamily: FONT_FAMILY.base }}>
        <p style={{ margin: `0 0 ${GAP.xs}px`, fontWeight: FONT_WEIGHT.semibold, color: text }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ margin: 0, color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[5], flexWrap: "wrap", gap: GAP.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: text }}>Dashboard</h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: subtext }}>{today}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: GAP.sm }}>
          <div ref={bellRef} style={{ position: "relative" }}>
            {/* Bell button */}
            <div
              onClick={() => setShowNotifs((v) => !v)}
              style={{ width: 38, height: 38, borderRadius: RADIUS.full, background: inputBg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Bell size={17} color={subtext} />
            </div>
            {/* Unread badge — hidden once all are marked read */}
            {!allRead && (
              <div style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: RADIUS.full, background: COLORS.danger, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontSize: 9, color: COLORS.white, fontWeight: FONT_WEIGHT.bold }}>
                  {NOTIF_DATA.length}
                </span>
              </div>
            )}
            {/* Notifications dropdown panel */}
            {showNotifs && (
              <div style={{
                position: "absolute", top: 48, right: 0, zIndex: 1000,
                width: 340, maxHeight: 420, overflowY: "auto",
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: RADIUS.xl, boxShadow: SHADOW.card,
              }}>
                {/* Panel header */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: `${SPACING[3]}px ${SPACING[4]}px`,
                  borderBottom: `1px solid ${border}`,
                  position: "sticky", top: 0, background: cardBg, zIndex: 1,
                }}>
                  <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: text }}>
                    Notifications
                  </span>
                  <button
                    onClick={() => setAllRead(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: FONT_SIZE.xs, color: COLORS.primary,
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium,
                      opacity: allRead ? 0.4 : 1,
                    }}
                    disabled={allRead}
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                </div>
                {/* Notification items */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {NOTIF_DATA.map((n, i) => {
                    const stripColor = NOTIF_STRIP[n.type] || COLORS.primary;
                    return (
                      <div
                        key={n.id}
                        style={{
                          display: "flex", gap: SPACING[3],
                          padding: `${SPACING[3]}px ${SPACING[4]}px`,
                          borderBottom: i < NOTIF_DATA.length - 1 ? `1px solid ${border}` : "none",
                          opacity: allRead ? 0.45 : 1,
                          transition: "opacity 0.25s",
                        }}
                      >
                        {/* Colored left strip */}
                        <div style={{ width: 3, borderRadius: RADIUS.full, background: stripColor, flexShrink: 0, alignSelf: "stretch" }} />
                        {/* Icon dot */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: n.dotColor, flexShrink: 0,
                          marginTop: 5,
                        }} />
                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: text, fontWeight: allRead ? FONT_WEIGHT.normal : FONT_WEIGHT.medium, lineHeight: 1.4 }}>
                            {n.title}
                          </p>
                          <p style={{ margin: "3px 0 0", fontSize: FONT_SIZE.xs, color: subtext }}>
                            {n.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div style={{ width: 38, height: 38, borderRadius: RADIUS.full, background: COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, cursor: "pointer" }}>AD</div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[3] }}>
              <div style={{ width: 40, height: 40, borderRadius: RADIUS.lg, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.icon size={ICON_SIZE.md} color={k.color} />
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: k.up ? COLORS.success : COLORS.danger }}>
                {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.trend}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: text, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: "4px 0 1px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, color: text }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── ROW 1: Headcount + Attendance Pie + Today Numbers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>

        <CardBox>
          <SectionTitle title="Headcount Growth" sub="Monthly employee count — 2026" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={MONTHLY_HEADCOUNT}>
              <defs>
                <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" tick={{ fontSize: FONT_SIZE.xs, fill: axisTick }} />
              <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: axisTick }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="employees" name="Employees" stroke={COLORS.primary} fill="url(#empGrad)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="joiners"   name="Joiners"   stroke={COLORS.success} fill="none" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardBox>

        <CardBox>
          <SectionTitle title="Today's Attendance" sub={`${present} present of ${total}`} />
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={attendancePie} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={36} paddingAngle={2}>
                {attendancePie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.xs }}>
            {attendancePie.map((d) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: FONT_SIZE.xs, color: subtext }}>{d.name}</span>
                </div>
                <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </CardBox>

        <CardBox style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: `${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom: `1px solid ${divider}` }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>Today's Numbers</p>
            <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: subtext }}>{today.split(",")[0]}</p>
          </div>
          {[
            { label: "Present",        value: present,       color: COLORS.success, pct: attendancePct },
            { label: "Absent",         value: absent,        color: COLORS.danger,  pct: total > 0 ? Math.round(absent/total*100) : 0 },
            { label: "On Leave",       value: onLeave,       color: COLORS.warning, pct: total > 0 ? Math.round(onLeave/total*100) : 0 },
            { label: "Pending Leaves", value: pendingLeaves, color: COLORS.purple,  pct: null },
            { label: "Departments",    value: deptCount,     color: COLORS.info,    pct: null },
          ].map(({ label, value, color, pct }, i, arr) => (
            <div key={label} style={{ padding: `${SPACING[3]}px ${SPACING[4]}px`, borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: pct !== null ? 5 : 0 }}>
                <span style={{ fontSize: FONT_SIZE.sm, color: subtext }}>{label}</span>
                <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color }}>{value}{pct !== null ? ` (${pct}%)` : ""}</span>
              </div>
              {pct !== null && (
                <div style={{ height: 4, background: divider, borderRadius: RADIUS.full, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: RADIUS.full }} />
                </div>
              )}
            </div>
          ))}
        </CardBox>
      </div>

      {/* ── ROW 2: Weekly Attendance + Dept Distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>

        <CardBox>
          <SectionTitle title="Weekly Attendance" sub="Present / Absent / Leave — this week" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATTENDANCE_WEEK} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="day" tick={{ fontSize: FONT_SIZE.xs, fill: axisTick }} />
              <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: axisTick }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: FONT_SIZE.xs, fontFamily: FONT_FAMILY.base, color: subtext }} />
              <Bar dataKey="present" name="Present" fill={COLORS.success} radius={[3,3,0,0]} />
              <Bar dataKey="absent"  name="Absent"  fill={COLORS.danger}  radius={[3,3,0,0]} />
              <Bar dataKey="leave"   name="Leave"   fill={COLORS.warning} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBox>

        <CardBox>
          <SectionTitle title="Department Distribution" sub={`${total} employees · ${deptCount} depts`} />
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.sm }}>
            {DEPT_DIST.map((d) => {
              const liveCount = employees.filter((e) => e.department === d.name).length;
              const count = liveCount > 0 ? liveCount : d.value;
              const pct   = Math.round((count / (total > 0 ? total : 94)) * 100);
              return (
                <div key={d.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: FONT_SIZE.sm, color: text, fontWeight: FONT_WEIGHT.medium }}>{d.name}</span>
                    <span style={{ fontSize: FONT_SIZE.xs, color: subtext }}>{count} <span style={{ color: subtext }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 7, background: divider, borderRadius: RADIUS.full, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardBox>
      </div>

      {/* ── ROW 3: Payroll Trend + Leave by Type + Top Performers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>

        <CardBox>
          <SectionTitle title="Payroll Trend" sub="Monthly payroll spend — Jan–Jun 2026" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PAYROLL_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" tick={{ fontSize: FONT_SIZE.xs, fill: axisTick }} />
              <YAxis tickFormatter={fmtINR} tick={{ fontSize: FONT_SIZE.xs, fill: axisTick }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke={COLORS.purple} strokeWidth={2.5} dot={{ fill: COLORS.purple, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBox>

        <CardBox>
          <SectionTitle title="Leave by Type" sub="Approved requests this month" />
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={LEAVE_PIPELINE} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={3}>
                {LEAVE_PIPELINE.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: GAP.sm }}>
            {LEAVE_PIPELINE.map((d) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: FONT_SIZE.xs, color: subtext }}>{d.name}</span>
                </div>
                <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </CardBox>

        <CardBox style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: `${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom: `1px solid ${divider}` }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>Top Performers</p>
            <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: subtext }}>Q2 2026 leaderboard</p>
          </div>
          {TOP_PERFORMERS.map((p, i, arr) => {
            const av = getAvatarColor(p.name);
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: `${SPACING[3]}px ${SPACING[4]}px`, borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                  {getInitials(p.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext }}>{p.badge}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.success }}>{p.score}</p>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext }}>score</p>
                </div>
              </div>
            );
          })}
        </CardBox>
      </div>

      {/* ── ROW 4: Recent Activity + Announcements + Upcoming Events ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.9fr", gap: GAP.md }}>

        <CardBox>
          <SectionTitle title="Recent Activity" sub="Latest HR events across the org" />
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.sm }}>
            {RECENT_ACTIVITY.map((a) => {
              const av   = getAvatarColor(a.name);
              const type = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.attend;
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: `${GAP.sm}px 0`, borderBottom: `1px solid ${divider}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                    {getInitials(a.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext }}>{a.action}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: RADIUS.full, background: type.bg, display: "flex", alignItems: "center", justifyContent: "center", color: type.color }}>
                      {type.icon}
                    </div>
                    <span style={{ fontSize: 10, color: subtext }}>{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBox>

        <CardBox>
          <SectionTitle title="Announcements" sub="Company-wide notices" />
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.sm }}>
            {ANNOUNCEMENTS.map((a, i, arr) => (
              <div key={a.id} style={{ display: "flex", gap: GAP.sm, paddingBottom: i < arr.length - 1 ? GAP.sm : 0, borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none" }}>
                <div style={{ width: 3, background: a.color, borderRadius: RADIUS.full, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: GAP.xs }}>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, lineHeight: 1.3 }}>{a.title}</p>
                    <span style={{ padding: "1px 7px", borderRadius: RADIUS.full, fontSize: 10, fontWeight: FONT_WEIGHT.semibold, background: a.color + "20", color: a.color, whiteSpace: "nowrap", flexShrink: 0 }}>{a.tag}</span>
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: FONT_SIZE.xs, color: subtext, display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={10} /> {a.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBox>

        <CardBox>
          <SectionTitle title="Upcoming Events" sub="Next 30 days" />
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.sm }}>
            {UPCOMING_EVENTS.map((e, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: GAP.sm, paddingBottom: i < arr.length - 1 ? GAP.sm : 0, borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: RADIUS.md, background: e.color + "15", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: FONT_WEIGHT.bold, color: e.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{e.date.split(" ")[0]}</span>
                  <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: e.color, lineHeight: 1 }}>{e.date.split(" ")[1]}</span>
                </div>
                <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: text, lineHeight: 1.3 }}>{e.label}</p>
              </div>
            ))}
          </div>
        </CardBox>
      </div>

    </div>
  );
};

export default Dashboard;
