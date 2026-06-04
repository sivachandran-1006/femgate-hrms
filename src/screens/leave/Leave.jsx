import { useState } from "react";
import {
  Users, CheckCircle, Clock, XCircle, Search, Plus, Eye, Check, X
} from "lucide-react";
import { 
  Group, Stack, Text, Badge, ActionIcon, Avatar, TextInput, Select, SimpleGrid, Tooltip, Progress, Box, Paper, Table
} from "@mantine/core";
import { AppModal } from "../../components/ui/AppModal";
import { AppInput } from "../../components/ui/AppInput";
import { AppButton } from "../../components/ui/AppButton";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard } from "../../components/ui/AppStatCard";
import { AppTable } from "../../components/ui/AppTable";
import { AppSection } from "../../components/ui/AppSection";
import { getInitials } from "../../utils/helpers";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { usePermission } from "../../hooks/usePermission";

const MOCK_LEAVES = [
  { _id: "lv001", employee: "Safeer", leaveType: "Sick Leave", fromDate: "2026-05-20", toDate: "2026-05-22", days: 3, reason: "Fever", status: "Approved" },
  { _id: "lv002", employee: "Suriya", leaveType: "Casual Leave", fromDate: "2026-05-28", toDate: "2026-05-28", days: 1, reason: "Personal work", status: "Pending" },
  { _id: "lv003", employee: "Aravinth", leaveType: "Casual Leave", fromDate: "2026-06-02", toDate: "2026-06-03", days: 2, reason: "Family function", status: "Pending" },
  { _id: "lv004", employee: "C Santhosh", leaveType: "Sick Leave", fromDate: "2026-05-30", toDate: "2026-05-30", days: 1, reason: "Doctor visit", status: "Pending" },
  { _id: "lv005", employee: "Mani", leaveType: "Annual Leave", fromDate: "2026-04-10", toDate: "2026-04-14", days: 5, reason: "Vacation", status: "Approved" },
  { _id: "lv006", employee: "P Santhosh", leaveType: "Casual Leave", fromDate: "2026-03-15", toDate: "2026-03-15", days: 1, reason: "Personal", status: "Rejected" },
  { _id: "lv007", employee: "Vignesh", leaveType: "Annual Leave", fromDate: "2026-05-05", toDate: "2026-05-07", days: 3, reason: "Travel", status: "Approved" },
  { _id: "lv008", employee: "Siva", leaveType: "Sick Leave", fromDate: "2026-02-18", toDate: "2026-02-19", days: 2, reason: "Cold & flu", status: "Approved" },
  { _id: "lv009", employee: "Sabari", leaveType: "Casual Leave", fromDate: "2026-06-05", toDate: "2026-06-05", days: 1, reason: "Personal work", status: "Pending" },
  { _id: "lv010", employee: "John Employee", leaveType: "Sick Leave", fromDate: "2026-01-14", toDate: "2026-01-15", days: 2, reason: "Fever and cold", status: "Approved" },
];

const LEAVE_TYPE_COLORS = {
  "Sick Leave": "red",
  "Casual Leave": "yellow",
  "Annual Leave": "blue",
  "Earned Leave": "violet",
};

const STATUS_COLORS = {
  Approved: "green",
  Pending: "yellow",
  Rejected: "red",
};

const LEAVE_BALANCE = [
  { label: "Annual Leave", total: 18, used: 5, color: "blue" },
  { label: "Sick Leave", total: 12, used: 5, color: "red" },
  { label: "Casual Leave", total: 10, used: 4, color: "yellow" },
  { label: "Loss of Pay", total: 0, used: 0, color: "gray" },
];

const ROWS_PER_PAGE = 8;

const Leave = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const can = usePermission();
  const isEmployee = !can("leave.view_all");
  const canApprove = can("leave.approve");
  const canReject  = can("leave.reject");

  const [leaves, setLeaves] = useState(MOCK_LEAVES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewLeave, setViewLeave] = useState(null);
  const [showApply, setShowApply] = useState(false);
  
  const [form, setForm] = useState({
    employee: isEmployee ? user?.name || "" : "",
    leaveType: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const visibleLeaves = isEmployee ? leaves.filter((l) => l.employee === user?.name) : leaves;

  const total = visibleLeaves.length;
  const approved = visibleLeaves.filter((l) => l.status === "Approved").length;
  const pending = visibleLeaves.filter((l) => l.status === "Pending").length;
  const rejected = visibleLeaves.filter((l) => l.status === "Rejected").length;

  const filtered = visibleLeaves.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || (l.employee || "").toLowerCase().includes(q) || (l.leaveType || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchType = typeFilter === "All" || l.leaveType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleApprove = (id) => {
    const emp = leaves.find((l) => l._id === id)?.employee || "";
    setLeaves((prev) => prev.map((l) => (l._id === id ? { ...l, status: "Approved" } : l)));
    show(`${emp}'s leave request approved`, "success");
    if (viewLeave?._id === id) setViewLeave(null);
  };

  const handleReject = (id) => {
    const emp = leaves.find((l) => l._id === id)?.employee || "";
    setLeaves((prev) => prev.map((l) => (l._id === id ? { ...l, status: "Rejected" } : l)));
    show(`${emp}'s leave request rejected`, "error");
    if (viewLeave?._id === id) setViewLeave(null);
  };

  const handleApply = () => {
    if (!form.employee.trim() || !form.fromDate || !form.toDate) return;
    const from = new Date(form.fromDate), to = new Date(form.toDate);
    const days = Math.max(1, Math.round((to - from) / 86400000) + 1);
    setLeaves((prev) => [{ _id: `lv${Date.now()}`, ...form, days, status: "Pending" }, ...prev]);
    setForm({ employee: isEmployee ? user?.name || "" : "", leaveType: "Casual Leave", fromDate: "", toDate: "", reason: "" });
    setShowApply(false);
    show("Leave request submitted successfully", "success");
  };

  const headers = isEmployee
    ? ["Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"]
    : ["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"];

  return (
    <Box>
      <AppPageHeader
        title={isEmployee ? "My Leave" : "Leave Management"}
        sub={isEmployee ? "Apply and track your leave requests" : "Track and manage employee leave requests"}
        action={
          <AppButton leftSection={<Plus size={16} />} onClick={() => setShowApply(true)}>
            Apply Leave
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<Users size={22}/>}       label="Total Requests" value={total}    color="blue" />
        <AppStatCard icon={<CheckCircle size={22}/>} label="Approved"       value={approved} color="green" />
        <AppStatCard icon={<Clock size={22}/>}       label="Pending"        value={pending}  color="yellow" />
        <AppStatCard icon={<XCircle size={22}/>}     label="Rejected"       value={rejected} color="red" />
      </SimpleGrid>

      {/* Leave Balance Section (always visible or only employee?) */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
        {LEAVE_BALANCE.map((b) => {
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

      <Paper withBorder radius="xl" style={{ overflow: "hidden" }}>
        <Group p="md" pb="sm" gap="sm" wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <TextInput
            placeholder="Search employee or leave type…"
            leftSection={<Search size={15} />}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: 200 }}
            size="sm" radius="md"
          />
          <Select
            size="sm" radius="md"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v || "All"); setCurrentPage(1); }}
            data={["All", "Approved", "Pending", "Rejected"].map(s => ({ value: s, label: s === "All" ? "All Status" : s }))}
            style={{ minWidth: 140 }}
          />
          <Select
            size="sm" radius="md"
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v || "All"); setCurrentPage(1); }}
            data={["All", "Sick Leave", "Casual Leave", "Annual Leave", "Earned Leave"].map(t => ({ value: t, label: t === "All" ? "All Types" : t }))}
            style={{ minWidth: 160 }}
          />
          <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </Text>
        </Group>

        <AppTable
          headers={headers}
          data={filtered}
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
                      <Eye size={14} />
                    </ActionIcon>
                  </Tooltip>
                  {leave.status === "Pending" && (canApprove || canReject) && (
                    <>
                      {canApprove && (
                        <Tooltip label="Approve">
                          <ActionIcon variant="light" color="green" size="sm" radius="md" onClick={() => handleApprove(leave._id)}>
                            <Check size={14} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {canReject && (
                        <Tooltip label="Reject">
                          <ActionIcon variant="light" color="red" size="sm" radius="md" onClick={() => handleReject(leave._id)}>
                            <X size={14} />
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
      </Paper>

      {/* View Leave Modal */}
      <AppModal opened={!!viewLeave} onClose={() => setViewLeave(null)} title="Leave Request Details" icon={<Clock size={20} />} iconColor="#3b82f6" size="md">
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
              <Box>
                <Text fz="sm" c="dimmed">Leave Type</Text>
                <Text fz="md" fw={500}>{viewLeave.leaveType}</Text>
              </Box>
              <Box>
                <Text fz="sm" c="dimmed">Status</Text>
                <Badge color={STATUS_COLORS[viewLeave.status] || "gray"} variant="light">{viewLeave.status}</Badge>
              </Box>
              <Box>
                <Text fz="sm" c="dimmed">From</Text>
                <Text fz="md" fw={500}>{viewLeave.fromDate}</Text>
              </Box>
              <Box>
                <Text fz="sm" c="dimmed">To</Text>
                <Text fz="md" fw={500}>{viewLeave.toDate} ({viewLeave.days} days)</Text>
              </Box>
            </SimpleGrid>
            <Box>
              <Text fz="sm" c="dimmed">Reason</Text>
              <Paper withBorder p="sm" bg="var(--mantine-color-gray-0)" mt={4}>
                <Text fz="sm">{viewLeave.reason}</Text>
              </Paper>
            </Box>
            {viewLeave.status === "Pending" && (canApprove || canReject) && (
              <Group grow mt="md">
                {canReject  && <AppButton variant="outline" color="red"   onClick={() => handleReject(viewLeave._id)}>Reject</AppButton>}
                {canApprove && <AppButton color="green" onClick={() => handleApprove(viewLeave._id)}>Approve</AppButton>}
              </Group>
            )}
          </Stack>
        )}
      </AppModal>

      {/* Apply Leave Modal */}
      <AppModal opened={showApply} onClose={() => setShowApply(false)} title="Apply Leave" icon={<Plus size={20} />} iconColor="#10b981" size="md">
        <Stack gap="md">
          {!isEmployee && (
            <AppInput label="Employee Name" placeholder="E.g. Safeer" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} />
          )}
          <Select label="Leave Type" value={form.leaveType} onChange={(v) => setForm({ ...form, leaveType: v })} data={["Sick Leave", "Casual Leave", "Annual Leave", "Earned Leave"]} />
          <SimpleGrid cols={2}>
            <AppInput type="date" label="From Date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
            <AppInput type="date" label="To Date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
          </SimpleGrid>
          <AppInput label="Reason" placeholder="Briefly explain the reason for your leave..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Group justify="flex-end" mt="md">
            <AppButton variant="default" onClick={() => setShowApply(false)}>Cancel</AppButton>
            <AppButton onClick={handleApply}>Submit Request</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default Leave;
