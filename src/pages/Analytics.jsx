import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, Calendar, Wallet, Award, AlertCircle } from "lucide-react";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e8eaed",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  padding: "20px 22px",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Analytics = ({ employees = [], leaves = [] }) => {
  const [activeTab, setActiveTab] = useState("overview");

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

  const kpis = [
    { label: "Total Employees", value: total,   icon: <Users size={18} />,    color: "#2563eb", bg: "#eff6ff",  sub: `${deptData.length} departments` },
    { label: "Attendance Rate",  value: `${attendancePct}%`, icon: <TrendingUp size={18} />, color: "#16a34a", bg: "#f0fdf4", sub: `${present} present today` },
    { label: "Pending Leaves",   value: pendingLeaves, icon: <Calendar size={18} />, color: "#f59e0b", bg: "#fffbeb", sub: `${leaves.length} total requests` },
    { label: "Total Payroll",    value: `₹${(totalPayroll/1000).toFixed(0)}k`, icon: <Wallet size={18} />, color: "#8b5cf6", bg: "#f5f3ff", sub: `Avg ₹${avgSalary.toLocaleString("en-IN")}` },
  ];

  const tabs = ["overview", "workforce", "leaves", "payroll"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Workforce insights and HR metrics</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13,
              fontWeight: activeTab === t ? 600 : 500,
              background: activeTab === t ? "#2563eb" : "#f1f5f9",
              color: activeTab === t ? "#fff" : "#475569",
              textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* KPI row — always visible */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 3px" }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: k.color, margin: "0 0 2px", lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Employees by Department</h3>
              {deptData.length === 0
                ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deptData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" name="Employees" radius={[6,6,0,0]}>
                        {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Attendance Status</h3>
              {attendancePie.length === 0
                ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No data</p>
                : <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={attendancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={38}>
                          {attendancePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                      {attendancePie.map((d, i) => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                          <div style={{ width: 9, height: 9, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                          <span style={{ color: "#64748b" }}>{d.name} <strong style={{ color: "#0f172a" }}>{d.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
              }
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>New Hires by Month</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={headcountTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="joined" name="Joined" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Leave Trend by Month</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={leaveTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="leaves" name="Leaves" stroke="#f59e0b" fill="#fef9c3" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ── WORKFORCE TAB ── */}
      {activeTab === "workforce" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Role Distribution</h3>
              {roleData.length === 0
                ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={roleData} layout="vertical" barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                        {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Salary Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salaryData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" name="Employees" fill="#8b5cf6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department table */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Department Summary</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                  {["Department","Headcount","% of Total","Avg Salary","Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", paddingBottom: 10, fontSize: 12, fontWeight: 600, color: "#475569" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptData.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>No department data</td></tr>
                  : deptData.map((d, i) => {
                      const deptEmps = employees.filter((e) => e.department === d.name);
                      const deptAvg = deptEmps.length > 0
                        ? Math.round(deptEmps.reduce((s, e) => s + (Number(e.salary) || 0), 0) / deptEmps.length)
                        : 0;
                      return (
                        <tr key={d.name} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                            {d.name}
                          </td>
                          <td style={{ padding: "12px 0", fontSize: 13, color: "#334155" }}>{d.value}</td>
                          <td style={{ padding: "12px 0", fontSize: 13, color: "#334155" }}>{total > 0 ? Math.round((d.value / total) * 100) : 0}%</td>
                          <td style={{ padding: "12px 0", fontSize: 13, color: "#334155" }}>₹{deptAvg.toLocaleString("en-IN")}</td>
                          <td style={{ padding: "12px 0" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#16a34a" }}>Active</span>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Leave by Status</h3>
              {leaveStatusData.length === 0
                ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No leave data</p>
                : <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={leaveStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {leaveStatusData.map((_, i) => <Cell key={i} fill={["#f59e0b","#16a34a","#ef4444"][i % 3]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                      {leaveStatusData.map((d, i) => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                          <div style={{ width: 9, height: 9, borderRadius: "50%", background: ["#f59e0b","#16a34a","#ef4444"][i % 3] }} />
                          <span style={{ color: "#64748b" }}>{d.name}: <strong style={{ color: "#0f172a" }}>{d.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Leave by Type</h3>
              {leaveTypeData.length === 0
                ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No leave data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={leaveTypeData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" name="Requests" radius={[6,6,0,0]}>
                        {leaveTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Leave Trend by Month</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="leaves" name="Leaves" stroke="#f59e0b" fill="#fef9c3" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── PAYROLL TAB ── */}
      {activeTab === "payroll" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Payroll by Department</h3>
              {deptData.length === 0
                ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No data</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deptData.map((d) => ({
                      name: d.name,
                      payroll: employees.filter((e) => e.department === d.name).reduce((s, e) => s + (Number(e.salary) || 0), 0),
                    }))} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="payroll" name="Payroll" radius={[6,6,0,0]}>
                        {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Payroll Summary</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>Based on employee salary data</p>
              {[
                { label: "Total Monthly Payroll",  value: `₹${totalPayroll.toLocaleString("en-IN")}`, color: "#2563eb" },
                { label: "Average Salary",          value: `₹${avgSalary.toLocaleString("en-IN")}`,   color: "#16a34a" },
                { label: "Highest Salary",
                  value: `₹${Math.max(...employees.map(e => Number(e.salary) || 0), 0).toLocaleString("en-IN")}`, color: "#8b5cf6" },
                { label: "Lowest Salary",
                  value: employees.length > 0
                    ? `₹${Math.min(...employees.filter(e => Number(e.salary) > 0).map(e => Number(e.salary))).toLocaleString("en-IN")}`
                    : "—",
                  color: "#f59e0b" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Salary Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salaryData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Employees" fill="#8b5cf6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
