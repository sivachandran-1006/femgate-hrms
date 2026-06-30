import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, Avatar, Badge, SimpleGrid, Modal, Stack, Paper, Button, ActionIcon, Textarea } from "@mantine/core";
import { useState } from "react";
import {
  IconUsers, IconCalendarOff, IconCheck, IconX,
} from "@tabler/icons-react";
import { fetchMyTeam, fetchApprovals, approveLeave } from "../../api/approvalsApi";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { getInitials, getAvatarColor } from "../../utils/helpers";

const statusColor = (s) => s === "Active" ? "green" : s === "On Leave" ? "yellow" : "gray";

export default function MyTeam({ darkMode }) {
  const qc = useQueryClient();
  const [leaveModal, setLeaveModal] = useState(null);
  const [note, setNote] = useState("");

  const { data: team = [] } = useQuery({
    queryKey: ["my-team"],
    queryFn: () => fetchMyTeam().then(r => r.data?.data ?? r.data ?? []),
  });

  const { data: approvals } = useQuery({
    queryKey: ["approvals"],
    queryFn: () => fetchApprovals().then(r => r.data?.data ?? r.data),
  });

  const pendingLeaves = approvals?.leaves || [];

  const approveMut = useMutation({
    mutationFn: ({ id, action }) => approveLeave(id, { action, note }),
    onSuccess: () => { qc.invalidateQueries(["approvals"]); setLeaveModal(null); setNote(""); },
  });

  const card   = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text   = darkMode ? "#f1f5f9" : "#0f172a";
  const sub    = darkMode ? "#94a3b8" : "#64748b";

  if (!team.length) return (
    <Stack align="center" justify="center" py={60} gap="xs">
      <IconUsers size={48} color={sub} stroke={1.2} />
      <Text fz="lg" fw={700} c={text}>No Direct Reportees</Text>
      <Text fz="sm" c={sub}>Employees who report to you will appear here.</Text>
    </Stack>
  );

  return (
    <Box>
      <AppPageHeader title="My Team" sub={`${team.length} direct reportees`} mb="xl" />

      {/* Team Members */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
        {team.map((emp) => {
          const av = getAvatarColor(emp.name);
          return (
            <Paper key={emp.id} style={{ background: card, border: `1px solid ${border}` }} radius={16} p={20}>
              <Group gap={14} mb={14}>
                <Avatar size={48} radius="xl" style={{ background: av.bg, color: av.color, fontWeight: 700 }}>
                  {getInitials(emp.name)}
                </Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={700} fz="sm" c={text} truncate>{emp.name}</Text>
                  <Text fz="xs" c={sub}>{emp.designation || "—"}</Text>
                </Box>
                <Badge size="xs" fw={700} color={statusColor(emp.status)} variant="light" radius="xl">
                  {emp.status}
                </Badge>
              </Group>
              <Box style={{ borderTop: `1px solid ${border}`, paddingTop: 12 }}>
                <Group gap={6} mb={4}>
                  <Text fz="xs" c={sub}>Dept:</Text>
                  <Text fz="xs" c={text} fw={600}>{emp.department || "—"}</Text>
                </Group>
                <Group gap={6}>
                  <Text fz="xs" c={sub}>ID:</Text>
                  <Text fz="xs" c={text} fw={600}>{emp.employeeId}</Text>
                </Group>
              </Box>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Pending Leave Approvals */}
      {pendingLeaves.length > 0 && (
        <Paper style={{ background: card, border: `1px solid ${border}` }} radius={20} p={24}>
          <Group justify="space-between" mb={16}>
            <Group gap={10}>
              <Paper w={36} h={36} radius={10} style={{ background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconCalendarOff size={18} color="#3b82f6" stroke={1.8} />
              </Paper>
              <Box>
                <Text fw={700} fz="md" c={text}>Pending Leave Approvals</Text>
                <Text fz="xs" c={sub}>{pendingLeaves.length} requests waiting</Text>
              </Box>
            </Group>
          </Group>

          <Stack gap={8}>
            {pendingLeaves.map((lv) => (
              <Group key={lv.id} gap={12} align="center"
                style={{ padding: "12px 16px", borderRadius: 12, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${border}` }}>
                <Box style={{ flex: 1 }}>
                  <Text fz="sm" fw={600} c={text}>{lv.employee?.name || "Employee"}</Text>
                  <Text fz="xs" c={sub}>{lv.type} · {lv.days} day{lv.days > 1 ? "s" : ""} · {new Date(lv.fromDate).toLocaleDateString("en-IN")} – {new Date(lv.toDate).toLocaleDateString("en-IN")}</Text>
                  {lv.reason && <Text fz="xs" c={sub} mt={2} fs="italic">"{lv.reason}"</Text>}
                </Box>
                <Group gap={6}>
                  <ActionIcon
                    variant="light"
                    color="green"
                    size={32}
                    radius={8}
                    onClick={() => approveMut.mutate({ id: lv.id, action: "Approved" })}
                  >
                    <IconCheck size={14} stroke={2.5} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size={32}
                    radius={8}
                    onClick={() => setLeaveModal(lv)}
                  >
                    <IconX size={14} stroke={2.5} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Reject with note modal */}
      <Modal
        opened={!!leaveModal}
        onClose={() => setLeaveModal(null)}
        title="Reject Leave Request"
        centered
        radius="xl"
        size="sm"
        styles={{ header: { background: card, borderBottom: `1px solid ${border}` }, body: { background: card } }}
      >
        <Text fz="sm" c={sub} mb={12}>
          Rejecting leave for <strong>{leaveModal?.employee?.name}</strong>. Add a note (optional):
        </Text>
        <Textarea
          placeholder="Reason for rejection..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          styles={{
            input: { background: darkMode ? "#0f172a" : "#f8fafc", color: text, borderColor: border },
          }}
        />
        <Group justify="flex-end" mt={16} gap={8}>
          <Button variant="outline" color="gray" onClick={() => setLeaveModal(null)}>Cancel</Button>
          <Button color="red" fw={600} onClick={() => approveMut.mutate({ id: leaveModal.id, action: "Rejected" })}>
            Reject
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
