import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, ThemeIcon } from "@mantine/core";
import {
  IconSearch, IconLayoutDashboard, IconUsers, IconClock, IconCalendarOff,
  IconCurrencyRupee, IconFolder, IconPackage, IconLifebuoy, IconChartBar,
  IconSettings, IconBriefcase, IconUserPlus, IconTarget, IconBook,
  IconBuildingCommunity, IconHierarchy, IconCalendar, IconDoorExit,
  IconRotateClockwise, IconUser, IconArrowRight,
  IconUserCircle, IconCalendarEvent, IconWallet, IconBox,
} from "@tabler/icons-react";
import { ROLE_SIDEBAR } from "../../constants/permissions";
import EMPLOYEES_DATA from "../../mocks/data/employees.json";
import LEAVES_DATA    from "../../mocks/data/leaves.json";
import PAYROLL_DATA   from "../../mocks/data/payroll.json";
import ASSETS_DATA    from "../../mocks/data/assets.json";

const PAGE_ICON_MAP = {
  IconLayoutDashboard, IconUsers, IconBuildingCommunity, IconClock,
  IconCalendarOff, IconCalendar, IconCurrencyRupee, IconBriefcase,
  IconUserPlus, IconTarget, IconPackage, IconLifebuoy, IconBook,
  IconChartBar, IconSettings, IconHierarchy, IconRotateClockwise,
  IconFolder, IconDoorExit, IconUser,
};

const PAGE_COLOR = {
  dashboard: "blue", employees: "violet", departments: "cyan",
  attendance: "green", leave: "yellow", payroll: "pink",
  recruitment: "indigo", onboarding: "teal", performance: "orange",
  assets: "gray", helpdesk: "red", lms: "lime", analytics: "blue",
  settings: "gray", calendar: "cyan", documents: "yellow",
  exit: "red", shifts: "orange", orgchart: "violet",
  "my-profile": "blue", "my-payslips": "pink", "my-documents": "yellow",
  "my-assets": "gray",
};

const STATUS_COLOR = {
  Present: "#16a34a", Leave: "#d97706", Absent: "#dc2626",
  Approved: "#16a34a", Pending: "#d97706", Rejected: "#dc2626",
  Paid: "#16a34a", Active: "#16a34a", Assigned: "#2563eb",
};

export default function GlobalSearch({ userRole, dark, fullWidth = false }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropRef  = useRef(null);
  const [query,  setQuery]  = useState("");
  const [open,   setOpen]   = useState(false);
  const [cursor, setCursor] = useState(0);

  const q = query.trim().toLowerCase();

  // ── Pages ──────────────────────────────────────────────────────────────────
  const pages = (ROLE_SIDEBAR[userRole] || []).map((item) => ({
    kind: "page", id: item.id, label: item.label,
    path: `/${item.id}`, icon: item.icon,
    sub: "Navigate to page",
  }));

  // ── Employees ──────────────────────────────────────────────────────────────
  const employees = (EMPLOYEES_DATA.employees || []).map((e) => ({
    kind: "employee", id: e._id, label: e.name,
    sub:  `${e.designation} · ${e.department}`,
    meta: e.status, email: e.email,
    path: `/employees/${e._id}`,
  }));

  // ── Leaves ─────────────────────────────────────────────────────────────────
  const leaves = (LEAVES_DATA.leaves || []).map((l) => ({
    kind: "leave", id: l._id, label: l.employee,
    sub:  `${l.leaveType} · ${l.fromDate} → ${l.toDate} (${l.days}d)`,
    meta: l.status, path: `/leave`,
  }));

  // ── Payroll ────────────────────────────────────────────────────────────────
  const payrollRaw = PAYROLL_DATA.payroll || PAYROLL_DATA.payrolls || [];
  const payroll = payrollRaw.map((p) => ({
    kind: "payroll", id: p._id, label: p.employee,
    sub:  `${p.month} ${p.year} · ₹${Number(p.netSalary).toLocaleString("en-IN")}`,
    meta: p.status, path: `/payroll`,
  }));

  // ── Assets ─────────────────────────────────────────────────────────────────
  const assetsRaw = ASSETS_DATA.assets || ASSETS_DATA || [];
  const assets = (Array.isArray(assetsRaw) ? assetsRaw : []).map((a) => ({
    kind: "asset", id: a.id || a._id, label: a.name,
    sub:  `${a.type} · ${a.assignedTo || "Unassigned"} · ${a.department || ""}`,
    meta: a.status, path: `/assets`,
  }));

  // ── Filter all ─────────────────────────────────────────────────────────────
  const match = (str) => (str || "").toLowerCase().includes(q);

  const filteredPages     = q ? pages    .filter((r) => match(r.label)) : [];
  const filteredEmployees = q ? employees.filter((r) => match(r.label) || match(r.sub) || match(r.email)) : [];
  const filteredLeaves    = q ? leaves   .filter((r) => match(r.label) || match(r.sub)) : [];
  const filteredPayroll   = q ? payroll  .filter((r) => match(r.label) || match(r.sub)) : [];
  const filteredAssets    = q ? assets   .filter((r) => match(r.label) || match(r.sub)) : [];

  // ── Flatten with group headers for keyboard nav ───────────────────────────
  const groups = [
    { title: "Pages",     icon: IconLayoutDashboard, color: "blue",   items: filteredPages     },
    { title: "Employees", icon: IconUserCircle,       color: "violet", items: filteredEmployees },
    { title: "Leave",     icon: IconCalendarEvent,    color: "yellow", items: filteredLeaves    },
    { title: "Payroll",   icon: IconWallet,           color: "pink",   items: filteredPayroll   },
    { title: "Assets",    icon: IconBox,              color: "gray",   items: filteredAssets    },
  ].filter((g) => g.items.length > 0);

  const flat = groups.flatMap((g) => g.items);
  const total = flat.length;

  const go = (item) => {
    navigate(item.path);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  // keyboard
  const onKey = (e) => {
    if (!open || total === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, total - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); go(flat[cursor]); }
    if (e.key === "Escape")    { setOpen(false); setQuery(""); }
  };

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setCursor(0); }, [q]);

  // theme
  const border  = dark ? "#334155" : "#e2e8f0";
  const bg      = dark ? "#1e293b" : "#ffffff";
  const inputBg = dark ? "#0f172a" : "#f8fafc";
  const textCol = dark ? "#f1f5f9" : "#0f172a";
  const dimmed  = dark ? "#94a3b8" : "#64748b";
  const hoverBg = dark ? "#0f172a" : "#f1f5f9";
  const groupHdr= dark ? "#0f172a" : "#f8fafc";

  // track flat index for cursor highlight
  let flatIdx = 0;

  return (
    <Box style={{ position: "relative", width: "100%", maxWidth: fullWidth ? "100%" : 420 }}>

      {/* ── Input ── */}
      <Box style={{ position: "relative" }}>
        <IconSearch size={14} color={dimmed}
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search employees, leave, payroll, assets, pages…"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "8px 44px 8px 34px",
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: inputBg, color: textCol,
            fontSize: 13, fontFamily: "inherit",
            outline: "none", transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = dark ? "#3b82f6" : "#2563eb")}
          onBlurCapture={(e)  => (e.currentTarget.style.borderColor = border)}
        />
        <Box style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
          <span style={{ fontSize: 10, color: dimmed, background: dark ? "#334155" : "#e2e8f0",
                         borderRadius: 4, padding: "2px 5px", fontFamily: "monospace" }}>⌘K</span>
        </Box>
      </Box>

      {/* ── Dropdown ── */}
      {open && q.length > 0 && (
        <Box ref={dropRef} style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: bg, border: `1px solid ${border}`, borderRadius: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)", zIndex: 9999,
          overflow: "hidden", maxHeight: 420, overflowY: "auto",
        }}>
          {total === 0 ? (
            <Box style={{ padding: "18px 16px", textAlign: "center" }}>
              <Text fz="sm" c="dimmed">No results for "{query}"</Text>
            </Box>
          ) : groups.map((group) => (
            <Box key={group.title}>
              {/* Group header */}
              <Box style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 14px 5px",
                background: groupHdr,
                borderBottom: `1px solid ${border}`,
                position: "sticky", top: 0, zIndex: 1,
              }}>
                <group.icon size={12} color={dimmed} />
                <Text fz={10} fw={700} tt="uppercase" style={{ color: dimmed, letterSpacing: "0.07em" }}>
                  {group.title}
                </Text>
                <Text fz={10} style={{ color: dimmed, marginLeft: "auto" }}>
                  {group.items.length}
                </Text>
              </Box>

              {/* Items */}
              {group.items.map((item) => {
                const myIdx   = flatIdx++;
                const active  = myIdx === cursor;
                const statCol = STATUS_COLOR[item.meta] || dimmed;

                if (item.kind === "page") {
                  const Icon  = PAGE_ICON_MAP[item.icon] || IconLayoutDashboard;
                  const color = PAGE_COLOR[item.id] || "blue";
                  return (
                    <Box key={item.id} onMouseDown={() => go(item)} onMouseEnter={() => setCursor(myIdx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 14px", cursor: "pointer",
                        background: active ? hoverBg : "transparent",
                        borderBottom: `1px solid ${border}`,
                        transition: "background 0.1s",
                      }}>
                      <ThemeIcon size={28} color={color} variant="light" radius="md" style={{ flexShrink: 0 }}>
                        <Icon size={13} stroke={1.8} />
                      </ThemeIcon>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="sm" fw={600} style={{ color: textCol }}>{item.label}</Text>
                        <Text fz="xs" style={{ color: dimmed }}>Navigate to page</Text>
                      </Box>
                      {active && <IconArrowRight size={12} color={dimmed} />}
                    </Box>
                  );
                }

                // data result
                const kindIcon = {
                  employee: IconUserCircle,
                  leave:    IconCalendarEvent,
                  payroll:  IconWallet,
                  asset:    IconBox,
                }[item.kind] || IconUserCircle;

                const kindColor = {
                  employee: "violet", leave: "yellow", payroll: "pink", asset: "gray",
                }[item.kind] || "blue";

                const KindIcon = kindIcon;

                return (
                  <Box key={item.id} onMouseDown={() => go(item)} onMouseEnter={() => setCursor(myIdx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px", cursor: "pointer",
                      background: active ? hoverBg : "transparent",
                      borderBottom: `1px solid ${border}`,
                      transition: "background 0.1s",
                    }}>
                    <ThemeIcon size={28} color={kindColor} variant="light" radius="md" style={{ flexShrink: 0 }}>
                      <KindIcon size={13} stroke={1.8} />
                    </ThemeIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fz="sm" fw={600} style={{ color: textCol, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </Text>
                      <Text fz="xs" style={{ color: dimmed, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.sub}
                      </Text>
                    </Box>
                    {item.meta && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px",
                        borderRadius: 20, flexShrink: 0,
                        background: statCol + "22", color: statCol,
                      }}>
                        {item.meta}
                      </span>
                    )}
                    {active && <IconArrowRight size={12} color={dimmed} />}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
