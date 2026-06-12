import { useState, useEffect, useCallback } from "react";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";
import { GAP, SPACING } from "../../theme/spacing";

// ── Toast context / hook ──────────────────────────────────────────────────────

import { createContext, useContext, useRef } from "react";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: IconCheck,
  error: IconX,
  warning: IconAlertTriangle,
  info: IconInfoCircle,
};

const COLORS_MAP = {
  success: {
    bg: COLORS.successLight,
    border: COLORS.success,
    icon: COLORS.success,
    text: COLORS.success,
  },
  error: {
    bg: COLORS.dangerMuted,
    border: COLORS.danger,
    icon: COLORS.danger,
    text: COLORS.danger,
  },
  warning: {
    bg: COLORS.warningLight,
    border: COLORS.warning,
    icon: COLORS.warning,
    text: COLORS.warning,
  },
  info: {
    bg: COLORS.primaryMuted,
    border: COLORS.primary,
    icon: COLORS.primary,
    text: COLORS.primary,
  },
};

// ── ToastProvider — wrap App or any subtree ───────────────────────────────────

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, type = "success", duration = 3000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, visible: true }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
      );
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        350,
      );
    }, duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const c = COLORS_MAP[t.type] || COLORS_MAP.success;
          const Icon = ICONS[t.type] || ICONS.success;
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: GAP.sm,
                padding: `${SPACING[3]}px ${SPACING[4]}px`,
                borderRadius: RADIUS.xl,
                background: "#ffffff",
                border: `1px solid ${c.border}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: 260,
                maxWidth: 380,
                pointerEvents: "all",
                fontFamily: FONT_FAMILY.base,
                transform: t.visible ? "translateY(0)" : "translateY(-12px)",
                opacity: t.visible ? 1 : 0,
                transition: "transform 0.3s ease, opacity 0.3s ease",
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: RADIUS.full,
                  background: c.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color={c.icon} stroke={2.5} />
              </div>

              {/* Message */}
              <p
                style={{
                  margin: 0,
                  flex: 1,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.medium,
                  color: "#0f172a",
                  lineHeight: 1.4,
                }}
              >
                {t.message}
              </p>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: RADIUS.full,
                  border: "none",
                  background: "#f1f5f9",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <IconX size={11} color="#64748b" stroke={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
