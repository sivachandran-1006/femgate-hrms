import { useLocation, Link } from "react-router-dom";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";

const ROUTE_LABELS = {
  dashboard:          "Dashboard",
  employees:          "Employees",
  departments:        "Departments",
  attendance:         "Attendance",
  "my-attendance":    "My Attendance",
  leave:              "Leave",
  payroll:            "Payroll",
  recruitment:        "Recruitment",
  onboarding:         "Onboarding",
  performance:        "Performance",
  assets:             "Assets",
  helpdesk:           "Helpdesk",
  lms:                "Learning",
  analytics:          "Analytics",
  settings:           "Settings",
  calendar:           "Calendar",
  documents:          "Documents",
  exit:               "Exit Management",
  shifts:             "Shifts",
  orgchart:           "Org Chart",
  reports:            "Reports",
  notifications:      "Notifications",
  "user-management":  "User Management",
  "roles-permissions":"Roles & Permissions",
  "audit-logs":       "Audit Logs",
  security:           "Security Center",
  integrations:       "Integrations",
  billing:            "Billing",
  companies:          "Multi-Company",
  "company-settings": "Company Settings",
  "holiday-calendar": "Holiday Calendar",
  expense:            "Expense Management",
  announcements:      "Announcements",
  "my-profile":       "My Profile",
  "my-payslips":      "My Payslips",
  "my-documents":     "My Documents",
  "my-assets":        "My Assets",
};

// Group segments under a parent label for sub-pages
const PARENT_MAP = {
  "my-attendance":    "Dashboard",
  "my-profile":       "Dashboard",
  "my-payslips":      "Dashboard",
  "my-documents":     "Dashboard",
  "my-assets":        "Dashboard",
};

const Breadcrumb = ({ dark = false }) => {
  const { pathname } = useLocation();

  // Split path into segments, ignore empty
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length || segments[0] === "dashboard") return null;

  // Build crumb list
  const crumbs = [];

  // Always start with Home → Dashboard
  crumbs.push({ label: "Home", to: "/dashboard", isHome: true });

  // If this segment has a logical parent (e.g. my-profile → Dashboard), add it
  const first = segments[0];
  if (PARENT_MAP[first] && PARENT_MAP[first] !== "Dashboard") {
    crumbs.push({ label: PARENT_MAP[first], to: `/${first.split("-")[0]}` });
  }

  // Add each path segment as a crumb
  segments.forEach((seg, idx) => {
    const to = "/" + segments.slice(0, idx + 1).join("/");
    const label = ROUTE_LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, to, isLast: idx === segments.length - 1 });
  });

  const textColor   = dark ? COLORS.dark.subtext  : "#64748b";
  const activeColor = dark ? COLORS.dark.text      : "#1e293b";
  const hoverColor  = dark ? "#93c5fd"             : COLORS.primary;
  const sepColor    = dark ? "#475569"             : "#cbd5e1";

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        4,
        marginBottom: 16,
        flexWrap:   "wrap",
      }}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;

        return (
          <span key={crumb.to + idx} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {idx > 0 && (
              <IconChevronRight size={13} stroke={2} color={sepColor} style={{ flexShrink: 0 }} />
            )}

            {isLast ? (
              <span
                style={{
                  fontSize:   FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.semibold,
                  color:      activeColor,
                  display:    "flex",
                  alignItems: "center",
                  gap:        4,
                }}
              >
                {crumb.isHome && <IconHome size={13} stroke={2} color={activeColor} />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                style={{
                  fontSize:       FONT_SIZE.sm,
                  fontWeight:     FONT_WEIGHT.medium,
                  color:          textColor,
                  textDecoration: "none",
                  display:        "flex",
                  alignItems:     "center",
                  gap:            4,
                  transition:     "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
              >
                {crumb.isHome && <IconHome size={13} stroke={2} />}
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
