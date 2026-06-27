import { useState } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { ScrollArea } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconClock,
  IconCalendarOff,
  IconCalendar,
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
  IconHierarchy,
  IconRotateClockwise,
  IconFolder,
  IconDoorExit,
  IconX,
  IconMenu2,
  IconUser,
  IconSun,
  IconMoon,
  IconUserCog,
  IconShieldLock,
  IconClipboardList,
  IconShield,
  IconPlug,
  IconCreditCard,
  IconBuildingFactory,
  IconReportAnalytics,
  IconBell,
  IconBuildingCog,
  IconCalendarEvent,
  IconReceipt,
  IconSpeakerphone,
  IconUserCheck,
  IconBuilding,
  IconCircleCheck,
  IconUsersGroup,
  IconSitemap,
  IconMessage,
  IconHeartHandshake,
  IconShieldCheck,
  IconBuildingArch,
  IconCalendarTime,
  IconShieldHeart,
  IconReportMoney,
  IconPalette,
} from "@tabler/icons-react";
import { ROLE_SIDEBAR, SIDEBAR_SECTIONS, SIDEBAR_TOP } from "../../constants/permissions";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { RADIUS } from "../../theme/sizes";

const ICON_MAP = {
  IconLayoutDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconClock,
  IconCalendarOff,
  IconCalendar,
  IconCurrencyRupee,
  IconBriefcase,
  IconUserPlus,
  IconTarget,
  IconPackage,
  IconLifebuoy,
  IconBook,
  IconChartBar,
  IconSettings,
  IconHierarchy,
  IconRotateClockwise,
  IconFolder,
  IconDoorExit,
  IconUser,
  IconUserCog,
  IconShieldLock,
  IconClipboardList,
  IconShield,
  IconPlug,
  IconCreditCard,
  IconBuildingFactory,
  IconReportAnalytics,
  IconBell,
  IconBuildingCog,
  IconCalendarEvent,
  IconReceipt,
  IconSpeakerphone,
  IconUserCheck,
  IconBuilding,
  IconCircleCheck,
  IconUsersGroup,
  IconSitemap,
  IconMessage,
  IconHeartHandshake,
  IconShieldCheck,
  IconBuildingArch,
  IconCalendarTime,
  IconShieldHeart,
  IconReportMoney,
  IconPalette,
};

const Sidebar = ({
  onLogout,
  userRole,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
  dark = false,
  onToggleDark,
}) => {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuItems = ROLE_SIDEBAR[userRole] || ROLE_SIDEBAR["EMPLOYEE"];
  // Map of allowed item id → item, used to render doc-ordered grouped sections
  const itemById = Object.fromEntries(menuItems.map((m) => [m.id, m]));
  const topItems = SIDEBAR_TOP.map((id) => itemById[id]).filter(Boolean);
  const groupedSections = SIDEBAR_SECTIONS
    .map((sec) => ({ title: sec.title, items: sec.items.map((id) => itemById[id]).filter(Boolean) }))
    .filter((sec) => sec.items.length > 0);
  // Any allowed item not in TOP and not in any section → catch-all "OTHER" group (keeps nothing hidden)
  const placed = new Set([...SIDEBAR_TOP, ...SIDEBAR_SECTIONS.flatMap((s) => s.items)]);
  const otherItems = menuItems.filter((m) => !placed.has(m.id));

  const surface = dark
    ? {
        bg: "#1e293b",
        border: "#334155",
        text: "#f1f5f9",
        subtext: "#94a3b8",
        hover: "#0f172a",
        activeBg: "#1d4ed820",
        activeText: "#60a5fa",
      }
    : {
        bg: "#ffffff",
        border: "#e2e8f0",
        text: "#0f172a",
        subtext: "#64748b",
        hover: "#f1f5f9",
        activeBg: "#eff6ff",
        activeText: "#2563eb",
      };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: surface.bg,
        borderRight: `1px solid ${surface.border}`,
        overflow: "hidden",
      }}
    >
      {/* ── Brand + collapse toggle ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "14px 0" : "0 10px 0 16px",
          height: 60,
          borderBottom: `1px solid ${surface.border}`,
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, color: "#fff",
            }}>
              MG
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: surface.text, letterSpacing: "-0.3px", lineHeight: 1.1 }}>MGate</div>
              <div style={{ fontSize: 9, color: surface.subtext, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>HRMS</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#fff",
          }}>
            MG
          </div>
        )}
        {onToggleCollapse && !collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${surface.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = surface.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <IconX size={14} stroke={2} color={surface.subtext} />
          </button>
        )}
        {onToggleCollapse && collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{ position: "absolute", bottom: 80, right: -10, width: 20, height: 20, borderRadius: "50%", border: `1px solid ${surface.border}`, background: surface.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}
          >
            <IconMenu2 size={11} stroke={2} color={surface.subtext} />
          </button>
        )}
      </div>

      {/* ── Nav Items (grouped into enterprise sections) ── */}
      <ScrollArea style={{ flex: 1 }} type="never">
        <div style={{ padding: "6px 6px 4px" }}>
          {(() => {
            const renderItem = ({ id, label, icon }) => {
              const Icon = ICON_MAP[icon];
              const path = `/${id}`;
              const active = location.pathname === path;
              return (
                <RouterNavLink
                  key={id}
                  to={path}
                  onClick={onCloseMobile}
                  title={collapsed ? label : undefined}
                  aria-label={label}
                  style={{ textDecoration: "none", display: "block", marginBottom: 1 }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: collapsed ? "10px 0" : "8px 10px",
                      borderRadius: RADIUS.lg,
                      background: active ? surface.activeBg : "transparent",
                      fontWeight: active ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
                      fontSize: FONT_SIZE.sm, cursor: "pointer",
                      transition: "background 0.13s ease",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderLeft: active ? `3px solid ${COLORS.primary}` : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = surface.hover; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    {Icon && <Icon size={18} stroke={active ? 2.2 : 1.7} color={active ? COLORS.primary : surface.subtext} style={{ flexShrink: 0 }} />}
                    {!collapsed && (
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: active ? surface.activeText : surface.subtext }}>
                        {label}
                      </span>
                    )}
                  </div>
                </RouterNavLink>
              );
            };

            const SectionHeader = ({ title }) => collapsed
              ? <div style={{ height: 1, background: surface.border, margin: "8px 8px" }} />
              : <div style={{ fontSize: 11, fontWeight: 600, color: surface.subtext, letterSpacing: "0.07em", textTransform: "uppercase", padding: "12px 12px 4px" }}>{title}</div>;

            return (
              <>
                {/* Top pinned items (Dashboard, AI Assistant) */}
                {topItems.map(renderItem)}

                {/* Grouped sections */}
                {groupedSections.map((sec) => (
                  <div key={sec.title}>
                    <SectionHeader title={sec.title} />
                    {sec.items.map(renderItem)}
                  </div>
                ))}

                {/* Catch-all for any allowed item not assigned to a section */}
                {otherItems.length > 0 && (
                  <div>
                    <SectionHeader title="OTHER" />
                    {otherItems.map(renderItem)}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </ScrollArea>

      {/* ── Dark mode + Logout ── */}
      <div
        style={{
          padding: "6px",
          borderTop: `1px solid ${surface.border}`,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Dark mode toggle */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            title={collapsed ? (dark ? "Light mode" : "Dark mode") : undefined}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 10,
              padding: collapsed ? "9px 0" : "9px 10px",
              borderRadius: RADIUS.lg,
              border: "none",
              background: "transparent",
              color: surface.subtext,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.medium,
              cursor: "pointer",
              transition: "background 0.13s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = surface.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {dark
              ? <IconSun  size={18} stroke={1.8} color={surface.subtext} style={{ flexShrink: 0 }} />
              : <IconMoon size={18} stroke={1.8} color={surface.subtext} style={{ flexShrink: 0 }} />
            }
            {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        )}

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          title={collapsed ? "Logout" : undefined}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: collapsed ? "9px 0" : "9px 10px",
            borderRadius: RADIUS.lg,
            border: "none",
            background: "transparent",
            color: COLORS.danger,
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.medium,
            cursor: "pointer",
            transition: "background 0.13s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconLogout size={18} stroke={1.8} color={COLORS.danger} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* ── Logout Confirm Modal ── */}
      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: dark ? COLORS.dark.cardBg : COLORS.surfaceLight,
              borderRadius: RADIUS["2xl"],
              border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              width: "100%",
              maxWidth: 380,
              padding: 28,
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.full,
                background: COLORS.dangerMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <IconLogout size={26} stroke={1.8} color={COLORS.danger} />
            </div>

            {/* Text */}
            <p
              style={{
                margin: 0,
                fontSize: FONT_SIZE.lg,
                fontWeight: FONT_WEIGHT.bold,
                color: dark ? COLORS.dark.text : COLORS.textLight,
              }}
            >
              Logout
            </p>
            <p
              style={{
                margin: "8px 0 24px",
                fontSize: FONT_SIZE.sm,
                color: dark ? COLORS.dark.subtext : COLORS.textMutedLight,
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to logout?
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: RADIUS.lg,
                  border: `1px solid ${dark ? COLORS.dark.border : COLORS.borderLight}`,
                  background: "transparent",
                  color: dark ? COLORS.dark.text : COLORS.textLight,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = dark
                    ? COLORS.dark.border
                    : COLORS.gray200)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onCloseMobile) onCloseMobile();
                  onLogout();
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: RADIUS.lg,
                  border: "none",
                  background: COLORS.danger,
                  color: COLORS.white,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.semibold,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
