import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ActionIcon, Avatar, ScrollArea, Table,
  TextInput, Select, Stack, Loader, Alert, Box, Button, Menu, Pagination,
} from "@mantine/core";
import {
  IconBuilding, IconUsers, IconMapPin, IconBuildingFactory,
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
import { exportBranches } from "../../api/branchApi";
import {
  useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch,
  useBranchHeads, useImportBranches,
} from "../../queries/useBranches";

const PAGE_SIZE = 8;
const BRANCH_TYPES = ["Head Office", "Regional Office", "Sales Office", "Remote Office"];
const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "America/New_York", "Europe/London", "Asia/Singapore"];
const STATUS_COLOR = { Active: "green", Inactive: "gray" };

const EMPTY_FORM = {
  name: "", code: "", type: "Head Office", headId: "",
  country: "", state: "", city: "", address1: "", address2: "",
  postalCode: "", email: "", phone: "", timezone: "Asia/Kolkata", status: "Active",
};

const BranchModal = ({ open, onClose, onSave, editData, saving, heads }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr]   = useState({});

  useEffect(() => {
    if (open) {
      setErr({});
      setForm(editData ? {
        name: editData.name || "", code: editData.code || "", type: editData.type || "Head Office",
        headId: editData.headName ? String(heads.find((h) => h.name === editData.headName)?.id || "") : "",
        country: editData.country || "", state: editData.state || "", city: editData.city || "",
        address1: editData.address1 || "", address2: editData.address2 || "",
        postalCode: editData.postalCode || "", email: editData.email || "", phone: editData.phone || "",
        timezone: editData.timezone || "Asia/Kolkata", status: editData.status || "Active",
      } : EMPTY_FORM);
    }
  }, [open, editData, heads]);

  if (!open) return null;
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v?.currentTarget ? v.currentTarget.value : v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name = "Branch Name is required";
    if (!form.code.trim())     e.code = "Branch Code is required";
    if (!form.country.trim())  e.country = "Country is required";
    if (!form.state.trim())    e.state = "State is required";
    if (!form.city.trim())     e.city = "City is required";
    if (!form.address1.trim()) e.address1 = "Address Line 1 is required";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = (keepOpen) => {
    if (!validate()) return;
    const head = heads.find((h) => String(h.id) === String(form.headId));
    const { headId, ...rest } = form;
    onSave({ ...rest, headName: head?.name || null, headEmail: head?.email || null }, keepOpen);
  };

  return (
    <AppModal opened={open} onClose={onClose} size="lg"
      title={editData ? "Edit Branch" : "Add Branch"}
      icon={<IconBuilding size={16} color="#3b82f6" />} iconColor="#3b82f6">
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput label="Branch Name *" placeholder="e.g. Chennai HQ" value={form.name} onChange={set("name")} error={err.name} />
          <AppInput label="Branch Code *" placeholder="e.g. CHN" value={form.code} onChange={set("code")} error={err.code} />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput type="select" label="Branch Type" data={BRANCH_TYPES} value={form.type} onChange={set("type")} />
          <AppInput type="select" label="Branch Head" placeholder="Select employee" searchable clearable
            data={heads.map((h) => ({ value: String(h.id), label: `${h.name}${h.designation ? ` — ${h.designation}` : ""}` }))}
            value={form.headId} onChange={set("headId")} />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <AppInput label="Country *" value={form.country} onChange={set("country")} error={err.country} />
          <AppInput label="State *" value={form.state} onChange={set("state")} error={err.state} />
          <AppInput label="City *" value={form.city} onChange={set("city")} error={err.city} />
        </SimpleGrid>
        <AppInput label="Address Line 1 *" value={form.address1} onChange={set("address1")} error={err.address1} />
        <AppInput label="Address Line 2" value={form.address2} onChange={set("address2")} />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <AppInput label="Postal Code" value={form.postalCode} onChange={set("postalCode")} />
          <AppInput label="Email" value={form.email} onChange={set("email")} />
          <AppInput label="Phone" value={form.phone} onChange={set("phone")} />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput type="select" label="Timezone" searchable data={TIMEZONES} value={form.timezone} onChange={set("timezone")} />
          <AppInput type="select" label="Status" data={["Active", "Inactive"]} value={form.status} onChange={set("status")} />
        </SimpleGrid>
        <Group justify="flex-end" gap="sm" mt="xs">
          <AppButton variant="default" onClick={onClose}>Cancel</AppButton>
          {!editData && <AppButton variant="light" loading={saving} onClick={() => submit(true)}>Save &amp; Continue</AppButton>}
          <AppButton loading={saving} onClick={() => submit(false)}>{editData ? "Save Changes" : "Save"}</AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
};

const Branches = () => {
  const navigate = useNavigate();
  const { show: showToast } = useToast();
  const can = usePermission();
  const canCreate = can("branches.create");
  const canEdit   = can("branches.edit");
  const canDelete = can("branches.delete");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy]     = useState("name");
  const [statusF, setStatusF]       = useState("All");
  const [countryF, setCountryF]     = useState("All");
  const [stateF, setStateF]         = useState("All");
  const [cityF, setCityF]           = useState("All");
  const [page, setPage]             = useState(1);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  const { data: branches = [], isLoading, isError } = useBranches();
  const { data: heads = [] } = useBranchHeads();

  const createMut = useCreateBranch();
  const updateMut = useUpdateBranch();
  const deleteMut = useDeleteBranch();
  const importMut = useImportBranches();

  const uniq = (k) => ["All", ...new Set(branches.map((b) => b[k]).filter(Boolean))];
  const countryOpts = useMemo(() => uniq("country"), [branches]);
  const stateOpts   = useMemo(() => uniq("state"), [branches]);
  const cityOpts    = useMemo(() => uniq("city"), [branches]);

  const filtered = useMemo(() => branches.filter((b) => {
    const q = searchTerm.toLowerCase();
    const field = searchBy === "code" ? (b.code || "")
      : searchBy === "location" ? (b.location || "")
      : searchBy === "manager" ? (b.headName || "") : b.name;
    const matchSearch = !q || field.toLowerCase().includes(q);
    return matchSearch
      && (statusF === "All"  || b.status === statusF)
      && (countryF === "All" || b.country === countryF)
      && (stateF === "All"   || b.state === stateF)
      && (cityF === "All"    || b.city === cityF);
  }), [branches, searchTerm, searchBy, statusF, countryF, stateF, cityF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchTerm, searchBy, statusF, countryF, stateF, cityF]);

  const totalEmployees = branches.reduce((s, b) => s + (b.employeeCount || 0), 0);
  const activeCount    = branches.filter((b) => b.status === "Active").length;
  const countriesCount = new Set(branches.map((b) => b.country).filter(Boolean)).size;

  const handleSave = async (form, keepOpen) => {
    try {
      if (editTarget) { await updateMut.mutateAsync({ id: editTarget.id, ...form }); showToast("Branch updated successfully", "success"); }
      else            { await createMut.mutateAsync(form); showToast("Branch created successfully", "success"); }
      if (keepOpen) setEditTarget(null);
      else { setModalOpen(false); setEditTarget(null); }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save branch", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete branch", "error");
    }
  };

  const handleDisable = async (b) => {
    try {
      const next = b.status === "Active" ? "Inactive" : "Active";
      await updateMut.mutateAsync({ id: b.id, status: next });
      showToast(`"${b.name}" ${next === "Inactive" ? "disabled" : "enabled"}`, next === "Inactive" ? "info" : "success");
    } catch { showToast("Failed to update status", "error"); }
  };

  const handleExport = async (format) => {
    try {
      const blob = await exportBranches(format);
      const url = URL.createObjectURL(blob);
      if (format === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `branches.${format === "excel" ? "csv" : format}`; a.click(); URL.revokeObjectURL(url); }
      showToast(`Exported as ${format.toUpperCase()}`, "success");
    } catch { showToast("Export failed", "error"); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importMut.mutateAsync(file);
      showToast(`Imported ${res.created} branches${res.skipped ? `, ${res.skipped} skipped` : ""}`, "success");
    } catch (err) { showToast(err?.response?.data?.message || "Import failed", "error"); }
    finally { e.target.value = ""; }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-") : "—";
  const COLS = ["Branch", "Code", "Location", "Head", "Employees", "Status", "Created", "Actions"];

  const rows = pageRows.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={COLS.length}>
        <AppEmptyState message="No branches available"
          action={canCreate ? <AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>Add Branch</AppButton> : null} />
      </Table.Td>
    </Table.Tr>
  ) : pageRows.map((b) => (
    <Table.Tr key={b.id} style={{ cursor: "pointer" }}>
      <Table.Td onClick={() => navigate(`/branches/${b.id}`)}>
        <Group gap="sm" wrap="nowrap">
          <Avatar size={32} radius="md" variant="gradient" gradient={{ from: "blue", to: "indigo" }}><IconBuilding size={16} /></Avatar>
          <div><Text size="sm" fw={600}>{b.name}</Text>{b.type && <Text size="xs" c="dimmed">{b.type}</Text>}</div>
        </Group>
      </Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{b.code || "—"}</Text></Table.Td>
      <Table.Td>
        <Group gap={4} wrap="nowrap"><IconMapPin size={13} /><Text size="sm" c="dimmed">{b.location || [b.city, b.state].filter(Boolean).join(", ") || "—"}</Text></Group>
      </Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{b.headName || "—"}</Text></Table.Td>
      <Table.Td><Group gap={6} wrap="nowrap"><IconUsers size={14} /><Text size="sm" fw={500}>{b.employeeCount || 0}</Text></Group></Table.Td>
      <Table.Td><Badge color={STATUS_COLOR[b.status] || "gray"} variant="light" radius="xl">{b.status}</Badge></Table.Td>
      <Table.Td><Text size="sm" c="dimmed">{fmtDate(b.createdAt)}</Text></Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon variant="light" color="gray" size="sm" radius="md" title="View" onClick={() => navigate(`/branches/${b.id}`)}><IconEye size={13} /></ActionIcon>
          {canEdit && <ActionIcon variant="light" color="blue" size="sm" radius="md" title="Edit" onClick={() => { setEditTarget(b); setModalOpen(true); }}><IconPencil size={13} /></ActionIcon>}
          {canEdit && <ActionIcon variant="light" color="orange" size="sm" radius="md" title={b.status === "Active" ? "Disable" : "Enable"} onClick={() => handleDisable(b)}><IconBan size={13} /></ActionIcon>}
          {canDelete && <ActionIcon variant="light" color="red" size="sm" radius="md" title="Delete" onClick={() => setDeleteTarget(b)}><IconTrash size={13} /></ActionIcon>}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <AppPageHeader
        title="Branches"
        sub="Manage office locations, branches and business units"
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
            {canCreate && <AppButton leftSection={<IconPlus size={16} />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>Add Branch</AppButton>}
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<IconBuilding size={22} />} label="Total Branches" value={branches.length} color="blue" />
        <AppStatCard icon={<IconUsers size={22} />} label="Total Employees" value={totalEmployees} color="green" />
        <AppStatCard icon={<IconBuildingFactory size={22} />} label="Active Branches" value={activeCount} color="violet" />
        <AppStatCard icon={<IconMapPin size={22} />} label="Countries" value={countriesCount} color="blue" />
      </SimpleGrid>

      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" w={140} size="sm" radius="md" value={searchBy} onChange={setSearchBy}
            data={[{ value: "name", label: "Name" }, { value: "code", label: "Code" }, { value: "location", label: "Location" }, { value: "manager", label: "Manager" }]} />
          <TextInput label="Search" placeholder={`Search by ${searchBy}…`} leftSection={<IconSearch size={16} />}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="sm" radius="md" style={{ flex: 1, minWidth: 180 }} />
          <Select label="Status" w={120} size="sm" radius="md" leftSection={<IconFilter size={14} />} data={["All", "Active", "Inactive"]} value={statusF} onChange={setStatusF} />
          <Select label="Country" w={130} size="sm" radius="md" data={countryOpts} value={countryF} onChange={setCountryF} />
          <Select label="State" w={130} size="sm" radius="md" data={stateOpts} value={stateF} onChange={setStateF} />
          <Select label="City" w={130} size="sm" radius="md" data={cityOpts} value={cityF} onChange={setCityF} />
        </Group>
      </AppSection>

      {isLoading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}
      {isError && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">Failed to load branches. Make sure the backend is running and you are logged in.</Alert>}

      {!isLoading && !isError && (
        <AppSection noPadding title="All Branches" sub={`${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}>
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

      <BranchModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave} editData={editTarget} saving={createMut.isPending || updateMut.isPending} heads={heads} />

      <AppModal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Branch"
        icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Are you sure you want to delete <Text span fw={700}>{deleteTarget?.name}</Text>? This can only be done if no employees or departments are assigned.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="red" onClick={handleDelete} loading={deleteMut.isPending}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default Branches;
