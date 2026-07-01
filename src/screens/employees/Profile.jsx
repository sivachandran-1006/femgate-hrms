import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Stack, Group, Paper, SimpleGrid, Text, Button,
  Table, Badge as MantineBadge,
} from "@mantine/core";
import {
  IconUser, IconBriefcase, IconCalendarOff, IconClock,
  IconCurrencyRupee, IconFile, IconDeviceLaptop,
  IconPhone, IconMail, IconMapPin, IconAlertCircle,
  IconCalendar, IconBuilding, IconUserCheck, IconDownload,
  IconUpload, IconEye,
} from "@tabler/icons-react";

import { IconChartBar, IconHistory }                   from "@tabler/icons-react";
import { useFetchAllEmployees, useEmpAttendance, useEmpLeave, useEmpPayroll, useEmpPerformance, useEmpActivity, useEmpDocuments, useEmpAssets } from "../../queries/useEmployees";
import { AppLoader }                                   from "../../components/ui/AppLoader";
import { COLORS }                                      from "../../theme/colors";
import { getAvatarColor, getInitials, formatCurrency } from "../../utils/helpers";
import { useToast }                                    from "../../components/ui/Toast";
import { useMutation, useQueryClient }                 from "@tanstack/react-query";
import api                                             from "../../api/axios";

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

const Badge = ({ label }) => {
  const map = {
    Present:  { color: "green"  },
    Approved: { color: "green"  },
    Assigned: { color: "green"  },
    uploaded: { color: "green"  },
    Active:   { color: "green"  },
    Absent:   { color: "red"    },
    Rejected: { color: "red"    },
    Returned: { color: "red"    },
    Leave:    { color: "yellow" },
    Pending:  { color: "blue"   },
    pending:  { color: "yellow" },
    Inactive: { color: "gray"   },
  };
  const s = map[label] || { color: "gray" };
  return (
    <MantineBadge color={s.color} variant="light" size="sm" radius="xl">
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </MantineBadge>
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
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const iconBg  = dark ? COLORS.dark.inputBg : COLORS.gray100;
  return (
    <Group
      align="flex-start"
      gap="sm"
      py="xs"
      style={{ borderBottom: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}
    >
      {Icon && (
        <Box
          w={32} h={32}
          style={{
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          <Icon size={15} color={subtext} />
        </Box>
      )}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" c={subtext} fw={500} mb={2}>{label}</Text>
        <Text size="sm" c={dark ? COLORS.dark.text : COLORS.textLight} fw={500} style={{ wordBreak: "break-word" }}>
          {value || "—"}
        </Text>
      </Box>
    </Group>
  );
};

const MiniStatCard = ({ label, value, color, bg, dark }) => (
  <Paper
    style={{ flex: 1, minWidth: 120 }}
    bg={dark ? COLORS.dark.cardBg : COLORS.surfaceLight}
    withBorder
    radius="xl"
    p="md"
    shadow="xs"
  >
    <Stack align="center" gap={0}>
      <Box
        w={44} h={44}
        style={{
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Text size="xl" fw={700} c={color}>{value}</Text>
      </Box>
      <Text size="xs" c={dark ? COLORS.dark.subtext : COLORS.textMutedLight} fw={500}>{label}</Text>
    </Stack>
  </Paper>
);

// ─── Tab Panels ───────────────────────────────────────────────────────────────

const PersonalTab = ({ emp, dark }) => (
  <SimpleGrid cols={2} spacing="lg">
    <Paper
      bg={dark ? COLORS.dark.cardBg : COLORS.surfaceLight}
      withBorder
      radius="xl"
      p="xl"
      shadow="xs"
    >
      <Text size="sm" fw={600} c={dark ? COLORS.dark.text : COLORS.textLight} mb="xs">Personal Details</Text>
      <InfoRow dark={dark} icon={IconUser}         label="Full Name"       value={emp.name}        />
      <InfoRow dark={dark} icon={IconMail}         label="Email Address"   value={emp.email}       />
      <InfoRow dark={dark} icon={IconPhone}        label="Phone"           value={emp.phone}       />
      <InfoRow dark={dark} icon={IconCalendar}     label="Date of Birth"   value={emp.dateOfBirth} />
      <InfoRow dark={dark} icon={IconMapPin}       label="Address"         value={emp.address}     />
    </Paper>

    <Paper
      bg={dark ? COLORS.dark.cardBg : COLORS.surfaceLight}
      withBorder
      radius="xl"
      p="xl"
      shadow="xs"
    >
      <Text size="sm" fw={600} c={dark ? COLORS.dark.text : COLORS.textLight} mb="xs">Emergency & Identification</Text>
      <InfoRow dark={dark} icon={IconAlertCircle}  label="Emergency Contact"        value={emp.emergencyContact?.name}  />
      <InfoRow dark={dark} icon={IconPhone}        label="Emergency Phone"          value={emp.emergencyContact?.phone} />
      <InfoRow dark={dark} icon={IconUserCheck}    label="Employee ID"              value={emp.employeeId}              />
      <InfoRow dark={dark} icon={IconBuilding}     label="Department"               value={emp.department}              />
      <InfoRow dark={dark} icon={IconBriefcase}    label="Designation"              value={emp.designation}             />
    </Paper>
  </SimpleGrid>
);

const JobTab = ({ emp, dark }) => (
  <SimpleGrid cols={2} spacing="lg">
    <Paper
      bg={dark ? COLORS.dark.cardBg : COLORS.surfaceLight}
      withBorder
      radius="xl"
      p="xl"
      shadow="xs"
    >
      <Text size="sm" fw={600} c={dark ? COLORS.dark.text : COLORS.textLight} mb="xs">Role & Position</Text>
      <InfoRow dark={dark} icon={IconBuilding}    label="Department"          value={emp.department}      />
      <InfoRow dark={dark} icon={IconBriefcase}   label="Designation"         value={emp.designation}     />
      <InfoRow dark={dark} icon={IconUserCheck}   label="Role"                value={emp.role}            />
      <InfoRow dark={dark} icon={IconUser}        label="Reporting Manager"   value={emp.reportingManager}/>
    </Paper>
    <Paper
      bg={dark ? COLORS.dark.cardBg : COLORS.surfaceLight}
      withBorder
      radius="xl"
      p="xl"
      shadow="xs"
    >
      <Text size="sm" fw={600} c={dark ? COLORS.dark.text : COLORS.textLight} mb="xs">Employment Details</Text>
      <InfoRow dark={dark} icon={IconCalendar}    label="Join Date"           value={emp.joinDate}         />
      <InfoRow dark={dark} icon={IconFile}        label="Employment Type"     value={emp.employmentType}   />
      <InfoRow dark={dark} icon={IconMapPin}      label="Work Location"       value={emp.workLocation}     />
      <InfoRow dark={dark} icon={IconCurrencyRupee} label="CTC (Monthly)"    value={emp.salary ? formatCurrency(emp.salary) : "—"} />
    </Paper>
  </SimpleGrid>
);

const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const LeaveTab = ({ dark, empId }) => {
  const { data } = useEmpLeave(empId);
  const apiLeaves = data?.leaves;
  const rows = apiLeaves && apiLeaves.length
    ? apiLeaves.map((l) => ({ id: l.id, type: l.type, from: fmtD(l.fromDate), to: fmtD(l.toDate), days: l.days, status: l.status }))
    : MOCK_LEAVE_HISTORY;
  const sum = data?.summary;
  const approved  = sum ? sum.approved : rows.filter((l) => l.status === "Approved").length;
  const pending   = sum ? sum.pending  : rows.filter((l) => l.status === "Pending").length;
  const rejected  = sum ? sum.rejected : rows.filter((l) => l.status === "Rejected").length;
  const totalDays = sum ? sum.daysUsed : rows.filter((l) => l.status === "Approved").reduce((s, l) => s + l.days, 0);

  return (
    <Stack gap="lg">
      <Group gap="md" style={{ flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Approved"  value={approved}  color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Pending"   value={pending}   color={COLORS.primary} bg={COLORS.primaryLight} />
        <MiniStatCard dark={dark} label="Rejected"  value={rejected}  color={COLORS.danger}  bg={COLORS.dangerMuted}  />
        <MiniStatCard dark={dark} label="Days Used" value={totalDays} color={COLORS.warning} bg={COLORS.warningLight} />
      </Group>

      <Box style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
        <Table striped={false} highlightOnHover withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Leave Type</Table.Th>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>Days</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td><Text size="sm" fw={600}>{row.type}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{row.from}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{row.to}</Text></Table.Td>
                <Table.Td><Text size="sm">{row.days}d</Text></Table.Td>
                <Table.Td><Badge label={row.status} dark={dark} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

const AttendanceTab = ({ dark, empId }) => {
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
    <Stack gap="lg">
      <Group gap="md" style={{ flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Present"      value={present} color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Absent"       value={absent}  color={COLORS.danger}  bg={COLORS.dangerMuted}  />
        <MiniStatCard dark={dark} label={s ? "Late" : "Leave"} value={leave} color={COLORS.warning} bg={COLORS.warningLight} />
        <MiniStatCard dark={dark} label="Total Days"   value={total}   color={COLORS.info}    bg={COLORS.infoLight}    />
      </Group>

      <Box style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
        <Table striped={false} highlightOnHover withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Check In</Table.Th>
              <Table.Th>Check Out</Table.Th>
              <Table.Th>Hours</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, i) => (
              <Table.Tr key={i}>
                <Table.Td><Text size="sm" fw={600}>{row.date}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{row.checkIn}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{row.checkOut}</Text></Table.Td>
                <Table.Td><Text size="sm">{row.hours}</Text></Table.Td>
                <Table.Td><Badge label={row.status} dark={dark} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

const PayrollTab = ({ emp, dark, empId }) => {
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
    <Stack gap="lg">
      <Group gap="md" style={{ flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Months Paid"    value={PAYROLL.length} color={COLORS.primary} bg={COLORS.primaryLight} />
        <MiniStatCard dark={dark} label="Avg Net / Mo"   value={`₹${Math.round(avgNet/1000)}K`}  color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Total YTD"      value={`₹${Math.round(totalNet/1000)}K`} color={COLORS.warning} bg={COLORS.warningLight} />
      </Group>

      <Box style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
        <Table striped={false} highlightOnHover withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Month</Table.Th>
              <Table.Th>Basic</Table.Th>
              <Table.Th>Allowances</Table.Th>
              <Table.Th>Deductions</Table.Th>
              <Table.Th>Net Pay</Table.Th>
              <Table.Th>Payslip</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {PAYROLL.map((row, i) => (
              <Table.Tr key={i}>
                <Table.Td><Text size="sm" fw={600}>{row.month}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">₹{row.basic.toLocaleString("en-IN")}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">+₹{row.allowances.toLocaleString("en-IN")}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">-₹{row.deductions.toLocaleString("en-IN")}</Text></Table.Td>
                <Table.Td>
                  <Text size="sm" fw={700} c={COLORS.success}>
                    ₹{row.net.toLocaleString("en-IN")}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconDownload size={13} />}
                    onClick={() => openPayslip(emp, row)}
                  >
                    Download
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

const DocumentsTab = ({ dark, empId }) => {
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const cardBg  = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;

  const { data: docs = MOCK_DOCUMENTS } = useEmpDocuments(empId);

  const { show } = useToast();
  const uploadRef = useRef(null);
  const qc = useQueryClient();
  const uploadMut = useMutation({
    mutationFn: ({ empId, file }) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name);
      return api.post(`/employees/${empId}/documents`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["emp-documents"] }); show("Document uploaded", "success"); },
    onError: () => show("Upload failed", "error"),
  });

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {docs.map((doc) => {
        const DocIcon = doc.icon;
        const isUploaded = doc.status === "uploaded";
        return (
          <Paper
            key={doc.id}
            bg={cardBg}
            withBorder
            radius="xl"
            p="xl"
            shadow="xs"
          >
            <Stack align="center" gap="sm">
              <Box
                w={56} h={56}
                style={{
                  borderRadius: 12,
                  background: isUploaded ? COLORS.successLight : COLORS.warningLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DocIcon size={24} color={isUploaded ? COLORS.success : COLORS.warning} />
              </Box>
              <Text size="sm" fw={600} c={text} ta="center">{doc.name}</Text>
              <Badge label={doc.status} dark={dark} />
              {doc.date !== "--" && (
                <Text size="xs" c={subtext}>Uploaded {doc.date}</Text>
              )}
              <Group gap="xs" mt={4}>
                {isUploaded ? (
                  <Button size="xs" variant="default" leftSection={<IconEye size={13} />}
                    onClick={() => { if (doc.url) { window.open(doc.url, "_blank"); } else { show("Document URL not available", "info"); } }}>
                    View
                  </Button>
                ) : (
                  <>
                    <Button size="xs" variant="light" leftSection={<IconUpload size={13} />}
                      onClick={() => uploadRef.current?.click()}
                      loading={uploadMut.isPending}>
                      Upload
                    </Button>
                    <input
                      ref={uploadRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMut.mutate({ empId, file: f }); }}
                    />
                  </>
                )}
              </Group>
            </Stack>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
};

const AssetsTab = ({ dark, empId }) => {
  const text = dark ? COLORS.dark.text : COLORS.textLight;

  const { data: assets = MOCK_ASSETS } = useEmpAssets(empId);
  const assigned = assets.filter((a) => a.status === "Assigned").length;
  const returned = assets.filter((a) => a.status === "Returned").length;

  const conditionColor = {
    Excellent: COLORS.success,
    Good:      COLORS.info,
    Fair:      COLORS.warning,
    Poor:      COLORS.danger,
  };

  return (
    <Stack gap="lg">
      <Group gap="md" style={{ flexWrap: "wrap" }}>
        <MiniStatCard dark={dark} label="Assigned"    value={assigned}      color={COLORS.success} bg={COLORS.successLight} />
        <MiniStatCard dark={dark} label="Returned"    value={returned}      color={COLORS.danger}  bg={COLORS.dangerMuted}  />
        <MiniStatCard dark={dark} label="Total Items" value={assets.length} color={COLORS.primary} bg={COLORS.primaryLight} />
      </Group>

      <Box style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
        <Table striped={false} highlightOnHover withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Asset Name</Table.Th>
              <Table.Th>Asset ID</Table.Th>
              <Table.Th>Assigned Date</Table.Th>
              <Table.Th>Condition</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assets.map((asset) => (
              <Table.Tr key={asset.id}>
                <Table.Td><Text size="sm" fw={600}>{asset.name}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{asset.assetId}</Text></Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{asset.assignedDate}</Text></Table.Td>
                <Table.Td>
                  <Text size="xs" fw={600} c={conditionColor[asset.condition] || text}>
                    {asset.condition}
                  </Text>
                </Table.Td>
                <Table.Td><Badge label={asset.status} dark={dark} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────

const PerformanceTab = ({ dark, empId }) => {
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;

  const { data } = useEmpPerformance(empId);
  const goals = data?.goals || [];

  if (!goals.length) {
    return (
      <Stack align="center" py="xl" gap="xs">
        <IconChartBar size={36} color={subtext} style={{ opacity: 0.5 }} />
        <Text size="sm" c={subtext}>No performance goals or reviews yet.</Text>
      </Stack>
    );
  }

  return (
    <Box style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
      <Table striped={false} highlightOnHover withColumnBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Goal / KPI</Table.Th>
            <Table.Th>Target</Table.Th>
            <Table.Th>Progress</Table.Th>
            <Table.Th>Rating</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {goals.map((g, i) => (
            <Table.Tr key={g.id || i}>
              <Table.Td><Text size="sm" fw={600}>{g.title || g.goal || g.name || "—"}</Text></Table.Td>
              <Table.Td><Text size="sm" c="dimmed">{g.target || g.targetDate || "—"}</Text></Table.Td>
              <Table.Td><Text size="sm">{g.progress != null ? `${g.progress}%` : "—"}</Text></Table.Td>
              <Table.Td><Text size="sm">{g.rating != null ? `${g.rating}/5` : "—"}</Text></Table.Td>
              <Table.Td><Badge label={g.status || "Active"} dark={dark} /></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
};

const ActivityTab = ({ dark, empId }) => {
  const text    = dark ? COLORS.dark.text    : COLORS.textLight;
  const subtext = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const border  = dark ? COLORS.dark.border  : COLORS.borderLight;

  const { data: logs = [] } = useEmpActivity(empId);

  if (!logs.length) {
    return (
      <Stack align="center" py="xl" gap="xs">
        <IconHistory size={36} color={subtext} style={{ opacity: 0.5 }} />
        <Text size="sm" c={subtext}>No activity history yet.</Text>
      </Stack>
    );
  }

  return (
    <Stack gap={0}>
      {logs.map((l, i) => (
        <Group
          key={l.id || i}
          gap="md"
          py="xs"
          style={{ borderBottom: i < logs.length - 1 ? `1px solid ${border}` : "none" }}
          align="flex-start"
        >
          <Box
            w={8} h={8}
            style={{ borderRadius: "50%", background: COLORS.primary, marginTop: 6, flexShrink: 0 }}
          />
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={600} c={text}>{l.action}</Text>
            {l.details && <Text size="xs" c={subtext} mt={2}>{l.details}</Text>}
          </Box>
          <Text size="xs" c={subtext} style={{ whiteSpace: "nowrap" }}>
            {l.actorName ? `${l.actorName} · ` : ""}{l.createdAt ? new Date(l.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
          </Text>
        </Group>
      ))}
    </Stack>
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

  const av   = getAvatarColor(employee.name);
  const dept = DEPT_COLORS[employee.department] || { bg: COLORS.gray100, text: COLORS.gray600 };

  if (isLoading) return <AppLoader fullScreen />;

  return (
    <Box bg={pageBg} style={{ minHeight: "100vh" }} p="xl">

      {/* ── Page Header ── */}
      <Box mb="xl">
        <Text size="2xl" fw={700} c={text}>Employee Profile</Text>
        <Text size="sm" c={subtext} mt={4}>View and manage employee information</Text>
      </Box>

      {/* ── Layout: Sidebar + Content ── */}
      <Group align="flex-start" gap="lg" style={{ flexWrap: "wrap" }}>

        {/* ── Left Sidebar ── */}
        <Paper
          bg={cardBg}
          withBorder
          radius={16}
          shadow="md"
          style={{ width: 280, flexShrink: 0, overflow: "hidden" }}
        >
          {/* Gradient banner — custom gradient, no Mantine prop equivalent */}
          <Box
            h={96}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%)` }}
          />

          {/* Avatar */}
          <Box p="xl" pt={0} ta="center" mt={-44}>
            <Box
              w={88} h={88}
              style={{
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `3px solid ${cardBg}`,
                margin: "0 auto",
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              }}
            >
              <Text size="xl" fw={700} c={av.color}>{getInitials(employee.name)}</Text>
            </Box>

            {/* Name & role */}
            <Text size="lg" fw={700} c={text} mt="sm" mb={4}>{employee.name}</Text>
            <Text size="xs" c={subtext} mb="xs">{employee.designation}</Text>

            {/* Badges */}
            <Group justify="center" gap="xs" style={{ flexWrap: "wrap" }} mb="md">
              <MantineBadge
                style={{ background: dept.bg, color: dept.text }}
                variant="filled"
                size="sm"
                radius="xl"
              >
                {employee.department}
              </MantineBadge>
              <Badge label={employee.status} dark={dark} />
            </Group>

            {/* Divider */}
            <Box style={{ borderTop: `1px solid ${border}` }} mb="md" />

            {/* Info rows */}
            {[
              { icon: IconUserCheck,    label: "Employee ID",  value: employee.employeeId  },
              { icon: IconCalendar,     label: "Joined",       value: employee.joinDate     },
              { icon: IconMail,         label: "Email",        value: employee.email        },
              { icon: IconPhone,        label: "Phone",        value: employee.phone        },
            ].map(({ icon: Icon, label, value }) => (
              <Group key={label} gap="sm" py={4} align="flex-start">
                <Icon size={14} color={subtext} style={{ flexShrink: 0 }} />
                <Box style={{ minWidth: 0 }}>
                  <Text
                    size="xs"
                    c={subtext}
                    fw={500}
                    style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}
                  >
                    {label}
                  </Text>
                  <Text size="xs" c={text} style={{ wordBreak: "break-all" }}>{value || "—"}</Text>
                </Box>
              </Group>
            ))}
          </Box>
        </Paper>

        {/* ── Right Content ── */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Stack gap="md">

            {/* Tabs bar */}
            <Paper
              bg={cardBg}
              withBorder
              radius={16}
              shadow="md"
              px="sm"
              py="xs"
            >
              <Group gap="xs" style={{ flexWrap: "wrap" }}>
                {TABS.map(({ key, icon: TabIcon }) => {
                  const isActive = activeTab === key;
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "filled" : "subtle"}
                      size="sm"
                      radius="md"
                      leftSection={<TabIcon size={15} />}
                      onClick={() => setActiveTab(key)}
                      styles={{ root: { whiteSpace: "nowrap" } }}
                    >
                      {key}
                    </Button>
                  );
                })}
              </Group>
            </Paper>

            {/* Tab content card */}
            <Paper
              bg={cardBg}
              withBorder
              radius={16}
              shadow="md"
              p="xl"
            >
              {/* Tab heading */}
              <Group gap="sm" mb="xl">
                {(() => {
                  const { icon: Icon } = TABS.find((t) => t.key === activeTab) || {};
                  return Icon ? <Icon size={20} color={COLORS.primary} /> : null;
                })()}
                <Text size="lg" fw={700} c={text}>{activeTab} Information</Text>
              </Group>

              {activeTab === "Personal"    && <PersonalTab    emp={employee} dark={dark} />}
              {activeTab === "Job"         && <JobTab         emp={employee} dark={dark} />}
              {activeTab === "Leave"       && <LeaveTab       empId={targetId} dark={dark} />}
              {activeTab === "Attendance"  && <AttendanceTab  empId={targetId} dark={dark} />}
              {activeTab === "Payroll"     && <PayrollTab     emp={employee} empId={targetId} dark={dark} />}
              {activeTab === "Performance" && <PerformanceTab empId={targetId} dark={dark} />}
              {activeTab === "Documents"   && <DocumentsTab   empId={targetId} dark={dark} />}
              {activeTab === "Assets"      && <AssetsTab      empId={targetId} dark={dark} />}
              {activeTab === "Activity"    && <ActivityTab    empId={targetId} dark={dark} />}
            </Paper>

          </Stack>
        </Box>
      </Group>
    </Box>
  );
};

export default Profile;
