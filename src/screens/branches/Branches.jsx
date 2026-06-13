import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Text, Group, Badge, Modal, TextInput, Select, SimpleGrid } from "@mantine/core";
import { IconBuilding, IconPlus, IconEdit, IconTrash, IconMapPin } from "@tabler/icons-react";
import { fetchBranches, createBranch, updateBranch, deleteBranch } from "../../api/branchApi";
import { useToast } from "../../components/ui/Toast";

const MOCK = [
  { id: 1, name: "Chennai", code: "CHN", location: "Tamil Nadu", status: "Active" },
  { id: 2, name: "Bangalore", code: "BLR", location: "Karnataka", status: "Active" },
  { id: 3, name: "Mumbai", code: "MUM", location: "Maharashtra", status: "Active" },
  { id: 4, name: "Dubai", code: "DXB", location: "UAE", status: "Active" },
];

const statusColor = (s) => s === "Active" ? "#22c55e" : "#94a3b8";
const statusBg    = (s) => s === "Active" ? "#f0fdf4" : "#f1f5f9";

export default function Branches({ darkMode }) {
  const qc = useQueryClient();
  const { show } = useToast();
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ name: "", code: "", location: "", status: "Active" });
  const [deleteId, setDeleteId] = useState(null);

  const { data: raw = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => fetchBranches().then(r => r.data?.data ?? r.data ?? []),
    placeholderData: MOCK,
  });
  const branches = raw.length ? raw : MOCK;

  const saveMut = useMutation({
    mutationFn: (d) => editing ? updateBranch(editing.id, d) : createBranch(d),
    onSuccess: () => { qc.invalidateQueries(["branches"]); setOpen(false); show(editing ? "Branch updated successfully" : "Branch created successfully", "success"); },
    onError: () => show("Failed to save branch", "error"),
  });

  const delMut = useMutation({
    mutationFn: (id) => deleteBranch(id),
    onSuccess: () => { qc.invalidateQueries(["branches"]); setDeleteId(null); show("Branch deleted", "success"); },
    onError: () => show("Failed to delete branch", "error"),
  });

  const openAdd = () => { setEditing(null); setForm({ name: "", code: "", location: "", status: "Active" }); setOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, code: b.code || "", location: b.location || "", status: b.status }); setOpen(true); };

  const card   = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text   = darkMode ? "#f1f5f9" : "#0f172a";
  const sub    = darkMode ? "#94a3b8" : "#64748b";

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fz="xl" fw={800} c={text}>Branch Management</Text>
          <Text fz="sm" c={sub} mt={2}>{branches.length} branches across locations</Text>
        </Box>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
          borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff",
          fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          <IconPlus size={16} stroke={2.5} />
          Add Branch
        </button>
      </Group>

      {/* Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {branches.map((b) => (
          <Box key={b.id} style={{
            background: card, border: `1px solid ${border}`, borderRadius: 16,
            padding: 20, position: "relative",
          }}>
            <Group justify="space-between" mb={12}>
              <Box style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconBuilding size={22} color="#fff" stroke={1.8} />
              </Box>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: statusBg(b.status), color: statusColor(b.status),
              }}>{b.status}</span>
            </Group>

            <Text fw={700} fz="md" c={text} mb={4}>{b.name}</Text>
            {b.code && <Text fz="xs" c={sub} mb={2}>Code: {b.code}</Text>}
            {b.location && (
              <Group gap={4} mt={4}>
                <IconMapPin size={12} color={sub} stroke={1.8} />
                <Text fz="xs" c={sub}>{b.location}</Text>
              </Group>
            )}

            <Group gap={8} mt={16}>
              <button onClick={() => openEdit(b)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${border}`,
                background: "transparent", color: sub, fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                <IconEdit size={13} stroke={2} /> Edit
              </button>
              <button onClick={() => setDeleteId(b.id)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #fee2e2",
                background: "transparent", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                <IconTrash size={13} stroke={2} /> Delete
              </button>
            </Group>
          </Box>
        ))}
      </SimpleGrid>

      {/* Add/Edit Modal */}
      <Modal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit Branch" : "Add Branch"}
        centered radius="xl" size="sm"
        styles={{ header: { background: card, borderBottom: `1px solid ${border}` }, body: { background: card } }}>
        <Box style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextInput label="Branch Name" placeholder="e.g. Chennai" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <TextInput label="Branch Code" placeholder="e.g. CHN"
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <TextInput label="Location" placeholder="e.g. Tamil Nadu"
            value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
            data={["Active", "Inactive"]}
            styles={{ input: { background: darkMode ? "#0f172a" : "#f8fafc", borderColor: border, color: text } }} />
          <Group justify="flex-end" mt="sm">
            <button onClick={() => setOpen(false)} style={{
              padding: "9px 20px", borderRadius: 8, border: `1px solid ${border}`,
              background: "transparent", color: sub, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={() => saveMut.mutate(form)} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer",
            }}>{saveMut.isPending ? "Saving..." : editing ? "Update" : "Create"}</button>
          </Group>
        </Box>
      </Modal>

      {/* Delete Confirm */}
      <Modal opened={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Branch"
        centered radius="xl" size="xs"
        styles={{ header: { background: card }, body: { background: card } }}>
        <Text fz="sm" c={sub} mb="lg">Are you sure you want to delete this branch?</Text>
        <Group justify="flex-end">
          <button onClick={() => setDeleteId(null)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: sub, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => delMut.mutate(deleteId)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Delete</button>
        </Group>
      </Modal>
    </Box>
  );
}
