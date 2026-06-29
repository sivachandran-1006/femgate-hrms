import { useState } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, Table, Modal, TextInput,
  Textarea, Select, NumberInput, Switch, ActionIcon, Tooltip, SimpleGrid,
  ThemeIcon, ScrollArea, Center, Loader,
} from "@mantine/core";
import {
  IconFlag, IconPlus, IconPencil, IconTrash, IconToggleRight, IconBuilding,
  IconSearch,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import {
  useFeatureFlags, useCreateFlag, useUpdateFlag, useToggleFlag, useDeleteFlag, useOverrideFlag,
} from "../../queries/usePlatform";

const MOCK = [
  { id:1, key:"ai_assistant",       name:"AI Assistant",          enabled:false, rollout:0,   targetPlan:"Enterprise", _count:{ overrides:0 } },
  { id:2, key:"dark_mode",          name:"Dark Mode",             enabled:true,  rollout:100, targetPlan:null,         _count:{ overrides:0 } },
  { id:3, key:"marketplace",        name:"Marketplace",           enabled:false, rollout:0,   targetPlan:null,         _count:{ overrides:2 } },
  { id:4, key:"advanced_analytics", name:"Advanced Analytics",    enabled:true,  rollout:50,  targetPlan:"Pro",        _count:{ overrides:1 } },
  { id:5, key:"mobile_app",         name:"Mobile App",            enabled:false, rollout:0,   targetPlan:null,         _count:{ overrides:0 } },
  { id:6, key:"custom_workflows",   name:"Custom Workflows",      enabled:true,  rollout:100, targetPlan:"Enterprise", _count:{ overrides:3 } },
];

const COMPANIES = [
  { id:1, name:"Mgate Technologies" },
  { id:2, name:"Nexgen Solutions"   },
  { id:3, name:"Infospark Pvt Ltd"  },
  { id:4, name:"Brightwave Corp"    },
];

const BLANK = { key:"", name:"", description:"", enabled:false, rollout:100, targetPlan:"" };

export default function FeatureFlags() {
  const { user } = useAuth();
  const toast    = useToast();
  const isSA     = ["SUPER_ADMIN"].includes(user?.role);

  const { data: rawFlags = [], isLoading, refetch } = useFeatureFlags();
  const createFlag = useCreateFlag();
  const updateFlag = useUpdateFlag();
  const toggleFlag = useToggleFlag();
  const deleteFlag = useDeleteFlag();
  const overrideFlag = useOverrideFlag();

  const flags = rawFlags.length ? rawFlags : MOCK;

  const [search, setSearch]       = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [overriding, setOverriding] = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [ovForm, setOvForm]       = useState({ companyId:"", enabled:true });

  const filtered = flags.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.key.toLowerCase().includes(search.toLowerCase())
  );

  const total    = flags.length;
  const enabled  = flags.filter(f => f.enabled).length;
  const disabled = flags.filter(f => !f.enabled).length;
  const overrides = flags.reduce((s, f) => s + (f._count?.overrides ?? 0), 0);

  const openCreate = () => { setForm(BLANK); setShowCreate(true); };
  const openEdit   = (f) => { setEditing(f); setForm({ key: f.key, name: f.name, description: f.description || "", enabled: f.enabled, rollout: f.rollout, targetPlan: f.targetPlan || "" }); };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateFlag.mutateAsync({ id: editing.id, ...form });
        toast.show("Flag updated", "success");
        setEditing(null);
      } else {
        await createFlag.mutateAsync(form);
        toast.show("Flag created", "success");
        setShowCreate(false);
      }
    } catch { toast.show("Failed to save flag", "error"); }
  };

  const handleToggle = async (f) => {
    try { await toggleFlag.mutateAsync(f.id); toast.show(`Flag ${f.enabled ? "disabled" : "enabled"}`, "info"); }
    catch { toast.show("Failed to toggle", "error"); }
  };

  const handleDelete = async (id) => {
    try { await deleteFlag.mutateAsync(id); toast.show("Flag deleted", "error"); }
    catch { toast.show("Failed to delete", "error"); }
  };

  const handleOverride = async () => {
    try {
      await overrideFlag.mutateAsync({ id: overriding.id, companyId: Number(ovForm.companyId), enabled: ovForm.enabled });
      toast.show("Override saved", "success"); setOverriding(null);
    } catch { toast.show("Failed to save override", "error"); }
  };

  if (!isSA) return <AppEmptyState icon={<IconFlag size={22} />} message="Restricted" sub="Super Admin only." />;

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Feature Flags"
        sub="Control feature rollout per plan and tenant"
        action={<Button leftSection={<IconPlus size={14} />} onClick={openCreate}>New Flag</Button>}
        onRefresh={refetch}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {[
          { label: "Total Flags",   value: total,    color: "blue"   },
          { label: "Enabled",       value: enabled,  color: "green"  },
          { label: "Disabled",      value: disabled, color: "gray"   },
          { label: "Overrides",     value: overrides,color: "violet" },
        ].map(s => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase">{s.label}</Text>
            <Text fw={800} size="xl" c={s.color}>{s.value}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Group justify="space-between" wrap="wrap" gap="sm">
        <TextInput placeholder="Search flags…" leftSection={<IconSearch size={14} />}
          value={search} onChange={e => setSearch(e.currentTarget.value)} maw={300} radius="md" />
      </Group>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Rollout %</Table.Th>
                <Table.Th>Target Plan</Table.Th>
                <Table.Th>Overrides</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr><Table.Td colSpan={7}><Center py="xl"><Loader size="sm" /></Center></Table.Td></Table.Tr>
              ) : filtered.length === 0 ? (
                <Table.Tr><Table.Td colSpan={7}><Center py="xl"><Text c="dimmed">No flags found</Text></Center></Table.Td></Table.Tr>
              ) : filtered.map(f => (
                <Table.Tr key={f.id}>
                  <Table.Td><Text size="xs" ff="monospace" c="blue">{f.key}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{f.name}</Text></Table.Td>
                  <Table.Td>
                    <Switch size="sm" checked={f.enabled} onChange={() => handleToggle(f)}
                      label={f.enabled ? "Enabled" : "Disabled"}
                      color={f.enabled ? "green" : "gray"} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c={f.rollout === 100 ? "green" : f.rollout === 0 ? "gray" : "orange"}>
                      {f.rollout}%
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {f.targetPlan
                      ? <Badge size="xs" variant="light" color="violet">{f.targetPlan}</Badge>
                      : <Text size="xs" c="dimmed">All Plans</Text>}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" ta="center">{f._count?.overrides ?? 0}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="Edit"><ActionIcon size="sm" variant="subtle" onClick={() => openEdit(f)}><IconPencil size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Per-Tenant Override"><ActionIcon size="sm" variant="subtle" color="violet" onClick={() => setOverriding(f)}><IconBuilding size={13} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(f.id)}><IconTrash size={13} /></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Create / Edit modal */}
      <Modal opened={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null); }}
        title={editing ? `Edit: ${editing.name}` : "New Feature Flag"} size="md" radius="lg">
        <Stack gap="sm">
          {!editing && <TextInput label="Key" placeholder="ai_assistant" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} radius="md" description="Unique identifier, snake_case" />}
          <TextInput label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} radius="md" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} minRows={2} radius="md" />
          <NumberInput label="Rollout %" value={form.rollout} onChange={v => setForm(f => ({ ...f, rollout: v }))} min={0} max={100} radius="md" />
          <Select label="Target Plan" value={form.targetPlan || ""} onChange={v => setForm(f => ({ ...f, targetPlan: v }))}
            data={[{ value:"", label:"All Plans" }, "Starter", "Pro", "Enterprise"]} radius="md" />
          <Switch label="Enabled" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.currentTarget.checked }))} color="green" />
          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => { setShowCreate(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={handleSave} loading={createFlag.isPending || updateFlag.isPending}>
              {editing ? "Save Changes" : "Create Flag"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Override modal */}
      <Modal opened={!!overriding} onClose={() => setOverriding(null)} title={`Override: ${overriding?.name}`} size="sm" radius="lg">
        <Stack gap="sm">
          <Select label="Company / Tenant" value={ovForm.companyId}
            onChange={v => setOvForm(f => ({ ...f, companyId: v }))}
            data={COMPANIES.map(c => ({ value: String(c.id), label: c.name }))}
            placeholder="Select company" radius="md" />
          <Switch label="Enable for this tenant" checked={ovForm.enabled} onChange={e => setOvForm(f => ({ ...f, enabled: e.currentTarget.checked }))} color="green" />
          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setOverriding(null)}>Cancel</Button>
            <Button onClick={handleOverride} loading={overrideFlag.isPending}>Save Override</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
