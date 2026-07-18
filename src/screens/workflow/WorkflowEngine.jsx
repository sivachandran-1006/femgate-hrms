import { useState } from "react";
import { Box, Tabs, Button, Group, Text, Badge, Card, Grid, Stack, SimpleGrid, TextInput, Select, Modal, Table, ActionIcon, Tooltip, Loader, Center, Textarea, NumberInput, MultiSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconSearch, IconDownload, IconEye, IconPencil, IconTrash, IconChartLine, IconClipboard, IconCheck, IconX, IconClock, IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { LineChart as RechartLine, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart as RechartPie, Pie, Cell } from "recharts";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const MODULES = ["Leave", "Attendance", "Expense", "Asset", "Recruitment", "Onboarding", "Payroll", "Document"];
const WORKFLOW_TYPES = ["Leave Workflow", "Attendance Workflow", "Expense Workflow", "Asset Workflow", "Recruitment Workflow", "Onboarding Workflow", "Payroll Workflow", "Document Approval Workflow", "Custom Workflow"];
const APPROVER_ROLES = ["Manager", "Department Head", "HR", "Finance", "Admin"];
const COLORS = ["#228be6", "#40c057", "#fab005", "#fa5252", "#7950f2"];

const MOCK_DASHBOARD = {
  activeWorkflows: 14,
  pendingApprovals: 9,
  completedApprovals: 182,
  rejectedRequests: 11,
  escalatedRequests: 3,
  avgApprovalTime: "6.4 hrs",
};

const MOCK_WORKFLOWS = [
  { id: 1, name: "Standard Leave Approval", module: "Leave", workflowType: "Leave Workflow", status: "Active", steps: [{ approverRole: "Manager", escalationHours: 24 }, { approverRole: "HR", escalationHours: 48 }] },
  { id: 2, name: "Expense Reimbursement", module: "Expense", workflowType: "Expense Workflow", status: "Active", steps: [{ approverRole: "Manager", escalationHours: 24 }, { approverRole: "Finance", escalationHours: 24 }] },
  { id: 3, name: "Asset Request Approval", module: "Asset", workflowType: "Asset Workflow", status: "Active", steps: [{ approverRole: "Department Head", escalationHours: 24 }] },
  { id: 4, name: "New Hire Onboarding", module: "Onboarding", workflowType: "Onboarding Workflow", status: "Active", steps: [{ approverRole: "HR", escalationHours: 24 }, { approverRole: "Admin", escalationHours: 24 }] },
  { id: 5, name: "Payroll Adjustment Sign-off", module: "Payroll", workflowType: "Payroll Workflow", status: "Inactive", steps: [{ approverRole: "Finance", escalationHours: 12 }, { approverRole: "Admin", escalationHours: 24 }] },
  { id: 6, name: "Document Approval", module: "Document", workflowType: "Document Approval Workflow", status: "Active", steps: [{ approverRole: "Manager", escalationHours: 48 }] },
  { id: 7, name: "Recruitment Offer Approval", module: "Recruitment", workflowType: "Recruitment Workflow", status: "Active", steps: [{ approverRole: "Department Head", escalationHours: 24 }, { approverRole: "HR", escalationHours: 24 }] },
  { id: 8, name: "Attendance Correction Request", module: "Attendance", workflowType: "Attendance Workflow", status: "Inactive", steps: [{ approverRole: "Manager", escalationHours: 12 }] },
];

const MOCK_APPROVAL_INBOX = [
  { id: 101, requestId: "REQ-1001", requestedBy: "Ananya Sharma", workflowModule: "Leave", status: "Pending", createdAt: "2026-07-14T09:30:00Z" },
  { id: 102, requestId: "REQ-1002", requestedBy: "Rohit Verma", workflowModule: "Expense", status: "Pending", createdAt: "2026-07-15T11:10:00Z" },
  { id: 103, requestId: "REQ-1003", requestedBy: "Priya Nair", workflowModule: "Asset", status: "Approved", createdAt: "2026-07-10T14:05:00Z" },
  { id: 104, requestId: "REQ-1004", requestedBy: "Karthik Iyer", workflowModule: "Document", status: "Rejected", createdAt: "2026-07-09T08:45:00Z" },
  { id: 105, requestId: "REQ-1005", requestedBy: "Sneha Reddy", workflowModule: "Onboarding", status: "Pending", createdAt: "2026-07-16T10:20:00Z" },
  { id: 106, requestId: "REQ-1006", requestedBy: "Vikram Singh", workflowModule: "Payroll", status: "Escalated", createdAt: "2026-07-08T16:00:00Z" },
  { id: 107, requestId: "REQ-1007", requestedBy: "Meera Pillai", workflowModule: "Recruitment", status: "Pending", createdAt: "2026-07-17T09:00:00Z" },
];

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{typeof value === "string" ? value : value || 0}</Text>
    </Card>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: rawDash, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const dash = rawDash ?? MOCK_DASHBOARD;
  const { data: analytics } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!dash) return null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 3 }} spacing="md">
        <KpiCard label="Active Workflows" value={dash.activeWorkflows || 0} icon={IconClipboard} color="blue" />
        <KpiCard label="Pending Approvals" value={dash.pendingApprovals || 0} icon={IconClock} color="orange" />
        <KpiCard label="Completed" value={dash.completedApprovals || 0} icon={IconCheck} color="green" />
        <KpiCard label="Rejected" value={dash.rejectedRequests || 0} icon={IconX} color="red" />
        <KpiCard label="Escalated" value={dash.escalatedRequests || 0} icon={IconAlertCircle} color="yellow" />
        <KpiCard label="Avg Time" value={dash.avgApprovalTime} icon={IconClock} color="indigo" />
      </SimpleGrid>

      {analytics && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="md" p="md">
              <Text fw={600} mb="md">6-Month Approval Trend</Text>
              <ResponsiveContainer width="100%" height={250}>
                <RechartLine data={analytics.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Line type="monotone" dataKey="count" stroke="#228be6" strokeWidth={2} name="Approvals" />
                </RechartLine>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" p="md">
              <Text fw={600} mb="md">Workflow Usage</Text>
              <ResponsiveContainer width="100%" height={250}>
                <RechartPie data={analytics.workflowUsage || []} dataKey="_count" nameKey="workflowModule" cx="50%" cy="50%" outerRadius={80} label>
                  {(analytics.workflowUsage || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </RechartPie>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}

// ─── Workflows Tab ────────────────────────────────────────────────────────────
function WorkflowsTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({
    name: "",
    module: "",
    description: "",
    workflowType: "Custom",
    steps: [{ approverRole: "Manager", escalationHours: 24 }],
  });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  const { data: rawResult, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const result = rawResult?.workflows?.length ? rawResult : { workflows: MOCK_WORKFLOWS };
  const create = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const update = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const delete_ = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const handleSubmit = async () => {
    if (!form.name || !form.module || form.steps.length === 0) {
      show("Name, module, and steps required", "error");
      return;
    }
    try {
      if (selectedRecord?.id) {
        await update.mutateAsync([selectedRecord.id, form]);
        show("Workflow updated", "success");
      } else {
        await create.mutateAsync(form);
        show("Workflow created", "success");
      }
      setModalOpened(false);
      setSelectedRecord(null);
      setForm({ name: "", module: "", description: "", workflowType: "Custom", steps: [{ approverRole: "Manager", escalationHours: 24 }] });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleDeleteClick = (id) => { setDeleteId(id); openDeleteModal(); };

  const handleDeleteConfirm = async () => {
    try {
      await delete_.mutateAsync(deleteId);
      show("Workflow deleted", "success");
      closeDeleteModal();
      setDeleteId(null);
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const addStep = () => {
    setForm(p => ({
      ...p,
      steps: [...p.steps, { approverRole: "Manager", escalationHours: 24 }]
    }));
  };

  const removeStep = (idx) => {
    setForm(p => ({
      ...p,
      steps: p.steps.filter((_, i) => i !== idx)
    }));
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Module" data={["", ...MODULES]} value={module} onChange={setModule} w={150} clearable />
        </Group>
        <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => setModalOpened(true)}>New Workflow</Button>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.workflows || []).length === 0 ? (
        <AppEmptyState icon={<IconClipboard size={24} />} message="No workflows" sub="Create a workflow to get started." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Module</Table.Th>
              <Table.Th>Levels</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.workflows || []).map((w) => (
              <Table.Tr key={w.id}>
                <Table.Td><Text fw={500} size="sm">{w.name}</Text></Table.Td>
                <Table.Td><Text size="sm">{w.module}</Text></Table.Td>
                <Table.Td><Badge variant="light">{w.steps?.length || 0} levels</Badge></Table.Td>
                <Table.Td><Text size="sm">{w.workflowType}</Text></Table.Td>
                <Table.Td><Badge color={w.status === "Active" ? "green" : "gray"}>{w.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => { setSelectedRecord(w); setForm(w); setModalOpened(true); }}><IconPencil size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteClick(w.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpened} onClose={() => { setModalOpened(false); setSelectedRecord(null); }} title={selectedRecord ? "Edit Workflow" : "New Workflow"} size="lg">
        <Stack gap="sm">
          <TextInput label="Workflow Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Select label="Module" required data={MODULES} value={form.module} onChange={(v) => setForm((p) => ({ ...p, module: v }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
          <Select label="Workflow Type" data={WORKFLOW_TYPES} value={form.workflowType} onChange={(v) => setForm((p) => ({ ...p, workflowType: v }))} />

          <div>
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm">Approval Steps</Text>
              <Button size="xs" variant="light" onClick={addStep}>Add Step</Button>
            </Group>
            <Stack gap="xs">
              {form.steps.map((step, idx) => (
                <Card key={idx} withBorder p="xs" bg="gray.0">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">Level {idx + 1}</Text>
                    {form.steps.length > 1 && (
                      <ActionIcon size="xs" color="red" onClick={() => removeStep(idx)}><IconX size={12} /></ActionIcon>
                    )}
                  </Group>
                  <Group grow gap="xs">
                    <Select
                      label="Approver Role"
                      data={APPROVER_ROLES}
                      value={step.approverRole}
                      onChange={(v) => {
                        const newSteps = [...form.steps];
                        newSteps[idx].approverRole = v;
                        setForm(p => ({ ...p, steps: newSteps }));
                      }}
                      size="xs"
                    />
                    <NumberInput
                      label="Escalation (hours)"
                      value={step.escalationHours}
                      onChange={(v) => {
                        const newSteps = [...form.steps];
                        newSteps[idx].escalationHours = v;
                        setForm(p => ({ ...p, steps: newSteps }));
                      }}
                      min={1}
                      size="xs"
                    />
                  </Group>
                </Card>
              ))}
            </Stack>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => { setModalOpened(false); setSelectedRecord(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={create.isPending || update.isPending}>{selectedRecord ? "Update" : "Create"}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Workflow" size="sm" centered>
        <Text size="sm" mb="lg">Are you sure you want to delete this workflow? This cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={delete_.isPending}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}

// ─── Approval Inbox Tab ────────────────────────────────────────────────────────
function ApprovalInboxTab() {
  const { show } = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data: rawResult, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const result = rawResult?.approvals?.length ? rawResult : { approvals: MOCK_APPROVAL_INBOX };
  const approve = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const reject = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const escalate = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const handleApprove = async (id) => {
    try {
      await approve.mutateAsync([id, { comment: "Approved" }]);
      show("Request approved", "success");
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await reject.mutateAsync([id, { comment: "Rejected" }]);
      show("Request rejected", "success");
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleEscalate = async (id) => {
    try {
      await escalate.mutateAsync(id);
      show("Request escalated", "success");
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Select placeholder="Status" data={["", "Pending", "Approved", "Rejected", "Escalated"]} value={status} onChange={setStatus} w={150} clearable />

      {isLoading ? <Center h={200}><Loader /></Center> : (result.approvals || []).length === 0 ? (
        <AppEmptyState icon={<IconCheck size={24} />} message="No approvals" sub="Pending approval requests will appear here." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Request ID</Table.Th>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Module</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.approvals || []).map((a) => (
              <Table.Tr key={a.id}>
                <Table.Td><Text size="sm" fw={500}>{a.requestId}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.requestedBy}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.workflowModule}</Text></Table.Td>
                <Table.Td><Badge color={a.status === "Pending" ? "yellow" : a.status === "Approved" ? "green" : "red"}>{a.status}</Badge></Table.Td>
                <Table.Td><Text size="sm">{new Date(a.createdAt).toLocaleDateString()}</Text></Table.Td>
                <Table.Td>
                  {a.status === "Pending" && (
                    <Group gap={4}>
                      <Button size="xs" color="green" onClick={() => handleApprove(a.id)}>Approve</Button>
                      <Button size="xs" color="red" onClick={() => handleReject(a.id)}>Reject</Button>
                      <Button size="xs" color="orange" onClick={() => handleEscalate(a.id)}>Escalate</Button>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkflowEngine() {
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <AppPageHeader title="Workflow & Approval Engine" sub="Configure approval workflows and manage approvals" />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartLine size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="workflows" leftSection={<IconClipboard size={14} />}>Workflows</Tabs.Tab>
          <Tabs.Tab value="inbox" leftSection={<IconCheck size={14} />}>Approval Inbox</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="workflows"><WorkflowsTab /></Tabs.Panel>
        <Tabs.Panel value="inbox"><ApprovalInboxTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
