import { useEffect, useState } from "react";
import { fetchPayroll, createPayrollRecord, markPayrollPaid, deletePayrollRecord } from "../../api/payrollApi";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, SimpleGrid,
  TextInput, Select, Progress, Modal, ActionIcon, Notification,
} from "@mantine/core";
import {
  IconPlus, IconUsers, IconWallet, IconTrendingUp, IconClock,
  IconSearch, IconFileText, IconPrinter, IconX,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

import { COLORS }          from "../../theme/colors";
import { getStatusBadge }  from "../../utils/helpers";
import DataTable           from "../../components/ui/DataTable";
import { useToast }        from "../../components/ui/Toast";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.info];

const MOCK_PAYROLL_DATA = [
  { _id: "p001", employee: "Mani",       department: "IT",         designation: "Senior Developer",   employeeId: "MGT001", salary: 72000,  bonus: 5000,  deduction: 3000, netSalary: 74000,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p002", employee: "P Santhosh", department: "IT",         designation: "Software Engineer",  employeeId: "MGT002", salary: 68000,  bonus: 4000,  deduction: 2800, netSalary: 69200,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p003", employee: "C Santhosh", department: "IT",         designation: "Software Engineer",  employeeId: "MGT003", salary: 65000,  bonus: 3500,  deduction: 2500, netSalary: 66000,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p004", employee: "Suriya",     department: "IT",         designation: "Tech Lead",          employeeId: "MGT004", salary: 78000,  bonus: 6000,  deduction: 3500, netSalary: 80500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p005", employee: "Siva",       department: "Management", designation: "Project Manager",    employeeId: "MGT005", salary: 95000,  bonus: 10000, deduction: 5000, netSalary: 100000, month: "May",   year: "2026", status: "Pending" },
  { _id: "p006", employee: "Aravinth",   department: "IT",         designation: "Software Engineer",  employeeId: "MGT006", salary: 62000,  bonus: 4000,  deduction: 2500, netSalary: 63500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p007", employee: "Safeer",     department: "Finance",    designation: "Finance Analyst",    employeeId: "MGT007", salary: 58000,  bonus: 2000,  deduction: 2000, netSalary: 58000,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p008", employee: "Sabari",     department: "IT",         designation: "QA Engineer",        employeeId: "MGT008", salary: 55000,  bonus: 2500,  deduction: 2000, netSalary: 55500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p009", employee: "Vignesh",    department: "IT",         designation: "Frontend Developer", employeeId: "MGT009", salary: 60000,  bonus: 3000,  deduction: 2200, netSalary: 60800,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p010", employee: "Mani",       department: "IT",         designation: "Senior Developer",   employeeId: "MGT001", salary: 72000,  bonus: 4000,  deduction: 3000, netSalary: 73000,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p011", employee: "Suriya",     department: "IT",         designation: "Tech Lead",          employeeId: "MGT004", salary: 78000,  bonus: 5000,  deduction: 3500, netSalary: 79500,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p012", employee: "Siva",       department: "Management", designation: "Project Manager",    employeeId: "MGT005", salary: 95000,  bonus: 9000,  deduction: 5000, netSalary: 99000,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p013", employee: "P Santhosh", department: "IT",         designation: "Software Engineer",  employeeId: "MGT002", salary: 68000,  bonus: 3000,  deduction: 2800, netSalary: 68200,  month: "March", year: "2026", status: "Paid"    },
];

// PayslipModal keeps inline styles intentionally for print-safe layout
const computePayslip = (row) => {
  const basic     = Math.round(Number(row.salary) * 0.5);
  const hra       = Math.round(basic * 0.4);
  const transport = 1500;
  const special   = Math.max(0, Number(row.salary) - basic - hra - transport);
  const grossEarnings = basic + hra + transport + special;
  const pf        = Math.round(basic * 0.12);
  const profTax   = 200;
  const tds       = Math.round(Math.max(0, (grossEarnings * 12 - 250000) / 12 * 0.1));
  const totalDeductions = pf + profTax + tds;
  return { basic, hra, transport, special, grossEarnings, pf, profTax, tds, totalDeductions, netPay: grossEarnings - totalDeductions };
};

const PayslipModal = ({ record, onClose }) => {
  const ps  = computePayslip(record);
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  const handlePrint = () => {
    const styleId = "payslip-print-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `@media print { body > * { display: none !important; } #payslip-printable-root { display: block !important; } #payslip-printable-root * { display: revert !important; } @page { margin: 18mm 14mm; size: A4 portrait; } }`;
      document.head.appendChild(style);
    }
    window.print();
  };

  const thStyle  = { padding: "9px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#475569", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" };
  const tdStyle  = { padding: "9px 14px", fontSize: 12, color: "#1e293b", borderBottom: "1px solid #f1f5f9" };
  const tdAmtStyle = { ...tdStyle, textAlign: "right", fontWeight: 600 };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,41,59,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: 16, overflowY: "auto" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div id="payslip-printable-root" style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 680, boxShadow: "0 25px 50px rgba(0,0,0,0.2)", fontFamily: "Inter, sans-serif", color: "#1e293b", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)", padding: "28px 28px 24px", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>MG</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>MGate Technologies</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.80)" }}>No. 12, Tech Park, Coimbatore 641 035, Tamil Nadu, India</p>
            <p style={{ margin: "1px 0 0", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>hr@mgatetech.com | +91 99999 00000</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 14px", textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>PAY SLIP</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#fff" }}>{record.month} {record.year}</p>
          </div>
        </div>

        <div style={{ padding: "20px 28px" }}>
          <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.8px", textTransform: "uppercase" }}>Employee Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 24px" }}>
              {[
                ["Name", record.employee], ["Employee ID", record.employeeId || "MGT-"], ["Department", record.department || "-"],
                ["Designation", record.designation || "-"], ["Bank Account", "XXXX XXXX 1234"], ["PAN", "ABXXX9999X"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#f0fdf4", padding: "10px 14px", borderBottom: "1px solid #bbf7d0" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase" }}>Earnings</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={thStyle}>Component</th><th style={{ ...thStyle, textAlign: "right" }}>Amount</th></tr></thead>
                <tbody>
                  {[["Basic Salary", ps.basic], ["HRA (40% of Basic)", ps.hra], ["Transport Allowance", ps.transport], ["Special Allowance", ps.special]].map(([label, amt]) => (
                    <tr key={label}><td style={tdStyle}>{label}</td><td style={tdAmtStyle}>{fmt(amt)}</td></tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f0fdf4" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#16a34a", borderTop: "2px solid #bbf7d0", borderBottom: "none" }}>Gross Earnings</td>
                    <td style={{ ...tdAmtStyle, fontWeight: 700, color: "#16a34a", borderTop: "2px solid #bbf7d0", borderBottom: "none" }}>{fmt(ps.grossEarnings)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#fef2f2", padding: "10px 14px", borderBottom: "1px solid #fecaca" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase" }}>Deductions</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={thStyle}>Component</th><th style={{ ...thStyle, textAlign: "right" }}>Amount</th></tr></thead>
                <tbody>
                  {[["PF (12% of Basic)", ps.pf], ["Professional Tax", ps.profTax], ["TDS", ps.tds]].map(([label, amt]) => (
                    <tr key={label}><td style={tdStyle}>{label}</td><td style={tdAmtStyle}>{fmt(amt)}</td></tr>
                  ))}
                  <tr><td style={{ ...tdStyle, color: "transparent" }}>-</td><td style={{ ...tdAmtStyle, color: "transparent" }}>-</td></tr>
                </tbody>
                <tfoot>
                  <tr style={{ background: "#fef2f2" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#dc2626", borderTop: "2px solid #fecaca", borderBottom: "none" }}>Total Deductions</td>
                    <td style={{ ...tdAmtStyle, fontWeight: 700, color: "#dc2626", borderTop: "2px solid #fecaca", borderBottom: "none" }}>{fmt(ps.totalDeductions)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 500, textTransform: "uppercase" }}>Net Pay for {record.month} {record.year}</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.60)" }}>Gross {fmt(ps.grossEarnings)} — Deductions {fmt(ps.totalDeductions)}</p>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff" }}>{fmt(ps.netPay)}</p>
          </div>

          <p style={{ margin: "0 0 20px", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>This is a computer-generated payslip and does not require a signature.</p>

          <div className="no-print" style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Close</button>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", border: "none", borderRadius: 8, background: COLORS.primary, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <IconPrinter size={14} /> Print / Download
            </button>
          </div>
        </div>
      </div>
      <style>{`@media print { body > * { display: none !important; } #payslip-printable-root { display: block !important; position: static !important; box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; } .no-print { display: none !important; } }`}</style>
    </div>
  );
};

const Payroll = () => {
  const { show } = useToast();

  const [payroll, setPayroll]           = useState(MOCK_PAYROLL_DATA);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter]   = useState("All");
  const [showModal, setShowModal]       = useState(false);
  const [activeTab, setActiveTab]       = useState("list");
  const [payslipRecord, setPayslipRecord] = useState(null);

  const rowsPerPage = 10;

  const [fEmployee,  setFEmployee]  = useState("");
  const [fDept,      setFDept]      = useState("");
  const [fSalary,    setFSalary]    = useState("");
  const [fBonus,     setFBonus]     = useState("");
  const [fDeduction, setFDeduction] = useState("");
  const [fMonth,     setFMonth]     = useState(MONTHS[new Date().getMonth()]);
  const [fYear,      setFYear]      = useState(String(new Date().getFullYear()));

  const netSalary = Math.max(0, (Number(fSalary) || 0) + (Number(fBonus) || 0) - (Number(fDeduction) || 0));

  const loadPayroll = async () => {
    try {
      const data = await fetchPayroll();
      if (data && data.length > 0) setPayroll(data);
    } catch { /* keep mock data */ }
  };

  useEffect(() => { loadPayroll(); }, []);

  const resetForm = () => {
    setFEmployee(""); setFDept(""); setFSalary("");
    setFBonus(""); setFDeduction(""); setFMonth(MONTHS[new Date().getMonth()]);
    setFYear(String(new Date().getFullYear()));
  };

  const generatePayroll = async () => {
    if (!fEmployee.trim() || !fSalary) { show("Employee name and salary are required", "error"); return; }
    try {
      await createPayrollRecord({ employee: fEmployee, department: fDept, salary: Number(fSalary), bonus: Number(fBonus) || 0, deduction: Number(fDeduction) || 0, netSalary, month: fMonth, year: fYear, status: "Pending" });
      loadPayroll(); resetForm(); setShowModal(false);
    } catch (e) { console.log(e); }
  };

  const markAsPaid = async (id) => {
    const rec = payroll.find((p) => p._id === id);
    try { await markPayrollPaid(id); loadPayroll(); }
    catch { setPayroll((prev) => prev.map((p) => p._id === id ? { ...p, status: "Paid" } : p)); }
    show(`${rec?.employee || "Payroll"} marked as Paid`, "success");
  };

  const deleteRecord = async (id) => {
    const rec = payroll.find((p) => p._id === id);
    try { await deletePayrollRecord(id); loadPayroll(); }
    catch { setPayroll((prev) => prev.filter((p) => p._id !== id)); }
    show(`${rec?.employee || "Record"} payroll record deleted`, "error");
  };

  const totalPayroll  = payroll.reduce((s, i) => s + (Number(i.netSalary) || 0), 0);
  const paidAmount    = payroll.filter(i => i.status === "Paid").reduce((s, i) => s + (Number(i.netSalary) || 0), 0);
  const pendingAmount = payroll.filter(i => i.status === "Pending").reduce((s, i) => s + (Number(i.netSalary) || 0), 0);
  const paidCount     = payroll.filter(i => i.status === "Paid").length;
  const pendingCount  = payroll.filter(i => i.status === "Pending").length;

  const deptMap = {};
  payroll.forEach((p) => { const d = p.department || "Other"; deptMap[d] = (deptMap[d] || 0) + (Number(p.netSalary) || 0); });
  const deptChartData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  const monthMap = {};
  payroll.forEach((p) => { if (p.month) monthMap[p.month] = (monthMap[p.month] || 0) + (Number(p.netSalary) || 0); });
  const monthChartData = MONTHS.filter(m => monthMap[m]).map(m => ({ name: m.slice(0, 3), value: monthMap[m] }));

  const filtered = payroll.filter((p) => {
    const matchSearch = !searchTerm || p.employee?.toLowerCase().includes(searchTerm.toLowerCase()) || p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchMonth  = monthFilter  === "All" || p.month === monthFilter;
    return matchSearch && matchStatus && matchMonth;
  });

  const uniqueMonths = [...new Set(payroll.map(p => p.month).filter(Boolean))];

  const STATS = [
    { label: "Total Records", value: payroll.length,                           prefix: "",  color: "blue",   icon: <IconUsers size={22} /> },
    { label: "Total Payroll", value: totalPayroll.toLocaleString("en-IN"),     prefix: "₹", color: "green",  icon: <IconWallet size={22} /> },
    { label: "Paid",          value: paidAmount.toLocaleString("en-IN"),       prefix: "₹", color: "violet", icon: <IconTrendingUp size={22} /> },
    { label: "Pending",       value: pendingAmount.toLocaleString("en-IN"),    prefix: "₹", color: "red",    icon: <IconClock size={22} /> },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>Payroll</Title>
          <Text size="sm" c="dimmed">Manage employee compensation and payments</Text>
        </div>
        <Group gap="sm">
          <Button variant={activeTab === "list" ? "filled" : "default"} size="sm" onClick={() => setActiveTab("list")}>List</Button>
          <Button variant={activeTab === "analytics" ? "filled" : "default"} size="sm" onClick={() => setActiveTab("analytics")}>Analytics</Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowModal(true)}>Generate Payroll</Button>
        </Group>
      </Group>

      <SimpleGrid cols={4}>
        {STATS.map((s) => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Group gap="md">
              <Paper w={48} h={48} radius="lg" style={{ background: `var(--mantine-color-${s.color}-0)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: `var(--mantine-color-${s.color}-6)` }}>{s.icon}</span>
              </Paper>
              <div>
                <Text size="sm" c="dimmed">{s.label}</Text>
                <Text size="lg" fw={700} c={`${s.color}.7`}>{s.prefix}{s.value}</Text>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <Paper withBorder radius="lg" p="lg">
          <Group gap="sm" mb="md" wrap="wrap">
            <TextInput
              placeholder="Search employee or department..."
              leftSection={<IconSearch size={15} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              data={[{ value: "All", label: "All Status" }, { value: "Paid", label: "Paid" }, { value: "Pending", label: "Pending" }]}
              w={140}
            />
            <Select
              value={monthFilter}
              onChange={(v) => setMonthFilter(v)}
              data={[{ value: "All", label: "All Months" }, ...uniqueMonths.map(m => ({ value: m, label: m }))]}
              w={150}
            />
            <Text size="sm" c="dimmed" style={{ display: "flex", alignItems: "center" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</Text>
          </Group>

          {payroll.length > 0 && (
            <Stack gap={4} mb="md">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Payment progress</Text>
                <Text size="sm" fw={600}>{paidCount} / {payroll.length} paid</Text>
              </Group>
              <Progress value={payroll.length > 0 ? Math.round((paidCount / payroll.length) * 100) : 0} color="green" size="sm" radius="xl" />
            </Stack>
          )}

          <DataTable
            columns={[
              { key: "employee",   label: "Employee",   sortable: true, render: (val) => <Text fw={600}>{val}</Text> },
              { key: "department", label: "Department", sortable: true, render: (val) => val || "-" },
              { key: "salary",     label: "Base Salary", sortable: true, render: (val) => `₹${Number(val).toLocaleString("en-IN")}` },
              { key: "bonus",      label: "Bonus",      render: (val) => <Text c="green" fw={600}>+₹{Number(val).toLocaleString("en-IN")}</Text> },
              { key: "deduction",  label: "Deduction",  render: (val) => <Text c="red" fw={600}>-₹{Number(val).toLocaleString("en-IN")}</Text> },
              { key: "netSalary",  label: "Net Salary", sortable: true, render: (val) => <Text fw={700} c="blue">₹{Number(val).toLocaleString("en-IN")}</Text> },
              { key: "month",      label: "Month",      render: (val, row) => `${val} ${row.year || ""}` },
              {
                key: "status", label: "Status", render: (val) => {
                  const badge = getStatusBadge(val);
                  return (
                    <Badge
                      variant="light"
                      color={val === "Paid" ? "green" : "orange"}
                      size="sm"
                    >
                      {val}
                    </Badge>
                  );
                }
              },
              {
                key: "_actions", label: "Action", render: (_, row) => (
                  <Group gap="xs">
                    <Button size="xs" variant="light" leftSection={<IconFileText size={12} />} onClick={(e) => { e.stopPropagation(); setPayslipRecord(row); }}>
                      Payslip
                    </Button>
                    <Button size="xs" color="green" disabled={row.status === "Paid"} onClick={(e) => { e.stopPropagation(); markAsPaid(row._id); }}>
                      Mark Paid
                    </Button>
                    <ActionIcon variant="light" color="red" size="sm" onClick={(e) => { e.stopPropagation(); deleteRecord(row._id); }}>
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                )
              },
            ]}
            data={filtered}
            rowsPerPage={rowsPerPage}
            emptyText={payroll.length === 0 ? 'No payroll records. Click "Generate Payroll" to add one.' : "No records match your filters."}
            rowKey="_id"
          />
        </Paper>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && (
        <Stack gap="md">
          <SimpleGrid cols={2}>
            {[
              { title: "Payroll by Department", data: deptChartData, multiColor: true },
              { title: "Payroll by Month",      data: monthChartData, multiColor: false },
            ].map(({ title, data, multiColor }) => (
              <Paper key={title} withBorder p="lg" radius="lg">
                <Text fw={600} mb="md">{title}</Text>
                {data.length === 0 ? (
                  <Text c="dimmed" size="sm">No data</Text>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} />
                      <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                        {multiColor && data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            ))}
          </SimpleGrid>

          <Paper withBorder p="lg" radius="lg">
            <Text fw={600} mb="md">Payment Status Summary</Text>
            <SimpleGrid cols={3}>
              {[
                { label: "Total Records", value: payroll.length,                                                  color: "blue" },
                { label: "Paid",          value: `${paidCount} (₹${paidAmount.toLocaleString("en-IN")})`,        color: "green" },
                { label: "Pending",       value: `${pendingCount} (₹${pendingAmount.toLocaleString("en-IN")})`,  color: "orange" },
              ].map((s) => (
                <Paper key={s.label} p="md" radius="lg" style={{ background: `var(--mantine-color-${s.color}-0)` }}>
                  <Text size="sm" c="dimmed" mb={4}>{s.label}</Text>
                  <Text size="lg" fw={700} c={`${s.color}.7`}>{s.value}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>
        </Stack>
      )}

      {/* ── GENERATE MODAL ── */}
      <Modal opened={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Generate Payroll" size="md">
        <Stack gap="md">
          <TextInput label="Employee Name *" placeholder="Full name" value={fEmployee} onChange={(e) => setFEmployee(e.currentTarget.value)} />
          <Group grow>
            <TextInput label="Department" placeholder="e.g. IT" value={fDept} onChange={(e) => setFDept(e.currentTarget.value)} />
            <Select label="Month" value={fMonth} onChange={(v) => setFMonth(v)} data={MONTHS} />
          </Group>
          <Group grow>
            <TextInput label="Base Salary (₹) *" type="number" placeholder="50000" value={fSalary} onChange={(e) => setFSalary(e.currentTarget.value)} />
            <TextInput label="Year" type="number" value={fYear} onChange={(e) => setFYear(e.currentTarget.value)} />
          </Group>
          <Group grow>
            <TextInput label="Bonus (₹)" type="number" placeholder="0" value={fBonus} onChange={(e) => setFBonus(e.currentTarget.value)} />
            <TextInput label="Deduction (₹)" type="number" placeholder="0" value={fDeduction} onChange={(e) => setFDeduction(e.currentTarget.value)} />
          </Group>

          <Paper withBorder p="sm" radius="md" bg="green.0">
            <Group justify="space-between">
              <Text fw={600} c="green">Net Salary</Text>
              <Text size="lg" fw={700} c="green">₹{netSalary.toLocaleString("en-IN")}</Text>
            </Group>
          </Paper>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button onClick={generatePayroll}>Generate Payroll</Button>
          </Group>
        </Stack>
      </Modal>

      {payslipRecord && <PayslipModal record={payslipRecord} onClose={() => setPayslipRecord(null)} />}
    </Stack>
  );
};

export default Payroll;
