import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Group, Stack, Text, Badge, Tabs, SimpleGrid, Table, ScrollArea, Avatar,
  Loader, Box, Alert, ActionIcon, Divider, Button, NumberInput,
} from "@mantine/core";
import {
  IconArrowLeft, IconDeviceLaptop, IconHistory, IconTool, IconFile, IconClipboardList,
  IconAlertCircle, IconPlus,
} from "@tabler/icons-react";

import { AppSection }    from "../../components/ui/AppSection";
import { AppButton }     from "../../components/ui/AppButton";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { AppModal }      from "../../components/ui/AppModal";
import { AppInput }      from "../../components/ui/AppInput";
import { useToast }      from "../../components/ui/Toast";
import { useAsset, useAssetAssignments, useAssetMaintenance, useAssetAudit, useAddMaintenance } from "../../queries/useAssets";

const STATUS_COLOR = { Available: "green", Assigned: "blue", InUse: "blue", UnderRepair: "orange", Maintenance: "orange", Lost: "red", Damaged: "red", Disposed: "gray", Retired: "gray" };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const inr = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const Field = ({ label, value }) => (
  <Box><Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: "0.04em" }}>{label}</Text><Text size="sm" fw={500}>{value || "—"}</Text></Box>
);

export default function AssetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const { data: asset, isLoading, isError } = useAsset(id);
  const { data: assignments = [] } = useAssetAssignments(id);
  const { data: maintenance = [] } = useAssetMaintenance(id);
  const { data: audit = [] } = useAssetAudit(id);
  const addMaint = useAddMaintenance();

  const [maintOpen, setMaintOpen] = useState(false);
  const [mForm, setMForm] = useState({ type: "Repair", vendor: "", cost: "", description: "", setUnderRepair: false });

  if (isLoading) return <Box ta="center" py="xl"><Loader /></Box>;
  if (isError || !asset) return (
    <Alert icon={<IconAlertCircle size={16} />} color="red">
      Asset not found. <Text span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/assets")}>Back to list</Text>
    </Alert>
  );

  const saveMaint = async () => {
    try { await addMaint.mutateAsync({ id: asset.id, ...mForm, cost: mForm.cost ? Number(mForm.cost) : null }); toast("Maintenance logged", "success"); setMaintOpen(false); setMForm({ type: "Repair", vendor: "", cost: "", description: "", setUnderRepair: false }); }
    catch { toast("Failed to log maintenance", "error"); }
  };

  return (
    <>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ActionIcon variant="light" size="lg" radius="md" onClick={() => navigate("/assets")} title="Back"><IconArrowLeft size={18} /></ActionIcon>
          <Avatar size={48} radius="md" color="blue" variant="light"><IconDeviceLaptop size={24} /></Avatar>
          <div>
            <Group gap="sm">
              <Text fz="xl" fw={800}>{asset.name}</Text>
              <Badge color={STATUS_COLOR[asset.status] || "gray"} variant="light" radius="xl">{asset.status}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{asset.assetId} · {asset.category}{asset.assignedTo ? ` · ${asset.assignedTo.name}` : ""}</Text>
          </div>
        </Group>
        <AppButton variant="default" onClick={() => navigate("/assets")}>All Assets</AppButton>
      </Group>

      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview"   leftSection={<IconDeviceLaptop size={15} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="history"    leftSection={<IconHistory size={15} />}>Assignment History</Tabs.Tab>
          <Tabs.Tab value="maintenance" leftSection={<IconTool size={15} />}>Maintenance</Tabs.Tab>
          <Tabs.Tab value="documents"  leftSection={<IconFile size={15} />}>Documents</Tabs.Tab>
          <Tabs.Tab value="audit"      leftSection={<IconClipboardList size={15} />}>Audit Logs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <AppSection title="Asset Information">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              <Field label="Asset ID" value={asset.assetId} />
              <Field label="Name" value={asset.name} />
              <Field label="Category" value={asset.category} />
              <Field label="Brand" value={asset.brand} />
              <Field label="Model" value={asset.model} />
              <Field label="Serial Number" value={asset.serialNumber} />
              <Field label="Vendor" value={asset.vendor} />
              <Field label="Location" value={asset.location} />
              <Field label="Status" value={asset.status} />
              <Field label="Purchase Date" value={fmtDate(asset.purchaseDate)} />
              <Field label="Warranty Expiry" value={fmtDate(asset.warrantyExpiry)} />
              <Field label="Purchase Value" value={inr(asset.purchaseValue)} />
              <Field label="Assigned To" value={asset.assignedTo?.name} />
              <Field label="Assigned On" value={fmtDate(asset.assignedAt)} />
              <Field label="Expected Return" value={fmtDate(asset.expectedReturnDate)} />
            </SimpleGrid>
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <AppSection noPadding title="Assignment History" sub={`${assignments.length} records`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Employee", "Assigned Date", "Returned Date", "Condition", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {assignments.length === 0 ? <Table.Tr><Table.Td colSpan={5}><AppEmptyState message="No assignment history" /></Table.Td></Table.Tr>
                    : assignments.map((a) => (
                      <Table.Tr key={a.id}>
                        <Table.Td><Text size="sm" fw={600}>{a.employeeName || "—"}</Text></Table.Td>
                        <Table.Td>{fmtDate(a.assignedDate)}</Table.Td>
                        <Table.Td>{fmtDate(a.returnedDate)}</Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{a.conditionOnReturn || "—"}</Text></Table.Td>
                        <Table.Td><Badge variant="light" color={a.status === "Returned" ? "green" : a.status === "Rejected" ? "red" : "blue"} radius="sm">{a.status}</Badge></Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="maintenance">
          <Group justify="flex-end" mb="md"><AppButton leftSection={<IconPlus size={16} />} onClick={() => setMaintOpen(true)}>Log Maintenance</AppButton></Group>
          <AppSection noPadding title="Maintenance History" sub={`${maintenance.length} records`}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead><Table.Tr>{["Type", "Vendor", "Cost", "Description", "Date", "Status"].map((c) => <Table.Th key={c}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{c}</Text></Table.Th>)}</Table.Tr></Table.Thead>
                <Table.Tbody>
                  {maintenance.length === 0 ? <Table.Tr><Table.Td colSpan={6}><AppEmptyState message="No maintenance records" /></Table.Td></Table.Tr>
                    : maintenance.map((m) => (
                      <Table.Tr key={m.id}>
                        <Table.Td><Badge variant="light" radius="sm">{m.type}</Badge></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{m.vendor || "—"}</Text></Table.Td>
                        <Table.Td>{inr(m.cost)}</Table.Td>
                        <Table.Td><Text size="sm" c="dimmed" lineClamp={1}>{m.description || "—"}</Text></Table.Td>
                        <Table.Td>{fmtDate(m.date)}</Table.Td>
                        <Table.Td><Badge variant="light" color={m.status === "Completed" ? "green" : "orange"} radius="sm">{m.status}</Badge></Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        <Tabs.Panel value="documents">
          <AppSection title="Documents">
            <AppEmptyState message="No documents attached" sub="Invoices, warranty cards and receipts will appear here." py={60} />
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

      <AppModal opened={maintOpen} onClose={() => setMaintOpen(false)} title="Log Maintenance" icon={<IconTool size={16} color="#f59e0b" />} iconColor="#f59e0b">
        <Stack gap="md">
          <AppInput type="select" label="Type" data={["Repair", "Service", "Inspection"]} value={mForm.type} onChange={(v) => setMForm({ ...mForm, type: v })} />
          <Group grow>
            <AppInput label="Vendor" value={mForm.vendor} onChange={(e) => setMForm({ ...mForm, vendor: e.target.value })} />
            <NumberInput label="Cost (₹)" min={0} value={mForm.cost} onChange={(v) => setMForm({ ...mForm, cost: v })} />
          </Group>
          <AppInput type="textarea" label="Description" value={mForm.description} onChange={(e) => setMForm({ ...mForm, description: e.target.value })} />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setMaintOpen(false)}>Cancel</AppButton>
            <AppButton color="orange" loading={addMaint.isPending} onClick={saveMaint}>Save</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
