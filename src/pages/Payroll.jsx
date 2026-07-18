import { useEffect, useState } from "react";
import {
  Plus, Users, Wallet, TrendingUp, Clock,
  ChevronLeft, ChevronRight, Search, X, Download,
  CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const COLORS  = ["#2563eb","#16a34a","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

const card = {
  background: "#fff", borderRadius: 16,
  border: "1px solid #f1f5f9",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const inputStyle = {
  border: "1px solid #e2e8f0", borderRadius: 10,
  padding: "10px 14px", fontSize: 14, outline: "none",
  width: "100%", boxSizing: "border-box",
};

const MOCK_PAYROLL_DATA = [
  { _id: "p001", employee: "Mani",       department: "IT",         salary: 72000,  bonus: 5000,  deduction: 3000, netSalary: 74000,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p002", employee: "P Santhosh", department: "IT",         salary: 68000,  bonus: 4000,  deduction: 2800, netSalary: 69200,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p003", employee: "C Santhosh", department: "IT",         salary: 65000,  bonus: 3500,  deduction: 2500, netSalary: 66000,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p004", employee: "Suriya",     department: "IT",         salary: 78000,  bonus: 6000,  deduction: 3500, netSalary: 80500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p005", employee: "Siva",       department: "Management", salary: 95000,  bonus: 10000, deduction: 5000, netSalary: 100000, month: "May",   year: "2026", status: "Pending" },
  { _id: "p006", employee: "Aravinth",   department: "IT",         salary: 62000,  bonus: 4000,  deduction: 2500, netSalary: 63500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p007", employee: "Safeer",     department: "Finance",    salary: 58000,  bonus: 2000,  deduction: 2000, netSalary: 58000,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p008", employee: "Sabari",     department: "IT",         salary: 55000,  bonus: 2500,  deduction: 2000, netSalary: 55500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p009", employee: "Vignesh",    department: "IT",         salary: 60000,  bonus: 3000,  deduction: 2200, netSalary: 60800,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p010", employee: "Mani",       department: "IT",         salary: 72000,  bonus: 4000,  deduction: 3000, netSalary: 73000,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p011", employee: "Suriya",     department: "IT",         salary: 78000,  bonus: 5000,  deduction: 3500, netSalary: 79500,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p012", employee: "Siva",       department: "Management", salary: 95000,  bonus: 9000,  deduction: 5000, netSalary: 99000,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p013", employee: "P Santhosh", department: "IT",         salary: 68000,  bonus: 3000,  deduction: 2800, netSalary: 68200,  month: "March", year: "2026", status: "Paid"    },
];

const Payroll = () => {
  const [payroll, setPayroll]           = useState(MOCK_PAYROLL_DATA);
  const [currentPage, setCurrentPage]   = useState(1);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter]   = useState("All");
  const [showModal, setShowModal]       = useState(false);
  const [activeTab, setActiveTab]       = useState("list");
  const rowsPerPage = 10;

  // Form state
  const [fEmployee,   setFEmployee]   = useState("");
  const [fDept,       setFDept]       = useState("");
  const [fSalary,     setFSalary]     = useState("");
  const [fBonus,      setFBonus]      = useState("");
  const [fDeduction,  setFDeduction]  = useState("");
  const [fMonth,      setFMonth]      = useState(MONTHS[new Date().getMonth()]);
  const [fYear,       setFYear]       = useState(String(new Date().getFullYear()));

  const netSalary = Math.max(0, (Number(fSalary) || 0) + (Number(fBonus) || 0) - (Number(fDeduction) || 0));

  const fetchPayroll = async () => {
    try {
      const res = await Promise.resolve({ data: [] });
      if (res.data && res.data.length > 0) setPayroll(res.data);
    } catch { /* keep mock data */ }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const resetForm = () => {
    setFEmployee(""); setFDept(""); setFSalary("");
    setFBonus(""); setFDeduction(""); setFMonth(MONTHS[new Date().getMonth()]);
    setFYear(String(new Date().getFullYear()));
  };

  const generatePayroll = async () => {
    if (!fEmployee.trim() || !fSalary) { alert("Employee name and salary are required"); return; }
    try {
      await Promise.resolve({ data: [] });
      fetchPayroll(); resetForm(); setShowModal(false);
    } catch (e) { console.log(e); }
  };

  const markAsPaid = async (id) => {
    try {
      await Promise.resolve({ data: [] });
      fetchPayroll();
    } catch (e) { console.log(e); }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this payroll record?")) return;
    try {
      await Promise.resolve({ data: [] });
      fetchPayroll();
    } catch (e) { console.log(e); }
  };

  // Derived stats
  const totalPayroll   = payroll.reduce((s, i) => s + (Number(i.netSalary) || 0), 0);
  const paidAmount     = payroll.filter(i => i.status === "Paid").reduce((s, i) => s + (Number(i.netSalary) || 0), 0);
  const pendingAmount  = payroll.filter(i => i.status === "Pending").reduce((s, i) => s + (Number(i.netSalary) || 0), 0);
  const paidCount      = payroll.filter(i => i.status === "Paid").length;
  const pendingCount   = payroll.filter(i => i.status === "Pending").length;

  // Dept payroll chart
  const deptMap = {};
  payroll.forEach((p) => {
    const d = p.department || "Other";
    deptMap[d] = (deptMap[d] || 0) + (Number(p.netSalary) || 0);
  });
  const deptChartData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  // Month payroll chart
  const monthMap = {};
  payroll.forEach((p) => { if (p.month) monthMap[p.month] = (monthMap[p.month] || 0) + (Number(p.netSalary) || 0); });
  const monthChartData = MONTHS.filter(m => monthMap[m]).map(m => ({ name: m.slice(0,3), value: monthMap[m] }));

  // Filtering
  const filtered = payroll.filter((p) => {
    const matchSearch = !searchTerm || p.employee?.toLowerCase().includes(searchTerm.toLowerCase()) || p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchMonth  = monthFilter  === "All" || p.month === monthFilter;
    return matchSearch && matchStatus && matchMonth;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const statCards = [
    { label: "Total Records",   value: payroll.length,                    prefix: "",  icon: <Users size={22} color="#2563eb" />, iconBg: "#eff6ff", valueColor: "#0f172a" },
    { label: "Total Payroll",   value: totalPayroll.toLocaleString("en-IN"), prefix: "₹", icon: <Wallet size={22} color="#16a34a" />, iconBg: "#f0fdf4", valueColor: "#16a34a" },
    { label: "Paid",            value: paidAmount.toLocaleString("en-IN"),   prefix: "₹", icon: <TrendingUp size={22} color="#8b5cf6" />, iconBg: "#f5f3ff", valueColor: "#8b5cf6" },
    { label: "Pending",         value: pendingAmount.toLocaleString("en-IN"),prefix: "₹", icon: <Clock size={22} color="#ef4444" />, iconBg: "#fef2f2", valueColor: "#ef4444" },
  ];

  const uniqueMonths = [...new Set(payroll.map(p => p.month).filter(Boolean))];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Payroll</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage employee compensation and payments</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Tab switcher */}
          {["list","analytics"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500, textTransform: "capitalize",
              background: activeTab === t ? "#f1f5f9" : "transparent",
              color: activeTab === t ? "#0f172a" : "#64748b",
            }}>{t}</button>
          ))}
          <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#2563eb", color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 20px", fontSize: 14,
            fontWeight: 600, cursor: "pointer",
          }}>
            <Plus size={16} strokeWidth={2.5} /> Generate Payroll
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {statCards.map((c, i) => (
          <div key={i} style={{ ...card, padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</div>
            <div>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{c.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: c.valueColor, margin: 0 }}>{c.prefix}{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div style={{ ...card, padding: "24px" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input placeholder="Search employee or department…" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingLeft: 34 }} />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, width: 130, cursor: "pointer" }}>
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <select value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, width: 140, cursor: "pointer" }}>
              <option value="All">All Months</option>
              {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Progress bar */}
          {payroll.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Payment progress</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{paidCount} / {payroll.length} paid</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                <div style={{ height: "100%", borderRadius: 99, background: "#16a34a", width: `${payroll.length > 0 ? Math.round((paidCount/payroll.length)*100) : 0}%`, transition: "width 0.4s" }} />
              </div>
            </div>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                {["Employee","Department","Base Salary","Bonus","Deduction","Net Salary","Month","Status","Action"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 10px 14px", fontSize: 12, fontWeight: 600, color: "#475569" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>
                  {payroll.length === 0 ? 'No payroll records. Click "Generate Payroll" to add one.' : "No records match your filters."}
                </td></tr>
              ) : paginated.map((item) => (
                <tr key={item._id}
                  style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 10px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.employee}</td>
                  <td style={{ padding: "14px 10px", fontSize: 13, color: "#334155" }}>{item.department || "—"}</td>
                  <td style={{ padding: "14px 10px", fontSize: 13, color: "#334155" }}>₹{Number(item.salary).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 10px", fontSize: 13, color: "#16a34a", fontWeight: 600 }}>+₹{Number(item.bonus).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 10px", fontSize: 13, color: "#ef4444", fontWeight: 600 }}>-₹{Number(item.deduction).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 10px", fontSize: 14, fontWeight: 700, color: "#2563eb" }}>₹{Number(item.netSalary).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 10px", fontSize: 13, color: "#334155" }}>{item.month} {item.year || ""}</td>
                  <td style={{ padding: "14px 10px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: item.status === "Paid" ? "#dcfce7" : "#fef9c3",
                      color: item.status === "Paid" ? "#16a34a" : "#ca8a04",
                    }}>
                      {item.status === "Paid" ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 10px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button disabled={item.status === "Paid"} onClick={() => markAsPaid(item._id)} style={{
                        background: item.status === "Paid" ? "#f1f5f9" : "#16a34a",
                        color: item.status === "Paid" ? "#94a3b8" : "#fff",
                        border: "none", borderRadius: 8, padding: "7px 14px",
                        fontSize: 12, fontWeight: 600, cursor: item.status === "Paid" ? "not-allowed" : "pointer",
                      }}>Mark Paid</button>
                      <button onClick={() => deleteRecord(item._id)} style={{
                        background: "#fff", color: "#ef4444",
                        border: "1px solid #fecaca", borderRadius: 8,
                        padding: "7px 10px", fontSize: 12, cursor: "pointer",
                      }}>
                        <XCircle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filtered.length > rowsPerPage && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: 16, marginTop: 8 }}>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                Showing {(currentPage-1)*rowsPerPage+1}–{Math.min(currentPage*rowsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage===1?"not-allowed":"pointer", color: currentPage===1?"#cbd5e1":"#334155" }}>
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(totalPages,5) }, (_, i) => i+1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: page===currentPage ? "none" : "1px solid #e2e8f0",
                    background: page===currentPage ? "#2563eb" : "#fff",
                    color: page===currentPage ? "#fff" : "#334155",
                    fontWeight: page===currentPage ? 700 : 500,
                    fontSize: 13, cursor: "pointer",
                  }}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage>=totalPages}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage>=totalPages?"not-allowed":"pointer", color: currentPage>=totalPages?"#cbd5e1":"#334155" }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ ...card, padding: "20px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Payroll by Department</h3>
            {deptChartData.length === 0
              ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No data</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptChartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[6,6,0,0]}>
                      {deptChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div style={{ ...card, padding: "20px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Payroll by Month</h3>
            {monthChartData.length === 0
              ? <p style={{ fontSize: 13, color: "#94a3b8" }}>No data</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthChartData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" fill="#2563eb" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div style={{ ...card, padding: "20px", gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Payment Status Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { label: "Total Records", value: payroll.length,                        color: "#2563eb", bg: "#eff6ff" },
                { label: "Paid",          value: `${paidCount} (₹${paidAmount.toLocaleString("en-IN")})`,    color: "#16a34a", bg: "#f0fdf4" },
                { label: "Pending",       value: `${pendingCount} (₹${pendingAmount.toLocaleString("en-IN")})`, color: "#f59e0b", bg: "#fffbeb" },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 6px" }}>{s.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATE MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Generate Payroll</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22 }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Employee Name *</label>
                <input style={inputStyle} placeholder="Full name" value={fEmployee} onChange={e => setFEmployee(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Department</label>
                <input style={inputStyle} placeholder="e.g. IT" value={fDept} onChange={e => setFDept(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Month</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={fMonth} onChange={e => setFMonth(e.target.value)}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Base Salary (₹) *</label>
                <input style={inputStyle} type="number" placeholder="50000" value={fSalary} onChange={e => setFSalary(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Year</label>
                <input style={inputStyle} type="number" value={fYear} onChange={e => setFYear(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Bonus (₹)</label>
                <input style={inputStyle} type="number" placeholder="0" value={fBonus} onChange={e => setFBonus(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "block", marginBottom: 5 }}>Deduction (₹)</label>
                <input style={inputStyle} type="number" placeholder="0" value={fDeduction} onChange={e => setFDeduction(e.target.value)} />
              </div>
            </div>

            {/* Net salary preview */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Net Salary</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>₹{netSalary.toLocaleString("en-IN")}</span>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{
                flex: 1, padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10,
                background: "#fff", fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer",
              }}>Cancel</button>
              <button onClick={generatePayroll} style={{
                flex: 2, padding: "12px", border: "none", borderRadius: 10,
                background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Generate Payroll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
