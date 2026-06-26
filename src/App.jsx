import { useState, useRef, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell, Burger, Group, Title, Box, Text, Avatar, ActionIcon, Indicator, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMantineColorScheme } from "@mantine/core";
import { IconBell, IconCheck } from "@tabler/icons-react";
import GlobalSearch from "./components/ui/GlobalSearch";
import { NOTIF_BY_ROLE } from "./screens/dashboard/data";
import { ROLE_LABELS, ROLE_COLORS } from "./constants/permissions";
import { getInitials } from "./utils/helpers";

// Layout
import Sidebar       from "./components/layout/Sidebar";
import ScreenWrapper from "./components/layout/ScreenWrapper";

// Screens
import Login          from "./screens/auth/Login";
import Dashboard      from "./screens/dashboard/Dashboard";
import EmployeeList   from "./screens/employees/EmployeeList";
import Profile        from "./screens/employees/Profile";
import Departments    from "./screens/departments/Departments";
import DepartmentProfile from "./screens/departments/DepartmentProfile";
import BranchProfile     from "./screens/branches/BranchProfile";
import DesignationProfile from "./screens/designations/DesignationProfile";
import Attendance     from "./screens/attendance/Attendance";
import LeaveManagement from "./screens/leave/LeaveManagement";
import PayrollManagement from "./screens/payroll/PayrollManagement";
import Recruitment    from "./screens/recruitment/Recruitment";
import OnboardingManagement from "./screens/onboarding/OnboardingManagement";
import PerformanceManagement from "./screens/performance/PerformanceManagement";
import Performance           from "./screens/performance/Performance";
import AssetManagement from "./screens/assets/AssetManagement";
import AssetProfile     from "./screens/assets/AssetProfile";
import HelpdeskManagement from "./screens/helpdesk/HelpdeskManagement";
import Helpdesk           from "./screens/helpdesk/Helpdesk";
import TicketDetail        from "./screens/helpdesk/TicketDetail";
import LmsManagement  from "./screens/lms/LmsManagement";
import Analytics      from "./screens/analytics/Analytics";
import SystemSettings from "./screens/settings/SystemSettings";
import Calendar       from "./screens/calendar/Calendar";
import DocumentManagement from "./screens/documents/DocumentManagement";
import DocumentProfile     from "./screens/documents/DocumentProfile";
import ExitManagement from "./screens/exit/ExitManagement";
import ShiftManagement from "./screens/shifts/ShiftManagement";
import OrgChart       from "./screens/orgchart/OrgChart";
import HolidayCalendar   from "./screens/holiday/HolidayCalendar";
import ExpenseManagement from "./screens/expense/ExpenseManagement";
import Announcements     from "./screens/announcements/Announcements";
import CommunicationCenter from "./screens/communication/CommunicationCenter";
import WorkflowEngine    from "./screens/workflow/WorkflowEngine";
import EmployeeEngagement from "./screens/engagement/EmployeeEngagement";
import ComplianceManagement from "./screens/compliance/ComplianceManagement";
import VisitorManagement from "./screens/visitors/VisitorManagement";
import ShiftRoster from "./screens/roster/ShiftRoster";
import BenefitsManagement from "./screens/benefits/BenefitsManagement";
import CompensationManagement from "./screens/compensation/CompensationManagement";
import Branches           from "./screens/branches/Branches";
import Designations       from "./screens/designations/Designations";
import ApprovalDashboard  from "./screens/approvals/ApprovalDashboard";
import MyTeam             from "./screens/myteam/MyTeam";
import SelfOnboarding     from "./screens/onboarding-self/SelfOnboarding";

// Super Admin screens
import RoleManagement from "./screens/roles/RoleManagement";
import RoleProfile     from "./screens/roles/RoleProfile";
import UserManagement  from "./screens/superadmin/UserManagement";
import AuditLogs       from "./screens/superadmin/AuditLogs";
import SecurityCenter  from "./screens/superadmin/SecurityCenter";
import Integrations    from "./screens/superadmin/Integrations";
import Billing         from "./screens/superadmin/Billing";
import MultiCompany         from "./screens/superadmin/MultiCompany";
import CompanySettings      from "./screens/superadmin/CompanySettings";
import NotificationCenter   from "./screens/superadmin/NotificationCenter";
import ReportsCenter        from "./screens/reports/ReportsCenter";

// Employee Self-Service screens
import MyProfile      from "./screens/employees/MyProfile";
import MyPayslips     from "./screens/payroll/MyPayslips";
import MyDocuments    from "./screens/documents/MyDocuments";
import MyAssets       from "./screens/assets/MyAssets";
import MyAttendance   from "./screens/attendance/MyAttendance";

// Hooks & permissions
import { useAuth } from "./hooks/useAuth";
import { usePermission } from "./hooks/usePermission";
import { ROLE_ROUTES } from "./constants/permissions";
import logo from "./assets/images/logo.jpeg";

// Helper: wrap a screen with role-based access check
const RoleGuard = ({ routeId, userRole, children }) => {
  const allowed = userRole ? (ROLE_ROUTES[userRole] || []) : [];
  if (!allowed.includes(routeId)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { isLoggedIn, user, userRole, logout } = useAuth();
  const can = usePermission();
  const [opened, { toggle }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const navWidth = collapsed ? 68 : 250;

  // ── Notifications state ────────────────────────────────────────────────────
  const [showNotifs, setShowNotifs] = useState(false);
  const [allRead,    setAllRead]    = useState(false);
  const bellRef = useRef(null);
  const notifs  = NOTIF_BY_ROLE[userRole] || NOTIF_BY_ROLE.EMPLOYEE;

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifs]);

  const roleLabel = ROLE_LABELS[userRole]  || userRole;
  const roleColor = ROLE_COLORS[userRole]  || { bg: "#f1f5f9", text: "#475569" };

  // header colours
  const hdrBg     = dark ? "#1e293b" : "#ffffff";
  const hdrBorder = dark ? "#334155" : "#e2e8f0";
  const hdrText   = dark ? "#f1f5f9" : "#0f172a";
  const hdrSub    = dark ? "#94a3b8" : "#64748b";
  const hdrHover  = dark ? "#0f172a" : "#f1f5f9";

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <Login />;
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: navWidth, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Header style={{ background: hdrBg, borderBottom: `1px solid ${hdrBorder}`, padding: 0 }}>
        <Group h="100%" px={20} justify="space-between" wrap="nowrap" gap={0}>

          {/* ── Left: burger + logo + title ── */}
          <Group gap={10} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color={hdrSub} />
            <img src={logo} alt="MGate" style={{ height: 34, borderRadius: 6 }} />
            <Title order={4} style={{ color: hdrText, fontWeight: 800, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
              MGate HRMS
            </Title>
          </Group>

          {/* ── Center: global search ── */}
          <Box style={{ flex: 1, maxWidth: 440, margin: "0 24px" }}>
            <GlobalSearch userRole={userRole} dark={dark} />
          </Box>

          {/* ── Right: notifications + user ── */}
          <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>

            {/* Bell */}
            <Box ref={bellRef} style={{ position: "relative" }}>
              <ActionIcon
                size={38} radius="xl" variant="subtle"
                onClick={() => setShowNotifs((v) => !v)}
                style={{ color: hdrSub, background: showNotifs ? hdrHover : "transparent" }}
              >
                <Indicator disabled={allRead} color="red" size={8} offset={4} processing={!allRead}>
                  <IconBell size={18} stroke={1.8} />
                </Indicator>
              </ActionIcon>

              {showNotifs && (
                <Paper
                  withBorder shadow="xl" radius="xl" p={0}
                  style={{ position: "absolute", top: 46, right: 0, zIndex: 9999, width: 320, maxHeight: 380, overflowY: "auto",
                           background: hdrBg, border: `1px solid ${hdrBorder}` }}
                >
                  <Group justify="space-between" p="sm" pb="xs"
                    style={{ borderBottom: `1px solid ${hdrBorder}`, position: "sticky", top: 0, background: hdrBg, zIndex: 1 }}>
                    <Text fz="sm" fw={700} c={hdrText}>Notifications</Text>
                    <ActionIcon variant="subtle" size="sm" color="blue"
                      onClick={() => setAllRead(true)} disabled={allRead} title="Mark all read">
                      <IconCheck size={13} stroke={2.5} />
                    </ActionIcon>
                  </Group>
                  {notifs.map((n, i) => (
                    <Group key={n.id} p="sm" wrap="nowrap"
                      style={{ borderBottom: i < notifs.length - 1 ? `1px solid ${hdrBorder}` : "none",
                               opacity: allRead ? 0.5 : 1, cursor: "default" }}>
                      <Box w={8} h={8} style={{ borderRadius: "50%", background: `var(--mantine-color-${n.dotColor}-5)`, flexShrink: 0, marginTop: 4 }} />
                      <Box style={{ flex: 1 }}>
                        <Text fz="sm" fw={allRead ? 400 : 500} c={hdrText}>{n.title}</Text>
                        <Text fz="xs" c={hdrSub} mt={2}>{n.time}</Text>
                      </Box>
                    </Group>
                  ))}
                </Paper>
              )}
            </Box>

            {/* Divider */}
            <Box style={{ width: 1, height: 28, background: hdrBorder, flexShrink: 0 }} />

            {/* User avatar + name + role */}
            <Group gap={8} wrap="nowrap" style={{ cursor: "default" }}>
              <Avatar size={34} radius="xl" color="blue"
                style={{ border: `2px solid ${dark ? "#3b82f6" : "#bfdbfe"}`, fontWeight: 700 }}>
                {getInitials(user?.name || "U")}
              </Avatar>
              <Box visibleFrom="sm">
                <Text fz="sm" fw={600} lh={1.2} c={hdrText} style={{ whiteSpace: "nowrap" }}>
                  {user?.name || "User"}
                </Text>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
                               background: roleColor.bg, color: roleColor.text, whiteSpace: "nowrap" }}>
                  {roleLabel}
                </span>
              </Box>
            </Group>
          </Group>

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
          onToggleDark={toggleColorScheme}
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
            path="/departments/:id"
            element={
              <RoleGuard routeId="departments" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><DepartmentProfile darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/attendance"
            element={
              <RoleGuard routeId="attendance" userRole={userRole}>
                <ScreenWrapper darkMode={dark}>
                  {can("attendance.view_all")
                    ? <Attendance darkMode={dark} />
                    : <MyAttendance darkMode={dark} />
                  }
                </ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/leave"
            element={
              <RoleGuard routeId="leave" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><LeaveManagement darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/payroll"
            element={
              userRole === "EMPLOYEE"
                ? <Navigate to="/my-payslips" replace />
                : <RoleGuard routeId="payroll" userRole={userRole}>
                    <ScreenWrapper darkMode={dark}><PayrollManagement darkMode={dark} /></ScreenWrapper>
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
                <ScreenWrapper darkMode={dark}><OnboardingManagement /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/performance"
            element={
              <RoleGuard routeId="performance" userRole={userRole}>
                <ScreenWrapper darkMode={dark}>
                  {can("performance.view_team")
                    ? <PerformanceManagement darkMode={dark} />
                    : <Performance darkMode={dark} />
                  }
                </ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/assets"
            element={
              <RoleGuard routeId="assets" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><AssetManagement darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <RoleGuard routeId="assets" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><AssetProfile darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/helpdesk"
            element={
              <RoleGuard routeId="helpdesk" userRole={userRole}>
                <ScreenWrapper darkMode={dark}>
                  {can("helpdesk.manage_tickets")
                    ? <HelpdeskManagement darkMode={dark} />
                    : <Helpdesk darkMode={dark} />
                  }
                </ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/helpdesk/:id"
            element={
              <RoleGuard routeId="helpdesk" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><TicketDetail darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/lms"
            element={
              <RoleGuard routeId="lms" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><LmsManagement /></ScreenWrapper>
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
                <ScreenWrapper darkMode={dark}><SystemSettings darkMode={dark} /></ScreenWrapper>
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
                <ScreenWrapper darkMode={dark}><DocumentManagement darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <RoleGuard routeId="documents" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><DocumentProfile darkMode={dark} /></ScreenWrapper>
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

          {/* ── Super Admin–only routes ── */}
          <Route
            path="/roles-permissions"
            element={
              <RoleGuard routeId="roles-permissions" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><RoleManagement darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route
            path="/roles-permissions/:id"
            element={
              <RoleGuard routeId="roles-permissions" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><RoleProfile darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
          <Route path="/user-management" element={
            <RoleGuard routeId="user-management" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><UserManagement darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/audit-logs" element={
            <RoleGuard routeId="audit-logs" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><AuditLogs darkMode={dark} userRole={userRole} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/security" element={
            <RoleGuard routeId="security" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><SecurityCenter darkMode={dark} userRole={userRole} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/integrations" element={
            <RoleGuard routeId="integrations" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><Integrations darkMode={dark} userRole={userRole} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/billing" element={
            <RoleGuard routeId="billing" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><Billing darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/companies" element={
            <RoleGuard routeId="companies" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><MultiCompany darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/company-settings" element={
            <RoleGuard routeId="company-settings" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><CompanySettings darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/notifications" element={
            <RoleGuard routeId="notifications" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><NotificationCenter darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/reports" element={
            <RoleGuard routeId="reports" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><ReportsCenter darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/holiday-calendar" element={
            <RoleGuard routeId="holiday-calendar" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><HolidayCalendar darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/expense" element={
            <RoleGuard routeId="expense" userRole={userRole}>
              <ScreenWrapper darkMode={dark}>
                <ExpenseManagement darkMode={dark} employeeView={!["SUPER_ADMIN","ADMIN","FINANCE"].includes(userRole)} />
              </ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/communications" element={
            <RoleGuard routeId="communications" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><CommunicationCenter darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/workflows" element={
            <RoleGuard routeId="workflows" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><WorkflowEngine darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/branches" element={
            <RoleGuard routeId="branches" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><Branches darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/branches/:id" element={
            <RoleGuard routeId="branches" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><BranchProfile darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/designations" element={
            <RoleGuard routeId="designations" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><Designations darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/designations/:id" element={
            <RoleGuard routeId="designations" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><DesignationProfile darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/announcements" element={
            <RoleGuard routeId="announcements" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><Announcements darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/engagement" element={
            <RoleGuard routeId="engagement" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><EmployeeEngagement darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/compliance" element={
            <RoleGuard routeId="compliance" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><ComplianceManagement darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/visitors" element={
            <RoleGuard routeId="visitors" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><VisitorManagement darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/shift-roster" element={
            <RoleGuard routeId="shift-roster" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><ShiftRoster darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/benefits" element={
            <RoleGuard routeId="benefits" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><BenefitsManagement darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/compensation" element={
            <RoleGuard routeId="compensation" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><CompensationManagement darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />

          {/* ── New feature routes ── */}
          <Route path="/approvals" element={
            <RoleGuard routeId="approvals" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><ApprovalDashboard darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/my-team" element={
            <RoleGuard routeId="my-team" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><MyTeam darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />
          <Route path="/self-onboarding" element={
            <RoleGuard routeId="self-onboarding" userRole={userRole}>
              <ScreenWrapper darkMode={dark}><SelfOnboarding darkMode={dark} /></ScreenWrapper>
            </RoleGuard>
          } />

          {/* ── Employee Self-Service routes ── */}
          <Route
            path="/my-attendance"
            element={
              <RoleGuard routeId="my-attendance" userRole={userRole}>
                <ScreenWrapper darkMode={dark}><MyAttendance darkMode={dark} /></ScreenWrapper>
              </RoleGuard>
            }
          />
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
