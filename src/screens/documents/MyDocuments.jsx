import { useState } from "react";
import {
  IconFolder, IconUpload, IconDownload, IconEye,
  IconTrash, IconFile, IconShieldCheck,
} from "@tabler/icons-react";
import { useAuth }              from "../../hooks/useAuth";
import { useMyDocuments, useCreateDocument, useDeleteDocument } from "../../queries/useSelfService";
import { useToast }             from "../../components/ui/Toast";
import {
  Stack, Group, Box, Paper, SimpleGrid, Text, Badge,
  ActionIcon, Table, UnstyledButton, Modal,
} from "@mantine/core";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { AppButton }     from "../../components/ui/AppButton";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { COLORS }        from "../../theme/colors";
import { RADIUS }        from "../../theme/sizes";

const mapApiDoc = (d) => ({
  id:         d.id,
  name:       d.name,
  category:   d.category || "Other",
  uploadDate: (d.createdAt || "").split("T")[0],
  status:     d.expiryDate && new Date(d.expiryDate) < new Date() ? "Expired" : "Verified",
  size:       d.fileSize || "—",
});

const CATEGORIES = ["All","Identity","Education","Employment","Financial","Other"];

const STATUS_COLOR = {
  Verified: { bg: COLORS.successLight, color: COLORS.success },
  Pending:  { bg: COLORS.warningLight, color: COLORS.warning },
  Expired:  { bg: COLORS.dangerMuted,  color: COLORS.danger  },
};

const CAT_COLOR = {
  Identity:   { bg: COLORS.primaryMuted, color: COLORS.primary },
  Education:  { bg: COLORS.purpleMuted,  color: COLORS.purple  },
  Employment: { bg: COLORS.infoLight,    color: COLORS.info    },
  Financial:  { bg: COLORS.successLight, color: COLORS.success },
  Other:      { bg: COLORS.gray200,      color: COLORS.gray600 },
};

const MyDocuments = ({ darkMode: dark = false }) => {
  const { user }  = useAuth();
  const { show }  = useToast();
  const [catFilter,  setCatFilter]  = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [fileName,   setFileName]   = useState("No file chosen");
  const [form, setForm] = useState({ name: "", category: "Identity" });
  const [viewDoc, setViewDoc] = useState(null);

  const { data: docsRaw = [] } = useMyDocuments();
  const createMut = useCreateDocument();
  const deleteMut = useDeleteDocument();

  const docs     = docsRaw.map(mapApiDoc);
  const filtered = docs.filter((d) => catFilter === "All" || d.category === catFilter);

  const handleUpload = async () => {
    if (!form.name.trim()) return;
    try {
      await createMut.mutateAsync({
        name:     form.name,
        category: form.category,
        fileUrl:  `/files/${form.name.toLowerCase().replace(/\s+/g, "-")}`,
        fileSize: fileName !== "No file chosen" ? fileName : null,
      });
      show(`"${form.name}" uploaded`, "success");
      setForm({ name: "", category: "Identity" });
      setFileName("No file chosen");
      setShowUpload(false);
    } catch {
      show("Failed to upload document", "error");
    }
  };

  const handleDelete = async (doc) => {
    try {
      await deleteMut.mutateAsync(doc.id);
      show(`"${doc.name}" deleted`, "error");
    } catch {
      show("Failed to delete document", "error");
    }
  };

  return (
    <Box>
      <AppPageHeader
        title="My Documents"
        sub="Upload and manage your personal documents"
        action={
          <AppButton onClick={() => setShowUpload(true)} leftSection={<IconUpload size={16} />}>
            Upload Document
          </AppButton>
        }
      />

      {/* Stat chips */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="lg">
        {[
          { label: "Total",    value: docs.length,                                      color: COLORS.primary, bg: COLORS.primaryMuted },
          { label: "Verified", value: docs.filter(d => d.status === "Verified").length, color: COLORS.success, bg: COLORS.successLight },
          { label: "Pending",  value: docs.filter(d => d.status === "Pending").length,  color: COLORS.warning, bg: COLORS.warningLight },
          { label: "Expired",  value: docs.filter(d => d.status === "Expired").length,  color: COLORS.danger,  bg: COLORS.dangerMuted  },
        ].map((s) => (
          <Paper key={s.label} radius="xl" withBorder shadow="sm" p="md">
            <Group gap="md">
              <Box
                style={{
                  width: 44, height: 44, borderRadius: RADIUS.xl,
                  background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <IconFolder size={20} color={s.color} stroke={1.8} />
              </Box>
              <Box>
                <Text size="xs" c="dimmed">{s.label} Documents</Text>
                <Text size="xl" fw={700} style={{ color: s.color, lineHeight: 1.1 }}>{s.value}</Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Filter + Table */}
      <Paper radius="xl" withBorder shadow="sm">
        {/* Filter bar */}
        <Group
          gap="sm"
          p="md"
          wrap="wrap"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          {CATEGORIES.map((c) => (
            <UnstyledButton
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding: "5px 14px",
                borderRadius: RADIUS.full,
                border: `1px solid ${catFilter === c ? COLORS.primary : "var(--mantine-color-default-border)"}`,
                background: catFilter === c ? COLORS.primaryMuted : "transparent",
                color: catFilter === c ? COLORS.primary : "var(--mantine-color-dimmed)",
                fontSize: "var(--mantine-font-size-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {c}
            </UnstyledButton>
          ))}
          <Text size="xs" c="dimmed" ml="auto">{filtered.length} documents</Text>
        </Group>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {["Document","Category","Upload Date","Size","Status","Actions"].map((h) => (
                  <Table.Th key={h}>{h}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((doc) => {
                const st = STATUS_COLOR[doc.status] || STATUS_COLOR.Pending;
                const ct = CAT_COLOR[doc.category]  || CAT_COLOR.Other;
                return (
                  <Table.Tr key={doc.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Box
                          style={{
                            width: 34, height: 34, borderRadius: RADIUS.md,
                            background: COLORS.primaryMuted, display: "flex",
                            alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}
                        >
                          <IconFile size={16} color={COLORS.primary} stroke={2} />
                        </Box>
                        <Text size="sm" fw={500}>{doc.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        style={{ background: ct.bg, color: ct.color, border: "none" }}
                      >
                        {doc.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{doc.uploadDate}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{doc.size}</Text></Table.Td>
                    <Table.Td>
                      <Group gap={5} wrap="nowrap">
                        <Box
                          style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: st.color, display: "inline-block", flexShrink: 0,
                          }}
                        />
                        <Text size="xs" fw={600} style={{ color: st.color }}>{doc.status}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          title="View"
                          variant="default"
                          size="sm"
                          onClick={() => setViewDoc(doc)}
                          color="blue"
                        >
                          <IconEye size={13} />
                        </ActionIcon>
                        <ActionIcon title="Download" variant="default" size="sm" color="green">
                          <IconDownload size={13} />
                        </ActionIcon>
                        <ActionIcon
                          title="Delete"
                          variant="default"
                          size="sm"
                          color="red"
                          onClick={() => handleDelete(doc)}
                        >
                          <IconTrash size={13} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
      </Paper>

      {/* Security notice */}
      <Paper
        mt="md"
        radius="xl"
        p="sm"
        style={{ background: COLORS.infoLight, border: `1px solid ${COLORS.info}30` }}
      >
        <Group gap="sm">
          <IconShieldCheck size={16} color={COLORS.info} stroke={2} />
          <Text size="xs" style={{ color: COLORS.info }}>
            All documents are securely stored and accessible only by you and authorised HR personnel.
          </Text>
        </Group>
      </Paper>

      {/* ── Upload Modal ── */}
      <AppModal
        opened={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Document"
        subtitle="Add a new document to your profile"
        icon={<IconUpload size={18} color={COLORS.primary} stroke={2} />}
        iconColor={COLORS.primary}
        size="sm"
      >
        <Stack gap="md">
          <AppInput
            label="Document Name *"
            placeholder="e.g. Aadhaar Card"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <AppInput
            type="select"
            label="Category"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            data={["Identity","Education","Employment","Financial","Other"]}
          />
          {/* File picker */}
          <Box>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={5} style={{ letterSpacing: "0.05em" }}>
              File
            </Text>
            <Box
              component="label"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: RADIUS.lg,
                border: "1.5px dashed var(--mantine-color-default-border)",
                background: "var(--mantine-color-default-hover)",
                cursor: "pointer",
              }}
            >
              <Box
                style={{
                  width: 30, height: 30, borderRadius: RADIUS.md,
                  background: COLORS.primaryMuted, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <IconFile size={15} color={COLORS.primary} stroke={2} />
              </Box>
              <Text size="sm" c="dimmed" style={{ flex: 1 }}>{fileName}</Text>
              <Text
                size="xs"
                fw={600}
                style={{
                  color: COLORS.primary, background: COLORS.primaryMuted,
                  padding: "3px 10px", borderRadius: RADIUS.full,
                }}
              >
                Browse
              </Text>
              <input
                type="file"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "No file chosen")}
                style={{ display: "none" }}
              />
            </Box>
          </Box>
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowUpload(false)}>Cancel</AppButton>
            <AppButton leftSection={<IconUpload size={14} stroke={2} />} onClick={handleUpload}>
              Upload
            </AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* View Document Modal */}
      <Modal
        opened={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={<Text fw={700} size="lg">Document Details</Text>}
        size="sm"
        radius="xl"
      >
        {viewDoc && (
          <Stack gap={0}>
            {[
              ["Name",     viewDoc.name],
              ["Category", viewDoc.category],
              ["Uploaded", viewDoc.uploadDate || "—"],
              ["Status",   viewDoc.status],
              ["Size",     viewDoc.size],
            ].map(([k, v]) => (
              <Group
                key={k}
                justify="space-between"
                py="xs"
                style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
              >
                <Text size="sm" c="dimmed">{k}</Text>
                <Text size="sm" fw={500}>{v}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default MyDocuments;
