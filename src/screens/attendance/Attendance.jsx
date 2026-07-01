import { useState, useMemo } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, TextInput, Select, SegmentedControl,
  Stack, Loader, Box, Tabs, Menu, ActionIcon, Button,
} from "@mantine/core";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconUsers, IconUserCheck, IconUserX, IconCalendarOff, IconHome, IconClock,
  IconPercentage, IconClockHour4, IconSearch, IconFileExport, IconDownload, IconChartBar,
  IconList, IconReport, IconCheck, IconX, IconHelp, IconCalendarStats,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { useToast }      from "../../components/ui/Toast";
import { fetchBranches } from "../../api/branchApi";
import { exportAttendance } from "../../api/attendanceApi";
import { useQuery } from "@tanstack/react-query";
import {
  useAttendanceRecords, useAttDashboard, useAttTrends, useAttBreakdown,
  useLateReport, useOvertime, useWFH, useRegularizations, useReviewRegularization,
} from "../../queries/useAttendance";

const STATUS_COLOR = {
  Present: "green", Late: "orange", Absent: "red", HalfDay: "yellow",
  OnLeave: "yellow", WFH: "grape", Weekend: "gray", Holiday: "blue",
};

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_DASH = {
  cards: {
    totalEmployees: 42, presentToday: 35, absentToday: 4, onLeave: 2,
    workFromHome: 3, lateArrivals: 5, attendancePercentage: 88, overtimeHours: 14,
  },
};

const MOCK_TRENDS = {
  trend: [
    { date: "2026-06-25", present: 38, wfh: 3, leave: 2, absent: 2 },
    { date: "2026-06-26", present: 36, wfh: 4, leave: 2, absent: 3 },
    { date: "2026-06-27", present: 37, wfh: 3, leave: 3, absent: 2 },
    { date: "2026-06-28", present: 34, wfh: 5, leave: 2, absent: 4 },
    { date: "2026-06-29", present: 33, wfh: 4, leave: 3, absent: 3 },
    { date: "2026-06-30", present: 35, wfh: 3, leave: 2, absent: 4 },
    { date: "2026-07-01", present: 35, wfh: 3, leave: 2, absent: 4 },
  ],
};

const MOCK_BREAKDOWN = {
  byDepartment: [
    { name: "Engineering", present: 14, total: 16 },
    { name: "Sales",       present: 8,  total: 9  },
    { name: "HR",          present: 4,  total: 5  },
    { name: "Finance",     present: 5,  total: 6  },
    { name: "Operations",  present: 4,  total: 6  },
  ],
  byBranch: [
    { name: "Chennai HQ", present: 22, total: 25 },
    { name: "Bangalore",  present: 8,  total: 10 },
    { name: "Mumbai",     present: 5,  total: 7  },
  ],
};

const MOCK_RECORDS = [
  { id: "r1", employee: { employeeId: "EMP001", name: "Arjun Kumar",   department: "Engineering" }, date: "2026-07-01T00:00:00Z", checkIn: "2026-07-01T09:02:00Z", checkOut: "2026-07-01T18:10:00Z", hoursWorked: 9.1, status: "Present" },
  { id: "r2", employee: { employeeId: "EMP002", name: "Priya Sharma",  department: "HR"          }, date: "2026-07-01T00:00:00Z", checkIn: "2026-07-01T09:45:00Z", checkOut: "2026-07-01T18:00:00Z", hoursWorked: 8.2, status: "Late" },
  { id: "r3", employee: { employeeId: "EMP003", name: "Rahul Verma",   department: "Sales"       }, date: "2026-07-01T00:00:00Z", checkIn: null,                  checkOut: null,                  hoursWorked: null, status: "Absent" },
  { id: "r4", employee: { employeeId: "EMP004", name: "Sneha Nair",    department: "Finance"     }, date: "2026-07-01T00:00:00Z", checkIn: "2026-07-01T09:00:00Z", checkOut: "2026-07-01T18:00:00Z", hoursWorked: 9,   status: "WFH" },
  { id: "r5", employee: { employeeId: "EMP005", name: "Vikram Singh",  department: "Engineering" }, date: "2026-07-01T00:00:00Z", checkIn: "2026-07-01T09:10:00Z", checkOut: "2026-07-01T17:55:00Z", hoursWorked: 8.7, status: "Present" },
  { id: "r6", employee: { employeeId: "EMP006", name: "Ananya Pillai", department: "Operations"  }, date: "2026-07-01T00:00:00Z", checkIn: null,                  checkOut: null,                  hoursWorked: null, status: "OnLeave" },
];

const MOCK_LATE = [
  { id: "l1", name: "Priya Sharma", date: "2026-07-01T00:00:00Z", expected: "09:00", actual: "09:45", delay: "45 min" },
  { id: "l2", name: "Rohan Das",    date: "2026-06-30T00:00:00Z", expected: "09:00", actual: "09:32", delay: "32 min" },
  { id: "l3", name: "Kavya Menon",  date: "2026-06-29T00:00:00Z", expected: "09:00", actual: "09:20", delay: "20 min" },
];

const MOCK_OT = {
  totalHours: 14,
  records: [
    { id: "o1", name: "Arjun Kumar",  date: "2026-06-30T00:00:00Z", hours: 2.5 },
    { id: "o2", name: "Vikram Singh", date: "2026-06-28T00:00:00Z", hours: 3.0 },
    { id: "o3", name: "Sneha Nair",   date: "2026-06-27T00:00:00Z", hours: 2.0 },
    { id: "o4", name: "Arun Prakash", date: "2026-06-26T00:00:00Z", hours: 3.5 },
    { id: "o5", name: "Deepika Rao",  date: "2026-06-25T00:00:00Z", hours: 3.0 },
  ],
};

const MOCK_WFH = [
  { id: "w1", name: "Sneha Nair",   date: "2026-07-01T00:00:00Z", status: "WFH" },
  { id: "w2", name: "Arun Prakash", date: "2026-06-30T00:00:00Z", status: "WFH" },
  { id: "w3", name: "Meera Iyer",   date: "2026-06-29T00:00:00Z", status: "WFH" },
];

const MOCK_REGULARIZATIONS = [
  { id: "rg1", employeeName: "Rahul Verma", date: "2026-06-28T00:00:00Z", type: "Missing Punch", reason: "Forgot to check out",  status: "Pending" },
  { id: "rg2", employeeName: "Kavya Menon", date: "2026-06-27T00:00:00Z", type: "Early Exit",    reason: "Doctor appointment",   status: "Approved" },
  { id: "rg3", employeeName: "Rohan Das",   date: "2026-06-26T00:00:00Z", type: "Late Entry",    reason: "Traffic delay",        status: "Pending" },
];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

async function doExport(fmt, toast) {
  try {
    const blob = await exportAttendance(fmt);
    const url = URL.createObjectURL(blob);
    if (fmt === "pdf") window.open(url, "_blank");
    else { const a = document.createElement("a"); a.href = url; a.download = `attendance.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
    toast(`Exported as ${fmt.toUpperCase()}`, "success");
  } catch { toast("Export failed", "error"); }
}

export default function Attendance() {
  const { show: toast } = useToast();
  const [range, setRange] = useState("weekly");

  const { data: rawDash } = useAttDashboard();
  const { data: rawTrends } = useAttTrends(range);
  const { data: rawBreakdown } = useAttBreakdown();
  const { data: rawRecords, isLoading } = useAttendanceRecords();

  const dash      = rawDash      ?? MOCK_DASH;
  const trends    = rawTrends?.trend?.length    ? rawTrends    : MOCK_TRENDS;
  const breakdown = rawBreakdown?.byDepartment?.length ? rawBreakdown : MOCK_BREAKDOWN;
  const records   = rawRecords?.length ? rawRecords : MOCK_RECORDS;
  const { data: branchesRes } = useQuery({ queryKey: ["branches"], queryFn: () => fetchBranches().then((r) => r.data?.data ?? r.data ?? []) });
  const branches = branchesRes || [];

  const c = dash?.cards || {};

  return (
    <>
      <AppPageHeader title="Attendance Management" sub="Track attendance, work hours, late arrivals & regularization"
        action={
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("excel", toast)}>Excel (CSV)</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("csv", toast)}>CSV</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("pdf", toast)}>PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 4, lg: 8 }} mb="lg">
        <AppStatCard icon={<IconUsers size={20} />} label="Total" value={c.totalEmployees ?? 0} color="blue" />
        <AppStatCard icon={<IconUserCheck size={20} />} label="Present" value={c.presentToday ?? 0} color="green" />
        <AppStatCard icon={<IconUserX size={20} />} label="Absent" value={c.absentToday ?? 0} color="red" />
        <AppStatCard icon={<IconCalendarOff size={20} />} label="On Leave" value={c.onLeave ?? 0} color="yellow" />
        <AppStatCard icon={<IconHome size={20} />} label="WFH" value={c.workFromHome ?? 0} color="grape" />
        <AppStatCard icon={<IconClock size={20} />} label="Late" value={c.lateArrivals ?? 0} color="orange" />
        <AppStatCard icon={<IconPercentage size={20} />} label="Attendance %" value={`${c.attendancePercentage ?? 0}%`} color="teal" />
        <AppStatCard icon={<IconClockHour4 size={20} />} label="Overtime" value={`${c.overtimeHours ?? 0}h`} color="indigo" />
      </SimpleGrid>

      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="list"      leftSection={<IconList size={15} />}>Attendance List</Tabs.Tab>
          <Tabs.Tab value="reports"   leftSection={<IconReport size={15} />}>Reports</Tabs.Tab>
          <Tabs.Tab value="regular"   leftSection={<IconCalendarStats size={15} />}>Regularization</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard">
          <Group justify="flex-end" mb="sm">
            <SegmentedControl size="xs" data={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]} value={range} onChange={setRange} />
          </Group>
          <AppSection title="Attendance Trend" mb="md">
            {trends?.trend?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                  <Area type="monotone" dataKey="present" stroke="#10b981" fill="#10b98133" name="Present" />
                  <Area type="monotone" dataKey="wfh" stroke="#8b5cf6" fill="#8b5cf633" name="WFH" />
                  <Area type="monotone" dataKey="leave" stroke="#f59e0b" fill="#f59e0b33" name="Leave" />
                  <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="#ef444433" name="Absent" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <AppEmptyState message="No attendance records available." py={60} />}
          </AppSection>
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <AppSection title="Attendance by Department">
              {breakdown?.byDepartment?.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={breakdown.byDepartment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                    <Bar dataKey="present" fill="#10b981" name="Present" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="total" fill="#cbd5e1" name="Total" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
            <AppSection title="Attendance by Branch">
              {breakdown?.byBranch?.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={breakdown.byBranch}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                    <Bar dataKey="present" fill="#3b82f6" name="Present" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="total" fill="#cbd5e1" name="Total" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <AppEmptyState message="No data" py={60} />}
            </AppSection>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="list"><AttendanceList records={records} isLoading={isLoading} branches={branches} /></Tabs.Panel>
        <Tabs.Panel value="reports"><ReportsTab /></Tabs.Panel>
        <Tabs.Panel value="regular"><RegularizationTab toast={toast} /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function AttendanceList({ records, isLoading }) {
  const [search, setSearch]   = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [statusF, setStatusF] = useState("All");
  const [deptF, setDeptF]     = useState("All");

  const departments = useMemo(() => ["All", ...new Set(records.map((r) => r.employee?.department).filter(Boolean))], [records]);
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const field = searchBy === "id" ? (r.employee?.employeeId || "")
      : searchBy === "department" ? (r.employee?.department || "") : (r.employee?.name || "");
    return (!q || field.toLowerCase().includes(q))
      && (statusF === "All" || r.status === statusF)
      && (deptF === "All" || r.employee?.department === deptF);
  });

  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;
  const COLS = ["Employee ID", "Name", "Department", "Date", "Check In", "Check Out", "Hours", "Status"];
  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" w={140} size="sm" value={searchBy} onChange={setSearchBy}
            data={[{ value: "name", label: "Name" }, { value: "id", label: "Employee ID" }, { value: "department", label: "Department" }]} />
          <TextInput label="Search" placeholder="Search…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 160 }} />
          <Select label="Department" w={150} size="sm" data={departments} value={deptF} onChange={setDeptF} />
          <Select label="Status" w={150} size="sm" data={["All", "Present", "Absent", "Late", "HalfDay", "OnLeave", "WFH", "Holiday", "Weekend"]} value={statusF} onChange={setStatusF} />
        </Group>
      </AppSection>
      <AppSection noPadding title="Attendance Records" sub={`${filtered.length} records`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{COLS.map((col) => <Table.Th key={col}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{col}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr><Table.Td colSpan={COLS.length}><AppEmptyState message="No attendance records available." /></Table.Td></Table.Tr>
              ) : filtered.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td><Text size="sm" fw={600}>{r.employee?.employeeId || "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{r.employee?.name || "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{r.employee?.department || "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{fmtDate(r.date)}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{fmtTime(r.checkIn)}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{fmtTime(r.checkOut)}</Text></Table.Td>
                  <Table.Td><Text size="sm">{r.hoursWorked != null ? `${r.hoursWorked}h` : "—"}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={STATUS_COLOR[r.status] || "gray"} radius="sm">{r.status}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
    </>
  );
}

function ReportsTab() {
  const { data: rawLate } = useLateReport();
  const { data: rawOt }   = useOvertime();
  const { data: rawWfh }  = useWFH();

  const late = rawLate?.length ? rawLate : MOCK_LATE;
  const ot   = rawOt?.records?.length  ? rawOt  : MOCK_OT;
  const wfh  = rawWfh?.length  ? rawWfh  : MOCK_WFH;
  return (
    <Stack gap="md">
      <AppSection noPadding title="Late Entry Report" sub={`${late.length} late entries`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Date", "Expected", "Actual", "Delay"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {late.length === 0 ? <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No late entries" /></Table.Td></Table.Tr>
                : late.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={600}>{r.name}</Text></Table.Td>
                    <Table.Td>{fmtDate(r.date)}</Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{r.expected}</Text></Table.Td>
                    <Table.Td><Text size="sm">{r.actual}</Text></Table.Td>
                    <Table.Td><Badge color="orange" variant="light" radius="sm">{r.delay}</Badge></Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppSection noPadding title="Overtime Report" sub={`${ot?.totalHours || 0}h total`}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead><Table.Tr>{["Employee", "Date", "Hours"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
              <Table.Tbody>
                {!ot?.records?.length ? <Table.Tr><Table.Td colSpan={3}><AppEmptyState message="No overtime" /></Table.Td></Table.Tr>
                  : ot.records.map((r) => (
                    <Table.Tr key={r.id}><Table.Td><Text size="sm" fw={600}>{r.name}</Text></Table.Td><Table.Td>{fmtDate(r.date)}</Table.Td><Table.Td><Badge color="indigo" variant="light" radius="sm">{r.hours}h</Badge></Table.Td></Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </AppSection>
        <AppSection noPadding title="Work From Home Report" sub={`${wfh.length} WFH days`}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead><Table.Tr>{["Employee", "Date", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
              <Table.Tbody>
                {wfh.length === 0 ? <Table.Tr><Table.Td colSpan={3}><AppEmptyState message="No WFH records" /></Table.Td></Table.Tr>
                  : wfh.map((r) => (
                    <Table.Tr key={r.id}><Table.Td><Text size="sm" fw={600}>{r.name}</Text></Table.Td><Table.Td>{fmtDate(r.date)}</Table.Td><Table.Td><Badge color="grape" variant="light" radius="sm">{r.status}</Badge></Table.Td></Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </AppSection>
      </SimpleGrid>
    </Stack>
  );
}

function RegularizationTab({ toast }) {
  const [statusF, setStatusF] = useState("All");
  const { data: rawList } = useRegularizations(statusF);
  const list = rawList?.length ? rawList : MOCK_REGULARIZATIONS;
  const reviewMut = useReviewRegularization();
  const review = async (id, status) => {
    try { await reviewMut.mutateAsync({ id, status }); toast(`Request ${status.toLowerCase()}`, status === "Approved" ? "success" : "info"); }
    catch { toast("Action failed", "error"); }
  };
  return (
    <>
      <AppSection mb="md" p="md">
        <Select label="Status" w={180} size="sm" data={["All", "Pending", "Approved", "Rejected", "Clarification"]} value={statusF} onChange={setStatusF} />
      </AppSection>
      <AppSection noPadding title="Regularization Requests" sub={`${list.length} requests`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Date", "Type", "Reason", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {list.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No regularization requests" /></Table.Td></Table.Tr>
                : list.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={600}>{r.employeeName || "—"}</Text></Table.Td>
                    <Table.Td>{fmtDate(r.date)}</Table.Td>
                    <Table.Td><Text size="sm">{r.type}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed" lineClamp={1}>{r.reason || "—"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={r.status === "Approved" ? "green" : r.status === "Rejected" ? "red" : r.status === "Clarification" ? "blue" : "yellow"} radius="sm">{r.status}</Badge></Table.Td>
                    <Table.Td>
                      {r.status === "Pending" ? (
                        <Group gap={4} wrap="nowrap">
                          <ActionIcon size="sm" variant="light" color="green" title="Approve" onClick={() => review(r.id, "Approved")}><IconCheck size={13} /></ActionIcon>
                          <ActionIcon size="sm" variant="light" color="red" title="Reject" onClick={() => review(r.id, "Rejected")}><IconX size={13} /></ActionIcon>
                          <ActionIcon size="sm" variant="light" color="blue" title="Request clarification" onClick={() => review(r.id, "Clarification")}><IconHelp size={13} /></ActionIcon>
                        </Group>
                      ) : <Text size="xs" c="dimmed">—</Text>}
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
    </>
  );
}
