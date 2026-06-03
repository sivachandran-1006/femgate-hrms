import { Text } from "@mantine/core";

/**
 * AppText — standard body text with semantic variants
 * variant: "body" | "label" | "caption" | "meta" | "subtext" | "helper"
 */
export const AppText = ({
  children,
  variant  = "body",
  size,
  fw,
  c,
  truncate,
  ...props
}) => {
  const VARIANTS = {
    body:    { size: "sm",  fw: 400, c: "dark.7"   },
    label:   { size: "sm",  fw: 600, c: "dark.7"   },
    caption: { size: "xs",  fw: 400, c: "dimmed"   },
    meta:    { size: "xs",  fw: 500, c: "dimmed"   },
    subtext: { size: "xs",  fw: 400, c: "gray.5"   },
    helper:  { size: "xs",  fw: 500, c: "blue.6"   },
  };

  const v = VARIANTS[variant] || VARIANTS.body;

  return (
    <Text
      size={size   ?? v.size}
      fw={fw       ?? v.fw}
      c={c         ?? v.c}
      truncate={truncate}
      {...props}
    >
      {children}
    </Text>
  );
};
