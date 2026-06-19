import { useState } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, Stack, Tabs, Select, Box, Loader,
  ActionIcon, Menu, Paper,
} from "@mantine/core";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconUsers, IconUserCheck, IconUserPlus, IconCalendarOff, IconPercentage, IconCash,
  IconTicket, IconDeviceLaptop, IconFileCheck, IconChartBar, IconReportAnalytics, IconBookmark,
  IconDownload, IconFileExport, IconStar, IconStarFilled, IconTrash, IconClock,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import {
  useReportDashboard, useReportCatalog, useReportData, useSavedReports,
  useCreateSavedReport, useUpdateSavedReport, useDeleteSavedReport,
} from "../../queries/useReports";

const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#64748b"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ReportsCenter({ darkMode }) {
  return (
    <>
      <AppPageHeader title="Reports & Analytics" sub="Executive insights and operational reports across all modules" />
      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={15} />}>Executive Dashboard</Tabs.Tab>
          <Tabs.Tab value="library"   leftSection={<IconReportAnalytics size={15} />}>Report Library</Tabs.Tab>
          <Tabs.Tab value="saved"     leftSection={<IconBookmark size={15} />}>Saved Reports</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="library"><LibraryTab /></Tabs.Panel>
        <Tabs.Panel value="saved"><SavedTab /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function DashboardTab() {
  const { data, isLoading } = useReportDashboard();
  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  const c = data?.cards || {};
  const ch = data?.charts || {};
  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} mb="md">
        <AppStatCard icon={<IconUsers size={20} />} label="Total Employees" value={c.totalEmployees ?? 0} color="blue" />
        <AppStatCard icon={<IconUserCheck size={20} />} label="Active" value={c.activeEmployees ?? 0} color="green" />
        <AppStatCard icon={<IconUserPlus size={20} />} label="New Joiners" value={c.newJoiners ?? 0} color="teal" />
        <AppStatCard icon={<IconCalendarOff size={20} />} label="On Leave" value={c.onLeaveToday ?? 0} color="yellow" />
        <AppStatCard icon={<IconPercentage size={20} />} label="Attendance %" value={`${c.attendancePct ?? 0}%`} color="cyan" />
        <AppStatCard icon={<IconCash size={20} />} label="Payroll Cost" value={inr(c.payrollCost)} color="indigo" />
        <AppStatCard icon={<IconTicket size={20} />} label="Open Tickets" value={c.openTickets ?? 0} color="orange" />
        <AppStatCard icon={<IconDeviceLaptop size={20} />} label="Assigned Assets" value={c.assignedAssets ?? 0} color="grape" />
        <AppStatCard icon={<IconFileCheck size={20} />} label="Doc Compliance" value={`${c.docCompliance ?? 0}%`} color="green" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <AppSection title="Employee Growth Trend">
          {ch.employeeGrowth?.length ? (
            <ResponsiveContainer width="100%" height={260}><AreaChart data={ch.employeeGrowth}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f633" name="Employees" /></AreaChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={50} />}
        </AppSection>
        <AppSection title="Department Headcount">
          {ch.departmentHeadcount?.length ? (
            <ResponsiveContainer width="100%" height={260}><BarChart data={ch.departmentHeadcount}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={50} />}
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} mb="md">
        <AppSection title="Branch Distribution">
          {ch.branchDistribution?.length ? (
            <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={ch.branchDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{ch.branchDistribution.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={40} />}
        </AppSection>
        <AppSection title="Asset Distribution">
          {ch.assetDistribution?.length ? (
            <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={ch.assetDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{ch.assetDistribution.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={40} />}
        </AppSection>
        <AppSection title="Leave Trend">
          {ch.leaveTrend?.length ? (
            <ResponsiveContainer width="100%" height={240}><BarChart data={ch.leaveTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="days" fill="#f59e0b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={40} />}
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppSection title="Attendance Trend">
          {ch.attendanceTrend?.length ? (
            <ResponsiveContainer width="100%" height={240}><AreaChart data={ch.attendanceTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Area type="monotone" dataKey="present" stroke="#10b981" fill="#10b98133" name="Present" /><Area type="monotone" dataKey="absent" stroke="#ef4444" fill="#ef444433" name="Absent" /></AreaChart></ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={40} />}
        </AppSection>
        <AppSection title="Payroll Cost & Helpdesk Resolution">
          {ch.payrollTrend?.length || ch.helpdeskTrend?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend />
                <Line data={ch.payrollTrend} dataKey="net" name="Payroll (₹)" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line data={ch.helpdeskTrend} dataKey="resolved" name="Tickets Resolved" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={40} />}
        </AppSection>
      </SimpleGrid>
    </>
  );
}

function LibraryTab() {
  const { show: toast } = useToast();
  const { data: catalog = {} } = useReportCatalog();
  const modules = Object.keys(catalog);
  const [module, setModule] = useState("");
  const [report, setReport] = useState("");
  const { data, isFetching } = useReportData(module, report);
  const createSaved = useCreateSavedReport();

  const exportCsv = () => {
    if (!data?.rows?.length) { toast("Nothing to export", "error"); return; }
    const header = Object.keys(data.rows[0]);
    const esc = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [header.join(","), ...data.rows.map((r) => header.map((h) => esc(r[h])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `${(report || module).replace(/\s+/g, "_")}.csv`; a.click(); URL.revokeObjectURL(url);
    toast("Exported CSV", "success");
  };
  const exportPdf = () => {
    if (!data?.rows?.length) { toast("Nothing to export", "error"); return; }
    const header = Object.keys(data.rows[0]);
    const w = window.open("", "_blank");
    w.document.write(`<!doctype html><title>${report}</title><style>body{font-family:Arial;padding:24px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #ccc;padding:5px}th{background:#f1f5f9}</style><h1>${report}</h1><table><thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${data.rows.map((r) => `<tr>${header.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    w.document.close(); w.print();
  };
  const saveReport = async () => {
    if (!module || !report) return;
    try { await createSaved.mutateAsync({ name: report, module, reportKey: report }); toast("Saved to My Reports", "success"); }
    catch { toast("Failed to save", "error"); }
  };

  const cols = data?.rows?.length ? Object.keys(data.rows[0]) : [];

  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Module" w={200} size="sm" placeholder="Select module" data={modules} value={module} onChange={(v) => { setModule(v); setReport(""); }} />
          <Select label="Report" w={280} size="sm" placeholder="Select report" data={module ? catalog[module] : []} value={report} onChange={setReport} disabled={!module} searchable />
          <AppButton variant="default" leftSection={<IconBookmark size={16} />} disabled={!report} onClick={saveReport}>Save</AppButton>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />} disabled={!data?.rows?.length}>Export</AppButton></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={exportCsv}>Excel (CSV)</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={exportCsv}>CSV</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={exportPdf}>PDF / Print</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppSection>

      {!module || !report ? (
        <AppEmptyState message="Select a module and report to generate." sub="Reports draw live data from all HRMS modules." py={80} />
      ) : isFetching ? <Box ta="center" py="xl"><Loader size="sm" /></Box> : !data?.rows?.length ? (
        <AppEmptyState message="No reports generated." py={80} />
      ) : (
        <AppSection noPadding title={report} sub={`${data.total} rows`}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead><Table.Tr>{cols.map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
              <Table.Tbody>
                {data.rows.slice(0, 200).map((row, i) => (
                  <Table.Tr key={i}>{cols.map((cc) => <Table.Td key={cc}><Text size="sm">{String(row[cc] ?? "—")}</Text></Table.Td>)}</Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
          {data.total > 200 && <Text size="xs" c="dimmed" p="sm">Showing first 200 of {data.total} rows. Export for the full dataset.</Text>}
        </AppSection>
      )}
    </>
  );
}

function SavedTab() {
  const { show: toast } = useToast();
  const { data: saved = [] } = useSavedReports();
  const updateMut = useUpdateSavedReport();
  const deleteMut = useDeleteSavedReport();

  const toggleFav = async (r) => { try { await updateMut.mutateAsync({ id: r.id, isFavorite: !r.isFavorite }); } catch { toast("Failed", "error"); } };
  const del = async (r) => { try { await deleteMut.mutateAsync(r.id); toast("Removed", "success"); } catch { toast("Failed", "error"); } };

  if (!saved.length) return <AppEmptyState message="No saved reports yet." sub="Save a report from the Library to see it here." py={80} />;

  return (
    <AppSection noPadding title="My Reports" sub={`${saved.length} saved`}>
      <ScrollArea>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead><Table.Tr>{["", "Name", "Module", "Schedule", "Shared", "Owner", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
          <Table.Tbody>
            {saved.map((r) => (
              <Table.Tr key={r.id}>
                <Table.Td><ActionIcon variant="subtle" color="yellow" size="sm" onClick={() => toggleFav(r)} title="Favorite">{r.isFavorite ? <IconStarFilled size={15} /> : <IconStar size={15} />}</ActionIcon></Table.Td>
                <Table.Td><Text size="sm" fw={600}>{r.name}</Text></Table.Td>
                <Table.Td><Badge variant="light" radius="sm">{r.module}</Badge></Table.Td>
                <Table.Td>{r.schedule && r.schedule !== "None" ? <Badge variant="light" color="blue" radius="sm" leftSection={<IconClock size={11} />}>{r.schedule}</Badge> : <Text size="sm" c="dimmed">—</Text>}</Table.Td>
                <Table.Td>{r.isShared ? <Badge variant="light" color="green" radius="sm">Shared</Badge> : <Text size="sm" c="dimmed">Private</Text>}</Table.Td>
                <Table.Td><Text size="sm" c="dimmed">{r.ownerName || "—"}</Text></Table.Td>
                <Table.Td><ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => del(r)}><IconTrash size={13} /></ActionIcon></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </AppSection>
  );
}
