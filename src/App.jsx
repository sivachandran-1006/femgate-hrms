import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell, Burger, Group, Title, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSun, IconMoon } from "@tabler/icons-react";

// Layout
import Sidebar       from "./components/layout/Sidebar";
import ScreenWrapper from "./components/layout/ScreenWrapper";

// Screens
import Login          from "./screens/auth/Login";
import Dashboard      from "./screens/dashboard/Dashboard";
import EmployeeList   from "./screens/employees/EmployeeList";
import Profile        from "./screens/employees/Profile";
import Departments    from "./screens/departments/Departments";
import Attendance     from "./screens/attendance/Attendance";
import Leave          from "./screens/leave/Leave";
import Payroll        from "./screens/payroll/Payroll";
import Recruitment    from "./screens/recruitment/Recruitment";
import Onboarding     from "./screens/onboarding/Onboarding";
import Performance    from "./screens/performance/Performance";
import Assets         from "./screens/assets/Assets";
import Helpdesk       from "./screens/helpdesk/Helpdesk";
import LMS            from "./screens/lms/LMS";
import Analytics      from "./screens/analytics/Analytics";
import Settings       from "./screens/settings/Settings";
import Calendar       from "./screens/calendar/Calendar";
import Documents      from "./screens/documents/Documents";
import ExitManagement from "./screens/exit/ExitManagement";
import ShiftManagement from "./screens/shifts/ShiftManagement";
import OrgChart       from "./screens/orgchart/OrgChart";

// Employee Self-Service screens
import MyProfile      from "./screens/employees/MyProfile";
import MyPayslips     from "./screens/payroll/MyPayslips";
import MyDocuments    from "./screens/documents/MyDocuments";
import MyAssets       from "./screens/assets/MyAssets";
import MyAttendance   from "./screens/attendance/MyAttendance";

// Hooks & permissions
import { useAuth } from "./hooks/useAuth";
import { ROLE_ROUTES } from "./constants/permissions";
import logo from "./assets/images/logo.jpeg";

// Access Denied page
const AccessDenied = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: 16,
    }}
  >
    <span style={{ fontSize: 48 }}>🚫</span>
    <h2 style={{ margin: 0 }}>Access Denied</h2>
    <p style={{ color: "#64748b", margin: 0 }}>
      You don&apos;t have permission to view this page.
    </p>
  </div>
);

// Helper: wrap a screen with role-based access check
const RoleGuard = ({ routeId, userRole, children }) => {
  const allowed = userRole ? (ROLE_ROUTES[userRole] || []) : [];
  if (!allowed.includes(routeId)) return <AccessDenied />;
  return children;
};

export default function App() {
  const { isLoggedIn, user, userRole, logout } = useAuth();
  const [opened, { toggle }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const navWidth = collapsed ? 68 : 250;

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <Login />;
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: navWidth, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <img src={logo} alt="MGate" style={{ height: 32 }} />
            <Title order={4}>MGate HRMS</Title>
          </Group>
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            size="lg"
            aria-label="Toggle color scheme"
          >
            {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        <Sidebar
          onLogout={logout}
          user={user}
          userRole={userRole}
          onCloseMobile={toggle}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          dark={dark}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ background: dark ? "#0f172a" : "#f1f5f9", minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <RoleGuard routeId="dashboard" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Dashboard darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/employees"
            element={
              <RoleGuard routeId="employees" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><EmployeeList darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/departments"
            element={
              <RoleGuard routeId="departments" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Departments darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/attendance"
            element={
              <RoleGuard routeId="attendance" userRole={userRole}>
                <ScreenWrapper darkMode={dark}>
                  {userRole === "EMPLOYEE"
                    ? <MyAttendance darkMode={dark} />
                    : <Attendance   darkMode={dark} />
                  }
                </ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/leave"
            element={
              <RoleGuard routeId="leave" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Leave darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/payroll"
            element={
              <RoleGuard routeId="payroll" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Payroll darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/recruitment"
            element={
              <RoleGuard routeId="recruitment" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Recruitment darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/onboarding"
            element={
              <RoleGuard routeId="onboarding" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Onboarding darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/performance"
            element={
              <RoleGuard routeId="performance" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Performance darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/assets"
            element={
              <RoleGuard routeId="assets" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Assets darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/helpdesk"
            element={
              <RoleGuard routeId="helpdesk" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Helpdesk darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/lms"
            element={
              <RoleGuard routeId="lms" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><LMS darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/analytics"
            element={
              <RoleGuard routeId="analytics" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Analytics darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleGuard routeId="settings" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Settings darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <RoleGuard routeId="employees" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Profile darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/calendar"
            element={
              <RoleGuard routeId="calendar" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Calendar darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/documents"
            element={
              <RoleGuard routeId="documents" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><Documents darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/exit"
            element={
              <RoleGuard routeId="exit" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><ExitManagement darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/shifts"
            element={
              <RoleGuard routeId="shifts" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><ShiftManagement darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/orgchart"
            element={
              <RoleGuard routeId="orgchart" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><OrgChart darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />

          {/* ── Employee Self-Service routes ── */}
          <Route
            path="/my-profile"
            element={
              <RoleGuard routeId="my-profile" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><MyProfile darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/my-payslips"
            element={
              <RoleGuard routeId="my-payslips" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><MyPayslips darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/my-documents"
            element={
              <RoleGuard routeId="my-documents" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><MyDocuments darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/my-assets"
            element={
              <RoleGuard routeId="my-assets" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><MyAssets darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
