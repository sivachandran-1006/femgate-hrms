import { createTheme } from "@mantine/core";
import { colors } from "./colors";
import { fonts } from "./fonts";
import { spacing } from "./spacing";

export const theme = createTheme({
  fontFamily: fonts.fontFamily,
  headings: fonts.headings,
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
  },
  primaryColor: "primary",
  primaryShade: 6,
  spacing: spacing,
  white: "#ffffff",
  black: "#0f172a",
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: 20,
      },
    },
    Modal: {
      defaultProps: {
        radius: 16,
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: "sm",
        horizontalSpacing: "md",
        striped: false,
      },
    },
  },
});
