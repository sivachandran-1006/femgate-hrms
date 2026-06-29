import { Group, Stack, Title, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

/**
 * AppPageHeader — standard top section for every screen
 *
 * Usage:
 *   <AppPageHeader
 *     title="Employees"
 *     sub="Manage all employees across departments"
 *     action={<Button>Add Employee</Button>}
 *     secondaryAction={<Button variant="default">Import</Button>}
 *     onRefresh={() => refetch()}
 *   />
 */
export const AppPageHeader = ({
  title,
  sub,
  action,           // primary right-side button / element
  secondaryAction,  // secondary button shown left of primary
  onRefresh,        // if provided, shows a refresh icon button
  mb = "lg",
  ...props
}) => {
  return (
    <Group justify="space-between" align="flex-start" mb={mb} wrap="wrap" gap="md" {...props}>
      <Stack gap={2}>
        <Title order={1} size="h2" fw={700} lh={1.2}>{title}</Title>
        {sub && <Text size="sm" c="dimmed">{sub}</Text>}
      </Stack>

      <Group gap="sm" wrap="nowrap" align="center">
        {onRefresh && (
          <Tooltip label="Refresh" withArrow>
            <ActionIcon variant="default" size="lg" radius="md" onClick={onRefresh} aria-label="Refresh">
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
        {secondaryAction}
        {action}
      </Group>
    </Group>
  );
};
