import { useState } from "react";
import {
  IconClock, IconPlus, IconTrash, IconPlayerPlay, IconPlayerStop,
} from "@tabler/icons-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Box, Group, Stack, Text, SimpleGrid, Badge, Paper, Table, TextInput, NumberInput, Switch, ActionIcon,
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
import {
  useTimesheetEntries, useCreateTimesheetEntry, useDeleteTimesheetEntry, useSubmitTimesheet,
} from "../../queries/useTimesheet";

const TODAY = new Date().toISOString().split("T")[0];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const STATUS_STYLE = { Draft: "gray", Pending: "yellow", Approved: "green", Rejected: "red" };

const MOCK_MY_ENTRIES = [
  { id: "m1", date: "2026-07-01T00:00:00Z", project: "Client Portal Revamp", task: "API integration", hours: 8, billable: true, status: "Draft" },
  { id: "m2", date: "2026-06-30T00:00:00Z", project: "Mobile App v2", task: "UI polish", hours: 7.5, billable: true, status: "Pending" },
  { id: "m3", date: "2026-06-29T00:00:00Z", project: "Internal Tooling", task: "CI pipeline fix", hours: 5, billable: false, status: "Approved" },
];

const emptyForm = { project: "", task: "", client: "", hours: 1, billable: true };

const MyTimesheet = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: apiEntries = [] } = useTimesheetEntries({ own: true });
  const createMut = useCreateTimesheetEntry();
  const deleteMut = useDeleteTimesheetEntry();
  const submitMut = useSubmitTimesheet();

  const entries = apiEntries.length ? apiEntries : MOCK_MY_ENTRIES;

  const totalHours    = entries.reduce((s, e) => s + Number(e.hours || 0), 0);
  const billableHours = entries.filter((e) => e.billable).reduce((s, e) => s + Number(e.hours || 0), 0);
  const draftCount    = entries.filter((e) => e.status === "Draft").length;
  const approvedCount = entries.filter((e) => e.status === "Approved").length;

  const chartData = entries.slice(0, 10).reverse().map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    hours: Number(e.hours || 0),
  }));

  const toggleTimer = () => setTimerRunning((r) => !r);

  const openAddModal = () => { setForm(emptyForm); setModalOpen(true); };

  const handleAddEntry = async () => {
    if (!form.project || !form.hours) { show("Project and hours are required", "error"); return; }
    try {
      await createMut.mutateAsync({ ...form, date: TODAY });
      setModalOpen(false);
      show("Timesheet entry added", "success");
    } catch { show("Failed to add entry", "error"); }
  };

  const handleDelete = async (id) => {
    try { await deleteMut.mutateAsync(id); show("Entry removed", "success"); }
    catch { show("Failed to remove entry", "error"); }
  };

  const handleSubmitWeek = async () => {
    try { await submitMut.mutateAsync({ weekOf: TODAY }); show("Timesheet submitted for approval", "success"); }
    catch { show("Failed to submit timesheet", "error"); }
  };

  return (
    <Box>
      <AppPageHeader
        title="My Timesheet"
        sub={`${fmtDate(TODAY)} · ${user?.name || "Employee"}`}
        action={<AppButton leftSection={<IconPlus size={15} />} onClick={openAddModal}>Add Entry</AppButton>}
      />

      <Paper
        p="xl"
        mb="xl"
        radius="xl"
        style={{
          background: "linear-gradient(135deg, var(--mantine-color-blue-0), var(--mantine-color-green-0))",
          border: "1px solid var(--mantine-color-blue-2)",
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap">
          <Stack gap={4}>
            <Text fz="xs" fw={700} c="dimmed" tt="uppercase" letterSpacing="0.06em">
              {timerRunning ? "Timer Running" : "Ready to Track"}
            </Text>
            <Text fz={36} fw={800} lh={1} style={{ fontVariantNumeric: "tabular-nums" }}>
              {new Date(timerSeconds * 1000).toISOString().substring(11, 19)}
            </Text>
            <Text fz="sm" c="dimmed">Stopwatch for the task you're currently on</Text>
          </Stack>

          <Stack align="center" gap="sm">
            <Paper
              h={120} w={120} radius="xl"
              style={{
                background: timerRunning ? "var(--mantine-color-red-0)" : "var(--mantine-color-green-0)",
                border: `3px solid var(--mantine-color-${timerRunning ? "red" : "green"}-5)`,
              }}
            >
              <Stack align="center" justify="center" h="100%" gap={6}>
                <ActionIcon
                  size={48} radius="xl" variant="light"
                  color={timerRunning ? "red" : "green"}
                  onClick={toggleTimer}
                >
                  {timerRunning ? <IconPlayerStop size={24} /> : <IconPlayerPlay size={24} />}
                </ActionIcon>
                <Text fz="xs" fw={700} c={timerRunning ? "red.7" : "green.7"}>
                  {timerRunning ? "STOP" : "START"}
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <AppStatCard icon={<IconClock size={22}/>} label="Total Hours"    value={`${totalHours}h`}    color="blue" />
        <AppStatCard icon={<IconClock size={22}/>} label="Billable Hours" value={`${billableHours}h`} color="green" />
        <AppStatCard icon={<IconClock size={22}/>} label="Draft Entries"  value={draftCount}          color="gray" />
        <AppStatCard icon={<IconClock size={22}/>} label="Approved"       value={approvedCount}       color="teal" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="Daily Hours (Last 10 Entries)">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tsHoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--mantine-color-blue-6)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}h`, "Hours"]} />
              <Area type="monotone" dataKey="hours" stroke="var(--mantine-color-blue-6)" fill="url(#tsHoursGrad)" strokeWidth={2.5} dot={{ fill: "var(--mantine-color-blue-6)", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection
          title="My Entries"
          sub="Your recent timesheet entries"
          noPadding
          action={<AppButton size="xs" variant="light" onClick={handleSubmitWeek}>Submit Week</AppButton>}
        >
          <Box style={{ overflowY: "auto", maxHeight: 310 }}>
            {entries.length === 0 ? (
              <AppEmptyState message="No timesheet entries yet" sub="Add your first entry to get started" />
            ) : (
              <AppTable
                headers={["Date", "Project", "Task", "Hours", "Status", ""]}
                data={entries}
                renderRow={(e) => (
                  <Table.Tr key={e.id} style={{ background: e.date === TODAY ? "var(--mantine-color-green-0)" : undefined }}>
                    <Table.Td><Text fz="sm">{new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Text></Table.Td>
                    <Table.Td><Text fz="sm" fw={500}>{e.project}</Text></Table.Td>
                    <Table.Td><Text fz="sm" c="dimmed">{e.task}</Text></Table.Td>
                    <Table.Td><Text fz="sm">{e.hours}h</Text></Table.Td>
                    <Table.Td><Badge color={STATUS_STYLE[e.status] || "gray"} variant="light" size="sm">{e.status}</Badge></Table.Td>
                    <Table.Td>
                      {e.status === "Draft" && (
                        <ActionIcon size="sm" variant="light" color="red" onClick={() => handleDelete(e.id)}>
                          <IconTrash size={13} />
                        </ActionIcon>
                      )}
                    </Table.Td>
                  </Table.Tr>
                )}
              />
            )}
          </Box>
        </AppSection>
      </SimpleGrid>

      <AppModal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Timesheet Entry" size="sm">
        <Stack gap="sm">
          <TextInput label="Project" placeholder="e.g. Client Portal Revamp" value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} required />
          <TextInput label="Task" placeholder="What did you work on?" value={form.task} onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))} />
          <TextInput label="Client" placeholder="Optional" value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} />
          <NumberInput label="Hours" min={0.25} max={24} step={0.25} value={form.hours} onChange={(v) => setForm((f) => ({ ...f, hours: v }))} required />
          <Switch label="Billable" checked={form.billable} onChange={(e) => setForm((f) => ({ ...f, billable: e.currentTarget.checked }))} />
          <Group grow mt="sm">
            <AppButton variant="default" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton onClick={handleAddEntry}>Add Entry</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default MyTimesheet;
