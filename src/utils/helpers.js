import { COLORS, STATUS_BADGE } from "../theme/colors";

export const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export const getAvatarColor = (name = "") => {
  const defaultAvatars = [
    { bg: "#dbeafe", color: "#2563eb" },
    { bg: "#dcfce7", color: "#16a34a" },
    { bg: "#fef3c7", color: "#d97706" },
    { bg: "#fee2e2", color: "#dc2626" },
  ];
  const avatars = COLORS.avatars || defaultAvatars;
  return avatars[(name.charCodeAt(0) || 0) % avatars.length];
};

export const getStatusBadge = (status = "") =>
  STATUS_BADGE[status] || { bg: COLORS.gray300, color: COLORS.gray600 };

export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const calcHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";
  try {
    const s = new Date(`1970-01-01 ${checkIn}`);
    const e = new Date(`1970-01-01 ${checkOut}`);
    const diff = e - s;
    if (diff <= 0) return "—";
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  } catch { return "—"; }
};
