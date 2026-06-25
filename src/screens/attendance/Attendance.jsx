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

  const { data: dash } = useAttDashboard();
  const { data: trends } = useAttTrends(range);
  const { data: breakdown } = useAttBreakdown();
  const { data: records = [], isLoading } = useAttendanceRecords();
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
  const { data: late = [] } = useLateReport();
  const { data: ot } = useOvertime();
  const { data: wfh = [] } = useWFH();
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
  const { data: list = [] } = useRegularizations(statusF);
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
