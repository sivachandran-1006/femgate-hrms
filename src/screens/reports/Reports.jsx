import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, Select,
  SimpleGrid, Tabs, Table, ScrollArea,
} from "@mantine/core";
import {
  IconDownload, IconFilter, IconTrendingUp, IconUsers,
  IconClock, IconCalendar, IconPackage, IconFileText,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { useToast }      from "../../components/ui/Toast";

const DATE_RANGES = ["This Month","Last Month","Last 3 Months","This Year","Custom"];

const STATUS_COLOR = {
  Active: "green", Pending: "yellow", Suspended: "red",
  Approved: "green", Rejected: "red",
  Paid: "green", Hold: "red",
  "In Use": "blue", Available: "green", Maintenance: "yellow",
};

const CHART_COLORS = {
  employee: "#2563eb", attendance: "#16a34a", leave: "#f59e0b", payroll: "#7c3aed", assets: "#0ea5e9",
};


const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MOCK_LEAVES = [
  { id: 1, leaveId: "LV-1001", employee: "Ananya Sharma", leaveType: "Sick Leave",     fromDate: "2026-06-02", toDate: "2026-06-03", days: 2, status: "Approved" },
  { id: 2, leaveId: "LV-1002", employee: "Rohit Verma",   leaveType: "Casual Leave",   fromDate: "2026-06-05", toDate: "2026-06-05", days: 1, status: "Approved" },
  { id: 3, leaveId: "LV-1003", employee: "Priya Nair",    leaveType: "Earned Leave",   fromDate: "2026-06-10", toDate: "2026-06-14", days: 5, status: "Pending" },
  { id: 4, leaveId: "LV-1004", employee: "Karthik Iyer",  leaveType: "Sick Leave",     fromDate: "2026-06-15", toDate: "2026-06-15", days: 1, status: "Rejected" },
  { id: 5, leaveId: "LV-1005", employee: "Sneha Reddy",   leaveType: "Casual Leave",   fromDate: "2026-06-18", toDate: "2026-06-19", days: 2, status: "Approved" },
  { id: 6, leaveId: "LV-1006", employee: "Vikram Singh",  leaveType: "Earned Leave",   fromDate: "2026-06-20", toDate: "2026-06-24", days: 5, status: "Pending" },
  { id: 7, leaveId: "LV-1007", employee: "Divya Menon",   leaveType: "Maternity Leave",fromDate: "2026-06-01", toDate: "2026-06-30", days: 30, status: "Approved" },
  { id: 8, leaveId: "LV-1008", employee: "Arjun Das",     leaveType: "Casual Leave",   fromDate: "2026-06-22", toDate: "2026-06-22", days: 1, status: "Approved" },
  { id: 9, leaveId: "LV-1009", employee: "Meera Pillai",  leaveType: "Sick Leave",     fromDate: "2026-06-25", toDate: "2026-06-26", days: 2, status: "Pending" },
  { id: 10, leaveId: "LV-1010", employee: "Suresh Kumar", leaveType: "Earned Leave",   fromDate: "2026-06-27", toDate: "2026-06-28", days: 2, status: "Rejected" },
];

const MOCK_PAYROLL = [
  { payId: "PAY-2001", employeeName: "Ananya Sharma", departmentName: "Engineering", month: "June", salary: 85000,  bonus: 5000, deduction: 8000, netSalary: 82000, status: "Paid" },
  { payId: "PAY-2002", employeeName: "Rohit Verma",   departmentName: "Sales",       month: "June", salary: 65000,  bonus: 3000, deduction: 6000, netSalary: 62000, status: "Paid" },
  { payId: "PAY-2003", employeeName: "Priya Nair",    departmentName: "HR",          month: "June", salary: 60000,  bonus: 0,    deduction: 5500, netSalary: 54500, status: "Hold" },
  { payId: "PAY-2004", employeeName: "Karthik Iyer",  departmentName: "Engineering", month: "June", salary: 95000,  bonus: 7000, deduction: 9000, netSalary: 93000, status: "Paid" },
  { payId: "PAY-2005", employeeName: "Sneha Reddy",   departmentName: "Marketing",   month: "June", salary: 70000,  bonus: 2000, deduction: 6500, netSalary: 65500, status: "Paid" },
  { payId: "PAY-2006", employeeName: "Vikram Singh",  departmentName: "Finance",     month: "June", salary: 80000,  bonus: 4000, deduction: 7500, netSalary: 76500, status: "Hold" },
  { payId: "PAY-2007", employeeName: "Divya Menon",   departmentName: "Sales",       month: "June", salary: 62000,  bonus: 1000, deduction: 5800, netSalary: 57200, status: "Paid" },
  { payId: "PAY-2008", employeeName: "Arjun Das",     departmentName: "Engineering", month: "June", salary: 88000,  bonus: 6000, deduction: 8200, netSalary: 85800, status: "Paid" },
  { payId: "PAY-2009", employeeName: "Meera Pillai",  departmentName: "HR",          month: "June", salary: 58000,  bonus: 0,    deduction: 5200, netSalary: 52800, status: "Paid" },
  { payId: "PAY-2010", employeeName: "Suresh Kumar",  departmentName: "Finance",     month: "June", salary: 90000,  bonus: 5000, deduction: 8700, netSalary: 86300, status: "Hold" },
];

const MOCK_ASSETS = [
  { assetId: "AST-3001", name: "Dell Latitude 5420",  category: "Laptop",    assignedTo: { name: "Ananya Sharma" }, status: "InUse",      purchaseValue: 65000 },
  { assetId: "AST-3002", name: "MacBook Pro 14\"",     category: "Laptop",    assignedTo: { name: "Karthik Iyer" },  status: "InUse",      purchaseValue: 150000 },
  { assetId: "AST-3003", name: "HP LaserJet Pro",      category: "Printer",  assignedTo: null,                       status: "Available",   purchaseValue: 22000 },
  { assetId: "AST-3004", name: "iPhone 13",            category: "Mobile",   assignedTo: { name: "Rohit Verma" },   status: "InUse",      purchaseValue: 55000 },
  { assetId: "AST-3005", name: "Dell Monitor 24\"",     category: "Monitor",  assignedTo: { name: "Sneha Reddy" },   status: "InUse",      purchaseValue: 12000 },
  { assetId: "AST-3006", name: "Lenovo ThinkPad E14",  category: "Laptop",    assignedTo: null,                       status: "Maintenance", purchaseValue: 58000 },
  { assetId: "AST-3007", name: "Logitech Webcam",      category: "Accessory",assignedTo: { name: "Priya Nair" },    status: "InUse",      purchaseValue: 4500 },
  { assetId: "AST-3008", name: "Office Chair",         category: "Furniture",assignedTo: { name: "Vikram Singh" },  status: "InUse",      purchaseValue: 8000 },
  { assetId: "AST-3009", name: "Router TP-Link AX50",  category: "Network",  assignedTo: null,                       status: "Available",   purchaseValue: 6500 },
  { assetId: "AST-3010", name: "Samsung Galaxy Tab",   category: "Mobile",   assignedTo: { name: "Meera Pillai" },  status: "Disposed",    purchaseValue: 30000 },
];

export default function Reports() {
  const { show } = useToast();
  const [tab, setTab]     = useState("employee");
  const [dept, setDept]   = useState("All Departments");
  const [range, setRange] = useState("This Month");

  // ── Live data ──
  const { data: employees = [] }  = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: attendance = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: leavesRawQ }  = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: payrollRawQ } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: assetsRawQ }  = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const leavesRaw = leavesRawQ?.length ? leavesRawQ : MOCK_LEAVES;
  const payrollRaw = payrollRawQ?.length ? payrollRawQ : MOCK_PAYROLL;
  const assetsRaw = assetsRawQ?.length ? assetsRawQ : MOCK_ASSETS;

  const leaves = Array.isArray(leavesRaw) ? leavesRaw : [];
  const payrollRows = Array.isArray(payrollRaw) ? payrollRaw : [];

  const DEPT_LIST = ["All Departments", ...new Set(employees.map((e) => e.department).filter(Boolean))];
  const matchDept = (d) => dept === "All Departments" || d === dept;

  const EMP_ROWS = employees.filter((e) => matchDept(e.department)).map((e) => ({
    id: e.employeeId, name: e.name, dept: e.department || "—", status: e.status,
    joined: e.joinDate ? e.joinDate.split("T")[0] : "—", salary: inr(e.salary),
  }));

  // Attendance aggregated per employee
  const attAgg = {};
  for (const r of attendance) {
    const name = r.employee?.name; if (!name) continue;
    const a = (attAgg[name] = attAgg[name] || { name, dept: r.employee?.department || "—", present: 0, absent: 0, late: 0, leave: 0 });
    if (r.status === "Present") a.present++;
    else if (r.status === "Late") a.late++;
    else if (r.status === "Absent") a.absent++;
    else if (r.status === "OnLeave") a.leave++;
  }
  const ATT_ROWS = Object.values(attAgg).filter((a) => matchDept(a.dept)).map((a, i) => {
    const total = a.present + a.absent + a.late + a.leave;
    return { id: `ATT-${i + 1}`, ...a, pct: total ? Math.round(((a.present + a.late) / total) * 1000) / 10 : 0 };
  });

  const LEAVE_ROWS = leaves.map((l) => ({
    id: l.leaveId || `LV-${l.id}`, emp: l.employee || "—", type: (l.leaveType || "").replace(" Leave", ""),
    from: l.fromDate, to: l.toDate, days: l.days, status: l.status,
  }));

  const PAY_ROWS = payrollRows.filter((p) => matchDept(p.departmentName)).map((p) => ({
    id: p.payId, emp: p.employeeName || "—", dept: p.departmentName || "—",
    gross: inr((p.salary || 0) + (p.bonus || 0)), deductions: inr(p.deduction),
    net: inr(p.netSalary), status: p.status,
  }));

  const ASSET_STATUS = { InUse: "In Use", Available: "Available", Maintenance: "Maintenance", Disposed: "Disposed" };
  const ASSET_ROWS = assetsRaw.map((a) => ({
    id: a.assetId, name: a.name, category: a.category,
    assignedTo: a.assignedTo?.name || "Unassigned", dept: "—",
    status: ASSET_STATUS[a.status] || a.status, value: inr(a.purchaseValue),
  }));

  // Charts per tab
  const countBy = (rows, key) => {
    const m = {};
    rows.forEach((r) => { const k = r[key] || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([label, value]) => ({ label: String(label).slice(0, 8), value }));
  };
  const leaveByMonth = {};
  leaves.forEach((l) => {
    const mo = l.fromDate ? new Date(l.fromDate).toLocaleDateString("en-IN", { month: "short" }) : "—";
    leaveByMonth[mo] = (leaveByMonth[mo] || 0) + 1;
  });
  const payByMonth = {};
  payrollRows.forEach((p) => { const k = p.month ? p.month.slice(0, 3) : "—"; payByMonth[k] = (payByMonth[k] || 0) + (p.netSalary || 0); });

  const CHART_DATA = {
    employee:   countBy(EMP_ROWS, "dept"),
    attendance: ATT_ROWS.slice(0, 6).map((a) => ({ label: a.name.split(" ")[0], value: a.present })),
    leave:      Object.entries(leaveByMonth).map(([label, value]) => ({ label, value })),
    payroll:    Object.entries(payByMonth).map(([label, value]) => ({ label, value: Math.round(value / 1000) })),
    assets:     countBy(ASSET_ROWS, "category"),
  };

  const totGross = payrollRows.reduce((s, p) => s + (p.salary || 0) + (p.bonus || 0), 0);
  const totNet   = payrollRows.reduce((s, p) => s + (p.netSalary || 0), 0);
  const totPresent = ATT_ROWS.reduce((s, a) => s + a.present, 0);
  const totAbsent  = ATT_ROWS.reduce((s, a) => s + a.absent, 0);
  const totLate    = ATT_ROWS.reduce((s, a) => s + a.late, 0);
  const avgPct     = ATT_ROWS.length ? (ATT_ROWS.reduce((s, a) => s + a.pct, 0) / ATT_ROWS.length).toFixed(1) : 0;

  const SUMMARY = {
    employee: [
      { label: "Total Employees", value: String(EMP_ROWS.length), color: "blue" },
      { label: "Active",    value: String(EMP_ROWS.filter((r) => r.status === "Active").length),   color: "green" },
      { label: "On Leave",  value: String(EMP_ROWS.filter((r) => r.status === "On Leave").length), color: "yellow" },
      { label: "Inactive",  value: String(EMP_ROWS.filter((r) => r.status === "Inactive").length), color: "red" },
    ],
    attendance: [
      { label: "Avg Attendance", value: `${avgPct}%`,        color: "blue" },
      { label: "Total Present",  value: String(totPresent),  color: "green" },
      { label: "Absences",       value: String(totAbsent),   color: "red" },
      { label: "Late Arrivals",  value: String(totLate),     color: "yellow" },
    ],
    leave: [
      { label: "Total Leaves", value: String(LEAVE_ROWS.length), color: "blue" },
      { label: "Approved", value: String(LEAVE_ROWS.filter((r) => r.status === "Approved").length), color: "green" },
      { label: "Pending",  value: String(LEAVE_ROWS.filter((r) => r.status === "Pending").length),  color: "yellow" },
      { label: "Rejected", value: String(LEAVE_ROWS.filter((r) => r.status === "Rejected").length), color: "red" },
    ],
    payroll: [
      { label: "Total Gross", value: inr(totGross),          color: "blue" },
      { label: "Total Net",   value: inr(totNet),            color: "green" },
      { label: "Deductions",  value: inr(totGross - totNet), color: "red" },
      { label: "Pending", value: String(PAY_ROWS.filter((r) => r.status !== "Paid").length), color: "yellow" },
    ],
    assets: [
      { label: "Total Assets", value: String(ASSET_ROWS.length), color: "blue" },
      { label: "In Use",    value: String(ASSET_ROWS.filter((r) => r.status === "In Use").length),      color: "green" },
      { label: "Available", value: String(ASSET_ROWS.filter((r) => r.status === "Available").length),   color: "cyan" },
      { label: "Maintenance", value: String(ASSET_ROWS.filter((r) => r.status === "Maintenance").length), color: "yellow" },
    ],
  };

  const exportReport = (fmt) => show(`Exporting ${tab} report as ${fmt}…`, "success");

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Reports"
        sub="Generate and export detailed HR reports"
        action={
          <Group gap="sm">
            <Button size="sm" leftSection={<IconDownload size={14} />} color="green" onClick={() => exportReport("Excel")}>
              Excel
            </Button>
            <Button size="sm" leftSection={<IconDownload size={14} />} onClick={() => exportReport("PDF")}>
              PDF
            </Button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {SUMMARY[tab].map(s => (
          <AppStatCard key={s.label} label={s.label} value={s.value} color={s.color} />
        ))}
      </SimpleGrid>

      <Group align="flex-start" grow gap="lg">
        {/* Chart */}
        <AppSection title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Overview`}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CHART_DATA[tab]} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
              <XAxis dataKey="label" tick={{ fill: "var(--mantine-color-gray-6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--mantine-color-gray-6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--mantine-color-gray-2)" }} />
              <Bar dataKey="value" fill={CHART_COLORS[tab]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AppSection>

        {/* Filters */}
        <Paper p="md" radius="lg" withBorder style={{ maxWidth: 260 }}>
          <Group gap={6} mb="md">
            <IconFilter size={14} color="var(--mantine-color-gray-6)" />
            <Text size="sm" fw={600}>Filters</Text>
          </Group>
          <Stack gap="sm">
            <Select
              label="Date Range"
              data={DATE_RANGES}
              value={range}
              onChange={v => setRange(v)}
              size="sm"
            />
            <Select
              label="Department"
              data={DEPT_LIST}
              value={dept}
              onChange={v => setDept(v)}
              size="sm"
            />
          </Stack>
          <Paper mt="md" p="xs" radius="md" bg="blue.0">
            <Text size="xs" c="blue.7" fw={500}>Showing: {dept} · {range}</Text>
          </Paper>
        </Paper>
      </Group>

      <Paper radius="lg" withBorder>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List px="md" pt="xs">
            <Tabs.Tab value="employee"   leftSection={<IconUsers size={14} />}>Employees</Tabs.Tab>
            <Tabs.Tab value="attendance" leftSection={<IconClock size={14} />}>Attendance</Tabs.Tab>
            <Tabs.Tab value="leave"      leftSection={<IconCalendar size={14} />}>Leave</Tabs.Tab>
            <Tabs.Tab value="payroll"    leftSection={<IconTrendingUp size={14} />}>Payroll</Tabs.Tab>
            <Tabs.Tab value="assets"     leftSection={<IconPackage size={14} />}>Assets</Tabs.Tab>
          </Tabs.List>

          {/* Employee */}
          <Tabs.Panel value="employee">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Emp ID","Name","Department","Status","Joined","Salary"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {EMP_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.joined}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.salary}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Attendance */}
          <Tabs.Panel value="attendance">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Emp ID","Name","Department","Present","Absent","Late","Leave","%"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ATT_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.present}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.absent}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.late}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.leave}</Text></Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={700} c={r.pct < 70 ? "red" : "green"}>{r.pct}%</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Leave */}
          <Tabs.Panel value="leave">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Leave ID","Employee","Type","From","To","Days","Status"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {LEAVE_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.emp}</Text></Table.Td>
                      <Table.Td><Badge variant="outline" color="gray" radius="sm" size="sm">{r.type}</Badge></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.from}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.to}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.days}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Payroll */}
          <Tabs.Panel value="payroll">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Pay ID","Employee","Department","Gross","Deductions","Net","Status"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {PAY_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.emp}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.gross}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="red">{r.deductions}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600} c="green">{r.net}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Assets */}
          <Tabs.Panel value="assets">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Asset ID","Name","Category","Assigned To","Department","Status","Value"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ASSET_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.name}</Text></Table.Td>
                      <Table.Td><Badge variant="outline" color="gray" radius="sm" size="sm">{r.category}</Badge></Table.Td>
                      <Table.Td><Text size="sm">{r.assignedTo}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.value}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            <Group p="md" justify="flex-end" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
              <Button size="xs" variant="outline" leftSection={<IconDownload size={12} />} onClick={() => exportReport("Excel")}>Export Excel</Button>
              <Button size="xs" variant="outline" leftSection={<IconDownload size={12} />} onClick={() => exportReport("PDF")}>Export PDF</Button>
            </Group>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
