// ── MGate Systems — App Constants ─────────────────────────────────────────────
// Colors, fonts, sizes → see src/theme/*
// This file is for business-logic constants only.

export { COLORS, STATUS_BADGE } from "../theme/colors";
export { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../theme/fonts";
export { SPACING, PADDING, GAP, LAYOUT } from "../theme/spacing";
export { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE } from "../theme/sizes";

export const APP_NAME      = "MGate HRMS";
export const COMPANY_NAME  = "MGate Technologies";
// API_BASE removed — this branch uses static mock data only.
// When new backend is ready, configure VITE_API_URL in .env on the new branch.

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  HR:          "HR",
  MANAGER:     "Manager",
  FINANCE:     "Finance",
  EMPLOYEE:    "Employee",
};

export const DEPARTMENTS = ["IT", "HR", "Finance", "Management"];

export const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Annual Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Loss of Pay",
];
