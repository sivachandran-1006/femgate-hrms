import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group, SimpleGrid, Text, Badge, ScrollArea, Table, TextInput, Select, Stack, Tabs,
  Menu, ActionIcon, Button, Box, Loader,
} from "@mantine/core";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  IconFiles, IconCircleCheck, IconClock, IconCalendarX, IconCircleX, IconUser, IconBuilding,
  IconSearch, IconFileExport, IconDownload, IconChartBar, IconList, IconShieldCheck, IconSend,
  IconUpload, IconEye, IconPencil, IconTrash, IconAlertTriangle, IconCheck, IconX,
} from "@tabler/icons-react";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppButton }     from "../../components/ui/AppButton";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { exportDocuments } from "../../api/documentApi";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import {
  useDocuments, useDocDashboard, useDocAnalytics, useDocRequests,
  useUploadDocument, useArchiveDocument, useVerifyDocument, useCreateDocRequest, useFulfilDocRequest,
} from "../../queries/useDocuments";

const CATEGORIES = ["Employee Documents", "Company Documents", "Compliance Documents", "Payroll Documents", "Recruitment Documents", "Asset Documents", "Training Documents"];
const DOC_TYPES = ["Resume", "PAN Card", "Aadhaar Card", "Passport", "Driving License", "Educational Certificate", "Experience Certificate", "Offer Letter", "Relieving Letter", "Bank Proof", "HR Policy", "Employee Handbook", "Compliance Document", "Audit Report", "Legal Agreement", "Other"];
const STATUS = ["Pending", "Verified", "Rejected", "Expired", "Archived"];
const STATUS_COLOR = { Pending: "yellow", Verified: "green", Rejected: "red", Expired: "orange", Archived: "gray" };
const PIE = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function DocumentManagement({ darkMode }) {
  const { show: toast } = useToast();
  const doExport = async (fmt) => {
    try {
      const blob = await exportDocuments(fmt);
      const url = URL.createObjectURL(blob);
      if (fmt === "pdf") window.open(url, "_blank");
      else { const a = document.createElement("a"); a.href = url; a.download = `documents.${fmt === "excel" ? "csv" : fmt}`; a.click(); URL.revokeObjectURL(url); }
      toast(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch { toast("Export failed", "error"); }
  };

  return (
    <>
      <AppPageHeader title="Document Management" sub="Centralized storage, verification and tracking of documents"
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
          <Tabs.Tab value="dashboard"    leftSection={<IconChartBar size={15} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="repository"   leftSection={<IconList size={15} />}>Repository</Tabs.Tab>
          <Tabs.Tab value="verification" leftSection={<IconShieldCheck size={15} />}>Verification Queue</Tabs.Tab>
          <Tabs.Tab value="requests"     leftSection={<IconSend size={15} />}>Requests</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="repository"><RepositoryTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="verification"><VerificationTab toast={toast} /></Tabs.Panel>
        <Tabs.Panel value="requests"><RequestsTab toast={toast} /></Tabs.Panel>
      </Tabs>
    </>
  );
}

function DashboardTab() {
  const { data: dash } = useDocDashboard();
  const { data: an } = useDocAnalytics();
  const c = dash?.cards || {};
  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} mb="lg">
        <AppStatCard icon={<IconFiles size={20} />} label="Total" value={c.total ?? 0} color="blue" />
        <AppStatCard icon={<IconCircleCheck size={20} />} label="Verified" value={c.verified ?? 0} color="green" />
        <AppStatCard icon={<IconClock size={20} />} label="Pending" value={c.pending ?? 0} color="yellow" />
        <AppStatCard icon={<IconCalendarX size={20} />} label="Expired" value={c.expired ?? 0} color="orange" />
        <AppStatCard icon={<IconCircleX size={20} />} label="Rejected" value={c.rejected ?? 0} color="red" />
        <AppStatCard icon={<IconUser size={20} />} label="Employee" value={c.employeeDocs ?? 0} color="indigo" />
        <AppStatCard icon={<IconBuilding size={20} />} label="Company" value={c.companyDocs ?? 0} color="teal" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <AppSection title="Documents by Type">
          {an?.byType?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={an.byType}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No documents available." py={60} />}
        </AppSection>
        <AppSection title="Verification Status">
          {an?.verificationStatus?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={an.verificationStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{an.verificationStatus.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          ) : <AppEmptyState message="No data" py={60} />}
        </AppSection>
      </SimpleGrid>
      <AppSection title="Department Document Distribution">
        {an?.departmentDistribution?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={an.departmentDistribution}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        ) : <AppEmptyState message="No data" py={50} />}
      </AppSection>
    </>
  );
}

const EMPTY_DOC = { name: "", docType: "Resume", category: "Employee Documents", employeeId: "", description: "", expiryDate: "", tags: "", fileUrl: "", fileSize: "", mimeType: "application/pdf" };

function UploadModal({ open, onClose, toast }) {
  const { data: employees = [] } = useFetchAllEmployees();
  const uploadMut = useUploadDocument();
  const [form, setForm] = useState(EMPTY_DOC);

  const save = async () => {
    if (!form.name.trim()) { toast("Document Name is required", "error"); return; }
    // Simulated attachment — in a real app this is the uploaded file URL
    const fileUrl = form.fileUrl || `https://files.hrms.local/${Date.now()}-${form.name.replace(/\s+/g, "_")}.pdf`;
    try {
      await uploadMut.mutateAsync({ ...form, fileUrl, assignToSelf: !form.employeeId, employeeId: form.employeeId || undefined });
      toast("Document uploaded", "success"); setForm(EMPTY_DOC); onClose();
    } catch (e) { toast(e?.response?.data?.message || "Upload failed", "error"); }
  };

  return (
    <AppModal opened={open} onClose={onClose} title="Upload Document" icon={<IconUpload size={16} color="#3b82f6" />} iconColor="#3b82f6" size="lg">
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput label="Document Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <AppInput type="select" label="Document Type *" searchable data={DOC_TYPES} value={form.docType} onChange={(v) => setForm({ ...form, docType: v })} />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput type="select" label="Category" data={CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <AppInput type="select" label="Employee (optional)" searchable clearable placeholder="Company document if blank"
            data={employees.map((e) => ({ value: String(e.id), label: e.name }))} value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v || "" })} />
        </SimpleGrid>
        <AppInput type="textarea" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <AppInput type="date" label="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          <AppInput label="Tags" placeholder="comma,separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </SimpleGrid>
        <AppInput label="Attachment URL *" placeholder="https://… (PDF/DOCX/JPG/PNG)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
        <Group justify="flex-end" gap="sm">
          <AppButton variant="default" onClick={onClose}>Cancel</AppButton>
          <AppButton loading={uploadMut.isPending} onClick={save}>Upload</AppButton>
        </Group>
      </Stack>
    </AppModal>
  );
}

function RepositoryTab({ toast }) {
  const navigate = useNavigate();
  const { data: docs = [], isLoading } = useDocuments();
  const archiveMut = useArchiveDocument();
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [catF, setCatF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const filtered = useMemo(() => docs.filter((d) => {
    const q = search.toLowerCase();
    const field = searchBy === "type" ? (d.docType || "") : searchBy === "employee" ? (d.employee?.name || "") : d.name;
    return (!q || field.toLowerCase().includes(q)) && (catF === "All" || d.category === catF) && (statusF === "All" || d.verificationStatus === statusF);
  }), [docs, search, searchBy, catF, statusF]);

  const del = async () => { try { await archiveMut.mutateAsync(delTarget.id); toast("Document archived", "success"); setDelTarget(null); } catch { toast("Failed", "error"); } };
  if (isLoading) return <Box ta="center" py="xl"><Loader size="sm" /></Box>;
  const COLS = ["Document", "Type", "Owner", "Department", "Uploaded By", "Upload Date", "Expiry", "Status", "Actions"];

  return (
    <>
      <AppSection mb="md" p="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <Select label="Search by" w={140} size="sm" value={searchBy} onChange={setSearchBy} data={[{ value: "name", label: "Name" }, { value: "type", label: "Type" }, { value: "employee", label: "Employee" }]} />
          <TextInput label="Search" placeholder="Search…" leftSection={<IconSearch size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" style={{ flex: 1, minWidth: 160 }} />
          <Select label="Category" w={170} size="sm" data={["All", ...CATEGORIES]} value={catF} onChange={setCatF} />
          <Select label="Status" w={140} size="sm" data={["All", ...STATUS]} value={statusF} onChange={setStatusF} />
          <AppButton leftSection={<IconUpload size={16} />} onClick={() => setUploadOpen(true)}>Upload</AppButton>
        </Group>
      </AppSection>
      <AppSection noPadding title="Document Repository" sub={`${filtered.length} documents`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{COLS.map((col) => <Table.Th key={col}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{col}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? <Table.Tr><Table.Td colSpan={COLS.length}><AppEmptyState message="No documents available." action={<AppButton mt="sm" leftSection={<IconUpload size={16} />} onClick={() => setUploadOpen(true)}>Upload</AppButton>} /></Table.Td></Table.Tr>
                : filtered.map((d) => (
                  <Table.Tr key={d.id} style={{ cursor: "pointer" }}>
                    <Table.Td onClick={() => navigate(`/documents/${d.id}`)}><Text size="sm" fw={600}>{d.name}</Text></Table.Td>
                    <Table.Td><Badge variant="light" radius="sm">{d.docType || d.category}</Badge></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{d.employee?.name || "Company"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{d.employee?.department || d.departmentName || "—"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{d.uploadedByName || "—"}</Text></Table.Td>
                    <Table.Td>{fmtDate(d.createdAt)}</Table.Td>
                    <Table.Td>{fmtDate(d.expiryDate)}</Table.Td>
                    <Table.Td><Badge variant="light" color={STATUS_COLOR[d.verificationStatus] || "gray"} radius="sm">{d.verificationStatus}</Badge></Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="light" color="gray" size="sm" title="View" onClick={() => navigate(`/documents/${d.id}`)}><IconEye size={13} /></ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" title="Archive" onClick={() => setDelTarget(d)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} toast={toast} />
      <AppModal opened={!!delTarget} onClose={() => setDelTarget(null)} title="Archive Document" icon={<IconAlertTriangle size={16} color="#ef4444" />} iconColor="#ef4444">
        <Stack gap="md">
          <Text size="sm">Archive <Text span fw={700}>{delTarget?.name}</Text>?</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDelTarget(null)}>Cancel</Button>
            <Button color="red" loading={archiveMut.isPending} onClick={del}>Archive</Button>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}

function VerificationTab({ toast }) {
  const { data: docs = [] } = useDocuments({ status: "Pending" });
  const verifyMut = useVerifyDocument();
  const pending = docs.filter((d) => d.verificationStatus === "Pending");
  const act = async (id, status) => {
    try { await verifyMut.mutateAsync({ id, status }); toast(`Document ${status === "Verified" ? "approved" : status === "Rejected" ? "rejected" : "sent for correction"}`, status === "Verified" ? "success" : "info"); }
    catch { toast("Action failed", "error"); }
  };
  return (
    <AppSection noPadding title="Verification Queue" sub={`${pending.length} pending`}>
      <ScrollArea>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead><Table.Tr>{["Document", "Type", "Owner", "Uploaded", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
          <Table.Tbody>
            {pending.length === 0 ? <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="Nothing pending verification" /></Table.Td></Table.Tr>
              : pending.map((d) => (
                <Table.Tr key={d.id}>
                  <Table.Td><Text size="sm" fw={600}>{d.name}</Text></Table.Td>
                  <Table.Td><Badge variant="light" radius="sm">{d.docType || d.category}</Badge></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{d.employee?.name || "Company"}</Text></Table.Td>
                  <Table.Td>{fmtDate(d.createdAt)}</Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon size="sm" variant="light" color="green" title="Approve" onClick={() => act(d.id, "Verified")}><IconCheck size={13} /></ActionIcon>
                      <ActionIcon size="sm" variant="light" color="red" title="Reject" onClick={() => act(d.id, "Rejected")}><IconX size={13} /></ActionIcon>
                      <ActionIcon size="sm" variant="light" color="blue" title="Request correction" onClick={() => act(d.id, "Correction")}><IconAlertTriangle size={13} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </AppSection>
  );
}

function RequestsTab({ toast }) {
  const { data: requests = [] } = useDocRequests();
  const { data: employees = [] } = useFetchAllEmployees();
  const createMut = useCreateDocRequest();
  const fulfilMut = useFulfilDocRequest();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", docType: "PAN Card", note: "" });

  const save = async () => {
    if (!form.docType) { toast("Document type is required", "error"); return; }
    try { await createMut.mutateAsync({ ...form, employeeId: form.employeeId || undefined }); toast("Request sent", "success"); setOpen(false); setForm({ employeeId: "", docType: "PAN Card", note: "" }); }
    catch { toast("Failed to send request", "error"); }
  };
  const fulfil = async (id) => { try { await fulfilMut.mutateAsync({ id, status: "Fulfilled" }); toast("Marked fulfilled", "success"); } catch { toast("Failed", "error"); } };

  return (
    <>
      <Group justify="flex-end" mb="md"><AppButton leftSection={<IconSend size={16} />} onClick={() => setOpen(true)}>Request Document</AppButton></Group>
      <AppSection noPadding title="Document Requests" sub={`${requests.length} requests`}>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead><Table.Tr>{["Employee", "Document Type", "Note", "Requested By", "Status", "Actions"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
            <Table.Tbody>
              {requests.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No document requests" /></Table.Td></Table.Tr>
                : requests.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={600}>{r.employeeName || "—"}</Text></Table.Td>
                    <Table.Td>{r.docType}</Table.Td>
                    <Table.Td><Text size="sm" c="dimmed" lineClamp={1}>{r.note || "—"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{r.requestedBy || "—"}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={r.status === "Fulfilled" ? "green" : r.status === "Cancelled" ? "gray" : "yellow"} radius="sm">{r.status}</Badge></Table.Td>
                    <Table.Td>{r.status === "Pending" ? <AppButton size="xs" variant="light" onClick={() => fulfil(r.id)}>Mark Fulfilled</AppButton> : <Text size="xs" c="dimmed">—</Text>}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </AppSection>
      <AppModal opened={open} onClose={() => setOpen(false)} title="Request Document" icon={<IconSend size={16} color="#3b82f6" />} iconColor="#3b82f6">
        <Stack gap="md">
          <AppInput type="select" label="Employee" searchable clearable data={employees.map((e) => ({ value: String(e.id), label: e.name }))} value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v || "" })} />
          <AppInput type="select" label="Document Type *" searchable data={DOC_TYPES} value={form.docType} onChange={(v) => setForm({ ...form, docType: v })} />
          <AppInput type="textarea" label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setOpen(false)}>Cancel</AppButton>
            <AppButton loading={createMut.isPending} onClick={save}>Send Request</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
