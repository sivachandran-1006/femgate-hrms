import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Loader, Box, Alert,
  ActionIcon, Divider, Button,
} from "@mantine/core";
import {
  IconArrowLeft, IconFile, IconVersions, IconShieldCheck, IconClipboardList,
  IconAlertCircle, IconCheck, IconX, IconUpload,
} from "@tabler/icons-react";

import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { useDocument, useDocVersions, useDocAudit, useVerifyDocument, useAddDocVersion } from "../../queries/useDocuments";

const STATUS_COLOR = { Pending: "yellow", Verified: "green", Rejected: "red", Expired: "orange", Archived: "gray" };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const Field = ({ label, value }) => (
  <Box><Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text><Text size="sm" fw={500}>{value || "—"}</Text></Box>
);

export default function DocumentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const { data: doc, isLoading, isError } = useDocument(id);
  const { data: versions = [] } = useDocVersions(id);
  const { data: audit = [] } = useDocAudit(id);
  const verifyMut = useVerifyDocument();
  const versionMut = useAddDocVersion();

  const [verifyComment, setVerifyComment] = useState("");
  const [verOpen, setVerOpen] = useState(false);
  const [verUrl, setVerUrl] = useState("");

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (isError || !doc) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Document not found. <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/documents")}>Back to list</Text>
    </Alert>
  );

  const verify = async (status) => {
    try { await verifyMut.mutateAsync({ id: doc.id, status, comment: verifyComment }); toast(`Document ${status === "Verified" ? "approved" : status === "Rejected" ? "rejected" : "sent for correction"}`, "success"); setVerifyComment(""); }
    catch { toast("Action failed", "error"); }
  };
  const uploadVersion = async () => {
    if (!verUrl.trim()) { toast("File URL required", "error"); return; }
    try { await versionMut.mutateAsync({ id: doc.id, fileUrl: verUrl }); toast("New version uploaded", "success"); setVerOpen(false); setVerUrl(""); }
    catch { toast("Failed", "error"); }
  };

  return (
    <>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/documents")} title="Back"><IconArrowLeft size={18} /></ActionIcon>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--mantine-color-blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconFile size={24} color="#3b82f6" /></div>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{doc.name}</Text>
              <Badge color={STATUS_COLOR[doc.verificationStatus] || "gray"} variant="light" radius="xl">{doc.verificationStatus}</Badge>
              <Badge variant="light" radius="sm">v{doc.version}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{doc.docType || doc.category} · {doc.employee?.name || "Company"}</Text>
          </div>
        </Group>
        <Group gap="sm">
          {doc.fileUrl && <AppButton variant="default" component="a" href={doc.fileUrl} target="_blank">Download</AppButton>}
          <AppButton variant="default" onClick={() => navigate("/documents")}>All Documents</AppButton>
        </Group>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"     leftSection={<IconFile size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="versions"     leftSection={<IconVersions size={15} />}>Versions</Tabs.Tab>
          <Tabs.Tab value="verification" leftSection={<IconShieldCheck size={15} />}>Verification</Tabs.Tab>
          <Tabs.Tab value="audit"        leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <AppSection title="Document Details">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Document Name" value={doc.name} />
              <Field label="Type" value={doc.docType} />
              <Field label="Category" value={doc.category} />
              <Field label="Owner" value={doc.employee?.name || "Company"} />
              <Field label="Department" value={doc.employee?.department || doc.departmentName} />
              <Field label="Uploaded By" value={doc.uploadedByName} />
              <Field label="Upload Date" value={fmtDate(doc.createdAt)} />
              <Field label="Expiry Date" value={fmtDate(doc.expiryDate)} />
              <Field label="Status" value={doc.verificationStatus} />
              <Field label="Version" value={`v${doc.version}`} />
              <Field label="Tags" value={doc.tags} />
            </SimpleGrid>
            {doc.description && <><Divider my="md" /><Field label="Description" value={doc.description} /></>}
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="versions">
          <Group justify="flex-end" mb="md"><AppButton leftSection={<IconUpload size={16} />} onClick={() => setVerOpen(true)}>Upload New Version</AppButton></Group>
          <AppSection noPadding title="Version History" sub={`current: v${doc.version}`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Version", "Uploaded By", "Note", "Date", "File"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td><Badge color="blue" radius="sm">v{doc.version} (current)</Badge></Table.Td>
                    <Table.Td><Text size="sm">{doc.uploadedByName || "—"}</Text></Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">Latest</Text></Table.Td>
                    <Table.Td>{fmtDate(doc.updatedAt)}</Table.Td>
                    <Table.Td>{doc.fileUrl ? <a href={doc.fileUrl} target="_blank" rel="noreferrer">Open</a> : "—"}</Table.Td>
                  </Table.Tr>
                  {versions.map((v) => (
                    <Table.Tr key={v.id}>
                      <Table.Td><Badge variant="light" radius="sm">v{v.version}</Badge></Table.Td>
                      <Table.Td><Text size="sm">{v.uploadedByName || "—"}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{v.note || "—"}</Text></Table.Td>
                      <Table.Td>{fmtDate(v.createdAt)}</Table.Td>
                      <Table.Td>{v.fileUrl ? <a href={v.fileUrl} target="_blank" rel="noreferrer">Open</a> : "—"}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="verification">
          <AppSection title="Verification">
            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
              <Field label="Status" value={doc.verificationStatus} />
              <Field label="Verified By" value={doc.verifiedBy} />
              <Field label="Verified At" value={fmtDateTime(doc.verifiedAt)} />
            </SimpleGrid>
            {doc.verifyComment && <><Field label="Comments" value={doc.verifyComment} /><Divider my="md" /></>}
            <AppInput type="textarea" label="Verification Comment" placeholder="Optional note…" value={verifyComment} onChange={(e) => setVerifyComment(e.target.value)} mb="md" />
            <Group gap="sm">
              <Button color="green" leftSection={<IconCheck size={16} />} loading={verifyMut.isPending} onClick={() => verify("Verified")}>Approve</Button>
              <Button color="red" leftSection={<IconX size={16} />} variant="light" loading={verifyMut.isPending} onClick={() => verify("Rejected")}>Reject</Button>
              <Button color="blue" variant="light" leftSection={<IconAlertCircle size={16} />} loading={verifyMut.isPending} onClick={() => verify("Correction")}>Request Correction</Button>
            </Group>
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="audit">
          <AppSection noPadding title="Audit Logs" sub={`${audit.length} events`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Action", "Details", "By", "When"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {audit.length === 0 ? <Table.Tr><Table.Td colSpan={4}><AppEmptyState message="No audit history yet" /></Table.Td></Table.Tr>
                    : audit.map((l) => (
                      <Table.Tr key={l.id}>
                        <Table.Td><Badge variant="light" radius="xl">{l.action}</Badge></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{l.details || "—"}</Text></Table.Td>
                        <Table.Td><Text size="sm">{l.actorName || "System"}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{fmtDateTime(l.createdAt)}</Text></Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>
      </Tabs>

      <AppModal opened={verOpen} onClose={() => setVerOpen(false)} title="Upload New Version" icon={<IconUpload size={16} color="#3b82f6" />} iconColor="#3b82f6">
        <Stack gap="md">
          <Text size="xs" c="dimmed">The current version will be archived to history and this becomes the new current version (re-enters verification).</Text>
          <AppInput label="New File URL *" placeholder="https://…" value={verUrl} onChange={(e) => setVerUrl(e.target.value)} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setVerOpen(false)}>Cancel</AppButton>
            <AppButton loading={versionMut.isPending} onClick={uploadVersion}>Upload</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
