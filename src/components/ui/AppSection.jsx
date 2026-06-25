import { Paper, Group, Title, Text, Stack } from "@mantine/core";

/**
 * AppSection — card container with optional title header
 * <AppSection title="Leave Balance" sub="current year" action={...}>...</AppSection>
 */
export const AppSection = ({
  children,
  title,
  sub,
  action,
  icon,
  noPadding = false,
  radius    = "xl",
  withBorder = true,
  mb,
  ...props
}) => {
  const hasHeader = title || action;

  return (
    <Paper
      withBorder={withBorder}
      radius={radius}
      p={noPadding ? 0 : "md"}
      mb={mb}
      style={{ overflow: "hidden" }}
      {...props}
    >
      {hasHeader && (
        <Group
          justify="space-between"
          align="flex-start"
          mb={noPadding ? 0 : "md"}
          pb={noPadding ? "md" : undefined}
          px={noPadding ? "md" : undefined}
          pt={noPadding ? "md" : undefined}
          style={noPadding ? { borderBottom: "1px solid var(--mantine-color-gray-2)" } : undefined}
          wrap="nowrap"
        >
          <Group gap="sm" wrap="nowrap">
            {icon}
            <Stack gap={1}>
              <Title order={3} size="h4" fw={700}>{title}</Title>
              {sub && <Text size="xs" c="dimmed">{sub}</Text>}
            </Stack>
          </Group>
          {action}
        </Group>
      )}
      {children}
    </Paper>
  );
};
