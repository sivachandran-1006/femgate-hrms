import { useState } from "react";
import { Box, Tabs, Button, Group, Text, Badge, Card, Grid, Stack, SimpleGrid, TextInput, Select, Modal, Table, ActionIcon, Tooltip, Loader, Center, Textarea, Textarea as MantineTextarea } from "@mantine/core";
import { IconPlus, IconSearch, IconDownload, IconEye, IconPencil, IconTrash, IconChartLine, IconBell, IconCalendar, IconAward, IconClipboard, IconCake, IconCheck, IconX, IconSpeakerphone, IconCalendarEvent, IconClipboardList, IconConfetti } from "@tabler/icons-react";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useCommunicationDashboard, useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement, useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useRecognitions, useCreateRecognition, useSurveys, useCreateSurvey, useCloseSurvey, useBirthdaysUpcoming, useAnniversariesUpcoming } from "../../queries/useCommunication";
import { useToast } from "../../components/ui/Toast";
import { exportAnnouncementsCSV } from "../../api/communicationApi";
import ScreenWrapper from "../../components/layout/ScreenWrapper";

const CATEGORIES = ["Company Announcement", "Department Announcement", "Branch Announcement", "Policy Update", "Holiday Notice", "Emergency Notice", "Event Announcement"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const EVENT_TYPES = ["Company Event", "Department Event", "Training", "Town Hall", "Celebration", "Webinar"];
const AWARD_TYPES = ["Employee of the Month", "Star Performer", "Achievement Award", "Spot Award", "Work Anniversary", "Birthday"];
const SURVEY_TYPES = ["Employee Satisfaction", "Engagement Survey", "Training Feedback", "Exit Feedback", "Custom Survey"];

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>{label}</Text>
        <Box style={{ background: `var(--mantine-color-${color}-1)`, borderRadius: 8, padding: 6 }}>
          <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
        </Box>
      </Group>
      <Text fw={700} size="xl">{value}</Text>
    </Card>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: dash, isLoading } = useCommunicationDashboard();

  if (isLoading) return <Center h={300}><Loader /></Center>;
  if (!dash) return null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <KpiCard label="Active Announcements" value={dash.activeAnnouncements || 0} icon={IconBell} color="blue" />
        <KpiCard label="Upcoming Events" value={dash.upcomingEvents || 0} icon={IconCalendar} color="green" />
        <KpiCard label="Unread" value={dash.unreadAnnouncements || 0} icon={IconBell} color="orange" />
        <KpiCard label="Active Surveys" value={dash.activeSurveys || 0} icon={IconClipboard} color="purple" />
        <KpiCard label="Recognitions" value={dash.employeeRecognitions || 0} icon={IconAward} color="yellow" />
        <KpiCard label="Birthdays Today" value={dash.birthdaysToday || 0} icon={IconCake} color="pink" />
        <KpiCard label="Anniversaries Today" value={dash.workAnniversariesToday || 0} icon={IconCheck} color="teal" />
      </SimpleGrid>
    </Stack>
  );
}

// ─── Announcements Tab ────────────────────────────────────────────────────────
function AnnouncementsTab() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    audience: "All Employees",
    publishDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    priority: "Medium",
  });

  const { data: result = {}, isLoading } = useAnnouncements({ search, category, page, limit: 25 });
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const delete_ = useDeleteAnnouncement();

  const handleCreate = async () => {
    if (!form.title || !form.category || !form.audience) {
      show("Title, category, and audience required", "error");
      return;
    }
    try {
      await create.mutateAsync(form);
      show("Announcement created", "success");
      setModalOpened(false);
      setForm({ title: "", category: "", description: "", audience: "All Employees", publishDate: new Date().toISOString().split("T")[0], expiryDate: "", priority: "Medium" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await delete_.mutateAsync(id);
        show("Announcement deleted", "success");
      } catch (e) {
        show(e.message || "Failed", "error");
      }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportAnnouncementsCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "announcements.csv";
      a.click();
      URL.revokeObjectURL(url);
      show("Exported successfully", "success");
    } catch (e) {
      show(e.message || "Export failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <TextInput placeholder="Search..." leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} w={220} />
          <Select placeholder="Category" data={["", ...CATEGORIES]} value={category} onChange={setCategory} w={200} clearable />
        </Group>
        <Group>
          <Button variant="default" leftSection={<IconDownload size={14} />} size="sm" onClick={handleExport}>Export</Button>
          <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => setModalOpened(true)}>New Announcement</Button>
        </Group>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.announcements || []).length === 0 ? (
        <AppEmptyState icon={<IconSpeakerphone size={24} />} message="No announcements" sub="Create an announcement to share updates." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Published By</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Expiry Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.announcements || []).map((a) => (
              <Table.Tr key={a.id}>
                <Table.Td><Text fw={500} size="sm">{a.title}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.category}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.publishedBy}</Text></Table.Td>
                <Table.Td><Badge color={a.priority === "Critical" ? "red" : a.priority === "High" ? "orange" : "blue"}>{a.priority}</Badge></Table.Td>
                <Table.Td><Text size="sm">{new Date(a.expiryDate).toLocaleDateString()}</Text></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => { setSelectedRecord(a); setForm(a); setModalOpened(true); }}><IconPencil size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(a.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpened} onClose={() => { setModalOpened(false); setSelectedRecord(null); }} title={selectedRecord ? "Edit Announcement" : "New Announcement"} size="md">
        <Stack gap="sm">
          <TextInput label="Title" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Select label="Category" required data={CATEGORIES} value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <Select label="Audience" data={["All Employees", "Specific Branch", "Specific Department"]} value={form.audience} onChange={(v) => setForm((p) => ({ ...p, audience: v }))} />
          <TextInput type="date" label="Publish Date" required value={form.publishDate} onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))} />
          <TextInput type="date" label="Expiry Date" required value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} />
          <Select label="Priority" data={PRIORITIES} value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v }))} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => { setModalOpened(false); setSelectedRecord(null); }}>Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending}>{selectedRecord ? "Update" : "Create"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────
function EventsTab() {
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({
    eventName: "",
    description: "",
    location: "",
    meetingLink: "",
    eventDate: "",
    eventTime: "",
    eventType: "Company Event",
  });

  const { data: result = {}, isLoading } = useEvents({ page, limit: 25 });
  const create = useCreateEvent();
  const delete_ = useDeleteEvent();

  const handleCreate = async () => {
    if (!form.eventName || !form.eventDate) {
      show("Event name and date required", "error");
      return;
    }
    try {
      await create.mutateAsync(form);
      show("Event created", "success");
      setModalOpened(false);
      setForm({ eventName: "", description: "", location: "", meetingLink: "", eventDate: "", eventTime: "", eventType: "Company Event" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Events & Calendar</Text>
        <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => setModalOpened(true)}>New Event</Button>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.events || []).length === 0 ? (
        <AppEmptyState icon={<IconCalendarEvent size={24} />} message="No upcoming events" sub="Create an event to get started." py={60} />
      ) : (
        <Stack gap="sm">
          {(result.events || []).map((e) => (
            <Card key={e.id} withBorder p="sm">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text fw={500}>{e.eventName}</Text>
                  <Text size="sm" c="dimmed">{new Date(e.eventDate).toLocaleDateString()} {e.eventTime}</Text>
                  <Text size="sm">{e.location || e.meetingLink || "—"}</Text>
                </Stack>
                <Group gap={4}>
                  <Tooltip label="Delete"><ActionIcon size="sm" color="red" onClick={() => { if (window.confirm("Delete?")) delete_.mutate(e.id); }}><IconTrash size={14} /></ActionIcon></Tooltip>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="New Event" size="md">
        <Stack gap="sm">
          <TextInput label="Event Name" required value={form.eventName} onChange={(e) => setForm((p) => ({ ...p, eventName: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
          <TextInput label="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          <TextInput label="Meeting Link" value={form.meetingLink} onChange={(e) => setForm((p) => ({ ...p, meetingLink: e.target.value }))} />
          <TextInput type="date" label="Event Date" required value={form.eventDate} onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} />
          <TextInput type="time" label="Event Time" value={form.eventTime} onChange={(e) => setForm((p) => ({ ...p, eventTime: e.target.value }))} />
          <Select label="Event Type" data={EVENT_TYPES} value={form.eventType} onChange={(v) => setForm((p) => ({ ...p, eventType: v }))} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Recognitions Tab ─────────────────────────────────────────────────────────
function RecognitionsTab() {
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [form, setForm] = useState({
    employeeName: "",
    awardType: "Employee of the Month",
    description: "",
  });

  const { data: result = {}, isLoading } = useRecognitions({ page, limit: 25 });
  const create = useCreateRecognition();

  const handleCreate = async () => {
    if (!form.employeeName || !form.awardType) {
      show("Employee and award type required", "error");
      return;
    }
    try {
      await create.mutateAsync(form);
      show("Recognition awarded", "success");
      setModalOpened(false);
      setForm({ employeeName: "", awardType: "Employee of the Month", description: "" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Employee Recognition Wall</Text>
        <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => setModalOpened(true)}>Award Recognition</Button>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.recognitions || []).length === 0 ? (
        <AppEmptyState icon={<IconAward size={24} />} message="No recognitions yet" sub="Award recognition to celebrate your team." py={60} />
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {(result.recognitions || []).map((r) => (
            <Card key={r.id} withBorder p="md" bg="yellow.0">
              <Stack gap={2}>
                <Badge color="yellow" variant="light">{r.awardType}</Badge>
                <Text fw={600}>{r.employeeName}</Text>
                <Text size="sm">{r.description}</Text>
                <Text size="xs" c="dimmed">Recognized by {r.recognizedBy}</Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Award Recognition" size="md">
        <Stack gap="sm">
          <TextInput label="Employee Name" required value={form.employeeName} onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))} />
          <Select label="Award Type" required data={AWARD_TYPES} value={form.awardType} onChange={(v) => setForm((p) => ({ ...p, awardType: v }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending}>Award</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Surveys Tab ──────────────────────────────────────────────────────────────
function SurveysTab() {
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    surveyType: "Employee Satisfaction",
    endDate: "",
  });

  const { data: result = {}, isLoading } = useSurveys({ page, limit: 25 });
  const create = useCreateSurvey();
  const close = useCloseSurvey();

  const handleCreate = async () => {
    if (!form.title || !form.surveyType || !form.endDate) {
      show("Title, type, and end date required", "error");
      return;
    }
    try {
      await create.mutateAsync(form);
      show("Survey created", "success");
      setModalOpened(false);
      setForm({ title: "", description: "", surveyType: "Employee Satisfaction", endDate: "" });
    } catch (e) {
      show(e.message || "Failed", "error");
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Surveys & Polls</Text>
        <Button leftSection={<IconPlus size={14} />} size="sm" onClick={() => setModalOpened(true)}>New Survey</Button>
      </Group>

      {isLoading ? <Center h={200}><Loader /></Center> : (result.surveys || []).length === 0 ? (
        <AppEmptyState icon={<IconClipboardList size={24} />} message="No surveys" sub="Create a survey to gather feedback." py={60} />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(result.surveys || []).map((s) => (
              <Table.Tr key={s.id}>
                <Table.Td><Text size="sm" fw={500}>{s.title}</Text></Table.Td>
                <Table.Td><Text size="sm">{s.surveyType}</Text></Table.Td>
                <Table.Td><Badge color={s.status === "Active" ? "green" : "gray"}>{s.status}</Badge></Table.Td>
                <Table.Td><Text size="sm">{new Date(s.endDate).toLocaleDateString()}</Text></Table.Td>
                <Table.Td>
                  {s.status === "Active" && (
                    <Button size="xs" variant="light" onClick={() => { close.mutate(s.id); show("Survey closed", "success"); }}>Close</Button>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="New Survey" size="md">
        <Stack gap="sm">
          <TextInput label="Survey Title" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
          <Select label="Survey Type" required data={SURVEY_TYPES} value={form.surveyType} onChange={(v) => setForm((p) => ({ ...p, surveyType: v }))} />
          <TextInput type="date" label="End Date" required value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ─── Milestones Tab ───────────────────────────────────────────────────────────
function MilestonesTab() {
  const { data: birthdays = [] } = useBirthdaysUpcoming();
  const { data: anniversaries = [] } = useAnniversariesUpcoming();

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md">
          <Text fw={600}>🎂 Upcoming Birthdays</Text>
          {birthdays.length === 0 ? (
            <AppEmptyState icon={<IconCake size={24} />} message="No birthdays in next 30 days" py={40} />
          ) : (
            <Stack gap="sm">
              {birthdays.map((e) => (
                <Card key={e.id} withBorder p="sm" bg="pink.0">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text fw={500}>{e.name}</Text>
                      <Text size="sm" c="dimmed">{e.department}</Text>
                    </Stack>
                    <Badge color="pink" variant="light">Soon</Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md">
          <Text fw={600}>🎉 Work Anniversaries</Text>
          {anniversaries.length === 0 ? (
            <AppEmptyState icon={<IconConfetti size={24} />} message="No anniversaries in next 30 days" py={40} />
          ) : (
            <Stack gap="sm">
              {anniversaries.map((e) => (
                <Card key={e.id} withBorder p="sm" bg="cyan.0">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text fw={500}>{e.name}</Text>
                      <Text size="sm" c="dimmed">{e.department}</Text>
                    </Stack>
                    <Badge color="cyan" variant="light">Coming</Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CommunicationCenter() {
  const [tab, setTab] = useState("dashboard");

  return (
    <ScreenWrapper>
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={700} size="lg">Communication Center</Text>
          <Text size="xs" c="dimmed">Announcements, events, recognition & surveys</Text>
        </Box>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartLine size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="announcements" leftSection={<IconBell size={14} />}>Announcements</Tabs.Tab>
          <Tabs.Tab value="events" leftSection={<IconCalendar size={14} />}>Events</Tabs.Tab>
          <Tabs.Tab value="recognition" leftSection={<IconAward size={14} />}>Recognition</Tabs.Tab>
          <Tabs.Tab value="surveys" leftSection={<IconClipboard size={14} />}>Surveys</Tabs.Tab>
          <Tabs.Tab value="milestones" leftSection={<IconCake size={14} />}>Milestones</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="announcements"><AnnouncementsTab /></Tabs.Panel>
        <Tabs.Panel value="events"><EventsTab /></Tabs.Panel>
        <Tabs.Panel value="recognition"><RecognitionsTab /></Tabs.Panel>
        <Tabs.Panel value="surveys"><SurveysTab /></Tabs.Panel>
        <Tabs.Panel value="milestones"><MilestonesTab /></Tabs.Panel>
      </Tabs>
    </ScreenWrapper>
  );
}
