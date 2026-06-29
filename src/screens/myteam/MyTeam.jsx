import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, Avatar, Badge, SimpleGrid, Modal } from "@mantine/core";
import { useState } from "react";
import {
  IconUsers, IconCalendarOff, IconClock, IconTarget,
  IconChevronRight, IconCheck, IconX,
} from "@tabler/icons-react";
import { fetchMyTeam, fetchApprovals, approveLeave } from "../../api/approvalsApi";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { getInitials, getAvatarColor } from "../../utils/helpers";

const statusColor = (s) => s === "Active" ? "#22c55e" : s === "On Leave" ? "#f59e0b" : "#94a3b8";
const statusBg    = (s) => s === "Active" ? "#f0fdf4" : s === "On Leave" ? "#fffbeb" : "#f1f5f9";

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
    <Box style={{ textAlign: "center", padding: 60 }}>
      <IconUsers size={48} color={sub} stroke={1.2} style={{ marginBottom: 16 }} />
      <Text fz="lg" fw={700} c={text}>No Direct Reportees</Text>
      <Text fz="sm" c={sub} mt={4}>Employees who report to you will appear here.</Text>
    </Box>
  );

  return (
    <Box>
      <AppPageHeader title="My Team" sub={`${team.length} direct reportees`} mb="xl" />

      {/* Team Members */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
        {team.map((emp) => {
          const av = getAvatarColor(emp.name);
          return (
            <Box key={emp.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
              <Group gap={14} mb={14}>
                <Avatar size={48} radius="xl" style={{ background: av.bg, color: av.color, fontWeight: 700 }}>
                  {getInitials(emp.name)}
                </Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={700} fz="sm" c={text} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</Text>
                  <Text fz="xs" c={sub}>{emp.designation || "—"}</Text>
                </Box>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: statusBg(emp.status), color: statusColor(emp.status) }}>
                  {emp.status}
                </span>
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
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Pending Leave Approvals */}
      {pendingLeaves.length > 0 && (
        <Box style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, padding: 24 }}>
          <Group justify="space-between" mb={16}>
            <Group gap={10}>
              <Box style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconCalendarOff size={18} color="#3b82f6" stroke={1.8} />
              </Box>
              <Box>
                <Text fw={700} fz="md" c={text}>Pending Leave Approvals</Text>
                <Text fz="xs" c={sub}>{pendingLeaves.length} requests waiting</Text>
              </Box>
            </Group>
          </Group>

          <Box style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingLeaves.map((lv) => (
              <Box key={lv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${border}` }}>
                <Box style={{ flex: 1 }}>
                  <Text fz="sm" fw={600} c={text}>{lv.employee?.name || "Employee"}</Text>
                  <Text fz="xs" c={sub}>{lv.type} · {lv.days} day{lv.days > 1 ? "s" : ""} · {new Date(lv.fromDate).toLocaleDateString("en-IN")} – {new Date(lv.toDate).toLocaleDateString("en-IN")}</Text>
                  {lv.reason && <Text fz="xs" c={sub} mt={2} style={{ fontStyle: "italic" }}>"{lv.reason}"</Text>}
                </Box>
                <Group gap={6}>
                  <button onClick={() => approveMut.mutate({ id: lv.id, action: "Approved" })} style={{
                    width: 32, height: 32, borderRadius: 8, border: "none", background: "#dcfce7",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}>
                    <IconCheck size={14} color="#16a34a" stroke={2.5} />
                  </button>
                  <button onClick={() => setLeaveModal(lv)} style={{
                    width: 32, height: 32, borderRadius: 8, border: "none", background: "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}>
                    <IconX size={14} color="#dc2626" stroke={2.5} />
                  </button>
                </Group>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Reject with note modal */}
      <Modal opened={!!leaveModal} onClose={() => setLeaveModal(null)} title="Reject Leave Request"
        centered radius="xl" size="sm"
        styles={{ header: { background: card, borderBottom: `1px solid ${border}` }, body: { background: card } }}>
        <Text fz="sm" c={sub} mb={12}>
          Rejecting leave for <strong>{leaveModal?.employee?.name}</strong>. Add a note (optional):
        </Text>
        <textarea
          placeholder="Reason for rejection..."
          value={note} onChange={e => setNote(e.target.value)}
          rows={3}
          style={{ width: "100%", borderRadius: 8, border: `1px solid ${border}`, background: darkMode ? "#0f172a" : "#f8fafc", color: text, padding: "10px 12px", fontSize: 13, resize: "vertical" }}
        />
        <Group justify="flex-end" mt={16} gap={8}>
          <button onClick={() => setLeaveModal(null)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => approveMut.mutate({ id: leaveModal.id, action: "Rejected" })} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Reject
          </button>
        </Group>
      </Modal>
    </Box>
  );
}
