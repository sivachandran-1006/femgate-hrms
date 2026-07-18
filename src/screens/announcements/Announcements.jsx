import { useState, useMemo } from "react";
import {
  SimpleGrid, Box, Group, Text, Badge, Button, TextInput, Select,
  Modal, Textarea, ActionIcon, Tabs, Avatar, Loader, Alert, Paper, Stack,
} from "@mantine/core";
import {
  IconPlus, IconSearch, IconEdit, IconTrash, IconSend, IconBell,
  IconBuildingCommunity, IconUsers, IconAlertCircle, IconCheck, IconSpeakerphone,
} from "@tabler/icons-react";
import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";
import { usePermission }  from "../../hooks/usePermission";
import { AppSection }     from "../../components/ui/AppSection";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { useToast }       from "../../components/ui/Toast";
import { useAuth }        from "../../hooks/useAuth";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  usePublishAnnouncement,
  useDeleteAnnouncement,
} from "../../queries/useAnnouncements";

const PRIORITY_COLOR = { High: "red", Medium: "yellow", Low: "blue" };
const EMPTY_FORM = { title: "", body: "", target: "Company", priority: "Medium", published: false };

const MOCK_ANNOUNCEMENTS = [
  {
    id: "ann-001",
    title: "Annual Health Insurance Renewal",
    body: "The annual health insurance policy renewal window is now open. All employees must update their dependent details in the HR portal by July 31st to ensure uninterrupted coverage.",
    target: "Company",
    priority: "High",
    published: true,
    author: "Priya Nair",
    createdAt: "2026-07-10T09:30:00Z",
  },
  {
    id: "ann-002",
    title: "Office Wi-Fi Maintenance - Bengaluru Branch",
    body: "Scheduled network maintenance will take place this Saturday from 10 PM to 2 AM. Internet access at the Bengaluru branch may be intermittent during this window.",
    target: "Branch",
    priority: "Medium",
    published: true,
    author: "Arjun Mehta",
    createdAt: "2026-07-12T14:15:00Z",
  },
  {
    id: "ann-003",
    title: "Engineering Sprint Retrospective - Draft Notes",
    body: "Draft summary of the Q3 sprint retrospective. Please review and add comments before we circulate this to the wider engineering team.",
    target: "Department",
    priority: "Low",
    published: false,
    author: "Sara Iyer",
    createdAt: "2026-07-14T11:00:00Z",
  },
  {
    id: "ann-004",
    title: "Mandatory Fire Safety Drill",
    body: "A mandatory fire safety drill will be conducted on July 22nd at 3 PM across all floors. Please assemble at the designated muster points when the alarm sounds.",
    target: "Company",
    priority: "High",
    published: true,
    author: "Rohit Sharma",
    createdAt: "2026-07-15T08:45:00Z",
  },
  {
    id: "ann-005",
    title: "New Expense Reimbursement Policy",
    body: "Draft policy update for travel and expense reimbursements is under legal review. Do not share externally until final approval.",
    target: "Company",
    priority: "Medium",
    published: false,
    author: "Priya Nair",
    createdAt: "2026-07-16T10:20:00Z",
  },
  {
    id: "ann-006",
    title: "Diwali Festival Celebration Schedule",
    body: "Join us for the Diwali celebrations on-site with cultural performances, food stalls, and a rangoli competition. RSVP through the events tab by end of week.",
    target: "Company",
    priority: "Low",
    published: true,
    author: "Anita Desai",
    createdAt: "2026-07-16T16:00:00Z",
  },
  {
    id: "ann-007",
    title: "HR Systems Downtime - Payroll Module",
    body: "The payroll module will be unavailable this Sunday between 6 AM and 9 AM for a scheduled upgrade. Salary processing timelines remain unaffected.",
    target: "Department",
    priority: "High",
    published: true,
    author: "Rohit Sharma",
    createdAt: "2026-07-17T07:30:00Z",
  },
  {
    id: "ann-008",
    title: "Hyderabad Branch Relocation Update",
    body: "Internal draft notice regarding the upcoming Hyderabad branch office relocation. Final floor plan and timeline pending facilities sign-off.",
    target: "Branch",
    priority: "Medium",
    published: false,
    author: "Arjun Mehta",
    createdAt: "2026-07-18T09:00:00Z",
  },
];

const TARGET_ICON = {
  Company:    <IconBuildingCommunity size={13} />,
  Department: <IconUsers size={13} />,
  Branch:     <IconBell size={13} />,
};

export default function Announcements() {
  const { user }                    = useAuth();
  const { showToast }               = useToast();
  const can                         = usePermission();
  const isAdmin                     = can("announcements.create");
  const { data: rawItems, isLoading, isError: rawIsError } = useAnnouncements();
  const items = rawItems?.length ? rawItems : MOCK_ANNOUNCEMENTS;
  const isError = rawIsError && !items.length;

  const createMut  = useCreateAnnouncement();
  const updateMut  = useUpdateAnnouncement();
  const publishMut = usePublishAnnouncement();
  const deleteMut  = useDeleteAnnouncement();

  const [tab, setTab]             = useState("all");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    const tabFiltered =
      tab === "published" ? items.filter((a) => a.published)
      : tab === "draft"   ? items.filter((a) => !a.published)
      : items;

    return tabFiltered.filter((a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, tab, search]);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (a) => {
    setForm({ title: a.title, body: a.body, target: a.target, priority: a.priority, published: a.published });
    setEditTarget(a.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.body) return showToast("Title and body are required", "error");
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget, ...form });
        showToast("Announcement updated", "success");
      } else {
        await createMut.mutateAsync({ ...form, author: user?.name || user?.email || "Admin" });
        showToast(form.published ? "Announcement published" : "Draft saved", "success");
      }
      setModalOpen(false);
    } catch {
      showToast("Failed to save announcement", "error");
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishMut.mutateAsync(id);
      showToast("Announcement published", "success");
    } catch {
      showToast("Failed to publish", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMut.mutateAsync(id);
      showToast("Announcement deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const published = items.filter((a) => a.published).length;
  const drafts    = items.filter((a) => !a.published).length;
  const high      = items.filter((a) => a.priority === "High" && a.published).length;

  const isSaving = createMut.isPending || updateMut.isPending;

  // ── Employee read-only view ───────────────────────────────────────────────
  const [acknowledged, setAcknowledged] = useState({});
  const publishedItems = items.filter((a) => a.published);

  if (!isAdmin) {
    return (
      <Box>
        <AppPageHeader title="Announcements" sub="Company-wide notices and updates" />
        {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}
        {isError   && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">Failed to load announcements.</Alert>}
        {!isLoading && !isError && (
          <Stack gap="md">
            {publishedItems.length === 0 && (
              <Paper withBorder p="xl" radius="xl">
                <AppEmptyState
                  icon={<IconSpeakerphone size={24} />}
                  message="No announcements"
                  sub="There are no announcements at this time."
                />
              </Paper>
            )}
            {publishedItems.map((a) => (
              <Paper key={a.id} withBorder p="lg" radius="xl" shadow="xs">
                <Group justify="space-between" wrap="wrap" gap="sm" mb={8}>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar size="sm" radius="xl" color="blue">{(a.author || "?").slice(0, 2).toUpperCase()}</Avatar>
                    <Box>
                      <Text fw={700} fz="sm">{a.title}</Text>
                      <Group gap={6}>
                        <Text fz="xs" c="dimmed">{a.author}</Text>
                        <Text fz="xs" c="dimmed">·</Text>
                        <Text fz="xs" c="dimmed">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Text>
                      </Group>
                    </Box>
                  </Group>
                  <Group gap={6}>
                    <Badge color={PRIORITY_COLOR[a.priority] || "gray"} variant="light" size="sm">{a.priority}</Badge>
                    <Group gap={4}><Box c="dimmed">{TARGET_ICON[a.target]}</Box><Text fz="xs" c="dimmed">{a.target}</Text></Group>
                  </Group>
                </Group>
                <Text fz="sm" c="dimmed" style={{ lineHeight: 1.6 }}>{a.body}</Text>
                <Group mt="md" justify="flex-end">
                  {acknowledged[a.id] ? (
                    <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>Acknowledged</Badge>
                  ) : (
                    <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={13} />}
                      onClick={() => setAcknowledged((p) => ({ ...p, [a.id]: true }))}>
                      Acknowledge
                    </Button>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <AppPageHeader
        title="Announcements"
        subtitle="Create and publish company, department, and branch announcements"
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd} size="sm">
            New Announcement
          </Button>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconBell size={18} />} label="Total"     value={items.length} sub="All announcements" color="blue"   />
        <AppStatCard icon={<IconSend size={18} />} label="Published" value={published}    sub="Live now"          color="green"  />
        <AppStatCard icon={<IconBell size={18} />} label="Drafts"    value={drafts}       sub="Not yet published" color="yellow" />
        <AppStatCard icon={<IconBell size={18} />} label="High Prio" value={high}         sub="Published urgent"  color="red"    />
      </SimpleGrid>

      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Search announcements..."
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 360 }}
          size="sm"
        />
      </Group>

      <Tabs value={tab} onChange={setTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="all">All ({items.length})</Tabs.Tab>
          <Tabs.Tab value="published">Published ({published})</Tabs.Tab>
          <Tabs.Tab value="draft">Drafts ({drafts})</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {isLoading && (
        <Box ta="center" py="xl"><Loader size="sm" /></Box>
      )}

      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          Failed to load announcements. Make sure the backend is running.
        </Alert>
      )}

      {!isLoading && !isError && (
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <AppSection title="No Results">
              <AppEmptyState
                icon={<IconSpeakerphone size={24} />}
                message="No announcements found"
                sub="Try adjusting your search or create a new announcement."
              />
            </AppSection>
          )}

          {filtered.map((a) => (
            <AppSection key={a.id} noPadding>
              <Box p="md">
                <Group justify="space-between" wrap="nowrap" mb={8} align="flex-start">
                  <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar size="sm" radius="xl" color="blue">
                      {(a.author || "?").slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box style={{ minWidth: 0 }}>
                      <Text fw={700} fz="sm" truncate>{a.title}</Text>
                      <Group gap={6} mt={2}>
                        <Text fz="xs" c="dimmed">{a.author}</Text>
                        <Text fz="xs" c="dimmed">·</Text>
                        <Text fz="xs" c="dimmed">
                          {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </Text>
                      </Group>
                    </Box>
                  </Group>

                  <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                    <Badge color={PRIORITY_COLOR[a.priority] || "gray"} variant="light" size="sm">
                      {a.priority}
                    </Badge>
                    <Group gap={4} wrap="nowrap">
                      <Box c="dimmed">{TARGET_ICON[a.target]}</Box>
                      <Text fz="xs" c="dimmed">{a.target}</Text>
                    </Group>
                    <Badge color={a.published ? "green" : "yellow"} variant="light" size="sm">
                      {a.published ? "Published" : "Draft"}
                    </Badge>
                  </Group>
                </Group>

                <Text fz="sm" c="dimmed" style={{ lineHeight: 1.6 }}>{a.body}</Text>

                <Group mt="md" gap={8} justify="flex-end">
                  {!a.published && (
                    <Button
                      size="xs" color="green"
                      leftSection={<IconSend size={13} />}
                      loading={publishMut.isPending && publishMut.variables === a.id}
                      onClick={() => handlePublish(a.id)}
                    >
                      Publish
                    </Button>
                  )}
                  <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit(a)}>
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm" variant="subtle" color="red"
                    loading={deleteMut.isPending && deleteMut.variables === a.id}
                    onClick={() => handleDelete(a.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Box>
            </AppSection>
          ))}
        </Box>
      )}

      {/* Add / Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Announcement" : "New Announcement"}
        size="lg"
      >
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput
            label="Title" placeholder="Announcement title" value={form.title} required
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Body" placeholder="Write the full announcement message..."
            value={form.body} minRows={4} required
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <SimpleGrid cols={2} spacing="sm">
            <Select
              label="Target Audience" value={form.target}
              onChange={(v) => setForm((f) => ({ ...f, target: v }))}
              data={["Company", "Department", "Branch"]}
            />
            <Select
              label="Priority" value={form.priority}
              onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
              data={["High", "Medium", "Low"]}
            />
          </SimpleGrid>
          <Select
            label="Status"
            value={form.published ? "Publish Now" : "Save as Draft"}
            onChange={(v) => setForm((f) => ({ ...f, published: v === "Publish Now" }))}
            data={["Publish Now", "Save as Draft"]}
          />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              leftSection={form.published && !editTarget ? <IconSend size={14} /> : null}
            >
              {editTarget ? "Update" : form.published ? "Publish" : "Save Draft"}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
