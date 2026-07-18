import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Loader, Box, Alert,
  ActionIcon, Divider, Button, Select, Textarea, Switch, Paper, Avatar,
} from "@mantine/core";
import {
  IconArrowLeft, IconTicket, IconMessage, IconPaperclip, IconClipboardList,
  IconAlertCircle, IconSend, IconUserPlus, IconArrowUp,
} from "@tabler/icons-react";

import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { getInitials }   from "../../utils/helpers";

const STATUS_COLOR = { Open: "blue", Assigned: "cyan", InProgress: "yellow", Pending: "orange", PendingUser: "orange", Resolved: "green", Closed: "gray", Cancelled: "red" };
const PRIORITY_COLOR = { Low: "gray", Medium: "blue", High: "orange", Critical: "red" };
const STATUSES = ["Open", "Assigned", "InProgress", "Pending", "PendingUser", "Resolved", "Closed", "Cancelled"];

const MOCK_TICKETS = [
  {
    id: "1", ticketId: "HD-1042", subject: "Laptop screen flickering intermittently",
    description: "My laptop screen starts flickering after 20-30 minutes of use, especially when running video calls. Started happening since last week's Windows update.",
    raisedBy: "Ananya Sharma", category: "IT Equipment", department: "Engineering", priority: "High", status: "InProgress",
    assignedTo: "IT Support Team", slaBreached: false, createdAt: "2026-07-10T09:15:00", dueDate: "2026-07-13T18:00:00",
  },
  {
    id: "2", ticketId: "HD-1041", subject: "Unable to access payroll portal",
    description: "Getting a 403 error whenever I try to log into the payroll self-service portal from home network. Works fine on office wifi.",
    raisedBy: "Rohit Verma", category: "Access & Permissions", department: "Finance", priority: "Medium", status: "Assigned",
    assignedTo: "Priya Nair", slaBreached: false, createdAt: "2026-07-09T11:40:00", dueDate: "2026-07-12T18:00:00",
  },
  {
    id: "3", ticketId: "HD-1038", subject: "Reimbursement claim stuck in approval",
    description: "Submitted a travel reimbursement claim on July 1st, still shows 'Pending Manager Approval' after 8 days. Manager confirms he approved it already.",
    raisedBy: "Fatima Khan", category: "Finance & Reimbursement", department: "Sales", priority: "Medium", status: "PendingUser",
    assignedTo: "Finance Helpdesk", slaBreached: true, createdAt: "2026-07-01T14:20:00", dueDate: "2026-07-05T18:00:00",
  },
  {
    id: "4", ticketId: "HD-1035", subject: "Request for new monitor",
    description: "Requesting an additional 24-inch monitor for dual-screen setup, approved verbally by team lead.",
    raisedBy: "David Chen", category: "IT Equipment", department: "Design", priority: "Low", status: "Open",
    assignedTo: null, slaBreached: false, createdAt: "2026-06-28T10:05:00", dueDate: "2026-07-05T18:00:00",
  },
  {
    id: "5", ticketId: "HD-1030", subject: "VPN disconnects every few minutes",
    description: "Company VPN drops connection every 5-10 minutes while working remotely, forcing repeated re-authentication.",
    raisedBy: "Meera Iyer", category: "Network", department: "Engineering", priority: "Critical", status: "Resolved",
    assignedTo: "IT Support Team", slaBreached: false, createdAt: "2026-06-20T08:30:00", dueDate: "2026-06-22T18:00:00",
  },
  {
    id: "6", ticketId: "HD-1024", subject: "Onboarding laptop not provisioned",
    description: "New joiner starting Monday still hasn't received their laptop allocation and software provisioning request.",
    raisedBy: "HR Operations", category: "Onboarding", department: "Human Resources", priority: "High", status: "Closed",
    assignedTo: "IT Support Team", slaBreached: false, createdAt: "2026-06-15T09:00:00", dueDate: "2026-06-17T18:00:00",
  },
  {
    id: "7", ticketId: "HD-1019", subject: "Email quota exceeded, cannot send attachments",
    description: "Mailbox is at 98% storage, bouncing back emails with attachments over 5MB. Need quota increase or archive cleanup.",
    raisedBy: "Karan Mehta", category: "IT Equipment", department: "Marketing", priority: "Low", status: "Cancelled",
    assignedTo: null, slaBreached: false, createdAt: "2026-06-10T13:45:00", dueDate: "2026-06-14T18:00:00",
  },
];

const MOCK_COMMENTS_BY_TICKET = {
  1: [
    { id: "c1", authorName: "Ananya Sharma", isInternal: false, body: "Adding a screen recording of the flicker for reference.", createdAt: "2026-07-10T09:20:00" },
    { id: "c2", authorName: "IT Support Team", isInternal: false, body: "Thanks for reporting this. Can you confirm the laptop model and try rolling back the last Windows update?", createdAt: "2026-07-10T14:05:00" },
    { id: "c3", authorName: "IT Support Team", isInternal: true, body: "Checked asset tag — this model had a known display driver issue post KB5039. Scheduling driver rollback.", createdAt: "2026-07-11T10:00:00" },
    { id: "c4", authorName: "Ananya Sharma", isInternal: false, body: "Rolled back the update, flickering has reduced but not gone completely.", createdAt: "2026-07-12T16:30:00" },
  ],
  2: [
    { id: "c1", authorName: "Rohit Verma", isInternal: false, body: "Still can't log in, tried a different browser too.", createdAt: "2026-07-09T12:00:00" },
    { id: "c2", authorName: "Priya Nair", isInternal: false, body: "Looking into your account permissions, will update shortly.", createdAt: "2026-07-09T15:20:00" },
  ],
  3: [
    { id: "c1", authorName: "Fatima Khan", isInternal: false, body: "Following up — this has been pending for over a week now, please expedite.", createdAt: "2026-07-08T09:00:00" },
    { id: "c2", authorName: "Finance Helpdesk", isInternal: true, body: "Approval chain shows a bottleneck at second-level sign-off. Escalating to finance manager.", createdAt: "2026-07-08T11:15:00" },
  ],
  5: [
    { id: "c1", authorName: "Meera Iyer", isInternal: false, body: "VPN client updated to latest version as suggested, testing now.", createdAt: "2026-06-21T09:00:00" },
    { id: "c2", authorName: "IT Support Team", isInternal: false, body: "Great, marking as resolved. Please reopen if the issue recurs.", createdAt: "2026-06-22T17:00:00" },
  ],
};

const MOCK_AUDIT_BY_TICKET = {
  1: [
    { id: "a1", action: "Created", details: "Ticket raised by Ananya Sharma", actorName: "Ananya Sharma", createdAt: "2026-07-10T09:15:00" },
    { id: "a2", action: "Assigned", details: "Assigned to IT Support Team", actorName: "System", createdAt: "2026-07-10T09:30:00" },
    { id: "a3", action: "StatusChange", details: "Open → InProgress", actorName: "IT Support Team", createdAt: "2026-07-11T10:00:00" },
  ],
  2: [
    { id: "a1", action: "Created", details: "Ticket raised by Rohit Verma", actorName: "Rohit Verma", createdAt: "2026-07-09T11:40:00" },
    { id: "a2", action: "Assigned", details: "Assigned to Priya Nair", actorName: "System", createdAt: "2026-07-09T14:00:00" },
  ],
  3: [
    { id: "a1", action: "Created", details: "Ticket raised by Fatima Khan", actorName: "Fatima Khan", createdAt: "2026-07-01T14:20:00" },
    { id: "a2", action: "Escalated", details: "Priority raised to Medium", actorName: "Finance Helpdesk", createdAt: "2026-07-08T11:15:00" },
    { id: "a3", action: "StatusChange", details: "InProgress → PendingUser", actorName: "Finance Helpdesk", createdAt: "2026-07-08T11:16:00" },
  ],
  5: [
    { id: "a1", action: "Created", details: "Ticket raised by Meera Iyer", actorName: "Meera Iyer", createdAt: "2026-06-20T08:30:00" },
    { id: "a2", action: "StatusChange", details: "Open → Resolved", actorName: "IT Support Team", createdAt: "2026-06-22T17:00:00" },
  ],
};
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const Field = ({ label, value }) => (<Box><Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text><Text size="sm" fw={500}>{value || "—"}</Text></Box>);

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const { data: rawTicket, isLoading, isError: rawIsError } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const ticket = rawTicket ?? MOCK_TICKETS.find((m) => String(m.id) === String(id)) ?? MOCK_TICKETS[0];
  const isError = rawIsError && !ticket;
  const { data: rawComments } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const comments = rawComments?.length ? rawComments : (MOCK_COMMENTS_BY_TICKET[ticket?.id] || []);
  const { data: rawAudit } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const audit = rawAudit?.length ? rawAudit : (MOCK_AUDIT_BY_TICKET[ticket?.id] || []);
  const statusMut = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const assignMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const commentMut = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignName, setAssignName] = useState("");
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escPriority, setEscPriority] = useState("High");

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (isError || !ticket) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Ticket not found. <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/helpdesk")}>Back to list</Text>
    </Alert>
  );

  const changeStatus = async (status) => { try { await statusMut.mutateAsync({ id: ticket.id, status }); toast(`Status → ${status}`, "success"); } catch { toast("Failed", "error"); } };
  const sendReply = async () => {
    if (!reply.trim()) return;
    try { await commentMut.mutateAsync({ id: ticket.id, body: reply, isInternal: internal }); setReply(""); setInternal(false); toast("Message added", "success"); }
    catch { toast("Failed to send", "error"); }
  };
  const doAssign = async () => { try { await assignMut.mutateAsync({ id: ticket.id, assignedTo: assignName }); toast("Ticket assigned", "success"); setAssignOpen(false); setAssignName(""); } catch { toast("Failed", "error"); } };
  const doEscalate = async () => { try { await assignMut.mutateAsync({ id: ticket.id, escalate: true, priority: escPriority }); toast(`Escalated to ${escPriority}`, "info"); setEscalateOpen(false); } catch { toast("Failed", "error"); } };

  return (
    <>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/helpdesk")} title="Back"><IconArrowLeft size={18} /></ActionIcon>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--mantine-color-blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconTicket size={24} color="#3b82f6" /></div>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{ticket.ticketId}</Text>
              <Badge color={STATUS_COLOR[ticket.status] || "gray"} variant="light" radius="xl">{ticket.status}</Badge>
              <Badge color={PRIORITY_COLOR[ticket.priority] || "gray"} variant="light" radius="sm">{ticket.priority}</Badge>
              {ticket.slaBreached && <Badge color="red" radius="sm">SLA Breached</Badge>}
            </Group>
            <Text size="sm" c="dimmed">{ticket.subject}</Text>
          </div>
        </Group>
        <Group gap="sm">
          <AppButton variant="default" leftSection={<IconUserPlus size={15} />} onClick={() => setAssignOpen(true)}>Assign</AppButton>
          <AppButton variant="default" leftSection={<IconArrowUp size={15} />} onClick={() => setEscalateOpen(true)}>Escalate</AppButton>
          <Select size="sm" w={150} data={STATUSES} value={ticket.status} onChange={(v) => v && changeStatus(v)} />
        </Group>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"     leftSection={<IconTicket size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="conversation" leftSection={<IconMessage size={15} />}>Conversation</Tabs.Tab>
          <Tabs.Tab value="attachments"  leftSection={<IconPaperclip size={15} />}>Attachments</Tabs.Tab>
          <Tabs.Tab value="activity"     leftSection={<IconClipboardList size={15} />}>Activity Logs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <AppSection title="Ticket Details">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Ticket ID" value={ticket.ticketId} />
              <Field label="Requester" value={ticket.raisedBy} />
              <Field label="Category" value={ticket.category} />
              <Field label="Department" value={ticket.department} />
              <Field label="Priority" value={ticket.priority} />
              <Field label="Status" value={ticket.status} />
              <Field label="Assigned Agent" value={ticket.assignedTo} />
              <Field label="Created" value={fmtDateTime(ticket.createdAt)} />
              <Field label="Due Date" value={fmtDateTime(ticket.dueDate)} />
            </SimpleGrid>
            <Divider my="md" />
            <Field label="Description" value={ticket.description} />
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="conversation">
          <AppSection title="Conversation">
            <Stack gap="md" mb="lg">
              {comments.length === 0 ? <AppEmptyState message="No messages yet" py={40} />
                : comments.map((c) => (
                  <Paper key={c.id} withBorder radius="md" p="md" style={{ background: c.isInternal ? "var(--mantine-color-yellow-light)" : undefined }}>
                    <Group justify="space-between" mb={6}>
                      <Group gap="sm"><Avatar size={28} radius="xl">{getInitials(c.authorName || "?")}</Avatar><Text size="sm" fw={600}>{c.authorName}</Text>{c.isInternal && <Badge size="xs" color="yellow" variant="light">Internal Note</Badge>}</Group>
                      <Text size="xs" c="dimmed">{fmtDateTime(c.createdAt)}</Text>
                    </Group>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{c.body}</Text>
                  </Paper>
                ))}
            </Stack>
            <Divider mb="md" />
            <Textarea placeholder="Type a reply…" autosize minRows={3} value={reply} onChange={(e) => setReply(e.target.value)} mb="sm" />
            <Group justify="space-between">
              <Switch label="Internal note (not visible to requester)" checked={internal} onChange={(e) => setInternal(e.currentTarget.checked)} />
              <AppButton leftSection={<IconSend size={15} />} loading={commentMut.isPending} onClick={sendReply}>Send</AppButton>
            </Group>
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="attachments">
          <AppSection title="Attachments">
            {comments.filter((c) => c.attachmentUrl).length === 0
              ? <AppEmptyState message="No attachments" sub="Files shared in the conversation appear here." py={60} />
              : <Stack gap="xs">{comments.filter((c) => c.attachmentUrl).map((c) => (<Group key={c.id} justify="space-between"><a href={c.attachmentUrl} target="_blank" rel="noreferrer">{c.attachmentUrl.split("/").pop()}</a><Text size="xs" c="dimmed">{c.authorName} · {fmtDateTime(c.createdAt)}</Text></Group>))}</Stack>}
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <AppSection noPadding title="Activity Logs" sub={`${audit.length} events`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Action", "Details", "By", "When"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {audit.length === 0 ? <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No activity yet" /></Table.Td></Table.Tr>
                    : audit.map((l) => (
                      <Table.Tr key={l.id}>
                        <Table.Td><Badge variant="light" radius="xl">{l.action}</Badge></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{l.details || "—"}</Text></Table.Td>
                        <Table.Td><Text size="sm">{l.actorName || "System"}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{fmtDateTime(l.createdAt)}</Text></Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>
      </Tabs>

      <AppModal opened={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Ticket" icon={<IconUserPlus size={16} color="#6366f1" />} iconColor="#6366f1">
        <Stack gap="md">
          <AppInput label="Assign To (agent/team)" placeholder="e.g. IT Support Team" value={assignName} onChange={(e) => setAssignName(e.target.value)} />
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setAssignOpen(false)}>Cancel</AppButton><AppButton color="indigo" loading={assignMut.isPending} onClick={doAssign}>Assign</AppButton></Group>
        </Stack>
      </AppModal>

      <AppModal opened={escalateOpen} onClose={() => setEscalateOpen(false)} title="Escalate Ticket" icon={<IconArrowUp size={16} color="#f59e0b" />} iconColor="#f59e0b">
        <Stack gap="md">
          <AppInput type="select" label="New Priority" data={["Medium", "High", "Critical"]} value={escPriority} onChange={setEscPriority} />
          <Group justify="flex-end" gap="sm"><AppButton variant="default" onClick={() => setEscalateOpen(false)}>Cancel</AppButton><AppButton color="orange" loading={assignMut.isPending} onClick={doEscalate}>Escalate</AppButton></Group>
        </Stack>
      </AppModal>
    </>
  );
}
