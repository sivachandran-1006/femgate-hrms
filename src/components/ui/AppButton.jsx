import { Button } from "@mantine/core";

export const AppButton = ({ children, variant = "filled", color = "primary", ...props }) => {
  return (
    <Button variant={variant} color={color} {...props}>
      {children}
    </Button>
  );
};
