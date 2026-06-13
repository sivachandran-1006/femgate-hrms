import { useState } from "react";
import { SimpleGrid, Box, Group, Text, Badge, Button, TextInput, Select, Modal, Table, ActionIcon } from "@mantine/core";
import { IconPlus, IconSearch, IconEdit, IconTrash, IconCalendarEvent, IconMapPin, IconBuilding } from "@tabler/icons-react";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppSection } from "../../components/ui/AppSection";
import { AppStatCard } from "../../components/ui/AppStatCard";
import { useToast } from "../../components/ui/Toast";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const INIT_HOLIDAYS = [
  { id: 1,  name: "New Year's Day",          date: "2026-01-01", type: "National",  scope: "Company",    optional: false },
  { id: 2,  name: "Pongal",                  date: "2026-01-14", type: "Regional",  scope: "Branch",     optional: false },
  { id: 3,  name: "Republic Day",            date: "2026-01-26", type: "National",  scope: "Company",    optional: false },
  { id: 4,  name: "Holi",                    date: "2026-03-14", type: "National",  scope: "Company",    optional: true  },
  { id: 5,  name: "Good Friday",             date: "2026-04-03", type: "National",  scope: "Company",    optional: false },
  { id: 6,  name: "Eid ul-Fitr",             date: "2026-04-21", type: "National",  scope: "Company",    optional: false },
  { id: 7,  name: "Tamil New Year",          date: "2026-04-14", type: "Regional",  scope: "Branch",     optional: false },
  { id: 8,  name: "May Day",                 date: "2026-05-01", type: "National",  scope: "Company",    optional: false },
  { id: 9,  name: "Independence Day",        date: "2026-08-15", type: "National",  scope: "Company",    optional: false },
  { id: 10, name: "Onam",                    date: "2026-08-27", type: "Regional",  scope: "Branch",     optional: true  },
  { id: 11, name: "Gandhi Jayanti",          date: "2026-10-02", type: "National",  scope: "Company",    optional: false },
  { id: 12, name: "Diwali",                  date: "2026-10-20", type: "National",  scope: "Company",    optional: false },
  { id: 13, name: "Dussehra",                date: "2026-10-22", type: "National",  scope: "Company",    optional: true  },
  { id: 14, name: "Christmas",               date: "2026-12-25", type: "National",  scope: "Company",    optional: false },
];

const TYPE_COLOR = { National: "blue", Regional: "teal", Company: "violet", Optional: "orange" };

const EMPTY = { name: "", date: "", type: "National", scope: "Company", optional: false };

export default function HolidayCalendar() {
  const [holidays, setHolidays]     = useState(INIT_HOLIDAYS);
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("All");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const { showToast }               = useToast();

  const filtered = holidays.filter((h) => {
    const q = search.toLowerCase();
    const matchQ = !q || h.name.toLowerCase().includes(q);
    const matchT = filterType === "All" || h.type === filterType;
    return matchQ && matchT;
  });

  const byMonth = MONTHS.map((mon, idx) => ({
    mon,
    items: filtered.filter((h) => new Date(h.date).getMonth() === idx),
  })).filter((m) => m.items.length > 0);

  const openAdd = () => { setForm(EMPTY); setEditTarget(null); setModalOpen(true); };
  const openEdit = (h) => { setForm({ ...h }); setEditTarget(h.id); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.date) return showToast("Name and date are required", "error");
    if (editTarget) {
      setHolidays((prev) => prev.map((h) => h.id === editTarget ? { ...form, id: editTarget } : h));
      showToast("Holiday updated", "success");
    } else {
      setHolidays((prev) => [...prev, { ...form, id: Date.now() }]);
      showToast("Holiday added", "success");
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    showToast("Holiday removed", "success");
  };

  const national  = holidays.filter((h) => h.type === "National").length;
  const regional  = holidays.filter((h) => h.type === "Regional").length;
  const optional  = holidays.filter((h) => h.optional).length;
  const upcoming  = holidays.filter((h) => new Date(h.date) >= new Date()).length;

  return (
    <Box>
      <AppPageHeader
        title="Holiday Calendar"
        subtitle="Manage company and regional holidays for 2026"
        action={<Button leftSection={<IconPlus size={16}/>} onClick={openAdd} size="sm">Add Holiday</Button>}
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconCalendarEvent size={18}/>} label="Total Holidays"    value={holidays.length} sub="Year 2026"     color="blue"   />
        <AppStatCard icon={<IconBuilding size={18}/>}      label="National"          value={national}        sub="Mandatory"      color="violet" />
        <AppStatCard icon={<IconMapPin size={18}/>}        label="Regional"          value={regional}        sub="Branch-specific" color="teal"  />
        <AppStatCard icon={<IconCalendarEvent size={18}/>} label="Upcoming"          value={upcoming}        sub="Remaining 2026" color="green"  />
      </SimpleGrid>

      {/* Filters */}
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
          size="sm"
          w={140}
        />
      </Group>

      {/* Month-grouped calendar view */}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md" mb="md">
        {byMonth.map(({ mon, items }) => (
          <AppSection key={mon} title={mon} sub={`${items.length} holiday${items.length > 1 ? "s" : ""}`} noPadding>
            <Box p="sm" pb="xs">
              {items.map((h, i, arr) => (
                <Group key={h.id} justify="space-between" wrap="nowrap" py="xs"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                  <Box style={{ minWidth: 0 }}>
                    <Group gap={6} wrap="nowrap">
                      <Text fz="xs" fw={700} c="dimmed" w={32}>
                        {new Date(h.date).getDate()}
                      </Text>
                      <Box style={{ minWidth: 0 }}>
                        <Text fz="sm" fw={500} truncate>{h.name}</Text>
                        <Group gap={4} mt={2}>
                          <Badge size="xs" color={TYPE_COLOR[h.type] || "gray"} variant="light">{h.type}</Badge>
                          {h.optional && <Badge size="xs" color="orange" variant="light">Optional</Badge>}
                        </Group>
                      </Box>
                    </Group>
                  </Box>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon size="xs" variant="subtle" color="blue" onClick={() => openEdit(h)}><IconEdit size={12}/></ActionIcon>
                    <ActionIcon size="xs" variant="subtle" color="red" onClick={() => handleDelete(h.id)}><IconTrash size={12}/></ActionIcon>
                  </Group>
                </Group>
              ))}
            </Box>
          </AppSection>
        ))}
      </SimpleGrid>

      {/* Full list table */}
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
                <Table.Th>Optional</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.sort((a,b) => a.date.localeCompare(b.date)).map((h) => (
                <Table.Tr key={h.id}>
                  <Table.Td><Text fw={500}>{h.name}</Text></Table.Td>
                  <Table.Td><Text c="dimmed">{new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Text></Table.Td>
                  <Table.Td><Text c="dimmed">{new Date(h.date).toLocaleDateString("en-IN", { weekday: "short" })}</Text></Table.Td>
                  <Table.Td><Badge color={TYPE_COLOR[h.type] || "gray"} variant="light" size="sm">{h.type}</Badge></Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed">{h.scope}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={h.optional ? "orange" : "green"} variant="light" size="sm">{h.optional ? "Optional" : "Mandatory"}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit(h)}><IconEdit size={14}/></ActionIcon>
                      <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(h.id)}><IconTrash size={14}/></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </AppSection>

      {/* Add / Edit Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Holiday" : "Add Holiday"} size="sm">
        <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Holiday Name" placeholder="e.g. Diwali" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <TextInput type="date" label="Date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <Select label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} data={["National","Regional"]} />
          <Select label="Scope" value={form.scope} onChange={(v) => setForm((f) => ({ ...f, scope: v }))} data={["Company","Branch","Department"]} />
          <Select label="Mandatory / Optional" value={form.optional ? "Optional" : "Mandatory"}
            onChange={(v) => setForm((f) => ({ ...f, optional: v === "Optional" }))} data={["Mandatory","Optional"]} />
          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editTarget ? "Update" : "Add Holiday"}</Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
