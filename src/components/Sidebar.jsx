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
  { id: "leave", label: "Leave", Icon: CalendarX2 },
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

const Sidebar = ({ activePage, setActivePage, darkMode, setDarkMode, onLogout }) => {
  const theme = {
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#0f172a",
    subtext: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#334155" : "#e2e8f0",
    tableRowHover: darkMode ? "#1e293b" : "#f8fafc",
  };

  const inactiveColor = darkMode ? theme.subtext : "#475569";

  return (
    <div
      style={{
        width: 220,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: theme.cardBg,
        borderRight: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "18px 12px",
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.2s ease, border-color 0.2s ease",
        boxSizing: "border-box",
      }}
    >
      {/* Hide webkit scrollbar */}
      <style>{`.sidebar-nav-list::-webkit-scrollbar { display: none; }`}</style>

      {/* LOGO SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 4px",
          marginBottom: 24,
          flexShrink: 0,
        }}
      >
        <img
          src={logo}
          alt="MGate"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            objectFit: "contain",
            background: "#ffffff",
            padding: 3,
            flexShrink: 0,
          }}
        />
        <div style={{ lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.text,
              fontFamily: "'Inter', sans-serif",
              transition: "color 0.2s ease",
            }}
          >
            MGate
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#2563eb",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            HRMS
          </div>
        </div>
      </div>

      {/* NAV LIST — scrollable, flex-grow fills remaining space */}
      <ul
        className="sidebar-nav-list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          overflowY: "auto",
          flex: 1,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          minHeight: 0,
        }}
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
                gap: 12,
                padding: "10px 16px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                fontFamily: "'Inter', sans-serif",
                color: isActive ? "#ffffff" : inactiveColor,
                background: isActive ? "#2563eb" : "transparent",
                boxShadow: isActive ? "0 3px 10px rgba(37,99,235,0.3)" : "none",
                transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
                userSelect: "none",
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = theme.tableRowHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </li>
          );
        })}
      </ul>

      {/* BOTTOM SECTION */}
      <div style={{ flexShrink: 0 }}>
        {/* Divider */}
        <div
          style={{
            height: 1,
            background: theme.border,
            margin: "12px 4px 12px",
            transition: "background 0.2s ease",
          }}
        />

        {/* Logout button */}
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 16px",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#ef4444",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            borderRadius: 10,
            textAlign: "left",
            transition: "background 0.15s ease",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <LogOut size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span>Logout</span>
        </button>

        {/* Dark mode row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 16px",
            marginTop: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Moon size={18} strokeWidth={1.8} color="#64748b" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                fontFamily: "'Inter', sans-serif",
                color: theme.subtext,
                transition: "color 0.2s ease",
              }}
            >
              Dark Mode
            </span>
          </div>

          {/* Toggle pill */}
          <button
            onClick={() => setDarkMode && setDarkMode(!darkMode)}
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              background: darkMode ? "#2563eb" : "#cbd5e1",
              border: "none",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: darkMode ? "flex-end" : "flex-start",
              transition: "background 0.2s ease",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                transition: "all 0.2s ease",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
