import { useState, useMemo } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, TextInput, Select,
  Stack, Loader, Box, Tabs, ActionIcon, Menu,
} from "@mantine/core";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconClock, IconCurrencyRupee, IconCircleCheck, IconHourglass, IconSearch,
  IconChartBar, IconList, IconReport, IconCalendarStats, IconCheck, IconX,
  IconFileExport, IconDownload,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { useToast }      from "../../components/ui/Toast";

// ── Mock stubs for removed service functions ──
const exportTimesheet = async (...args) => { console.log("Mock: exportTimesheet"); return new Blob(["mock data"], { type: "text/csv" }); };


const STATUS_COLOR = { Approved: "green", ManagerApproved: "cyan", Pending: "yellow", Rejected: "red", Draft: "gray" };
const STATUS_LABEL = { ManagerApproved: "Manager Approved" };

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_DASH = {
  cards: {
    totalHoursThisWeek: 168, billableHours: 132, nonBillableHours: 36,
    pendingApprovals: 5, overtimeHours: 9, utilizationPercentage: 79,
  },
};

const MOCK_TRENDS = {
  trend: [
    { date: "2026-06-25", billable: 26, nonBillable: 6 },
    { date: "2026-06-26", billable: 24, nonBillable: 7 },
    { date: "2026-06-27", billable: 27, nonBillable: 5 },
    { date: "2026-06-28", billable: 22, nonBillable: 8 },
    { date: "2026-06-29", billable: 25, nonBillable: 6 },
    { date: "2026-06-30", billable: 20, nonBillable: 4 },
    { date: "2026-07-01", billable: 8,  nonBillable: 0 },
  ],
};

const MOCK_BY_PROJECT = [
  { name: "Client Portal Revamp", billable: 44, total: 48 },
  { name: "Internal Tooling",     billable: 18, total: 32 },
  { name: "Mobile App v2",        billable: 38, total: 40 },
  { name: "Support & Maintenance",billable: 32, total: 48 },
];

const MOCK_ENTRIES = [
  { id: "t1", employee: { employeeId: "EMP001", name: "Arjun Kumar",  department: "Engineering" }, date: "2026-07-01T00:00:00Z", project: "Client Portal Revamp", task: "API integration",   client: "Acme Corp", hours: 8, billable: true,  status: "Approved" },
  { id: "t2", employee: { employeeId: "EMP002", name: "Priya Sharma", department: "Engineering" }, date: "2026-07-01T00:00:00Z", project: "Mobile App v2",        task: "UI polish",          client: "Nimbus Ltd", hours: 7.5, billable: true, status: "Pending" },
  { id: "t3", employee: { employeeId: "EMP003", name: "Rahul Verma",  department: "Support"     }, date: "2026-07-01T00:00:00Z", project: "Support & Maintenance", task: "Ticket triage",   client: "Acme Corp", hours: 6, billable: false, status: "Approved" },
  { id: "t4", employee: { employeeId: "EMP004", name: "Sneha Nair",   department: "Engineering" }, date: "2026-06-30T00:00:00Z", project: "Internal Tooling",     task: "CI pipeline fix",  client: "—",         hours: 5, billable: false, status: "Draft" },
  { id: "t5", employee: { employeeId: "EMP005", name: "Vikram Singh", department: "Engineering" }, date: "2026-06-30T00:00:00Z", project: "Client Portal Revamp", task: "Code review",     client: "Acme Corp", hours: 4, billable: true,  status: "Pending" },
];

const MOCK_APPROVALS = [
  { id: "a1", employeeName: "Priya Sharma", weekOf: "2026-06-30T00:00:00Z", project: "Mobile App v2", hours: 38.5, status: "Pending" },
  { id: "a2", employeeName: "Vikram Singh", weekOf: "2026-06-30T00:00:00Z", project: "Client Portal Revamp", hours: 40, status: "Pending" },
  { id: "a3", employeeName: "Rahul Verma",  weekOf: "2026-06-23T00:00:00Z", project: "Support & Maintenance", hours: 36, status: "Approved" },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

async function doExport(fmt, toast) {
  try {
    const blob = await exportTimesheet(fmt);
    const url = URL.createObjectURL(blob);
    if (fmt === "pdf") window.open(url, "_blank");
    else { const a = document.createElement("a"); a.href = url; a.download = `timesheet.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
    toast(`Exported as ${fmt.toUpperCase()}`, "success");
  } catch { toast("Export failed", "error"); }
}

export default function Timesheet() {
  const { show: toast } = useToast();
  const range = "weekly";

  const { data: rawDash } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: rawTrends } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: rawEntries, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const dash    = rawDash ?? MOCK_DASH;
  const trends  = rawTrends?.trend?.length ? rawTrends : MOCK_TRENDS;
  const entries = rawEntries?.length ? rawEntries : MOCK_ENTRIES;
  const c = dash?.cards || {};

  return (
    <>
      <AppPageHeader title="Timesheet Management" sub="Track project hours, billable time & approvals"
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

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} mb="lg">
        <AppStatCard icon={<IconClock size={20} />} label="Total Hours" value={`${c.totalHoursThisWeek ?? 0}h`} color="blue" />
        <AppStatCard icon={<IconCurrencyRupee size={20} />} label="Billable" value={`${c.billableHours ?? 0}h`} color="green" />
        <AppStatCard icon={<IconHourglass size={20} />} label="Non-Billable" value={`${c.nonBillableHours ?? 0}h`} color="gray" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Pending Approvals" value={c.pendingApprovals ?? 0} color="yellow" />
        <AppStatCard icon={<IconClock size={20} />} label="Overtime" value={`${c.overtimeHours ?? 0}h`} color="orange" />
        <AppStatCard icon={<IconChartBar size={20} />} label="Utilization" value={`${c.utilizationPercentage ?? 0}%`} color="indigo" />
      </SimpleGrid>

      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="list"      leftSection={<IconList size={15} />}>Timesheet Entries</Tabs.Tab>
          <Tabs.Tab value="reports"   leftSection={<IconReport size={15} />}>Reports</Tabs.Tab>
          <Tabs.Tab value="approvals" leftSection={<IconCalendarStats size={15} />}>Approvals</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard">
          <Group justify="flex-end" mb="sm" />
          <AppSection title="Hours Trend" mb="md">
            {trends?.trend?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                  <Area type="monotone" dataKey="billable" stroke="#10b981" fill="#10b98133" name="Billable" />
                  <Area type="monotone" dataKey="nonBillable" stroke="#94a3b8" fill="#94a3b833" name="Non-Billable" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <AppEmptyState message="No timesheet data available." py={60} />}
          </AppSection>
          <AppSection title="Hours by Project">
            {MOCK_BY_PROJECT.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_BY_PROJECT}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                  <Bar dataKey="billable" fill="#10b981" name="Billable" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="total" fill="#cbd5e1" name="Total" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <AppEmptyState message="No data" py={60} />}
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="list"><EntriesList entries={entries} isLoading={isLoading} /></Tabs.Panel>
        <Tabs.Panel value="reports"><ReportsTab entries={entries} /></Tabs.Panel>
        <Tabs.Panel value="approvals"><ApprovalsTab toast={toast} /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function EntriesList({ entries, isLoading }) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [projectF, setProjectF] = useState("All");

  const projects = useMemo(() => ["All", ...new Set(entries.map((e) => e.project).filter(Boolean))], [entries]);
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return (!q || (e.employee?.name || "").toLowerCase().includes(q))
      && (statusF === "All" || e.status === statusF)
      && (projectF === "All" || e.project === projectF);
  });

  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;
  const COLS = ["Employee", "Date", "Project", "Task", "Client", "Hours", "Billable", "Status"];
  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput label="Search" placeholder="Search by employee…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 160 }} />
          <Select label="Project" w={180} size="sm" data={projects} value={projectF} onChange={setProjectF} />
          <Select label="Status" w={150} size="sm" data={["All", "Draft", "Pending", "ManagerApproved", "Approved", "Rejected"].map((s) => ({ value: s, label: STATUS_LABEL[s] || s }))} value={statusF} onChange={setStatusF} />
        </Group>
      </AppSection>
      <AppSection noPadding title="Timesheet Entries" sub={`${filtered.length} entries`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{COLS.map((col) => <Table.Th key={col}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{col}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr><Table.Td colSpan={COLS.length}><AppEmptyState message="No timesheet entries available." /></Table.Td></Table.Tr>
              ) : filtered.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text size="sm" fw={600}>{e.employee?.name || "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{fmtDate(e.date)}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.project}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{e.task}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{e.client}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.hours}h</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={e.billable ? "green" : "gray"} radius="sm">{e.billable ? "Billable" : "Non-Billable"}</Badge></Table.Td>
                  <Table.Td><Badge variant="light" color={STATUS_COLOR[e.status] || "gray"} radius="sm">{STATUS_LABEL[e.status] || e.status}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
    </>
  );
}

function ReportsTab({ entries }) {
  const totalBillable = entries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
  const totalNonBillable = entries.filter((e) => !e.billable).reduce((s, e) => s + e.hours, 0);
  const byProject = useMemo(() => {
    const map = {};
    entries.forEach((e) => { map[e.project] = (map[e.project] || 0) + e.hours; });
    return Object.entries(map).map(([name, hours]) => ({ name, hours }));
  }, [entries]);

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppStatCard icon={<IconCurrencyRupee size={20} />} label="Total Billable Hours" value={`${totalBillable}h`} color="green" />
        <AppStatCard icon={<IconHourglass size={20} />} label="Total Non-Billable Hours" value={`${totalNonBillable}h`} color="gray" />
      </SimpleGrid>
      <AppSection noPadding title="Hours by Project" sub={`${byProject.length} projects`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Project", "Total Hours"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {byProject.length === 0 ? <Table.Tr><Table.Td colSpan={2}><AppEmptyState message="No project data" /></Table.Td></Table.Tr>
                : byProject.map((p) => (
                  <Table.Tr key={p.name}><Table.Td><Text size="sm" fw={600}>{p.name}</Text></Table.Td><Table.Td><Badge color="blue" variant="light" radius="sm">{p.hours}h</Badge></Table.Td></Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
    </Stack>
  );
}

function ApprovalsTab({ toast }) {
  const [statusF, setStatusF] = useState("All");
  const { data: rawList } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const list = rawList?.length ? rawList : MOCK_APPROVALS;
  const reviewMut = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const review = async (id, status) => {
    try { await reviewMut.mutateAsync({ id, status }); toast(`Timesheet ${status.toLowerCase()}`, status === "Approved" ? "success" : "info"); }
    catch { toast("Action failed", "error"); }
  };
  return (
    <>
      <AppSection mb="md" p="md">
        <Select label="Status" w={180} size="sm" data={["All", "Pending", "ManagerApproved", "Approved", "Rejected"].map((s) => ({ value: s, label: STATUS_LABEL[s] || s }))} value={statusF} onChange={setStatusF} />
      </AppSection>
      <AppSection noPadding title="Timesheet Approvals" sub={`${list.length} submissions`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Week Of", "Project", "Hours", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {list.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No timesheet submissions" /></Table.Td></Table.Tr>
                : list.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={600}>{r.employeeName || "—"}</Text></Table.Td>
                    <Table.Td>{fmtDate(r.weekOf)}</Table.Td>
                    <Table.Td><Text size="sm">{r.project}</Text></Table.Td>
                    <Table.Td><Text size="sm">{r.hours}h</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={STATUS_COLOR[r.status] || "gray"} radius="sm">{STATUS_LABEL[r.status] || r.status}</Badge></Table.Td>
                    <Table.Td>
                      {(r.status === "Pending" || r.status === "ManagerApproved") ? (
                        <Group gap={4} wrap="nowrap">
                          <ActionIcon size="sm" variant="light" color="green" title="Approve" onClick={() => review(r.id, "Approved")}><IconCheck size={13} /></ActionIcon>
                          <ActionIcon size="sm" variant="light" color="red" title="Reject" onClick={() => review(r.id, "Rejected")}><IconX size={13} /></ActionIcon>
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
