import { useState } from "react";
import { SimpleGrid, Box, Group, Text, Badge, Button, TextInput, Select, Modal, Textarea, ActionIcon, Tabs, Avatar } from "@mantine/core";
import { IconPlus, IconSearch, IconEdit, IconTrash, IconSend, IconBell, IconEye, IconBuildingCommunity, IconUsers } from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection } from "../../components/ui/AppSection";
import { AppStatCard } from "../../components/ui/AppStatCard";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";

const TODAY = new Date().toISOString().slice(0, 10);

const INIT_ANNOUNCEMENTS = [
  { id: 1,  title: "Q2 2026 All-Hands Meeting",        body: "Join us for the Q2 All-Hands on June 15 at 10 AM. We will be covering company OKRs, department updates, and team recognition.", target: "Company",    priority: "High",   published: true,  author: "Super Admin", date: "2026-06-08" },
  { id: 2,  title: "Updated Leave Policy – FY 2026-27", body: "The revised leave policy for FY 2026-27 is now in effect. Annual leave quota increased to 18 days. Please review the HR handbook.", target: "Company",    priority: "High",   published: true,  author: "HR Manager",  date: "2026-06-06" },
  { id: 3,  title: "Payroll Schedule – June 2026",      body: "June 2026 payroll will be processed on June 28. Please submit any corrections or reimbursements before June 25.", target: "Company",    priority: "Medium", published: true,  author: "Finance",     date: "2026-06-05" },
  { id: 4,  title: "Engineering Hackathon – July 2026", body: "We are hosting our annual internal hackathon on July 5-6. All engineering team members are invited. Prizes worth ₹1 lakh!", target: "Department", priority: "Medium", published: true,  author: "Admin",       date: "2026-06-04" },
  { id: 5,  title: "New WFH Guidelines",               body: "Starting July 1, employees may work from home up to 2 days per week with manager approval. Submit WFH requests via the portal.", target: "Company",    priority: "High",   published: false, author: "HR Manager",  date: "2026-06-03" },
  { id: 6,  title: "Office Maintenance – June 14",     body: "The office will undergo electrical maintenance on June 14 (Saturday). Please plan accordingly if you need weekend access.", target: "Branch",     priority: "Low",    published: true,  author: "Admin",       date: "2026-06-02" },
];

const PRIORITY_COLOR = { High: "red", Medium: "yellow", Low: "blue" };
const TARGET_ICON    = { Company: <IconBuildingCommunity size={14}/>, Department: <IconUsers size={14}/>, Branch: <IconBell size={14}/> };
const EMPTY_FORM     = { title: "", body: "", target: "Company", priority: "Medium", published: false };

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems]           = useState(INIT_ANNOUNCEMENTS);
  const [tab, setTab]               = useState("all");
  const [search, setSearch]         = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [viewItem, setViewItem]     = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const { showToast }               = useToast();

  const tabFiltered = tab === "published"
    ? items.filter((a) => a.published)
    : tab === "draft"
    ? items.filter((a) => !a.published)
    : items;

  const filtered = tabFiltered.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
  });

  const openAdd  = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (a) => { setForm({ ...a }); setEditTarget(a.id); setModalOpen(true); };

  const handleSave = () => {
    if (!form.title || !form.body) return showToast("Title and body are required", "error");
    if (editTarget) {
      setItems((prev) => prev.map((a) => a.id === editTarget ? { ...form, id: editTarget, author: a.author, date: a.date } : a));
      showToast("Announcement updated", "success");
    } else {
      setItems((prev) => [{ ...form, id: Date.now(), author: user?.name || "Admin", date: TODAY }, ...prev]);
      showToast(form.published ? "Announcement published" : "Draft saved", "success");
    }
    setModalOpen(false);
  };

  const handlePublish = (id) => {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, published: true } : a));
    showToast("Announcement published", "success");
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
    showToast("Announcement deleted", "success");
  };

  const published = items.filter((a) => a.published).length;
  const drafts    = items.filter((a) => !a.published).length;
  const high      = items.filter((a) => a.priority === "High" && a.published).length;

  return (
    <Box>
      <AppPageHeader
        title="Announcements"
        subtitle="Create and publish company, department, and branch announcements"
        action={<Button leftSection={<IconPlus size={16}/>} onClick={openAdd} size="sm">New Announcement</Button>}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconBell size={18}/>}             label="Total"      value={items.length} sub="All announcements" color="blue"   />
        <AppStatCard icon={<IconSend size={18}/>}             label="Published"  value={published}    sub="Live now"          color="green"  />
        <AppStatCard icon={<IconEye size={18}/>}              label="Drafts"     value={drafts}       sub="Not yet published" color="yellow" />
        <AppStatCard icon={<IconBell size={18}/>}             label="High Prio"  value={high}         sub="Published urgent"  color="red"    />
      </SimpleGrid>

      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Search announcements..."
          leftSection={<IconSearch size={14}/>}
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

      <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <AppSection title="No Results">
            <Text ta="center" c="dimmed" py="xl">No announcements found</Text>
          </AppSection>
        )}
        {filtered.map((a) => (
          <AppSection key={a.id} noPadding>
            <Box p="md">
              <Group justify="space-between" wrap="nowrap" mb={8}>
                <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Avatar size="sm" radius="xl" color="blue">{a.author?.slice(0, 2).toUpperCase()}</Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={700} fz="sm" truncate>{a.title}</Text>
                    <Group gap={6} mt={2}>
                      <Text fz="xs" c="dimmed">{a.author}</Text>
                      <Text fz="xs" c="dimmed">·</Text>
                      <Text fz="xs" c="dimmed">{new Date(a.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</Text>
                    </Group>
                  </Box>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <Badge color={PRIORITY_COLOR[a.priority] || "gray"} variant="light" size="sm">{a.priority}</Badge>
                  <Group gap={4} c="dimmed">{TARGET_ICON[a.target]}<Text fz="xs" c="dimmed">{a.target}</Text></Group>
                  <Badge color={a.published ? "green" : "yellow"} variant="light" size="sm">{a.published ? "Published" : "Draft"}</Badge>
                </Group>
              </Group>

              <Text fz="sm" c="dimmed" style={{ lineHeight: 1.6 }}>{a.body}</Text>

              <Group mt="md" gap={8} justify="flex-end">
                {!a.published && (
                  <Button size="xs" color="green" leftSection={<IconSend size={13}/>} onClick={() => handlePublish(a.id)}>Publish</Button>
                )}
                <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit(a)}><IconEdit size={14}/></ActionIcon>
                <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(a.id)}><IconTrash size={14}/></ActionIcon>
              </Group>
            </Box>
          </AppSection>
        ))}
      </Box>

      {/* Add / Edit Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Announcement" : "New Announcement"} size="lg">
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Title" placeholder="Announcement title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Textarea label="Body" placeholder="Write the full announcement message..." value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} minRows={4} required />
          <SimpleGrid cols={2} spacing="sm">
            <Select label="Target Audience" value={form.target} onChange={(v) => setForm((f) => ({ ...f, target: v }))} data={["Company","Department","Branch"]} />
            <Select label="Priority" value={form.priority} onChange={(v) => setForm((f) => ({ ...f, priority: v }))} data={["High","Medium","Low"]} />
          </SimpleGrid>
          <Select label="Publish Status" value={form.published ? "Publish Now" : "Save as Draft"}
            onChange={(v) => setForm((f) => ({ ...f, published: v === "Publish Now" }))}
            data={["Publish Now","Save as Draft"]} />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} leftSection={form.published ? <IconSend size={14}/> : null}>
              {editTarget ? "Update" : form.published ? "Publish" : "Save Draft"}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
