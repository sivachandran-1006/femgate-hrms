import { Loader, Center } from "@mantine/core";

export const AppLoader = ({ fullScreen = false, ...props }) => {
  if (fullScreen) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader color="primary" {...props} />
      </Center>
    );
  }
  return <Loader color="primary" {...props} />;
};
