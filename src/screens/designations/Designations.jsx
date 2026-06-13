import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, SimpleGrid, Modal, TextInput, Select, NumberInput } from "@mantine/core";
import { IconBriefcase, IconPlus, IconEdit, IconTrash, IconChevronUp } from "@tabler/icons-react";
import { fetchDesignations, createDesignation, updateDesignation, deleteDesignation } from "../../api/designationApi";

const MOCK = [
  { id: 1, name: "CEO",            level: 9, status: "Active", department: null },
  { id: 2, name: "Vice President", level: 8, status: "Active", department: null },
  { id: 3, name: "Director",       level: 7, status: "Active", department: null },
  { id: 4, name: "Senior Manager", level: 6, status: "Active", department: null },
  { id: 5, name: "Manager",        level: 5, status: "Active", department: null },
  { id: 6, name: "Lead",           level: 4, status: "Active", department: null },
  { id: 7, name: "Senior Executive", level: 3, status: "Active", department: null },
  { id: 8, name: "Executive",      level: 2, status: "Active", department: null },
  { id: 9, name: "Associate",      level: 1, status: "Active", department: null },
  { id: 10, name: "Intern",        level: 0, status: "Active", department: null },
];

const levelColor = (l) => {
  if (l >= 8) return { bg: "#fef3c7", text: "#d97706" };
  if (l >= 6) return { bg: "#ede9fe", text: "#7c3aed" };
  if (l >= 4) return { bg: "#dbeafe", text: "#2563eb" };
  if (l >= 2) return { bg: "#dcfce7", text: "#16a34a" };
  return { bg: "#f1f5f9", text: "#64748b" };
};

export default function Designations({ darkMode }) {
  const qc = useQueryClient();
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name: "", level: 1, status: "Active" });
  const [deleteId, setDeleteId] = useState(null);

  const { data: raw = [] } = useQuery({
    queryKey: ["designations"],
    queryFn: () => fetchDesignations().then(r => r.data?.data ?? r.data ?? []),
    placeholderData: MOCK,
  });
  const designations = (raw.length ? raw : MOCK).sort((a, b) => b.level - a.level);

  const saveMut = useMutation({
    mutationFn: (d) => editing ? updateDesignation(editing.id, d) : createDesignation(d),
    onSuccess: () => { qc.invalidateQueries(["designations"]); setOpen(false); },
  });

  const delMut = useMutation({
    mutationFn: (id) => deleteDesignation(id),
    onSuccess: () => { qc.invalidateQueries(["designations"]); setDeleteId(null); },
  });

  const openAdd  = () => { setEditing(null); setForm({ name: "", level: 1, status: "Active" }); setOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, level: d.level, status: d.status }); setOpen(true); };

  const card   = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text   = darkMode ? "#f1f5f9" : "#0f172a";
  const sub    = darkMode ? "#94a3b8" : "#64748b";

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fz="xl" fw={800} c={text}>Designation Management</Text>
          <Text fz="sm" c={sub} mt={2}>{designations.length} designations configured</Text>
        </Box>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
          borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff",
          fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          <IconPlus size={16} stroke={2.5} /> Add Designation
        </button>
      </Group>

      {/* Hierarchy visual */}
      <Box style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <Text fz="sm" fw={700} c={sub} mb={16} tt="uppercase" style={{ letterSpacing: "0.06em" }}>Hierarchy (Top → Bottom)</Text>
        <Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {designations.map((d, i) => {
            const lc = levelColor(d.level);
            return (
              <Box key={d.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Box style={{ width: 28, height: 28, borderRadius: 8, background: lc.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Text fz="xs" fw={800} c={lc.text}>{d.level}</Text>
                </Box>
                <Box style={{ flex: 1, height: 36, borderRadius: 8, background: lc.bg, display: "flex", alignItems: "center", paddingLeft: 12 }}>
                  <Text fz="sm" fw={600} c={lc.text}>{d.name}</Text>
                </Box>
                {i < designations.length - 1 && (
                  <IconChevronUp size={14} color={sub} stroke={2} style={{ transform: "rotate(180deg)" }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {designations.map((d) => {
          const lc = levelColor(d.level);
          return (
            <Box key={d.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
              <Group justify="space-between" mb={12}>
                <Box style={{ width: 44, height: 44, borderRadius: 12, background: lc.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconBriefcase size={20} color={lc.text} stroke={1.8} />
                </Box>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: lc.bg, color: lc.text }}>
                  Level {d.level}
                </span>
              </Group>
              <Text fw={700} fz="md" c={text} mb={4}>{d.name}</Text>
              <Text fz="xs" c={sub}>{d.department?.name || "All Departments"}</Text>
              <Group gap={8} mt={16}>
                <button onClick={() => openEdit(d)} style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${border}`,
                  background: "transparent", color: sub, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                  <IconEdit size={13} stroke={2} /> Edit
                </button>
                <button onClick={() => setDeleteId(d.id)} style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #fee2e2",
                  background: "transparent", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                  <IconTrash size={13} stroke={2} /> Delete
                </button>
              </Group>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Add/Edit Modal */}
      <Modal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit Designation" : "Add Designation"}
        centered radius="xl" size="sm"
        styles={{ header: { background: card, borderBottom: `1px solid ${border}` }, body: { background: card } }}>
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextInput label="Designation Name" placeholder="e.g. Senior Manager" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <NumberInput label="Hierarchy Level" description="1=Intern, 9=CEO" min={0} max={9}
            value={form.level} onChange={(v) => setForm({ ...form, level: v })}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
            data={["Active", "Inactive"]}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <Group justify="flex-end" mt="sm">
            <button onClick={() => setOpen(false)} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => saveMut.mutate(form)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
              {saveMut.isPending ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </Group>
        </Box>
      </Modal>

      {/* Delete Confirm */}
      <Modal opened={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Designation"
        centered radius="xl" size="xs"
        styles={{ header: { background: card }, body: { background: card } }}>
        <Text fz="sm" c={sub} mb="lg">Are you sure you want to delete this designation?</Text>
        <Group justify="flex-end">
          <button onClick={() => setDeleteId(null)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => delMut.mutate(deleteId)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Delete</button>
        </Group>
      </Modal>
    </Box>
  );
}
