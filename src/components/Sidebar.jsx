import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarX2,
  IndianRupee,
  Briefcase,
  UserPlus,
  Target,
  Package,
  LifeBuoy,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  Moon,
} from "lucide-react";
import logo from "../assets/logo.png";

const menuItems = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "employees", label: "Employees", Icon: Users },
  { id: "departments", label: "Departments", Icon: Building2 },
  { id: "attendance", label: "Attendance", Icon: Clock },
  { id: "leave", label: "Leaves", Icon: CalendarX2 },
  { id: "payroll", label: "Payroll", Icon: IndianRupee },
  { id: "recruitment", label: "Recruitment", Icon: Briefcase },
  { id: "onboarding", label: "Onboarding", Icon: UserPlus },
  { id: "performance", label: "Performance", Icon: Target },
  { id: "assets", label: "Assets", Icon: Package },
  { id: "helpdesk", label: "Helpdesk", Icon: LifeBuoy },
  { id: "lms", label: "Learning", Icon: BookOpen },
  { id: "analytics", label: "Analytics", Icon: BarChart2 },
  { id: "settings", label: "Settings", Icon: Settings },
];

const Sidebar = ({
  activePage,
  setActivePage,
  darkMode,
  setDarkMode,
  onLogout,
}) => {
  const bg = darkMode ? "#1e293b" : "#ffffff";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";
  const inactiveText = darkMode ? "#94a3b8" : "#1e293b";
  const hoverBg = darkMode ? "#334155" : "#f1f5f9";
  const logoText = darkMode ? "#f1f5f9" : "#0f172a";
  const darkModeLabel = darkMode ? "#94a3b8" : "#1e293b";
  const dividerColor = darkMode ? "#334155" : "#e2e8f0";

  return (
    <div
      style={{
        width: 220,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: bg,
        borderRight: `1px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px 14px",
        zIndex: 1000,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* ── TOP ── */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", marginBottom: 28 }}>
          <img
            src={logo}
            alt="MGate"
            style={{ width: 38, height: 38, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 3, flexShrink: 0 }}
          />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px", color: logoText, transition: "color 0.2s ease" }}>MGate</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>HRMS</div>
          </div>
        </div>

        {/* NAV — scrollable */}
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            overflowY: "auto",
            flex: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="sidebar-nav-list"
        >
          {menuItems.map(({ id, label, Icon }) => {
            const isActive = activePage === id;
            return (
              <li
                key={id}
                onClick={() => setActivePage && setActivePage(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 18px",
                  borderRadius: 16,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : inactiveText,
                  background: isActive ? "#2563eb" : "transparent",
                  boxShadow: isActive ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </li>
            );
          })}
        </ul>

      </div>

      {/* ── BOTTOM ── */}
      <div>

        {/* DIVIDER */}
        <div style={{ height: 1, background: dividerColor, margin: "0 12px 16px", transition: "background 0.2s ease" }} />

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 18px",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#ef4444",
            fontSize: 15,
            fontWeight: 500,
            borderRadius: 12,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span>Logout</span>
        </button>

        {/* DARK MODE TOGGLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            marginTop: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Moon size={20} strokeWidth={1.8} color="#64748b" />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: darkModeLabel,
                transition: "color 0.2s ease",
              }}
            >
              Dark Mode
            </span>
          </div>

          {/* PILL TOGGLE */}
          <button
            onClick={() => setDarkMode && setDarkMode(!darkMode)}
            style={{
              width: 44,
              height: 26,
              borderRadius: 999,
              background: darkMode ? "#2563eb" : "#cbd5e1",
              border: "none",
              cursor: "pointer",
              padding: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: darkMode ? "flex-end" : "flex-start",
              transition: "background 0.2s ease",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                transition: "all 0.2s ease",
              }}
            />
          </button>
        </div>

      </div>

      {/* Hide scrollbar for webkit */}
      <style>{`.sidebar-nav-list::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default Sidebar;
