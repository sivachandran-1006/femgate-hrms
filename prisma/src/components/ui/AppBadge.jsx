import { Badge, Group } from "@mantine/core";

/**
 * AppBadge — status / category / type badges
 * Accepts Mantine color or custom { bg, color } style object
 */
export const AppBadge = ({
  children,
  color   = "blue",
  variant = "light",
  size    = "sm",
  radius  = "xl",
  dot     = false,   // show a leading dot
  style,
  bg,                // custom bg override
  textColor,         // custom text color override
  ...props
}) => {
  if (bg || textColor) {
    return (
      <span style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          dot ? 5 : 0,
        padding:      size === "xs" ? "2px 8px" : "3px 10px",
        borderRadius: 999,
        background:   bg,
        color:        textColor,
        fontSize:     size === "xs" ? "0.7rem" : "0.75rem",
        fontWeight:   600,
        whiteSpace:   "nowrap",
        lineHeight:   1.5,
        ...style,
      }}
        {...props}
      >
        {dot && <span style={{ width:6, height:6, borderRadius:"50%", background:textColor, flexShrink:0 }} />}
        {children}
      </span>
    );
  }

  return (
    <Badge
      color={color}
      variant={variant}
      size={size}
      radius={radius}
      style={style}
      {...props}
    >
      {dot ? (
        <Group gap={5} align="center" wrap="nowrap">
          <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", display:"inline-block", flexShrink:0 }} />
          {children}
        </Group>
      ) : children}
    </Badge>
  );
};
