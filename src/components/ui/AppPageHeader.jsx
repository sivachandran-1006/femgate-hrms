import { Group, Stack, Title, Text } from "@mantine/core";

/**
 * AppPageHeader — top of every screen
 * <AppPageHeader title="Employees" sub="13 team members" action={<AppButton>Add</AppButton>} />
 */
export const AppPageHeader = ({
  title,
  sub,
  action,      // right-side button / element
  mb = "lg",
  ...props
}) => {
  return (
    <Group justify="space-between" align="flex-start" mb={mb} wrap="wrap" gap="md" {...props}>
      <Stack gap={2}>
        <Title order={1} size="h2" fw={700} lh={1.2}>{title}</Title>
        {sub && <Text size="sm" c="dimmed">{sub}</Text>}
      </Stack>
      {action && (
        <Group gap="sm" wrap="nowrap">
          {action}
        </Group>
      )}
    </Group>
  );
};
