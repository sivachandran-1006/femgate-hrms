import { useState, useMemo } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, TextInput, Select,
  Stack, Loader, Box, Tabs, ActionIcon, Menu, Paper,
} from "@mantine/core";
import {
  IconChecklist, IconClockHour4, IconCircleCheck, IconAlertTriangle, IconSearch,
  IconList, IconLayoutKanban, IconFileExport, IconDownload, IconTrash,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { useToast }      from "../../components/ui/Toast";

// ── Mock stubs for removed service functions ──
const exportTasks = async (...args) => { console.log("Mock: exportTasks"); return new Blob(["mock data"], { type: "text/csv" }); };


const STATUS_COLOR = { "To Do": "gray", "In Progress": "blue", "Done": "green" };
const PRIORITY_COLOR = { Low: "gray", Medium: "yellow", High: "orange", Urgent: "red" };
const STATUSES = ["To Do", "In Progress", "Done"];

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_DASH = {
  cards: { totalTasks: 24, toDo: 8, inProgress: 10, done: 6, overdue: 3 },
};

const MOCK_TASKS = [
  { id: "k1", title: "Prepare Q3 hiring plan",        type: "HR",       assignee: "Shreya Iyer",  dueDate: "2026-07-18T00:00:00Z", priority: "High",   status: "To Do" },
  { id: "k2", title: "Review onboarding checklist",   type: "HR",       assignee: "Nisha Verma",  dueDate: "2026-07-12T00:00:00Z", priority: "Medium", status: "In Progress" },
  { id: "k3", title: "Update leave policy doc",       type: "Internal", assignee: "Divya Nair",   dueDate: "2026-07-10T00:00:00Z", priority: "Low",    status: "Done" },
  { id: "k4", title: "Approve pending expense claims", type: "Manager",  assignee: "Arjun Kumar",  dueDate: "2026-07-09T00:00:00Z", priority: "Urgent", status: "To Do" },
  { id: "k5", title: "Finalize workflow escalation rules", type: "Workflow", assignee: "Priya Sharma", dueDate: "2026-07-20T00:00:00Z", priority: "Medium", status: "In Progress" },
  { id: "k6", title: "Schedule performance reviews",   type: "HR",       assignee: "Shreya Iyer",  dueDate: "2026-07-25T00:00:00Z", priority: "High",   status: "To Do" },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const isOverdue = (d, status) => status !== "Done" && new Date(d) < new Date();

async function doExport(fmt, toast) {
  try {
    const blob = await exportTasks(fmt);
    const url = URL.createObjectURL(blob);
    if (fmt === "pdf") window.open(url, "_blank");
    else { const a = document.createElement("a"); a.href = url; a.download = `tasks.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
    toast(`Exported as ${fmt.toUpperCase()}`, "success");
  } catch { toast("Export failed", "error"); }
}

export default function Tasks() {
  const { show: toast } = useToast();

  const { data: rawDash } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: rawTasks, isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const dash  = rawDash ?? MOCK_DASH;
  const tasks = rawTasks?.length ? rawTasks : MOCK_TASKS;
  const c = dash?.cards || {};

  return (
    <>
      <AppPageHeader title="Task Management" sub="Assign, track and manage tasks across the organization"
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

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} mb="lg">
        <AppStatCard icon={<IconChecklist size={20} />} label="Total Tasks" value={c.totalTasks ?? 0} color="blue" />
        <AppStatCard icon={<IconList size={20} />} label="To Do" value={c.toDo ?? 0} color="gray" />
        <AppStatCard icon={<IconClockHour4 size={20} />} label="In Progress" value={c.inProgress ?? 0} color="indigo" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Done" value={c.done ?? 0} color="green" />
        <AppStatCard icon={<IconAlertTriangle size={20} />} label="Overdue" value={c.overdue ?? 0} color="red" />
      </SimpleGrid>

      <Tabs defaultValue="board" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="board" leftSection={<IconLayoutKanban size={15} />}>Board</Tabs.Tab>
          <Tabs.Tab value="list"  leftSection={<IconList size={15} />}>All Tasks</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="board">
          <BoardView tasks={tasks} isLoading={isLoading} toast={toast} />
        </Tabs.Panel>
        <Tabs.Panel value="list">
          <ListView tasks={tasks} isLoading={isLoading} toast={toast} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

function BoardView({ tasks, isLoading, toast }) {
  const statusMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const moveTask = async (id, status) => {
    try { await statusMut.mutateAsync({ id, status }); toast(`Moved to ${status}`, "success"); }
    catch { toast("Failed to update task", "error"); }
  };
  const removeTask = async (id) => {
    try { await deleteMut.mutateAsync(id); toast("Task deleted", "success"); }
    catch { toast("Failed to delete task", "error"); }
  };

  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
      {STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <AppSection key={status} title={status} sub={`${columnTasks.length} task${columnTasks.length === 1 ? "" : "s"}`} noPadding>
            <Stack gap="sm" p="md" style={{ minHeight: 120 }}>
              {columnTasks.length === 0 ? (
                <AppEmptyState message="No tasks here" py={32} />
              ) : columnTasks.map((t) => (
                <Paper key={t.id} withBorder p="sm" radius="md">
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb={6}>
                    <Text fz="sm" fw={600} lineClamp={2}>{t.title}</Text>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => removeTask(t.id)}>
                      <IconTrash size={13} />
                    </ActionIcon>
                  </Group>
                  <Group gap={6} mb={8}>
                    <Badge size="xs" variant="light" color={PRIORITY_COLOR[t.priority] || "gray"}>{t.priority}</Badge>
                    <Badge size="xs" variant="outline" color="gray">{t.type}</Badge>
                    {isOverdue(t.dueDate, t.status) && <Badge size="xs" variant="light" color="red">Overdue</Badge>}
                  </Group>
                  <Group justify="space-between" align="center">
                    <Text fz="xs" c="dimmed">{t.assignee} · {fmtDate(t.dueDate)}</Text>
                  </Group>
                  {status !== "Done" && (
                    <Group gap={4} mt={8}>
                      {STATUSES.filter((s) => s !== status).map((s) => (
                        <AppButton key={s} size="xs" variant="light" onClick={() => moveTask(t.id, s)}>
                          Move to {s}
                        </AppButton>
                      ))}
                    </Group>
                  )}
                </Paper>
              ))}
            </Stack>
          </AppSection>
        );
      })}
    </SimpleGrid>
  );
}

function ListView({ tasks, isLoading }) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [typeF, setTypeF] = useState("All");

  const types = useMemo(() => ["All", ...new Set(tasks.map((t) => t.type).filter(Boolean))], [tasks]);
  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (!q || t.title.toLowerCase().includes(q) || (t.assignee || "").toLowerCase().includes(q))
      && (statusF === "All" || t.status === statusF)
      && (typeF === "All" || t.type === typeF);
  });

  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;
  const COLS = ["Title", "Type", "Assignee", "Due Date", "Priority", "Status"];
  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput label="Search" placeholder="Search by title or assignee…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 160 }} />
          <Select label="Type" w={160} size="sm" data={types} value={typeF} onChange={setTypeF} />
          <Select label="Status" w={150} size="sm" data={["All", ...STATUSES]} value={statusF} onChange={setStatusF} />
        </Group>
      </AppSection>
      <AppSection noPadding title="All Tasks" sub={`${filtered.length} tasks`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{COLS.map((col) => <Table.Th key={col}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{col}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr><Table.Td colSpan={COLS.length}><AppEmptyState message="No tasks available." /></Table.Td></Table.Tr>
              ) : filtered.map((t) => (
                <Table.Tr key={t.id}>
                  <Table.Td><Text size="sm" fw={600}>{t.title}</Text></Table.Td>
                  <Table.Td><Badge variant="outline" color="gray" size="sm">{t.type}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{t.assignee}</Text></Table.Td>
                  <Table.Td><Text size="sm" c={isOverdue(t.dueDate, t.status) ? "red" : "dimmed"}>{fmtDate(t.dueDate)}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={PRIORITY_COLOR[t.priority] || "gray"} radius="sm">{t.priority}</Badge></Table.Td>
                  <Table.Td><Badge variant="light" color={STATUS_COLOR[t.status] || "gray"} radius="sm">{t.status}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
    </>
  );
}
