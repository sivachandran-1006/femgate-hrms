import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, Calendar, Wallet, Award, AlertCircle } from "lucide-react";
import { COLORS }                                                    from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                       from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                             from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE } from "../../theme/sizes";
import { getAvatarColor, getStatusBadge }                            from "../../utils/helpers";

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.info,
  COLORS.orange,
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DUMMY_EMPLOYEES = [
  { name: "Mani",       department: "IT",         role: "Employee", salary: 72000, status: "Present",  joiningDate: "2024-01-15" },
  { name: "P Santhosh", department: "IT",         role: "Employee", salary: 68000, status: "Present",  joiningDate: "2024-02-10" },
  { name: "C Santhosh", department: "IT",         role: "Employee", salary: 65000, status: "Present",  joiningDate: "2024-03-05" },
  { name: "Suriya",     department: "IT",         role: "Manager",  salary: 78000, status: "Present",  joiningDate: "2024-01-20" },
  { name: "Siva",       department: "Management", role: "Admin",    salary: 95000, status: "Present",  joiningDate: "2023-11-01" },
  { name: "Aravinth",   department: "IT",         role: "Employee", salary: 62000, status: "Present",  joiningDate: "2024-04-12" },
  { name: "Safeer",     department: "Finance",    role: "Employee", salary: 58000, status: "Leave",    joiningDate: "2024-02-28" },
  { name: "Sabari",     department: "IT",         role: "Employee", salary: 55000, status: "Present",  joiningDate: "2024-05-01" },
  { name: "Vignesh",    department: "IT",         role: "Employee", salary: 60000, status: "Absent",   joiningDate: "2024-03-18" },
  { name: "Big Kundi",  department: "HR",         role: "HR",       salary: 70000, status: "Present",  joiningDate: "2023-12-10" },
  { name: "Suganthan",  department: "Management", role: "Manager",  salary: 88000, status: "Present",  joiningDate: "2023-10-05" },
  { name: "Hari",       department: "IT",         role: "Employee", salary: 64000, status: "Present",  joiningDate: "2024-06-01" },
];

const DUMMY_LEAVES = [
  { status: "Approved", leaveType: "Casual",   fromDate: "2026-01-10" },
  { status: "Approved", leaveType: "Sick",     fromDate: "2026-02-14" },
  { status: "Pending",  leaveType: "Casual",   fromDate: "2026-03-05" },
  { status: "Rejected", leaveType: "Earned",   fromDate: "2026-03-20" },
  { status: "Approved", leaveType: "Sick",     fromDate: "2026-04-08" },
  { status: "Pending",  leaveType: "Casual",   fromDate: "2026-04-22" },
  { status: "Approved", leaveType: "Earned",   fromDate: "2026-05-03" },
  { status: "Pending",  leaveType: "Casual",   fromDate: "2026-05-15" },
  { status: "Approved", leaveType: "Sick",     fromDate: "2026-05-20" },
  { status: "Rejected", leaveType: "Casual",   fromDate: "2026-05-28" },
];

const Analytics = ({ employees: empProp = [], leaves: leavesProp = [], darkMode = false }) => {
  const employees = empProp.length > 0 ? empProp : DUMMY_EMPLOYEES;
  const leaves    = leavesProp.length > 0 ? leavesProp : DUMMY_LEAVES;
  const [activeTab, setActiveTab] = useState("overview");

  const surface = darkMode ? COLORS.dark : COLORS.light;

  const card = {
    background: surface.cardBg,
    borderRadius: RADIUS["2xl"],
    border: `1px solid ${surface.border}`,
    boxShadow: SHADOW.card,
    padding: PADDING.card,
  };

  const total    = employees.length;
  const present  = employees.filter((e) => e.status === "Present").length;
  const onLeave  = employees.filter((e) => e.status === "Leave").length;
  const absent   = Math.max(0, total - present - onLeave);
  const totalPayroll = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const avgSalary    = total > 0 ? Math.round(totalPayroll / total) : 0;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;

  // Dept map
  const deptMap = {};
  employees.forEach((e) => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  // Attendance pie
  const attendancePie = [
    { name: "Present",  value: present },
    { name: "On Leave", value: onLeave },
    { name: "Absent",   value: absent },
  ].filter((d) => d.value > 0);

  // Leave status
  const leaveStatusMap = {};
  leaves.forEach((l) => { leaveStatusMap[l.status] = (leaveStatusMap[l.status] || 0) + 1; });
  const leaveStatusData = Object.entries(leaveStatusMap).map(([name, value]) => ({ name, value }));

  // Leave type
  const leaveTypeMap = {};
  leaves.forEach((l) => {
    const t = l.leaveType || "Other";
    leaveTypeMap[t] = (leaveTypeMap[t] || 0) + 1;
  });
  const leaveTypeData = Object.entries(leaveTypeMap).map(([name, value]) => ({ name, value }));

  // Salary buckets
  const salaryBuckets = { "0–20k": 0, "20–40k": 0, "40–60k": 0, "60–80k": 0, "80k+": 0 };
  employees.forEach((e) => {
    const s = Number(e.salary) || 0;
    if      (s < 20000) salaryBuckets["0–20k"]++;
    else if (s < 40000) salaryBuckets["20–40k"]++;
    else if (s < 60000) salaryBuckets["40–60k"]++;
    else if (s < 80000) salaryBuckets["60–80k"]++;
    else                salaryBuckets["80k+"]++;
  });
  const salaryData = Object.entries(salaryBuckets).map(([name, value]) => ({ name, value }));

  // Monthly headcount trend (simulated from joiningDate)
  const joinMap = {};
  employees.forEach((e) => {
    if (e.joiningDate) {
      const m = new Date(e.joiningDate).getMonth();
      if (!isNaN(m)) joinMap[m] = (joinMap[m] || 0) + 1;
    }
  });
  const headcountTrend = MONTHS.map((m, i) => ({ month: m, joined: joinMap[i] || 0 }));

  // Monthly leave trend
  const leaveMonthMap = {};
  leaves.forEach((l) => {
    if (l.fromDate) {
      const m = new Date(l.fromDate).getMonth();
      if (!isNaN(m)) leaveMonthMap[m] = (leaveMonthMap[m] || 0) + 1;
    }
  });
  const leaveTrend = MONTHS.map((m, i) => ({ month: m, leaves: leaveMonthMap[i] || 0 }));

  // Top dept by headcount
  const topDept = deptData.sort((a, b) => b.value - a.value)[0];

  // Gender / role distribution (from role field)
  const roleMap = {};
  employees.forEach((e) => { const r = e.role || "Other"; roleMap[r] = (roleMap[r] || 0) + 1; });
  const roleData = Object.entries(roleMap).map(([name, value]) => ({ name, value }));

  const leaveStatusColors = [COLORS.warning, COLORS.success, COLORS.danger];

  const kpis = [
    { label: "Total Employees", value: total,   icon: <Users size={ICON_SIZE.md} />,    color: COLORS.primary, bg: COLORS.primaryLight,  sub: `${deptData.length} departments` },
    { label: "Attendance Rate",  value: `${attendancePct}%`, icon: <TrendingUp size={ICON_SIZE.md} />, color: COLORS.success, bg: COLORS.successMuted, sub: `${present} present today` },
    { label: "Pending Leaves",   value: pendingLeaves, icon: <Calendar size={ICON_SIZE.md} />, color: COLORS.warning, bg: COLORS.warningMuted, sub: `${leaves.length} total requests` },
    { label: "Total Payroll",    value: `₹${(totalPayroll/1000).toFixed(0)}k`, icon: <Wallet size={ICON_SIZE.md} />, color: COLORS.purple, bg: COLORS.purpleLight, sub: `Avg ₹${avgSalary.toLocaleString("en-IN")}` },
  ];

  const tabs = ["overview", "workforce", "leaves", "payroll"];

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: GAP.xl }}>
        <div>
          <h1 style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: FONT_SIZE.base, color: surface.subtext, marginTop: GAP.xs }}>Workforce insights and HR metrics</p>
        </div>
        <div style={{ display: "flex", gap: GAP.xs }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: PADDING.btn, borderRadius: RADIUS.xl, border: "none", cursor: "pointer", fontSize: FONT_SIZE.base,
              fontFamily: FONT_FAMILY.base,
              fontWeight: activeTab === t ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
              background: activeTab === t ? COLORS.primary : COLORS.gray100,
              color: activeTab === t ? COLORS.white : COLORS.gray600,
              textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* KPI row — always visible */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: GAP.xl }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, padding: `${SPACING[4]}px ${SPACING[4] + 2}px`, display: "flex", gap: GAP.lg, alignItems: "flex-start" }}>
            <div style={{ width: LAYOUT.avatar + 2, height: LAYOUT.avatar + 2, borderRadius: RADIUS.lg, background: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <p style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, margin: `0 0 ${GAP.xs - 1}px` }}>{k.label}</p>
              <p style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: k.color, margin: `0 0 ${GAP.xs - 2}px`, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray400, margin: 0 }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: GAP.lg, marginBottom: GAP.lg }}>
            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Employees by Department</h3>
              {deptData.length === 0
                ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400 }}>No data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deptData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                      <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                      <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                      <Bar dataKey="value" name="Employees" radius={[RADIUS.sm,RADIUS.sm,0,0]}>
                        {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Attendance Status</h3>
              {attendancePie.length === 0
                ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400 }}>No data</p>
                : <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={attendancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={38}>
                          {attendancePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: GAP.md, justifyContent: "center", flexWrap: "wrap", marginTop: GAP.sm }}>
                      {attendancePie.map((d, i) => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: GAP.xs + 1, fontSize: FONT_SIZE.sm }}>
                          <div style={{ width: 9, height: 9, borderRadius: RADIUS.full, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span style={{ color: surface.subtext }}>{d.name} <strong style={{ color: surface.text }}>{d.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
              }
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg }}>
            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>New Hires by Month</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={headcountTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                  <XAxis dataKey="month" tick={{ fontSize: FONT_SIZE.xs - 1, fill: surface.subtext }} />
                  <YAxis tick={{ fontSize: FONT_SIZE.xs - 1, fill: surface.subtext }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                  <Area type="monotone" dataKey="joined" name="Joined" stroke={COLORS.primary} fill={COLORS.primaryMuted} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Leave Trend by Month</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={leaveTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                  <XAxis dataKey="month" tick={{ fontSize: FONT_SIZE.xs - 1, fill: surface.subtext }} />
                  <YAxis tick={{ fontSize: FONT_SIZE.xs - 1, fill: surface.subtext }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                  <Area type="monotone" dataKey="leaves" name="Leaves" stroke={COLORS.warning} fill={COLORS.warningLight} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ── WORKFORCE TAB ── */}
      {activeTab === "workforce" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg, marginBottom: GAP.lg }}>
            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Role Distribution</h3>
              {roleData.length === 0
                ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400 }}>No data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={roleData} layout="vertical" barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                      <XAxis type="number" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                      <Bar dataKey="value" name="Count" radius={[0,RADIUS.sm,RADIUS.sm,0]}>
                        {roleData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Salary Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salaryData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                  <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                  <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                  <Bar dataKey="value" name="Employees" fill={COLORS.purple} radius={[RADIUS.sm,RADIUS.sm,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department table */}
          <div style={card}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Department Summary</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${surface.border}` }}>
                  {["Department","Headcount","% of Total","Avg Salary","Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", paddingBottom: SPACING[2] + 2, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.gray600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptData.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: "center", padding: SPACING[8], color: COLORS.gray400, fontSize: FONT_SIZE.base }}>No department data</td></tr>
                  : deptData.map((d, i) => {
                      const deptEmps = employees.filter((e) => e.department === d.name);
                      const deptAvg = deptEmps.length > 0
                        ? Math.round(deptEmps.reduce((s, e) => s + (Number(e.salary) || 0), 0) / deptEmps.length)
                        : 0;
                      return (
                        <tr key={d.name} style={{ borderBottom: `1px solid ${surface.divider}` }}>
                          <td style={{ padding: `${SPACING[3]}px 0`, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text, display: "flex", alignItems: "center", gap: GAP.sm }}>
                            <div style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            {d.name}
                          </td>
                          <td style={{ padding: `${SPACING[3]}px 0`, fontSize: FONT_SIZE.base, color: COLORS.gray700 }}>{d.value}</td>
                          <td style={{ padding: `${SPACING[3]}px 0`, fontSize: FONT_SIZE.base, color: COLORS.gray700 }}>{total > 0 ? Math.round((d.value / total) * 100) : 0}%</td>
                          <td style={{ padding: `${SPACING[3]}px 0`, fontSize: FONT_SIZE.base, color: COLORS.gray700 }}>₹{deptAvg.toLocaleString("en-IN")}</td>
                          <td style={{ padding: `${SPACING[3]}px 0` }}>
                            <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, padding: PADDING.badge, borderRadius: RADIUS.full, background: COLORS.successLight, color: COLORS.success }}>Active</span>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── LEAVES TAB ── */}
      {activeTab === "leaves" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg, marginBottom: GAP.lg }}>
            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Leave by Status</h3>
              {leaveStatusData.length === 0
                ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400 }}>No leave data</p>
                : <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={leaveStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {leaveStatusData.map((_, i) => <Cell key={i} fill={leaveStatusColors[i % leaveStatusColors.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: GAP.lg, justifyContent: "center", flexWrap: "wrap", marginTop: GAP.sm }}>
                      {leaveStatusData.map((d, i) => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: GAP.xs + 2, fontSize: FONT_SIZE.sm }}>
                          <div style={{ width: 9, height: 9, borderRadius: RADIUS.full, background: leaveStatusColors[i % leaveStatusColors.length] }} />
                          <span style={{ color: surface.subtext }}>{d.name}: <strong style={{ color: surface.text }}>{d.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Leave by Type</h3>
              {leaveTypeData.length === 0
                ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400 }}>No leave data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={leaveTypeData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                      <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                      <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                      <Bar dataKey="value" name="Requests" radius={[RADIUS.sm,RADIUS.sm,0,0]}>
                        {leaveTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Leave Trend by Month</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                <XAxis dataKey="month" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                <Area type="monotone" dataKey="leaves" name="Leaves" stroke={COLORS.warning} fill={COLORS.warningLight} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── PAYROLL TAB ── */}
      {activeTab === "payroll" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg, marginBottom: GAP.lg }}>
            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Payroll by Department</h3>
              {deptData.length === 0
                ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400 }}>No data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deptData.map((d) => ({
                      name: d.name,
                      payroll: employees.filter((e) => e.department === d.name).reduce((s, e) => s + (Number(e.salary) || 0), 0),
                    }))} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                      <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                      <YAxis tick={{ fontSize: FONT_SIZE.xs - 1, fill: surface.subtext }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                      <Bar dataKey="payroll" name="Payroll" radius={[RADIUS.sm,RADIUS.sm,0,0]}>
                        {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.xs}px` }}>Payroll Summary</h3>
              <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400, margin: `0 0 ${GAP.xl}px` }}>Based on employee salary data</p>
              {[
                { label: "Total Monthly Payroll",  value: `₹${totalPayroll.toLocaleString("en-IN")}`, color: COLORS.primary },
                { label: "Average Salary",          value: `₹${avgSalary.toLocaleString("en-IN")}`,   color: COLORS.success },
                { label: "Highest Salary",
                  value: `₹${Math.max(...employees.map(e => Number(e.salary) || 0), 0).toLocaleString("en-IN")}`, color: COLORS.purple },
                { label: "Lowest Salary",
                  value: employees.length > 0
                    ? `₹${Math.min(...employees.filter(e => Number(e.salary) > 0).map(e => Number(e.salary))).toLocaleString("en-IN")}`
                    : "—",
                  color: COLORS.warning },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${surface.border}`, paddingBottom: GAP.md, marginBottom: GAP.md }}>
                  <span style={{ fontSize: FONT_SIZE.base, color: surface.subtext }}>{row.label}</span>
                  <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${GAP.lg}px` }}>Salary Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salaryData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.sm, fill: surface.subtext }} />
                <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm }} />
                <Bar dataKey="value" name="Employees" fill={COLORS.purple} radius={[RADIUS.sm,RADIUS.sm,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
