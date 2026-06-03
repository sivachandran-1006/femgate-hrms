import { Button } from "@mantine/core";

export const AppButton = ({
  children,
  variant = "filled",
  color   = "primary",
  size    = "sm",
  radius  = "md",
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      radius={radius}
      {...props}
    >
      {children}
    </Button>
  );
};
