import { useState } from "react";
import { Box, Tabs, Button, Group, Text, Badge, Card, Grid, Stack, SimpleGrid, TextInput, Select, Modal, Table, ActionIcon, Tooltip, Loader, Center, Progress, Checkbox } from "@mantine/core";
import { IconPlus, IconSearch, IconDownload, IconEye, IconPencil, IconChartLine, IconClipboard, IconFileText, IconBox, IconServer, IconCheck } from "@tabler/icons-react";
import { useOnboardingDashboard, useOnboardings, useCreateOnboarding, useUpdateOnboarding, useChecklists, useTasks, useOffboardings } from "../../queries/useOnboarding";
import { useToast } from "../../components/ui/Toast";
import { exportOnboardingCSV } from "../../api/onboardingApi";
import ScreenWrapper from "../../components/layout/ScreenWrapper";

const STATUSES = ["Pending", "In Progress", "Completed", "Delayed", "Cancelled"];
const STATUS_COLORS = { Pending: "gray", "In Progress": "blue", Completed: "green", Delayed: "orange", Cancelled: "red" };
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

function DashboardTab() {
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
  const [limit, setLimit] = useState(25);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({ employeeName: "", joiningDate: "", department: "", designation: "", reportingMgr: "" });

  const { data: result = {}, isLoading } = useOnboardings({ search, status, page, limit });
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
      setSelectedRecord(null);
      setForm({ employeeName: "", joiningDate: "", department: "", designation: "", reportingMgr: "" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setDetailModal(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setForm({
      employeeName: record.employeeName,
      joiningDate: record.joiningDate.slice(0, 10),
      department: record.department,
      designation: record.designation,
      reportingMgr: record.reportingMgr,
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
          <Select placeholder="Status" data={["", ...STATUSES]} value={status} onChange={setStatus} w={150} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => setModalOpened(true)}>New</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.onboardings || []).length === 0 ? (
        <Center h={300}><Text c="dimmed">No records found</Text></Center>
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
            <div>
              <Text size="xs" c="dimmed">Employee</Text>
              <Text fw={500}>{selectedRecord.employeeName}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Joining Date</Text>
              <Text fw={500}>{new Date(selectedRecord.joiningDate).toLocaleDateString()}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Department</Text>
              <Text fw={500}>{selectedRecord.department}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Designation</Text>
              <Text fw={500}>{selectedRecord.designation}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Reporting Manager</Text>
              <Text fw={500}>{selectedRecord.reportingMgr}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Status</Text>
              <Badge color={STATUS_COLORS[selectedRecord.status]}>{selectedRecord.status}</Badge>
            </div>
            <div>
              <Text size="xs" c="dimmed">Progress</Text>
              <Progress value={selectedRecord.progress || 0} size="sm" w={200} />
            </div>
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
  const { data: checklists = [], isLoading: loadingChecklist } = useChecklists(firstId);

  const handleMarkComplete = (itemId) => {
    show(`Marked checklist item #${itemId} as complete`, "success");
    console.log("Mark complete:", itemId);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Checklist Items</Text>
        {onboardings.length > 0 && (
          <Select 
            placeholder="Select employee" 
            data={onboardings.map(o => ({ value: String(o.id), label: o.employeeName }))} 
            value={selectedId ? String(selectedId) : String(firstId)}
            onChange={(v) => setSelectedId(Number(v))}
            w={240}
          />
        )}
      </Group>

      {loadingList || loadingChecklist ? (
        <Center h={200}><Loader /></Center>
      ) : checklists.length === 0 ? (
        <Center h={300}><Text c="dimmed">No checklist items</Text></Center>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Responsible</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Due Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {checklists.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Group gap={8}>
                    <Checkbox checked={item.status === "Completed"} onChange={() => handleMarkComplete(item.id)} />
                    <Text size="sm" fw={500}>{item.itemName}</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="sm">{item.responsible}</Text></Table.Td>
                <Table.Td><Badge size="sm" color={item.status === "Completed" ? "green" : "blue"}>{item.status}</Badge></Table.Td>
                <Table.Td><Text size="sm">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

function TasksTab() {
  const { show } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const { data: onboardings = [], isLoading: loadingList } = useOnboardings({ limit: 100 });
  const firstId = selectedId || (onboardings[0]?.id);
  const { data: tasks = [], isLoading: loadingTasks } = useTasks(firstId);

  const handleCompleteTask = (taskId, title) => {
    show(`Task "${title}" marked as complete`, "success");
    console.log("Complete task:", taskId);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Tasks</Text>
        {onboardings.length > 0 && (
          <Select 
            placeholder="Select employee" 
            data={onboardings.map(o => ({ value: String(o.id), label: o.employeeName }))} 
            value={selectedId ? String(selectedId) : String(firstId)}
            onChange={(v) => setSelectedId(Number(v))}
            w={240}
          />
        )}
      </Group>

      {loadingList || loadingTasks ? (
        <Center h={200}><Loader /></Center>
      ) : tasks.length === 0 ? (
        <Center h={300}><Text c="dimmed">No tasks assigned</Text></Center>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Task</Table.Th>
              <Table.Th>Assigned</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Due</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tasks.map((t) => (
              <Table.Tr key={t.id}>
                <Table.Td><Text size="sm" fw={500}>{t.title}</Text></Table.Td>
                <Table.Td><Text size="sm">{t.assignedTo}</Text></Table.Td>
                <Table.Td><Badge size="sm" color={PRIORITY_COLORS[t.priority] || "gray"}>{t.priority}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <Badge size="sm" color={t.status === "Completed" ? "green" : t.status === "In Progress" ? "blue" : "gray"}>{t.status}</Badge>
                    {t.status !== "Completed" && (
                      <Tooltip label="Mark Complete">
                        <ActionIcon size="sm" color="green" variant="light" onClick={() => handleCompleteTask(t.id, t.title)}>
                          <IconCheck size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td><Text size="sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

function ExitsTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { data: result = {}, isLoading } = useOffboardings({ page, limit });

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Exit Requests</Text>
        <Button size="sm" leftSection={<IconPlus size={14} />}>New Exit</Button>
      </Group>

      {isLoading ? (
        <Center h={200}><Loader /></Center>
      ) : (result.exits || []).length === 0 ? (
        <Center h={300}><Text c="dimmed">No exit requests</Text></Center>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Last Working Date</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.exits || []).map((e) => (
              <Table.Tr key={e.id}>
                <Table.Td><Text size="sm" fw={500}>{e.employeeName}</Text></Table.Td>
                <Table.Td><Text size="sm">{e.reasonForExit}</Text></Table.Td>
                <Table.Td><Text size="sm">{new Date(e.lastWorkingDate).toLocaleDateString()}</Text></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Badge color={e.status === "Approved" ? "green" : e.status === "Completed" ? "teal" : "orange"}>{e.status}</Badge>
                    <Tooltip label="View"><ActionIcon size="sm" variant="subtle" onClick={() => console.log("View exit:", e.id)}><IconEye size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

export default function OnboardingManagement() {
  const [tab, setTab] = useState("dashboard");

  return (
    <ScreenWrapper>
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={700} size="lg">Onboarding & Offboarding</Text>
          <Text size="xs" c="dimmed">Employee lifecycle management</Text>
        </Box>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartLine size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="joiners" leftSection={<IconClipboard size={14} />}>New Joiners</Tabs.Tab>
          <Tabs.Tab value="checklists" leftSection={<IconFileText size={14} />}>Checklists</Tabs.Tab>
          <Tabs.Tab value="tasks" leftSection={<IconClipboard size={14} />}>Tasks</Tabs.Tab>
          <Tabs.Tab value="exits" leftSection={<IconClipboard size={14} />}>Exits</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="joiners"><NewJoinersTab /></Tabs.Panel>
        <Tabs.Panel value="checklists"><ChecklistsTab /></Tabs.Panel>
        <Tabs.Panel value="tasks"><TasksTab /></Tabs.Panel>
        <Tabs.Panel value="exits"><ExitsTab /></Tabs.Panel>
      </Tabs>
    </ScreenWrapper>
  );
}
