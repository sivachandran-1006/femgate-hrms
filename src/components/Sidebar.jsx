import {
  LayoutDashboard,
  Users,
  CalendarX2,
  Clock,
  IndianRupee,
  BarChart2,
  Settings,
  LogOut,
  Moon,
  Building2,
} from "lucide-react";

const Sidebar = ({
  activePage,
  setActivePage,
  darkMode,
  setDarkMode,
  onLogout,
}) => {

  const menuItems = [
    { id: "dashboard",  label: "Dashboard",  Icon: LayoutDashboard },
    { id: "employees",  label: "Employees",  Icon: Users           },
    { id: "leave",      label: "Leaves",     Icon: CalendarX2      },
    { id: "attendance", label: "Attendance", Icon: Clock           },
    { id: "payroll",    label: "Payroll",    Icon: IndianRupee     },
    { id: "analytics",  label: "Analytics",  Icon: BarChart2       },
    { id: "settings",   label: "Settings",   Icon: Settings        },
  ];

  return (
    <div
  style={{
    width: 220,
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px 14px",
    zIndex: 1000,
  }}
>

      {/* ── TOP ── */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div
            style={{ width: 42, height: 42, borderRadius: 14 }}
            className="bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0"
          >
            <Building2 size={22} className="text-white" />
          </div>
          <span
            style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#0f172a" }}
          >
            HRMS
          </span>
        </div>

        {/* NAV */}
        <ul className="space-y-1">
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
                  color: isActive ? "#ffffff" : "#1e293b",
                  background: isActive ? "#2563eb" : "transparent",
                  boxShadow: isActive ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f1f5f9";
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
        <div style={{ height: 1, background: "#e2e8f0", margin: "0 12px 16px" }} />

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
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#fef2f2")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "none")
  }
>
  <LogOut size={20} strokeWidth={1.8} />

  <span>Logout</span>
</button>

        {/* DARK MODE */}
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
            <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
              Dark Mode
            </span>
          </div>

          {/* TOGGLE */}
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

    </div>
  );
};

export default Sidebar;
