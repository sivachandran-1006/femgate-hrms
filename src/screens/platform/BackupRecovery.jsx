import { useState, useEffect } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, Table, Modal, Select,
  ActionIcon, Tooltip, SimpleGrid, ScrollArea, Center, Loader,
} from "@mantine/core";
import {
  IconDatabaseExport, IconPlus, IconTrash, IconRefresh, IconCloudUpload,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import { useBackups, useTriggerBackup, useDeleteBackup } from "../../queries/usePlatform";

const MOCK_BACKUPS = [
  { id:1, type:"full",        status:"Completed", size:"2.4 GB",  triggeredBy:"Siva",   startedAt:"2026-06-28T02:00:00Z", completedAt:"2026-06-28T02:14:22Z", location:"s3://hrpluse-backups/full/1.tar.gz"   },
  { id:2, type:"incremental", status:"Completed", size:"380 MB",  triggeredBy:"Siva",   startedAt:"2026-06-27T02:00:00Z", completedAt:"2026-06-27T02:03:11Z", location:"s3://hrpluse-backups/inc/2.tar.gz"    },
  { id:3, type:"schema",      status:"Completed", size:"12 MB",   triggeredBy:"System", startedAt:"2026-06-26T02:00:00Z", completedAt:"2026-06-26T02:00:44Z", location:"s3://hrpluse-backups/schema/3.tar.gz" },
  { id:4, type:"full",        status:"Failed",    size:null,      triggeredBy:"Siva",   startedAt:"2026-06-25T02:00:00Z", completedAt:null,                   location:null                                   },
  { id:5, type:"incremental", status:"Completed", size:"412 MB",  triggeredBy:"System", startedAt:"2026-06-24T02:00:00Z", completedAt:"2026-06-24T02:03:55Z", location:"s3://hrpluse-backups/inc/5.tar.gz"   },
];

const STATUS_COLOR = {
  Completed: "green",
  Running:   "blue",
  Failed:    "red",
  Pending:   "orange",
};

const TYPE_COLOR = {
  full:        "violet",
  incremental: "cyan",
  schema:      "teal",
};

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle:"short", timeStyle:"short" });
}

export default function BackupRecovery() {
  const { user }  = useAuth();
  const toast     = useToast();
  const isSA      = ["SUPER_ADMIN"].includes(user?.role);

  const { data: raw, isLoading, refetch } = useBackups();
  const triggerBackup = useTriggerBackup();
  const deleteBackup  = useDeleteBackup();

  const backups  = (raw?.backups?.length ? raw.backups : MOCK_BACKUPS);
  const summary  = raw?.summary ?? {};

  // Auto-poll every 10s when any backup is Running
  const hasRunning = backups.some(b => b.status === "Running");
  useEffect(() => {
    if (!hasRunning) return;
    const id = setInterval(() => refetch(), 10000);
    return () => clearInterval(id);
  }, [hasRunning, refetch]);

  const [modalOpen, setModalOpen] = useState(false);
  const [backupType, setBackupType] = useState("full");

  const total     = backups.length;
  const completed = backups.filter(b => b.status === "Completed").length;
  const failed    = backups.filter(b => b.status === "Failed").length;
  const lastBackup = backups
    .filter(b => b.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

  const handleTrigger = async () => {
    try {
      await triggerBackup.mutateAsync({ type: backupType });
      toast.show("Backup triggered successfully", "success");
      setModalOpen(false);
      setBackupType("full");
    } catch {
      toast.show("Failed to trigger backup", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBackup.mutateAsync(id);
      toast.show("Backup record deleted", "success");
    } catch {
      toast.show("Failed to delete backup", "error");
    }
  };

  if (!isSA) {
    return (
      <AppEmptyState
        icon={<IconDatabaseExport size={22} />}
        message="Access Restricted"
        sub="This page is only accessible to Super Admins."
      />
    );
  }

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Backup & Recovery"
        sub="Automated database backups and restore points"
        action={
          <Button leftSection={<IconCloudUpload size={14} />} onClick={() => setModalOpen(true)}>
            Trigger Backup
          </Button>
        }
        onRefresh={refetch}
      />

      {/* Stats */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {[
          { label: "Total Backups", value: summary.total  ?? total,     color: "blue"  },
          { label: "Completed",     value: summary.completed ?? completed, color: "green" },
          { label: "Failed",        value: summary.failed ?? failed,      color: "red"   },
          { label: "Last Backup",   value: timeAgo(lastBackup?.completedAt), color: "gray" },
        ].map(s => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase">{s.label}</Text>
            <Text fw={800} size="xl" c={s.color}>{s.value}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Table */}
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Triggered By</Table.Th>
                <Table.Th>Started At</Table.Th>
                <Table.Th>Completed At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Center py="xl"><Loader size="sm" /></Center>
                  </Table.Td>
                </Table.Tr>
              ) : backups.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <AppEmptyState
                      icon={<IconDatabaseExport size={20} />}
                      message="No backups found"
                      sub="Trigger a backup to get started."
                    />
                  </Table.Td>
                </Table.Tr>
              ) : backups.map(b => (
                <Table.Tr key={b.id}>
                  <Table.Td>
                    <Text size="sm" ff="monospace" c="dimmed">#{b.id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={TYPE_COLOR[b.type] ?? "gray"} tt="capitalize">
                      {b.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={STATUS_COLOR[b.status] ?? "gray"}>
                      {b.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{b.size ?? "—"}</Text>
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 220 }}>
                    {b.location ? (
                      <Text size="xs" ff="monospace" c="blue" truncate title={b.location}>
                        {b.location}
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{b.triggeredBy}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{fmtDateTime(b.startedAt)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{fmtDateTime(b.completedAt)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {b.status !== "Running" ? (
                      <Tooltip label="Delete record">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(b.id)}
                          loading={deleteBackup.isPending}
                        >
                          <IconTrash size={13} />
                        </ActionIcon>
                      </Tooltip>
                    ) : (
                      <Tooltip label="Running…">
                        <ActionIcon size="sm" variant="subtle" color="blue" disabled>
                          <IconRefresh size={13} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Trigger Backup Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Trigger New Backup"
        size="sm"
        radius="lg"
      >
        <Stack gap="md">
          <Select
            label="Backup Type"
            value={backupType}
            onChange={v => setBackupType(v)}
            data={[
              { value: "full",        label: "Full"        },
              { value: "incremental", label: "Incremental" },
              { value: "schema",      label: "Schema"      },
            ]}
            radius="md"
            description="Full captures entire DB; Incremental captures changes; Schema captures structure only."
          />
          <Text size="sm" c="dimmed">
            This will start a <strong>{backupType}</strong> backup immediately. The process runs in the background.
          </Text>
          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              leftSection={<IconCloudUpload size={14} />}
              onClick={handleTrigger}
              loading={triggerBackup.isPending}
            >
              Confirm &amp; Trigger
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
