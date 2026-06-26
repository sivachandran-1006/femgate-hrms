import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Grid, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Loader, Center,
  Switch, Progress, Tooltip,
} from "@mantine/core";
import {
  IconShieldCheck, IconFileText, IconChecklist, IconClipboardCheck, IconCalendarEvent,
  IconAlertTriangle, IconCertificate, IconGavel, IconChartBar, IconPlus, IconTrash,
  IconCheck, IconX, IconEye, IconClipboardList, IconReportAnalytics,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import {
  useComplianceDashboard,
  usePolicies, useCreatePolicy, usePublishPolicy, useArchivePolicy,
  useAcknowledgements, useAcknowledgePolicy,
  useComplianceTasks, useCreateComplianceTask, useUpdateTaskStatus, useDeleteComplianceTask,
  useAudits, useCreateAudit, useUpdateAudit, useDeleteAudit,
  useStatutory, useCreateStatutory, useUpdateStatutory,
  useCertificates, useCreateCertificate, useDeleteCertificate,
  useComplianceCalendar,
} from "../../queries/useCompliance";

const POLICY_CATEGORIES = ["HR Policy", "Leave Policy", "Attendance Policy", "Payroll Policy", "IT Policy", "Information Security Policy", "Code of Conduct", "Travel Policy", "Expense Policy", "Remote Work Policy", "Health & Safety Policy", "Custom Policy"];
const POLICY_STATUS = ["Draft", "Pending Approval", "Published", "Archived", "Expired"];
const AUDIT_TYPES = ["Internal Audit", "External Audit", "ISO Audit", "Security Audit", "HR Audit", "Payroll Audit", "Compliance Audit"];
const STATUTORY_TYPES = ["PF", "ESI", "Professional Tax", "Labour Law", "Shops & Establishment", "Minimum Wage", "Income Tax", "Custom Compliance"];
const CERT_TYPES = ["ISO Certificate", "Labour License", "Business License", "Insurance Certificate", "Vendor Compliance"];
const PRIORITIES = ["Low", "Medium", "High"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

const STATUS_COLOR = {
  Draft: "gray", "Pending Approval": "orange", Published: "green", Archived: "dark", Expired: "red",
  Pending: "orange", Accepted: "green", Rejected: "red",
  Open: "blue", "In Progress": "orange", Completed: "green", Overdue: "red", Resolved: "green",
  Scheduled: "blue", Closed: "gray", Filed: "green", Active: "green", Expiring: "orange",
  Low: "gray", Medium: "blue", High: "orange", Critical: "red",
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Kpi({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ═══ Dashboard ═══
function DashboardTab() {
  const { data: d, isLoading } = useComplianceDashboard();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Kpi label="Total Policies" value={dash.totalPolicies} icon={IconFileText} color="blue" />
        <Kpi label="Active Policies" value={dash.activePolicies} icon={IconShieldCheck} color="green" />
        <Kpi label="Awaiting Acknowledgement" value={dash.pendingAcknowledgement} icon={IconClipboardCheck} color="orange" />
        <Kpi label="Compliance Tasks" value={dash.complianceTasks} icon={IconChecklist} color="grape" />
        <Kpi label="Upcoming Deadlines" value={dash.upcomingDeadlines} icon={IconCalendarEvent} color="cyan" />
        <Kpi label="Expired Policies" value={dash.expiredPolicies} icon={IconAlertTriangle} color="red" />
        <Kpi label="Audit Readiness" value={`${dash.auditReadinessScore ?? 0}%`} icon={IconClipboardCheck} color="teal" sub="readiness score" />
        <Kpi label="Compliance" value={`${dash.compliancePercentage ?? 0}%`} icon={IconChartBar} color="indigo" sub="acceptance rate" />
      </SimpleGrid>
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="xs">Overall Compliance</Text>
        <Progress value={dash.compliancePercentage ?? 0} size="lg" radius="xl" color={(dash.compliancePercentage ?? 0) >= 80 ? "green" : "orange"} />
        <Text size="xs" c="dimmed" mt={4}>{dash.compliancePercentage ?? 0}% of policy acknowledgements accepted</Text>
      </Card>
    </Stack>
  );
}

// ═══ Policies ═══
function PoliciesTab({ canManage }) {
  const { show } = useToast();
  const [filters, setFilters] = useState({ category: "All", status: "All", search: "" });
  const { data: policies = [], isLoading } = usePolicies(filters);
  const create = useCreatePolicy();
  const publish = usePublishPolicy();
  const archive = useArchivePolicy();
  const ack = useAcknowledgePolicy();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: POLICY_CATEGORIES[0], description: "", version: "1.0", effectiveDate: "", reviewDate: "", owner: "", department: "" });

  const submit = async () => {
    if (!form.name || !form.version || !form.effectiveDate) return show("Name, version and effective date are required", "error");
    if (form.reviewDate && new Date(form.reviewDate) <= new Date()) return show("Review date must be a future date", "error");
    try { await create.mutateAsync(form); show("Policy created", "success"); setOpen(false); setForm({ name: "", category: POLICY_CATEGORIES[0], description: "", version: "1.0", effectiveDate: "", reviewDate: "", owner: "", department: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap">
        <Group>
          <TextInput placeholder="Search policies..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} w={220} />
          <Select data={["All", ...POLICY_CATEGORIES]} value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })} w={180} />
          <Select data={["All", ...POLICY_STATUS]} value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} w={150} />
        </Group>
        {canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Policy</Button>}
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Policy Name</Table.Th><Table.Th>Category</Table.Th><Table.Th>Version</Table.Th><Table.Th>Effective</Table.Th><Table.Th>Review</Table.Th><Table.Th>Owner</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {policies.length === 0 && <Table.Tr><Table.Td colSpan={8}><AppEmptyState icon={<IconFileText size={24} />} message="No policies available" sub={canManage ? "No policies have been created. Create one to get started." : "No policies have been created."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Policy</Button>} /></Table.Td></Table.Tr>}
          {policies.map((p) => (
            <Table.Tr key={p.id}>
              <Table.Td fw={500}>{p.name}</Table.Td>
              <Table.Td><Badge variant="light" color="blue">{p.category}</Badge></Table.Td>
              <Table.Td>v{p.version}</Table.Td>
              <Table.Td><Text size="xs">{fmtDate(p.effectiveDate)}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(p.reviewDate)}</Text></Table.Td>
              <Table.Td><Text size="xs">{p.owner || "—"}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[p.status] || "gray"} variant="light">{p.status}</Badge></Table.Td>
              <Table.Td>
                <Group gap={4}>
                  {p.status === "Published" && <Tooltip label="Accept policy"><ActionIcon size="sm" variant="light" color="green" onClick={async () => { await ack.mutateAsync({ id: p.id, status: "Accepted" }); show("Policy accepted", "success"); }}><IconCheck size={13} /></ActionIcon></Tooltip>}
                  {canManage && p.status === "Draft" && <Tooltip label="Publish"><ActionIcon size="sm" variant="light" color="blue" onClick={async () => { await publish.mutateAsync(p.id); show("Published", "success"); }}><IconEye size={13} /></ActionIcon></Tooltip>}
                  {canManage && p.status !== "Archived" && <Tooltip label="Archive"><ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { await archive.mutateAsync(p.id); show("Archived", "success"); }}><IconTrash size={13} /></ActionIcon></Tooltip>}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Create Policy" size="lg">
        <Stack gap="sm">
          <TextInput label="Policy Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Group grow>
            <Select label="Category" data={POLICY_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <TextInput label="Version" required value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          </Group>
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group grow>
            <TextInput type="date" label="Effective Date" required value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
            <TextInput type="date" label="Review Date (future)" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
          </Group>
          <Group grow>
            <TextInput label="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            <TextInput label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Acknowledgements ═══
function AcknowledgementsTab() {
  const { data: acks = [], isLoading } = useAcknowledgements();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Table striped highlightOnHover>
      <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Policy</Table.Th><Table.Th>Department</Table.Th><Table.Th>Acknowledged</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
      <Table.Tbody>
        {acks.length === 0 && <Table.Tr><Table.Td colSpan={5}><AppEmptyState icon={<IconClipboardCheck size={24} />} message="No acknowledgements yet" sub="Employee policy acknowledgements will appear here." /></Table.Td></Table.Tr>}
        {acks.map((a) => (
          <Table.Tr key={a.id}>
            <Table.Td fw={500}>{a.employee}</Table.Td>
            <Table.Td>{a.policy?.name || "—"}</Table.Td>
            <Table.Td><Text size="xs">{a.department || "—"}</Text></Table.Td>
            <Table.Td><Text size="xs">{fmtDate(a.acknowledgedAt)}</Text></Table.Td>
            <Table.Td><Badge color={STATUS_COLOR[a.status] || "gray"} variant="light">{a.status}</Badge></Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

// ═══ Tasks ═══
function TasksTab({ canManage }) {
  const { show } = useToast();
  const { data: tasks = [], isLoading } = useComplianceTasks();
  const create = useCreateComplianceTask();
  const updateStatus = useUpdateTaskStatus();
  const del = useDeleteComplianceTask();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", owner: "", dueDate: "", priority: "Medium", recurring: false });

  const submit = async () => {
    if (!form.title) return show("Title is required", "error");
    try { await create.mutateAsync(form); show("Task created", "success"); setOpen(false); setForm({ title: "", description: "", owner: "", dueDate: "", priority: "Medium", recurring: false }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Task</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Task</Table.Th><Table.Th>Owner</Table.Th><Table.Th>Due</Table.Th><Table.Th>Priority</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {tasks.length === 0 && <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<IconChecklist size={24} />} message="No compliance tasks" sub={canManage ? "Create a task to track compliance work." : "Tasks assigned will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Task</Button>} /></Table.Td></Table.Tr>}
          {tasks.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td fw={500}>{t.title}{t.recurring && <Badge size="xs" ml={6} variant="light">Recurring</Badge>}</Table.Td>
              <Table.Td><Text size="xs">{t.owner || "—"}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(t.dueDate)}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[t.priority] || "gray"} variant="light">{t.priority}</Badge></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[t.status] || "gray"} variant="light">{t.status}</Badge></Table.Td>
              <Table.Td>{canManage && <Group gap={4}>
                {t.status !== "Completed" && <Tooltip label="Mark complete"><ActionIcon size="sm" variant="light" color="green" onClick={async () => { await updateStatus.mutateAsync({ id: t.id, status: "Completed" }); show("Completed", "success"); }}><IconCheck size={13} /></ActionIcon></Tooltip>}
                <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { await del.mutateAsync(t.id); show("Deleted", "success"); }}><IconTrash size={13} /></ActionIcon>
              </Group>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Create Compliance Task" size="md">
        <Stack gap="sm">
          <TextInput label="Task Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group grow>
            <TextInput label="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            <TextInput type="date" label="Due Date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Group>
          <Select label="Priority" data={PRIORITIES} value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} />
          <Switch label="Recurring task" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.currentTarget.checked })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Audits ═══
function AuditsTab({ canManage }) {
  const { show } = useToast();
  const { data: audits = [], isLoading } = useAudits();
  const create = useCreateAudit();
  const update = useUpdateAudit();
  const del = useDeleteAudit();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: AUDIT_TYPES[0], auditor: "", auditDate: "", findings: "" });

  const submit = async () => {
    if (!form.name) return show("Audit name is required", "error");
    try { await create.mutateAsync(form); show("Audit scheduled", "success"); setOpen(false); setForm({ name: "", type: AUDIT_TYPES[0], auditor: "", auditDate: "", findings: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Schedule Audit</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {audits.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconGavel size={24} />} message="No audits yet" sub={canManage ? "Schedule an internal or external audit." : "Audits will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Schedule Audit</Button>} /></Box>}
        {audits.map((a) => (
          <Card key={a.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs"><Badge color="grape" variant="light">{a.type}</Badge><Badge color={STATUS_COLOR[a.status] || "gray"} variant="light">{a.status}</Badge></Group>
            <Text fw={700}>{a.name}</Text>
            <Text size="xs" c="dimmed" mt={4}>Auditor: {a.auditor || "—"} · {fmtDate(a.auditDate)}</Text>
            {a.findings && <Text size="xs" mt={4}>Findings: {a.findings}</Text>}
            {canManage && (
              <Group gap="xs" mt="sm">
                {a.status !== "Completed" && <Button size="compact-xs" variant="light" color="green" onClick={async () => { await update.mutateAsync({ id: a.id, status: "Completed" }); show("Marked completed", "success"); }}>Complete</Button>}
                <Button size="compact-xs" variant="subtle" color="red" onClick={async () => { await del.mutateAsync(a.id); show("Deleted", "success"); }}>Delete</Button>
              </Group>
            )}
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Schedule Audit" size="md">
        <Stack gap="sm">
          <TextInput label="Audit Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Audit Type" data={AUDIT_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Group grow>
            <TextInput label="Auditor" value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} />
            <TextInput type="date" label="Audit Date" value={form.auditDate} onChange={(e) => setForm({ ...form, auditDate: e.target.value })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Schedule</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Statutory ═══
function StatutoryTab({ canManage }) {
  const { show } = useToast();
  const { data: items = [], isLoading } = useStatutory();
  const create = useCreateStatutory();
  const update = useUpdateStatutory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: STATUTORY_TYPES[0], description: "", dueDate: "", reference: "" });

  const submit = async () => {
    try { await create.mutateAsync(form); show("Added", "success"); setOpen(false); setForm({ type: STATUTORY_TYPES[0], description: "", dueDate: "", reference: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Compliance</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Type</Table.Th><Table.Th>Description</Table.Th><Table.Th>Due</Table.Th><Table.Th>Reference</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {items.length === 0 && <Table.Tr><Table.Td colSpan={5}><AppEmptyState icon={<IconGavel size={24} />} message="No statutory compliance tracked" sub={canManage ? "Add PF, ESI, tax filings and other statutory items." : "Statutory compliance items will appear here."} /></Table.Td></Table.Tr>}
          {items.map((s) => (
            <Table.Tr key={s.id}>
              <Table.Td fw={500}>{s.type}</Table.Td>
              <Table.Td><Text size="xs">{s.description || "—"}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(s.dueDate)}</Text></Table.Td>
              <Table.Td><Text size="xs">{s.reference || "—"}</Text></Table.Td>
              <Table.Td>
                {canManage ? <Select size="xs" w={120} data={["Pending", "Filed", "Overdue"]} value={s.status} onChange={async (v) => { await update.mutateAsync({ id: s.id, status: v }); show("Updated", "success"); }} />
                  : <Badge color={STATUS_COLOR[s.status] || "gray"} variant="light">{s.status}</Badge>}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Add Statutory Compliance" size="md">
        <Stack gap="sm">
          <Select label="Type" data={STATUTORY_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group grow>
            <TextInput type="date" label="Due Date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <TextInput label="Reference No." value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Add</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Certificates ═══
function CertificatesTab({ canManage }) {
  const { show } = useToast();
  const { data: certs = [], isLoading } = useCertificates();
  const create = useCreateCertificate();
  const del = useDeleteCertificate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: CERT_TYPES[0], issuer: "", issueDate: "", expiryDate: "" });

  const submit = async () => {
    if (!form.name) return show("Certificate name is required", "error");
    try { await create.mutateAsync(form); show("Added", "success"); setOpen(false); setForm({ name: "", type: CERT_TYPES[0], issuer: "", issueDate: "", expiryDate: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Certificate</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {certs.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconCertificate size={24} />} message="No certificates tracked" sub={canManage ? "Add ISO, license, or insurance certificates to track renewals." : "Certificates will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Certificate</Button>} /></Box>}
        {certs.map((c) => (
          <Card key={c.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs"><Badge color="teal" variant="light">{c.type}</Badge><Badge color={STATUS_COLOR[c.status] || "gray"} variant="light">{c.status}</Badge></Group>
            <Text fw={700}>{c.name}</Text>
            <Text size="xs" c="dimmed" mt={4}>Issuer: {c.issuer || "—"}</Text>
            <Group justify="space-between" mt="sm"><Text size="xs" c="dimmed">Expires {fmtDate(c.expiryDate)}</Text>
              {canManage && <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { await del.mutateAsync(c.id); show("Deleted", "success"); }}><IconTrash size={13} /></ActionIcon>}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Add Certificate" size="md">
        <Stack gap="sm">
          <TextInput label="Certificate Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Type" data={CERT_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <TextInput label="Issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
          <Group grow>
            <TextInput type="date" label="Issue Date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            <TextInput type="date" label="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Add</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Calendar ═══
function CalendarTab() {
  const { data: events = [], isLoading } = useComplianceCalendar();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const typeColor = { "Policy Review": "blue", "Compliance Deadline": "orange", "Certificate Renewal": "teal", Audit: "grape" };
  return (
    <Stack gap="sm">
      {events.length === 0 && <AppEmptyState icon={<IconCalendarEvent size={24} />} message="No upcoming compliance dates" sub="Policy reviews, deadlines, renewals and audits will appear here." />}
      {events.map((e, i) => (
        <Card key={i} withBorder radius="md" p="sm">
          <Group justify="space-between">
            <Group gap="sm"><Badge color={typeColor[e.type] || "gray"} variant="light">{e.type}</Badge><Text size="sm" fw={500}>{e.title}</Text></Group>
            <Text size="sm" c="dimmed">{fmtDate(e.date)}</Text>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

// ═══ Main ═══
export default function ComplianceManagement() {
  const { user } = useAuth();
  const canManage = ["SUPER_ADMIN", "ADMIN", "HR", "HR_MANAGER", "IT_ADMIN"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={700} size="lg">Compliance & Policy Management</Text>
          <Text size="xs" c="dimmed">Policies · Acknowledgements · Audits · Statutory · Certificates</Text>
        </Box>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="policies" leftSection={<IconFileText size={14} />}>Policies</Tabs.Tab>
          <Tabs.Tab value="acks" leftSection={<IconClipboardCheck size={14} />}>Acknowledgements</Tabs.Tab>
          <Tabs.Tab value="tasks" leftSection={<IconChecklist size={14} />}>Tasks</Tabs.Tab>
          <Tabs.Tab value="audits" leftSection={<IconGavel size={14} />}>Audits</Tabs.Tab>
          <Tabs.Tab value="statutory" leftSection={<IconClipboardList size={14} />}>Statutory</Tabs.Tab>
          <Tabs.Tab value="certificates" leftSection={<IconCertificate size={14} />}>Certificates</Tabs.Tab>
          <Tabs.Tab value="calendar" leftSection={<IconCalendarEvent size={14} />}>Calendar</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="policies"><PoliciesTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="acks"><AcknowledgementsTab /></Tabs.Panel>
        <Tabs.Panel value="tasks"><TasksTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="audits"><AuditsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="statutory"><StatutoryTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="certificates"><CertificatesTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="calendar"><CalendarTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
