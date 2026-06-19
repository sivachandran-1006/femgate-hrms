import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, TextInput, Select, Stack, Tabs,
  Menu, ActionIcon, Button, NumberInput, Box, Loader,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconDeviceLaptop, IconUserCheck, IconBox, IconTool, IconClockHour4, IconLicense, IconCash,
  IconSearch, IconFileExport, IconDownload, IconChartBar, IconList, IconLicense as IconLic,
  IconPlus, IconPencil, IconTrash, IconEye, IconUserPlus, IconArrowBackUp, IconAlertTriangle,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { fetchBranches } from "../../api/branchApi";
import { exportAssets }  from "../../api/assetApi";
import { useQuery } from "@tanstack/react-query";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import {
  useAssets, useAssetDashboard, useAssetAnalytics, useLicenses,
  useCreateAsset, useUpdateAsset, useDeleteAsset, useAssignAsset, useReturnAsset,
  useCreateLicense, useUpdateLicense, useDeleteLicense,
} from "../../queries/useAssets";

const CATEGORIES = ["Laptop", "Desktop", "Monitor", "Mobile Phone", "Printer", "Scanner", "Access Card", "Software License", "Network Device", "Other Assets"];
const STATUSES = ["Available", "Assigned", "InUse", "UnderRepair", "Maintenance", "Lost", "Damaged", "Disposed", "Retired"];
const STATUS_COLOR = { Available: "green", Assigned: "blue", InUse: "blue", UnderRepair: "orange", Maintenance: "orange", Lost: "red", Damaged: "red", Disposed: "gray", Retired: "gray" };
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#64748b"];

export default function AssetManagement({ darkMode }) {
  const { show: toast } = useToast();
  const doExport = async (fmt) => {
    try {
      const blob = await exportAssets(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `assets.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };

  return (
    <>
      <AppPageHeader title="Asset Management" sub="Manage company assets, allocation, lifecycle and licenses"
        action={
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><AppButton variant="default" leftSection={<IconFileExport size={16} />}>Export</AppButton></Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("excel")}>Excel (CSV)</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("csv")}>CSV</Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => doExport("pdf")}>PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />
      <Tabs defaultValue="dashboard" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="inventory" leftSection={<IconList size={15} />}>Inventory</Tabs.Tab>
          <Tabs.Tab value="licenses"  leftSection={<IconLic size={15} />}>Licenses</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="inventory"><InventoryTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="licenses"><LicensesTab toast={toast} /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function DashboardTab() {
  const { data: dash } = useAssetDashboard();
  const { data: an } = useAssetAnalytics();
  const c = dash?.cards || {};
  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} mb="lg">
        <AppStatCard icon={<IconDeviceLaptop size={20} />} label="Total Assets" value={c.totalAssets ?? 0} color="blue" />
        <AppStatCard icon={<IconUserCheck size={20} />} label="Assigned" value={c.assigned ?? 0} color="indigo" />
        <AppStatCard icon={<IconBox size={20} />} label="Available" value={c.available ?? 0} color="green" />
        <AppStatCard icon={<IconTool size={20} />} label="Under Repair" value={c.underRepair ?? 0} color="orange" />
        <AppStatCard icon={<IconClockHour4 size={20} />} label="Due Return" value={c.dueForReturn ?? 0} color="yellow" />
        <AppStatCard icon={<IconLicense size={20} />} label="Expired Lic." value={c.expiredLicenses ?? 0} color="red" />
        <AppStatCard icon={<IconCash size={20} />} label="Asset Value" value={inr(c.assetValue)} color="teal" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <AppSection title="Assets by Category">
          {an?.byCategory?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={an.byCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No assets available." py={60} />}
        </AppSection>
        <AppSection title="Asset Lifecycle Status">
          {an?.lifecycleStatus?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={an.lifecycleStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {an.lifecycleStatus.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AppSection title="Assets by Branch">
          {an?.byBranch?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={an.byBranch}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={50} />}
        </AppSection>
        <AppSection title="Assets by Department">
          {an?.byDepartment?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={an.byDepartment}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={50} />}
        </AppSection>
      </SimpleGrid>
    </>
  );
}

const EMPTY_ASSET = { name: "", assetId: "", category: "Laptop", brand: "", model: "", serialNumber: "", purchaseDate: "", warrantyExpiry: "", vendor: "", purchaseValue: "", location: "", branchId: "", departmentName: "", status: "Available" };

function InventoryTab({ toast }) {
  const navigate = useNavigate();
  const { data: assets = [], isLoading } = useAssets();
  const { data: employees = [] } = useFetchAllEmployees();
  const { data: branchesRes } = useQuery({ queryKey: ["branches"], queryFn: () => fetchBranches().then((r) => r.data?.data ?? r.data ?? []) });
  const branches = branchesRes || [];

  const createMut = useCreateAsset();
  const updateMut = useUpdateAsset();
  const deleteMut = useDeleteAsset();
  const assignMut = useAssignAsset();
  const returnMut = useReturnAsset();

  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [catF, setCatF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_ASSET);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignForm, setAssignForm] = useState({ employeeId: "", expectedReturnDate: "", remarks: "" });
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnForm, setReturnForm] = useState({ condition: "Good", remarks: "" });
  const [delTarget, setDelTarget] = useState(null);

  const filtered = useMemo(() => assets.filter((a) => {
    const q = search.toLowerCase();
    const field = searchBy === "id" ? (a.assetId || "") : searchBy === "serial" ? (a.serialNumber || "") : searchBy === "employee" ? (a.assignedTo?.name || "") : a.name;
    return (!q || field.toLowerCase().includes(q)) && (catF === "All" || a.category === catF) && (statusF === "All" || a.status === statusF);
  }), [assets, search, searchBy, catF, statusF]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_ASSET); setOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({ ...EMPTY_ASSET, ...a, branchId: a.branchId ? String(a.branchId) : "", purchaseValue: a.purchaseValue ?? "",
      purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : "", warrantyExpiry: a.warrantyExpiry ? a.warrantyExpiry.slice(0, 10) : "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast("Asset Name is required", "error"); return; }
    try {
      if (editing) { await updateMut.mutateAsync({ id: editing.id, ...form }); toast("Asset updated", "success"); }
      else { await createMut.mutateAsync(form); toast("Asset created", "success"); }
      setOpen(false);
    } catch (e) { toast(e?.response?.data?.message || "Failed to save asset", "error"); }
  };
  const doAssign = async () => {
    if (!assignForm.employeeId) { toast("Select an employee", "error"); return; }
    try { await assignMut.mutateAsync({ id: assignTarget.id, ...assignForm }); toast("Asset assigned", "success"); setAssignTarget(null); setAssignForm({ employeeId: "", expectedReturnDate: "", remarks: "" }); }
    catch (e) { toast(e?.response?.data?.message || "Assign failed", "error"); }
  };
  const doReturn = async () => {
    try { await returnMut.mutateAsync({ id: returnTarget.id, ...returnForm }); toast("Asset returned", "success"); setReturnTarget(null); }
    catch (e) { toast(e?.response?.data?.message || "Return failed", "error"); }
  };
  const doDelete = async () => {
    try { await deleteMut.mutateAsync(delTarget.id); toast("Asset deleted", "success"); setDelTarget(null); }
    catch (e) { toast(e?.response?.data?.message || "Delete failed", "error"); }
  };

  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;
  const COLS = ["Asset ID", "Name", "Category", "Brand", "Serial", "Assigned To", "Status", "Actions"];

  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" w={140} size="sm" value={searchBy} onChange={setSearchBy} data={[{ value: "name", label: "Name" }, { value: "id", label: "Asset ID" }, { value: "serial", label: "Serial" }, { value: "employee", label: "Employee" }]} />
          <TextInput label="Search" placeholder="Search…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 160 }} />
          <Select label="Category" w={150} size="sm" data={["All", ...CATEGORIES]} value={catF} onChange={setCatF} />
          <Select label="Status" w={150} size="sm" data={["All", ...STATUSES]} value={statusF} onChange={setStatusF} />
          <AppButton leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Asset</AppButton>
        </Group>
      </AppSection>

      <AppSection noPadding title="Asset Inventory" sub={`${filtered.length} assets`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{COLS.map((col) => <Table.Th key={col}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{col}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? <Table.Tr><Table.Td colSpan={COLS.length}><AppEmptyState message="No assets available." action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Asset</AppButton>} /></Table.Td></Table.Tr>
                : filtered.map((a) => (
                  <Table.Tr key={a.id} style={{ cursor: "pointer" }}>
                    <Table.Td onClick={() => navigate(`/assets/${a.id}`)}><Text size="sm" fw={600}>{a.assetId}</Text></Table.Td>
                    <Table.Td><Text size="sm">{a.name}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{a.category}</Badge></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{a.brand || "—"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{a.serialNumber || "—"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{a.assignedTo?.name || "—"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={STATUS_COLOR[a.status] || "gray"} radius="sm">{a.status}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" color="gray" size="sm" title="View" onClick={() => navigate(`/assets/${a.id}`)}><IconEye size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="blue" size="sm" title="Edit" onClick={() => openEdit(a)}><IconPencil size={13} /></ActionIcon>
                        {["Available"].includes(a.status)
                          ? <ActionIcon variant="light" color="indigo" size="sm" title="Assign" onClick={() => { setAssignTarget(a); }}><IconUserPlus size={13} /></ActionIcon>
                          : ["Assigned", "InUse"].includes(a.status)
                            ? <ActionIcon variant="light" color="orange" size="sm" title="Return" onClick={() => { setReturnTarget(a); setReturnForm({ condition: "Good", remarks: "" }); }}><IconArrowBackUp size={13} /></ActionIcon>
                            : null}
                        <ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => setDelTarget(a)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      {/* Add/Edit Asset */}
      <AppModal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit Asset" : "Add Asset"} icon={<IconDeviceLaptop size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput label="Asset Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <AppInput label="Asset ID" placeholder="auto if blank" value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput type="select" label="Category *" data={CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <AppInput label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <AppInput label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput label="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            <AppInput label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput type="date" label="Purchase Date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            <AppInput type="date" label="Warranty Expiry" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} />
            <NumberInput label="Purchase Cost (₹)" min={0} value={form.purchaseValue} onChange={(v) => setForm({ ...form, purchaseValue: v })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <AppInput type="select" label="Branch" clearable data={branches.map((b) => ({ value: String(b.id), label: b.name }))} value={form.branchId} onChange={(v) => setForm({ ...form, branchId: v })} />
            <AppInput type="select" label="Status" data={STATUSES} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
          </SimpleGrid>
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending || updateMut.isPending} onClick={save}>{editing ? "Save Changes" : "Save"}</AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* Assign */}
      <AppModal opened={!!assignTarget} onClose={() => setAssignTarget(null)} title={`Assign — ${assignTarget?.name || ""}`} icon={<IconUserPlus size={16} color="#6366f1" />} iconColor="#6366f1">
        <Stack gap="md">
          <AppInput type="select" label="Employee *" searchable placeholder="Select employee" data={employees.map((e) => ({ value: String(e.id), label: `${e.name}${e.designation ? ` — ${e.designation}` : ""}` }))} value={assignForm.employeeId} onChange={(v) => setAssignForm({ ...assignForm, employeeId: v })} />
          <AppInput type="date" label="Expected Return Date" value={assignForm.expectedReturnDate} onChange={(e) => setAssignForm({ ...assignForm, expectedReturnDate: e.target.value })} />
          <AppInput type="textarea" label="Remarks" value={assignForm.remarks} onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setAssignTarget(null)}>Cancel</AppButton>
            <AppButton color="indigo" loading={assignMut.isPending} onClick={doAssign}>Assign</AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* Return */}
      <AppModal opened={!!returnTarget} onClose={() => setReturnTarget(null)} title={`Return — ${returnTarget?.name || ""}`} icon={<IconArrowBackUp size={16} color="#f59e0b" />} iconColor="#f59e0b">
        <Stack gap="md">
          <AppInput type="select" label="Asset Condition" data={["Excellent", "Good", "Fair", "Damaged"]} value={returnForm.condition} onChange={(v) => setReturnForm({ ...returnForm, condition: v })} />
          <AppInput type="textarea" label="Remarks" value={returnForm.remarks} onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setReturnTarget(null)}>Cancel</AppButton>
            <AppButton color="orange" loading={returnMut.isPending} onClick={doReturn}>Accept Return</AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* Delete */}
      <AppModal opened={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Asset" icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Delete <Text span fw={700}>{delTarget?.name}</Text>? Assigned assets must be returned first.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDelTarget(null)}>Cancel</Button>
            <Button color="red" loading={deleteMut.isPending} onClick={doDelete}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}

const EMPTY_LIC = { name: "", vendor: "", licenseKey: "", purchaseDate: "", expiryDate: "", assignedUser: "", seats: 1, status: "Active" };
const LIC_COLOR = { Active: "green", Expired: "red", ExpiringSoon: "orange", Suspended: "gray" };

function LicensesTab({ toast }) {
  const { data: licenses = [] } = useLicenses();
  const createMut = useCreateLicense();
  const updateMut = useUpdateLicense();
  const deleteMut = useDeleteLicense();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_LIC);
  const [delTarget, setDelTarget] = useState(null);

  const openAdd = () => { setEditing(null); setForm(EMPTY_LIC); setOpen(true); };
  const openEdit = (l) => { setEditing(l); setForm({ ...EMPTY_LIC, ...l, purchaseDate: l.purchaseDate ? l.purchaseDate.slice(0, 10) : "", expiryDate: l.expiryDate ? l.expiryDate.slice(0, 10) : "" }); setOpen(true); };
  const save = async () => {
    if (!form.name.trim()) { toast("License Name is required", "error"); return; }
    try { if (editing) { await updateMut.mutateAsync({ id: editing.id, ...form }); toast("License updated", "success"); } else { await createMut.mutateAsync(form); toast("License added", "success"); } setOpen(false); }
    catch (e) { toast(e?.response?.data?.message || "Failed to save", "error"); }
  };
  const del = async () => { try { await deleteMut.mutateAsync(delTarget.id); toast("License deleted", "success"); setDelTarget(null); } catch { toast("Failed", "error"); } };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={openAdd}>Add License</AppButton></Group>
      <AppSection noPadding title="Software Licenses" sub={`${licenses.length} licenses`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["License", "Vendor", "Assigned User", "Seats", "Expiry", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {licenses.length === 0 ? <Table.Tr><Table.Td colSpan={7}><AppEmptyState message="No licenses configured" action={<AppButton mt="sm" leftSection={<IconPlus size={16} />} onClick={openAdd}>Add License</AppButton>} /></Table.Td></Table.Tr>
                : licenses.map((l) => (
                  <Table.Tr key={l.id}>
                    <Table.Td><Text size="sm" fw={600}>{l.name}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{l.vendor || "—"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{l.assignedUser || "—"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{l.seats}</Badge></Table.Td>
                    <Table.Td>{fmtDate(l.expiryDate)}</Table.Td>
                    <Table.Td><Badge variant="light" color={LIC_COLOR[l.status] || "gray"} radius="sm">{l.status === "ExpiringSoon" ? "Expiring Soon" : l.status}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" color="blue" size="sm" title="Edit" onClick={() => openEdit(l)}><IconPencil size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" title="Delete" onClick={() => setDelTarget(l)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>

      <AppModal opened={open} onClose={() => setOpen(false)} title={editing ? "Edit License" : "Add License"} icon={<IconLic size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput label="License Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <AppInput label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </SimpleGrid>
          <AppInput label="License Key" value={form.licenseKey} onChange={(e) => setForm({ ...form, licenseKey: e.target.value })} />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AppInput type="date" label="Purchase Date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            <AppInput type="date" label="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            <NumberInput label="Seats" min={1} value={form.seats} onChange={(v) => setForm({ ...form, seats: v })} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <AppInput label="Assigned User" value={form.assignedUser} onChange={(e) => setForm({ ...form, assignedUser: e.target.value })} />
            <AppInput type="select" label="Status" data={["Active", "Suspended"]} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
          </SimpleGrid>
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending || updateMut.isPending} onClick={save}>{editing ? "Save Changes" : "Save"}</AppButton>
          </Group>
        </Stack>
      </AppModal>

      <AppModal opened={!!delTarget} onClose={() => setDelTarget(null)} title="Delete License" icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Delete <Text span fw={700}>{delTarget?.name}</Text>?</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDelTarget(null)}>Cancel</Button>
            <Button color="red" loading={deleteMut.isPending} onClick={del}>Yes, Delete</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
