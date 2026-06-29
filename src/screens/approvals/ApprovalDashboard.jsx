import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, Tabs, Badge, Modal } from "@mantine/core";
import {
  IconCalendarOff, IconClock, IconReceipt, IconUserCheck,
  IconCheck, IconX, IconAlertCircle,
} from "@tabler/icons-react";
import { fetchApprovals, approveLeave, approveExpense, reviewOnboarding } from "../../api/approvalsApi";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function ApprovalDashboard({ darkMode }) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("leaves");
  const [modal, setModal] = useState(null); // { type, item }
  const [note, setNote] = useState("");

  const { data: approvals, isLoading } = useQuery({
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
    <Box style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: rowBg, border: `1px solid ${border}`, marginBottom: 8 }}>
      {children}
    </Box>
  );

  const ApproveRejectBtns = ({ onApprove, onReject }) => (
    <Group gap={6} style={{ flexShrink: 0 }}>
      <button onClick={onApprove} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <IconCheck size={14} color="#16a34a" stroke={2.5} />
      </button>
      <button onClick={onReject} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <IconX size={14} color="#dc2626" stroke={2.5} />
      </button>
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
              <Box key={b.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 16px", textAlign: "center" }}>
                <Text fz="1.4rem" fw={900} c={b.color} lh={1}>{b.count}</Text>
                <Text fz="xs" c={sub} fw={600}>{b.label}</Text>
              </Box>
            ))}
          </Group>
        }
      />

      <Box style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, padding: 24 }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="leaves"   leftSection={<IconCalendarOff size={14} stroke={1.8} />}>
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
                  {lv.reason && <Text fz="xs" c={sub} mt={1} style={{ fontStyle: "italic" }}>"{lv.reason}"</Text>}
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
                  {ex.desc && <Text fz="xs" c={sub} mt={1} style={{ fontStyle: "italic" }}>"{ex.desc}"</Text>}
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
                    <Box style={{ width: 80, height: 4, borderRadius: 2, background: border, overflow: "hidden" }}>
                      <Box style={{ width: `${emp.profileCompletion}%`, height: "100%", background: "#3b82f6", borderRadius: 2 }} />
                    </Box>
                    <Text fz={10} c={sub} fw={600}>{emp.profileCompletion}% complete</Text>
                  </Group>
                </Box>
                <Group gap={6} style={{ flexShrink: 0 }}>
                  <button onClick={() => onboardMut.mutate({ id: emp.id, action: "Approved" })} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#16a34a", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    Approve
                  </button>
                  <button onClick={() => setModal({ type: "onboard", item: emp })} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    Reject
                  </button>
                </Group>
              </Row>
            ))}
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Note Modal */}
      <Modal opened={!!modal} onClose={() => { setModal(null); setNote(""); }}
        title={modal?.type === "leave" ? "Reject Leave Request" : "Reject Onboarding"}
        centered radius="xl" size="sm"
        styles={{ header: { background: card, borderBottom: `1px solid ${border}` }, body: { background: card } }}>
        <Text fz="sm" c={sub} mb={12}>Add a note (optional):</Text>
        <textarea
          placeholder="Reason..."
          value={note} onChange={e => setNote(e.target.value)}
          rows={3}
          style={{ width: "100%", borderRadius: 8, border: `1px solid ${border}`, background: darkMode ? "#0f172a" : "#f8fafc", color: text, padding: "10px 12px", fontSize: 13, resize: "vertical" }}
        />
        <Group justify="flex-end" mt={16} gap={8}>
          <button onClick={() => { setModal(null); setNote(""); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => {
            if (modal.type === "leave") leaveMut.mutate({ id: modal.item.id, action: "Rejected" });
            else onboardMut.mutate({ id: modal.item.id, action: "Rejected" });
          }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Confirm Reject
          </button>
        </Group>
      </Modal>
    </Box>
  );
}
