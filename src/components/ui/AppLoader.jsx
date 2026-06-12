import { Loader, Center, Stack, Text } from "@mantine/core";

export const AppLoader = ({ fullScreen = false, label, size = "md", ...props }) => {
  const content = (
    <Stack align="center" gap="sm">
      <Loader color="primary" size={size} type="dots" {...props} />
      {label && (
        <Text size="sm" c="dimmed" fw={500}>{label}</Text>
      )}
    </Stack>
  );

  if (fullScreen) {
    return (
      <Center style={{ height: "100vh", width: "100%" }}>
        {content}
      </Center>
    );
  }

  return content;
};
