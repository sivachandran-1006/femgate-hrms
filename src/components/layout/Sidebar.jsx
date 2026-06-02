import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { ScrollArea } from "@mantine/core";
import {
  IconLayoutDashboard, IconUsers, IconBuildingCommunity,
  IconClock, IconCalendarOff, IconCalendar, IconCurrencyRupee,
  IconBriefcase, IconUserPlus, IconTarget, IconPackage,
  IconLifebuoy, IconBook, IconChartBar, IconSettings,
  IconLogout, IconHierarchy, IconRotateClockwise, IconFolder,
  IconDoorExit, IconX, IconMenu2,
} from "@tabler/icons-react";
import { ROLE_SIDEBAR, ROLE_LABELS, ROLE_COLORS } from "../../constants/permissions";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { RADIUS } from "../../theme/sizes";

const ICON_MAP = {
  IconLayoutDashboard, IconUsers, IconBuildingCommunity,
  IconClock, IconCalendarOff, IconCalendar, IconCurrencyRupee,
  IconBriefcase, IconUserPlus, IconTarget, IconPackage,
  IconLifebuoy, IconBook, IconChartBar, IconSettings,
  IconHierarchy, IconRotateClockwise, IconFolder, IconDoorExit,
};

const Sidebar = ({ onLogout, user, userRole, onCloseMobile, collapsed, onToggleCollapse, dark = false }) => {
  const location  = useLocation();
  const menuItems = ROLE_SIDEBAR[userRole] || ROLE_SIDEBAR["EMPLOYEE"];
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const roleColor = ROLE_COLORS[userRole] || { bg: "#f1f5f9", text: "#475569" };

  const surface = dark
    ? { bg: "#1e293b", border: "#334155", text: "#f1f5f9", subtext: "#94a3b8", hover: "#0f172a", activeBg: "#1d4ed820", activeText: "#60a5fa" }
    : { bg: "#ffffff",  border: "#e2e8f0", text: "#0f172a",  subtext: "#64748b", hover: "#f1f5f9", activeBg: "#eff6ff",    activeText: "#2563eb"  };

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "100%",
      background:    surface.bg,
      borderRight:   `1px solid ${surface.border}`,
      overflow:      "hidden",
    }}>

      {/* ── User Profile row + collapse toggle ── */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding:        collapsed ? "13px 0" : "12px 10px 12px 14px",
        borderBottom:   `1px solid ${surface.border}`,
        flexShrink:     0,
        gap:            8,
      }}>
        {/* Avatar + name/role */}
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        10,
          minWidth:   0,
          flex:       collapsed ? "none" : 1,
        }}>
          <div style={{
            width:          38,
            height:         38,
            borderRadius:   RADIUS.full,
            background:     COLORS.primaryMuted,
            color:          COLORS.primary,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       FONT_SIZE.xs,
            fontWeight:     FONT_WEIGHT.bold,
            flexShrink:     0,
            border:         `2px solid ${COLORS.primaryLight}`,
          }}>
            {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p style={{
                margin:       0,
                fontSize:     FONT_SIZE.sm,
                fontWeight:   FONT_WEIGHT.semibold,
                color:        surface.text,
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
                maxWidth:     140,
              }}>
                {user?.name}
              </p>
              <span style={{
                display:      "inline-block",
                fontSize:     "0.62rem",
                fontWeight:   FONT_WEIGHT.semibold,
                padding:      "2px 8px",
                borderRadius: RADIUS.full,
                background:   roleColor.bg,
                color:        roleColor.text,
                marginTop:    3,
                whiteSpace:   "nowrap",
              }}>
                {roleLabel}
              </span>
            </div>
          )}
        </div>

        {/* ✕ / ☰ toggle button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Open sidebar" : "Close sidebar"}
            style={{
              width:          32,
              height:         32,
              borderRadius:   RADIUS.md,
              border:         `1px solid ${surface.border}`,
              background:     "transparent",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
              flexShrink:     0,
              transition:     "background 0.15s",
              padding:        0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = surface.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {collapsed
              ? <IconMenu2 size={16} stroke={2}   color={surface.subtext} />
              : <IconX     size={16} stroke={2.5} color={surface.subtext} />
            }
          </button>
        )}
      </div>

      {/* ── Nav Items ── */}
      <ScrollArea style={{ flex: 1 }} type="never">
        <div style={{ padding: "6px 6px 4px" }}>
          {menuItems.map(({ id, label, icon }) => {
            const Icon   = ICON_MAP[icon];
            const path   = `/${id}`;
            const active = location.pathname === path;

            return (
              <RouterNavLink
                key={id}
                to={path}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                style={{ textDecoration: "none", display: "block", marginBottom: 1 }}
              >
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            10,
                    padding:        collapsed ? "10px 0" : "8px 10px",
                    borderRadius:   RADIUS.lg,
                    background:     active ? surface.activeBg : "transparent",
                    fontWeight:     active ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
                    fontSize:       FONT_SIZE.sm,
                    cursor:         "pointer",
                    transition:     "background 0.13s ease",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderLeft:     active ? `3px solid ${COLORS.primary}` : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = surface.hover; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      stroke={active ? 2.2 : 1.7}
                      color={active ? COLORS.primary : surface.subtext}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  {!collapsed && (
                    <span style={{
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                      color:        active ? surface.activeText : surface.subtext,
                    }}>
                      {label}
                    </span>
                  )}
                </div>
              </RouterNavLink>
            );
          })}
        </div>
      </ScrollArea>

      {/* ── Logout ── */}
      <div style={{ padding: "6px", borderTop: `1px solid ${surface.border}`, flexShrink: 0 }}>
        <button
          onClick={() => { onLogout(); if (onCloseMobile) onCloseMobile(); }}
          title={collapsed ? "Logout" : undefined}
          style={{
            width:          "100%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap:            10,
            padding:        collapsed ? "9px 0" : "9px 10px",
            borderRadius:   RADIUS.lg,
            border:         "none",
            background:     "transparent",
            color:          COLORS.danger,
            fontSize:       FONT_SIZE.sm,
            fontWeight:     FONT_WEIGHT.medium,
            cursor:         "pointer",
            transition:     "background 0.13s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconLogout size={18} stroke={1.8} color={COLORS.danger} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
