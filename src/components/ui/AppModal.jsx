import { Modal, Text, Group, Box } from "@mantine/core";

export const AppModal = ({
  opened,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  radius = "lg",
  icon,
  iconColor,
  ...props
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={size}
      radius={radius}
      padding="xl"
      title={
        <Group gap="sm" wrap="nowrap">
          {icon && (
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: (iconColor || "#3b82f6") + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Text fw={700} size="md" lh={1.2}>
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed" mt={2}>
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
      }
      styles={{
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          paddingBottom: 16,
          marginBottom: 0,
        },
        body: { paddingTop: 20 },
        content: { overflow: "hidden" },
      }}
      {...props}
    >
      {children}
    </Modal>
  );
};
