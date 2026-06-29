import { useState } from "react";
import {
  Box, Tabs, Group, Text, Badge, Button, Card, Grid, Stack, SimpleGrid,
  TextInput, Select, Textarea, Modal, Table, ActionIcon, Avatar, Loader,
  Center, NumberInput, Progress, Tooltip, Switch,
} from "@mantine/core";
import {
  IconAward, IconHeartHandshake, IconGift, IconChartBar, IconMoodSmile,
  IconBulb, IconActivity, IconCalendarEvent, IconTrophy, IconPlus, IconTrash,
  IconThumbUp, IconStar, IconCoins, IconConfetti, IconClipboardList, IconCheck,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";
import { useToast } from "../../components/ui/Toast";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import {
  useEngagementDashboard, useAwards, useCreateAward, useDeleteAward,
  useKudos, useSendKudos, useReactKudos,
  usePointsBalance, useLeaderboard,
  useRewards, useCreateReward, useDeleteReward, useRedeemReward, useRedemptions,
  useSurveys, useCreateSurvey, usePublishSurvey,
  useSuggestions, useCreateSuggestion, useUpdateSuggestionStatus,
  useWellness, useCreateWellness, useJoinWellness,
  useEvents, useCreateEvent, useDeleteEvent,
  useWall,
} from "../../queries/useEngagement";

const AWARD_TYPES = ["Employee Of The Month", "Star Performer", "Team Excellence Award", "Innovation Award", "Leadership Award", "Customer Appreciation Award", "Custom Award"];
const REWARD_CATEGORIES = ["Gift Voucher", "Amazon Voucher", "Company Merchandise", "Extra Leave", "Training Credit", "Custom Reward"];
const SURVEY_TYPES = ["Employee Satisfaction", "Engagement Survey", "Culture Survey", "Pulse Survey", "Custom Survey"];
const WELLNESS_TYPES = ["Fitness Challenge", "Mental Health Program", "Health Campaign", "Work-Life Balance"];
const EVENT_TYPES = ["Team Building", "Celebration", "Competition", "CSR Activity", "Sports Event", "Cultural Event"];
const SUGGESTION_CATEGORIES = ["Idea", "Feedback", "Improvement"];

const STATUS_COLOR = { New: "blue", "Under Review": "orange", Implemented: "green", Rejected: "red", Pending: "orange", Approved: "blue", Fulfilled: "green", Active: "green", Draft: "gray", Closed: "gray", Upcoming: "blue", Ongoing: "orange", Completed: "green" };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// Build searchable employee dropdown options: value = name, label = "Name (EMP-ID)"
const useEmployeeOptions = () => {
  const { data: employees = [] } = useFetchAllEmployees();
  const options = (employees || []).map((e) => ({
    value: e.name,
    label: e.employeeId ? `${e.name} (${e.employeeId})` : e.name,
  }));
  const byName = Object.fromEntries((employees || []).map((e) => [e.name, e]));
  return { options, byName };
};

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function Kpi({ label, value, icon: Icon, color, sub }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{value ?? "—"}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Card>
  );
}

// ═══ Dashboard Tab ═══
function DashboardTab() {
  const { data: d, isLoading } = useEngagementDashboard();
  const { data: board = [] } = useLeaderboard();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const dash = d || {};
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} spacing="md">
        <Kpi label="Satisfaction Score" value={dash.satisfactionScore} icon={IconMoodSmile} color="green" sub="avg survey score" />
        <Kpi label="Recognitions" value={dash.recognitionsThisMonth} icon={IconAward} color="yellow" sub="this month" />
        <Kpi label="Points Issued" value={dash.rewardPointsIssued} icon={IconCoins} color="orange" sub="all time" />
        <Kpi label="Active Surveys" value={dash.activeSurveys} icon={IconClipboardList} color="blue" />
        <Kpi label="Suggestions" value={dash.suggestionBoxEntries} icon={IconBulb} color="grape" />
        <Kpi label="Wellness" value={dash.wellnessParticipation} icon={IconActivity} color="teal" sub="participants" />
      </SimpleGrid>
      <Card withBorder radius="md" p="md">
        <Group gap="xs" mb="sm"><IconTrophy size={18} color="var(--mantine-color-yellow-6)" /><Text fw={600}>Points Leaderboard</Text></Group>
        {board.length === 0 ? <AppEmptyState icon={<IconTrophy size={24} />} message="No points awarded yet" sub="As employees earn points, the leaderboard fills up here." py={24} /> : (
          <Stack gap="xs">
            {board.map((b, i) => (
              <Group key={b.employee} justify="space-between">
                <Group gap="sm">
                  <Badge color={i === 0 ? "yellow" : i === 1 ? "gray" : i === 2 ? "orange" : "blue"} variant="light" w={28}>{i + 1}</Badge>
                  <Avatar size={26} radius="xl" color="blue">{(b.employee || "?").slice(0, 2).toUpperCase()}</Avatar>
                  <Text size="sm">{b.employee}</Text>
                </Group>
                <Text size="sm" fw={700}>{b.points} pts</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

// ═══ Recognition Wall ═══
function WallTab() {
  const { data, isLoading } = useWall();
  if (isLoading) return <Center h={200}><Loader /></Center>;
  const { awards = [], kudos = [], milestones = [] } = data || {};
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder radius="md" p="md">
          <Group gap="xs" mb="sm"><IconAward size={18} color="var(--mantine-color-yellow-6)" /><Text fw={600}>Recent Awards</Text></Group>
          <Stack gap="sm">
            {awards.length === 0 && <Text size="sm" c="dimmed">No awards yet.</Text>}
            {awards.map((a) => (
              <Box key={a.id} p="xs" style={{ background: "var(--mantine-color-yellow-0)", borderRadius: 8 }}>
                <Group justify="space-between"><Text size="sm" fw={600}>{a.employee}</Text><Badge size="xs" color="yellow">{a.points} pts</Badge></Group>
                <Text size="xs" c="dimmed">{a.awardType} — {a.title}</Text>
              </Box>
            ))}
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder radius="md" p="md">
          <Group gap="xs" mb="sm"><IconHeartHandshake size={18} color="var(--mantine-color-pink-6)" /><Text fw={600}>Recent Kudos</Text></Group>
          <Stack gap="sm">
            {kudos.length === 0 && <Text size="sm" c="dimmed">No kudos yet.</Text>}
            {kudos.map((k) => (
              <Box key={k.id} p="xs" style={{ background: "var(--mantine-color-pink-0)", borderRadius: 8 }}>
                <Text size="xs"><Text span fw={600}>{k.fromEmployee}</Text> → <Text span fw={600}>{k.toEmployee}</Text></Text>
                <Text size="sm">{k.message}</Text>
              </Box>
            ))}
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder radius="md" p="md">
          <Group gap="xs" mb="sm"><IconConfetti size={18} color="var(--mantine-color-grape-6)" /><Text fw={600}>Milestones</Text></Group>
          <Stack gap="sm">
            {milestones.length === 0 && <Text size="sm" c="dimmed">No milestones yet.</Text>}
            {milestones.map((m) => (
              <Box key={m.id} p="xs" style={{ background: "var(--mantine-color-grape-0)", borderRadius: 8 }}>
                <Text size="sm" fw={600}>{m.employee}</Text>
                <Text size="xs" c="dimmed">{m.type} — {fmtDate(m.milestoneDate)}</Text>
              </Box>
            ))}
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

// ═══ Recognition / Awards Tab ═══
function RecognitionTab({ canManage }) {
  const { show } = useToast();
  const { data: awards = [], isLoading } = useAwards();
  const create = useCreateAward();
  const del = useDeleteAward();
  const { options: empOptions, byName } = useEmployeeOptions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", awardType: AWARD_TYPES[0], title: "", description: "", points: 0 });

  const submit = async () => {
    if (!form.employee || !form.title) return show("Employee and title are required", "error");
    try {
      // attach the real employee id when available
      const emp = byName[form.employee];
      await create.mutateAsync({ ...form, employeeId: emp?.id });
      show("Recognition awarded", "success"); setOpen(false);
      setForm({ employee: "", awardType: AWARD_TYPES[0], title: "", description: "", points: 0 });
    } catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Give Recognition</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {awards.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconAward size={24} />} message="No recognitions yet" sub={canManage ? "Recognize an employee's great work to get started." : "Recognitions awarded to the team will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Give Recognition</Button>} /></Box>}
        {awards.map((a) => (
          <Card key={a.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs">
              <Badge color="yellow" variant="light" leftSection={<IconStar size={11} />}>{a.awardType}</Badge>
              {canManage && <ActionIcon variant="subtle" color="red" size="sm" onClick={async () => { await del.mutateAsync(a.id); show("Removed", "success"); }}><IconTrash size={13} /></ActionIcon>}
            </Group>
            <Text fw={700}>{a.title}</Text>
            <Text size="sm">{a.employee}</Text>
            {a.description && <Text size="xs" c="dimmed" mt={4}>{a.description}</Text>}
            <Group justify="space-between" mt="sm"><Text size="xs" c="dimmed">{fmtDate(a.awardDate)}</Text><Badge size="sm" color="orange">{a.points} pts</Badge></Group>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Give Recognition" size="md">
        <Stack gap="sm">
          <Select label="Employee" placeholder="Select employee" required searchable
            data={empOptions} value={form.employee} onChange={(v) => setForm({ ...form, employee: v })}
            nothingFoundMessage="No employee found" />
          <Select label="Award Type" data={AWARD_TYPES} value={form.awardType} onChange={(v) => setForm({ ...form, awardType: v })} />
          <TextInput label="Recognition Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <NumberInput label="Points Awarded" min={0} value={form.points} onChange={(v) => setForm({ ...form, points: v })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Award</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Kudos Tab ═══
function KudosTab() {
  const { show } = useToast();
  const { data: kudos = [], isLoading } = useKudos();
  const send = useSendKudos();
  const react = useReactKudos();
  const { options: empOptions } = useEmployeeOptions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ toEmployee: "", message: "", category: "Appreciation" });

  const submit = async () => {
    if (!form.toEmployee || !form.message) return show("Recipient and message are required", "error");
    try { await send.mutateAsync(form); show("Kudos sent!", "success"); setOpen(false); setForm({ toEmployee: "", message: "", category: "Appreciation" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button leftSection={<IconHeartHandshake size={14} />} onClick={() => setOpen(true)}>Send Kudos</Button></Group>
      <Stack gap="sm">
        {kudos.length === 0 && <AppEmptyState icon={<IconHeartHandshake size={24} />} message="No kudos yet" sub="Be the first to appreciate a teammate!" action={<Button leftSection={<IconHeartHandshake size={14} />} onClick={() => setOpen(true)}>Send Kudos</Button>} />}
        {kudos.map((k) => (
          <Card key={k.id} withBorder radius="md" p="md">
            <Group justify="space-between">
              <Group gap="sm">
                <Avatar size={36} radius="xl" color="pink">{(k.fromEmployee || "?").slice(0, 2).toUpperCase()}</Avatar>
                <Box>
                  <Text size="sm"><Text span fw={600}>{k.fromEmployee}</Text> → <Text span fw={600}>{k.toEmployee}</Text></Text>
                  <Text size="sm" c="dimmed">{k.message}</Text>
                </Box>
              </Group>
              <Stack gap={4} align="center">
                <Badge size="xs" variant="light" color="pink">{k.category}</Badge>
                <Button size="compact-xs" variant="subtle" leftSection={<IconThumbUp size={12} />} onClick={() => react.mutate(k.id)}>{k.reactions}</Button>
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>

      <Modal opened={open} onClose={() => setOpen(false)} title="Send Kudos" size="md">
        <Stack gap="sm">
          <Select label="To (Employee)" placeholder="Select employee" required searchable
            data={empOptions} value={form.toEmployee} onChange={(v) => setForm({ ...form, toEmployee: v })}
            nothingFoundMessage="No employee found" />
          <Select label="Category" data={["Appreciation", "Teamwork", "Innovation", "Help"]} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Textarea label="Message" required minRows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={send.isPending}>Send</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Rewards Tab ═══
function RewardsTab({ canManage }) {
  const { show } = useToast();
  const { data: rewards = [], isLoading } = useRewards();
  const { data: bal } = usePointsBalance();
  const create = useCreateReward();
  const del = useDeleteReward();
  const redeem = useRedeemReward();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: REWARD_CATEGORIES[0], pointsCost: 100, description: "" });

  const submit = async () => {
    if (!form.name) return show("Reward name is required", "error");
    try { await create.mutateAsync(form); show("Reward added", "success"); setOpen(false); setForm({ name: "", category: REWARD_CATEGORIES[0], pointsCost: 100, description: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };
  const doRedeem = async (r) => {
    try { await redeem.mutateAsync(r.id); show(`Redeemed ${r.name}!`, "success"); }
    catch (e) { show(e?.response?.data?.message || "Failed to redeem", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Badge size="lg" color="orange" variant="light" leftSection={<IconCoins size={14} />}>My Balance: {bal?.balance ?? 0} pts</Badge>
        {canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Reward</Button>}
      </Group>
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {rewards.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconGift size={24} />} message="No rewards in the catalog yet" sub={canManage ? "Add rewards employees can redeem with their points." : "Rewards you can redeem will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Reward</Button>} /></Box>}
        {rewards.map((r) => {
          const canAfford = (bal?.balance ?? 0) >= r.pointsCost;
          return (
            <Card key={r.id} withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Badge color="grape" variant="light">{r.category}</Badge>
                {canManage && <ActionIcon variant="subtle" color="red" size="sm" onClick={async () => { await del.mutateAsync(r.id); show("Removed", "success"); }}><IconTrash size={13} /></ActionIcon>}
              </Group>
              <Text fw={700}>{r.name}</Text>
              {r.description && <Text size="xs" c="dimmed" mt={4}>{r.description}</Text>}
              <Group justify="space-between" mt="md">
                <Badge color="orange" size="lg">{r.pointsCost} pts</Badge>
                <Button size="xs" disabled={!canAfford} loading={redeem.isPending && redeem.variables === r.id} onClick={() => doRedeem(r)}>
                  {canAfford ? "Redeem" : "Not enough"}
                </Button>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Add Reward" size="md">
        <Stack gap="sm">
          <TextInput label="Reward Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" data={REWARD_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <NumberInput label="Points Cost" min={1} value={form.pointsCost} onChange={(v) => setForm({ ...form, pointsCost: v })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Add</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Surveys Tab ═══
function SurveysTab({ canManage }) {
  const { show } = useToast();
  const { data: surveys = [], isLoading } = useSurveys();
  const create = useCreateSurvey();
  const publish = usePublishSurvey();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: SURVEY_TYPES[0], description: "", startDate: "", endDate: "", anonymous: true });

  const submit = async () => {
    if (!form.title) return show("Title is required", "error");
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) return show("End date must be after start date", "error");
    try { await create.mutateAsync(form); show("Survey created", "success"); setOpen(false); setForm({ title: "", type: SURVEY_TYPES[0], description: "", startDate: "", endDate: "", anonymous: true }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Survey</Button></Group>}
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Title</Table.Th><Table.Th>Type</Table.Th><Table.Th>Status</Table.Th><Table.Th>Responses</Table.Th><Table.Th>Period</Table.Th><Table.Th /></Table.Tr></Table.Thead>
        <Table.Tbody>
          {surveys.length === 0 && <Table.Tr><Table.Td colSpan={6}><AppEmptyState icon={<IconClipboardList size={24} />} message="No surveys yet" sub={canManage ? "Create a survey to gather employee feedback." : "Surveys assigned to you will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Create Survey</Button>} /></Table.Td></Table.Tr>}
          {surveys.map((s) => (
            <Table.Tr key={s.id}>
              <Table.Td fw={500}>{s.title}</Table.Td>
              <Table.Td>{s.type}</Table.Td>
              <Table.Td><Badge color={STATUS_COLOR[s.status] || "gray"} variant="light">{s.status}</Badge></Table.Td>
              <Table.Td>{s._count?.responses ?? 0}</Table.Td>
              <Table.Td><Text size="xs" c="dimmed">{fmtDate(s.startDate)} – {fmtDate(s.endDate)}</Text></Table.Td>
              <Table.Td>{canManage && s.status === "Draft" && <Button size="compact-xs" onClick={async () => { await publish.mutateAsync(s.id); show("Published", "success"); }}>Publish</Button>}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Create Survey" size="md">
        <Stack gap="sm">
          <TextInput label="Survey Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Type" data={SURVEY_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group grow>
            <TextInput type="date" label="Start Date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <TextInput type="date" label="End Date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Group>
          <Switch label="Anonymous responses" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.currentTarget.checked })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Create</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Suggestions Tab ═══
function SuggestionsTab({ canManage }) {
  const { show } = useToast();
  const { data: suggestions = [], isLoading } = useSuggestions();
  const create = useCreateSuggestion();
  const updateStatus = useUpdateSuggestionStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "Idea", anonymous: false });

  const submit = async () => {
    if (!form.title || !form.body) return show("Title and details are required", "error");
    try { await create.mutateAsync(form); show("Suggestion submitted", "success"); setOpen(false); setForm({ title: "", body: "", category: "Idea", anonymous: false }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      <Group justify="flex-end"><Button leftSection={<IconBulb size={14} />} onClick={() => setOpen(true)}>Submit Suggestion</Button></Group>
      <Stack gap="sm">
        {suggestions.length === 0 && <AppEmptyState icon={<IconBulb size={24} />} message="No suggestions yet" sub="Share an idea or feedback to improve the workplace." action={<Button leftSection={<IconBulb size={14} />} onClick={() => setOpen(true)}>Submit Suggestion</Button>} />}
        {suggestions.map((s) => (
          <Card key={s.id} withBorder radius="md" p="md">
            <Group justify="space-between">
              <Box style={{ flex: 1 }}>
                <Group gap="xs"><Text fw={600}>{s.title}</Text><Badge size="xs" variant="light">{s.category}</Badge>{s.anonymous && <Badge size="xs" color="gray">Anonymous</Badge>}</Group>
                <Text size="sm" c="dimmed" mt={4}>{s.body}</Text>
                <Text size="xs" c="dimmed" mt={4}>{s.anonymous ? "Anonymous" : s.submittedBy} · {fmtDate(s.createdAt)}</Text>
              </Box>
              <Stack gap={4} align="flex-end">
                <Badge color={STATUS_COLOR[s.status] || "gray"} variant="light">{s.status}</Badge>
                {canManage && (
                  <Select size="xs" w={150} data={["New", "Under Review", "Implemented", "Rejected"]} value={s.status}
                    onChange={async (v) => { await updateStatus.mutateAsync({ id: s.id, status: v }); show("Status updated", "success"); }} />
                )}
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>

      <Modal opened={open} onClose={() => setOpen(false)} title="Submit Suggestion" size="md">
        <Stack gap="sm">
          <TextInput label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Category" data={SUGGESTION_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Textarea label="Details" required minRows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Switch label="Submit anonymously" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.currentTarget.checked })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Submit</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Wellness Tab ═══
function WellnessTab({ canManage }) {
  const { show } = useToast();
  const { data: programs = [], isLoading } = useWellness();
  const create = useCreateWellness();
  const join = useJoinWellness();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: WELLNESS_TYPES[0], description: "", pointsReward: 0 });

  const submit = async () => {
    if (!form.name) return show("Program name is required", "error");
    try { await create.mutateAsync(form); show("Program created", "success"); setOpen(false); setForm({ name: "", type: WELLNESS_TYPES[0], description: "", pointsReward: 0 }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };
  const doJoin = async (p) => { try { await join.mutateAsync(p.id); show(`Joined ${p.name}`, "success"); } catch (e) { show(e?.response?.data?.message || "Failed", "error"); } };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Program</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {programs.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconActivity size={24} />} message="No wellness programs yet" sub={canManage ? "Launch a fitness or wellness program for your team." : "Wellness programs you can join will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Program</Button>} /></Box>}
        {programs.map((p) => (
          <Card key={p.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs"><Badge color="teal" variant="light">{p.type}</Badge><Badge color={STATUS_COLOR[p.status] || "gray"} variant="light">{p.status}</Badge></Group>
            <Text fw={700}>{p.name}</Text>
            {p.description && <Text size="xs" c="dimmed" mt={4}>{p.description}</Text>}
            <Group justify="space-between" mt="md">
              <Text size="xs" c="dimmed">{p._count?.participants ?? 0} joined {p.pointsReward > 0 ? `· ${p.pointsReward} pts` : ""}</Text>
              <Button size="xs" variant="light" color="teal" onClick={() => doJoin(p)}>Join</Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Add Wellness Program" size="md">
        <Stack gap="sm">
          <TextInput label="Program Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Type" data={WELLNESS_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <NumberInput label="Points Reward" min={0} value={form.pointsReward} onChange={(v) => setForm({ ...form, pointsReward: v })} />
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Add</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Events Tab ═══
function EventsTab({ canManage }) {
  const { show } = useToast();
  const { data: events = [], isLoading } = useEvents();
  const create = useCreateEvent();
  const del = useDeleteEvent();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: EVENT_TYPES[0], description: "", eventDate: "", location: "" });

  const submit = async () => {
    if (!form.title) return show("Event title is required", "error");
    try { await create.mutateAsync(form); show("Event created", "success"); setOpen(false); setForm({ title: "", type: EVENT_TYPES[0], description: "", eventDate: "", location: "" }); }
    catch (e) { show(e?.response?.data?.message || "Failed", "error"); }
  };

  if (isLoading) return <Center h={200}><Loader /></Center>;
  return (
    <Stack gap="md">
      {canManage && <Group justify="flex-end"><Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Event</Button></Group>}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {events.length === 0 && <Box style={{ gridColumn: "1 / -1" }}><AppEmptyState icon={<IconCalendarEvent size={24} />} message="No events scheduled" sub={canManage ? "Schedule a team event, celebration, or activity." : "Upcoming events will appear here."} action={canManage && <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>Add Event</Button>} /></Box>}
        {events.map((e) => (
          <Card key={e.id} withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs"><Badge color="indigo" variant="light">{e.type}</Badge>
              {canManage && <ActionIcon variant="subtle" color="red" size="sm" onClick={async () => { await del.mutateAsync(e.id); show("Removed", "success"); }}><IconTrash size={13} /></ActionIcon>}
            </Group>
            <Text fw={700}>{e.title}</Text>
            {e.description && <Text size="xs" c="dimmed" mt={4}>{e.description}</Text>}
            <Group gap="xs" mt="sm"><IconCalendarEvent size={13} /><Text size="xs" c="dimmed">{fmtDate(e.eventDate)}{e.location ? ` · ${e.location}` : ""}</Text></Group>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={open} onClose={() => setOpen(false)} title="Add Event" size="md">
        <Stack gap="sm">
          <TextInput label="Event Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Type" data={EVENT_TYPES} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Textarea label="Description" minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Group grow>
            <TextInput type="date" label="Event Date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            <TextInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Group>
          <Group justify="flex-end"><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={create.isPending}>Add</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ═══ Main ═══
export default function EmployeeEngagement() {
  const { user } = useAuth();
  const can = usePermission();
  // managers/HR/admins can manage; everyone can participate
  const canManage = ["SUPER_ADMIN", "ADMIN", "HR", "HR_MANAGER", "MANAGER"].includes(user?.role);
  const [tab, setTab] = useState("dashboard");

  return (
    <Box>
      <AppPageHeader title="Employee Engagement & Rewards" sub="Recognition, kudos, rewards, surveys and wellness" />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="wall" leftSection={<IconTrophy size={14} />}>Recognition Wall</Tabs.Tab>
          <Tabs.Tab value="recognition" leftSection={<IconAward size={14} />}>Recognition</Tabs.Tab>
          <Tabs.Tab value="kudos" leftSection={<IconHeartHandshake size={14} />}>Kudos</Tabs.Tab>
          <Tabs.Tab value="rewards" leftSection={<IconGift size={14} />}>Rewards</Tabs.Tab>
          <Tabs.Tab value="surveys" leftSection={<IconClipboardList size={14} />}>Surveys</Tabs.Tab>
          <Tabs.Tab value="suggestions" leftSection={<IconBulb size={14} />}>Suggestions</Tabs.Tab>
          <Tabs.Tab value="wellness" leftSection={<IconActivity size={14} />}>Wellness</Tabs.Tab>
          <Tabs.Tab value="events" leftSection={<IconCalendarEvent size={14} />}>Events</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="wall"><WallTab /></Tabs.Panel>
        <Tabs.Panel value="recognition"><RecognitionTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="kudos"><KudosTab /></Tabs.Panel>
        <Tabs.Panel value="rewards"><RewardsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="surveys"><SurveysTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="suggestions"><SuggestionsTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="wellness"><WellnessTab canManage={canManage} /></Tabs.Panel>
        <Tabs.Panel value="events"><EventsTab canManage={canManage} /></Tabs.Panel>
      </Tabs>
    </Box>
  );
}
