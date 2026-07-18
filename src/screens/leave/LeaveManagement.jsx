import { useState } from "react";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, Stack, Tabs, Menu, ActionIcon,
  Select, Button, NumberInput, Switch, TextInput, Box,
} from "@mantine/core";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconClipboardList, IconClock, IconCircleCheck, IconCircleX, IconUsers, IconPercentage,
  IconWallet, IconChartBar, IconCalendar, IconList, IconFileExport, IconDownload,
  IconSettings, IconPlus, IconPencil, IconTrash, IconAlertTriangle,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { usePermission } from "../../hooks/usePermission";
import Leave from "./Leave";

// ── Mock stubs for removed service functions ──
const exportLeaves = async (...args) => { console.log("Mock: exportLeaves"); return new Blob(["mock data"], { type: "text/csv" }); };


const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#64748b"];
const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off", "Maternity Leave", "Paternity Leave", "Marriage Leave", "Bereavement Leave", "Work From Home"];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function LeaveManagement({ darkMode }) {
  const { show: toast } = useToast();
  const can = usePermission();
  const isAdmin = can("leave.view_all");

  const doExport = async (fmt) => {
    try {
      const blob = await exportLeaves(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `leaves.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };

  // Employees see the simple Leave screen only
  if (!isAdmin) return <Leave />;

  return (
    <>
      <AppPageHeader title="Leave Management" sub="Apply, approve and manage leave across the organization"
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
          <Tabs.Tab value="requests"  leftSection={<IconList size={15} />}>Requests &amp; Approvals</Tabs.Tab>
          <Tabs.Tab value="calendar"  leftSection={<IconCalendar size={15} />}>Calendar</Tabs.Tab>
          <Tabs.Tab value="policies"  leftSection={<IconSettings size={15} />}>Policies</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="requests"><Leave embedded /></Tabs.Panel>
        <Tabs.Panel value="calendar"><CalendarTab /></Tabs.Panel>
        <Tabs.Panel value="policies"><PoliciesTab toast={toast} /></Tabs.Panel>
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
        <AppStatCard icon={<IconClipboardList size={20} />} label="Total Requests" value={c.totalRequests ?? 0} color="blue" />
        <AppStatCard icon={<IconClock size={20} />} label="Pending" value={c.pendingApprovals ?? 0} color="orange" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Approved" value={c.approved ?? 0} color="green" />
        <AppStatCard icon={<IconCircleX size={20} />} label="Rejected" value={c.rejected ?? 0} color="red" />
        <AppStatCard icon={<IconUsers size={20} />} label="On Leave Today" value={c.onLeaveToday ?? 0} color="grape" />
        <AppStatCard icon={<IconPercentage size={20} />} label="Utilization" value={`${c.utilization ?? 0}%`} color="teal" />
        <AppStatCard icon={<IconWallet size={20} />} label="Avail. Balance" value={c.availableBalance ?? 0} color="indigo" />
      </SimpleGrid>

      <AppSection title="Monthly Leave Trend" mb="md">
        {an?.monthlyTrend?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={an.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip />
              <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} name="Leave Days" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <AppEmptyState message="No leave records available." py={60} />}
      </AppSection>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppSection title="Leave Type Distribution">
          {an?.leaveTypeDistribution?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={an.leaveTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {an.leaveTypeDistribution.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
        <AppSection title="Department Leave Distribution">
          {an?.departmentDistribution?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={an.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Days" />
              </BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
      </SimpleGrid>
    </>
  );
}

function CalendarTab() {
  const { data: leaves = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const STATUS_COLOR = { Approved: "green", Pending: "yellow" };
  return (
    <AppSection noPadding title="Leave Calendar" sub={`${leaves.length} scheduled leaves`}>
      <ScrollArea>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead><Table.Tr>{["Employee", "Leave Type", "From", "To", "Days", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
          <Table.Tbody>
            {leaves.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No scheduled leaves" /></Table.Td></Table.Tr>
              : leaves.map((l) => (
                <Table.Tr key={l.id}>
                  <Table.Td><Text size="sm" fw={600}>{l.employee}</Text></Table.Td>
                  <Table.Td><Text size="sm">{l.type}</Text></Table.Td>
                  <Table.Td>{fmtDate(l.from)}</Table.Td>
                  <Table.Td>{fmtDate(l.to)}</Table.Td>
                  <Table.Td><Badge variant="light" radius="sm">{l.days}d</Badge></Table.Td>
                  <Table.Td><Badge variant="light" color={STATUS_COLOR[l.status] || "gray"} radius="sm">{l.status}</Badge></Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </AppSection>
  );
}

const EMPTY_POLICY = { name: "", leaveType: "Casual Leave", departments: "All", branches: "All", annualAllocation: 12, carryForward: false, carryForwardMax: 0, encashment: false, approvalWorkflow: "Manager → HR", status: "Active" };

function PoliciesTab({ toast }) {
  const { data: policies = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_POLICY);
  const [delTarget, setDelTarget] = useState(null);

  const openAdd = () => { setEditing(null); setForm(EMPTY_POLICY); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY_POLICY, ...p }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast("Policy Name is required", "error"); return; }
    try {
      if (editing) { await updateMut.mutateAsync({ id: editing.id, ...form }); toast("Policy updated", "success"); }
      else { await createMut.mutateAsync(form); toast("Policy created", "success"); }
      setOpen(false);
    } catch (e) { toast(e?.response?.data?.message || "Failed to save policy", "error"); }
  };
  const del = async () => {
    try { await deleteMut.mutateAsync(delTarget.id); toast("Policy deleted", "success"); setDelTarget(null); }
    catch { toast("Failed to delete", "error"); }
  };

  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Policy</AppButton></Group>
      <AppSection noPadding title="Leave Policies" sub={`${policies.length} policies`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Policy", "Leave Type", "Departments", "Annual", "Carry Fwd", "Workflow", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {policies.length === 0 ? <Table.Tr><Table.Td colSpan={8}><AppEmptyState message="No leave policies configured" action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Policy</AppButton>} /></Table.Td></Table.Tr>
                : policies.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td><Text size="sm" fw={600}>{p.name}</Text></Table.Td>
                    <Table.Td><Text size="sm">{p.leaveType}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{p.departments || "All"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{p.annualAllocation}d</Badge></Table.Td>
                    <Table.Td>{p.carryForward ? <Badge color="green" variant="light" radius="sm">Yes ({p.carryForwardMax})</Badge> : <Text size="sm" c="dimmed">No</Text>}</Table.Td>
                    <Table.Td><Text size="xs" c="dimmed">{p.approvalWorkflow}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={p.status === "Active" ? "green" : "gray"} radius="xl">{p.status}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" color="blue" size="sm" title="Edit" onClick={() => openEdit(p)}><IconPencil size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => setDelTarget(p)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      <AppModal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit Policy" : "Add Policy"} icon={<IconSettings size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput label="Policy Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <AppInput type="select" label="Leave Type *" data={LEAVE_TYPES} value={form.leaveType} onChange={(v) => setForm({ ...form, leaveType: v })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput label="Applicable Departments" placeholder="All or comma-separated" value={form.departments} onChange={(e) => setForm({ ...form, departments: e.target.value })} />
            <AppInput label="Applicable Branches" placeholder="All or comma-separated" value={form.branches} onChange={(e) => setForm({ ...form, branches: e.target.value })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput label="Annual Allocation (days)" min={0} value={form.annualAllocation} onChange={(v) => setForm({ ...form, annualAllocation: v })} />
            <AppInput label="Approval Workflow" value={form.approvalWorkflow} onChange={(e) => setForm({ ...form, approvalWorkflow: e.target.value })} />
          </SimpleGrid>
          <Group gap="xl">
            <Switch label="Carry Forward" checked={form.carryForward} onChange={(e) => setForm({ ...form, carryForward: e.currentTarget.checked })} />
            {form.carryForward && <NumberInput label="Max Carry Forward" w={160} min={0} value={form.carryForwardMax} onChange={(v) => setForm({ ...form, carryForwardMax: v })} />}
            <Switch label="Encashment" checked={form.encashment} onChange={(e) => setForm({ ...form, encashment: e.currentTarget.checked })} />
          </Group>
          <AppInput type="select" label="Status" data={["Active", "Inactive"]} value={form.status} onChange={(v) => setForm({ ...form, status: v })} w={200} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending || updateMut.isPending} onClick={save}>{editing ? "Save Changes" : "Save"}</AppButton>
          </Group>
        </Stack>
      </AppModal>

      <AppModal opened={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Policy" icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Delete <Text span fw={700}>{delTarget?.name}</Text>?</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDelTarget(null)}>Cancel</Button>
            <Button color="red" loading={deleteMut.isPending} onClick={del}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
