import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppShell, Burger, Group, Title, ActionIcon, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSun, IconMoon } from "@tabler/icons-react";

// Layout
import Sidebar        from "./components/layout/Sidebar";
import ScreenWrapper  from "./components/layout/ScreenWrapper";

// Screens
import Dashboard from "./screens/dashboard/Dashboard";
import EmployeeList from "./screens/employees/EmployeeList";
import Departments from "./screens/departments/Departments";
import Attendance from "./screens/attendance/Attendance";
import Leave from "./screens/leave/Leave";
import Payroll from "./screens/payroll/Payroll";
import Recruitment from "./screens/recruitment/Recruitment";
import Onboarding from "./screens/onboarding/Onboarding";
import Performance from "./screens/performance/Performance";
import Assets from "./screens/assets/Assets";
import Helpdesk from "./screens/helpdesk/Helpdesk";
import LMS from "./screens/lms/LMS";
import Analytics from "./screens/analytics/Analytics";
import Settings from "./screens/settings/Settings";

// Hooks & utils
import { useAuth } from "./hooks/useAuth";
import { AppButton } from "./components/ui/AppButton";
import { AppInput } from "./components/ui/AppInput";
import { AppCard } from "./components/ui/AppCard";
import logo from "./assets/images/logo.png";

export default function App() {
  const { isLoggedIn, userRole, login, logout } = useAuth();
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  
  // Auth Form State
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] }}>
        <AppCard style={{ width: "100%", maxWidth: 960, padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "1.2fr 0.8fr" }}>
          {/* LEFT */}
          <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Title order={1} mb="xs">Welcome Back</Title>
            <p style={{ color: theme.colors.gray[6], fontSize: 13, marginBottom: 28 }}>Sign in to access your MGate HRMS dashboard</p>
            <Group gap="xs" mb="lg">
              {["Super Admin","Admin","HR","Manager","Finance","Employee"].map(r => (
                <AppButton 
                  key={r} 
                  variant={selectedRole === r ? "filled" : "light"}
                  color={selectedRole === r ? "primary" : "gray"}
                  size="xs"
                  onClick={() => setSelectedRole(r)}
                >
                  {r}
                </AppButton>
              ))}
            </Group>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AppInput type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              <AppInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <AppButton fullWidth mt="sm" size="md" onClick={() => login(selectedRole)}>
                Login to HRMS
              </AppButton>
            </div>
          </div>
          {/* RIGHT */}
          <div style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 44px" }}>
            <Group mb="xl">
              <img src={logo} alt="MGate" style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", padding: 4, objectFit: "contain" }} />
              <div>
                <Title order={3} style={{ color: "white" }}>MGate HRMS</Title>
                <div style={{ fontSize: 11, color: "#93c5fd", fontWeight: 500, letterSpacing: "0.06em" }}>TECHNOLOGIES</div>
              </div>
            </Group>
            <p style={{ color: "#dbeafe", fontSize: 13, lineHeight: 1.9, marginBottom: 32 }}>
              Enterprise Human Resource Management System — manage employees, attendance, leave, payroll and more from one platform.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, fontWeight: 500 }}>
              {["Employee Management","Attendance & Leave","Payroll Processing","Recruitment & Onboarding","Analytics & Reports"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#34d399", fontSize: 16 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </AppCard>
      </div>
    );
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
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
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar onLogout={logout} userRole={userRole} onCloseMobile={toggle} />
      </AppShell.Navbar>

      <AppShell.Main style={{ background: "#ffffff" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<ScreenWrapper><Dashboard /></ScreenWrapper>} />
          <Route path="/employees"   element={<ScreenWrapper><EmployeeList /></ScreenWrapper>} />
          <Route path="/departments" element={<ScreenWrapper><Departments darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/attendance"  element={<ScreenWrapper><Attendance  darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/leave"       element={<ScreenWrapper><Leave       darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/payroll"     element={<ScreenWrapper><Payroll     darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/recruitment" element={<ScreenWrapper><Recruitment darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/onboarding"  element={<ScreenWrapper><Onboarding  darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/performance" element={<ScreenWrapper><Performance darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/assets"      element={<ScreenWrapper><Assets      darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/helpdesk"    element={<ScreenWrapper><Helpdesk    darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/lms"         element={<ScreenWrapper><LMS         darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/analytics"   element={<ScreenWrapper><Analytics   darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
          <Route path="/settings"    element={<ScreenWrapper><Settings    darkMode={colorScheme === 'dark'} /></ScreenWrapper>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
