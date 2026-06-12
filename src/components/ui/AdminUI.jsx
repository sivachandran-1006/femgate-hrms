/**
 * Shared atomic UI components for Super Admin screens.
 * Import what you need — keeps individual screens small.
 */
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

// ── Style factories ────────────────────────────────────────────────────────────
export const mkInputStyle = (surface) => ({
  border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
  fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
  fontFamily: FONT_FAMILY.base, outline: "none", width: "100%", boxSizing: "border-box",
});

export const mkBtnPrimary = (disabled = false) => ({
  background: disabled ? COLORS.gray300 : COLORS.primary,
  color: COLORS.white, border: "none", borderRadius: RADIUS.lg,
  padding: "8px 18px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
  fontFamily: FONT_FAMILY.base, cursor: disabled ? "not-allowed" : "pointer",
  display: "flex", alignItems: "center", gap: 6,
});

export const mkBtnGhost = (surface) => ({
  background: "transparent", border: `1px solid ${surface.border}`,
  borderRadius: RADIUS.lg, padding: "8px 18px", fontSize: FONT_SIZE.sm,
  fontFamily: FONT_FAMILY.base, cursor: "pointer", color: surface.subtext,
});

export const mkCard = (surface) => ({
  background: surface.cardBg, border: `1px solid ${surface.border}`,
  borderRadius: RADIUS["2xl"], boxShadow: SHADOW.xs,
});

// ── Atoms ──────────────────────────────────────────────────────────────────────
export const Badge = ({ bg, text, children }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: bg, color: text, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

export const StatCard = ({ label, value, sub, surface, accent }) => (
  <div style={{ ...mkCard(surface), padding: "16px 20px" }}>
    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{label.toUpperCase()}</p>
    <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: accent || surface.text }}>{value}</p>
    {sub && <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{sub}</p>}
  </div>
);

export const PageHeader = ({ icon: Icon, iconBg, iconColor, title, sub, surface }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
    <div style={{ width: 40, height: 40, borderRadius: RADIUS.xl, background: iconBg || COLORS.primaryMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={20} color={iconColor || COLORS.primary} strokeWidth={1.8} />
    </div>
    <div>
      <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{title}</h1>
      <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{sub}</p>
    </div>
  </div>
);

export const TabBar = ({ tabs, active, onChange, surface }) => (
  <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${surface.border}`, marginBottom: 24 }}>
    {tabs.map(({ id, label, icon: Icon }) => {
      const on = active === id;
      return (
        <button key={id} onClick={() => onChange(id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", border: "none", background: "transparent", borderBottom: on ? `2px solid ${COLORS.primary}` : "2px solid transparent", color: on ? COLORS.primary : surface.subtext, fontWeight: on ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium, fontSize: FONT_SIZE.sm, fontFamily: FONT_FAMILY.base, cursor: "pointer", marginBottom: -1 }}>
          {Icon && <Icon size={14} strokeWidth={2} />} {label}
        </button>
      );
    })}
  </div>
);

export const ModalShell = ({ title, onClose, surface, children, maxWidth = 480 }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, width: "100%", maxWidth, boxShadow: "0 24px 48px rgba(0,0,0,0.22)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${surface.border}` }}>
        <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{title}</p>
        <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: surface.subtext, padding: 4, borderRadius: RADIUS.md, display: "flex", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

export const Toast = ({ msg, type = "success" }) => {
  const bg = type === "error" ? COLORS.danger : type === "warning" ? COLORS.warning : COLORS.success;
  return (
    <div style={{ position: "fixed", top: 20, right: 24, zIndex: 99999, background: bg, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
      {msg}
    </div>
  );
};

export const TableHead = ({ cols, surface }) => (
  <thead>
    <tr style={{ background: surface.theadBg }}>
      {cols.map(c => (
        <th key={c} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}`, whiteSpace: "nowrap" }}>{c.toUpperCase()}</th>
      ))}
    </tr>
  </thead>
);

export const Td = ({ children, style }) => (
  <td style={{ padding: "11px 16px", fontSize: FONT_SIZE.sm, borderBottom: `1px solid #e2e8f0`, ...style }}>{children}</td>
);
