import { Card } from "@mantine/core";
import { SHADOWS } from "../../constants/theme";

export const AppCard = ({ children, shadow = "card", ...props }) => {
  return (
    <Card shadow={shadow === "card" ? SHADOWS.card : shadow} padding="lg" withBorder {...props}>
      {children}
    </Card>
  );
};
