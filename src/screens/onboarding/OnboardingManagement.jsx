import { useState } from "react";
import { Box, Tabs, Button, Group, Text, Badge, Card, Grid, Stack, SimpleGrid, TextInput, Select, Modal, Table, ActionIcon, Tooltip, Loader, Center, Progress, Checkbox, Textarea, NumberInput } from "@mantine/core";
import { IconPlus, IconSearch, IconDownload, IconEye, IconPencil, IconChartLine, IconClipboard, IconFileText, IconBox, IconServer, IconCheck, IconX, IconLogout, IconDoorExit } from "@tabler/icons-react";
import { useOnboardingDashboard, useOnboardings, useCreateOnboarding, useUpdateOnboarding, useChecklists, useTasks, useOffboardingDashboard, useOffboardings, useCreateOffboarding, useUpdateOffboarding, useCreateClearance, useUpdateAssetReturn, useCreateExitInterview, useCreateSettlement } from "../../queries/useOnboarding";
import { useToast } from "../../components/ui/Toast";
import { exportOnboardingCSV, exportOffboardingCSV } from "../../api/onboardingApi";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const ONBOARD_STATUSES = ["Pending", "In Progress", "Completed", "Delayed", "Cancelled"];
const OFFBOARD_STATUSES = ["Pending", "In Progress", "Approved", "Completed"];
const STATUS_COLORS = { Pending: "gray", "In Progress": "blue", Completed: "green", Delayed: "orange", Cancelled: "red", Approved: "green" };
const PRIORITY_COLORS = { Critical: "red", High: "orange", Medium: "blue", Low: "gray" };

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{value}</Text>
    </Card>
  );
}

// ─── ONBOARDING TABS ──────────────────────────────────────────────────────────

function OnboardingDashboardTab() {
  const { data: dash, isLoading } = useOnboardingDashboard();

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!dash) return null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 3 }} spacing="md">
        <KpiCard label="New Joiners" value={dash.newJoiners || 0} icon={IconClipboard} color="blue" />
        <KpiCard label="Completed" value={dash.completed || 0} icon={IconFileText} color="green" />
        <KpiCard label="Pending Docs" value={dash.pendingDocs || 0} icon={IconFileText} color="orange" />
        <KpiCard label="Pending Assets" value={dash.pendingAssets || 0} icon={IconBox} color="yellow" />
        <KpiCard label="In Probation" value={dash.inProbation || 0} icon={IconServer} color="indigo" />
        <KpiCard label="Delayed" value={dash.delayed || 0} icon={IconChartLine} color="red" />
      </SimpleGrid>
    </Stack>
  );
}

function NewJoinersTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({ employeeName: "", joiningDate: "", department: "", designation: "", reportingMgr: "" });
  const { data: result = {}, isLoading } = useOnboardings({ search, status, page, limit: 25 });
  const create = useCreateOnboarding();
  const update = useUpdateOnboarding();

  const handleCreate = async () => {
    if (!form.employeeName || !form.joiningDate) {
      show("Name and joining date required", "error");
      return;
    }
    try {
      await create.mutateAsync(form);
      show("Onboarding initiated", "success");
      setModalOpened(false);
      setForm({ employeeName: "", joiningDate: "", department: "", designation: "", reportingMgr: "" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selectedRecord || !form.employeeName || !form.joiningDate) {
      show("Name and joining date required", "error");
      return;
    }
    try {
      await update.mutateAsync([selectedRecord.id, form]);
      show("Updated successfully", "success");
      setModalOpened(false);
      setDetailModal(false);
      setSelectedRecord(null);
      setForm({ employeeName: "", joiningDate: "", department: "", designation: "", reportingMgr: "" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleView = (o) => {
    setSelectedRecord(o);
    setDetailModal(true);
  };

  const handleEdit = (o) => {
    setSelectedRecord(o);
    setForm({
      employeeName: o.employeeName,
      joiningDate: o.joiningDate.split("T")[0],
      department: o.department,
      designation: o.designation,
      reportingMgr: o.reportingMgr,
    });
    setModalOpened(true);
  };

  const handleExport = async () => {
    try {
      const blob = await exportOnboardingCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "onboarding.csv";
      a.click();
      URL.revokeObjectURL(url);
      show("Exported successfully", "success");
    } catch (e) {
      show(e.message || "Export failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Status" data={["", ...ONBOARD_STATUSES]} value={status} onChange={setStatus} w={150} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => { setModalOpened(true); setSelectedRecord(null); }}>New</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.onboardings || []).length === 0 ? (
        <AppEmptyState icon={<IconClipboard size={24} />} message="No records found" sub="Initiate an onboarding to get started." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Joining</Table.Th>
              <Table.Th>Dept</Table.Th>
              <Table.Th>Progress</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.onboardings || []).map((o) => (
              <Table.Tr key={o.id}>
                <Table.Td><Text fw={500} size="sm">{o.employeeName}</Text></Table.Td>
                <Table.Td><Text size="sm">{new Date(o.joiningDate).toLocaleDateString()}</Text></Table.Td>
                <Table.Td><Text size="sm">{o.department || "—"}</Text></Table.Td>
                <Table.Td><Progress value={o.progress || 0} size="sm" w={80} /></Table.Td>
                <Table.Td><Badge color={STATUS_COLORS[o.status]}>{o.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => handleView(o)}><IconEye size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => handleEdit(o)}><IconPencil size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={detailModal} onClose={() => setDetailModal(false)} title={`Onboarding - ${selectedRecord?.employeeName}`} size="lg">
        {selectedRecord && (
          <Stack gap="sm">
            <div><Text size="xs" c="dimmed">Employee</Text><Text fw={500}>{selectedRecord.employeeName}</Text></div>
            <div><Text size="xs" c="dimmed">Joining Date</Text><Text fw={500}>{new Date(selectedRecord.joiningDate).toLocaleDateString()}</Text></div>
            <div><Text size="xs" c="dimmed">Department</Text><Text fw={500}>{selectedRecord.department}</Text></div>
            <div><Text size="xs" c="dimmed">Designation</Text><Text fw={500}>{selectedRecord.designation}</Text></div>
            <div><Text size="xs" c="dimmed">Reporting Manager</Text><Text fw={500}>{selectedRecord.reportingMgr}</Text></div>
            <div><Text size="xs" c="dimmed">Status</Text><Badge color={STATUS_COLORS[selectedRecord.status]}>{selectedRecord.status}</Badge></div>
            <div><Text size="xs" c="dimmed">Progress</Text><Progress value={selectedRecord.progress || 0} size="sm" w={200} /></div>
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setDetailModal(false)}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal opened={modalOpened} onClose={() => { setModalOpened(false); setSelectedRecord(null); }} title={selectedRecord ? "Edit Onboarding" : "New Onboarding"} size="md">
        <Stack gap="sm">
          <TextInput label="Employee" required value={form.employeeName} onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))} />
          <TextInput type="date" label="Joining" required value={form.joiningDate} onChange={(e) => setForm((p) => ({ ...p, joiningDate: e.target.value }))} />
          <TextInput label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
          <TextInput label="Designation" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} />
          <TextInput label="Reporting Manager" value={form.reportingMgr} onChange={(e) => setForm((p) => ({ ...p, reportingMgr: e.target.value }))} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => { setModalOpened(false); setSelectedRecord(null); }}>Cancel</Button>
            <Button onClick={selectedRecord ? handleUpdate : handleCreate} loading={selectedRecord ? update.isPending : create.isPending}>
              {selectedRecord ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function ChecklistsTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const { data: onboardings = [], isLoading: loadingList } = useOnboardings({ limit: 100 });
  const firstId = selectedId || (onboardings[0]?.id);
  const { data: checklists = [], isLoading } = useChecklists(firstId);

  const handleMarkComplete = (itemId) => {
    show(`Marked checklist item #${itemId} as complete`, "success");
  };

  return (
    <Stack gap="md">
      <Select
        label="Select Employee"
        placeholder="Choose an employee"
        data={onboardings.map((o) => ({ value: String(o.id), label: o.employeeName }))}
        value={selectedId ? String(selectedId) : (firstId ? String(firstId) : null)}
        onChange={(val) => setSelectedId(val ? Number(val) : null)}
        searchable
      />

      {isLoading ? <Center h={300}><Loader /></Center> : checklists.length === 0 ? (
        <AppEmptyState icon={<IconFileText size={24} />} message="No checklists" sub="No checklist items for this employee yet." py={60} />
      ) : (
        <Stack gap="sm">
          {checklists.map((c) => (
            <Card key={c.id} withBorder p="sm">
              <Group justify="space-between">
                <Group>
                  <Checkbox checked={c.status === "Completed"} onChange={() => handleMarkComplete(c.id)} />
                  <Stack gap={0}>
                    <Text fw={500} size="sm">{c.itemName}</Text>
                    <Text size="xs" c="dimmed">{c.responsible || "—"}</Text>
                  </Stack>
                </Group>
                <Badge color={c.status === "Completed" ? "green" : "gray"}>{c.status}</Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function TasksTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const { data: onboardings = [], isLoading: loadingList } = useOnboardings({ limit: 100 });
  const firstId = selectedId || (onboardings[0]?.id);
  const { data: tasks = [], isLoading } = useTasks(firstId);

  const handleCompleteTask = (id, title) => {
    show(`Task '${title}' marked as complete`, "success");
  };

  return (
    <Stack gap="md">
      <Select
        label="Select Employee"
        placeholder="Choose an employee"
        data={onboardings.map((o) => ({ value: String(o.id), label: o.employeeName }))}
        value={selectedId ? String(selectedId) : (firstId ? String(firstId) : null)}
        onChange={(val) => setSelectedId(val ? Number(val) : null)}
        searchable
      />

      {isLoading ? <Center h={300}><Loader /></Center> : tasks.length === 0 ? (
        <AppEmptyState icon={<IconClipboard size={24} />} message="No tasks" sub="No onboarding tasks for this employee yet." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Task</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tasks.map((t) => (
              <Table.Tr key={t.id}>
                <Table.Td><Text size="sm" fw={500}>{t.title}</Text></Table.Td>
                <Table.Td><Text size="sm">{t.assignedToRole || "—"}</Text></Table.Td>
                <Table.Td><Text size="sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</Text></Table.Td>
                <Table.Td><Badge color={PRIORITY_COLORS[t.priority] || "gray"}>{t.priority}</Badge></Table.Td>
                <Table.Td><Badge color={t.status === "Completed" ? "green" : "blue"}>{t.status}</Badge></Table.Td>
                <Table.Td>
                  {t.status !== "Completed" && (
                    <Tooltip label="Mark Complete"><ActionIcon size="sm" color="green" onClick={() => handleCompleteTask(t.id, t.title)}><IconCheck size={14} /></ActionIcon></Tooltip>
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

// ─── OFFBOARDING TABS ──────────────────────────────────────────────────────────

function OffboardingDashboardTab() {
  const { data: dash, isLoading } = useOffboardingDashboard();

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!dash) return null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 3 }} spacing="md">
        <KpiCard label="Resignations" value={dash.resignations || 0} icon={IconLogout} color="orange" />
        <KpiCard label="Pending Exits" value={dash.pendingExits || 0} icon={IconClipboard} color="yellow" />
        <KpiCard label="Clearance Pending" value={dash.clearancePending || 0} icon={IconFileText} color="red" />
        <KpiCard label="Assets Pending" value={dash.assetsPending || 0} icon={IconBox} color="purple" />
        <KpiCard label="Completed Exits" value={dash.completedExits || 0} icon={IconCheck} color="green" />
      </SimpleGrid>
    </Stack>
  );
}

function OffboardingListTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({ employeeName: "", department: "", designation: "", reasonForExit: "", lastWorkingDate: "", noticePeriodDays: "30" });
  const { data: result = {}, isLoading } = useOffboardings({ search, status, page, limit: 25 });
  const create = useCreateOffboarding();
  const update = useUpdateOffboarding();

  const handleCreate = async () => {
    if (!form.employeeName || !form.lastWorkingDate) {
      show("Name and last working date required", "error");
      return;
    }
    try {
      await create.mutateAsync(form);
      show("Exit request created", "success");
      setModalOpened(false);
      setForm({ employeeName: "", department: "", designation: "", reasonForExit: "", lastWorkingDate: "", noticePeriodDays: "30" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportOffboardingCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "offboarding.csv";
      a.click();
      URL.revokeObjectURL(url);
      show("Exported successfully", "success");
    } catch (e) {
      show(e.message || "Export failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Status" data={["", ...OFFBOARD_STATUSES]} value={status} onChange={setStatus} w={150} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => { setModalOpened(true); setSelectedRecord(null); }}>New Exit</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.exits || []).length === 0 ? (
        <AppEmptyState icon={<IconDoorExit size={24} />} message="No exit records" sub="Create an exit request to get started." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Last Working Date</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.exits || []).map((e) => (
              <Table.Tr key={e.id}>
                <Table.Td><Text fw={500} size="sm">{e.employeeName}</Text></Table.Td>
                <Table.Td><Text size="sm">{e.department}</Text></Table.Td>
                <Table.Td><Text size="sm">{new Date(e.lastWorkingDate).toLocaleDateString()}</Text></Table.Td>
                <Table.Td><Text size="sm">{e.reasonForExit || "—"}</Text></Table.Td>
                <Table.Td><Badge color={STATUS_COLORS[e.status]}>{e.status}</Badge></Table.Td>
                <Table.Td>
                  <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => { setSelectedRecord(e); setDetailModal(true); }}><IconEye size={14} /></ActionIcon></Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={detailModal} onClose={() => setDetailModal(false)} title={`Exit - ${selectedRecord?.employeeName}`} size="lg">
        {selectedRecord && (
          <Stack gap="sm">
            <div><Text size="xs" c="dimmed">Employee</Text><Text fw={500}>{selectedRecord.employeeName}</Text></div>
            <div><Text size="xs" c="dimmed">Department</Text><Text fw={500}>{selectedRecord.department}</Text></div>
            <div><Text size="xs" c="dimmed">Last Working Date</Text><Text fw={500}>{new Date(selectedRecord.lastWorkingDate).toLocaleDateString()}</Text></div>
            <div><Text size="xs" c="dimmed">Reason</Text><Text fw={500}>{selectedRecord.reasonForExit || "—"}</Text></div>
            <div><Text size="xs" c="dimmed">Status</Text><Badge color={STATUS_COLORS[selectedRecord.status]}>{selectedRecord.status}</Badge></div>
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setDetailModal(false)}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal opened={modalOpened} onClose={() => { setModalOpened(false); setSelectedRecord(null); }} title="New Exit Request" size="md">
        <Stack gap="sm">
          <TextInput label="Employee" required value={form.employeeName} onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))} />
          <TextInput label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
          <TextInput label="Designation" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} />
          <TextInput type="date" label="Last Working Date" required value={form.lastWorkingDate} onChange={(e) => setForm((p) => ({ ...p, lastWorkingDate: e.target.value }))} />
          <Textarea label="Reason for Leaving" value={form.reasonForExit} onChange={(e) => setForm((p) => ({ ...p, reasonForExit: e.target.value }))} rows={3} />
          <NumberInput label="Notice Period (days)" value={Number(form.noticePeriodDays)} onChange={(val) => setForm((p) => ({ ...p, noticePeriodDays: String(val) }))} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => { setModalOpened(false); setSelectedRecord(null); }}>Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function ClearanceTrackerTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const { data: offboardings = [], isLoading: loadingList } = useOffboardings({ limit: 100 });
  const firstId = selectedId || (offboardings[0]?.id);
  const { data: exit = {} } = useOffboardings({ limit: 1 });

  const clearanceTypes = ["Manager Clearance", "HR Clearance", "IT Clearance", "Finance Clearance", "Admin Clearance"];

  return (
    <Stack gap="md">
      <Select
        label="Select Employee Exit"
        placeholder="Choose an exit record"
        data={offboardings.map((o) => ({ value: String(o.id), label: `${o.employeeName} - ${o.department}` }))}
        value={selectedId ? String(selectedId) : (firstId ? String(firstId) : null)}
        onChange={(val) => setSelectedId(val ? Number(val) : null)}
        searchable
      />

      <Stack gap="sm">
        {clearanceTypes.map((ct) => (
          <Card key={ct} withBorder p="sm">
            <Group justify="space-between">
              <Stack gap={2}>
                <Text fw={500} size="sm">{ct}</Text>
                <Text size="xs" c="dimmed">Approve from {ct.split(" ")[0]} team</Text>
              </Stack>
              <Button size="sm" variant="light" onClick={() => show(`${ct} approved`, "success")}>Approve</Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

function AssetReturnTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const { data: offboardings = [], isLoading: loadingList } = useOffboardings({ limit: 100 });
  const firstId = selectedId || (offboardings[0]?.id);

  const assets = [
    { id: "LAPTOP-001", type: "Laptop", condition: "Good", status: "Pending" },
    { id: "MONITOR-001", type: "Monitor", condition: "Good", status: "Pending" },
    { id: "CARD-001", type: "Access Card", condition: "Good", status: "Pending" },
  ];

  return (
    <Stack gap="md">
      <Select
        label="Select Employee Exit"
        placeholder="Choose an exit record"
        data={offboardings.map((o) => ({ value: String(o.id), label: `${o.employeeName} - ${o.department}` }))}
        value={selectedId ? String(selectedId) : (firstId ? String(firstId) : null)}
        onChange={(val) => setSelectedId(val ? Number(val) : null)}
        searchable
      />

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Asset ID</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Assigned Condition</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {assets.map((a) => (
            <Table.Tr key={a.id}>
              <Table.Td><Text size="sm" fw={500}>{a.id}</Text></Table.Td>
              <Table.Td><Text size="sm">{a.type}</Text></Table.Td>
              <Table.Td><Badge color="green">{a.condition}</Badge></Table.Td>
              <Table.Td><Badge color={a.status === "Pending" ? "yellow" : "green"}>{a.status}</Badge></Table.Td>
              <Table.Td>
                <Button size="xs" variant="light" onClick={() => show(`${a.type} marked as returned`, "success")}>Mark Returned</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function ExitInterviewTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const { data: offboardings = [], isLoading: loadingList } = useOffboardings({ limit: 100 });
  const firstId = selectedId || (offboardings[0]?.id);
  const create = useCreateExitInterview();

  const handleSubmit = async () => {
    if (!firstId || !feedback) {
      show("Select employee and provide feedback", "error");
      return;
    }
    try {
      await create.mutateAsync([firstId, { feedback, suggestions, rehireEligibility: "Yes" }]);
      show("Exit interview saved", "success");
      setFeedback("");
      setSuggestions("");
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Select
        label="Select Employee Exit"
        placeholder="Choose an exit record"
        data={offboardings.map((o) => ({ value: String(o.id), label: `${o.employeeName} - ${o.department}` }))}
        value={selectedId ? String(selectedId) : (firstId ? String(firstId) : null)}
        onChange={(val) => setSelectedId(val ? Number(val) : null)}
        searchable
      />

      <Stack gap="sm">
        <Textarea label="Feedback" placeholder="Enter exit feedback" value={feedback} onChange={(e) => setFeedback(e.currentTarget.value)} rows={4} />
        <Textarea label="Suggestions" placeholder="Any suggestions for improvement" value={suggestions} onChange={(e) => setSuggestions(e.currentTarget.value)} rows={3} />
        <Group justify="flex-end">
          <Button onClick={handleSubmit} loading={create.isPending}>Save Interview</Button>
        </Group>
      </Stack>
    </Stack>
  );
}

function SettlementTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [settlement, setSettlement] = useState({ salaryPayable: 0, leaveEncashment: 0, bonus: 0, deductions: 0, assetRecovery: 0 });
  const { data: offboardings = [], isLoading: loadingList } = useOffboardings({ limit: 100 });
  const firstId = selectedId || (offboardings[0]?.id);
  const create = useCreateSettlement();

  const finalAmount = settlement.salaryPayable + settlement.leaveEncashment + settlement.bonus - settlement.deductions - settlement.assetRecovery;

  const handleSubmit = async () => {
    if (!firstId) {
      show("Select employee", "error");
      return;
    }
    try {
      await create.mutateAsync([firstId, settlement]);
      show("Settlement created", "success");
      setSettlement({ salaryPayable: 0, leaveEncashment: 0, bonus: 0, deductions: 0, assetRecovery: 0 });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Select
        label="Select Employee Exit"
        placeholder="Choose an exit record"
        data={offboardings.map((o) => ({ value: String(o.id), label: `${o.employeeName} - ${o.department}` }))}
        value={selectedId ? String(selectedId) : (firstId ? String(firstId) : null)}
        onChange={(val) => setSelectedId(val ? Number(val) : null)}
        searchable
      />

      <Stack gap="sm">
        <NumberInput label="Salary Payable (₹)" value={settlement.salaryPayable} onChange={(v) => setSettlement((p) => ({ ...p, salaryPayable: Number(v) || 0 }))} />
        <NumberInput label="Leave Encashment (₹)" value={settlement.leaveEncashment} onChange={(v) => setSettlement((p) => ({ ...p, leaveEncashment: Number(v) || 0 }))} />
        <NumberInput label="Bonus (₹)" value={settlement.bonus} onChange={(v) => setSettlement((p) => ({ ...p, bonus: Number(v) || 0 }))} />
        <NumberInput label="Deductions (₹)" value={settlement.deductions} onChange={(v) => setSettlement((p) => ({ ...p, deductions: Number(v) || 0 }))} />
        <NumberInput label="Asset Recovery (₹)" value={settlement.assetRecovery} onChange={(v) => setSettlement((p) => ({ ...p, assetRecovery: Number(v) || 0 }))} />
        <Card withBorder p="md" bg="blue.0">
          <Text size="lg" fw={700}>Final Amount: ₹{finalAmount.toLocaleString()}</Text>
        </Card>
        <Group justify="flex-end">
          <Button onClick={handleSubmit} loading={create.isPending}>Save Settlement</Button>
        </Group>
      </Stack>
    </Stack>
  );
}

export default function OnboardingManagement() {
  const [tab, setTab] = useState("onboarding-dashboard");

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={700} size="lg">Onboarding & Offboarding</Text>
          <Text size="xs" c="dimmed">Employee lifecycle management</Text>
        </Box>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="onboarding-dashboard" leftSection={<IconChartLine size={14} />}>Onboarding Dashboard</Tabs.Tab>
          <Tabs.Tab value="joiners" leftSection={<IconClipboard size={14} />}>New Joiners</Tabs.Tab>
          <Tabs.Tab value="checklists" leftSection={<IconFileText size={14} />}>Checklists</Tabs.Tab>
          <Tabs.Tab value="tasks" leftSection={<IconClipboard size={14} />}>Tasks</Tabs.Tab>
          <Tabs.Tab value="offboarding-dashboard" leftSection={<IconLogout size={14} />}>Offboarding Dashboard</Tabs.Tab>
          <Tabs.Tab value="exits" leftSection={<IconClipboard size={14} />}>Exit Requests</Tabs.Tab>
          <Tabs.Tab value="clearance" leftSection={<IconFileText size={14} />}>Clearance</Tabs.Tab>
          <Tabs.Tab value="assets" leftSection={<IconBox size={14} />}>Asset Return</Tabs.Tab>
          <Tabs.Tab value="interview" leftSection={<IconFileText size={14} />}>Exit Interview</Tabs.Tab>
          <Tabs.Tab value="settlement" leftSection={<IconFileText size={14} />}>Settlement</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="onboarding-dashboard"><OnboardingDashboardTab /></Tabs.Panel>
        <Tabs.Panel value="joiners"><NewJoinersTab /></Tabs.Panel>
        <Tabs.Panel value="checklists"><ChecklistsTab /></Tabs.Panel>
        <Tabs.Panel value="tasks"><TasksTab /></Tabs.Panel>
        <Tabs.Panel value="offboarding-dashboard"><OffboardingDashboardTab /></Tabs.Panel>
        <Tabs.Panel value="exits"><OffboardingListTab /></Tabs.Panel>
        <Tabs.Panel value="clearance"><ClearanceTrackerTab /></Tabs.Panel>
        <Tabs.Panel value="assets"><AssetReturnTab /></Tabs.Panel>
        <Tabs.Panel value="interview"><ExitInterviewTab /></Tabs.Panel>
        <Tabs.Panel value="settlement"><SettlementTab /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
