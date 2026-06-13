import { useState } from "react";
import {
  SimpleGrid, Box, Group, Text, Badge, Button, TextInput, Select,
  Modal, Table, ActionIcon, Loader, Alert,
} from "@mantine/core";
import {
  IconPlus, IconSearch, IconEdit, IconTrash, IconCalendarEvent,
  IconMapPin, IconBuilding, IconAlertCircle,
} from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection }    from "../../components/ui/AppSection";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { useToast }      from "../../components/ui/Toast";
import {
  useHolidays, useCreateHoliday, useUpdateHoliday, useDeleteHoliday,
} from "../../queries/useHolidays";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TYPE_COLOR = { National: "blue", Regional: "teal" };
const EMPTY = { name: "", date: "", type: "National", scope: "Company", optional: false };

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function HolidayCalendar() {
  const { show: showToast } = useToast();
  const { data: holidays = [], isLoading, isError } = useHolidays();

  const createMut = useCreateHoliday();
  const updateMut = useUpdateHoliday();
  const deleteMut = useDeleteHoliday();

  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("All");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY);

  const filtered = holidays.filter((h) => {
    const matchQ = !search || h.name.toLowerCase().includes(search.toLowerCase());
    const matchT = filterType === "All" || h.type === filterType;
    return matchQ && matchT;
  });

  const byMonth = MONTHS.map((mon, idx) => ({
    mon,
    items: filtered.filter((h) => new Date(h.date).getMonth() === idx),
  })).filter((m) => m.items.length > 0);

  const openAdd  = () => { setForm(EMPTY); setEditTarget(null); setModalOpen(true); };
  const openEdit = (h) => {
    setForm({ name: h.name, date: toInputDate(h.date), type: h.type, scope: h.scope, optional: h.optional });
    setEditTarget(h.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.date) return showToast("Name and date are required", "error");
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget, ...form });
        showToast("Holiday updated", "success");
      } else {
        await createMut.mutateAsync(form);
        showToast("Holiday added", "success");
      }
      setModalOpen(false);
    } catch {
      showToast("Failed to save holiday", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMut.mutateAsync(id);
      showToast("Holiday removed", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const national = holidays.filter((h) => h.type === "National").length;
  const regional = holidays.filter((h) => h.type === "Regional").length;
  const upcoming = holidays.filter((h) => new Date(h.date) >= new Date()).length;
  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <Box>
      <AppPageHeader
        title="Holiday Calendar"
        subtitle="Manage company and regional holidays for 2026"
        action={<Button leftSection={<IconPlus size={16}/>} onClick={openAdd} size="sm">Add Holiday</Button>}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconCalendarEvent size={18}/>} label="Total Holidays" value={holidays.length} sub="Year 2026"       color="blue"   />
        <AppStatCard icon={<IconBuilding size={18}/>}      label="National"       value={national}        sub="Mandatory"       color="violet" />
        <AppStatCard icon={<IconMapPin size={18}/>}        label="Regional"       value={regional}        sub="Branch-specific" color="teal"   />
        <AppStatCard icon={<IconCalendarEvent size={18}/>} label="Upcoming"       value={upcoming}        sub="Remaining 2026"  color="green"  />
      </SimpleGrid>

      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Search holidays..."
          leftSection={<IconSearch size={14}/>}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
          size="sm"
        />
        <Select
          value={filterType}
          onChange={setFilterType}
          data={["All","National","Regional"]}
          size="sm" w={140}
        />
      </Group>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}

      {isError && (
        <Alert icon={<IconAlertCircle size={16}/>} color="red" mb="md">
          Failed to load holidays. Make sure the backend is running and you are logged in.
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          {/* Month-grouped cards */}
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md" mb="md">
            {byMonth.map(({ mon, items }) => (
              <AppSection key={mon} title={mon} sub={`${items.length} holiday${items.length > 1 ? "s" : ""}`} noPadding>
                <Box p="sm" pb="xs">
                  {items.map((h, i, arr) => (
                    <Group key={h.id} justify="space-between" wrap="nowrap" py="xs"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                      <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="xs" fw={700} c="dimmed" w={26}>{new Date(h.date).getDate()}</Text>
                        <Box style={{ minWidth: 0 }}>
                          <Text fz="sm" fw={500} truncate>{h.name}</Text>
                          <Group gap={4} mt={2}>
                            <Badge size="xs" color={TYPE_COLOR[h.type] || "gray"} variant="light">{h.type}</Badge>
                            {h.optional && <Badge size="xs" color="orange" variant="light">Optional</Badge>}
                          </Group>
                        </Box>
                      </Group>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon size="xs" variant="subtle" color="blue" onClick={() => openEdit(h)}><IconEdit size={12}/></ActionIcon>
                        <ActionIcon size="xs" variant="subtle" color="red"  onClick={() => handleDelete(h.id)}><IconTrash size={12}/></ActionIcon>
                      </Group>
                    </Group>
                  ))}
                </Box>
              </AppSection>
            ))}
          </SimpleGrid>

          {/* Full table */}
          <AppSection title="All Holidays" sub={`${filtered.length} records`} noPadding>
            <Box style={{ overflowX: "auto" }}>
              <Table striped highlightOnHover withTableBorder={false} fz="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Holiday</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Day</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Scope</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[...filtered].sort((a, b) => new Date(a.date) - new Date(b.date)).map((h) => (
                    <Table.Tr key={h.id}>
                      <Table.Td><Text fw={500}>{h.name}</Text></Table.Td>
                      <Table.Td><Text c="dimmed">{new Date(h.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</Text></Table.Td>
                      <Table.Td><Text c="dimmed">{new Date(h.date).toLocaleDateString("en-IN", { weekday:"short" })}</Text></Table.Td>
                      <Table.Td><Badge color={TYPE_COLOR[h.type] || "gray"} variant="light" size="sm">{h.type}</Badge></Table.Td>
                      <Table.Td><Text fz="sm" c="dimmed">{h.scope}</Text></Table.Td>
                      <Table.Td><Badge color={h.optional ? "orange" : "green"} variant="light" size="sm">{h.optional ? "Optional" : "Mandatory"}</Badge></Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit(h)}><IconEdit size={14}/></ActionIcon>
                          <ActionIcon size="sm" variant="subtle" color="red" loading={deleteMut.isPending && deleteMut.variables === h.id} onClick={() => handleDelete(h.id)}><IconTrash size={14}/></ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </AppSection>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Holiday" : "Add Holiday"} size="sm">
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Holiday Name" placeholder="e.g. Diwali" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <TextInput type="date" label="Date" value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <Select label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))}
            data={["National","Regional"]} />
          <Select label="Scope" value={form.scope} onChange={(v) => setForm((f) => ({ ...f, scope: v }))}
            data={["Company","Branch","Department"]} />
          <Select label="Mandatory / Optional"
            value={form.optional ? "Optional" : "Mandatory"}
            onChange={(v) => setForm((f) => ({ ...f, optional: v === "Optional" }))}
            data={["Mandatory","Optional"]} />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={isSaving}>{editTarget ? "Update" : "Add Holiday"}</Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
