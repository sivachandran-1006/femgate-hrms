import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";
import {
  IconTrendingUp as TrendingUp,
  IconTrendingDown as TrendingDown,
  IconUsers as Users,
  IconWallet as Wallet,
  IconCalendar as Calendar,
  IconAward as Award,
  IconTarget as Target,
  IconUserMinus as UserMinus,
  IconUserPlus as UserPlus,
  IconChartBar as BarChart2,
  IconStar as Star,
  IconBriefcase as Briefcase,
  IconClock as Clock,
} from "@tabler/icons-react";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useFetchAllLeaves }    from "../../queries/useLeaves";
import { useCandidates, useExits } from "../../queries/useHr";
import { topSlices } from "../dashboard/components/DashboardKit";
import { AppLoader }            from "../../components/ui/AppLoader";
import { AppPageHeader }        from "../../components/ui/AppPageHeader";
import { COLORS }                            from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }     from "../../theme/spacing";
import { RADIUS, SHADOW }                    from "../../theme/sizes";

// ── Static reference data (recruitment funnel + attrition trend — no live source) ──

// ── Palette ───────────────────────────────────────────────────────────────────

const PALETTE = [COLORS.primary, COLORS.purple, COLORS.success, COLORS.warning, COLORS.info, COLORS.orange, COLORS.danger];

// ── Reusable sub-components ───────────────────────────────────────────────────

const Card = ({ children, style = {}, dark }) => (
  <div style={{
    background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
    borderRadius: RADIUS["2xl"],
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    boxShadow:    SHADOW.sm,
    padding:      PADDING.card,
    ...style,
  }}>
    {children}
  </div>
);

const CardTitle = ({ icon: Icon, title, sub, color = COLORS.primary, dark }) => (
  <div style={{ display:"flex", alignItems:"center", gap: GAP.sm, marginBottom: SPACING[5] }}>
    <div style={{
      width:36, height:36, borderRadius: RADIUS.lg,
      background: color + "18",
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>
      <Icon size={17} color={color} stroke={2} />
    </div>
    <div>
      <p style={{ margin:0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: dark ? COLORS.dark.text : COLORS.textLight }}>{title}</p>
      {sub && <p style={{ margin:0, fontSize: FONT_SIZE.xs, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight }}>{sub}</p>}
    </div>
  </div>
);

const KpiCard = ({ icon: Icon, label, value, sub, color, bg, trend, dark }) => (
  <div style={{
    background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
    borderRadius: RADIUS["2xl"],
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    boxShadow:    SHADOW.sm,
    padding:      `${SPACING[4]}px ${SPACING[5]}px`,
    display:"flex", alignItems:"center", gap: GAP.md,
  }}>
    <div style={{
      width: LAYOUT.iconBoxLg, height: LAYOUT.iconBoxLg, borderRadius: RADIUS.xl,
      background: bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>
      <Icon size={22} color={color} stroke={1.8} />
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ margin:0, fontSize: FONT_SIZE.xs, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight, fontWeight: FONT_WEIGHT.medium }}>{label}</p>
      <p style={{ margin:"3px 0 1px", fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: dark ? COLORS.dark.text : COLORS.textLight, lineHeight:1 }}>{value}</p>
      {sub && <p style={{ margin:0, fontSize: FONT_SIZE.xs, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight }}>{sub}</p>}
    </div>
    {trend !== undefined && (
      <div style={{ display:"flex", alignItems:"center", gap:2, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: trend >= 0 ? COLORS.success : COLORS.danger, flexShrink:0 }}>
        {trend >= 0 ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const ChartTooltip = ({ active, payload, label, dark, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  const cardBg = dark ? COLORS.dark.cardBg : COLORS.surfaceLight;
  const border = dark ? COLORS.dark.border : COLORS.borderLight;
  const text   = dark ? COLORS.dark.text   : COLORS.textLight;
  const sub    = dark ? COLORS.dark.subtext: COLORS.textMutedLight;
  return (
    <div style={{ background: cardBg, border:`1px solid ${border}`, borderRadius: RADIUS.lg, padding:"10px 14px", boxShadow: SHADOW.sm, fontSize: FONT_SIZE.xs, fontFamily: FONT_FAMILY.base }}>
      <p style={{ margin:`0 0 4px`, fontWeight: FONT_WEIGHT.semibold, color: text }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin:0, color: p.color }}>{p.name}: <strong>{prefix}{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}{suffix}</strong></p>
      ))}
    </div>
  );
};

const TABS = [
  { id:"overview",    label:"Overview"   },
  { id:"attrition",   label:"Attrition"  },
  { id:"workforce",   label:"Workforce"  },
  { id:"compensation",label:"Salary"     },
  { id:"leave",       label:"Leave"      },
  { id:"hiring",      label:"Hiring"     },
  { id:"performers",  label:"Performers" },
];

// ── Main Component ─────────────────────────────────────────────────────────────

const Analytics = ({ darkMode: dark = false }) => {
  const [tab, setTab] = useState("overview");

  const { data: rawEmployees = [], isLoading: loadEmp  } = useFetchAllEmployees();
  const { data: rawLeaves    = [], isLoading: loadLeave } = useFetchAllLeaves();
  const { data: candidates   = [] } = useCandidates();
  const { data: exits        = [] } = useExits();

  // Attrition per month — resignations from real exit records (current year)
  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const headcount = rawEmployees.length || 1;
  const ATTRITION = MONTH_LABELS.map((month, idx) => {
    const resigned = exits.filter((e) => {
      const d = new Date(e.lastWorkingDay);
      return d.getMonth() === idx && d.getFullYear() === new Date().getFullYear();
    }).length;
    return { month, resigned, rate: Math.round((resigned / headcount) * 1000) / 10 };
  });

  // Hiring funnel — from real candidate pipeline
  const stageCounts = {
    Applied:     candidates.length,
    Screened:    candidates.filter((c) => ["Screening","Interview","Selected"].includes(c.status)).length,
    Interviewed: candidates.filter((c) => ["Interview","Selected"].includes(c.status)).length,
    Offered:     candidates.filter((c) => c.status === "Selected").length,
    Hired:       candidates.filter((c) => c.status === "Selected").length,
  };
  const HIRING_FUNNEL = [
    { stage:"Applied",     value: stageCounts.Applied,     fill: COLORS.primaryLight },
    { stage:"Screened",    value: stageCounts.Screened,    fill: COLORS.primary      },
    { stage:"Interviewed", value: stageCounts.Interviewed, fill: COLORS.purple       },
    { stage:"Offered",     value: stageCounts.Offered,     fill: COLORS.warning      },
    { stage:"Hired",       value: stageCounts.Hired,       fill: COLORS.success      },
  ];

  const surface   = dark ? COLORS.dark : COLORS.light;
  const text      = surface.text;
  const sub       = surface.subtext;
  const border    = surface.border;
  const axisTick  = { fontSize: FONT_SIZE.xs, fill: sub };

  if (loadEmp || loadLeave) return <AppLoader fullScreen />;

  // ── Normalise: map API fields → internal fields ──
  const EMPLOYEES = rawEmployees.map((e) => ({
    name:    e.name,
    dept:    e.department,
    salary:  Number(e.salary) || 0,
    gender:  e.gender  || "Male",
    age:     Number(e.age)    || 28,
    tenure:  Number(e.tenure) || 1.0,
    score:   Number(e.score)  || 75,
    status:  e.status,
    joiningDate: e.joiningDate || "",
  }));

  const LEAVES = Array.isArray(rawLeaves) ? rawLeaves : (rawLeaves?.leaves ?? rawLeaves?.data ?? []);

  // ── Derived from live data ──
  const total        = EMPLOYEES.length;
  const present      = EMPLOYEES.filter((e) => e.status === "Present").length;
  const onLeave      = EMPLOYEES.filter((e) => e.status === "Leave").length;
  const attendPct    = total > 0 ? Math.round((present / total) * 100) : 0;
  const totalPayroll = EMPLOYEES.reduce((s, e) => s + e.salary, 0);
  const avgAttrition = (ATTRITION.reduce((s, m) => s + m.rate, 0) / ATTRITION.length).toFixed(1);
  const ytdHires     = ATTRITION.reduce((s, m) => s + m.resigned, 0);

  const deptMap = {};
  EMPLOYEES.forEach((e) => { deptMap[e.dept] = (deptMap[e.dept] || 0) + 1; });
  const DEPT_DATA = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  const SALARY_BY_DEPT = Object.keys(deptMap).map((dept) => {
    const emps = EMPLOYEES.filter((e) => e.dept === dept);
    return {
      dept,
      avg: Math.round(emps.reduce((s, e) => s + e.salary, 0) / emps.length),
      max: Math.max(...emps.map((e) => e.salary)),
      min: Math.min(...emps.map((e) => e.salary)),
    };
  });

  const GENDER_DATA = [
    { name:"Male",   value: EMPLOYEES.filter((e) => e.gender === "Male").length,   fill: COLORS.primary },
    { name:"Female", value: EMPLOYEES.filter((e) => e.gender === "Female").length, fill: COLORS.purple  },
  ];

  const ageBuckets = { "20–25":0, "26–30":0, "31–35":0, "36–40":0, "40+":0 };
  EMPLOYEES.forEach((e) => {
    if      (e.age <= 25) ageBuckets["20–25"]++;
    else if (e.age <= 30) ageBuckets["26–30"]++;
    else if (e.age <= 35) ageBuckets["31–35"]++;
    else if (e.age <= 40) ageBuckets["36–40"]++;
    else                  ageBuckets["40+"]++;
  });
  const AGE_DATA = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }));

  const tenureBuckets = { "<1yr":0, "1–2yr":0, "2–3yr":0, "3+yr":0 };
  EMPLOYEES.forEach((e) => {
    if      (e.tenure < 1) tenureBuckets["<1yr"]++;
    else if (e.tenure < 2) tenureBuckets["1–2yr"]++;
    else if (e.tenure < 3) tenureBuckets["2–3yr"]++;
    else                   tenureBuckets["3+yr"]++;
  });
  const TENURE_DATA = Object.entries(tenureBuckets).map(([name, value]) => ({ name, value }));

  // Leave utilization — derived from real leave data per dept
  const LEAVE_BY_DEPT = Object.keys(deptMap).map((dept) => {
    const deptLeaves = LEAVES.filter((l) => {
      const emp = EMPLOYEES.find((e) => e.name === l.employee);
      return emp && emp.dept === dept && l.status === "Approved";
    });
    const deptSize = deptMap[dept] || 1;
    const totalAlloc = deptSize * 18; // 18 days per employee per year
    const used = deptLeaves.reduce((s, l) => s + (Number(l.days) || 1), 0);
    const pct  = totalAlloc > 0 ? Math.round((used / totalAlloc) * 100) : 0;
    return { dept, total: totalAlloc, used, pct };
  });

  const TOP_PERFORMERS = EMPLOYEES
    .slice().sort((a, b) => b.score - a.score).slice(0, 5)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      <AppPageHeader title="HR Analytics" sub="Comprehensive workforce intelligence" />

      {/* ── KPI Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        <KpiCard dark={dark} icon={Users}      label="Total Employees"  value={total}        sub={`${Object.keys(deptMap).length} departments`} color={COLORS.primary} bg={COLORS.primaryMuted} trend={5}  />
        <KpiCard dark={dark} icon={TrendingUp} label="Attendance Rate"  value={`${attendPct}%`} sub={`${present} present today`}  color={COLORS.success} bg={COLORS.successLight} trend={2}  />
        <KpiCard dark={dark} icon={UserMinus}  label="Avg Attrition"    value={`${avgAttrition}%`} sub="Monthly avg 2026"       color={COLORS.danger}  bg={COLORS.dangerMuted} trend={-8} />
        <KpiCard dark={dark} icon={Wallet}     label="Total Payroll"    value={`₹${(totalPayroll/100000).toFixed(1)}L`} sub={`Avg ₹${Math.round(totalPayroll/total).toLocaleString("en-IN")}`} color={COLORS.purple} bg={COLORS.purpleMuted} trend={4} />
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${border}`, marginBottom: SPACING[5], overflowX:"auto" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"9px 18px", border:"none",
              borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
              marginBottom: -2,
              background:"transparent",
              color: active ? COLORS.primary : sub,
              fontSize: FONT_SIZE.sm,
              fontWeight: active ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
              cursor:"pointer", whiteSpace:"nowrap",
              fontFamily: FONT_FAMILY.base,
              transition:"color 0.15s",
            }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      {tab === "overview" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>

            {/* Attrition trend mini */}
            <Card dark={dark}>
              <CardTitle icon={TrendingDown} title="Attrition Rate Trend" sub="Monthly % — 2026" color={COLORS.danger} dark={dark} />
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={ATTRITION}>
                  <defs>
                    <linearGradient id="attrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.danger} stopOpacity={0.18}/>
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="month" tick={axisTick}/>
                  <YAxis tick={axisTick} tickFormatter={(v)=>`${v}%`}/>
                  <Tooltip content={<ChartTooltip dark={dark} suffix="%"/>}/>
                  <Area type="monotone" dataKey="rate" name="Attrition" stroke={COLORS.danger} fill="url(#attrGrad)" strokeWidth={2.5} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Gender diversity */}
            <Card dark={dark}>
              <CardTitle icon={Users} title="Gender Diversity" sub={`${total} employees`} color={COLORS.purple} dark={dark}/>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={GENDER_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={3}>
                    {GENDER_DATA.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                  </Pie>
                  <Tooltip content={<ChartTooltip dark={dark}/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap: GAP.md, justifyContent:"center", marginTop: GAP.sm }}>
                {GENDER_DATA.map((d) => (
                  <div key={d.name} style={{ display:"flex", alignItems:"center", gap: GAP.xs }}>
                    <div style={{ width:8, height:8, borderRadius: RADIUS.full, background: d.fill }}/>
                    <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{d.name} <strong style={{ color: text }}>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Headcount by dept */}
            <Card dark={dark}>
              <CardTitle icon={BarChart2} title="Dept Headcount" color={COLORS.primary} dark={dark}/>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {DEPT_DATA.map((d,i) => {
                  const pct = Math.round((d.value/total)*100);
                  return (
                    <div key={d.name}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize: FONT_SIZE.xs, color: text, fontWeight: FONT_WEIGHT.medium }}>{d.name}</span>
                        <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{d.value} ({pct}%)</span>
                      </div>
                      <div style={{ height:6, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background: PALETTE[i%PALETTE.length], borderRadius: RADIUS.full, transition:"width 0.5s" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: GAP.md }}>
            {/* Hiring funnel mini */}
            <Card dark={dark}>
              <CardTitle icon={UserPlus} title="Hiring Funnel" sub="Current pipeline" color={COLORS.success} dark={dark}/>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {HIRING_FUNNEL.map((s,i) => {
                  const pct = Math.round((s.value/HIRING_FUNNEL[0].value)*100);
                  return (
                    <div key={s.stage} style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                      <span style={{ fontSize: FONT_SIZE.xs, color: sub, width:72, flexShrink:0 }}>{s.stage}</span>
                      <div style={{ flex:1, height:7, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background: s.fill, borderRadius: RADIUS.full }}/>
                      </div>
                      <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: text, width:28, textAlign:"right" }}>{s.value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Leave utilization */}
            <Card dark={dark}>
              <CardTitle icon={Calendar} title="Leave Utilization" sub="By department" color={COLORS.warning} dark={dark}/>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {LEAVE_BY_DEPT.map((d) => (
                  <div key={d.dept}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize: FONT_SIZE.xs, color: text, fontWeight: FONT_WEIGHT.medium }}>{d.dept}</span>
                      <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{d.used}/{d.total} days ({d.pct}%)</span>
                    </div>
                    <div style={{ height:6, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${d.pct}%`, background: d.pct>65 ? COLORS.danger : d.pct>45 ? COLORS.warning : COLORS.success, borderRadius: RADIUS.full }}/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top performer mini */}
            <Card dark={dark} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:`${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom:`1px solid ${border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                  <div style={{ width:32, height:32, borderRadius: RADIUS.lg, background: COLORS.warningLight, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Award size={16} color={COLORS.warning} stroke={2}/>
                  </div>
                  <p style={{ margin:0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: text }}>Top Performers</p>
                </div>
              </div>
              {TOP_PERFORMERS.map((e,i,arr) => (
                <div key={e.name} style={{ display:"flex", alignItems:"center", gap: GAP.sm, padding:`${SPACING[3]}px ${SPACING[4]}px`, borderBottom: i<arr.length-1 ? `1px solid ${border}` : "none" }}>
                  <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: [COLORS.warning,COLORS.gray600,COLORS.orange][i]||sub, width:16 }}>#{e.rank}</span>
                  <div style={{ width:28, height:28, borderRadius: RADIUS.full, background: PALETTE[i%PALETTE.length]+"25", color: PALETTE[i%PALETTE.length], display:"flex", alignItems:"center", justifyContent:"center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink:0 }}>
                    {e.name.slice(0,1)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</p>
                    <p style={{ margin:0, fontSize:"0.65rem", color: sub }}>{e.dept}</p>
                  </div>
                  <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.success }}>{e.score}</span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: ATTRITION
      ══════════════════════════════════════════════════════════ */}
      {tab === "attrition" && (
        <>
          {/* Summary chips */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: GAP.md, marginBottom: GAP.md }}>
            {[
              { label:"YTD Resignations", value: ytdHires, icon: UserMinus, color: COLORS.danger,   bg: COLORS.dangerMuted  },
              { label:"Avg Monthly Rate", value:`${avgAttrition}%`, icon: TrendingDown, color: COLORS.warning, bg: COLORS.warningLight },
              { label:"Peak Month",       value:"Jul 2.4%", icon: Calendar, color: COLORS.orange,  bg: COLORS.orangeLight  },
              { label:"Low Month",        value:"May 0.5%", icon: Target,   color: COLORS.success, bg: COLORS.successLight },
            ].map((k) => (
              <div key={k.label} style={{ background: dark ? COLORS.dark.cardBg : COLORS.surfaceLight, borderRadius: RADIUS["2xl"], border:`1px solid ${border}`, boxShadow: SHADOW.sm, padding:`${SPACING[4]}px ${SPACING[4]}px`, display:"flex", alignItems:"center", gap: GAP.md }}>
                <div style={{ width:44, height:44, borderRadius: RADIUS.lg, background: k.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <k.icon size={20} color={k.color} stroke={1.8}/>
                </div>
                <div>
                  <p style={{ margin:0, fontSize: FONT_SIZE.xs, color: sub }}>{k.label}</p>
                  <p style={{ margin:"2px 0 0", fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: k.color, lineHeight:1 }}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap: GAP.md }}>
            <Card dark={dark}>
              <CardTitle icon={TrendingDown} title="Monthly Attrition Rate" sub="Percentage of workforce that left each month" color={COLORS.danger} dark={dark}/>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={ATTRITION}>
                  <defs>
                    <linearGradient id="attrFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.danger} stopOpacity={0.22}/>
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="month" tick={axisTick}/>
                  <YAxis tick={axisTick} tickFormatter={(v)=>`${v}%`}/>
                  <Tooltip content={<ChartTooltip dark={dark} suffix="%"/>}/>
                  <Area type="monotone" dataKey="rate" name="Attrition %" stroke={COLORS.danger} fill="url(#attrFull)" strokeWidth={2.5} dot={{ fill: COLORS.danger, r:4 }} activeDot={{ r:6 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card dark={dark}>
              <CardTitle icon={UserMinus} title="Resignations per Month" color={COLORS.orange} dark={dark}/>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ATTRITION} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="month" tick={axisTick}/>
                  <YAxis tick={axisTick} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  <Bar dataKey="resigned" name="Resigned" fill={COLORS.orange} radius={[RADIUS.sm,RADIUS.sm,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: WORKFORCE
      ══════════════════════════════════════════════════════════ */}
      {tab === "workforce" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>
            {/* Headcount donut */}
            <Card dark={dark}>
              <CardTitle icon={BarChart2} title="Headcount by Department" sub={`${total} total employees`} color={COLORS.primary} dark={dark}/>
              <div style={{ display:"flex", alignItems:"center", gap: GAP.xl }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={topSlices(DEPT_DATA, "value", 6)} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={46} paddingAngle={3}>
                      {topSlices(DEPT_DATA, "value", 6).map((_,i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                    </Pie>
                    <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  {DEPT_DATA.map((d,i) => (
                    <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap: GAP.xs }}>
                        <div style={{ width:10, height:10, borderRadius: RADIUS.full, background: PALETTE[i%PALETTE.length], flexShrink:0 }}/>
                        <span style={{ fontSize: FONT_SIZE.sm, color: sub }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: text }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Gender diversity */}
            <Card dark={dark}>
              <CardTitle icon={Users} title="Gender Diversity" sub="Workforce composition" color={COLORS.purple} dark={dark}/>
              <div style={{ display:"flex", alignItems:"center", gap: GAP.xl }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={GENDER_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={46} paddingAngle={4}>
                      {GENDER_DATA.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                    </Pie>
                    <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1 }}>
                  {GENDER_DATA.map((d) => {
                    const pct = Math.round((d.value/total)*100);
                    return (
                      <div key={d.name} style={{ marginBottom: SPACING[4] }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize: FONT_SIZE.sm, color: sub }}>{d.name}</span>
                          <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: text }}>{d.value} ({pct}%)</span>
                        </div>
                        <div style={{ height:8, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background: d.fill, borderRadius: RADIUS.full }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: GAP.md }}>
            {/* Age distribution */}
            <Card dark={dark}>
              <CardTitle icon={Users} title="Age Distribution" sub="Employees by age group" color={COLORS.info} dark={dark}/>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={AGE_DATA} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="name" tick={axisTick}/>
                  <YAxis tick={axisTick} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  <Bar dataKey="value" name="Employees" radius={[RADIUS.sm,RADIUS.sm,0,0]}>
                    {AGE_DATA.map((_,i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Tenure distribution */}
            <Card dark={dark}>
              <CardTitle icon={Clock} title="Tenure Distribution" sub="Years of service" color={COLORS.success} dark={dark}/>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={TENURE_DATA} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="name" tick={axisTick}/>
                  <YAxis tick={axisTick} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  <Bar dataKey="value" name="Employees" radius={[RADIUS.sm,RADIUS.sm,0,0]}>
                    {TENURE_DATA.map((_,i) => <Cell key={i} fill={[COLORS.danger,COLORS.warning,COLORS.success,COLORS.primary][i]||COLORS.info}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: COMPENSATION (Salary Heatmap)
      ══════════════════════════════════════════════════════════ */}
      {tab === "compensation" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>
            {/* Salary heatmap by dept */}
            <Card dark={dark}>
              <CardTitle icon={Wallet} title="Salary Heatmap by Department" sub="Min / Avg / Max per department" color={COLORS.purple} dark={dark}/>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={SALARY_BY_DEPT} barGap={4} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="dept" tick={axisTick}/>
                  <YAxis tick={axisTick} tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`}/>
                  <Tooltip content={<ChartTooltip dark={dark} prefix="₹"/>}/>
                  <Bar dataKey="min"  name="Min"  fill={COLORS.primaryLight} radius={[RADIUS.sm,RADIUS.sm,0,0]}/>
                  <Bar dataKey="avg"  name="Avg"  fill={COLORS.primary}      radius={[RADIUS.sm,RADIUS.sm,0,0]}/>
                  <Bar dataKey="max"  name="Max"  fill={COLORS.purple}        radius={[RADIUS.sm,RADIUS.sm,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display:"flex", gap: GAP.lg, marginTop: GAP.sm }}>
                {[["Min", COLORS.primaryLight],["Avg", COLORS.primary],["Max", COLORS.purple]].map(([l,c]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap: GAP.xs }}>
                    <div style={{ width:10, height:10, borderRadius:2, background: c }}/>
                    <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{l}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Salary summary table */}
            <Card dark={dark} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:`${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom:`1px solid ${border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                  <div style={{ width:32, height:32, borderRadius: RADIUS.lg, background: COLORS.purpleMuted, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Wallet size={16} color={COLORS.purple} stroke={2}/>
                  </div>
                  <p style={{ margin:0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: text }}>Salary Summary</p>
                </div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background: surface.theadBg }}>
                    {["Dept","Min","Avg","Max"].map((h) => (
                      <th key={h} style={{ padding:PADDING.tableHeader, textAlign:"left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: sub, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SALARY_BY_DEPT.map((d,i,arr) => (
                    <tr key={d.dept} style={{ borderBottom: i<arr.length-1 ? `1px solid ${border}` : "none" }}>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text }}>{d.dept}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.xs, color: sub }}>₹{(d.min/1000).toFixed(0)}k</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary }}>₹{(d.avg/1000).toFixed(0)}k</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.xs, color: sub }}>₹{(d.max/1000).toFixed(0)}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Individual salary list */}
          <Card dark={dark} style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${border}` }}>
              <p style={{ margin:0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>Employee Salary Breakdown</p>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background: surface.theadBg }}>
                    {["Employee","Department","Salary","% of Dept Avg","Band"].map((h) => (
                      <th key={h} style={{ padding: PADDING.tableHeader, textAlign:"left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: sub, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${border}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...EMPLOYEES].sort((a,b) => b.salary - a.salary).map((e,i,arr) => {
                    const deptAvg = SALARY_BY_DEPT.find(d => d.dept === e.dept)?.avg || 1;
                    const pct = Math.round((e.salary / deptAvg) * 100);
                    const band = e.salary >= 80000 ? { label:"Senior", color: COLORS.purple, bg: COLORS.purpleMuted } :
                                 e.salary >= 65000 ? { label:"Mid",    color: COLORS.primary, bg: COLORS.primaryMuted } :
                                                     { label:"Junior", color: COLORS.success, bg: COLORS.successLight };
                    return (
                      <tr key={e.name} style={{ borderBottom: i<arr.length-1 ? `1px solid ${border}` : "none" }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.background = surface.rowHover)}
                        onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text }}>{e.name}</td>
                        <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: sub }}>{e.dept}</td>
                        <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: text }}>₹{e.salary.toLocaleString("en-IN")}</td>
                        <td style={{ padding: PADDING.tableCell }}>
                          <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                            <div style={{ flex:1, height:6, background: border, borderRadius: RADIUS.full, overflow:"hidden", maxWidth:80 }}>
                              <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background: pct>100 ? COLORS.success : pct<90 ? COLORS.warning : COLORS.primary, borderRadius: RADIUS.full }}/>
                            </div>
                            <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: PADDING.tableCell }}>
                          <span style={{ display:"inline-block", padding:"2px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: band.bg, color: band.color }}>{band.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: LEAVE UTILIZATION
      ══════════════════════════════════════════════════════════ */}
      {tab === "leave" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>
            <Card dark={dark}>
              <CardTitle icon={Calendar} title="Leave Utilization by Department" sub="Used vs Total days" color={COLORS.warning} dark={dark}/>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={LEAVE_BY_DEPT} barGap={4} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="dept" tick={axisTick}/>
                  <YAxis tick={axisTick} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  <Bar dataKey="total" name="Total"  fill={border}          radius={[RADIUS.sm,RADIUS.sm,0,0]}/>
                  <Bar dataKey="used"  name="Used"   fill={COLORS.warning}  radius={[RADIUS.sm,RADIUS.sm,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card dark={dark}>
              <CardTitle icon={Target} title="Leave % Utilization" sub="Used vs allocated %" color={COLORS.danger} dark={dark}/>
              <div style={{ display:"flex", flexDirection:"column", gap: SPACING[4], marginTop: SPACING[2] }}>
                {LEAVE_BY_DEPT.map((d) => (
                  <div key={d.dept}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text }}>{d.dept}</span>
                      <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: d.pct>65 ? COLORS.danger : d.pct>45 ? COLORS.warning : COLORS.success }}>{d.pct}%</span>
                    </div>
                    <div style={{ height:10, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${d.pct}%`, background: d.pct>65 ? COLORS.danger : d.pct>45 ? COLORS.warning : COLORS.success, borderRadius: RADIUS.full, transition:"width 0.5s" }}/>
                    </div>
                    <p style={{ margin:"3px 0 0", fontSize: FONT_SIZE.xs, color: sub }}>{d.used} of {d.total} days used</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card dark={dark}>
            <CardTitle icon={Calendar} title="Department Leave Summary Table" color={COLORS.primary} dark={dark}/>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background: surface.theadBg }}>
                  {["Department","Total Days","Used","Remaining","Utilization","Status"].map((h) => (
                    <th key={h} style={{ padding: PADDING.tableHeader, textAlign:"left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: sub, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEAVE_BY_DEPT.map((d,i,arr) => {
                  const status = d.pct > 65 ? { label:"High",   bg: COLORS.dangerMuted,  color: COLORS.danger  } :
                                 d.pct > 45 ? { label:"Medium", bg: COLORS.warningLight, color: COLORS.warning } :
                                              { label:"Low",    bg: COLORS.successLight, color: COLORS.success };
                  return (
                    <tr key={d.dept} style={{ borderBottom: i<arr.length-1 ? `1px solid ${border}` : "none" }}>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text }}>{d.dept}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: sub }}>{d.total}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.warning }}>{d.used}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: COLORS.success }}>{d.total - d.used}</td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                          <div style={{ flex:1, height:6, background: border, borderRadius: RADIUS.full, overflow:"hidden", maxWidth:80 }}>
                            <div style={{ height:"100%", width:`${d.pct}%`, background: d.pct>65 ? COLORS.danger : d.pct>45 ? COLORS.warning : COLORS.success, borderRadius: RADIUS.full }}/>
                          </div>
                          <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{d.pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <span style={{ display:"inline-block", padding:"2px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: status.bg, color: status.color }}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: HIRING FUNNEL
      ══════════════════════════════════════════════════════════ */}
      {tab === "hiring" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>
            {/* Funnel visual */}
            <Card dark={dark}>
              <CardTitle icon={UserPlus} title="Hiring Pipeline Funnel" sub="Current open positions" color={COLORS.success} dark={dark}/>
              <div style={{ display:"flex", flexDirection:"column", gap: GAP.sm, marginTop: SPACING[2] }}>
                {HIRING_FUNNEL.map((s,i) => {
                  const pct = Math.round((s.value / HIRING_FUNNEL[0].value) * 100);
                  const dropPct = i > 0 ? Math.round(((HIRING_FUNNEL[i-1].value - s.value) / HIRING_FUNNEL[i-1].value) * 100) : 0;
                  return (
                    <div key={s.stage}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text }}>{s.stage}</span>
                        <div style={{ display:"flex", gap: GAP.md }}>
                          {i > 0 && <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.danger }}>−{dropPct}% drop</span>}
                          <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: s.fill }}>{s.value}</span>
                        </div>
                      </div>
                      <div style={{ height:28, background: border, borderRadius: RADIUS.md, overflow:"hidden", position:"relative" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background: s.fill, borderRadius: RADIUS.md, display:"flex", alignItems:"center", paddingLeft: SPACING[3] }}>
                          <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.white, whiteSpace:"nowrap" }}>{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Conversion rates */}
            <Card dark={dark}>
              <CardTitle icon={Target} title="Conversion Rates" sub="Stage-to-stage efficiency" color={COLORS.primary} dark={dark}/>
              <div style={{ display:"flex", flexDirection:"column", gap: SPACING[4] }}>
                {[
                  { label:"Applied → Screened",    from:"Applied",     to:"Screened",    color: COLORS.primary  },
                  { label:"Screened → Interviewed", from:"Screened",    to:"Interviewed", color: COLORS.purple   },
                  { label:"Interviewed → Offered",  from:"Interviewed", to:"Offered",     color: COLORS.warning  },
                  { label:"Offered → Hired",        from:"Offered",     to:"Hired",       color: COLORS.success  },
                ].map((row) => {
                  const from = HIRING_FUNNEL.find(s => s.stage === row.from)?.value || 1;
                  const to   = HIRING_FUNNEL.find(s => s.stage === row.to)?.value   || 0;
                  const pct  = Math.round((to / from) * 100);
                  return (
                    <div key={row.label}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize: FONT_SIZE.sm, color: sub }}>{row.label}</span>
                        <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: row.color }}>{pct}%</span>
                      </div>
                      <div style={{ height:8, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background: row.color, borderRadius: RADIUS.full }}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: SPACING[3], padding: SPACING[3], background: COLORS.successLight, borderRadius: RADIUS.xl, border:`1px solid ${COLORS.successMuted}` }}>
                  <p style={{ margin:0, fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: FONT_WEIGHT.semibold }}>
                    Overall Hire Rate: {Math.round((HIRING_FUNNEL[4].value / HIRING_FUNNEL[0].value) * 100)}%
                  </p>
                  <p style={{ margin:"2px 0 0", fontSize: FONT_SIZE.xs, color: COLORS.success }}>{HIRING_FUNNEL[4].value} hired from {HIRING_FUNNEL[0].value} applicants</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Funnel stages detail table */}
          <Card dark={dark} style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${border}` }}>
              <p style={{ margin:0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>Pipeline Stage Breakdown</p>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background: surface.theadBg }}>
                  {["Stage","Candidates","% of Total","Drop from Previous","Conversion"].map((h) => (
                    <th key={h} style={{ padding: PADDING.tableHeader, textAlign:"left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: sub, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HIRING_FUNNEL.map((s,i,arr) => {
                  const totalPct = Math.round((s.value/arr[0].value)*100);
                  const drop     = i > 0 ? arr[i-1].value - s.value : 0;
                  const dropPct  = i > 0 ? Math.round((drop / arr[i-1].value) * 100) : 0;
                  return (
                    <tr key={s.stage} style={{ borderBottom: i<arr.length-1 ? `1px solid ${border}` : "none" }}>
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                          <div style={{ width:10, height:10, borderRadius: RADIUS.full, background: s.fill }}/>
                          <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text }}>{s.stage}</span>
                        </div>
                      </td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: s.fill }}>{s.value}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: sub }}>{totalPct}%</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: i > 0 ? COLORS.danger : sub }}>{i > 0 ? `−${drop} (${dropPct}%)` : "—"}</td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ height:6, background: border, borderRadius: RADIUS.full, overflow:"hidden", maxWidth:100 }}>
                          <div style={{ height:"100%", width:`${totalPct}%`, background: s.fill, borderRadius: RADIUS.full }}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: TOP PERFORMERS LEADERBOARD
      ══════════════════════════════════════════════════════════ */}
      {tab === "performers" && (
        <>
          {/* Top 3 podium */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: GAP.md, marginBottom: GAP.md }}>
            {TOP_PERFORMERS.slice(0,3).map((e,i) => {
              const medals = ["🥇","🥈","🥉"];
              const accentColors = [COLORS.warning, COLORS.gray600, COLORS.orange];
              const accentBgs    = [COLORS.warningLight, COLORS.gray100, COLORS.orangeLight];
              return (
                <Card key={e.name} dark={dark} style={{ textAlign:"center", background: dark ? COLORS.dark.cardBg : COLORS.surfaceLight, border: i===0 ? `2px solid ${COLORS.warning}` : `1px solid ${border}` }}>
                  <div style={{ fontSize:32, marginBottom: SPACING[3] }}>{medals[i]}</div>
                  <div style={{ width:52, height:52, borderRadius: RADIUS.full, background: PALETTE[i]+"25", color: PALETTE[i], display:"flex", alignItems:"center", justifyContent:"center", fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, margin:"0 auto", marginBottom: SPACING[3], border:`2px solid ${PALETTE[i]}` }}>
                    {e.name.slice(0,1)}
                  </div>
                  <p style={{ margin:0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>{e.name}</p>
                  <p style={{ margin:"2px 0 0", fontSize: FONT_SIZE.xs, color: sub }}>{e.dept}</p>
                  <div style={{ display:"inline-flex", alignItems:"center", gap: GAP.xs, marginTop: SPACING[3], padding:"4px 14px", borderRadius: RADIUS.full, background: accentBgs[i], color: accentColors[i] }}>
                    <Star size={12} fill={accentColors[i]} color={accentColors[i]}/>
                    <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold }}>{e.score} pts</span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap: GAP.md }}>
            {/* Full leaderboard table */}
            <Card dark={dark} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${border}` }}>
                <p style={{ margin:0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: text }}>Full Performance Leaderboard</p>
                <p style={{ margin:"2px 0 0", fontSize: FONT_SIZE.xs, color: sub }}>Ranked by performance score</p>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background: surface.theadBg }}>
                    {["Rank","Employee","Dept","Score","Grade"].map((h) => (
                      <th key={h} style={{ padding: PADDING.tableHeader, textAlign:"left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: sub, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${border}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...EMPLOYEES].sort((a,b) => b.score - a.score).map((e,i,arr) => {
                    const grade = e.score >= 90 ? { label:"A+", color: COLORS.success, bg: COLORS.successLight } :
                                  e.score >= 80 ? { label:"A",  color: COLORS.primary, bg: COLORS.primaryMuted } :
                                  e.score >= 70 ? { label:"B",  color: COLORS.warning, bg: COLORS.warningLight } :
                                                  { label:"C",  color: COLORS.danger,  bg: COLORS.dangerMuted  };
                    return (
                      <tr key={e.name} style={{ borderBottom: i<arr.length-1 ? `1px solid ${border}` : "none" }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.background = surface.rowHover)}
                        onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: i<3 ? [COLORS.warning,COLORS.gray600,COLORS.orange][i] : sub }}>
                          {i<3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                        </td>
                        <td style={{ padding: PADDING.tableCell }}>
                          <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                            <div style={{ width:28, height:28, borderRadius: RADIUS.full, background: PALETTE[i%PALETTE.length]+"22", color: PALETTE[i%PALETTE.length], display:"flex", alignItems:"center", justifyContent:"center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink:0 }}>
                              {e.name.slice(0,1)}
                            </div>
                            <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: text }}>{e.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.xs, color: sub }}>{e.dept}</td>
                        <td style={{ padding: PADDING.tableCell }}>
                          <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                            <div style={{ flex:1, height:5, background: border, borderRadius: RADIUS.full, overflow:"hidden", maxWidth:60 }}>
                              <div style={{ height:"100%", width:`${e.score}%`, background: grade.color, borderRadius: RADIUS.full }}/>
                            </div>
                            <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: grade.color }}>{e.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: PADDING.tableCell }}>
                          <span style={{ display:"inline-block", padding:"2px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, background: grade.bg, color: grade.color }}>{grade.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>

            {/* Score distribution chart */}
            <Card dark={dark}>
              <CardTitle icon={Award} title="Score Distribution" sub="Performance grade spread" color={COLORS.warning} dark={dark}/>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { grade:"A+ (90+)", count: EMPLOYEES.filter(e=>e.score>=90).length,  fill: COLORS.success },
                  { grade:"A (80+)",  count: EMPLOYEES.filter(e=>e.score>=80&&e.score<90).length, fill: COLORS.primary },
                  { grade:"B (70+)",  count: EMPLOYEES.filter(e=>e.score>=70&&e.score<80).length, fill: COLORS.warning },
                  { grade:"C (<70)", count: EMPLOYEES.filter(e=>e.score<70).length,    fill: COLORS.danger  },
                ]} barSize={38}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="grade" tick={{ ...axisTick, fontSize:"0.65rem" }}/>
                  <YAxis tick={axisTick} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip dark={dark}/>}/>
                  <Bar dataKey="count" name="Employees" radius={[RADIUS.sm,RADIUS.sm,0,0]}>
                    {[COLORS.success,COLORS.primary,COLORS.warning,COLORS.danger].map((c,i) => <Cell key={i} fill={c}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Avg score by dept */}
              <div style={{ marginTop: SPACING[4], borderTop:`1px solid ${border}`, paddingTop: SPACING[4] }}>
                <p style={{ margin:`0 0 ${SPACING[3]}px`, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: sub, textTransform:"uppercase", letterSpacing:"0.05em" }}>Avg Score by Dept</p>
                {Object.entries(
                  EMPLOYEES.reduce((acc,e) => {
                    if (!acc[e.dept]) acc[e.dept] = [];
                    acc[e.dept].push(e.score);
                    return acc;
                  }, {})
                ).map(([dept, scores]) => {
                  const avg = Math.round(scores.reduce((s,v)=>s+v,0)/scores.length);
                  return (
                    <div key={dept} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontSize: FONT_SIZE.xs, color: sub }}>{dept}</span>
                      <div style={{ display:"flex", alignItems:"center", gap: GAP.sm }}>
                        <div style={{ width:60, height:5, background: border, borderRadius: RADIUS.full, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${avg}%`, background: avg>=90?COLORS.success:avg>=80?COLORS.primary:COLORS.warning, borderRadius: RADIUS.full }}/>
                        </div>
                        <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: text, width:24 }}>{avg}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}

    </div>
  );
};

export default Analytics;
