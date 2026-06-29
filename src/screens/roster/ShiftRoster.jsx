import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Loader, Center, ColorInput,
  NumberInput, Tooltip, Progress, RingProgress,
} from "@mantine/core";
import {
  IconClock, IconCalendarTime, IconUsers, IconMoon, IconRotateClockwise,
  IconClockHour4, IconArrowsExchange, IconChartBar, IconPlus, IconPencil, IconTrash,
  IconCheck, IconX, IconCalendarEvent,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import {
  useRosterDashboard, useRosterAnalytics,
  useShifts, useCreateShift, useUpdateShift, useDeleteShift,
  useAssignments, useCreateAssignment, useDeleteAssignment,
  useChangeRequests, useCreateChangeRequest, useReviewChangeRequest,
  useOvertime, useRequestOvertime, useReviewOvertime,
} from "../../queries/useRoster";

const SHIFT_TYPES = ["General Shift", "Morning Shift", "Evening Shift", "Night Shift", "Split Shift", "Flexible Shift", "Rotational Shift", "Custom Shift"];
const SHIFT_STATUS = ["Active", "Inactive", "Archived"];
const WEEKLY_OFF = ["Saturday & Sunday", "Sunday Only", "Rotating Weekly Off", "Custom Weekly Off"];
const STATUS_COLOR = { Active: "green", Inactive: "gray", Archived: "dark", Pending: "orange", Approved: "green", Rejected: "red" };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const useEmployeeOptions = () => {
  const { data: employees = [] } = useFetchAllEmployees();
  const options = (employees || []).map((e) => ({ value: e.name, label: e.employeeId ? `${e.name} (${e.employeeId})` : e.name }));
  const byName = Object.fromEntries((employees || []).map((e) => [e.name, e]));
  return { options, byName };
};

function Kpi({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}><Icon size={18} color={`var(--mantine-color-${color}-6)`} /></Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ═══ Dashboard ═══
function DashboardTab() {
  const { data: d, isLoading } = useRosterDashboard();
  const { data: an } = useRosterAnalytics();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Kpi label="Total Shifts" value={dash.totalShifts} icon={IconClock} color="blue" />
        <Kpi label="Active Shifts" value={dash.activeShifts} icon={IconCalendarTime} color="green" />
        <Kpi label="Employees Assigned" value={dash.employeesAssigned} icon={IconUsers} color="teal" />
        <Kpi label="Night Shifts" value={dash.nightShifts} icon={IconMoon} color="indigo" />
        <Kpi label="Rotating Shifts" value={dash.rotatingShifts} icon={IconRotateClockwise} color="grape" />
        <Kpi label="Overtime Hours" value={dash.overtimeHours} icon={IconClockHour4} color="orange" />
        <Kpi label="Change Requests" value={dash.shiftChangeRequests} icon={IconArrowsExchange} color="red" sub="pending" />
      </SimpleGrid>
      {an && (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">Shift Utilization</Text>
            <Center><RingProgress size={120} thickness={12} roundCaps sections={[{ value: an.shiftUtilization || 0, color: "blue" }]} label={<Text ta="center" fw={700}>{an.shiftUtilization || 0}%</Text>} /></Center>
          </Card>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">Night Shift %</Text>
            <Progress value={an.nightShiftPct || 0} size="lg" radius="xl" color="indigo" mt="lg" />
            <Text size="xl" fw={700} mt="sm">{an.nightShiftPct || 0}%</Text>
          </Card>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">Shift Distribution</Text>
            <Stack gap={6} mt="xs">
              {(an.distribution || []).length === 0 && <Text size="sm" c="dimmed">No data</Text>}
              {(an.distribution || []).map((s) => (
                <Group key={s.name} justify="space-between">
                  <Group gap={6}><Box w={10} h={10} style={{ background: s.color, borderRadius: 2 }} /><Text size="xs">{s.name}</Text></Group>
                  <Text size="xs" fw={600}>{s.value}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </SimpleGrid>
      )}
    </Stack>
  );
}

// ═══ Shifts ═══
function ShiftsTab({ canManage }) {
  const { show } = useToast();
  const { data: shifts = [], isLoading } = useShifts();
  const create = useCreateShift();
  const update = useUpdateShift();
  const del = useDeleteShift();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const EMPTY = { name: "", code: "", type: SHIFT_TYPES[0], startTime: "09:00", endTime: "18:00", breakDuration: 60, graceTime: 15, weeklyOff: WEEKLY_OFF[0], colorCode: "#3b82f6", status: "Active" };
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ ...s }); setOpen(true); };

  const submit = async () => {
    if (!form.name || !form.code) return show("Name and code are required", "error");
    if (!form.startTime || !form.endTime) return show("Start and end time required", "error");
    try {
      if (editId) { await update.mutateAsync({ id: editId, ...form }); show("Shift updated", "success"); }
      else { await create.mutateAsync(form); show("Shift created", "success"); }
      setOpen(false);
    } catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={openNew}>Create Shift</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {shifts.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconClock size={24} />} message="No shifts available" sub={canManage ? "No shifts have been configured. Create one to get started." : "No shifts have been configured."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={openNew}>Create Shift</Button>} /></Box>}
        {shifts.map((s) => (
          <Card key={s.id} withBorder radius="md" p="md" style={{ borderLeft: `4px solid ${s.colorCode}` }}>
            <Group justify="space-between" mb="xs">
              <Group gap="xs"><Box w={12} h={12} style={{ background: s.colorCode, borderRadius: 3 }} /><Text fw={700}>{s.name}</Text></Group>
              <Badge color={STATUS_COLOR[s.status] || "gray"} variant="light">{s.status}</Badge>
            </Group>
            <Text size="xs" c="dimmed" mb="xs">{s.code} · {s.type}</Text>
            <Group gap="xl" mb="xs">
              <Box><Text size="xs" c="dimmed">Timing</Text><Text size="sm" fw={500}>{s.startTime} – {s.endTime}</Text></Box>
              <Box><Text size="xs" c="dimmed">Hours</Text><Text size="sm" fw={500}>{s.workingHours ?? "—"}h</Text></Box>
              <Box><Text size="xs" c="dimmed">Assigned</Text><Text size="sm" fw={500}>{s._count?.assignments ?? 0}</Text></Box>
            </Group>
            <Text size="xs" c="dimmed">Weekly off: {s.weeklyOff} · Grace {s.graceTime}m · Break {s.breakDuration}m</Text>
            {canManage && (
              <Group gap="xs" mt="sm">
                <Button size="compact-xs" variant="light" leftSection={<IconPencil size={12} />} onClick={() => openEdit(s)}>Edit</Button>
                {s.status !== "Archived" && <Button size="compact-xs" variant="subtle" color="red" leftSection={<IconTrash size={12} />} onClick={async () => { await del.mutateAsync(s.id); show("Archived", "success"); }}>Archive</Button>}
              </Group>
            )}
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title={editId ? "Edit Shift" : "Create Shift"} size="lg">
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Shift Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextInput label="Shift Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </Group>
          <Select label="Shift Type" data={SHIFT_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Group grow>
            <TextInput type="time" label="Start Time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <TextInput type="time" label="End Time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </Group>
          <Group grow>
            <NumberInput label="Break (min)" min={0} value={form.breakDuration} onChange={(v) => setForm({ ...form, breakDuration: v })} />
            <NumberInput label="Grace (min)" min={0} value={form.graceTime} onChange={(v) => setForm({ ...form, graceTime: v })} />
          </Group>
          <Select label="Weekly Off Pattern" data={WEEKLY_OFF} value={form.weeklyOff} onChange={(v) => setForm({ ...form, weeklyOff: v })} />
          <Group grow>
            <ColorInput label="Color Code" value={form.colorCode} onChange={(v) => setForm({ ...form, colorCode: v })} />
            <Select label="Status" data={SHIFT_STATUS} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending || update.isPending}>{editId ? "Update" : "Create"}</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Roster / Assignments ═══
function RosterTab({ canManage }) {
  const { show } = useToast();
  const { data: assignments = [], isLoading } = useAssignments();
  const { data: shifts = [] } = useShifts({ status: "Active" });
  const { options: empOptions, byName } = useEmployeeOptions();
  const create = useCreateAssignment();
  const del = useDeleteAssignment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ shiftId: "", employee: "", date: "" });

  const submit = async () => {
    if (!form.shiftId || !form.employee || !form.date) return show("Shift, employee and date are required", "error");
    const emp = byName[form.employee];
    try { await create.mutateAsync({ ...form, shiftId: Number(form.shiftId), employeeId: emp?.id, department: emp?.department }); show("Shift assigned", "success"); setOpen(false); setForm({ shiftId: "", employee: "", date: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Assign Shift</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Shift</Table.Th><Table.Th>Date</Table.Th><Table.Th>Timing</Table.Th><Table.Th>Department</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {assignments.length === 0 && <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<IconCalendarTime size={24} />} message="No shift assignments" sub={canManage ? "Assign shifts to employees to build the roster." : "Your shift assignments will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Assign Shift</Button>} /></Table.Td></Table.Tr>}
          {assignments.map((a) => (
            <Table.Tr key={a.id}>
              <Table.Td fw={500}>{a.employee}</Table.Td>
              <Table.Td><Group gap={6}><Box w={10} h={10} style={{ background: a.shift?.colorCode, borderRadius: 2 }} /><Text size="sm">{a.shift?.name}</Text></Group></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(a.date)}</Text></Table.Td>
              <Table.Td><Text size="xs">{a.shift?.startTime} – {a.shift?.endTime}</Text></Table.Td>
              <Table.Td><Text size="xs">{a.department || "—"}</Text></Table.Td>
              <Table.Td>{canManage && <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { await del.mutateAsync(a.id); show("Removed", "success"); }}><IconTrash size={13} /></ActionIcon>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Assign Shift" size="md">
        <Stack gap="sm">
          <Select label="Employee" placeholder="Select employee" required searchable data={empOptions} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })} nothingFoundMessage="No employee found" />
          <Select label="Shift" placeholder="Select shift" required data={shifts.map((s) => ({ value: String(s.id), label: `${s.name} (${s.startTime}–${s.endTime})` }))} value={form.shiftId} onChange={(v) => setForm({ ...form, shiftId: v })} />
          <TextInput type="date" label="Date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Assign</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Change Requests ═══
function ChangeRequestsTab({ canManage }) {
  const { show } = useToast();
  const { data: reqs = [], isLoading } = useChangeRequests();
  const { data: shifts = [] } = useShifts({ status: "Active" });
  const create = useCreateChangeRequest();
  const review = useReviewChangeRequest();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ currentShift: "", requestedShift: "", reason: "", effectiveDate: "" });

  const submit = async () => {
    if (!form.requestedShift) return show("Requested shift is required", "error");
    try { await create.mutateAsync(form); show("Request submitted", "success"); setOpen(false); setForm({ currentShift: "", requestedShift: "", reason: "", effectiveDate: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button leftSection={<IconArrowsExchange size={14} />} onClick={() => setOpen(true)}>Request Shift Change</Button></Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Current</Table.Th><Table.Th>Requested</Table.Th><Table.Th>Reason</Table.Th><Table.Th>Effective</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {reqs.length === 0 && <Table.Tr><Table.Td colSpan={7}><AppEmptyState icon={<IconArrowsExchange size={24} />} message="No shift change requests" sub="Requests to change shifts will appear here." action={<Button leftSection={<IconArrowsExchange size={14} />} onClick={() => setOpen(true)}>Request Change</Button>} /></Table.Td></Table.Tr>}
          {reqs.map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td fw={500}>{r.employee}</Table.Td>
              <Table.Td><Text size="xs">{r.currentShift || "—"}</Text></Table.Td>
              <Table.Td><Text size="xs">{r.requestedShift}</Text></Table.Td>
              <Table.Td><Text size="xs">{r.reason || "—"}</Text></Table.Td>
              <Table.Td><Text size="xs">{fmtDate(r.effectiveDate)}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[r.status] || "gray"} variant="light">{r.status}</Badge></Table.Td>
              <Table.Td>{canManage && r.status === "Pending" && <Group gap={4}>
                <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await review.mutateAsync({ id: r.id, status: "Approved" }); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await review.mutateAsync({ id: r.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
              </Group>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Request Shift Change" size="md">
        <Stack gap="sm">
          <Select label="Current Shift" placeholder="Select your current shift" data={shifts.map((s) => s.name)} value={form.currentShift} onChange={(v) => setForm({ ...form, currentShift: v })} searchable clearable nothingFoundMessage="No shifts configured" />
          <Select label="Requested Shift" required placeholder="Select the shift you want" data={shifts.map((s) => s.name)} value={form.requestedShift} onChange={(v) => setForm({ ...form, requestedShift: v })} searchable nothingFoundMessage="No shifts configured" />
          <Textarea label="Reason" placeholder="Why do you need this change?" minRows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <TextInput type="date" label="Effective Date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Submit</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Overtime ═══
function OvertimeTab({ canManage }) {
  const { show } = useToast();
  const { data: records = [], isLoading } = useOvertime();
  const request = useRequestOvertime();
  const review = useReviewOvertime();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", hours: 1, reason: "" });

  const submit = async () => {
    if (!form.date || !form.hours) return show("Date and hours are required", "error");
    try { await request.mutateAsync(form); show("Overtime requested", "success"); setOpen(false); setForm({ date: "", hours: 1, reason: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button leftSection={<IconClockHour4 size={14} />} onClick={() => setOpen(true)}>Request Overtime</Button></Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Employee</Table.Th><Table.Th>Date</Table.Th><Table.Th>Hours</Table.Th><Table.Th>Reason</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {records.length === 0 && <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<IconClockHour4 size={24} />} message="No overtime records" sub="Overtime requests will appear here." action={<Button leftSection={<IconClockHour4 size={14} />} onClick={() => setOpen(true)}>Request Overtime</Button>} /></Table.Td></Table.Tr>}
          {records.map((o) => (
            <Table.Tr key={o.id}>
              <Table.Td fw={500}>{o.employee}</Table.Td>
              <Table.Td><Text size="xs">{fmtDate(o.date)}</Text></Table.Td>
              <Table.Td>{o.hours}h</Table.Td>
              <Table.Td><Text size="xs">{o.reason || "—"}</Text></Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[o.status] || "gray"} variant="light">{o.status}</Badge></Table.Td>
              <Table.Td>{canManage && o.status === "Pending" && <Group gap={4}>
                <ActionIcon size="sm" variant="light" color="green" onClick={async () => { await review.mutateAsync({ id: o.id, status: "Approved" }); show("Approved", "success"); }}><IconCheck size={13} /></ActionIcon>
                <ActionIcon size="sm" variant="light" color="red" onClick={async () => { await review.mutateAsync({ id: o.id, status: "Rejected" }); show("Rejected", "error"); }}><IconX size={13} /></ActionIcon>
              </Group>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Request Overtime" size="md">
        <Stack gap="sm">
          <TextInput type="date" label="Date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <NumberInput label="Hours" required min={0.5} step={0.5} value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} />
          <Textarea label="Reason" placeholder="Reason for overtime" minRows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={request.isPending}>Submit</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Main ═══
export default function ShiftRoster() {
  const { user } = useAuth();
  const canManage = ["SUPER_ADMIN", "ADMIN", "HR", "HR_MANAGER", "MANAGER"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <AppPageHeader title="Shift & Roster Management" sub="Manage shifts, rosters, change requests and overtime" />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="shifts" leftSection={<IconClock size={14} />}>Shifts</Tabs.Tab>
          <Tabs.Tab value="roster" leftSection={<IconCalendarTime size={14} />}>Roster</Tabs.Tab>
          <Tabs.Tab value="changes" leftSection={<IconArrowsExchange size={14} />}>Change Requests</Tabs.Tab>
          <Tabs.Tab value="overtime" leftSection={<IconClockHour4 size={14} />}>Overtime</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="shifts"><ShiftsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="roster"><RosterTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="changes"><ChangeRequestsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="overtime"><OvertimeTab canManage={canManage} /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
