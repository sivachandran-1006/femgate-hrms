import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, UserCheck, UserMinus, Clock, Wallet,
  Calendar, Bell, ArrowUpRight, ArrowDownRight,
  AlertCircle, Award, CheckCheck, Target, TrendingUp,
  BookOpen, ShieldCheck, FileText,
} from "lucide-react";

import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useFetchAllLeaves }    from "../../queries/useLeaves";
import { AppLoader }            from "../../components/ui/AppLoader";
import { useAuth }              from "../../hooks/useAuth";
import { COLORS }               from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, GAP, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE } from "../../theme/sizes";
import { getAvatarColor, getInitials } from "../../utils/helpers";

// ── Static reference data ─────────────────────────────────────────────────────

const MONTHLY_HEADCOUNT = [
  { month:"Jan",employees:8, joiners:1 },{ month:"Feb",employees:8, joiners:0 },
  { month:"Mar",employees:9, joiners:1 },{ month:"Apr",employees:10,joiners:1 },
  { month:"May",employees:11,joiners:1 },{ month:"Jun",employees:13,joiners:2 },
];

const ATTENDANCE_WEEK = [
  { day:"Mon",present:11,absent:1,leave:1 },{ day:"Tue",present:12,absent:0,leave:1 },
  { day:"Wed",present:10,absent:2,leave:1 },{ day:"Thu",present:12,absent:0,leave:1 },
  { day:"Fri",present:11,absent:1,leave:1 },{ day:"Sat",present:5, absent:0,leave:0 },
];

const PAYROLL_MONTHS = [
  { month:"Jan",payroll:520000 },{ month:"Feb",payroll:535000 },
  { month:"Mar",payroll:548000 },{ month:"Apr",payroll:562000 },
  { month:"May",payroll:578000 },{ month:"Jun",payroll:591000 },
];

const LEAVE_PIPELINE = [
  { name:"Casual Leave", value:4, color: COLORS.warning },
  { name:"Sick Leave",   value:3, color: COLORS.danger  },
  { name:"Annual Leave", value:2, color: COLORS.primary },
];

const ANNOUNCEMENTS = [
  { id:1, title:"Q2 Appraisal Cycle Begins",   date:"Jun 5, 2026",  tag:"HR",      color:COLORS.primary },
  { id:2, title:"Office Closed — National Day", date:"Jun 10, 2026", tag:"Admin",   color:COLORS.warning },
  { id:3, title:"New Payroll Policy Effective",  date:"Jun 15, 2026", tag:"Finance", color:COLORS.success },
  { id:4, title:"Team Building Event",           date:"Jun 20, 2026", tag:"HR",      color:COLORS.purple  },
];

const UPCOMING_EVENTS = [
  { label:"Arjun Kumar joining",  date:"Jun 3",  color:COLORS.success },
  { label:"Q2 Appraisal kickoff", date:"Jun 5",  color:COLORS.primary },
  { label:"Payroll processing",   date:"Jun 10", color:COLORS.warning },
  { label:"National Holiday",     date:"Jun 10", color:COLORS.danger  },
];

const RECENT_ACTIVITY = [
  { id:1, name:"Arjun Kumar", action:"Joined onboarding",       time:"2h ago",  type:"join"     },
  { id:2, name:"Safeer",      action:"Leave request approved",   time:"3h ago",  type:"leave"    },
  { id:3, name:"Suriya",      action:"Performance review due",   time:"1d ago",  type:"alert"    },
  { id:4, name:"Mani",        action:"Check-in recorded",        time:"1d ago",  type:"attend"   },
  { id:5, name:"Big Kundi",   action:"Onboarding completed",     time:"2d ago",  type:"complete" },
];

const ACTIVITY_ICON = {
  join:     { icon:<UserCheck   size={14}/>, bg:COLORS.successLight, color:COLORS.success },
  leave:    { icon:<Calendar    size={14}/>, bg:COLORS.warningLight, color:COLORS.warning },
  alert:    { icon:<AlertCircle size={14}/>, bg:COLORS.dangerMuted,  color:COLORS.danger  },
  attend:   { icon:<Clock       size={14}/>, bg:COLORS.primaryMuted, color:COLORS.primary },
  complete: { icon:<Award       size={14}/>, bg:COLORS.purpleMuted,  color:COLORS.purple  },
};

const NOTIF_BY_ROLE = {
  SUPER_ADMIN: [
    { id:1, title:"Arjun Kumar submitted a leave request",  time:"2 min ago", type:"leave",   dotColor:COLORS.orange  },
    { id:2, title:"Payroll for May 2026 processed",         time:"1h ago",    type:"payroll", dotColor:COLORS.success },
    { id:3, title:"Q2 Appraisal cycle starts Jun 5",        time:"1d ago",    type:"info",    dotColor:COLORS.info    },
    { id:4, title:"Safeer's sick leave approved",           time:"2d ago",    type:"leave",   dotColor:COLORS.orange  },
  ],
  ADMIN: [
    { id:1, title:"Arjun Kumar submitted a leave request",  time:"2 min ago", type:"leave",   dotColor:COLORS.orange  },
    { id:2, title:"Payroll for May 2026 processed",         time:"1h ago",    type:"payroll", dotColor:COLORS.success },
    { id:3, title:"Asset LT-009 assigned to Mani",          time:"2d ago",    type:"asset",   dotColor:COLORS.purple  },
  ],
  HR: [
    { id:1, title:"Aravinth submitted a leave request",     time:"30 min ago",type:"leave",   dotColor:COLORS.orange  },
    { id:2, title:"Priya onboarding completed",             time:"2h ago",    type:"success", dotColor:COLORS.success },
    { id:3, title:"Performance review cycle starts Jun 5",  time:"1d ago",    type:"info",    dotColor:COLORS.info    },
  ],
  MANAGER: [
    { id:1, title:"Aravinth requested leave Jun 2–3",       time:"1h ago",    type:"leave",   dotColor:COLORS.orange  },
    { id:2, title:"Sabari's performance review is due",     time:"1d ago",    type:"alert",   dotColor:COLORS.danger  },
    { id:3, title:"Team standup at 10 AM today",            time:"2d ago",    type:"info",    dotColor:COLORS.info    },
  ],
  FINANCE: [
    { id:1, title:"May 2026 payroll processed successfully", time:"1h ago",   type:"payroll", dotColor:COLORS.success },
    { id:2, title:"New payroll policy effective Jun 15",     time:"1d ago",   type:"info",    dotColor:COLORS.info    },
    { id:3, title:"Safeer expense claim pending approval",   time:"2d ago",   type:"leave",   dotColor:COLORS.orange  },
  ],
  EMPLOYEE: [
    { id:1, title:"Your leave request was approved",         time:"3h ago",   type:"success", dotColor:COLORS.success },
    { id:2, title:"Q2 appraisal form is due Jun 10",         time:"1d ago",   type:"alert",   dotColor:COLORS.danger  },
    { id:3, title:"Team building event on Jun 20",           time:"2d ago",   type:"info",    dotColor:COLORS.info    },
  ],
};

const fmtINR = (v) => `₹${(v/1000).toFixed(0)}k`;

// ── Shared sub-components ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color, bg, trend, up, dark }) => {
  const cardBg = dark ? COLORS.dark.cardBg : COLORS.surfaceLight;
  const border = dark ? COLORS.dark.border : COLORS.borderLight;
  const text   = dark ? COLORS.dark.text   : COLORS.textLight;
  const subClr = dark ? COLORS.dark.subtext: COLORS.textMutedLight;
  return (
    <div style={{ background:cardBg, borderRadius:RADIUS["2xl"], border:`1px solid ${border}`, boxShadow:SHADOW.card, padding:SPACING[4] }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:SPACING[3] }}>
        <div style={{ width:40,height:40, borderRadius:RADIUS.lg, background:bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={ICON_SIZE.md} color={color}/>
        </div>
        {trend && (
          <span style={{ display:"flex", alignItems:"center", gap:2, fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:up?COLORS.success:COLORS.danger }}>
            {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {trend}
          </span>
        )}
      </div>
      <p style={{ margin:0, fontSize:FONT_SIZE["2xl"], fontWeight:FONT_WEIGHT.bold, color:text, lineHeight:1 }}>{value}</p>
      <p style={{ margin:"4px 0 1px", fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.medium, color:text }}>{label}</p>
      {sub && <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:subClr }}>{sub}</p>}
    </div>
  );
};

// ── Role-specific dashboards ──────────────────────────────────────────────────

// ADMIN / SUPER_ADMIN — full view
const AdminDashboard = ({ employees, leaves, dark, user, userRole, tokens }) => {
  const { cardBg, border, text, subtext, divider, inputBg, axisTick, gridLine } = tokens;
  const total        = employees.length;
  const present      = employees.filter((e) => e.status==="Present").length;
  const onLeave      = employees.filter((e) => e.status==="Leave").length;
  const absent       = Math.max(0, total - present - onLeave);
  const pendingLeaves= leaves.filter((l) => l.status==="Pending").length;
  const attendPct    = total>0 ? Math.round((present/total)*100) : 0;
  const totalPayroll = employees.reduce((s,e)=>s+(Number(e.salary)||0),0);
  const avgSalary    = total>0 ? Math.round(totalPayroll/total) : 0;
  const deptCount    = new Set(employees.map((e)=>e.department).filter(Boolean)).size;

  const deptDist = Object.entries(
    employees.reduce((acc,e)=>{ acc[e.department]=(acc[e.department]||0)+1; return acc; },{})
  ).map(([name,value],i)=>({ name,value, color:[COLORS.primary,COLORS.purple,COLORS.success,COLORS.warning,COLORS.info,COLORS.orange][i%6] }));

  const attendancePie = [
    { name:"Present", value:present, color:COLORS.success },
    { name:"Absent",  value:absent,  color:COLORS.danger  },
    { name:"Leave",   value:onLeave, color:COLORS.warning },
  ].filter((d)=>d.value>0);

  const TopPerformers = employees
    .filter((e)=>Number(e.score)>0)
    .sort((a,b)=>Number(b.score)-Number(a.score))
    .slice(0,4)
    .map((e)=>({ name:e.name, dept:e.department, score:Number(e.score) }));

  const Tooltip2 = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:RADIUS.lg, padding:"8px 12px", fontSize:FONT_SIZE.xs }}>
        <p style={{ margin:"0 0 3px", fontWeight:FONT_WEIGHT.semibold, color:text }}>{label}</p>
        {payload.map((p)=><p key={p.dataKey} style={{ margin:0, color:p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
      </div>
    );
  };

  const Card = ({ children, style={} }) => (
    <div style={{ background:cardBg, borderRadius:RADIUS["2xl"], border:`1px solid ${border}`, boxShadow:SHADOW.card, padding:PADDING.card, ...style }}>
      {children}
    </div>
  );
  const SecTitle = ({ title, sub }) => (
    <div style={{ marginBottom:SPACING[4] }}>
      <p style={{ margin:0, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.bold, color:text }}>{title}</p>
      {sub && <p style={{ margin:"2px 0 0", fontSize:FONT_SIZE.xs, color:subtext }}>{sub}</p>}
    </div>
  );

  return (
    <>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        <KpiCard dark={dark} icon={Users}     label="Total Employees"   value={total}        sub={`${deptCount} departments`}                               color={COLORS.primary} bg={COLORS.primaryMuted} trend="+3"  up={true}/>
        <KpiCard dark={dark} icon={UserCheck} label="Present Today"     value={present}      sub={`${attendPct}% attendance`}                              color={COLORS.success} bg={COLORS.successLight} trend="+2%" up={true}/>
        <KpiCard dark={dark} icon={UserMinus} label="On Leave"          value={onLeave}      sub="Active leave requests"                                   color={COLORS.warning} bg={COLORS.warningLight} trend="-1"  up={false}/>
        <KpiCard dark={dark} icon={Clock}     label="Pending Approvals" value={pendingLeaves}sub="Awaiting HR review"                                      color={COLORS.danger}  bg={COLORS.dangerMuted}  trend="+2"  up={false}/>
        <KpiCard dark={dark} icon={Wallet}    label="Monthly Payroll"   value={`₹${(totalPayroll/1000).toFixed(0)}k`} sub={`Avg ₹${avgSalary.toLocaleString("en-IN")}`} color={COLORS.purple} bg={COLORS.purpleMuted} trend="+4%" up={true}/>
      </div>

      {/* Row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        <Card>
          <SecTitle title="Headcount Growth" sub="Monthly employee count — 2026"/>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_HEADCOUNT}>
              <defs>
                <linearGradient id="empG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine}/>
              <XAxis dataKey="month" tick={{ fontSize:FONT_SIZE.xs, fill:axisTick }}/>
              <YAxis tick={{ fontSize:FONT_SIZE.xs, fill:axisTick }}/>
              <Tooltip content={<Tooltip2/>}/>
              <Area type="monotone" dataKey="employees" name="Employees" stroke={COLORS.primary} fill="url(#empG)" strokeWidth={2.5} dot={false}/>
              <Area type="monotone" dataKey="joiners"   name="Joiners"   stroke={COLORS.success} fill="none" strokeWidth={2} strokeDasharray="4 3" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle title="Today's Attendance" sub={`${present} present of ${total}`}/>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={attendancePie} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={2}>
                {attendancePie.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<Tooltip2/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.xs }}>
            {attendancePie.map((d)=>(
              <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:GAP.xs }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:d.color }}/>
                  <span style={{ fontSize:FONT_SIZE.xs, color:subtext }}>{d.name}</span>
                </div>
                <span style={{ fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.bold, color:text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:`${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom:`1px solid ${divider}` }}>
            <p style={{ margin:0, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.bold, color:text }}>Today's Numbers</p>
          </div>
          {[
            { label:"Present",        value:present,       color:COLORS.success, pct:attendPct },
            { label:"Absent",         value:absent,        color:COLORS.danger,  pct:total>0?Math.round(absent/total*100):0 },
            { label:"On Leave",       value:onLeave,       color:COLORS.warning, pct:total>0?Math.round(onLeave/total*100):0 },
            { label:"Pending Leaves", value:pendingLeaves, color:COLORS.purple,  pct:null },
            { label:"Departments",    value:deptCount,     color:COLORS.info,    pct:null },
          ].map(({ label,value,color,pct },i,arr)=>(
            <div key={label} style={{ padding:`${SPACING[3]}px ${SPACING[4]}px`, borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:pct!==null?5:0 }}>
                <span style={{ fontSize:FONT_SIZE.sm, color:subtext }}>{label}</span>
                <span style={{ fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.bold, color }}>{value}{pct!==null?` (${pct}%)`:""}</span>
              </div>
              {pct!==null && (
                <div style={{ height:4, background:divider, borderRadius:RADIUS.full, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:RADIUS.full }}/>
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        <Card>
          <SecTitle title="Weekly Attendance" sub="Present / Absent / Leave — this week"/>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={ATTENDANCE_WEEK} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine}/>
              <XAxis dataKey="day" tick={{ fontSize:FONT_SIZE.xs, fill:axisTick }}/>
              <YAxis tick={{ fontSize:FONT_SIZE.xs, fill:axisTick }}/>
              <Tooltip content={<Tooltip2/>}/>
              <Legend wrapperStyle={{ fontSize:FONT_SIZE.xs }}/>
              <Bar dataKey="present" name="Present" fill={COLORS.success} radius={[3,3,0,0]}/>
              <Bar dataKey="absent"  name="Absent"  fill={COLORS.danger}  radius={[3,3,0,0]}/>
              <Bar dataKey="leave"   name="Leave"   fill={COLORS.warning} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle title="Dept Distribution" sub={`${total} employees · ${deptCount} depts`}/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {deptDist.map((d)=>{
              const pct = Math.round((d.value/total)*100);
              return (
                <div key={d.name}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:FONT_SIZE.sm, color:text, fontWeight:FONT_WEIGHT.medium }}>{d.name}</span>
                    <span style={{ fontSize:FONT_SIZE.xs, color:subtext }}>{d.value} ({pct}%)</span>
                  </div>
                  <div style={{ height:7, background:divider, borderRadius:RADIUS.full, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:d.color, borderRadius:RADIUS.full, transition:"width 0.5s" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        <Card>
          <SecTitle title="Payroll Trend" sub="Monthly payroll spend — Jan–Jun 2026"/>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={PAYROLL_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine}/>
              <XAxis dataKey="month" tick={{ fontSize:FONT_SIZE.xs, fill:axisTick }}/>
              <YAxis tickFormatter={fmtINR} tick={{ fontSize:FONT_SIZE.xs, fill:axisTick }}/>
              <Tooltip content={<Tooltip2/>}/>
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke={COLORS.purple} strokeWidth={2.5} dot={{ fill:COLORS.purple, r:4 }} activeDot={{ r:6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle title="Leave by Type" sub="Approved requests this month"/>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={LEAVE_PIPELINE} dataKey="value" cx="50%" cy="50%" outerRadius={52} innerRadius={28} paddingAngle={3}>
                {LEAVE_PIPELINE.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<Tooltip2/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:GAP.sm }}>
            {LEAVE_PIPELINE.map((d)=>(
              <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:d.color }}/>
                  <span style={{ fontSize:FONT_SIZE.xs, color:subtext }}>{d.name}</span>
                </div>
                <span style={{ fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.bold, color:text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:`${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom:`1px solid ${divider}` }}>
            <p style={{ margin:0, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.bold, color:text }}>Top Performers</p>
            <p style={{ margin:"2px 0 0", fontSize:FONT_SIZE.xs, color:subtext }}>Q2 2026 leaderboard</p>
          </div>
          {TopPerformers.map((p,i,arr)=>{
            const av = getAvatarColor(p.name);
            return (
              <div key={p.name} style={{ display:"flex", alignItems:"center", gap:GAP.sm, padding:`${SPACING[3]}px ${SPACING[4]}px`, borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                <div style={{ width:28,height:28,borderRadius:RADIUS.full,background:av.bg,color:av.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.bold,flexShrink:0 }}>
                  {getInitials(p.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                  <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:subtext }}>{p.dept}</p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.bold, color:COLORS.success }}>{p.score}</p>
                  <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:subtext }}>score</p>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Row 4 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 0.9fr", gap:GAP.md }}>
        <Card>
          <SecTitle title="Recent Activity" sub="Latest HR events across the org"/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {RECENT_ACTIVITY.map((a)=>{
              const av   = getAvatarColor(a.name);
              const type = ACTIVITY_ICON[a.type]||ACTIVITY_ICON.attend;
              return (
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:GAP.sm, padding:`${GAP.sm}px 0`, borderBottom:`1px solid ${divider}` }}>
                  <div style={{ width:34,height:34,borderRadius:RADIUS.full,background:av.bg,color:av.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.bold,flexShrink:0 }}>
                    {getInitials(a.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                    <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:subtext }}>{a.action}</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
                    <div style={{ width:24,height:24,borderRadius:RADIUS.full,background:type.bg,display:"flex",alignItems:"center",justifyContent:"center",color:type.color }}>{type.icon}</div>
                    <span style={{ fontSize:10, color:subtext }}>{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SecTitle title="Announcements" sub="Company-wide notices"/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {ANNOUNCEMENTS.map((a,i,arr)=>(
              <div key={a.id} style={{ display:"flex", gap:GAP.sm, paddingBottom:i<arr.length-1?GAP.sm:0, borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                <div style={{ width:3, background:a.color, borderRadius:RADIUS.full, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:GAP.xs }}>
                    <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:text, lineHeight:1.3 }}>{a.title}</p>
                    <span style={{ padding:"1px 7px", borderRadius:RADIUS.full, fontSize:10, fontWeight:FONT_WEIGHT.semibold, background:a.color+"20", color:a.color, whiteSpace:"nowrap", flexShrink:0 }}>{a.tag}</span>
                  </div>
                  <p style={{ margin:"3px 0 0", fontSize:FONT_SIZE.xs, color:subtext, display:"flex", alignItems:"center", gap:4 }}>
                    <Calendar size={10}/> {a.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SecTitle title="Upcoming Events" sub="Next 30 days"/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {UPCOMING_EVENTS.map((e,i,arr)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:GAP.sm, paddingBottom:i<arr.length-1?GAP.sm:0, borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                <div style={{ width:36,height:36,borderRadius:RADIUS.md,background:e.color+"15",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:9, fontWeight:FONT_WEIGHT.bold, color:e.color, textTransform:"uppercase", letterSpacing:"0.05em" }}>{e.date.split(" ")[0]}</span>
                  <span style={{ fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.bold, color:e.color, lineHeight:1 }}>{e.date.split(" ")[1]}</span>
                </div>
                <p style={{ margin:0, fontSize:FONT_SIZE.sm, color:text, lineHeight:1.3 }}>{e.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

// HR MANAGER dashboard
const HRDashboard = ({ employees, leaves, dark, tokens }) => {
  const { cardBg, border, text, subtext, divider, gridLine, axisTick } = tokens;
  const total         = employees.length;
  const present       = employees.filter((e)=>e.status==="Present").length;
  const onLeave       = employees.filter((e)=>e.status==="Leave").length;
  const pendingLeaves = leaves.filter((l)=>l.status==="Pending").length;
  const approvedLeaves= leaves.filter((l)=>l.status==="Approved").length;
  const attendPct     = total>0?Math.round((present/total)*100):0;

  const deptDist = Object.entries(
    employees.reduce((acc,e)=>{ acc[e.department]=(acc[e.department]||0)+1; return acc; },{})
  ).map(([name,value],i)=>({ name,value, color:[COLORS.primary,COLORS.purple,COLORS.success,COLORS.warning][i%4] }));

  const leaveByType = leaves.reduce((acc,l)=>{ const t=l.leaveType||"Other"; acc[t]=(acc[t]||0)+1; return acc; },{});
  const leaveTypeData = Object.entries(leaveByType).map(([name,value],i)=>({ name,value,color:[COLORS.warning,COLORS.danger,COLORS.primary,COLORS.purple][i%4] }));

  const T2 = ({ active,payload,label }) => {
    if (!active||!payload?.length) return null;
    return <div style={{ background:cardBg,border:`1px solid ${border}`,borderRadius:RADIUS.lg,padding:"8px 12px",fontSize:FONT_SIZE.xs }}>
      <p style={{ margin:"0 0 3px",fontWeight:FONT_WEIGHT.semibold,color:text }}>{label}</p>
      {payload.map((p)=><p key={p.dataKey} style={{ margin:0,color:p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>;
  };
  const Card = ({ children,style={} }) => <div style={{ background:cardBg,borderRadius:RADIUS["2xl"],border:`1px solid ${border}`,boxShadow:SHADOW.card,padding:PADDING.card,...style }}>{children}</div>;
  const SecTitle = ({ title,sub }) => <div style={{ marginBottom:SPACING[4] }}><p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>{title}</p>{sub&&<p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{sub}</p>}</div>;

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        <KpiCard dark={dark} icon={Users}     label="Total Employees"    value={total}         sub={`${new Set(employees.map(e=>e.department)).size} departments`} color={COLORS.primary} bg={COLORS.primaryMuted} trend="+3" up={true}/>
        <KpiCard dark={dark} icon={UserCheck} label="Present Today"      value={present}       sub={`${attendPct}% attendance`}  color={COLORS.success} bg={COLORS.successLight} trend="+2%" up={true}/>
        <KpiCard dark={dark} icon={Clock}     label="Pending Approvals"  value={pendingLeaves} sub="Leave requests waiting"      color={COLORS.danger}  bg={COLORS.dangerMuted}/>
        <KpiCard dark={dark} icon={Calendar}  label="Approved Leaves"    value={approvedLeaves}sub="This month"                  color={COLORS.warning} bg={COLORS.warningLight}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        <Card>
          <SecTitle title="Weekly Attendance" sub="Present / Absent / Leave — this week"/>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATTENDANCE_WEEK} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine}/>
              <XAxis dataKey="day" tick={{ fontSize:FONT_SIZE.xs,fill:axisTick }}/>
              <YAxis tick={{ fontSize:FONT_SIZE.xs,fill:axisTick }}/>
              <Tooltip content={<T2/>}/>
              <Legend wrapperStyle={{ fontSize:FONT_SIZE.xs }}/>
              <Bar dataKey="present" name="Present" fill={COLORS.success} radius={[3,3,0,0]}/>
              <Bar dataKey="absent"  name="Absent"  fill={COLORS.danger}  radius={[3,3,0,0]}/>
              <Bar dataKey="leave"   name="Leave"   fill={COLORS.warning} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle title="Leave by Type" sub="All leave requests"/>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={leaveTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={3}>
                {leaveTypeData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<T2/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:GAP.sm }}>
            {leaveTypeData.map((d)=>(
              <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:d.color }}/>
                  <span style={{ fontSize:FONT_SIZE.xs,color:subtext }}>{d.name}</span>
                </div>
                <span style={{ fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.bold,color:text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:GAP.md }}>
        <Card>
          <SecTitle title="Department Distribution" sub={`${total} employees`}/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {deptDist.map((d)=>{
              const pct = Math.round((d.value/total)*100);
              return (
                <div key={d.name}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:FONT_SIZE.sm,color:text,fontWeight:FONT_WEIGHT.medium }}>{d.name}</span>
                    <span style={{ fontSize:FONT_SIZE.xs,color:subtext }}>{d.value} ({pct}%)</span>
                  </div>
                  <div style={{ height:7,background:divider,borderRadius:RADIUS.full,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${pct}%`,background:d.color,borderRadius:RADIUS.full }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SecTitle title="Announcements" sub="Company-wide notices"/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {ANNOUNCEMENTS.slice(0,4).map((a,i,arr)=>(
              <div key={a.id} style={{ display:"flex", gap:GAP.sm, paddingBottom:i<arr.length-1?GAP.sm:0, borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                <div style={{ width:3,background:a.color,borderRadius:RADIUS.full,flexShrink:0 }}/>
                <div>
                  <p style={{ margin:0,fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.semibold,color:text }}>{a.title}</p>
                  <p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

// MANAGER dashboard — team-focused
const ManagerDashboard = ({ employees, leaves, dark, user, tokens }) => {
  const { cardBg, border, text, subtext, divider } = tokens;
  // Manager sees their team (IT dept as example — in real app filter by reportingManager)
  const myTeam        = employees.filter((e)=>e.department==="IT"||e.reportingManager===user?.name);
  const teamTotal     = myTeam.length;
  const teamPresent   = myTeam.filter((e)=>e.status==="Present").length;
  const teamOnLeave   = myTeam.filter((e)=>e.status==="Leave").length;
  const pendingLeaves = leaves.filter((l)=>myTeam.some((e)=>e.name===l.employee)&&l.status==="Pending").length;
  const attendPct     = teamTotal>0?Math.round((teamPresent/teamTotal)*100):0;

  const Card = ({ children,style={} }) => <div style={{ background:cardBg,borderRadius:RADIUS["2xl"],border:`1px solid ${border}`,boxShadow:SHADOW.card,padding:PADDING.card,...style }}>{children}</div>;
  const SecTitle = ({ title,sub }) => <div style={{ marginBottom:SPACING[4] }}><p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>{title}</p>{sub&&<p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{sub}</p>}</div>;

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        <KpiCard dark={dark} icon={Users}     label="My Team Size"      value={teamTotal}    sub="Direct reports"               color={COLORS.primary} bg={COLORS.primaryMuted}/>
        <KpiCard dark={dark} icon={UserCheck} label="Present Today"     value={teamPresent}  sub={`${attendPct}% attendance`}  color={COLORS.success} bg={COLORS.successLight}/>
        <KpiCard dark={dark} icon={UserMinus} label="On Leave"          value={teamOnLeave}  sub="Team members away"            color={COLORS.warning} bg={COLORS.warningLight}/>
        <KpiCard dark={dark} icon={Clock}     label="Pending Approvals" value={pendingLeaves}sub="Leave requests to review"    color={COLORS.danger}  bg={COLORS.dangerMuted}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        {/* Team roster */}
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${border}` }}>
            <p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>My Team</p>
            <p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{teamTotal} members</p>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:dark?COLORS.dark.theadBg:COLORS.gray50 }}>
                {["Employee","Role","Status"].map((h)=>(
                  <th key={h} style={{ padding:PADDING.tableHeader,textAlign:"left",fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,color:subtext,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:`1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myTeam.map((e,i,arr)=>{
                const av = getAvatarColor(e.name);
                const statusColor = e.status==="Present"?COLORS.success:e.status==="Leave"?COLORS.warning:COLORS.danger;
                const statusBg    = e.status==="Present"?COLORS.successLight:e.status==="Leave"?COLORS.warningLight:COLORS.dangerMuted;
                return (
                  <tr key={e._id} style={{ borderBottom:i<arr.length-1?`1px solid ${border}`:"none" }}>
                    <td style={{ padding:PADDING.tableCell }}>
                      <div style={{ display:"flex",alignItems:"center",gap:GAP.sm }}>
                        <div style={{ width:30,height:30,borderRadius:RADIUS.full,background:av.bg,color:av.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.bold,flexShrink:0 }}>
                          {getInitials(e.name)}
                        </div>
                        <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:text }}>{e.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:PADDING.tableCell,fontSize:FONT_SIZE.xs,color:subtext }}>{e.designation}</td>
                    <td style={{ padding:PADDING.tableCell }}>
                      <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:statusBg,color:statusColor }}>
                        <span style={{ width:5,height:5,borderRadius:"50%",background:statusColor,display:"inline-block" }}/>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:GAP.md }}>
          <Card>
            <SecTitle title="Upcoming Events" sub="Next 30 days"/>
            <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
              {UPCOMING_EVENTS.slice(0,3).map((e,i,arr)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:GAP.sm,paddingBottom:i<arr.length-1?GAP.sm:0,borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                  <div style={{ width:34,height:34,borderRadius:RADIUS.md,background:e.color+"15",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontSize:9,fontWeight:FONT_WEIGHT.bold,color:e.color,textTransform:"uppercase" }}>{e.date.split(" ")[0]}</span>
                    <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:e.color,lineHeight:1 }}>{e.date.split(" ")[1]}</span>
                  </div>
                  <p style={{ margin:0,fontSize:FONT_SIZE.sm,color:text }}>{e.label}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SecTitle title="Announcements"/>
            <div style={{ display:"flex",flexDirection:"column",gap:GAP.sm }}>
              {ANNOUNCEMENTS.slice(0,3).map((a,i,arr)=>(
                <div key={a.id} style={{ display:"flex",gap:GAP.sm,paddingBottom:i<arr.length-1?GAP.sm:0,borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                  <div style={{ width:3,background:a.color,borderRadius:RADIUS.full,flexShrink:0 }}/>
                  <p style={{ margin:0,fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:text }}>{a.title}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

// FINANCE dashboard — payroll focused
const FinanceDashboard = ({ employees, dark, tokens }) => {
  const { cardBg, border, text, subtext, divider, gridLine, axisTick } = tokens;
  const totalPayroll = employees.reduce((s,e)=>s+(Number(e.salary)||0),0);
  const avgSalary    = employees.length>0?Math.round(totalPayroll/employees.length):0;
  const maxSalary    = Math.max(...employees.map((e)=>Number(e.salary)||0),0);
  const minSalary    = Math.min(...employees.filter((e)=>Number(e.salary)>0).map((e)=>Number(e.salary)),Infinity);

  const deptPayroll = Object.entries(
    employees.reduce((acc,e)=>{ acc[e.department]=(acc[e.department]||0)+(Number(e.salary)||0); return acc; },{})
  ).map(([dept,total])=>({ dept,total }));

  const T2 = ({ active,payload,label }) => {
    if (!active||!payload?.length) return null;
    return <div style={{ background:cardBg,border:`1px solid ${border}`,borderRadius:RADIUS.lg,padding:"8px 12px",fontSize:FONT_SIZE.xs }}>
      <p style={{ margin:"0 0 3px",fontWeight:FONT_WEIGHT.semibold,color:text }}>{label}</p>
      {payload.map((p)=><p key={p.dataKey} style={{ margin:0,color:p.color }}>{p.name}: <strong>₹{p.value?.toLocaleString("en-IN")}</strong></p>)}
    </div>;
  };
  const Card = ({ children,style={} }) => <div style={{ background:cardBg,borderRadius:RADIUS["2xl"],border:`1px solid ${border}`,boxShadow:SHADOW.card,padding:PADDING.card,...style }}>{children}</div>;
  const SecTitle = ({ title,sub }) => <div style={{ marginBottom:SPACING[4] }}><p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>{title}</p>{sub&&<p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{sub}</p>}</div>;

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        <KpiCard dark={dark} icon={Wallet}     label="Total Monthly Payroll" value={`₹${(totalPayroll/1000).toFixed(0)}k`}  sub="All employees"   color={COLORS.purple}  bg={COLORS.purpleMuted}  trend="+4%" up={true}/>
        <KpiCard dark={dark} icon={TrendingUp} label="Average Salary"        value={`₹${(avgSalary/1000).toFixed(1)}k`}     sub="Per employee"    color={COLORS.primary} bg={COLORS.primaryMuted} />
        <KpiCard dark={dark} icon={Award}      label="Highest Salary"        value={`₹${(maxSalary/1000).toFixed(0)}k`}     sub="Top earner"      color={COLORS.success} bg={COLORS.successLight} />
        <KpiCard dark={dark} icon={ShieldCheck}label="Payroll Status"        value="On Track"                               sub="Jun 2026 payroll" color={COLORS.info}    bg={COLORS.infoLight}   />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        <Card>
          <SecTitle title="Payroll Trend" sub="Monthly payroll spend — Jan–Jun 2026"/>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={PAYROLL_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine}/>
              <XAxis dataKey="month" tick={{ fontSize:FONT_SIZE.xs,fill:axisTick }}/>
              <YAxis tickFormatter={fmtINR} tick={{ fontSize:FONT_SIZE.xs,fill:axisTick }}/>
              <Tooltip content={<T2/>}/>
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke={COLORS.purple} strokeWidth={2.5} dot={{ fill:COLORS.purple,r:4 }} activeDot={{ r:6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle title="Payroll by Department"/>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={deptPayroll} barSize={28} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine}/>
              <XAxis type="number" tickFormatter={fmtINR} tick={{ fontSize:FONT_SIZE.xs,fill:axisTick }}/>
              <YAxis type="category" dataKey="dept" tick={{ fontSize:FONT_SIZE.xs,fill:axisTick }} width={80}/>
              <Tooltip content={<T2/>}/>
              <Bar dataKey="total" name="Payroll" fill={COLORS.purple} radius={[0,RADIUS.sm,RADIUS.sm,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${border}` }}>
          <p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>Employee Salary Breakdown</p>
        </div>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:dark?COLORS.dark.theadBg:COLORS.gray50 }}>
              {["Employee","Department","Salary","Band"].map((h)=>(
                <th key={h} style={{ padding:PADDING.tableHeader,textAlign:"left",fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,color:subtext,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:`1px solid ${border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...employees].sort((a,b)=>(Number(b.salary)||0)-(Number(a.salary)||0)).map((e,i,arr)=>{
              const sal  = Number(e.salary)||0;
              const band = sal>=80000?{ label:"Senior",color:COLORS.purple,bg:COLORS.purpleMuted }:sal>=65000?{ label:"Mid",color:COLORS.primary,bg:COLORS.primaryMuted }:{ label:"Junior",color:COLORS.success,bg:COLORS.successLight };
              return (
                <tr key={e._id} style={{ borderBottom:i<arr.length-1?`1px solid ${border}`:"none" }}>
                  <td style={{ padding:PADDING.tableCell,fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.semibold,color:text }}>{e.name}</td>
                  <td style={{ padding:PADDING.tableCell,fontSize:FONT_SIZE.sm,color:subtext }}>{e.department}</td>
                  <td style={{ padding:PADDING.tableCell,fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:text }}>₹{sal.toLocaleString("en-IN")}</td>
                  <td style={{ padding:PADDING.tableCell }}>
                    <span style={{ display:"inline-block",padding:"2px 10px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:band.bg,color:band.color }}>{band.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
};

// EMPLOYEE dashboard — personal view
const EmployeeDashboard = ({ leaves, dark, user, tokens }) => {
  const { cardBg, border, text, subtext, divider } = tokens;
  const myLeaves      = leaves.filter((l)=>l.employee===user?.name);
  const approvedLeaves= myLeaves.filter((l)=>l.status==="Approved").length;
  const pendingLeaves = myLeaves.filter((l)=>l.status==="Pending").length;
  const usedDays      = myLeaves.filter((l)=>l.status==="Approved").reduce((s,l)=>s+(Number(l.days)||0),0);
  const leaveBal      = [
    { label:"Annual Leave",  total:18, used:usedDays>5?5:usedDays, color:COLORS.primary, bg:COLORS.primaryMuted  },
    { label:"Sick Leave",    total:12, used:2,                      color:COLORS.danger,  bg:COLORS.dangerMuted   },
    { label:"Casual Leave",  total:10, used:1,                      color:COLORS.warning, bg:COLORS.warningLight  },
  ];

  const Card = ({ children,style={} }) => <div style={{ background:cardBg,borderRadius:RADIUS["2xl"],border:`1px solid ${border}`,boxShadow:SHADOW.card,padding:PADDING.card,...style }}>{children}</div>;
  const SecTitle = ({ title,sub }) => <div style={{ marginBottom:SPACING[4] }}><p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>{title}</p>{sub&&<p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{sub}</p>}</div>;

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        <KpiCard dark={dark} icon={UserCheck}  label="Attendance Today"  value="Present"       sub="Checked in 09:05 AM"      color={COLORS.success} bg={COLORS.successLight}/>
        <KpiCard dark={dark} icon={Calendar}   label="Approved Leaves"   value={approvedLeaves} sub="This year"               color={COLORS.primary} bg={COLORS.primaryMuted}/>
        <KpiCard dark={dark} icon={Clock}      label="Pending Requests"  value={pendingLeaves}  sub="Awaiting approval"       color={COLORS.warning} bg={COLORS.warningLight}/>
        <KpiCard dark={dark} icon={Target}     label="Performance Score" value="80"             sub="Q2 2026"                  color={COLORS.purple}  bg={COLORS.purpleMuted}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:GAP.md, marginBottom:GAP.md }}>
        {/* Leave balance */}
        <Card>
          <SecTitle title="My Leave Balance" sub="Current year allocation"/>
          <div style={{ display:"flex", flexDirection:"column", gap:SPACING[4] }}>
            {leaveBal.map((b)=>{
              const remaining = b.total-b.used;
              const pct = Math.round((b.used/b.total)*100);
              return (
                <div key={b.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.semibold,color:text }}>{b.label}</span>
                    <span style={{ fontSize:FONT_SIZE.xs,color:subtext }}>{remaining}/{b.total} days left</span>
                  </div>
                  <div style={{ height:8,background:dark?COLORS.dark.border:COLORS.borderLight,borderRadius:RADIUS.full,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${pct}%`,background:b.color,borderRadius:RADIUS.full,transition:"width 0.4s" }}/>
                  </div>
                  <p style={{ margin:"3px 0 0",fontSize:FONT_SIZE.xs,color:b.color,fontWeight:FONT_WEIGHT.semibold }}>{b.used} days used</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* My leave history */}
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:`${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom:`1px solid ${border}` }}>
            <p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:text }}>My Leave History</p>
          </div>
          {myLeaves.length===0 ? (
            <p style={{ padding:SPACING[5],textAlign:"center",color:subtext,fontSize:FONT_SIZE.sm }}>No leave requests yet</p>
          ) : myLeaves.slice(0,5).map((l,i,arr)=>{
            const sc = l.status==="Approved"?{ bg:COLORS.successLight,color:COLORS.success }:l.status==="Pending"?{ bg:COLORS.warningLight,color:COLORS.warning }:{ bg:COLORS.dangerMuted,color:COLORS.danger };
            return (
              <div key={l._id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:`${SPACING[3]}px ${SPACING[4]}px`,borderBottom:i<arr.length-1?`1px solid ${border}`:"none" }}>
                <div>
                  <p style={{ margin:0,fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:text }}>{l.leaveType}</p>
                  <p style={{ margin:0,fontSize:FONT_SIZE.xs,color:subtext }}>{l.fromDate} · {l.days}d</p>
                </div>
                <span style={{ display:"inline-block",padding:"2px 10px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:sc.bg,color:sc.color }}>{l.status}</span>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:GAP.md }}>
        <Card>
          <SecTitle title="Upcoming Events" sub="Next 30 days"/>
          <div style={{ display:"flex", flexDirection:"column", gap:GAP.sm }}>
            {UPCOMING_EVENTS.map((e,i,arr)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:GAP.sm,paddingBottom:i<arr.length-1?GAP.sm:0,borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                <div style={{ width:36,height:36,borderRadius:RADIUS.md,background:e.color+"15",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:9,fontWeight:FONT_WEIGHT.bold,color:e.color,textTransform:"uppercase" }}>{e.date.split(" ")[0]}</span>
                  <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:e.color,lineHeight:1 }}>{e.date.split(" ")[1]}</span>
                </div>
                <p style={{ margin:0,fontSize:FONT_SIZE.sm,color:text }}>{e.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SecTitle title="Company Announcements"/>
          <div style={{ display:"flex",flexDirection:"column",gap:GAP.sm }}>
            {ANNOUNCEMENTS.map((a,i,arr)=>(
              <div key={a.id} style={{ display:"flex",gap:GAP.sm,paddingBottom:i<arr.length-1?GAP.sm:0,borderBottom:i<arr.length-1?`1px solid ${divider}`:"none" }}>
                <div style={{ width:3,background:a.color,borderRadius:RADIUS.full,flexShrink:0 }}/>
                <div>
                  <p style={{ margin:0,fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:text }}>{a.title}</p>
                  <p style={{ margin:"2px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard = ({ darkMode: dark = false }) => {
  const { user, userRole } = useAuth();
  const { data: employees = [], isLoading: loadEmp  } = useFetchAllEmployees();
  const { data: leaves    = [], isLoading: loadLeave } = useFetchAllLeaves();

  const [showNotifs, setShowNotifs] = useState(false);
  const [allRead,    setAllRead]    = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifs]);

  if (loadEmp || loadLeave) return <AppLoader fullScreen />;

  // theme tokens
  const cardBg   = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const border   = dark ? COLORS.dark.border  : COLORS.borderLight;
  const text     = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext  = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const divider  = dark ? COLORS.dark.divider : COLORS.borderLight;
  const inputBg  = dark ? COLORS.dark.inputBg : COLORS.gray50;
  const axisTick = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const gridLine = dark ? COLORS.dark.border  : COLORS.borderLight;
  const tokens   = { cardBg,border,text,subtext,divider,inputBg,axisTick,gridLine };

  const today    = new Date().toLocaleDateString("en-IN",{ weekday:"long",day:"numeric",month:"long",year:"numeric" });
  const notifs   = NOTIF_BY_ROLE[userRole] || NOTIF_BY_ROLE.EMPLOYEE;

  const ROLE_WELCOME = {
    SUPER_ADMIN: "Full system overview",
    ADMIN:       "Full system overview",
    HR:          "HR & people operations",
    MANAGER:     "Your team at a glance",
    FINANCE:     "Payroll & compensation",
    EMPLOYEE:    "Your personal workspace",
  };

  return (
    <div style={{ fontFamily:FONT_FAMILY.base }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:SPACING[5], flexWrap:"wrap", gap:GAP.md }}>
        <div>
          <h1 style={{ margin:0, fontSize:FONT_SIZE["2xl"], fontWeight:FONT_WEIGHT.bold, color:text }}>
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p style={{ margin:`${GAP.xs}px 0 0`, fontSize:FONT_SIZE.base, color:subtext }}>
            {ROLE_WELCOME[userRole] || "Dashboard"} &nbsp;·&nbsp; {today}
          </p>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:GAP.sm }}>
          {/* Bell */}
          <div ref={bellRef} style={{ position:"relative" }}>
            <div onClick={()=>setShowNotifs((v)=>!v)} style={{ width:38,height:38,borderRadius:RADIUS.full,background:inputBg,border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
              <Bell size={17} color={subtext}/>
            </div>
            {!allRead && (
              <div style={{ position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:RADIUS.full,background:COLORS.danger,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                <span style={{ fontSize:9,color:COLORS.white,fontWeight:FONT_WEIGHT.bold }}>{notifs.length}</span>
              </div>
            )}
            {showNotifs && (
              <div style={{ position:"absolute",top:48,right:0,zIndex:1000,width:320,maxHeight:380,overflowY:"auto",background:cardBg,border:`1px solid ${border}`,borderRadius:RADIUS.xl,boxShadow:SHADOW.card }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:`${SPACING[3]}px ${SPACING[4]}px`,borderBottom:`1px solid ${border}`,position:"sticky",top:0,background:cardBg,zIndex:1 }}>
                  <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:text }}>Notifications</span>
                  <button onClick={()=>setAllRead(true)} style={{ display:"flex",alignItems:"center",gap:4,fontSize:FONT_SIZE.xs,color:COLORS.primary,background:"none",border:"none",cursor:"pointer",opacity:allRead?0.4:1 }} disabled={allRead}>
                    <CheckCheck size={13}/> Mark all read
                  </button>
                </div>
                {notifs.map((n,i)=>(
                  <div key={n.id} style={{ display:"flex",gap:SPACING[3],padding:`${SPACING[3]}px ${SPACING[4]}px`,borderBottom:i<notifs.length-1?`1px solid ${border}`:"none",opacity:allRead?0.45:1,transition:"opacity 0.25s" }}>
                    <div style={{ width:3,borderRadius:RADIUS.full,background:n.dotColor,flexShrink:0,alignSelf:"stretch" }}/>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:n.dotColor,flexShrink:0,marginTop:5 }}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ margin:0,fontSize:FONT_SIZE.sm,color:text,fontWeight:allRead?FONT_WEIGHT.normal:FONT_WEIGHT.medium,lineHeight:1.4 }}>{n.title}</p>
                      <p style={{ margin:"3px 0 0",fontSize:FONT_SIZE.xs,color:subtext }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Avatar */}
          <div title={user?.name} style={{ width:38,height:38,borderRadius:RADIUS.full,background:COLORS.primaryMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:COLORS.primary,cursor:"pointer" }}>
            {user?.avatar||user?.name?.slice(0,2).toUpperCase()||"ME"}
          </div>
        </div>
      </div>

      {/* ── Role-specific content ── */}
      {(userRole==="SUPER_ADMIN"||userRole==="ADMIN") && (
        <AdminDashboard employees={employees} leaves={leaves} dark={dark} user={user} userRole={userRole} tokens={tokens}/>
      )}
      {userRole==="HR" && (
        <HRDashboard employees={employees} leaves={leaves} dark={dark} tokens={tokens}/>
      )}
      {userRole==="MANAGER" && (
        <ManagerDashboard employees={employees} leaves={leaves} dark={dark} user={user} tokens={tokens}/>
      )}
      {userRole==="FINANCE" && (
        <FinanceDashboard employees={employees} dark={dark} tokens={tokens}/>
      )}
      {userRole==="EMPLOYEE" && (
        <EmployeeDashboard leaves={leaves} dark={dark} user={user} tokens={tokens}/>
      )}

    </div>
  );
};

export default Dashboard;
