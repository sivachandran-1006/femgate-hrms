import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, TextInput, Select, Stack, Tabs,
  Menu, ActionIcon, Button, Box, Loader,
} from "@mantine/core";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconTicket, IconCircleDot, IconProgress, IconCircleCheck, IconLock, IconAlertTriangle,
  IconPercentage, IconSearch, IconFileExport, IconDownload, IconChartBar, IconList, IconBook,
  IconPlus, IconEye, IconPencil, IconTrash,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";

// ── Mock stubs for removed service functions ──
const exportTickets = async (...args) => { console.log("Mock: exportTickets"); return new Blob(["mock data"], { type: "text/csv" }); };


const CATEGORIES = ["IT Support", "HR Support", "Payroll Support", "Admin Support", "Facilities Support", "Asset Request", "Software Access Request", "Travel Request"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "Assigned", "InProgress", "Pending", "PendingUser", "Resolved", "Closed", "Cancelled"];
const STATUS_COLOR = { Open: "blue", Assigned: "cyan", InProgress: "yellow", Pending: "orange", PendingUser: "orange", Resolved: "green", Closed: "gray", Cancelled: "red" };
const PRIORITY_COLOR = { Low: "gray", Medium: "blue", High: "orange", Critical: "red" };
const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function HelpdeskManagement({ darkMode }) {
  const { show: toast } = useToast();
  const doExport = async (fmt) => {
    try {
      const blob = await exportTickets(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `tickets.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };
  return (
    <>
      <AppPageHeader title="Helpdesk / Ticket Management" sub="Support ticketing, SLA tracking and knowledge base"
        action={
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("excel")}>Excel (CSV)</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("csv")}>CSV</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("pdf")}>PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />
      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="tickets"   leftSection={<IconList size={15} />}>Tickets</Tabs.Tab>
          <Tabs.Tab value="knowledge" leftSection={<IconBook size={15} />}>Knowledge Base</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="tickets"><TicketsTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="knowledge"><KnowledgeTab toast={toast} /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function DashboardTab() {
  const { data: dash } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: an } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const c = dash?.cards || {};
  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} mb="lg">
        <AppStatCard icon={<IconTicket size={20} />} label="Total" value={c.total ?? 0} color="blue" />
        <AppStatCard icon={<IconCircleDot size={20} />} label="Open" value={c.open ?? 0} color="cyan" />
        <AppStatCard icon={<IconProgress size={20} />} label="In Progress" value={c.inProgress ?? 0} color="yellow" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Resolved" value={c.resolved ?? 0} color="green" />
        <AppStatCard icon={<IconLock size={20} />} label="Closed" value={c.closed ?? 0} color="gray" />
        <AppStatCard icon={<IconAlertTriangle size={20} />} label="Overdue" value={c.overdue ?? 0} color="red" />
        <AppStatCard icon={<IconPercentage size={20} />} label="SLA %" value={`${c.slaCompliance ?? 0}%`} color="teal" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <AppSection title="Tickets by Category">
          {an?.byCategory?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={an.byCategory}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No support requests available." py={60} />}
        </AppSection>
        <AppSection title="Tickets by Priority">
          {an?.byPriority?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={an.byPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{an.byPriority.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppSection title="Tickets by Department">
          {an?.byDepartment?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={an.byDepartment}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={50} />}
        </AppSection>
        <AppSection title="Resolution Trend">
          {an?.resolutionTrend?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={an.resolutionTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Resolved" /></LineChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={50} />}
        </AppSection>
      </SimpleGrid>
    </>
  );
}

const EMPTY_TICKET = { subject: "", category: "IT Support", priority: "Medium", description: "", department: "" };

function TicketsTab({ toast }) {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("subject");
  const [catF, setCatF] = useState("All");
  const [priF, setPriF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_TICKET);

  const filtered = useMemo(() => tickets.filter((t) => {
    const q = search.toLowerCase();
    const field = searchBy === "id" ? (t.ticketId || "") : searchBy === "agent" ? (t.assignedTo || "") : searchBy === "employee" ? (t.raisedBy || "") : t.subject;
    return (!q || field.toLowerCase().includes(q)) && (catF === "All" || t.category === catF) && (priF === "All" || t.priority === priF) && (statusF === "All" || t.status === statusF);
  }), [tickets, search, searchBy, catF, priF, statusF]);

  const save = async () => {
    if (!form.subject.trim() || !form.description.trim()) { toast("Subject and description are required", "error"); return; }
    try { await createMut.mutateAsync(form); toast("Ticket created", "success"); setOpen(false); setForm(EMPTY_TICKET); }
    catch (e) { toast(e?.response?.data?.message || "Failed to create ticket", "error"); }
  };
  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;
  const COLS = ["Ticket ID", "Subject", "Category", "Requested By", "Assigned To", "Priority", "Status", "Due Date", "Actions"];

  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" w={130} size="sm" value={searchBy} onChange={setSearchBy} data={[{ value: "subject", label: "Subject" }, { value: "id", label: "Ticket ID" }, { value: "agent", label: "Agent" }, { value: "employee", label: "Employee" }]} />
          <TextInput label="Search" placeholder="Search…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 150 }} />
          <Select label="Category" w={160} size="sm" data={["All", ...CATEGORIES]} value={catF} onChange={setCatF} />
          <Select label="Priority" w={120} size="sm" data={["All", ...PRIORITIES]} value={priF} onChange={setPriF} />
          <Select label="Status" w={140} size="sm" data={["All", ...STATUSES]} value={statusF} onChange={setStatusF} />
          <AppButton leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>Create Ticket</AppButton>
        </Group>
      </AppSection>
      <AppSection noPadding title="Tickets" sub={`${filtered.length} tickets`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{COLS.map((col) => <Table.Th key={col}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{col}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? <Table.Tr><Table.Td colSpan={COLS.length}><AppEmptyState message="No support requests available." action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>Create Ticket</AppButton>} /></Table.Td></Table.Tr>
                : filtered.map((t) => (
                  <Table.Tr key={t.id} style={{ cursor: "pointer" }}>
                    <Table.Td onClick={() => navigate(`/helpdesk/${t.id}`)}><Text size="sm" fw={600}>{t.ticketId}</Text></Table.Td>
                    <Table.Td><Text size="sm" lineClamp={1}>{t.subject}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{t.category}</Badge></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{t.raisedBy}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{t.assignedTo || "—"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={PRIORITY_COLOR[t.priority] || "gray"} radius="sm">{t.priority}</Badge></Table.Td>
                    <Table.Td><Badge variant="light" color={STATUS_COLOR[t.status] || "gray"} radius="sm">{t.status}</Badge></Table.Td>
                    <Table.Td><Text size="sm" c={t.slaBreached ? "red" : "dimmed"}>{fmtDate(t.dueDate)}</Text></Table.Td>
                    <Table.Td><ActionIcon variant="light" color="gray" size="sm" title="View" onClick={() => navigate(`/helpdesk/${t.id}`)}><IconEye size={13} /></ActionIcon></Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      <AppModal opened={open} onClose={() => setOpen(false)} title="Create Ticket" icon={<IconTicket size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <AppInput label="Subject *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput type="select" label="Category *" data={CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <AppInput type="select" label="Priority *" data={PRIORITIES} value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} />
            <AppInput label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </SimpleGrid>
          <AppInput type="textarea" label="Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending} onClick={save}>Submit</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}

const EMPTY_KB = { title: "", category: "FAQ", body: "", tags: "", status: "Published" };
function KnowledgeTab({ toast }) {
  const { data: articles = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_KB);
  const [view, setView] = useState(null);

  const openAdd = () => { setEditing(null); setForm(EMPTY_KB); setOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...EMPTY_KB, ...a }); setOpen(true); };
  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast("Title and body are required", "error"); return; }
    try { if (editing) { await updateMut.mutateAsync({ id: editing.id, ...form }); toast("Article updated", "success"); } else { await createMut.mutateAsync(form); toast("Article published", "success"); } setOpen(false); }
    catch { toast("Failed to save", "error"); }
  };
  const del = async (a) => { try { await deleteMut.mutateAsync(a.id); toast("Article deleted", "success"); } catch { toast("Failed", "error"); } };

  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Article</AppButton></Group>
      <AppSection noPadding title="Knowledge Base" sub={`${articles.length} articles`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Title", "Category", "Tags", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {articles.length === 0 ? <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No knowledge articles" action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Article</AppButton>} /></Table.Td></Table.Tr>
                : articles.map((a) => (
                  <Table.Tr key={a.id} style={{ cursor: "pointer" }}>
                    <Table.Td onClick={() => setView(a)}><Text size="sm" fw={600}>{a.title}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{a.category}</Badge></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{a.tags || "—"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={a.status === "Published" ? "green" : "gray"} radius="sm">{a.status}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" color="gray" size="sm" title="View" onClick={() => setView(a)}><IconEye size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="blue" size="sm" title="Edit" onClick={() => openEdit(a)}><IconPencil size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => del(a)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      <AppModal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit Article" : "Add Article"} icon={<IconBook size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <AppInput label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput type="select" label="Category" data={["FAQ", "How-To", "Policy", "Guide"]} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <AppInput label="Tags" placeholder="comma,separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </SimpleGrid>
          <AppInput type="textarea" label="Body *" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending || updateMut.isPending} onClick={save}>{editing ? "Save Changes" : "Publish"}</AppButton>
          </Group>
        </Stack>
      </AppModal>

      <AppModal opened={!!view} onClose={() => setView(null)} title={view?.title || ""} icon={<IconBook size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="sm">
          <Group gap="sm"><Badge variant="light" radius="sm">{view?.category}</Badge>{view?.tags && <Text size="xs" c="dimmed">{view.tags}</Text>}</Group>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{view?.body}</Text>
        </Stack>
      </AppModal>
    </>
  );
}
