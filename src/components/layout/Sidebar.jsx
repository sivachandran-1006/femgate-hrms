import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { NavLink, Stack, ScrollArea, Divider, Avatar, Text, Box } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconClock,
  IconCalendarOff,
  IconCurrencyRupee,
  IconBriefcase,
  IconUserPlus,
  IconTarget,
  IconPackage,
  IconLifebuoy,
  IconBook,
  IconChartBar,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { ROLE_SIDEBAR, ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";

const ICON_MAP = {
  IconLayoutDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconClock,
  IconCalendarOff,
  IconCurrencyRupee,
  IconBriefcase,
  IconUserPlus,
  IconTarget,
  IconPackage,
  IconLifebuoy,
  IconBook,
  IconChartBar,
  IconSettings,
};

const Sidebar = ({ onLogout, user, userRole, onCloseMobile }) => {
  const location = useLocation();
  const menuItems = ROLE_SIDEBAR[userRole] || ROLE_SIDEBAR["EMPLOYEE"];
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const roleColor = ROLE_COLORS[userRole] || { bg: "#f1f5f9", text: "#475569" };

  return (
    <>
      {/* User info section */}
      {user && (
        <Box mb="md" px={4}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <Avatar
              size={38}
              radius="xl"
              color="primary"
              style={{ flexShrink: 0 }}
            >
              {user.avatar || user.name?.slice(0, 2).toUpperCase()}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {user.name}
              </Text>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: roleColor.bg,
                  color: roleColor.text,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </Box>
      )}

      <Divider mb="sm" />

      {/* Navigation items */}
      <ScrollArea style={{ flex: 1 }} type="never">
        <Stack gap="xs">
          {menuItems.map(({ id, label, icon }) => {
            const Icon = ICON_MAP[icon];
            const path = `/${id}`;
            const active = location.pathname === path;
            return (
              <NavLink
                key={id}
                component={RouterNavLink}
                to={path}
                label={label}
                leftSection={Icon ? <Icon size={20} stroke={1.5} /> : null}
                active={active}
                variant="filled"
                color="primary"
                onClick={onCloseMobile}
                style={{ borderRadius: 8 }}
              />
            );
          })}
        </Stack>
      </ScrollArea>

      <Divider my="sm" />

      {/* Logout */}
      <NavLink
        label="Logout"
        leftSection={<IconLogout size={20} stroke={1.5} />}
        onClick={() => {
          onLogout();
          if (onCloseMobile) onCloseMobile();
        }}
        color="red"
        active
        variant="subtle"
        style={{ borderRadius: 8 }}
      />
    </>
  );
};

export default Sidebar;
