import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ActionIcon, Avatar, ScrollArea, Table,
  TextInput, Select, Stack, Loader, Alert, Box, Button, Menu, Pagination,
} from "@mantine/core";
import {
  IconBriefcase, IconUsers, IconStack2, IconChartBar,
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
import { useDepartments } from "../../queries/useDepartments";
import { exportDesignations } from "../../api/designationApi";
import {
  useDesignations, useCreateDesignation, useUpdateDesignation, useDeleteDesignation,
  useImportDesignations,
} from "../../queries/useDesignations";

const PAGE_SIZE = 8;
const LEVELS = [
  { value: "1", label: "1 — Intern" }, { value: "2", label: "2 — Associate" },
  { value: "3", label: "3 — Executive" }, { value: "4", label: "4 — Senior Executive" },
  { value: "5", label: "5 — Lead" }, { value: "6", label: "6 — Manager" },
  { value: "7", label: "7 — Senior Manager" }, { value: "8", label: "8 — Director" },
  { value: "9", label: "9 — Vice President" }, { value: "10", label: "10 — CEO" },
];
const GRADES = ["A1", "A2", "A3", "B1", "B2", "C1", "C2"];
const CATEGORIES = ["Full-time", "Part-time", "Contract", "Intern"];
const STATUS_COLOR = { Active: "green", Inactive: "gray" };

const EMPTY_FORM = {
  name: "", code: "", departmentId: "", description: "",
  level: "3", grade: "B1", employmentCategory: "Full-time", status: "Active",
};

const DesigModal = ({ open, onClose, onSave, editData, saving, departments }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr]   = useState({});

  useEffect(() => {
    if (open) {
      setErr({});
      setForm(editData ? {
        name: editData.name || "", code: editData.code || "",
        departmentId: editData.departmentId ? String(editData.departmentId) : "",
        description: editData.description || "", level: String(editData.level || 3),
        grade: editData.grade || "B1", employmentCategory: editData.employmentCategory || "Full-time",
        status: editData.status || "Active",
      } : EMPTY_FORM);
    }
  }, [open, editData]);

  if (!open) return null;
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v?.currentTarget ? v.currentTarget.value : v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name = "Designation Name is required";
    if (!form.code.trim())   e.code = "Designation Code is required";
    if (!form.departmentId)  e.departmentId = "Department is required";
    if (!form.level)         e.level = "Level is required";
    if (!form.grade)         e.grade = "Grade is required";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = (keepOpen) => {
    if (!validate()) return;
    onSave({ ...form, level: Number(form.level), departmentId: Number(form.departmentId) }, keepOpen);
  };

  return (
    <AppModal opened={open} onClose={onClose} size="lg"
      title={editData ? "Edit Designation" : "Add Designation"}
      icon={<IconBriefcase size={16} color="#3b82f6" />} iconColor="#3b82f6">
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput label="Designation Name *" placeholder="e.g. Senior Manager" value={form.name} onChange={set("name")} error={err.name} />
          <AppInput label="Designation Code *" placeholder="e.g. SM" value={form.code} onChange={set("code")} error={err.code} />
        </SimpleGrid>
        <AppInput type="select" label="Department *" placeholder="Select department" searchable
          data={departments.map((d) => ({ value: String(d.id), label: d.name }))}
          value={form.departmentId} onChange={set("departmentId")} error={err.departmentId} />
        <AppInput type="textarea" label="Description" placeholder="Role summary…" value={form.description} onChange={set("description")} />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <AppInput type="select" label="Level *" data={LEVELS} value={form.level} onChange={set("level")} error={err.level} />
          <AppInput type="select" label="Grade *" data={GRADES} value={form.grade} onChange={set("grade")} error={err.grade} />
          <AppInput type="select" label="Employment Category" data={CATEGORIES} value={form.employmentCategory} onChange={set("employmentCategory")} />
        </SimpleGrid>
        <AppInput type="select" label="Status" data={["Active", "Inactive"]} value={form.status} onChange={set("status")} w={200} />
        <Group justify="flex-end" gap="sm" mt="xs">
          <AppButton variant="default" onClick={onClose}>Cancel</AppButton>
          {!editData && <AppButton variant="light" loading={saving} onClick={() => submit(true)}>Save &amp; Continue</AppButton>}
          <AppButton loading={saving} onClick={() => submit(false)}>{editData ? "Save Changes" : "Save"}</AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
};

const Designations = () => {
  const navigate = useNavigate();
  const { show: showToast } = useToast();
  const can = usePermission();
  const canCreate = can("designations.create");
  const canEdit   = can("designations.edit");
  const canDelete = can("designations.delete");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy]     = useState("name");
  const [deptF, setDeptF]           = useState("All");
  const [levelF, setLevelF]         = useState("All");
  const [statusF, setStatusF]       = useState("All");
  const [page, setPage]             = useState(1);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  const { data: designations = [], isLoading, isError } = useDesignations();
  const { data: departments = [] } = useDepartments();

  const createMut = useCreateDesignation();
  const updateMut = useUpdateDesignation();
  const deleteMut = useDeleteDesignation();
  const importMut = useImportDesignations();

  const filtered = useMemo(() => designations.filter((d) => {
    const q = searchTerm.toLowerCase();
    const field = searchBy === "code" ? (d.code || "")
      : searchBy === "department" ? (d.department?.name || "")
      : searchBy === "grade" ? (d.grade || "") : d.name;
    const matchSearch = !q || field.toLowerCase().includes(q);
    return matchSearch
      && (deptF === "All"   || String(d.departmentId) === deptF)
      && (levelF === "All"  || String(d.level) === levelF)
      && (statusF === "All" || d.status === statusF);
  }), [designations, searchTerm, searchBy, deptF, levelF, statusF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchTerm, searchBy, deptF, levelF, statusF]);

  const totalEmployees = designations.reduce((s, d) => s + (d.employeeCount || 0), 0);
  const activeCount    = designations.filter((d) => d.status === "Active").length;
  const levelsUsed     = new Set(designations.map((d) => d.level)).size;

  const handleSave = async (form, keepOpen) => {
    try {
      if (editTarget) { await updateMut.mutateAsync({ id: editTarget.id, ...form }); showToast("Designation updated successfully", "success"); }
      else            { await createMut.mutateAsync(form); showToast("Designation created successfully", "success"); }
      if (keepOpen) setEditTarget(null);
      else { setModalOpen(false); setEditTarget(null); }
    } catch (err) { showToast(err?.response?.data?.message || "Failed to save designation", "error"); }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
    } catch (err) { showToast(err?.response?.data?.message || "Failed to delete designation", "error"); }
  };

  const handleDisable = async (d) => {
    try {
      const next = d.status === "Active" ? "Inactive" : "Active";
      await updateMut.mutateAsync({ id: d.id, status: next });
      showToast(`"${d.name}" ${next === "Inactive" ? "disabled" : "enabled"}`, next === "Inactive" ? "info" : "success");
    } catch { showToast("Failed to update status", "error"); }
  };

  const handleExport = async (format) => {
    try {
      const blob = await exportDesignations(format);
      const url = URL.createObjectURL(blob);
      if (format === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `designations.${format === "excel" ? "csv" : format}`; a.click(); URL.revokeObjectURL(url); }
      showToast(`Exported as ${format.toUpperCase()}`, "success");
    } catch { showToast("Export failed", "error"); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importMut.mutateAsync(file);
      showToast(`Imported ${res.created} designations${res.skipped ? `, ${res.skipped} skipped` : ""}`, "success");
    } catch (err) { showToast(err?.response?.data?.message || "Import failed", "error"); }
    finally { e.target.value = ""; }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-") : "—";
  const COLS = ["Designation", "Code", "Department", "Level", "Grade", "Employees", "Status", "Created", "Actions"];

  const rows = pageRows.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={COLS.length}>
        <AppEmptyState message="No designations available"
          action={canCreate ? <AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>Add Designation</AppButton> : null} />
      </Table.Td>
    </Table.Tr>
  ) : pageRows.map((d) => (
    <Table.Tr key={d.id} style={{ cursor: "pointer" }}>
      <Table.Td onClick={() => navigate(`/designations/${d.id}`)}>
        <Group gap="sm" wrap="nowrap">
          <Avatar size={32} radius="md" color="blue" variant="light"><IconBriefcase size={16} /></Avatar>
          <Text size="sm" fw={600}>{d.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{d.code || "—"}</Text></Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{d.department?.name || "—"}</Text></Table.Td>
      <Table.Td><Badge variant="light" radius="xl">{d.levelName || `Level ${d.level}`}</Badge></Table.Td>
      <Table.Td><Text size="sm" fw={600}>{d.grade || "—"}</Text></Table.Td>
      <Table.Td><Group gap={6} wrap="nowrap"><IconUsers size={14} /><Text size="sm" fw={500}>{d.employeeCount || 0}</Text></Group></Table.Td>
      <Table.Td><Badge color={STATUS_COLOR[d.status] || "gray"} variant="light" radius="xl">{d.status}</Badge></Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{fmtDate(d.createdAt)}</Text></Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon variant="light" color="gray" size="sm" radius="md" title="View" onClick={() => navigate(`/designations/${d.id}`)}><IconEye size={13} /></ActionIcon>
          {canEdit && <ActionIcon variant="light" color="blue" size="sm" radius="md" title="Edit" onClick={() => { setEditTarget(d); setModalOpen(true); }}><IconPencil size={13} /></ActionIcon>}
          {canEdit && <ActionIcon variant="light" color="orange" size="sm" radius="md" title={d.status === "Active" ? "Disable" : "Enable"} onClick={() => handleDisable(d)}><IconBan size={13} /></ActionIcon>}
          {canDelete && <ActionIcon variant="light" color="red" size="sm" radius="md" title="Delete" onClick={() => setDeleteTarget(d)}><IconTrash size={13} /></ActionIcon>}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <AppPageHeader
        title="Designations"
        sub="Manage job titles, hierarchy levels and grades"
        action={
          <Group gap="sm">
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleImport} />
            {canCreate && <AppButton variant="default" leftSection={<IconUpload size={16} />} loading={importMut.isPending} onClick={() => fileRef.current?.click()}>Import</AppButton>}
            <Menu position="bottom-end" withinPortal>
              <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("excel")}>Excel (CSV)</Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("csv")}>CSV</Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => handleExport("pdf")}>PDF</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            {canCreate && <AppButton leftSection={<IconPlus size={16} />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>Add Designation</AppButton>}
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<IconBriefcase size={22} />} label="Total Designations" value={designations.length} color="blue" />
        <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={totalEmployees} color="green" />
        <AppStatCard icon={<IconStack2 size={22} />} label="Active" value={activeCount} color="violet" />
        <AppStatCard icon={<IconChartBar size={22} />} label="Levels Used" value={levelsUsed} color="blue" />
      </SimpleGrid>

      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" w={150} size="sm" radius="md" value={searchBy} onChange={setSearchBy}
            data={[{ value: "name", label: "Name" }, { value: "code", label: "Code" }, { value: "department", label: "Department" }, { value: "grade", label: "Grade" }]} />
          <TextInput label="Search" placeholder={`Search by ${searchBy}…`} leftSection={<IconSearch size={16} />}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="sm" radius="md" style={{ flex: 1, minWidth: 180 }} />
          <Select label="Department" w={150} size="sm" radius="md" leftSection={<IconFilter size={14} />}
            data={["All", ...departments.map((d) => ({ value: String(d.id), label: d.name }))]} value={deptF} onChange={setDeptF} />
          <Select label="Level" w={130} size="sm" radius="md" data={["All", ...LEVELS.map((l) => ({ value: l.value, label: l.label }))]} value={levelF} onChange={setLevelF} />
          <Select label="Status" w={120} size="sm" radius="md" data={["All", "Active", "Inactive"]} value={statusF} onChange={setStatusF} />
        </Group>
      </AppSection>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}
      {isError && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">Failed to load designations. Make sure the backend is running and you are logged in.</Alert>}

      {!isLoading && !isError && (
        <AppSection noPadding title="All Designations" sub={`${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>{COLS.map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>{c}</Text></Table.Th>)}</Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
          {filtered.length > PAGE_SIZE && (
            <Group justify="flex-end" p="md"><Pagination total={totalPages} value={page} onChange={setPage} size="sm" radius="md" /></Group>
          )}
        </AppSection>
      )}

      <DesigModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave} editData={editTarget} saving={createMut.isPending || updateMut.isPending} departments={departments} />

      <AppModal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Designation"
        icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Are you sure you want to delete <Text span fw={700}>{deleteTarget?.name}</Text>? This can only be done if no employees are assigned.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" onClick={handleDelete} loading={deleteMut.isPending}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default Designations;
