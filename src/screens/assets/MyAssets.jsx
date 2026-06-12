import { useState } from "react";
import {
  IconPackage, IconDeviceLaptop, IconDeviceDesktop, IconMouse,
  IconAlertTriangle, IconRotateClockwise, IconCheck,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, Stack, Text, Badge, Avatar,
  Paper, Box, ThemeIcon,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";

import { useToast }       from "../../components/ui/Toast";
import { useMyAssets }    from "../../queries/useSelfService";
import { COLORS }         from "../../theme/colors";

const STATUS_MAP = { InUse: "Active", Maintenance: "Under Repair", Disposed: "Returned", Available: "Active" };

const mapApiAsset = (a) => ({
  id:           a.assetId,
  name:         a.name,
  type:         a.category,
  serial:       a.serialNumber || "—",
  assignedDate: a.assignedAt ? a.assignedAt.split("T")[0] : "—",
  status:       STATUS_MAP[a.status] || a.status,
  condition:    a.status === "Maintenance" ? "Damaged" : "Good",
});

const TYPE_ICON = {
  Laptop:    IconDeviceLaptop,
  Phone:     IconDeviceDesktop,
  Mobile:    IconDeviceDesktop,
  Keyboard:  IconMouse,
  Accessory: IconMouse,
  Monitor:   IconPackage,
};

const STATUS_COLOR = {
  Active:         "green",
  "Under Repair": "yellow",
  Returned:       "gray",
};

const MyAssets = () => {
  const { show } = useToast();
  const [reportId,   setReportId]   = useState(null);
  const [returnId,   setReturnId]   = useState(null);
  const [reportNote, setReportNote] = useState("");
  const [submitted,  setSubmitted]  = useState({});

  const { data: assetsRaw = [] } = useMyAssets();
  const MY_ASSETS = assetsRaw.map(mapApiAsset);

  const handleReport = (id) => {
    const name = MY_ASSETS.find((a) => a.id === id)?.name || "Asset";
    setSubmitted((p) => ({ ...p, [id]: "reported" }));
    setReportId(null);
    setReportNote("");
    show(`Issue reported for "${name}" — IT team notified`, "warning");
  };

  const handleReturn = (id) => {
    const name = MY_ASSETS.find((a) => a.id === id)?.name || "Asset";
    setSubmitted((p) => ({ ...p, [id]: "return-requested" }));
    setReturnId(null);
    show(`Return request submitted for "${name}"`, "info");
  };

  return (
    <>
      <AppPageHeader
        title="My Assets"
        sub="Assets assigned to you by the organisation"
      />

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <AppStatCard
          icon={<IconPackage size={22} />}
          label="Total Assigned"
          value={MY_ASSETS.length}
          color="blue"
        />
        <AppStatCard
          icon={<IconPackage size={22} />}
          label="Active"
          value={MY_ASSETS.filter((a) => a.status === "Active").length}
          color="green"
        />
        <AppStatCard
          icon={<IconPackage size={22} />}
          label="Under Repair"
          value={MY_ASSETS.filter((a) => a.status === "Under Repair").length}
          color="yellow"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} gap="md">
        {MY_ASSETS.map((asset) => {
          const Icon = TYPE_ICON[asset.type] || IconPackage;
          const sub  = submitted[asset.id];
          return (
            <Paper key={asset.id} withBorder radius="xl" p="md">
              <Group justify="space-between" mb="md" align="flex-start" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={44} color="blue" variant="light" radius="xl">
                    <Icon size={22} stroke={1.8} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700}>{asset.name}</Text>
                    <Text size="xs" c="dimmed">{asset.type}</Text>
                  </Box>
                </Group>
                <Badge color={STATUS_COLOR[asset.status] || "gray"} variant="light" radius="xl" size="sm" style={{ flexShrink: 0 }}>
                  {asset.status}
                </Badge>
              </Group>

              <Stack gap={5} mb="md">
                {[
                  { label: "Asset ID",   value: asset.id           },
                  { label: "Serial No.", value: asset.serial       },
                  { label: "Assigned",   value: asset.assignedDate },
                  { label: "Condition",  value: asset.condition    },
                ].map((r) => (
                  <Group key={r.label} justify="space-between" wrap="nowrap">
                    <Text size="xs" c="dimmed">{r.label}</Text>
                    <Text size="xs" fw={600}>{r.value}</Text>
                  </Group>
                ))}
              </Stack>

              {sub ? (
                <Group gap="xs" p="xs" style={{ background: "var(--mantine-color-green-0)", borderRadius: 8, border: "1px solid var(--mantine-color-green-2)" }}>
                  <IconCheck size={14} color={COLORS.success} stroke={2.5} />
                  <Text size="xs" fw={600} c="green">
                    {sub === "reported" ? "Issue reported to IT team" : "Return request submitted"}
                  </Text>
                </Group>
              ) : (
                <Group gap="xs" grow>
                  <AppButton
                    variant="light"
                    color="yellow"
                    size="xs"
                    leftSection={<IconAlertTriangle size={13} />}
                    onClick={() => setReportId(asset.id)}
                  >
                    Report Issue
                  </AppButton>
                  <AppButton
                    variant="default"
                    size="xs"
                    leftSection={<IconRotateClockwise size={13} />}
                    onClick={() => setReturnId(asset.id)}
                  >
                    Request Return
                  </AppButton>
                </Group>
              )}
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Report Issue Modal */}
      <AppModal
        opened={!!reportId}
        onClose={() => setReportId(null)}
        title="Report Asset Issue"
        icon={<IconAlertTriangle size={16} color={COLORS.warning} />}
        iconColor={COLORS.warning}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Describe the issue with{" "}
            <Text span fw={600} c="dark">{MY_ASSETS.find((a) => a.id === reportId)?.name}</Text>
          </Text>
          <AppInput
            type="textarea"
            placeholder="Describe the issue..."
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            minRows={3}
          />
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setReportId(null)}>Cancel</AppButton>
            <AppButton color="yellow" onClick={() => handleReport(reportId)}>Submit Report</AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* Return Modal */}
      <AppModal
        opened={!!returnId}
        onClose={() => setReturnId(null)}
        title="Request Asset Return"
        icon={<IconRotateClockwise size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Submit a return request for{" "}
            <Text span fw={600} c="dark">{MY_ASSETS.find((a) => a.id === returnId)?.name}</Text>
            . IT team will schedule a pickup.
          </Text>
          <Group justify="flex-end" gap="sm">
            <AppButton variant="default" onClick={() => setReturnId(null)}>Cancel</AppButton>
            <AppButton onClick={() => handleReturn(returnId)}>Confirm Return</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
};

export default MyAssets;
