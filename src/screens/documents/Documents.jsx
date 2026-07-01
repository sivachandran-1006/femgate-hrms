import { useState, useMemo } from "react";
import {
  IconFileText,
  IconShieldCheck,
  IconClock,
  IconAlertTriangle,
  IconSearch,
  IconPlus,
  IconEye,
  IconDownload,
  IconTrash,
  IconX,
  IconUpload,
  IconFile,
} from "@tabler/icons-react";
import {
  Box,
  Stack,
  Group,
  Paper,
  Text,
  Button,
  ActionIcon,
  Table,
  TextInput,
  Select,
  Modal,
} from "@mantine/core";

import { COLORS } from "../../theme/colors";
import { useAllDocuments } from "../../queries/useHr";
import { useDeleteDocument } from "../../queries/useSelfService";
import { useToast } from "../../components/ui/Toast";
import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

const CATEGORIES = ["Identity", "Employment", "Financial", "Other"];

const MOCK_DOCUMENTS = [
  { id: 1,  employee: { name: "Priya Sharma"   }, name: "Aadhaar Card",          category: "Identity",   createdAt: "2026-01-10T00:00:00Z", expiryDate: null },
  { id: 2,  employee: { name: "Priya Sharma"   }, name: "PAN Card",              category: "Identity",   createdAt: "2026-01-10T00:00:00Z", expiryDate: null },
  { id: 3,  employee: { name: "Arjun Mehta"    }, name: "Offer Letter",          category: "Employment", createdAt: "2025-06-15T00:00:00Z", expiryDate: null },
  { id: 4,  employee: { name: "Arjun Mehta"    }, name: "Salary Slip — Jun 2026",category: "Financial",  createdAt: "2026-06-30T00:00:00Z", expiryDate: null },
  { id: 5,  employee: { name: "Kavitha Rajan"  }, name: "Aadhaar Card",          category: "Identity",   createdAt: "2026-02-05T00:00:00Z", expiryDate: null },
  { id: 6,  employee: { name: "Kavitha Rajan"  }, name: "Experience Letter",     category: "Employment", createdAt: "2026-03-20T00:00:00Z", expiryDate: "2028-03-20T00:00:00Z" },
  { id: 7,  employee: { name: "Suresh Babu"    }, name: "Form 16",               category: "Financial",  createdAt: "2026-05-01T00:00:00Z", expiryDate: null },
  { id: 8,  employee: { name: "Deepa Krishnan" }, name: "Appointment Letter",    category: "Employment", createdAt: "2025-09-01T00:00:00Z", expiryDate: null },
  { id: 9,  employee: { name: "Deepa Krishnan" }, name: "Passport Copy",         category: "Identity",   createdAt: "2026-04-12T00:00:00Z", expiryDate: "2026-09-30T00:00:00Z" },
  { id: 10, employee: { name: "Rahul Verma"    }, name: "Relieving Letter",      category: "Employment", createdAt: "2026-06-01T00:00:00Z", expiryDate: null },
  { id: 11, employee: { name: "Rahul Verma"    }, name: "Bank Details",          category: "Financial",  createdAt: "2026-01-20T00:00:00Z", expiryDate: null },
  { id: 12, employee: { name: "Ananya Pillai"  }, name: "NDA Agreement",         category: "Other",      createdAt: "2026-07-01T00:00:00Z", expiryDate: null },
];

// ─── Style Helpers ───────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Verified: { bg: COLORS.successLight,  color: COLORS.success  },
  Pending:  { bg: COLORS.warningLight,  color: COLORS.warning  },
  Expired:  { bg: COLORS.dangerMuted,   color: COLORS.danger   },
};

const CATEGORY_STYLE = {
  Identity:   { bg: COLORS.primaryLight,  color: COLORS.primary  },
  Employment: { bg: COLORS.purpleLight,   color: COLORS.purple   },
  Financial:  { bg: COLORS.successLight,  color: COLORS.success  },
  Other:      { bg: COLORS.gray200,       color: COLORS.gray600  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, iconColor, iconBg, dark }) => {
  const surface = dark ? COLORS.dark : COLORS.light;
  return (
    <Paper
      withBorder
      radius="xl"
      shadow="sm"
      p="lg"
      style={{
        flex: "1 1 160px",
        background: dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
        border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
        minWidth: 0,
      }}
    >
      <Group gap="md">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={iconColor} stroke={1.8} />
        </Box>
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text size="xs" fw={500} c={dark ? COLORS.dark.subtext : COLORS.textMutedLight}>{label}</Text>
          <Text fw={700} c={dark ? COLORS.dark.text : COLORS.textLight} style={{ fontSize: "1.5rem", lineHeight: 1 }}>{value}</Text>
        </Stack>
      </Group>
    </Paper>
  );
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { bg: COLORS.gray200, color: COLORS.gray600 };
  return (
    <Box
      component="span"
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
};

const ActionBtn = ({ icon: Icon, color, onClick, title, hoverBg }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <ActionIcon
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      size="sm"
      radius="md"
      style={{
        background: hovered ? hoverBg : "transparent",
        border: "none",
        color,
        transition: "background 0.15s ease",
      }}
    >
      <Icon size={16} stroke={2} />
    </ActionIcon>
  );
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────

const UploadModal = ({ onClose, dark, onUploaded }) => {
  const { data: employees = [] } = useFetchAllEmployees();
  const [form, setForm] = useState({ employeeId: "", name: "", category: CATEGORIES[0] });
  const [fileName, setFileName] = useState("No file chosen");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleUpload = async () => {
    if (!form.name.trim()) return show("Enter document name", "error");
    if (!form.employeeId)  return show("Select an employee", "error");
    setSaving(true);
    try {
      await api.post("/documents", {
        name:       form.name,
        category:   form.category,
        fileUrl:    `/files/${form.name.toLowerCase().replace(/\s+/g, "-")}`,
        fileSize:   fileName !== "No file chosen" ? fileName : null,
        employeeId: Number(form.employeeId),
      });
      show(`"${form.name}" uploaded`, "success");
      onUploaded();
      onClose();
    } catch {
      show("Failed to upload document", "error");
    } finally {
      setSaving(false);
    }
  };

  const employeeOptions = [
    { value: "", label: "Select employee…" },
    ...employees.map((e) => ({ value: String(e.id), label: `${e.name} (${e.employeeId})` })),
  ];
  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Group gap="sm">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: COLORS.primaryMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUpload size={18} color={COLORS.primary} stroke={2} />
          </Box>
          <Stack gap={0}>
            <Text size="md" fw={700} c={dark ? COLORS.dark.text : COLORS.textLight}>Upload Document</Text>
            <Text size="xs" c={dark ? COLORS.dark.subtext : COLORS.textMutedLight}>Add a new document record</Text>
          </Stack>
        </Group>
      }
      centered
      radius="xl"
      size="md"
    >
      <Stack gap="md">
        <Select
          label="Employee *"
          data={employeeOptions}
          value={form.employeeId}
          onChange={(v) => set("employeeId", v || "")}
        />

        <TextInput
          label="Document Name *"
          placeholder="e.g. Aadhaar Card"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <Select
          label="Category"
          data={categoryOptions}
          value={form.category}
          onChange={(v) => set("category", v || CATEGORIES[0])}
        />

        {/* File picker — custom dashed drop zone */}
        <Stack gap={4}>
          <Text size="xs" fw={600} c={dark ? COLORS.dark.subtext : COLORS.textMutedLight} tt="uppercase" style={{ letterSpacing: "0.05em" }}>File</Text>
          <Box
            component="label"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              borderRadius: 10,
              border: `1.5px dashed ${dark ? COLORS.dark.border : COLORS.borderLight}`,
              background: dark ? COLORS.dark.inputBg : COLORS.gray50,
              cursor: "pointer",
            }}
          >
            <Box
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: COLORS.primaryMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconFile size={16} color={COLORS.primary} stroke={2} />
            </Box>
            <Text size="sm" c={dark ? COLORS.dark.subtext : COLORS.textMutedLight} style={{ flex: 1 }}>{fileName}</Text>
            <Box
              component="span"
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: COLORS.primary,
                background: COLORS.primaryMuted,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              Browse
            </Box>
            <input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name || "No file chosen")} style={{ display: "none" }} />
          </Box>
        </Stack>

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={saving}
            loading={saving}
            leftSection={<IconUpload size={15} stroke={2} />}
          >
            {saving ? "Uploading…" : "Upload"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Documents = ({ darkMode: dark = false }) => {
  const [search,        setSearch]        = useState("");
  const [categoryFilter,setCategoryFilter]= useState("All");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [showModal,     setShowModal]     = useState(false);
  const [viewDoc,       setViewDoc]       = useState(null);

  const { show } = useToast();
  const qc = useQueryClient();
  const { data: docsRawApi = [] } = useAllDocuments();
  const docsRaw = docsRawApi.length ? docsRawApi : MOCK_DOCUMENTS;
  const deleteMut = useDeleteDocument();

  const docs = docsRaw.map((d) => ({
    id:         d.id,
    employee:   d.employee?.name || "Company",
    name:       d.name,
    category:   d.category || "Other",
    uploadDate: (d.createdAt || "").split("T")[0],
    expiryDate: d.expiryDate ? d.expiryDate.split("T")[0] : "N/A",
    status:     d.expiryDate && new Date(d.expiryDate) < new Date() ? "Expired" : "Verified",
  }));

  // Derived stats
  const stats = useMemo(() => ({
    total:    docs.length,
    pending:  docs.filter((d) => d.status === "Pending").length,
    expiring: docs.filter((d) => {
      if (d.expiryDate === "N/A") return false;
      const diff = (new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 90;
    }).length,
    verified: docs.filter((d) => d.status === "Verified").length,
  }), [docs]);

  // Filtered list
  const filtered = useMemo(() => docs.filter((d) => {
    const term = search.toLowerCase();
    const matchSearch = !term || d.name.toLowerCase().includes(term) || d.employee.toLowerCase().includes(term);
    const matchCat    = categoryFilter === "All" || d.category === categoryFilter;
    const matchStatus = statusFilter   === "All" || d.status   === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [docs, search, categoryFilter, statusFilter]);

  const handleDelete = async (id) => {
    try {
      await deleteMut.mutateAsync(id);
      qc.invalidateQueries({ queryKey: ["documents", "all"] });
      show("Document archived", "success");
    } catch {
      show("Failed to delete document", "error");
    }
  };

  const textMain  = dark ? COLORS.dark.text    : COLORS.textLight;
  const textMuted = dark ? COLORS.dark.subtext : COLORS.textMutedLight;
  const border    = dark ? COLORS.dark.border  : COLORS.borderLight;
  const cardBg    = dark ? COLORS.dark.cardBg  : COLORS.surfaceLight;
  const theadBg   = dark ? COLORS.dark.theadBg : COLORS.gray50;
  const rowHover  = dark ? COLORS.dark.rowHover: COLORS.gray100;

  return (
    <Box style={{ minHeight: "100vh", background: dark ? COLORS.dark.pageBg : COLORS.backgroundLight }} p="md">

      <AppPageHeader
        title="Documents"
        sub="Manage and verify employee documents"
        action={
          <Button
            leftSection={<IconPlus size={17} stroke={2.5} />}
            onClick={() => setShowModal(true)}
            shadow="sm"
          >
            Upload Document
          </Button>
        }
      />

      {/* Stat Cards */}
      <Group gap="md" mb="xl" wrap="wrap">
        <StatCard dark={dark} icon={IconFileText}      label="Total Documents"      value={stats.total}    iconColor={COLORS.primary}  iconBg={COLORS.primaryMuted}  />
        <StatCard dark={dark} icon={IconClock}         label="Pending Verification" value={stats.pending}  iconColor={COLORS.warning}  iconBg={COLORS.warningLight}  />
        <StatCard dark={dark} icon={IconAlertTriangle} label="Expiring Soon"        value={stats.expiring} iconColor={COLORS.danger}   iconBg={COLORS.dangerMuted}   />
        <StatCard dark={dark} icon={IconShieldCheck}   label="Verified"             value={stats.verified} iconColor={COLORS.success}  iconBg={COLORS.successLight}  />
      </Group>

      {/* Card: Filter + Table */}
      <Paper
        withBorder
        radius="xl"
        shadow="sm"
        style={{ background: cardBg, border: `1px solid ${border}`, overflow: "hidden" }}
      >
        {/* Filter Bar */}
        <Group gap="sm" wrap="wrap" align="center" p="md" style={{ borderBottom: `1px solid ${border}` }}>
          <TextInput
            placeholder="Search by name or employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={16} color={textMuted} />}
            style={{ flex: "1 1 200px", minWidth: 0 }}
          />
          <Select
            data={["All", "Identity", "Employment", "Financial", "Other"]}
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v || "All")}
            style={{ minWidth: 130 }}
          />
          <Select
            data={["All", "Verified", "Pending", "Expired"]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v || "All")}
            style={{ minWidth: 120 }}
          />
          <Text size="xs" c={textMuted} style={{ marginLeft: "auto" }}>
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </Text>
        </Group>

        {/* Table */}
        <Box style={{ overflowX: "auto" }}>
          <Table style={{ minWidth: 860 }}>
            <Table.Thead style={{ background: theadBg }}>
              <Table.Tr>
                {["Document Name", "Employee", "Category", "Upload Date", "Expiry Date", "Status", "Actions"].map((col) => (
                  <Table.Th key={col} style={{ textAlign: col === "Actions" ? "center" : "left" }}>
                    <Text size="xs" fw={600} c={textMuted} tt="uppercase" style={{ letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{col}</Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: "center", padding: 48 }}>
                    <Text size="sm" c={textMuted}>No documents found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((doc, idx) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    dark={dark}
                    border={border}
                    textMain={textMain}
                    textMuted={textMuted}
                    rowHover={rowHover}
                    isLast={idx === filtered.length - 1}
                    onView={() => setViewDoc(doc)}
                    onDownload={() => { if (doc.fileUrl) window.open(doc.fileUrl, "_blank"); }}
                    onDelete={() => handleDelete(doc.id)}
                  />
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Upload Modal */}
      {showModal && (
        <UploadModal
          dark={dark}
          onClose={() => setShowModal(false)}
          onUploaded={() => qc.invalidateQueries({ queryKey: ["documents", "all"] })}
        />
      )}

      {/* View Document Modal */}
      {viewDoc && (
        <Modal
          opened
          onClose={() => setViewDoc(null)}
          title={
            <Text fw={700} size="lg" c={dark ? COLORS.dark.text : COLORS.textLight}>Document Details</Text>
          }
          centered
          radius="xl"
          size="sm"
          styles={{
            body: { background: dark ? COLORS.dark.cardBg : "#fff" },
            header: { background: dark ? COLORS.dark.cardBg : "#fff" },
          }}
        >
          <Stack gap={0}>
            {[
              ["Name",     viewDoc.name],
              ["Employee", viewDoc.employee],
              ["Category", viewDoc.category],
              ["Uploaded", viewDoc.uploadDate || "—"],
              ["Expiry",   viewDoc.expiryDate === "N/A" ? "—" : viewDoc.expiryDate],
              ["Status",   viewDoc.status],
            ].map(([k, v]) => (
              <Group key={k} justify="space-between" style={{ padding: "8px 0", borderBottom: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}` }}>
                <Text size="sm" c={dark ? COLORS.dark.subtext : COLORS.textMutedLight}>{k}</Text>
                <Text size="sm" fw={500} c={dark ? COLORS.dark.text : COLORS.textLight}>{v}</Text>
              </Group>
            ))}
          </Stack>
        </Modal>
      )}
    </Box>
  );
};

// ─── Document Row ─────────────────────────────────────────────────────────────

const DocumentRow = ({ doc, border, textMain, textMuted, rowHover, isLast, onView, onDownload, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Table.Tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? rowHover : "transparent",
        transition: "background 0.15s ease",
        borderBottom: isLast ? "none" : `1px solid ${border}`,
      }}
    >
      {/* Document Name */}
      <Table.Td style={{ whiteSpace: "nowrap" }}>
        <Group gap="sm">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: COLORS.primaryMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconFileText size={16} color={COLORS.primary} stroke={1.8} />
          </Box>
          <Text size="sm" fw={500} c={textMain}>{doc.name}</Text>
        </Group>
      </Table.Td>

      {/* Employee */}
      <Table.Td style={{ whiteSpace: "nowrap" }}>
        <Text size="sm" fw={500} c={textMain}>{doc.employee}</Text>
      </Table.Td>

      {/* Category */}
      <Table.Td style={{ whiteSpace: "nowrap" }}>
        <Badge label={doc.category} styleMap={CATEGORY_STYLE} />
      </Table.Td>

      {/* Upload Date */}
      <Table.Td style={{ whiteSpace: "nowrap" }}>
        <Text size="sm" c={textMuted}>{formatDate(doc.uploadDate)}</Text>
      </Table.Td>

      {/* Expiry Date */}
      <Table.Td style={{ whiteSpace: "nowrap" }}>
        <Text size="sm" c={doc.expiryDate === "N/A" ? textMuted : (doc.status === "Expired" ? COLORS.danger : textMuted)}>
          {doc.expiryDate === "N/A" ? "—" : formatDate(doc.expiryDate)}
        </Text>
      </Table.Td>

      {/* Status */}
      <Table.Td style={{ whiteSpace: "nowrap" }}>
        <Badge label={doc.status} styleMap={STATUS_STYLE} />
      </Table.Td>

      {/* Actions */}
      <Table.Td>
        <Group gap="xs" justify="center">
          <ActionBtn icon={IconEye}      title="View"     color={COLORS.primary} hoverBg={COLORS.primaryMuted} onClick={onView} />
          <ActionBtn icon={IconDownload} title="Download" color={COLORS.success} hoverBg={COLORS.successLight} onClick={onDownload} />
          <ActionBtn icon={IconTrash}    title="Delete"   color={COLORS.danger}  hoverBg={COLORS.dangerMuted}  onClick={onDelete} />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "N/A") return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default Documents;
