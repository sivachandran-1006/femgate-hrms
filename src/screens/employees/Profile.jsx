import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  IconUser, IconBriefcase, IconCalendarOff, IconClock,
  IconCurrencyRupee, IconFile, IconDeviceLaptop,
  IconPhone, IconMail, IconMapPin, IconAlertCircle,
  IconCalendar, IconBuilding, IconUserCheck, IconDownload,
  IconUpload, IconEye, IconCheck, IconX, IconMinus,
  IconChevronDown,
} from "@tabler/icons-react";

import { IconChartBar, IconHistory }                   from "@tabler/icons-react";
import { useFetchAllEmployees, useEmpAttendance, useEmpLeave, useEmpPayroll, useEmpPerformance, useEmpActivity } from "../../queries/useEmployees";
import { AppLoader }                                   from "../../components/ui/AppLoader";
import { COLORS, STATUS_BADGE }                        from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }         from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }               from "../../theme/spacing";
import { RADIUS, SHADOW, ICON_SIZE, TRANSITION }       from "../../theme/sizes";
import { getAvatarColor, getInitials, formatCurrency } from "../../utils/helpers";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EMPLOYEE = {
  _id: "mock-001",
  name: "Arjun Sharma",
  email: "arjun.sharma@mgatetech.com",
  phone: "+91 98765 43210",
  department: "IT",
  designation: "Senior Software Engineer",
  role: "Admin",
  joinDate: "15 Jan 2023",
  status: "Present",
  salary: 85000,
  address: "42, MG Road, Bengaluru, Karnataka – 560001",
  dateOfBirth: "12 Aug 1994",
  employeeId: "EMP-0042",
  reportingManager: "Ravi Kumar (CTO)",
  employmentType: "Full-Time",
  workLocation: "Bengaluru HQ",
  emergencyContact: { name: "Priya Sharma (Wife)", phone: "+91 90000 11111" },
};

const MOCK_LEAVE_HISTORY = [
  { id: 1, type: "Annual Leave",      from: "10 Jun 2026", to: "12 Jun 2026", days: 3, status: "Approved"  },
  { id: 2, type: "Sick Leave",        from: "15 May 2026", to: "16 May 2026", days: 2, status: "Approved"  },
  { id: 3, type: "Casual Leave",      from: "03 Apr 2026", to: "03 Apr 2026", days: 1, status: "Approved"  },
  { id: 4, type: "Compensatory Off",  from: "20 Mar 2026", to: "20 Mar 2026", days: 1, status: "Rejected"  },
  { id: 5, type: "Annual Leave",      from: "18 Jul 2026", to: "22 Jul 2026", days: 5, status: "Pending"   },
  { id: 6, type: "Work from Home",    from: "28 May 2026", to: "28 May 2026", days: 1, status: "Approved"  },
];

const MOCK_ATTENDANCE = [
  { date: "02 Jun 2026", checkIn: "09:05 AM", checkOut: "06:30 PM", hours: "9h 25m", status: "Present" },
  { date: "01 Jun 2026", checkIn: "08:58 AM", checkOut: "06:00 PM", hours: "9h 02m", status: "Present" },
  { date: "31 May 2026", checkIn: "09:15 AM", checkOut: "06:45 PM", hours: "9h 30m", status: "Present" },
  { date: "30 May 2026", checkIn: "--",        checkOut: "--",        hours: "--",     status: "Leave"   },
  { date: "29 May 2026", checkIn: "09:00 AM", checkOut: "06:20 PM", hours: "9h 20m", status: "Present" },
  { date: "28 May 2026", checkIn: "--",        checkOut: "--",        hours: "--",     status: "Absent"  },
  { date: "27 May 2026", checkIn: "09:00 AM", checkOut: "06:15 PM", hours: "9h 15m", status: "Present" },
  { date: "26 May 2026", checkIn: "09:10 AM", checkOut: "06:00 PM", hours: "8h 50m", status: "Present" },
];

const MOCK_PAYROLL = [
  { month: "May 2026", basic: 85000, allowances: 12000, deductions: 6800,  net: 90200 },
  { month: "Apr 2026", basic: 85000, allowances: 12000, deductions: 6800,  net: 90200 },
  { month: "Mar 2026", basic: 85000, allowances: 10000, deductions: 7500,  net: 87500 },
  { month: "Feb 2026", basic: 85000, allowances: 10000, deductions: 7200,  net: 87800 },
  { month: "Jan 2026", basic: 85000, allowances: 10000, deductions: 7000,  net: 88000 },
  { month: "Dec 2025", basic: 80000, allowances: 10000, deductions: 6500,  net: 83500 },
];

const MOCK_DOCUMENTS = [
  { id: 1, name: "Aadhaar Card",       icon: IconUserCheck, status: "uploaded", date: "15 Jan 2023" },
  { id: 2, name: "PAN Card",           icon: IconFile,      status: "uploaded", date: "15 Jan 2023" },
  { id: 3, name: "Resume / CV",        icon: IconFile,      status: "uploaded", date: "10 Jan 2023" },
  { id: 4, name: "Offer Letter",       icon: IconFile,      status: "uploaded", date: "12 Jan 2023" },
  { id: 5, name: "Experience Letter",  icon: IconFile,      status: "pending",  date: "--"          },
];

const MOCK_ASSETS = [
  { id: 1, name: 'MacBook Pro 14"',  assetId: "LT-0042", assignedDate: "16 Jan 2023", condition: "Excellent", status: "Assigned"  },
  { id: 2, name: 'Dell Monitor 27"', assetId: "MN-0101", assignedDate: "16 Jan 2023", condition: "Good",      status: "Assigned"  },
  { id: 3, name: "Logitech Mouse",   assetId: "MS-0201", assignedDate: "16 Jan 2023", condition: "Good",      status: "Assigned"  },
  { id: 4, name: "Mechanical Keyboard", assetId: "KB-0301", assignedDate: "01 Mar 2023", condition: "Good",   status: "Assigned"  },
  { id: 5, name: "iPhone 14",        assetId: "PH-0022", assignedDate: "01 Jun 2024", condition: "Good",      status: "Assigned"  },
  { id: 6, name: "USB-C Hub",        assetId: "HB-0055", assignedDate: "20 Feb 2023", condition: "Fair",      status: "Returned"  },
];

const TABS = [
  { key: "Personal",    icon: IconUser          },
  { key: "Job",         icon: IconBriefcase     },
  { key: "Leave",       icon: IconCalendarOff   },
  { key: "Attendance",  icon: IconClock         },
  { key: "Payroll",     icon: IconCurrencyRupee },
  { key: "Performance", icon: IconChartBar      },
  { key: "Documents",   icon: IconFile          },
  { key: "Assets",      icon: IconDeviceLaptop  },
  { key: "Activity",    icon: IconHistory       },
];

const DEPT_COLORS = {
  IT:         { bg: COLORS.primaryMuted, text: COLORS.primary  },
  Finance:    { bg: COLORS.successLight, text: COLORS.success  },
  HR:         { bg: COLORS.purpleMuted,  text: COLORS.purple   },
  Management: { bg: COLORS.warningLight, text: COLORS.warning  },
  Marketing:  { bg: COLORS.infoLight,    text: COLORS.info     },
};

// ─── Helper: Status Badge ─────────────────────────────────────────────────────

const Badge = ({ label, dark }) => {
  const map = {
    Present:  { bg: COLORS.successLight,  color: COLORS.success  },
    Approved: { bg: COLORS.successLight,  color: COLORS.success  },
    Assigned: { bg: COLORS.successLight,  color: COLORS.success  },
    uploaded: { bg: COLORS.successLight,  color: COLORS.success  },
    Active:   { bg: COLORS.successLight,  color: COLORS.success  },
    Absent:   { bg: COLORS.dangerMuted,   color: COLORS.danger   },
    Rejected: { bg: COLORS.dangerMuted,   color: COLORS.danger   },
    Returned: { bg: COLORS.dangerMuted,   color: COLORS.danger   },
    Leave:    { bg: COLORS.warningLight,  color: COLORS.warning  },
    Pending:  { bg: COLORS.primaryLight,  color: COLORS.primary  },
    pending:  { bg: COLORS.warningLight,  color: COLORS.warning  },
    Inactive: { bg: COLORS.gray100,       color: COLORS.gray500  },
  };
  const s = map[label] || { bg: COLORS.gray200, color: COLORS.gray600 };
  return (
    <span style={{
      display:      "inline-block",
      padding:      "3px 10px",
      borderRadius: RADIUS.full,
      fontSize:     FONT_SIZE.xs,
      fontWeight:   FONT_WEIGHT.semibold,
      background:   s.bg,
      color:        s.color,
      whiteSpace:   "nowrap",
    }}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

// ─── Payslip generator ────────────────────────────────────────────────────────

const openPayslip = (emp, row) => {
  const w = window.open("", "_blank", "width=680,height=900");
  w.document.write(`<!DOCTYPE html>
<html><head><title>Payslip – ${row.month}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#0f172a;background:#fff}
  .header{background:#2563eb;color:#fff;padding:24px 32px;border-radius:12px;margin-bottom:28px}
  .header h1{margin:0 0 4px;font-size:22px}
  .header p{margin:0;font-size:13px;opacity:.85}
  .section{margin-bottom:20px}
  .section h3{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:0 0 10px}
  table{width:100%;border-collapse:collapse}
  td,th{padding:10px 14px;font-size:14px;border-bottom:1px solid #e2e8f0;text-align:left}
  th{background:#f8fafc;font-weight:600;color:#334155}
  .total-row td{font-weight:700;background:#eff6ff;color:#1d4ed8;font-size:15px}
  .footer{margin-top:32px;font-size:11px;color:#94a3b8;text-align:center}
</style></head><body>
<div class="header">
  <h1>Payslip – ${row.month}</h1>
  <p>${emp.name} &nbsp;|&nbsp; ${emp.designation} &nbsp;|&nbsp; ${emp.department}</p>
  <p>Employee ID: ${emp.employeeId} &nbsp;|&nbsp; Joined: ${emp.joinDate}</p>
</div>
<div class="section">
  <h3>Earnings</h3>
  <table>
    <tr><th>Component</th><th>Amount</th></tr>
    <tr><td>Basic Salary</td><td>₹${Number(row.basic).toLocaleString("en-IN")}</td></tr>
    <tr><td>Allowances</td><td>₹${Number(row.allowances).toLocaleString("en-IN")}</td></tr>
    <tr class="total-row"><td>Gross Earnings</td><td>₹${(Number(row.basic)+Number(row.allowances)).toLocaleString("en-IN")}</td></tr>
  </table>
</div>
<div class="section">
  <h3>Deductions</h3>
  <table>
    <tr><th>Component</th><th>Amount</th></tr>
    <tr><td>PF + Tax</td><td>₹${Number(row.deductions).toLocaleString("en-IN")}</td></tr>
    <tr class="total-row"><td>Total Deductions</td><td>₹${Number(row.deductions).toLocaleString("en-IN")}</td></tr>
  </table>
</div>
<div class="section">
  <table>
    <tr class="total-row"><td>Net Pay</td><td>₹${Number(row.net).toLocaleString("en-IN")}</td></tr>
  </table>
</div>
<div class="footer">This is a system-generated payslip and does not require a signature.</div>
</body></html>`);
  w.document.close();
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value, icon: Icon, dark }) => {
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;
  return (
    <div style={{
      display:      "flex",
      alignItems:   "flex-start",
      gap:          GAP.sm,
      padding:      `${SPACING[3]}px 0`,
      borderBottom: `1px solid ${border}`,
    }}>
      {Icon && (
        <div style={{ width: 32, height: 32, borderRadius: RADIUS.md, background: dark ? COLORS.dark.inputBg : COLORS.gray100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <Icon size={15} color={subtext} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: FONT_SIZE.xs, color: subtext, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base }}>{label}</p>
        <p style={{ margin: 0, fontSize: FONT_SIZE.base, color: text, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, wordBreak: "break-word" }}>{value || "—"}</p>
      </div>
    </div>
  );
};

const MiniStatCard = ({ label, value, color, bg, dark }) => (
  <div style={{
    flex:         1, minWidth: 120,
    background:   dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
    border:       `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
    borderRadius: RADIUS.xl,
    padding:      `${SPACING[4]}px`,
    textAlign:    "center",
    boxShadow:    SHADOW.xs,
  }}>
    <div style={{ width: 44, height: 44, borderRadius: RADIUS.full, background: bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
      <span style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color }}>{value}</span>
    </div>
    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: dark ? COLORS.dark.subtext : COLORS.textMutedLight, fontFamily: FONT_FAMILY.base, fontWeight: FONT_WEIGHT.medium }}>{label}</p>
  </div>
);

const TableWrapper = ({ dark, children }) => (
  <div style={{ overflowX: "auto", borderRadius: RADIUS.xl, border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_FAMILY.base }}>
      {children}
    </table>
  </div>
);

const Th = ({ children, dark }) => (
  <th style={{
    padding:       PADDING.tableHeader,
    textAlign:     "left",
    fontSize:      FONT_SIZE.xs,
    fontWeight:    FONT_WEIGHT.semibold,
    color:         dark ? COLORS.dark.subtext : COLORS.textMutedLight,
    fontFamily:    FONT_FAMILY.base,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    whiteSpace:    "nowrap",
    background:    dark ? COLORS.dark.theadBg : COLORS.gray50,
    borderBottom:  `2px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
  }}>
    {children}
  </th>
);

const Td = ({ children, dark, muted, bold }) => (
  <td style={{
    padding:    PADDING.tableCell,
    fontSize:   FONT_SIZE.base,
    color:      muted
      ? (dark ? COLORS.dark.subtext : COLORS.textMutedLight)
      : (dark ? COLORS.dark.text    : COLORS.textLight),
    fontWeight: bold ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal,
    fontFamily: FONT_FAMILY.base,
    whiteSpace: "nowrap",
  }}>
    {children}
  </td>
);

// ─── Tab Panels ───────────────────────────────────────────────────────────────

const PersonalTab = ({ emp, dark }) => {
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const cardBg  = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg }}>
      {/* Personal Details */}
      <div style={{ background: cardBg, borderRadius: RADIUS.xl, border: `1px solid ${border}`, padding: SPACING[5], boxShadow: SHADOW.xs }}>
        <p style={{ margin: "0 0 12px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, fontFamily: FONT_FAMILY.base }}>Personal Details</p>
        <InfoRow dark={dark} icon={IconUser}         label="Full Name"       value={emp.name}        />
        <InfoRow dark={dark} icon={IconMail}         label="Email Address"   value={emp.email}       />
        <InfoRow dark={dark} icon={IconPhone}        label="Phone"           value={emp.phone}       />
        <InfoRow dark={dark} icon={IconCalendar}     label="Date of Birth"   value={emp.dateOfBirth} />
        <InfoRow dark={dark} icon={IconMapPin}       label="Address"         value={emp.address}     />
      </div>

      {/* Emergency & IDs */}
      <div style={{ background: cardBg, borderRadius: RADIUS.xl, border: `1px solid ${border}`, padding: SPACING[5], boxShadow: SHADOW.xs }}>
        <p style={{ margin: "0 0 12px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, fontFamily: FONT_FAMILY.base }}>Emergency & Identification</p>
        <InfoRow dark={dark} icon={IconAlertCircle}  label="Emergency Contact"        value={emp.emergencyContact?.name}  />
        <InfoRow dark={dark} icon={IconPhone}        label="Emergency Phone"          value={emp.emergencyContact?.phone} />
        <InfoRow dark={dark} icon={IconUserCheck}    label="Employee ID"              value={emp.employeeId}              />
        <InfoRow dark={dark} icon={IconBuilding}     label="Department"               value={emp.department}              />
        <InfoRow dark={dark} icon={IconBriefcase}    label="Designation"              value={emp.designation}             />
      </div>
    </div>
  );
};

const JobTab = ({ emp, dark }) => {
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const cardBg  = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP.lg }}>
      <div style={{ background: cardBg, borderRadius: RADIUS.xl, border: `1px solid ${border}`, padding: SPACING[5], boxShadow: SHADOW.xs }}>
        <p style={{ margin: "0 0 12px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, fontFamily: FONT_FAMILY.base }}>Role & Position</p>
        <InfoRow dark={dark} icon={IconBuilding}    label="Department"          value={emp.department}      />
        <InfoRow dark={dark} icon={IconBriefcase}   label="Designation"         value={emp.designation}     />
        <InfoRow dark={dark} icon={IconUserCheck}   label="Role"                value={emp.role}            />
        <InfoRow dark={dark} icon={IconUser}        label="Reporting Manager"   value={emp.reportingManager}/>
      </div>
      <div style={{ background: cardBg, borderRadius: RADIUS.xl, border: `1px solid ${border}`, padding: SPACING[5], boxShadow: SHADOW.xs }}>
        <p style={{ margin: "0 0 12px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, fontFamily: FONT_FAMILY.base }}>Employment Details</p>
        <InfoRow dark={dark} icon={IconCalendar}    label="Join Date"           value={emp.joinDate}         />
        <InfoRow dark={dark} icon={IconFile}        label="Employment Type"     value={emp.employmentType}   />
        <InfoRow dark={dark} icon={IconMapPin}      label="Work Location"       value={emp.workLocation}     />
        <InfoRow dark={dark} icon={IconCurrencyRupee} label="CTC (Monthly)"    value={emp.salary ? formatCurrency(emp.salary) : "—"} />
      </div>
    </div>
  );
};

const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const LeaveTab = ({ dark, empId }) => {
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;
  const rowHover = dark ? COLORS.dark.rowHover : COLORS.gray50;

  const { data } = useEmpLeave(empId);
  const apiLeaves = data?.leaves;
  // real data when present, else mock fallback (never breaks)
  const rows = apiLeaves && apiLeaves.length
    ? apiLeaves.map((l) => ({ id: l.id, type: l.type, from: fmtD(l.fromDate), to: fmtD(l.toDate), days: l.days, status: l.status }))
    : MOCK_LEAVE_HISTORY;
  const sum = data?.summary;
  const approved  = sum ? sum.approved : rows.filter((l) => l.status === "Approved").length;
  const pending   = sum ? sum.pending  : rows.filter((l) => l.status === "Pending").length;
  const rejected  = sum ? sum.rejected : rows.filter((l) => l.status === "Rejected").length;
  const totalDays = sum ? sum.daysUsed : rows.filter((l) => l.status === "Approved").reduce((s, l) => s + l.days, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
      <div style={{ display: "flex", gap: GAP.md, flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Approved"  value={approved}  color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Pending"   value={pending}   color={COLORS.primary} bg={COLORS.primaryLight} />
        <MiniStatCard dark={dark} label="Rejected"  value={rejected}  color={COLORS.danger}  bg={COLORS.dangerMuted}  />
        <MiniStatCard dark={dark} label="Days Used" value={totalDays} color={COLORS.warning} bg={COLORS.warningLight} />
      </div>

      <TableWrapper dark={dark}>
        <thead>
          <tr>
            <Th dark={dark}>Leave Type</Th>
            <Th dark={dark}>From</Th>
            <Th dark={dark}>To</Th>
            <Th dark={dark}>Days</Th>
            <Th dark={dark}>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              style={{ borderBottom: `1px solid ${border}`, transition: TRANSITION.fast, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Td dark={dark} bold>{row.type}</Td>
              <Td dark={dark} muted>{row.from}</Td>
              <Td dark={dark} muted>{row.to}</Td>
              <Td dark={dark}>{row.days}d</Td>
              <td style={{ padding: PADDING.tableCell }}><Badge label={row.status} dark={dark} /></td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
};

const AttendanceTab = ({ dark, empId }) => {
  const border   = dark ? COLORS.dark.border   : COLORS.borderLight;
  const rowHover = dark ? COLORS.dark.rowHover : COLORS.gray50;

  const { data } = useEmpAttendance(empId);
  const apiRecords = data?.records;
  const rows = apiRecords && apiRecords.length
    ? apiRecords.map((r) => ({
        date: fmtD(r.date),
        checkIn:  r.checkIn  ? new Date(r.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--",
        checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--",
        hours: r.hoursWorked ? `${r.hoursWorked}h` : "--",
        status: r.status,
      }))
    : MOCK_ATTENDANCE;
  const s = data?.summary;
  const present = s ? s.present : rows.filter((a) => a.status === "Present").length;
  const absent  = s ? s.absent  : rows.filter((a) => a.status === "Absent").length;
  const leave   = s ? s.late    : rows.filter((a) => a.status === "Leave").length;
  const total   = rows.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
      {/* Monthly summary */}
      <div style={{ display: "flex", gap: GAP.md, flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Present"      value={present} color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Absent"       value={absent}  color={COLORS.danger}  bg={COLORS.dangerMuted}  />
        <MiniStatCard dark={dark} label={s ? "Late" : "Leave"} value={leave} color={COLORS.warning} bg={COLORS.warningLight} />
        <MiniStatCard dark={dark} label="Total Days"   value={total}   color={COLORS.info}    bg={COLORS.infoLight}    />
      </div>

      <TableWrapper dark={dark}>
        <thead>
          <tr>
            <Th dark={dark}>Date</Th>
            <Th dark={dark}>Check In</Th>
            <Th dark={dark}>Check Out</Th>
            <Th dark={dark}>Hours</Th>
            <Th dark={dark}>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: `1px solid ${border}`, transition: TRANSITION.fast, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Td dark={dark} bold>{row.date}</Td>
              <Td dark={dark} muted>{row.checkIn}</Td>
              <Td dark={dark} muted>{row.checkOut}</Td>
              <Td dark={dark}>{row.hours}</Td>
              <td style={{ padding: PADDING.tableCell }}><Badge label={row.status} dark={dark} /></td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
};

const PayrollTab = ({ emp, dark, empId }) => {
  const border   = dark ? COLORS.dark.border   : COLORS.borderLight;
  const rowHover = dark ? COLORS.dark.rowHover : COLORS.gray50;
  const text     = dark ? COLORS.dark.text     : COLORS.textLight;
  const subtext  = dark ? COLORS.dark.subtext  : COLORS.textMutedLight;

  const { data } = useEmpPayroll(empId);
  const apiPay = data?.payrolls;
  const PAYROLL = apiPay && apiPay.length
    ? apiPay.map((p) => ({
        month: `${p.month} ${p.year}`, basic: p.salary, allowances: p.bonus || 0,
        deductions: p.deduction || 0, net: p.netSalary,
      }))
    : MOCK_PAYROLL;

  const totalNet  = PAYROLL.reduce((s, r) => s + r.net, 0);
  const avgNet    = Math.round(totalNet / (PAYROLL.length || 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
      {/* Payroll summary */}
      <div style={{ display: "flex", gap: GAP.md, flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Months Paid"    value={PAYROLL.length} color={COLORS.primary} bg={COLORS.primaryLight} />
        <MiniStatCard dark={dark} label="Avg Net / Mo"   value={`₹${Math.round(avgNet/1000)}K`}  color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Total YTD"      value={`₹${Math.round(totalNet/1000)}K`} color={COLORS.warning} bg={COLORS.warningLight} />
      </div>

      <TableWrapper dark={dark}>
        <thead>
          <tr>
            <Th dark={dark}>Month</Th>
            <Th dark={dark}>Basic</Th>
            <Th dark={dark}>Allowances</Th>
            <Th dark={dark}>Deductions</Th>
            <Th dark={dark}>Net Pay</Th>
            <Th dark={dark}>Payslip</Th>
          </tr>
        </thead>
        <tbody>
          {PAYROLL.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: `1px solid ${border}`, transition: TRANSITION.fast, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Td dark={dark} bold>{row.month}</Td>
              <Td dark={dark} muted>₹{row.basic.toLocaleString("en-IN")}</Td>
              <Td dark={dark} muted>+₹{row.allowances.toLocaleString("en-IN")}</Td>
              <Td dark={dark} muted>-₹{row.deductions.toLocaleString("en-IN")}</Td>
              <td style={{ padding: PADDING.tableCell }}>
                <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.success, fontFamily: FONT_FAMILY.base }}>
                  ₹{row.net.toLocaleString("en-IN")}
                </span>
              </td>
              <td style={{ padding: PADDING.tableCell }}>
                <button
                  onClick={() => openPayslip(emp, row)}
                  style={{
                    display:      "inline-flex", alignItems: "center", gap: 5,
                    padding:      "6px 12px",
                    borderRadius: RADIUS.md,
                    border:       `1px solid ${COLORS.primary}`,
                    background:   COLORS.primaryMuted,
                    color:        COLORS.primary,
                    fontSize:     FONT_SIZE.xs,
                    fontWeight:   FONT_WEIGHT.semibold,
                    fontFamily:   FONT_FAMILY.base,
                    cursor:       "pointer",
                    transition:   TRANSITION.fast,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.primary; e.currentTarget.style.color = COLORS.white; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.primaryMuted; e.currentTarget.style.color = COLORS.primary; }}
                >
                  <IconDownload size={13} /> Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
};

const DocumentsTab = ({ dark }) => {
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const cardBg  = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;
  const inputBg = dark ? COLORS.dark.inputBg : COLORS.gray50;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: GAP.md }}>
      {MOCK_DOCUMENTS.map((doc) => {
        const DocIcon = doc.icon;
        const isUploaded = doc.status === "uploaded";
        return (
          <div
            key={doc.id}
            style={{
              background:   cardBg,
              border:       `1px solid ${border}`,
              borderRadius: RADIUS.xl,
              padding:      SPACING[5],
              boxShadow:    SHADOW.xs,
              display:      "flex",
              flexDirection:"column",
              alignItems:   "center",
              textAlign:    "center",
              gap:          GAP.sm,
            }}
          >
            <div style={{
              width:        56, height: 56, borderRadius: RADIUS.xl,
              background:   isUploaded ? COLORS.successLight : COLORS.warningLight,
              display:      "flex", alignItems: "center", justifyContent: "center",
            }}>
              <DocIcon size={24} color={isUploaded ? COLORS.success : COLORS.warning} />
            </div>
            <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: text, fontFamily: FONT_FAMILY.base }}>{doc.name}</p>
            <Badge label={doc.status} dark={dark} />
            {doc.date !== "--" && (
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext, fontFamily: FONT_FAMILY.base }}>Uploaded {doc.date}</p>
            )}
            <div style={{ display: "flex", gap: GAP.xs, marginTop: 4 }}>
              {isUploaded ? (
                <button style={{
                  display:      "inline-flex", alignItems: "center", gap: 4,
                  padding:      "6px 12px", borderRadius: RADIUS.md,
                  border:       `1px solid ${border}`, background: inputBg,
                  color:        subtext, fontSize: FONT_SIZE.xs,
                  fontWeight:   FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, cursor: "pointer",
                }}>
                  <IconEye size={13} /> View
                </button>
              ) : (
                <button style={{
                  display:      "inline-flex", alignItems: "center", gap: 4,
                  padding:      "6px 12px", borderRadius: RADIUS.md,
                  border:       `1px solid ${COLORS.primary}`, background: COLORS.primaryMuted,
                  color:        COLORS.primary, fontSize: FONT_SIZE.xs,
                  fontWeight:   FONT_WEIGHT.semibold, fontFamily: FONT_FAMILY.base, cursor: "pointer",
                }}>
                  <IconUpload size={13} /> Upload
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AssetsTab = ({ dark }) => {
  const border   = dark ? COLORS.dark.border   : COLORS.borderLight;
  const rowHover = dark ? COLORS.dark.rowHover : COLORS.gray50;
  const subtext  = dark ? COLORS.dark.subtext  : COLORS.textMutedLight;
  const text     = dark ? COLORS.dark.text     : COLORS.textLight;

  const assigned = MOCK_ASSETS.filter((a) => a.status === "Assigned").length;
  const returned = MOCK_ASSETS.filter((a) => a.status === "Returned").length;

  const conditionColor = {
    Excellent: COLORS.success,
    Good:      COLORS.info,
    Fair:      COLORS.warning,
    Poor:      COLORS.danger,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
      {/* Summary */}
      <div style={{ display: "flex", gap: GAP.md, flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Assigned"   value={assigned}            color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Returned"   value={returned}            color={COLORS.danger}  bg={COLORS.dangerMuted}  />
        <MiniStatCard dark={dark} label="Total Items" value={MOCK_ASSETS.length} color={COLORS.primary} bg={COLORS.primaryLight} />
      </div>

      <TableWrapper dark={dark}>
        <thead>
          <tr>
            <Th dark={dark}>Asset Name</Th>
            <Th dark={dark}>Asset ID</Th>
            <Th dark={dark}>Assigned Date</Th>
            <Th dark={dark}>Condition</Th>
            <Th dark={dark}>Status</Th>
          </tr>
        </thead>
        <tbody>
          {MOCK_ASSETS.map((asset) => (
            <tr
              key={asset.id}
              style={{ borderBottom: `1px solid ${border}`, transition: TRANSITION.fast, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Td dark={dark} bold>{asset.name}</Td>
              <Td dark={dark} muted>{asset.assetId}</Td>
              <Td dark={dark} muted>{asset.assignedDate}</Td>
              <td style={{ padding: PADDING.tableCell }}>
                <span style={{
                  fontSize:   FONT_SIZE.xs,
                  fontWeight: FONT_WEIGHT.semibold,
                  color:      conditionColor[asset.condition] || text,
                  fontFamily: FONT_FAMILY.base,
                }}>
                  {asset.condition}
                </span>
              </td>
              <td style={{ padding: PADDING.tableCell }}><Badge label={asset.status} dark={dark} /></td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────

const PerformanceTab = ({ dark, empId }) => {
  const text     = dark ? COLORS.dark.text     : COLORS.textLight;
  const subtext  = dark ? COLORS.dark.subtext  : COLORS.textMutedLight;
  const border   = dark ? COLORS.dark.border   : COLORS.borderLight;
  const rowHover = dark ? COLORS.dark.rowHover : COLORS.gray50;

  const { data } = useEmpPerformance(empId);
  const goals = data?.goals || [];

  if (!goals.length) {
    return (
      <div style={{ textAlign: "center", padding: SPACING[8], color: subtext, fontFamily: FONT_FAMILY.base }}>
        <IconChartBar size={36} color={subtext} style={{ opacity: 0.5 }} />
        <p style={{ margin: `${GAP.sm}px 0 0`, fontSize: FONT_SIZE.sm }}>No performance goals or reviews yet.</p>
      </div>
    );
  }

  return (
    <TableWrapper dark={dark}>
      <thead>
        <tr>
          <Th dark={dark}>Goal / KPI</Th>
          <Th dark={dark}>Target</Th>
          <Th dark={dark}>Progress</Th>
          <Th dark={dark}>Rating</Th>
          <Th dark={dark}>Status</Th>
        </tr>
      </thead>
      <tbody>
        {goals.map((g, i) => (
          <tr key={g.id || i}
            style={{ borderBottom: `1px solid ${border}`, transition: TRANSITION.fast }}
            onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Td dark={dark} bold>{g.title || g.goal || g.name || "—"}</Td>
            <Td dark={dark} muted>{g.target || g.targetDate || "—"}</Td>
            <Td dark={dark}>{g.progress != null ? `${g.progress}%` : "—"}</Td>
            <Td dark={dark}>{g.rating != null ? `${g.rating}/5` : "—"}</Td>
            <td style={{ padding: PADDING.tableCell }}><Badge label={g.status || "Active"} dark={dark} /></td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

const ActivityTab = ({ dark, empId }) => {
  const text     = dark ? COLORS.dark.text     : COLORS.textLight;
  const subtext  = dark ? COLORS.dark.subtext  : COLORS.textMutedLight;
  const border   = dark ? COLORS.dark.border   : COLORS.borderLight;

  const { data: logs = [] } = useEmpActivity(empId);

  if (!logs.length) {
    return (
      <div style={{ textAlign: "center", padding: SPACING[8], color: subtext, fontFamily: FONT_FAMILY.base }}>
        <IconHistory size={36} color={subtext} style={{ opacity: 0.5 }} />
        <p style={{ margin: `${GAP.sm}px 0 0`, fontSize: FONT_SIZE.sm }}>No activity history yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {logs.map((l, i) => (
        <div key={l.id || i} style={{ display: "flex", gap: GAP.md, padding: `${SPACING[3]}px 0`, borderBottom: i < logs.length - 1 ? `1px solid ${border}` : "none" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, marginTop: 6, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: text, fontFamily: FONT_FAMILY.base }}>{l.action}</p>
            {l.details && <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: subtext, fontFamily: FONT_FAMILY.base }}>{l.details}</p>}
          </div>
          <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: subtext, fontFamily: FONT_FAMILY.base, whiteSpace: "nowrap" }}>
            {l.actorName ? `${l.actorName} · ` : ""}{l.createdAt ? new Date(l.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
          </p>
        </div>
      ))}
    </div>
  );
};

const Profile = ({ darkMode: dark = false, employeeId }) => {
  const [activeTab, setActiveTab] = useState("Personal");
  const { id: routeId } = useParams();

  const { data: employees = [], isLoading } = useFetchAllEmployees();

  // Pick the employee from the route param (/employees/:id) or the prop
  const targetId = employeeId ?? (routeId ? Number(routeId) : undefined);

  let employee = MOCK_EMPLOYEE;
  if (employees.length > 0) {
    const found = targetId
      ? employees.find((e) => e.id === targetId || e._id === targetId)
      : employees[0];
    if (found) {
      employee = {
        ...MOCK_EMPLOYEE,
        _id:         found.id          || MOCK_EMPLOYEE._id,
        name:        found.name        || MOCK_EMPLOYEE.name,
        email:       found.email       || MOCK_EMPLOYEE.email,
        phone:       found.phone       || MOCK_EMPLOYEE.phone,
        department:  found.department  || MOCK_EMPLOYEE.department,
        designation: found.designation || MOCK_EMPLOYEE.designation,
        role:        found.role        || MOCK_EMPLOYEE.role,
        joinDate:    found.joinDate
          ? new Date(found.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : MOCK_EMPLOYEE.joinDate,
        status:      found.status      || MOCK_EMPLOYEE.status,
        salary:      found.salary      || MOCK_EMPLOYEE.salary,
        address:     [found.address, found.city, found.state].filter(Boolean).join(", ") || MOCK_EMPLOYEE.address,
        employeeId:  found.employeeId  || MOCK_EMPLOYEE.employeeId,
      };
    }
  }

  // Theme shortcuts
  const pageBg  = dark ? COLORS.dark.pageBg  : COLORS.backgroundLight;
  const cardBg  = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const inputBg = dark ? COLORS.dark.inputBg : COLORS.gray50;

  const av   = getAvatarColor(employee.name);
  const dept = DEPT_COLORS[employee.department] || { bg: COLORS.gray100, text: COLORS.gray600 };

  if (isLoading) return <AppLoader fullScreen />;

  return (
    <div style={{ fontFamily: FONT_FAMILY.base, background: pageBg, minHeight: "100vh", padding: SPACING[6] }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: SPACING[6] }}>
        <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: text, fontFamily: FONT_FAMILY.base }}>
          Employee Profile
        </h1>
        <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: subtext, fontFamily: FONT_FAMILY.base }}>
          View and manage employee information
        </p>
      </div>

      {/* ── Layout: Sidebar + Content ── */}
      <div style={{ display: "flex", gap: GAP.lg, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── Left Sidebar ── */}
        <div style={{
          width:        280,
          flexShrink:   0,
          background:   cardBg,
          borderRadius: RADIUS["2xl"],
          border:       `1px solid ${border}`,
          boxShadow:    SHADOW.card,
          overflow:     "hidden",
        }}>
          {/* Gradient banner */}
          <div style={{
            height:     96,
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%)`,
          }} />

          {/* Avatar */}
          <div style={{ padding: `0 ${SPACING[5]}px ${SPACING[5]}px`, textAlign: "center", marginTop: -44 }}>
            <div style={{
              width:        88, height: 88, borderRadius: RADIUS.full,
              background:   av.bg, color: av.color,
              display:      "flex", alignItems: "center", justifyContent: "center",
              fontSize:     FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold,
              border:       `3px solid ${cardBg}`,
              margin:       "0 auto",
              boxShadow:    SHADOW.sm,
            }}>
              {getInitials(employee.name)}
            </div>

            {/* Name & role */}
            <p style={{ margin: `${GAP.sm}px 0 4px`, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: text, fontFamily: FONT_FAMILY.base }}>
              {employee.name}
            </p>
            <p style={{ margin: "0 0 10px", fontSize: FONT_SIZE.xs, color: subtext, fontFamily: FONT_FAMILY.base }}>
              {employee.designation}
            </p>

            {/* Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: GAP.xs, flexWrap: "wrap", marginBottom: SPACING[4] }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: dept.bg, color: dept.text }}>
                {employee.department}
              </span>
              <Badge label={employee.status} dark={dark} />
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${border}`, margin: `0 0 ${SPACING[4]}px` }} />

            {/* Info rows */}
            {[
              { icon: IconUserCheck,    label: "Employee ID",  value: employee.employeeId  },
              { icon: IconCalendar,     label: "Joined",       value: employee.joinDate     },
              { icon: IconMail,         label: "Email",        value: employee.email        },
              { icon: IconPhone,        label: "Phone",        value: employee.phone        },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: `${GAP.xs}px 0`, textAlign: "left" }}>
                <Icon size={14} color={subtext} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.65rem", color: subtext, fontWeight: FONT_WEIGHT.medium, fontFamily: FONT_FAMILY.base, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: text, fontFamily: FONT_FAMILY.base, wordBreak: "break-all" }}>{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Content ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: GAP.md }}>

          {/* Tabs bar */}
          <div style={{
            background:   cardBg,
            borderRadius: RADIUS["2xl"],
            border:       `1px solid ${border}`,
            boxShadow:    SHADOW.card,
            padding:      `${SPACING[2]}px ${SPACING[3]}px`,
            display:      "flex",
            gap:          GAP.xs,
            flexWrap:     "wrap",
          }}>
            {TABS.map(({ key, icon: TabIcon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          GAP.xs,
                    padding:      `${SPACING[2]}px ${SPACING[3]}px`,
                    borderRadius: RADIUS.lg,
                    border:       "none",
                    background:   isActive ? COLORS.primary : "transparent",
                    color:        isActive ? COLORS.white   : subtext,
                    fontSize:     FONT_SIZE.sm,
                    fontWeight:   isActive ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
                    fontFamily:   FONT_FAMILY.base,
                    cursor:       "pointer",
                    transition:   TRANSITION.fast,
                    whiteSpace:   "nowrap",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = dark ? COLORS.dark.rowHover : COLORS.gray100; e.currentTarget.style.color = text; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = subtext; } }}
                >
                  <TabIcon size={15} />
                  {key}
                </button>
              );
            })}
          </div>

          {/* Tab content card */}
          <div style={{
            background:   cardBg,
            borderRadius: RADIUS["2xl"],
            border:       `1px solid ${border}`,
            boxShadow:    SHADOW.card,
            padding:      SPACING[5],
          }}>
            {/* Tab heading */}
            <p style={{
              margin:     `0 0 ${SPACING[5]}px`,
              fontSize:   FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.bold,
              color:      text,
              fontFamily: FONT_FAMILY.base,
              display:    "flex",
              alignItems: "center",
              gap:        GAP.sm,
            }}>
              {(() => {
                const { icon: Icon } = TABS.find((t) => t.key === activeTab) || {};
                return Icon ? <Icon size={20} color={COLORS.primary} /> : null;
              })()}
              {activeTab} Information
            </p>

            {activeTab === "Personal"    && <PersonalTab    emp={employee} dark={dark} />}
            {activeTab === "Job"         && <JobTab         emp={employee} dark={dark} />}
            {activeTab === "Leave"       && <LeaveTab       empId={targetId} dark={dark} />}
            {activeTab === "Attendance"  && <AttendanceTab  empId={targetId} dark={dark} />}
            {activeTab === "Payroll"     && <PayrollTab     emp={employee} empId={targetId} dark={dark} />}
            {activeTab === "Performance" && <PerformanceTab empId={targetId} dark={dark} />}
            {activeTab === "Documents"   && <DocumentsTab   dark={dark} />}
            {activeTab === "Assets"      && <AssetsTab      dark={dark} />}
            {activeTab === "Activity"    && <ActivityTab    empId={targetId} dark={dark} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
