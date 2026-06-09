import { useState } from "react";
import {
  IconUsers, IconCircleCheck, IconClock, IconCircleX, IconSearch, IconPlus, IconEye, IconCheck, IconX,
} from "@tabler/icons-react";
import {
  Group, Stack, Text, Badge, ActionIcon, Avatar, TextInput, Select, SimpleGrid,
  Tooltip, Progress, Box, Paper, Table, Loader, Center,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { AppButton }     from "../../components/ui/AppButton";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppTable }      from "../../components/ui/AppTable";
import { getInitials }   from "../../utils/helpers";
import { useAuth }       from "../../hooks/useAuth";
import { useToast }      from "../../components/ui/Toast";
import { usePermission } from "../../hooks/usePermission";
import {
  fetchLeaves, applyLeave, updateLeaveStatus, fetchLeaveBalance,
} from "../../api/leaveApi";

const LEAVE_TYPE_COLORS = {
  "Sick Leave":   "red",
  "Casual Leave": "yellow",
  "Annual Leave": "blue",
  "Earned Leave": "violet",
};

const STATUS_COLORS = { Approved: "green", Pending: "yellow", Rejected: "red" };

const Leave = () => {
  const { user } = useAuth();
  const { show } = useToast();
  const queryClient = useQueryClient();

  const can = usePermission();
  const isEmployee = !can("leave.view_all");
  const canApprove = can("leave.approve");
  const canReject  = can("leave.reject");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [typeFilter, setType]       = useState("All");
  const [viewLeave, setViewLeave]   = useState(null);
  const [showApply, setShowApply]   = useState(false);
  const [form, setForm] = useState({ leaveType: "Casual Leave", fromDate: "", toDate: "", reason: "" });

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: leavesRaw = [], isLoading } = useQuery({
    queryKey: ["leaves", statusFilter, typeFilter, searchTerm],
    queryFn: () => fetchLeaves({
      status: statusFilter !== "All" ? statusFilter : undefined,
      type:   typeFilter   !== "All" ? typeFilter   : undefined,
      search: searchTerm   || undefined,
    }),
    select: (res) => res?.data ?? res ?? [],
  });

  const { data: balanceRaw = [] } = useQuery({
    queryKey: ["leave-balance"],
    queryFn: fetchLeaveBalance,
    select: (res) => res?.data ?? res ?? [],
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const applyMutation = useMutation({
    mutationFn: applyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
      setForm({ leaveType: "Casual Leave", fromDate: "", toDate: "", reason: "" });
      setShowApply(false);
      show("Leave request submitted successfully", "success");
    },
    onError: () => show("Failed to submit leave request", "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateLeaveStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
      show(vars.status === "Approved" ? "Leave approved" : "Leave rejected", vars.status === "Approved" ? "success" : "error");
      setViewLeave(null);
    },
    onError: () => show("Failed to update leave status", "error"),
  });

  // ── Derived ───────────────────────────────────────────────────────────────────

  const leaves  = Array.isArray(leavesRaw)  ? leavesRaw  : [];
  const balance = Array.isArray(balanceRaw) ? balanceRaw : [];

  const total    = leaves.length;
  const approved = leaves.filter(l => l.status === "Approved").length;
  const pending  = leaves.filter(l => l.status === "Pending").length;
  const rejected = leaves.filter(l => l.status === "Rejected").length;

  const headers = isEmployee
    ? ["Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"]
    : ["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"];

  return (
    <Box>
      <AppPageHeader
        title={isEmployee ? "My Leave" : "Leave Management"}
        sub={isEmployee ? "Apply and track your leave requests" : "Track and manage employee leave requests"}
        action={
          <AppButton leftSection={<IconPlus size={16} />} onClick={() => setShowApply(true)}>
            Apply Leave
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconUsers size={22} />}       label="Total Requests" value={total}    color="blue" />
        <AppStatCard icon={<IconCircleCheck size={22} />} label="Approved"       value={approved} color="green" />
        <AppStatCard icon={<IconClock size={22} />}       label="Pending"        value={pending}  color="yellow" />
        <AppStatCard icon={<IconCircleX size={22} />}     label="Rejected"       value={rejected} color="red" />
      </SimpleGrid>

      {balance.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
          {balance.map((b) => {
            const remaining = b.total - b.used;
            const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
            return (
              <Paper key={b.label} withBorder p="md" radius="xl" shadow="sm">
                <Group justify="space-between" mb="xs">
                  <Text fz="sm" fw={600}>{b.label}</Text>
                  <Text fz="xs" c="dimmed">{remaining}/{b.total} left</Text>
                </Group>
                <Progress value={pct} color={b.color} size="md" radius="xl" mb="xs" />
                <Text fz="xs" fw={600} c={b.color}>{b.used} days used</Text>
              </Paper>
            );
          })}
        </SimpleGrid>
      )}

      <Paper withBorder radius="xl" style={{ overflow: "hidden" }}>
        <Group p="md" pb="sm" gap="sm" wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <TextInput
            placeholder="Search employee or leave type…"
            leftSection={<IconSearch size={15} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
            size="sm" radius="md"
          />
          <Select
            size="sm" radius="md"
            value={statusFilter}
            onChange={(v) => setStatus(v || "All")}
            data={["All", "Approved", "Pending", "Rejected"].map(s => ({ value: s, label: s === "All" ? "All Status" : s }))}
            style={{ minWidth: 140 }}
          />
          <Select
            size="sm" radius="md"
            value={typeFilter}
            onChange={(v) => setType(v || "All")}
            data={["All", "Sick Leave", "Casual Leave", "Annual Leave", "Earned Leave"].map(t => ({ value: t, label: t === "All" ? "All Types" : t }))}
            style={{ minWidth: 160 }}
          />
          <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {leaves.length} record{leaves.length !== 1 ? "s" : ""}
          </Text>
        </Group>

        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : (
          <AppTable
            headers={headers}
            data={leaves}
            renderRow={(leave) => (
              <Table.Tr key={leave._id}>
                {!isEmployee && (
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="blue" radius="xl" size="sm">{getInitials(leave.employee)}</Avatar>
                      <Text fz="sm" fw={600}>{leave.employee}</Text>
                    </Group>
                  </Table.Td>
                )}
                <Table.Td>
                  <Badge color={LEAVE_TYPE_COLORS[leave.leaveType] || "gray"} variant="light" size="sm">
                    {leave.leaveType}
                  </Badge>
                </Table.Td>
                <Table.Td><Text fz="sm" c="dimmed">{leave.fromDate}</Text></Table.Td>
                <Table.Td><Text fz="sm" c="dimmed">{leave.toDate}</Text></Table.Td>
                <Table.Td><Text fz="sm" fw={600}>{leave.days}</Text></Table.Td>
                <Table.Td style={{ maxWidth: 150 }}><Text fz="sm" c="dimmed" truncate>{leave.reason}</Text></Table.Td>
                <Table.Td>
                  <Badge color={STATUS_COLORS[leave.status] || "gray"} variant="light" size="sm">
                    {leave.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <Tooltip label="View Details">
                      <ActionIcon variant="light" color="blue" size="sm" radius="md" onClick={() => setViewLeave(leave)}>
                        <IconEye size={14} />
                      </ActionIcon>
                    </Tooltip>
                    {leave.status === "Pending" && (canApprove || canReject) && (
                      <>
                        {canApprove && (
                          <Tooltip label="Approve">
                            <ActionIcon variant="light" color="green" size="sm" radius="md" loading={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: leave._id, status: "Approved" })}>
                              <IconCheck size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {canReject && (
                          <Tooltip label="Reject">
                            <ActionIcon variant="light" color="red" size="sm" radius="md" loading={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: leave._id, status: "Rejected" })}>
                              <IconX size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            )}
            emptyText="No leave requests found"
          />
        )}
      </Paper>

      {/* View Leave Modal */}
      <AppModal opened={!!viewLeave} onClose={() => setViewLeave(null)} title="Leave Request Details" icon={<IconClock size={20} />} iconColor="#3b82f6" size="md">
        {viewLeave && (
          <Stack gap="md">
            {!isEmployee && (
              <Group>
                <Avatar color="blue" radius="xl">{getInitials(viewLeave.employee)}</Avatar>
                <Box>
                  <Text fz="sm" c="dimmed">Employee</Text>
                  <Text fz="md" fw={600}>{viewLeave.employee}</Text>
                </Box>
              </Group>
            )}
            <SimpleGrid cols={2}>
              <Box><Text fz="sm" c="dimmed">Leave Type</Text><Text fz="md" fw={500}>{viewLeave.leaveType}</Text></Box>
              <Box>
                <Text fz="sm" c="dimmed">Status</Text>
                <Badge color={STATUS_COLORS[viewLeave.status] || "gray"} variant="light">{viewLeave.status}</Badge>
              </Box>
              <Box><Text fz="sm" c="dimmed">From</Text><Text fz="md" fw={500}>{viewLeave.fromDate}</Text></Box>
              <Box><Text fz="sm" c="dimmed">To</Text><Text fz="md" fw={500}>{viewLeave.toDate} ({viewLeave.days} days)</Text></Box>
            </SimpleGrid>
            <Box>
              <Text fz="sm" c="dimmed">Reason</Text>
              <Paper withBorder p="sm" bg="var(--mantine-color-gray-0)" mt={4}>
                <Text fz="sm">{viewLeave.reason || "—"}</Text>
              </Paper>
            </Box>
            {viewLeave.status === "Pending" && (canApprove || canReject) && (
              <Group grow mt="md">
                {canReject  && (
                  <AppButton variant="outline" color="red" loading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: viewLeave._id, status: "Rejected" })}>
                    Reject
                  </AppButton>
                )}
                {canApprove && (
                  <AppButton color="green" loading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: viewLeave._id, status: "Approved" })}>
                    Approve
                  </AppButton>
                )}
              </Group>
            )}
          </Stack>
        )}
      </AppModal>

      {/* Apply Leave Modal */}
      <AppModal opened={showApply} onClose={() => setShowApply(false)} title="Apply Leave" icon={<IconPlus size={20} />} iconColor="#10b981" size="md">
        <Stack gap="md">
          <Select label="Leave Type" value={form.leaveType} onChange={(v) => setForm({ ...form, leaveType: v })}
            data={["Sick Leave", "Casual Leave", "Annual Leave", "Earned Leave"]} />
          <SimpleGrid cols={2}>
            <AppInput type="date" label="From Date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
            <AppInput type="date" label="To Date"   value={form.toDate}   onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
          </SimpleGrid>
          <AppInput label="Reason" placeholder="Briefly explain the reason for your leave..."
            value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Group justify="flex-end" mt="md">
            <AppButton variant="default" onClick={() => setShowApply(false)}>Cancel</AppButton>
            <AppButton loading={applyMutation.isPending}
              onClick={() => { if (form.fromDate && form.toDate) applyMutation.mutate({ ...form, employeeName: user?.name || "" }); }}>
              Submit Request
            </AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default Leave;
