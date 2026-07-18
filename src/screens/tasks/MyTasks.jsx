import { useState } from "react";
import {
  IconChecklist, IconPlus, IconTrash, IconCircleCheck, IconClockHour4,
} from "@tabler/icons-react";
import {
  Box, Group, Stack, Text, SimpleGrid, Badge, Table, TextInput, Select, ActionIcon,
} from "@mantine/core";

import { useAuth }        from "../../hooks/useAuth";
import { useToast }       from "../../components/ui/Toast";
import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppTable }       from "../../components/ui/AppTable";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";
import { AppModal }       from "../../components/ui/AppModal";
import { AppButton }      from "../../components/ui/AppButton";

const PRIORITY_COLOR = { Low: "gray", Medium: "yellow", High: "orange", Urgent: "red" };
const STATUSES = ["To Do", "In Progress", "Done"];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const MOCK_MY_TASKS = [
  { id: "m1", title: "Submit weekly timesheet", type: "Employee", dueDate: "2026-07-16T00:00:00Z", priority: "Medium", status: "To Do" },
  { id: "m2", title: "Complete compliance training module 3", type: "Employee", dueDate: "2026-07-14T00:00:00Z", priority: "High", status: "In Progress" },
  { id: "m3", title: "Update emergency contact details", type: "Employee", dueDate: "2026-07-09T00:00:00Z", priority: "Low", status: "Done" },
];

const emptyForm = { title: "", type: "Employee", dueDate: "", priority: "Medium" };

const MyTasks = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: apiTasks = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const statusMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const tasks = apiTasks.length ? apiTasks : MOCK_MY_TASKS;

  const toDoCount = tasks.filter((t) => t.status === "To Do").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const overdueCount = tasks.filter((t) => t.status !== "Done" && new Date(t.dueDate) < new Date()).length;

  const openAddModal = () => { setForm(emptyForm); setModalOpen(true); };

  const handleAddTask = async () => {
    if (!form.title || !form.dueDate) { show("Title and due date are required", "error"); return; }
    try {
      await createMut.mutateAsync({ ...form, status: "To Do" });
      setModalOpen(false);
      show("Task added", "success");
    } catch { show("Failed to add task", "error"); }
  };

  const handleDelete = async (id) => {
    try { await deleteMut.mutateAsync(id); show("Task removed", "success"); }
    catch { show("Failed to remove task", "error"); }
  };

  const handleStatusChange = async (id, status) => {
    try { await statusMut.mutateAsync({ id, status }); show(`Marked as ${status}`, "success"); }
    catch { show("Failed to update task", "error"); }
  };

  return (
    <Box>
      <AppPageHeader
        title="My Tasks"
        sub={`${tasks.length} task${tasks.length === 1 ? "" : "s"} · ${user?.name || "Employee"}`}
        action={<AppButton leftSection={<IconPlus size={15} />} onClick={openAddModal}>Add Task</AppButton>}
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <AppStatCard icon={<IconChecklist size={22}/>} label="To Do"        value={toDoCount}      color="gray" />
        <AppStatCard icon={<IconClockHour4 size={22}/>} label="In Progress" value={inProgressCount} color="indigo" />
        <AppStatCard icon={<IconCircleCheck size={22}/>} label="Done"       value={doneCount}      color="green" />
        <AppStatCard icon={<IconChecklist size={22}/>} label="Overdue"      value={overdueCount}   color="red" />
      </SimpleGrid>

      <AppSection title="My Task List" sub="Tasks assigned to you" noPadding>
        <Box style={{ overflowY: "auto", maxHeight: 480 }}>
          {tasks.length === 0 ? (
            <AppEmptyState message="No tasks yet" sub="Add your first task to get started" />
          ) : (
            <AppTable
              headers={["Title", "Type", "Due Date", "Priority", "Status", ""]}
              data={tasks}
              renderRow={(t) => (
                <Table.Tr key={t.id}>
                  <Table.Td><Text fz="sm" fw={500}>{t.title}</Text></Table.Td>
                  <Table.Td><Badge variant="outline" color="gray" size="xs">{t.type}</Badge></Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed">{fmtDate(t.dueDate)}</Text></Table.Td>
                  <Table.Td><Badge color={PRIORITY_COLOR[t.priority] || "gray"} variant="light" size="sm">{t.priority}</Badge></Table.Td>
                  <Table.Td>
                    <Select
                      size="xs" w={130}
                      data={STATUSES}
                      value={t.status}
                      onChange={(v) => handleStatusChange(t.id, v)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon size="sm" variant="light" color="red" onClick={() => handleDelete(t.id)}>
                      <IconTrash size={13} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              )}
            />
          )}
        </Box>
      </AppSection>

      <AppModal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Task" size="sm">
        <Stack gap="sm">
          <TextInput label="Title" placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Select label="Type" data={["Employee", "HR", "Manager", "Internal"]} value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} />
          <TextInput label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} required />
          <Select label="Priority" data={["Low", "Medium", "High", "Urgent"]} value={form.priority} onChange={(v) => setForm((f) => ({ ...f, priority: v }))} />
          <Group grow mt="sm">
            <AppButton variant="default" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton onClick={handleAddTask}>Add Task</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default MyTasks;
