import { Stack, Text, ThemeIcon } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

/**
 * AppEmptyState — shown when table/list has no records
 */
export const AppEmptyState = ({
  icon,
  message  = "No records found",
  sub,
  action,
  py       = 48,
}) => {
  return (
    <Stack align="center" justify="center" py={py} gap="xs">
      <ThemeIcon size={48} variant="light" color="gray" radius="xl">
        {icon || <IconInbox size={24} />}
      </ThemeIcon>
      <Text fw={600} c="dark.5" ta="center">{message}</Text>
      {sub    && <Text size="sm" c="dimmed" ta="center">{sub}</Text>}
      {action && action}
    </Stack>
  );
};
