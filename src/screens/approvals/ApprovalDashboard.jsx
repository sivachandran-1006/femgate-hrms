import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, Tabs, Badge, Modal, Stack, Paper, Button, ActionIcon, Textarea, Progress } from "@mantine/core";
import {
  IconCalendarOff, IconReceipt, IconUserCheck,
  IconCheck, IconX,
} from "@tabler/icons-react";
import { fetchApprovals, approveLeave, approveExpense, reviewOnboarding } from "../../api/approvalsApi";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function ApprovalDashboard({ darkMode }) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("leaves");
  const [modal, setModal] = useState(null); // { type, item }
  const [note, setNote] = useState("");

  const { data: approvals } = useQuery({
    queryKey: ["approvals"],
    queryFn: () => fetchApprovals().then(r => r.data?.data ?? r.data),
  });

  const leaveMut = useMutation({
    mutationFn: ({ id, action }) => approveLeave(id, { action, note }),
    onSuccess: () => { qc.invalidateQueries(["approvals"]); setModal(null); setNote(""); },
  });

  const expenseMut = useMutation({
    mutationFn: ({ id, action }) => approveExpense(id, { action }),
    onSuccess: () => { qc.invalidateQueries(["approvals"]); setModal(null); },
  });

  const onboardMut = useMutation({
    mutationFn: ({ id, action }) => reviewOnboarding(id, { action, note }),
    onSuccess: () => { qc.invalidateQueries(["approvals"]); setModal(null); setNote(""); },
  });

  const card   = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text   = darkMode ? "#f1f5f9" : "#0f172a";
  const sub    = darkMode ? "#94a3b8" : "#64748b";
  const rowBg  = darkMode ? "#0f172a" : "#f8fafc";

  const leaves   = approvals?.leaves           || [];
  const expenses = approvals?.expenses         || [];
  const onboard  = approvals?.onboardingPending || [];

  const Row = ({ children }) => (
    <Group gap={12} align="center"
      style={{ padding: "12px 16px", borderRadius: 12, background: rowBg, border: `1px solid ${border}`, marginBottom: 8 }}>
      {children}
    </Group>
  );

  const ApproveRejectBtns = ({ onApprove, onReject }) => (
    <Group gap={6} style={{ flexShrink: 0 }}>
      <ActionIcon variant="light" color="green" size={32} radius={8} onClick={onApprove}>
        <IconCheck size={14} stroke={2.5} />
      </ActionIcon>
      <ActionIcon variant="light" color="red" size={32} radius={8} onClick={onReject}>
        <IconX size={14} stroke={2.5} />
      </ActionIcon>
    </Group>
  );

  return (
    <Box>
      <AppPageHeader
        title="Approval Dashboard"
        sub="Review and approve pending requests"
        mb="xl"
        action={
          <Group gap={10}>
            {[
              { label: "Leaves",   count: leaves.length,   color: "#3b82f6" },
              { label: "Expenses", count: expenses.length, color: "#f59e0b" },
              { label: "Onboard",  count: onboard.length,  color: "#8b5cf6" },
            ].map(b => (
              <Paper key={b.label} style={{ background: card, border: `1px solid ${border}` }} radius={12} px={16} py={8}>
                <Text ta="center" fz="1.4rem" fw={900} c={b.color} lh={1}>{b.count}</Text>
                <Text ta="center" fz="xs" c={sub} fw={600}>{b.label}</Text>
              </Paper>
            ))}
          </Group>
        }
      />

      <Paper style={{ background: card, border: `1px solid ${border}` }} radius={20} p={24}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="leaves" leftSection={<IconCalendarOff size={14} stroke={1.8} />}>
              Leave Requests <Badge size="xs" color="blue" variant="light" ml={4}>{leaves.length}</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="expenses" leftSection={<IconReceipt size={14} stroke={1.8} />}>
              Expenses <Badge size="xs" color="yellow" variant="light" ml={4}>{expenses.length}</Badge>
            </Tabs.Tab>
            <Tabs.Tab value="onboarding" leftSection={<IconUserCheck size={14} stroke={1.8} />}>
              Onboarding <Badge size="xs" color="violet" variant="light" ml={4}>{onboard.length}</Badge>
            </Tabs.Tab>
          </Tabs.List>

          {/* Leave Requests */}
          <Tabs.Panel value="leaves">
            {leaves.length === 0 ? (
              <Text fz="sm" c={sub} ta="center" py="xl">No pending leave requests</Text>
            ) : leaves.map(lv => (
              <Row key={lv.id}>
                <Box style={{ flex: 1 }}>
                  <Text fz="sm" fw={700} c={text}>{lv.employee?.name || "Employee"}</Text>
                  <Text fz="xs" c={sub}>{lv.type} · {lv.days} day{lv.days !== 1 ? "s" : ""} · {fmt(lv.fromDate)} – {fmt(lv.toDate)}</Text>
                  {lv.reason && <Text fz="xs" c={sub} mt={1} fs="italic">"{lv.reason}"</Text>}
                </Box>
                <ApproveRejectBtns
                  onApprove={() => leaveMut.mutate({ id: lv.id, action: "Approved" })}
                  onReject={() => setModal({ type: "leave", item: lv })}
                />
              </Row>
            ))}
          </Tabs.Panel>

          {/* Expenses */}
          <Tabs.Panel value="expenses">
            {expenses.length === 0 ? (
              <Text fz="sm" c={sub} ta="center" py="xl">No pending expense requests</Text>
            ) : expenses.map(ex => (
              <Row key={ex.id}>
                <Box style={{ flex: 1 }}>
                  <Text fz="sm" fw={700} c={text}>{ex.employee || "Employee"}</Text>
                  <Text fz="xs" c={sub}>{ex.category} · ₹{Number(ex.amount).toLocaleString("en-IN")} · {fmt(ex.date)}</Text>
                  {ex.desc && <Text fz="xs" c={sub} mt={1} fs="italic">"{ex.desc}"</Text>}
                </Box>
                <ApproveRejectBtns
                  onApprove={() => expenseMut.mutate({ id: ex.id, action: "Approved" })}
                  onReject={() => expenseMut.mutate({ id: ex.id, action: "Rejected" })}
                />
              </Row>
            ))}
          </Tabs.Panel>

          {/* Onboarding */}
          <Tabs.Panel value="onboarding">
            {onboard.length === 0 ? (
              <Text fz="sm" c={sub} ta="center" py="xl">No pending onboarding reviews</Text>
            ) : onboard.map(emp => (
              <Row key={emp.id}>
                <Box style={{ flex: 1 }}>
                  <Text fz="sm" fw={700} c={text}>{emp.name}</Text>
                  <Text fz="xs" c={sub}>{emp.department} · Joined {fmt(emp.joinDate)}</Text>
                  <Group gap={6} mt={4}>
                    <Progress value={emp.profileCompletion} size={4} radius={2} w={80} color="blue" />
                    <Text fz={10} c={sub} fw={600}>{emp.profileCompletion}% complete</Text>
                  </Group>
                </Box>
                <Group gap={6} style={{ flexShrink: 0 }}>
                  <Button size="xs" color="green" variant="light" fw={600}
                    onClick={() => onboardMut.mutate({ id: emp.id, action: "Approved" })}>
                    Approve
                  </Button>
                  <Button size="xs" variant="outline" color="gray" fw={600}
                    onClick={() => setModal({ type: "onboard", item: emp })}>
                    Reject
                  </Button>
                </Group>
              </Row>
            ))}
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Note Modal */}
      <Modal
        opened={!!modal}
        onClose={() => { setModal(null); setNote(""); }}
        title={modal?.type === "leave" ? "Reject Leave Request" : "Reject Onboarding"}
        centered
        radius="xl"
        size="sm"
        styles={{ header: { background: card, borderBottom: `1px solid ${border}` }, body: { background: card } }}
      >
        <Text fz="sm" c={sub} mb={12}>Add a note (optional):</Text>
        <Textarea
          placeholder="Reason..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          styles={{
            input: { background: darkMode ? "#0f172a" : "#f8fafc", color: text, borderColor: border },
          }}
        />
        <Group justify="flex-end" mt={16} gap={8}>
          <Button variant="outline" color="gray" onClick={() => { setModal(null); setNote(""); }}>Cancel</Button>
          <Button color="red" fw={600} onClick={() => {
            if (modal.type === "leave") leaveMut.mutate({ id: modal.item.id, action: "Rejected" });
            else onboardMut.mutate({ id: modal.item.id, action: "Rejected" });
          }}>
            Confirm Reject
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
