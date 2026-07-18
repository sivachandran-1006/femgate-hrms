import { useState } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, Table, Modal, TextInput,
  Textarea, Select, SimpleGrid, ScrollArea, Center, Loader, ActionIcon, Tooltip,
} from "@mantine/core";
import {
  IconRocket, IconPlus, IconPencil, IconTrash, IconRotate, IconCheck,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const MOCK = [
  { id:1, version:"v1.0.0", title:"Initial Platform Launch",          type:"Major", status:"Released",   releaseDate:"2026-03-01", releasedBy:"Siva", notes:"Foundation + Auth + Employee Management" },
  { id:2, version:"v1.1.0", title:"HR Operations Pack",               type:"Minor", status:"Released",   releaseDate:"2026-04-15", releasedBy:"Siva", notes:"Attendance, Leave, Shifts, Payroll" },
  { id:3, version:"v1.2.0", title:"Talent Management Suite",          type:"Minor", status:"Released",   releaseDate:"2026-05-20", releasedBy:"Siva", notes:"Recruitment, Performance, LMS, Exit" },
  { id:4, version:"v1.3.0", title:"SaaS Platform & Billing",          type:"Minor", status:"Released",   releaseDate:"2026-06-01", releasedBy:"Siva", notes:"Multi-tenant, Subscriptions, White Label" },
  { id:5, version:"v1.4.0", title:"No-Code Builder Beta",             type:"Minor", status:"Scheduled",  releaseDate:"2026-08-01", releasedBy:null,   notes:"Form Builder, Workflow Builder, Dashboard Builder" },
  { id:6, version:"v1.5.0", title:"AI Platform Preview",              type:"Minor", status:"Draft",      releaseDate:null,         releasedBy:null,   notes:"AI Assistant, AI Analytics, AI Recruitment" },
  { id:7, version:"v2.0.0", title:"Mobile Platform + Full AI Launch", type:"Major", status:"Draft",      releaseDate:null,         releasedBy:null,   notes:"iOS/Android apps, Offline sync, Full AI suite" },
];

const STATUS_COLOR = { Released:"green", Scheduled:"blue", Draft:"orange", "Rolled Back":"red" };
const TYPE_COLOR   = { Major:"red", Minor:"blue", Patch:"gray", Hotfix:"orange" };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

const BLANK = { version:"", title:"", type:"Minor", status:"Draft", releaseDate:"", notes:"", changelog:"" };

export default function ReleaseManagement() {
  const { user } = useAuth();
  const toast    = useToast();
  const isSA     = ["SUPER_ADMIN"].includes(user?.role);

  const { data: rawReleases = [], isLoading, refetch } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createRelease  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateRelease  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const publishRelease = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const rollback       = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const deleteRelease  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const releases = rawReleases.length ? rawReleases : MOCK;

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(BLANK);
  const [viewing, setViewing]       = useState(null);

  const total      = releases.length;
  const released   = releases.filter(r => r.status === "Released").length;
  const scheduled  = releases.filter(r => r.status === "Scheduled").length;
  const draft      = releases.filter(r => r.status === "Draft").length;
  const rolledBack = releases.filter(r => r.status === "Rolled Back").length;

  const openCreate = () => { setForm(BLANK); setShowCreate(true); };
  const openEdit   = (r) => { setEditing(r); setForm({ version: r.version, title: r.title, type: r.type, status: r.status, releaseDate: r.releaseDate?.slice(0,10) || "", notes: r.notes || "", changelog: r.changelog || "" }); };

  const handleSave = async () => {
    try {
      const payload = { ...form, releaseDate: form.releaseDate || null };
      if (editing) {
        await updateRelease.mutateAsync({ id: editing.id, ...payload });
        toast.show("Release updated", "success"); setEditing(null);
      } else {
        await createRelease.mutateAsync(payload);
        toast.show("Release created", "success"); setShowCreate(false);
      }
    } catch { toast.show("Failed to save", "error"); }
  };

  const handlePublish = async (id) => {
    try { await publishRelease.mutateAsync(id); toast.show("Release published 🚀", "success"); }
    catch { toast.show("Failed to publish", "error"); }
  };

  const handleRollback = async (id) => {
    try { await rollback.mutateAsync(id); toast.show("Rolled back", "warning"); }
    catch { toast.show("Failed to rollback", "error"); }
  };

  const handleDelete = async (r) => {
    if (r.status === "Released") { toast.show("Cannot delete a released version", "error"); return; }
    try { await deleteRelease.mutateAsync(r.id); toast.show("Release deleted", "error"); }
    catch { toast.show("Failed to delete", "error"); }
  };

  if (!isSA) return <AppEmptyState icon={<IconRocket size={22} />} message="Restricted" sub="Super Admin only." />;

  const ModalForm = () => (
    <Stack gap="sm">
      <Group grow>
        <TextInput label="Version" placeholder="v1.4.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} radius="md" />
        <Select label="Type" data={["Major","Minor","Patch","Hotfix"]} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} radius="md" />
      </Group>
      <TextInput label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} radius="md" />
      <Group grow>
        <Select label="Status" data={["Draft","Scheduled","Released","Rolled Back"]} value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} radius="md" />
        <TextInput label="Release Date" type="date" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))} radius="md" />
      </Group>
      <Textarea label="Release Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} minRows={2} radius="md" />
      <Textarea label="Changelog" value={form.changelog} onChange={e => setForm(f => ({ ...f, changelog: e.target.value }))} minRows={3} radius="md" placeholder="- Added feature X&#10;- Fixed bug Y&#10;- Improved performance Z" />
      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={() => { setShowCreate(false); setEditing(null); }}>Cancel</Button>
        <Button onClick={handleSave} loading={createRelease.isPending || updateRelease.isPending}>
          {editing ? "Save Changes" : "Create Release"}
        </Button>
      </Group>
    </Stack>
  );

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Release Management"
        sub="Track and publish platform versions"
        action={<Button leftSection={<IconPlus size={14} />} onClick={openCreate}>New Release</Button>}
        onRefresh={refetch}
      />

      <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md">
        {[
          { label:"Total",       value:total,      color:"blue"   },
          { label:"Released",    value:released,   color:"green"  },
          { label:"Scheduled",   value:scheduled,  color:"cyan"   },
          { label:"Draft",       value:draft,      color:"orange" },
          { label:"Rolled Back", value:rolledBack, color:"red"    },
        ].map(s => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase">{s.label}</Text>
            <Text fw={800} size="xl" c={s.color}>{s.value}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper withBorder radius="lg" style={{ overflow:"hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Version</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Release Date</Table.Th>
                <Table.Th>Released By</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr><Table.Td colSpan={7}><Center py="xl"><Loader size="sm" /></Center></Table.Td></Table.Tr>
              ) : releases.map(r => (
                <Table.Tr key={r.id}>
                  <Table.Td>
                    <Badge variant="outline" color={TYPE_COLOR[r.type] || "gray"} ff="monospace" size="sm">{r.version}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} style={{ cursor:"pointer", textDecoration:"underline", textDecorationStyle:"dotted" }}
                      onClick={() => setViewing(r)}>{r.title}</Text>
                  </Table.Td>
                  <Table.Td><Badge size="xs" color={TYPE_COLOR[r.type] || "gray"} variant="light">{r.type}</Badge></Table.Td>
                  <Table.Td><Badge size="xs" color={STATUS_COLOR[r.status] || "gray"} variant="light">{r.status}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{fmtDate(r.releaseDate)}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{r.releasedBy || "—"}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => openEdit(r)}><IconPencil size={13} /></ActionIcon></Tooltip>
                      {r.status !== "Released" && (
                        <Tooltip label="Publish"><ActionIcon size="sm" variant="subtle" color="green" onClick={() => handlePublish(r.id)}><IconRocket size={13} /></ActionIcon></Tooltip>
                      )}
                      {r.status === "Released" && (
                        <Tooltip label="Rollback"><ActionIcon size="sm" variant="subtle" color="orange" onClick={() => handleRollback(r.id)}><IconRotate size={13} /></ActionIcon></Tooltip>
                      )}
                      {r.status !== "Released" && (
                        <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(r)}><IconTrash size={13} /></ActionIcon></Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null); }}
        title={editing ? `Edit: ${editing.version}` : "New Release"} size="lg" radius="lg">
        <ModalForm />
      </Modal>

      <Modal opened={!!viewing} onClose={() => setViewing(null)} title={viewing ? `${viewing.version} — ${viewing.title}` : ""} size="md" radius="lg">
        {viewing && (
          <Stack gap="md">
            <Group gap="sm">
              <Badge color={TYPE_COLOR[viewing.type]}>{viewing.type}</Badge>
              <Badge color={STATUS_COLOR[viewing.status]}>{viewing.status}</Badge>
              {viewing.releaseDate && <Text size="xs" c="dimmed">Released {fmtDate(viewing.releaseDate)}</Text>}
            </Group>
            {viewing.notes && <div><Text size="xs" fw={600} c="dimmed" mb={4}>NOTES</Text><Text size="sm">{viewing.notes}</Text></div>}
            {viewing.changelog && (
              <div>
                <Text size="xs" fw={600} c="dimmed" mb={4}>CHANGELOG</Text>
                <Paper withBorder p="sm" radius="md" style={{ background:"var(--mantine-color-gray-0)" }}>
                  <Text size="xs" ff="monospace" style={{ whiteSpace:"pre-wrap" }}>{viewing.changelog}</Text>
                </Paper>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
