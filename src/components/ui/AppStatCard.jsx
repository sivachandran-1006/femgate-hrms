import { Paper, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

/**
 * AppStatCard — KPI summary card used across all dashboards
 * <AppStatCard icon={<IconUsers/>} label="Total" value={13} sub="4 depts" color="blue" trend="+3%" up />
 */
export const AppStatCard = ({
  icon,
  label,
  value,
  sub,
  color   = "blue",
  trend,
  up,
  ...props
}) => {
  return (
    <Paper withBorder radius="xl" p="md" {...props}>
      <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
        <ThemeIcon color={color} variant="light" size={44} radius="xl">
          {icon}
        </ThemeIcon>
        {trend && (
          <Group gap={3} wrap="nowrap">
            {up
              ? <IconArrowUpRight   size={14} color="var(--mantine-color-green-6)" />
              : <IconArrowDownRight size={14} color="var(--mantine-color-red-6)"   />
            }
            <Text size="xs" fw={600} c={up ? "green" : "red"}>{trend}</Text>
          </Group>
        )}
      </Group>
      <Text size="xl" fw={800} lh={1} mt={4}>{value}</Text>
      <Text size="xs" fw={600} c="dark.7" mt={4}>{label}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Paper>
  );
};
