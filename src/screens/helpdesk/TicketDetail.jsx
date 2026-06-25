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
import { useTicket, useTicketComments, useTicketAudit, useAddComment, useSetTicketStatus, useAssignTicket } from "../../queries/useTickets";

const STATUS_COLOR = { Open: "blue", Assigned: "cyan", InProgress: "yellow", Pending: "orange", PendingUser: "orange", Resolved: "green", Closed: "gray", Cancelled: "red" };
const PRIORITY_COLOR = { Low: "gray", Medium: "blue", High: "orange", Critical: "red" };
const STATUSES = ["Open", "Assigned", "InProgress", "Pending", "PendingUser", "Resolved", "Closed", "Cancelled"];
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const Field = ({ label, value }) => (<Box><Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text><Text size="sm" fw={500}>{value || "—"}</Text></Box>);

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const { data: ticket, isLoading, isError } = useTicket(id);
  const { data: comments = [] } = useTicketComments(id);
  const { data: audit = [] } = useTicketAudit(id);
  const statusMut = useSetTicketStatus();
  const assignMut = useAssignTicket();
  const commentMut = useAddComment();

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
