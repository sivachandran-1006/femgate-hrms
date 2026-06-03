import { useEffect, useState } from "react";
import { fetchPayroll, createPayrollRecord, markPayrollPaid, deletePayrollRecord } from "../../api/payrollApi";
import {
  Plus, Users, Wallet, TrendingUp, Clock,
  Search, CheckCircle, XCircle, AlertCircle, FileText, Printer,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";

import { COLORS }                                         from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }            from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                  from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE } from "../../theme/sizes";
import { getStatusBadge }                                 from "../../utils/helpers";
import DataTable           from "../../components/ui/DataTable";
import { useToast }        from "../../components/ui/Toast";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.info,
];

const MOCK_PAYROLL_DATA = [
  { _id: "p001", employee: "Mani",       department: "IT",         designation: "Senior Developer",    employeeId: "MGT001", salary: 72000,  bonus: 5000,  deduction: 3000, netSalary: 74000,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p002", employee: "P Santhosh", department: "IT",         designation: "Software Engineer",   employeeId: "MGT002", salary: 68000,  bonus: 4000,  deduction: 2800, netSalary: 69200,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p003", employee: "C Santhosh", department: "IT",         designation: "Software Engineer",   employeeId: "MGT003", salary: 65000,  bonus: 3500,  deduction: 2500, netSalary: 66000,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p004", employee: "Suriya",     department: "IT",         designation: "Tech Lead",           employeeId: "MGT004", salary: 78000,  bonus: 6000,  deduction: 3500, netSalary: 80500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p005", employee: "Siva",       department: "Management", designation: "Project Manager",     employeeId: "MGT005", salary: 95000,  bonus: 10000, deduction: 5000, netSalary: 100000, month: "May",   year: "2026", status: "Pending" },
  { _id: "p006", employee: "Aravinth",   department: "IT",         designation: "Software Engineer",   employeeId: "MGT006", salary: 62000,  bonus: 4000,  deduction: 2500, netSalary: 63500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p007", employee: "Safeer",     department: "Finance",    designation: "Finance Analyst",     employeeId: "MGT007", salary: 58000,  bonus: 2000,  deduction: 2000, netSalary: 58000,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p008", employee: "Sabari",     department: "IT",         designation: "QA Engineer",         employeeId: "MGT008", salary: 55000,  bonus: 2500,  deduction: 2000, netSalary: 55500,  month: "May",   year: "2026", status: "Paid"    },
  { _id: "p009", employee: "Vignesh",    department: "IT",         designation: "Frontend Developer",  employeeId: "MGT009", salary: 60000,  bonus: 3000,  deduction: 2200, netSalary: 60800,  month: "May",   year: "2026", status: "Pending" },
  { _id: "p010", employee: "Mani",       department: "IT",         designation: "Senior Developer",    employeeId: "MGT001", salary: 72000,  bonus: 4000,  deduction: 3000, netSalary: 73000,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p011", employee: "Suriya",     department: "IT",         designation: "Tech Lead",           employeeId: "MGT004", salary: 78000,  bonus: 5000,  deduction: 3500, netSalary: 79500,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p012", employee: "Siva",       department: "Management", designation: "Project Manager",     employeeId: "MGT005", salary: 95000,  bonus: 9000,  deduction: 5000, netSalary: 99000,  month: "April", year: "2026", status: "Paid"    },
  { _id: "p013", employee: "P Santhosh", department: "IT",         designation: "Software Engineer",   employeeId: "MGT002", salary: 68000,  bonus: 3000,  deduction: 2800, netSalary: 68200,  month: "March", year: "2026", status: "Paid"    },
];

// ── Payslip computation helpers ───────────────────────────────────────────────
const computePayslip = (row) => {
  const basic       = Math.round(Number(row.salary) * 0.5);
  const hra         = Math.round(basic * 0.4);
  const transport   = 1500;
  const special     = Number(row.salary) - basic - hra - transport;
  const grossEarnings = basic + hra + transport + Math.max(0, special);

  const pf          = Math.round(basic * 0.12);
  const profTax     = 200;
  const tds         = Math.round(Math.max(0, (grossEarnings * 12 - 250000) / 12 * 0.1));
  const totalDeductions = pf + profTax + tds;

  const netPay      = grossEarnings - totalDeductions;

  return {
    basic,
    hra,
    transport,
    special: Math.max(0, special),
    grossEarnings,
    pf,
    profTax,
    tds,
    totalDeductions,
    netPay,
  };
};

// ── Payslip Modal ─────────────────────────────────────────────────────────────
const PayslipModal = ({ record, darkMode, onClose }) => {
  const ps = computePayslip(record);

  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  const handlePrint = () => {
    // Inject print styles temporarily
    const styleId = "payslip-print-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @media print {
          body > * { display: none !important; }
          #payslip-printable-root { display: block !important; }
          #payslip-printable-root * { display: revert !important; }
          @page { margin: 18mm 14mm; size: A4 portrait; }
        }
      `;
      document.head.appendChild(style);
    }
    window.print();
  };

  // Overlay backdrop respects dark mode
  const backdropBg = darkMode ? "rgba(0,0,0,0.70)" : "rgba(30,41,59,0.55)";

  // Table row styles (always light)
  const thStyle = {
    padding: "9px 14px",
    textAlign: "left",
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    fontFamily: FONT_FAMILY.base,
    color: "#475569",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  };
  const tdStyle = {
    padding: "9px 14px",
    fontSize: FONT_SIZE.sm,
    fontFamily: FONT_FAMILY.base,
    color: "#1e293b",
    borderBottom: "1px solid #f1f5f9",
  };
  const tdAmtStyle = { ...tdStyle, textAlign: "right", fontWeight: FONT_WEIGHT.semibold };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: backdropBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: Z_INDEX.modal + 10,
        padding: `${SPACING[4]}px`,
        overflowY: "auto",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Wrapper used for print targeting */}
      <div
        id="payslip-printable-root"
        style={{
          background: "#ffffff",
          borderRadius: RADIUS["3xl"],
          width: "100%",
          maxWidth: 680,
          boxShadow: SHADOW.modal,
          fontFamily: FONT_FAMILY.base,
          color: "#1e293b",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Company Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)",
          padding: `${SPACING[6]}px ${SPACING[6]}px ${SPACING[5]}px`,
          display: "flex",
          alignItems: "center",
          gap: GAP.lg,
        }}>
          {/* Logo placeholder */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: RADIUS.xl,
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.extrabold, color: "#ffffff", letterSpacing: "-1px" }}>MG</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: "#ffffff", letterSpacing: "0.5px" }}>
              MGate Technologies
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.sm, color: "rgba(255,255,255,0.80)", fontFamily: FONT_FAMILY.base }}>
              No. 12, Tech Park, Coimbatore — 641 035, Tamil Nadu, India
            </p>
            <p style={{ margin: "1px 0 0", fontSize: FONT_SIZE.xs, color: "rgba(255,255,255,0.65)", fontFamily: FONT_FAMILY.base }}>
              hr@mgatetech.com &nbsp;|&nbsp; +91 99999 00000
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: RADIUS.lg,
            padding: `${SPACING[2]}px ${SPACING[3]}px`,
            textAlign: "right",
          }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: "rgba(255,255,255,0.75)", fontFamily: FONT_FAMILY.base }}>PAY SLIP</p>
            <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: "#ffffff", fontFamily: FONT_FAMILY.base }}>
              {record.month} {record.year}
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: `${SPACING[5]}px ${SPACING[6]}px` }}>

          {/* ── Employee Details ── */}
          <div style={{
            background: "#f8fafc",
            borderRadius: RADIUS.xl,
            border: "1px solid #e2e8f0",
            padding: `${SPACING[4]}px ${SPACING[5]}px`,
            marginBottom: SPACING[5],
          }}>
            <p style={{ margin: `0 0 ${SPACING[3]}px`, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: "#94a3b8", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: FONT_FAMILY.base }}>
              Employee Details
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: `${SPACING[3]}px ${GAP.lg}px` }}>
              {[
                { label: "Name",         value: record.employee },
                { label: "Employee ID",  value: record.employeeId || "MGT—" },
                { label: "Department",   value: record.department || "—" },
                { label: "Designation",  value: record.designation || "—" },
                { label: "Bank Account", value: "XXXX XXXX 1234" },
                { label: "PAN",          value: "ABXXX9999X" },
              ].map((f) => (
                <div key={f.label}>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: "#94a3b8", fontFamily: FONT_FAMILY.base }}>{f.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: "#1e293b", fontFamily: FONT_FAMILY.base }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Earnings & Deductions side by side ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.md, marginBottom: SPACING[5] }}>

            {/* Earnings */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: RADIUS.xl, overflow: "hidden" }}>
              <div style={{ background: "#f0fdf4", padding: "10px 14px", borderBottom: "1px solid #bbf7d0" }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: "#16a34a", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: FONT_FAMILY.base }}>Earnings</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Component</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Basic Salary",          ps.basic],
                    ["HRA (40% of Basic)",     ps.hra],
                    ["Transport Allowance",    ps.transport],
                    ["Special Allowance",      ps.special],
                  ].map(([label, amt]) => (
                    <tr key={label}>
                      <td style={tdStyle}>{label}</td>
                      <td style={tdAmtStyle}>{fmt(amt)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f0fdf4" }}>
                    <td style={{ ...tdStyle, fontWeight: FONT_WEIGHT.bold, color: "#16a34a", borderTop: "2px solid #bbf7d0", borderBottom: "none" }}>Gross Earnings</td>
                    <td style={{ ...tdAmtStyle, fontWeight: FONT_WEIGHT.bold, color: "#16a34a", borderTop: "2px solid #bbf7d0", borderBottom: "none" }}>{fmt(ps.grossEarnings)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Deductions */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: RADIUS.xl, overflow: "hidden" }}>
              <div style={{ background: "#fef2f2", padding: "10px 14px", borderBottom: "1px solid #fecaca" }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: "#dc2626", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: FONT_FAMILY.base }}>Deductions</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Component</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["PF (12% of Basic)",      ps.pf],
                    ["Professional Tax",       ps.profTax],
                    ["TDS",                    ps.tds],
                  ].map(([label, amt]) => (
                    <tr key={label}>
                      <td style={tdStyle}>{label}</td>
                      <td style={tdAmtStyle}>{fmt(amt)}</td>
                    </tr>
                  ))}
                  {/* spacer row to align footer with earnings table */}
                  <tr>
                    <td style={{ ...tdStyle, color: "transparent", userSelect: "none" }}>—</td>
                    <td style={{ ...tdAmtStyle, color: "transparent", userSelect: "none" }}>—</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ background: "#fef2f2" }}>
                    <td style={{ ...tdStyle, fontWeight: FONT_WEIGHT.bold, color: "#dc2626", borderTop: "2px solid #fecaca", borderBottom: "none" }}>Total Deductions</td>
                    <td style={{ ...tdAmtStyle, fontWeight: FONT_WEIGHT.bold, color: "#dc2626", borderTop: "2px solid #fecaca", borderBottom: "none" }}>{fmt(ps.totalDeductions)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Net Pay ── */}
          <div style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            borderRadius: RADIUS.xl,
            padding: `${SPACING[4]}px ${SPACING[5]}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: SPACING[5],
          }}>
            <div>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: "rgba(255,255,255,0.75)", fontWeight: FONT_WEIGHT.medium, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: FONT_FAMILY.base }}>
                Net Pay for {record.month} {record.year}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: "rgba(255,255,255,0.60)", fontFamily: FONT_FAMILY.base }}>
                Gross {fmt(ps.grossEarnings)} — Deductions {fmt(ps.totalDeductions)}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: FONT_WEIGHT.extrabold, color: "#ffffff", fontFamily: FONT_FAMILY.base, letterSpacing: "-0.5px" }}>
              {fmt(ps.netPay)}
            </p>
          </div>

          {/* ── Footer note ── */}
          <p style={{ margin: `0 0 ${SPACING[5]}px`, fontSize: FONT_SIZE.xs, color: "#94a3b8", textAlign: "center", fontFamily: FONT_FAMILY.base }}>
            This is a computer-generated payslip and does not require a signature.
          </p>

          {/* ── Action Buttons (hidden during print) ── */}
          <div
            className="no-print"
            style={{ display: "flex", gap: GAP.md, justifyContent: "flex-end" }}
          >
            <button
              onClick={onClose}
              style={{
                padding: `${SPACING[2] + 2}px ${SPACING[5]}px`,
                border: "1px solid #e2e8f0",
                borderRadius: RADIUS.lg,
                background: "#ffffff",
                color: "#475569",
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.semibold,
                fontFamily: FONT_FAMILY.base,
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: GAP.sm,
                padding: `${SPACING[2] + 2}px ${SPACING[5]}px`,
                border: "none",
                borderRadius: RADIUS.lg,
                background: COLORS.primary,
                color: "#ffffff",
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.semibold,
                fontFamily: FONT_FAMILY.base,
                cursor: "pointer",
              }}
            >
              <Printer size={ICON_SIZE.xs + 2} strokeWidth={ICON_STROKE.normal} />
              Print / Download
            </button>
          </div>
        </div>
      </div>

      {/* Print-only global style: hide everything except the payslip */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #payslip-printable-root { display: block !important; position: static !important; box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// ── Main Payroll Component ────────────────────────────────────────────────────
const Payroll = ({ darkMode = false }) => {
  const { show } = useToast();
  const surface  = darkMode ? COLORS.dark : COLORS.light;

  const [payroll, setPayroll]           = useState(MOCK_PAYROLL_DATA);
  const [currentPage, setCurrentPage]   = useState(1);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter]   = useState("All");
  const [showModal, setShowModal]       = useState(false);
  const [activeTab, setActiveTab]       = useState("list");

  // Payslip state
  const [payslipRecord, setPayslipRecord] = useState(null);

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
    if (!fEmployee.trim() || !fSalary) { alert("Employee name and salary are required"); return; }
    try {
      await createPayrollRecord({
        employee: fEmployee, department: fDept,
        salary: Number(fSalary), bonus: Number(fBonus) || 0,
        deduction: Number(fDeduction) || 0, netSalary,
        month: fMonth, year: fYear, status: "Pending",
      });
      loadPayroll(); resetForm(); setShowModal(false);
    } catch (e) { console.log(e); }
  };

  const markAsPaid = async (id) => {
    const rec = payroll.find((p) => p._id === id);
    try {
      await markPayrollPaid(id);
      loadPayroll();
    } catch (e) {
      setPayroll((prev) => prev.map((p) => p._id === id ? { ...p, status: "Paid" } : p));
    }
    show(`${rec?.employee || "Payroll"} marked as Paid`, "success");
  };

  const deleteRecord = async (id) => {
    const rec = payroll.find((p) => p._id === id);
    try {
      await deletePayrollRecord(id);
      loadPayroll();
    } catch (e) {
      setPayroll((prev) => prev.filter((p) => p._id !== id));
    }
    show(`${rec?.employee || "Record"} payroll record deleted`, "error");
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
    { label: "Total Records",   value: payroll.length,                       prefix: "",  icon: <Users size={ICON_SIZE.xl} color={COLORS.primary} />,    iconBg: COLORS.primaryLight,  valueColor: COLORS.gray900  },
    { label: "Total Payroll",   value: totalPayroll.toLocaleString("en-IN"),  prefix: "₹", icon: <Wallet size={ICON_SIZE.xl} color={COLORS.success} />,   iconBg: COLORS.successMuted,  valueColor: COLORS.success  },
    { label: "Paid",            value: paidAmount.toLocaleString("en-IN"),    prefix: "₹", icon: <TrendingUp size={ICON_SIZE.xl} color={COLORS.purple} />, iconBg: COLORS.purpleLight,   valueColor: COLORS.purple   },
    { label: "Pending",         value: pendingAmount.toLocaleString("en-IN"), prefix: "₹", icon: <Clock size={ICON_SIZE.xl} color={COLORS.danger} />,      iconBg: COLORS.dangerMuted,   valueColor: COLORS.danger   },
  ];

  const uniqueMonths = [...new Set(payroll.map(p => p.month).filter(Boolean))];

  const inputStyle = {
    border: `1px solid ${surface.border}`,
    borderRadius: RADIUS.lg,
    padding: PADDING.input,
    fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: surface.inputBg,
    color: surface.text,
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING[6] }}>
        <div>
          <h1 style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0, fontFamily: FONT_FAMILY.base }}>Payroll</h1>
          <p style={{ fontSize: FONT_SIZE.base, color: surface.subtext, marginTop: GAP.xs, fontFamily: FONT_FAMILY.base }}>Manage employee compensation and payments</p>
        </div>
        <div style={{ display: "flex", gap: GAP.md }}>
          {/* Tab switcher */}
          {["list","analytics"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: PADDING.btn,
              borderRadius: RADIUS.lg,
              border: "none",
              cursor: "pointer",
              fontSize: FONT_SIZE.base,
              fontWeight: FONT_WEIGHT.medium,
              fontFamily: FONT_FAMILY.base,
              textTransform: "capitalize",
              background: activeTab === t ? COLORS.gray100 : "transparent",
              color: activeTab === t ? surface.text : surface.subtext,
            }}>{t}</button>
          ))}
          <button onClick={() => setShowModal(true)} style={{
            display: "flex",
            alignItems: "center",
            gap: GAP.sm,
            background: COLORS.primary,
            color: COLORS.white,
            border: "none",
            borderRadius: RADIUS.lg,
            padding: `${SPACING[2] + 1}px ${SPACING[5]}px`,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.semibold,
            fontFamily: FONT_FAMILY.base,
            cursor: "pointer",
          }}>
            <Plus size={ICON_SIZE.sm} strokeWidth={ICON_STROKE.thick} /> Generate Payroll
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.lg - 2, marginBottom: SPACING[5] }}>
        {statCards.map((c, i) => (
          <div key={i} style={{
            background: surface.cardBg,
            borderRadius: RADIUS["3xl"],
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.card,
            padding: SPACING[5],
            display: "flex",
            alignItems: "center",
            gap: GAP.lg - 2,
          }}>
            <div style={{
              width: LAYOUT.iconBoxLg,
              height: LAYOUT.iconBoxLg,
              borderRadius: RADIUS.xl,
              background: c.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>{c.icon}</div>
            <div>
              <p style={{ fontSize: FONT_SIZE.sm, color: surface.subtext, margin: `0 0 ${GAP.xs}px`, fontFamily: FONT_FAMILY.base }}>{c.label}</p>
              <p style={{ fontSize: SPACING[5], fontWeight: FONT_WEIGHT.bold, color: c.valueColor, margin: 0, fontFamily: FONT_FAMILY.base }}>{c.prefix}{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div style={{
          background: surface.cardBg,
          borderRadius: RADIUS["3xl"],
          border: `1px solid ${surface.border}`,
          boxShadow: SHADOW.card,
          padding: SPACING[6],
        }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: GAP.md, marginBottom: SPACING[4] + 2, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={ICON_SIZE.xs + 2} color={COLORS.gray400} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search employee or department…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, paddingLeft: SPACING[4] + GAP.sm + 2 }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 130, cursor: "pointer" }}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={monthFilter}
              onChange={e => { setMonthFilter(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, width: 140, cursor: "pointer" }}
            >
              <option value="All">All Months</option>
              {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray400, display: "flex", alignItems: "center", fontFamily: FONT_FAMILY.base }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Progress bar */}
          {payroll.length > 0 && (
            <div style={{ marginBottom: SPACING[4] + 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: SPACING[1] + 1 }}>
                <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext, fontFamily: FONT_FAMILY.base }}>Payment progress</span>
                <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text, fontFamily: FONT_FAMILY.base }}>{paidCount} / {payroll.length} paid</span>
              </div>
              <div style={{ height: 6, background: COLORS.gray100, borderRadius: RADIUS.full }}>
                <div style={{
                  height: "100%",
                  borderRadius: RADIUS.full,
                  background: COLORS.success,
                  width: `${payroll.length > 0 ? Math.round((paidCount / payroll.length) * 100) : 0}%`,
                  transition: TRANSITION.slow,
                }} />
              </div>
            </div>
          )}

          <DataTable
            columns={[
              { key: "employee", label: "Employee", sortable: true, render: (val) => <span style={{ fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{val}</span> },
              { key: "department", label: "Department", sortable: true, render: (val) => val || "—" },
              { key: "salary", label: "Base Salary", sortable: true, render: (val) => `₹${Number(val).toLocaleString("en-IN")}` },
              { key: "bonus", label: "Bonus", render: (val) => <span style={{ color: COLORS.success, fontWeight: FONT_WEIGHT.semibold }}>+₹{Number(val).toLocaleString("en-IN")}</span> },
              { key: "deduction", label: "Deduction", render: (val) => <span style={{ color: COLORS.danger, fontWeight: FONT_WEIGHT.semibold }}>-₹{Number(val).toLocaleString("en-IN")}</span> },
              { key: "netSalary", label: "Net Salary", sortable: true, render: (val) => <span style={{ fontWeight: FONT_WEIGHT.bold, color: COLORS.primary }}>₹{Number(val).toLocaleString("en-IN")}</span> },
              { key: "month", label: "Month", render: (val, row) => `${val} ${row.year || ""}` },
              {
                key: "status", label: "Status", render: (val) => {
                  const badge = getStatusBadge(val);
                  return (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: SPACING[1] + 1,
                      padding: PADDING.badge, borderRadius: RADIUS.full,
                      fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
                      background: badge.bg, color: badge.color,
                    }}>
                      {val === "Paid" ? <CheckCircle size={ICON_SIZE.xs - 1} /> : <AlertCircle size={ICON_SIZE.xs - 1} />}
                      {val}
                    </span>
                  );
                }
              },
              {
                key: "_actions", label: "Action", render: (_, row) => (
                  <div style={{ display: "flex", gap: GAP.sm - 2 }}>
                    {/* View Payslip button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setPayslipRecord(row); }}
                      title="View Payslip"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: COLORS.primaryLight,
                        color: COLORS.primary,
                        border: `1px solid ${COLORS.primaryLight}`,
                        borderRadius: RADIUS.md,
                        padding: `${SPACING[1] + 3}px ${SPACING[3] + 2}px`,
                        fontSize: FONT_SIZE.sm,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        cursor: "pointer",
                      }}
                    >
                      <FileText size={ICON_SIZE.xs} strokeWidth={ICON_STROKE.normal} />
                      Payslip
                    </button>
                    <button
                      disabled={row.status === "Paid"}
                      onClick={(e) => { e.stopPropagation(); markAsPaid(row._id); }}
                      style={{
                        background: row.status === "Paid" ? COLORS.gray100 : COLORS.success,
                        color: row.status === "Paid" ? COLORS.gray400 : COLORS.white,
                        border: "none", borderRadius: RADIUS.md,
                        padding: `${SPACING[1] + 3}px ${SPACING[3] + 2}px`,
                        fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        cursor: row.status === "Paid" ? "not-allowed" : "pointer",
                      }}
                    >Mark Paid</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRecord(row._id); }}
                      style={{
                        background: COLORS.white, color: COLORS.danger,
                        border: `1px solid ${COLORS.dangerMuted}`, borderRadius: RADIUS.md,
                        padding: `${SPACING[1] + 3}px ${SPACING[2] + 2}px`,
                        fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer",
                      }}
                    >
                      <XCircle size={ICON_SIZE.xs + 1} />
                    </button>
                  </div>
                )
              },
            ]}
            data={filtered}
            rowsPerPage={rowsPerPage}
            darkMode={darkMode}
            emptyText={payroll.length === 0 ? 'No payroll records. Click "Generate Payroll" to add one.' : "No records match your filters."}
            rowKey="_id"
          />
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg - 2 }}>
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS["3xl"],
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.card,
            padding: SPACING[5],
          }}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${SPACING[4]}px`, fontFamily: FONT_FAMILY.base }}>Payroll by Department</h3>
            {deptChartData.length === 0
              ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400, fontFamily: FONT_FAMILY.base }}>No data</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptChartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                    <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.sm, fill: surface.subtext, fontFamily: FONT_FAMILY.base }} />
                    <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext, fontFamily: FONT_FAMILY.base }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base }} />
                    <Bar dataKey="value" radius={[RADIUS.sm, RADIUS.sm, 0, 0]}>
                      {deptChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS["3xl"],
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.card,
            padding: SPACING[5],
          }}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${SPACING[4]}px`, fontFamily: FONT_FAMILY.base }}>Payroll by Month</h3>
            {monthChartData.length === 0
              ? <p style={{ fontSize: FONT_SIZE.base, color: COLORS.gray400, fontFamily: FONT_FAMILY.base }}>No data</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthChartData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                    <XAxis dataKey="name" tick={{ fontSize: FONT_SIZE.sm, fill: surface.subtext, fontFamily: FONT_FAMILY.base }} />
                    <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext, fontFamily: FONT_FAMILY.base }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Payroll"]} contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base }} />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[RADIUS.sm, RADIUS.sm, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS["3xl"],
            border: `1px solid ${surface.border}`,
            boxShadow: SHADOW.card,
            padding: SPACING[5],
            gridColumn: "1 / -1",
          }}>
            <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: `0 0 ${SPACING[4]}px`, fontFamily: FONT_FAMILY.base }}>Payment Status Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: GAP.lg }}>
              {[
                { label: "Total Records", value: payroll.length,                                                      color: COLORS.primary, bg: COLORS.primaryLight  },
                { label: "Paid",          value: `${paidCount} (₹${paidAmount.toLocaleString("en-IN")})`,             color: COLORS.success,  bg: COLORS.successMuted  },
                { label: "Pending",       value: `${pendingCount} (₹${pendingAmount.toLocaleString("en-IN")})`,        color: COLORS.warning,  bg: COLORS.warningMuted  },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: RADIUS.xl, padding: `${SPACING[4]}px ${SPACING[4] + 2}px` }}>
                  <p style={{ fontSize: FONT_SIZE.sm, color: surface.subtext, margin: `0 0 ${GAP.sm - 2}px`, fontFamily: FONT_FAMILY.base }}>{s.label}</p>
                  <p style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: s.color, margin: 0, fontFamily: FONT_FAMILY.base }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATE MODAL ── */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: Z_INDEX.modal,
        }}>
          <div style={{
            background: surface.cardBg,
            borderRadius: RADIUS["4xl"],
            padding: PADDING.modal,
            width: "100%",
            maxWidth: 500,
            boxShadow: SHADOW.modal,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING[6] }}>
              <h2 style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: surface.text, margin: 0, fontFamily: FONT_FAMILY.base }}>Generate Payroll</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, fontSize: FONT_SIZE["2xl"], fontFamily: FONT_FAMILY.base }}
              >×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg - 2 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Employee Name *</label>
                <input style={inputStyle} placeholder="Full name" value={fEmployee} onChange={e => setFEmployee(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Department</label>
                <input style={inputStyle} placeholder="e.g. IT" value={fDept} onChange={e => setFDept(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Month</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={fMonth} onChange={e => setFMonth(e.target.value)}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Base Salary (₹) *</label>
                <input style={inputStyle} type="number" placeholder="50000" value={fSalary} onChange={e => setFSalary(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Year</label>
                <input style={inputStyle} type="number" value={fYear} onChange={e => setFYear(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Bonus (₹)</label>
                <input style={inputStyle} type="number" placeholder="0" value={fBonus} onChange={e => setFBonus(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.medium, display: "block", marginBottom: SPACING[1] + 1, fontFamily: FONT_FAMILY.base }}>Deduction (₹)</label>
                <input style={inputStyle} type="number" placeholder="0" value={fDeduction} onChange={e => setFDeduction(e.target.value)} />
              </div>
            </div>

            {/* Net salary preview */}
            <div style={{
              background: COLORS.successMuted,
              border: `1px solid ${COLORS.successLight}`,
              borderRadius: RADIUS.lg,
              padding: `${SPACING[3]}px ${SPACING[4]}px`,
              marginTop: SPACING[4],
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: FONT_SIZE.base, color: COLORS.success, fontWeight: FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base }}>Net Salary</span>
              <span style={{ fontSize: SPACING[5], fontWeight: FONT_WEIGHT.bold, color: COLORS.success, fontFamily: FONT_FAMILY.base }}>₹{netSalary.toLocaleString("en-IN")}</span>
            </div>

            <div style={{ display: "flex", gap: GAP.md, marginTop: SPACING[5] }}>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{
                  flex: 1,
                  padding: SPACING[3],
                  border: `1px solid ${surface.border}`,
                  borderRadius: RADIUS.lg,
                  background: surface.cardBg,
                  fontSize: FONT_SIZE.md,
                  fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base,
                  color: COLORS.gray600,
                  cursor: "pointer",
                }}
              >Cancel</button>
              <button
                onClick={generatePayroll}
                style={{
                  flex: 2,
                  padding: SPACING[3],
                  border: "none",
                  borderRadius: RADIUS.lg,
                  background: COLORS.primary,
                  color: COLORS.white,
                  fontSize: FONT_SIZE.md,
                  fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base,
                  cursor: "pointer",
                }}
              >Generate Payroll</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYSLIP MODAL ── */}
      {payslipRecord && (
        <PayslipModal
          record={payslipRecord}
          darkMode={darkMode}
          onClose={() => setPayslipRecord(null)}
        />
      )}
    </div>
  );
};

export default Payroll;
