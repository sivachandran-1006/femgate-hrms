import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ActionIcon, Avatar, ScrollArea, Table,
  TextInput, Select, Stack, Loader, Alert, Box, Button, Menu, Pagination,
} from "@mantine/core";
import {
  IconBuildingCommunity, IconUsers, IconUserCheck, IconStack2,
  IconPlus, IconPencil, IconTrash, IconSearch, IconAlertCircle, IconAlertTriangle,
  IconEye, IconBan, IconUpload, IconDownload, IconFileExport, IconFilter,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { usePermission } from "../../hooks/usePermission";

// ── Mock stubs for removed service functions ──
const exportDepartments = async (...args) => { console.log("Mock: exportDepartments"); return new Blob(["mock data"], { type: "text/csv" }); };


const PAGE_SIZE = 8;
const EMPTY_FORM = {
  name: "", code: "", description: "", branchId: "", headId: "",
  emailAlias: "", costCenter: "", budget: "", status: "Active",
};

const STATUS_COLOR = { Active: "green", Inactive: "gray" };

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_DEPARTMENTS = [
  { id: "d1", name: "Engineering",  code: "ENG",  headName: "Arjun Kumar",   branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 16, status: "Active",   createdAt: "2024-01-15T00:00:00Z" },
  { id: "d2", name: "Sales",        code: "SLS",  headName: "Rahul Verma",   branch: { name: "Bangalore"  }, branchId: "b2", employeeCount: 9,  status: "Active",   createdAt: "2024-01-20T00:00:00Z" },
  { id: "d3", name: "HR",           code: "HR",   headName: "Priya Sharma",  branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 5,  status: "Active",   createdAt: "2024-02-01T00:00:00Z" },
  { id: "d4", name: "Finance",      code: "FIN",  headName: "Sneha Nair",    branch: { name: "Mumbai"     }, branchId: "b3", employeeCount: 6,  status: "Active",   createdAt: "2024-02-10T00:00:00Z" },
  { id: "d5", name: "Operations",   code: "OPS",  headName: "Vikram Singh",  branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 6,  status: "Active",   createdAt: "2024-03-05T00:00:00Z" },
  { id: "d6", name: "Marketing",    code: "MKT",  headName: "Deepika Rao",   branch: { name: "Bangalore"  }, branchId: "b2", employeeCount: 4,  status: "Active",   createdAt: "2024-03-12T00:00:00Z" },
  { id: "d7", name: "Legal",        code: "LGL",  headName: null,            branch: { name: "Mumbai"     }, branchId: "b3", employeeCount: 2,  status: "Inactive", createdAt: "2024-04-01T00:00:00Z" },
  { id: "d8", name: "IT Support",   code: "ITS",  headName: "Arun Prakash",  branch: { name: "Chennai HQ" }, branchId: "b1", employeeCount: 3,  status: "Active",   createdAt: "2024-04-15T00:00:00Z" },
];

// ─── Add / Edit Drawer-style Modal ────────────────────────────────────────────
const DeptModal = ({ open, onClose, onSave, editData, saving, branches, heads }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr]   = useState({});

  useEffect(() => {
    if (open) {
      setErr({});
      setForm(editData ? {
        name: editData.name || "", code: editData.code || "", description: editData.description || "",
        branchId: editData.branchId ? String(editData.branchId) : "",
        // map existing head name back to its employee id (first match)
        headId: editData.headName
          ? String(heads.find((h) => h.name === editData.headName)?.id || "")
          : "",
        emailAlias: editData.emailAlias || "", costCenter: editData.costCenter || "",
        budget: editData.budget != null ? String(editData.budget) : "", status: editData.status || "Active",
      } : EMPTY_FORM);
    }
  }, [open, editData, heads]);

  if (!open) return null;
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v?.currentTarget ? v.currentTarget.value : v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Department Name is required";
    if (!form.code.trim()) e.code = "Department Code is required";
    if (!form.branchId)    e.branchId = "Branch is required";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = (keepOpen) => {
    if (!validate()) return;
    const head = heads.find((h) => String(h.id) === String(form.headId));
    const { headId, ...rest } = form;
    onSave({
      ...rest,
      headName:  head?.name  || null,
      headEmail: head?.email || null,
      branchId:  form.branchId || null,
    }, keepOpen);
  };

  return (
    <AppModal opened={open} onClose={onClose} size="lg"
      title={editData ? "Edit Department" : "Add Department"}
      icon={<IconBuildingCommunity size={16} color="#3b82f6" />} iconColor="#3b82f6">
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput label="Department Name *" placeholder="e.g. Engineering"
            value={form.name} onChange={set("name")} error={err.name} />
          <AppInput label="Department Code *" placeholder="e.g. ENG"
            value={form.code} onChange={set("code")} error={err.code} />
        </SimpleGrid>

        <AppInput type="textarea" label="Department Description" placeholder="What this department does…"
          value={form.description} onChange={set("description")} />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput type="select" label="Branch *" placeholder="Select branch" searchable
            data={branches.map((b) => ({ value: String(b.id), label: b.name }))}
            value={form.branchId} onChange={set("branchId")} error={err.branchId} />
          <AppInput type="select" label="Department Head" placeholder="Select employee" searchable clearable
            data={heads.map((h) => ({ value: String(h.id), label: `${h.name}${h.designation ? ` — ${h.designation}` : ""}` }))}
            value={form.headId} onChange={set("headId")} />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput label="Email Alias" placeholder="eng@company.com"
            value={form.emailAlias} onChange={set("emailAlias")} />
          <AppInput label="Cost Center" placeholder="CC-1001"
            value={form.costCenter} onChange={set("costCenter")} />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput type="number" label="Budget (₹)" placeholder="0" min={0} thousandSeparator=","
            value={form.budget} onChange={(v) => setForm((p) => ({ ...p, budget: v }))} />
          <AppInput type="select" label="Status" data={["Active", "Inactive"]}
            value={form.status} onChange={set("status")} />
        </SimpleGrid>

        <Group justify="flex-end" gap="sm" mt="xs">
          <AppButton variant="default" onClick={onClose}>Cancel</AppButton>
          {!editData && (
            <AppButton variant="light" loading={saving} onClick={() => submit(true)}>Save &amp; Continue</AppButton>
          )}
          <AppButton loading={saving} onClick={() => submit(false)}>
            {editData ? "Save Changes" : "Save"}
          </AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
};

const Departments = () => {
  const navigate = useNavigate();
  const { show: showToast } = useToast();
  const can = usePermission();
  const canCreate = can("departments.create");
  const canEdit   = can("departments.edit");
  const canDelete = can("departments.delete");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy]     = useState("name");
  const [statusF, setStatusF]       = useState("All");
  const [branchF, setBranchF]       = useState("All");
  const [headF, setHeadF]           = useState("All");
  const [dateF, setDateF]           = useState("All");
  const [page, setPage]             = useState(1);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  const { data: rawDepartments, isLoading, isError } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const departments = rawDepartments?.length ? rawDepartments : MOCK_DEPARTMENTS;
  const { data: heads = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: branchesRes } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const branches = branchesRes || [];

  const createMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const updateMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const deleteMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const importMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  // unique heads for the filter dropdown
  const headOptions = useMemo(
    () => ["All", ...new Set(departments.map((d) => d.headName).filter(Boolean))],
    [departments]
  );

  const matchesDate = (createdAt) => {
    if (dateF === "All" || !createdAt) return true;
    const now = new Date();
    const d = new Date(createdAt);
    const days = (now - d) / (1000 * 60 * 60 * 24);
    if (dateF === "Today")     return d.toDateString() === now.toDateString();
    if (dateF === "Last 7")    return days <= 7;
    if (dateF === "Last 30")   return days <= 30;
    if (dateF === "This Year") return d.getFullYear() === now.getFullYear();
    return true;
  };

  const filtered = useMemo(() => departments.filter((d) => {
    const q = searchTerm.toLowerCase();
    const field = searchBy === "code" ? (d.code || "") : searchBy === "head" ? (d.headName || "") : d.name;
    const matchSearch = !q || field.toLowerCase().includes(q);
    const matchStatus = statusF === "All" || d.status === statusF;
    const matchBranch = branchF === "All" || String(d.branchId) === branchF;
    const matchHead   = headF === "All" || d.headName === headF;
    return matchSearch && matchStatus && matchBranch && matchHead && matchesDate(d.createdAt);
  }), [departments, searchTerm, searchBy, statusF, branchF, headF, dateF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchTerm, searchBy, statusF, branchF, headF, dateF]);

  const totalEmployees = departments.reduce((s, d) => s + (d.employeeCount || 0), 0);
  const uniqueHeads    = new Set(departments.map((d) => d.headName).filter(Boolean)).size;
  const activeCount    = departments.filter((d) => d.status === "Active").length;

  const handleSave = async (form, keepOpen) => {
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget.id, ...form });
        showToast("Department updated successfully", "success");
      } else {
        await createMut.mutateAsync(form);
        showToast("Department created successfully", "success");
      }
      if (keepOpen) { setEditTarget(null); }
      else { setModalOpen(false); setEditTarget(null); }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save department", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete department", "error");
    }
  };

  const handleDisable = async (dept) => {
    try {
      const next = dept.status === "Active" ? "Inactive" : "Active";
      await updateMut.mutateAsync({ id: dept.id, status: next });
      showToast(`"${dept.name}" ${next === "Inactive" ? "disabled" : "enabled"}`, next === "Inactive" ? "info" : "success");
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleExport = async (format) => {
    try {
      const blob = await exportDepartments(format);
      if (format === "pdf") {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");           // opens printable view → Save as PDF
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `departments.${format === "excel" ? "csv" : format}`;
        a.click(); URL.revokeObjectURL(url);
      }
      showToast(`Exported as ${format.toUpperCase()}`, "success");
    } catch {
      showToast("Export failed", "error");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importMut.mutateAsync(file);
      showToast(`Imported ${res.created} departments${res.skipped ? `, ${res.skipped} skipped` : ""}`, "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Import failed", "error");
    } finally {
      e.target.value = "";
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-") : "—";

  const COLS = ["Department", "Code", "Head", "Branch", "Employees", "Status", "Created", "Actions"];

  const rows = pageRows.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={COLS.length}>
        <AppEmptyState message="No departments available"
          action={
            <AppButton mt="sm" leftSection={<IconPlus size={16} />}
              onClick={() => { setEditTarget(null); setModalOpen(true); }}>
              Add Department
            </AppButton>
          } />
      </Table.Td>
    </Table.Tr>
  ) : (
    pageRows.map((dept) => (
      <Table.Tr key={dept.id} style={{ cursor: "pointer" }}>
        <Table.Td onClick={() => navigate(`/departments/${dept.id}`)}>
          <Group gap="sm" wrap="nowrap">
            <Avatar size={32} radius="md" color="blue" variant="light"><IconBuildingCommunity size={16} /></Avatar>
            <Text size="sm" fw={600}>{dept.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td><Text size="sm" c="dimmed">{dept.code || "—"}</Text></Table.Td>
        <Table.Td><Text size="sm" c="dimmed">{dept.headName || "—"}</Text></Table.Td>
        <Table.Td><Text size="sm" c="dimmed">{dept.branch?.name || "—"}</Text></Table.Td>
        <Table.Td>
          <Group gap={6} wrap="nowrap"><IconUsers size={14} /><Text size="sm" fw={500}>{dept.employeeCount || 0}</Text></Group>
        </Table.Td>
        <Table.Td>
          <Badge color={STATUS_COLOR[dept.status] || "gray"} variant="light" radius="xl">{dept.status}</Badge>
        </Table.Td>
        <Table.Td><Text size="sm" c="dimmed">{fmtDate(dept.createdAt)}</Text></Table.Td>
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon variant="light" color="gray" size="sm" radius="md" title="View"
              onClick={() => navigate(`/departments/${dept.id}`)}><IconEye size={13} /></ActionIcon>
            {canEdit && (
              <ActionIcon variant="light" color="blue" size="sm" radius="md" title="Edit"
                onClick={() => { setEditTarget(dept); setModalOpen(true); }}><IconPencil size={13} /></ActionIcon>
            )}
            {canEdit && (
              <ActionIcon variant="light" color="orange" size="sm" radius="md"
                title={dept.status === "Active" ? "Disable" : "Enable"}
                onClick={() => handleDisable(dept)}><IconBan size={13} /></ActionIcon>
            )}
            {canDelete && (
              <ActionIcon variant="light" color="red" size="sm" radius="md" title="Delete"
                onClick={() => setDeleteTarget(dept)}><IconTrash size={13} /></ActionIcon>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    ))
  );

  return (
    <>
      <AppPageHeader
        title="Departments"
        sub="Create, manage and organize company departments"
        action={
          <Group gap="sm">
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleImport} />
            {canCreate && (
              <AppButton variant="default" leftSection={<IconUpload size={16} />}
                loading={importMut.isPending} onClick={() => fileRef.current?.click()}>Import</AppButton>
            )}
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("excel")}>Excel (CSV)</Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("csv")}>CSV</Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("pdf")}>PDF</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            {canCreate && (
              <AppButton leftSection={<IconPlus size={16} />}
                onClick={() => { setEditTarget(null); setModalOpen(true); }}>Add Department</AppButton>
            )}
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<IconBuildingCommunity size={22} />} label="Total Departments" value={departments.length} color="blue" />
        <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={totalEmployees} color="green" />
        <AppStatCard icon={<IconUserCheck size={22} />} label="Department Heads" value={uniqueHeads} color="violet" />
        <AppStatCard icon={<IconStack2 size={22} />} label="Active Departments" value={activeCount} color="blue" />
      </SimpleGrid>

      {/* Search + filters */}
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" data={[{ value: "name", label: "Name" }, { value: "code", label: "Code" }, { value: "head", label: "Head" }]}
            value={searchBy} onChange={setSearchBy} size="sm" radius="md" w={130} />
          <TextInput label="Search" placeholder={`Search by ${searchBy}…`} leftSection={<IconSearch size={16} />}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="sm" radius="md" style={{ flex: 1, minWidth: 200 }} />
          <Select label="Status" data={["All", "Active", "Inactive"]} value={statusF} onChange={setStatusF} size="sm" radius="md" w={130} leftSection={<IconFilter size={14} />} />
          <Select label="Branch" data={["All", ...branches.map((b) => ({ value: String(b.id), label: b.name }))]}
            value={branchF} onChange={setBranchF} size="sm" radius="md" w={150} />
          <Select label="Head" data={headOptions} value={headF} onChange={setHeadF} size="sm" radius="md" w={150} />
          <Select label="Created" data={["All", "Today", "Last 7", "Last 30", "This Year"]}
            value={dateF} onChange={setDateF} size="sm" radius="md" w={130} />
        </Group>
      </AppSection>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}
      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          Failed to load departments. Make sure the backend is running and you are logged in.
        </Alert>
      )}

      {!isLoading && !isError && (
        <AppSection noPadding title="All Departments" sub={`${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  {COLS.map((col) => (
                    <Table.Th key={col}>
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>{col}</Text>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
          {filtered.length > PAGE_SIZE && (
            <Group justify="flex-end" p="md">
              <Pagination total={totalPages} value={page} onChange={setPage} size="sm" radius="md" />
            </Group>
          )}
        </AppSection>
      )}

      <DeptModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        editData={editTarget}
        saving={createMut.isPending || updateMut.isPending}
        branches={branches}
        heads={heads}
      />

      <AppModal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Department"
        icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete <Text span fw={700}>{deleteTarget?.name}</Text>?
            This can only be done if no employees or active designations are assigned.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" onClick={handleDelete} loading={deleteMut.isPending}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default Departments;
