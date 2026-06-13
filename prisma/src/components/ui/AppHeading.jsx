import { Title, Text, Stack } from "@mantine/core";

/**
 * AppHeading — page / section / card titles
 * level: 1 | 2 | 3 | 4
 */
export const AppHeading = ({
  children,
  sub,          // optional subtitle below
  level = 2,
  size,
  fw,
  ...props
}) => {
  const SIZES = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" };
  const order = Math.min(Math.max(level, 1), 4);

  if (sub) {
    return (
      <Stack gap={2} {...props}>
        <Title order={order} size={size} fw={fw ?? 700}>{children}</Title>
        <Text size="sm" c="dimmed">{sub}</Text>
      </Stack>
    );
  }

  return (
    <Title order={order} size={size} fw={fw ?? 700} {...props}>
      {children}
    </Title>
  );
};
