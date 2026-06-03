import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Group, Text, Avatar, Indicator, ActionIcon, Paper, Box } from "@mantine/core";

import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useFetchAllLeaves }    from "../../queries/useLeaves";
import { AppLoader }            from "../../components/ui/AppLoader";
import { useAuth }              from "../../hooks/useAuth";
import { getInitials }          from "../../utils/helpers";
import { NOTIF_BY_ROLE }        from "./data";

import { AdminDashboard }   from "./components/AdminDashboard";
import { HRDashboard }      from "./components/HRDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { FinanceDashboard } from "./components/FinanceDashboard";
import { EmployeeDashboard }from "./components/EmployeeDashboard";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const { data: employees = [], isLoading: loadEmp  } = useFetchAllEmployees();
  const { data: leaves    = [], isLoading: loadLeave } = useFetchAllLeaves();

  const [showNotifs, setShowNotifs] = useState(false);
  const [allRead,    setAllRead]    = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifs]);

  if (loadEmp || loadLeave) return <AppLoader fullScreen />;

  const today  = new Date().toLocaleDateString("en-IN",{ weekday:"long",day:"numeric",month:"long",year:"numeric" });
  const notifs = NOTIF_BY_ROLE[userRole] || NOTIF_BY_ROLE.EMPLOYEE;

  const ROLE_WELCOME = {
    SUPER_ADMIN: "Full system overview",
    ADMIN:       "Full system overview",
    HR:          "HR & people operations",
    MANAGER:     "Your team at a glance",
    FINANCE:     "Payroll & compensation",
    EMPLOYEE:    "Your personal workspace",
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <Box>
          <Text fz={24} fw={800}>
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </Text>
          <Text fz="sm" c="dimmed" mt={4}>
            {ROLE_WELCOME[userRole] || "Dashboard"} &nbsp;·&nbsp; {today}
          </Text>
        </Box>

        <Group gap="sm">
          {/* Bell */}
          <Box ref={bellRef} style={{ position: "relative" }}>
            <ActionIcon size="xl" radius="xl" variant="default" onClick={() => setShowNotifs((v) => !v)}>
              <Indicator disabled={allRead} color="red" size={12} label={notifs.length} inline>
                <Bell size={18} />
              </Indicator>
            </ActionIcon>
            {showNotifs && (
              <Paper withBorder shadow="md" radius="md" p={0} style={{ position: "absolute", top: 48, right: 0, zIndex: 1000, width: 320, maxHeight: 380, overflowY: "auto" }}>
                <Group justify="space-between" p="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)", position: "sticky", top: 0, background: "var(--mantine-color-body)", zIndex: 1 }}>
                  <Text fz="sm" fw={700}>Notifications</Text>
                  <ActionIcon variant="transparent" size="sm" color="blue" onClick={() => setAllRead(true)} disabled={allRead}>
                    <CheckCheck size={14} />
                  </ActionIcon>
                </Group>
                {notifs.map((n, i) => (
                  <Group key={n.id} p="sm" wrap="nowrap" style={{ borderBottom: i < notifs.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", opacity: allRead ? 0.5 : 1 }}>
                    <Box w={8} h={8} style={{ borderRadius: "50%", background: `var(--mantine-color-${n.dotColor}-5)`, flexShrink: 0, marginTop: 4 }} />
                    <Box style={{ flex: 1 }}>
                      <Text fz="sm" fw={allRead ? 400 : 500}>{n.title}</Text>
                      <Text fz="xs" c="dimmed" mt={2}>{n.time}</Text>
                    </Box>
                  </Group>
                ))}
              </Paper>
            )}
          </Box>
          {/* Avatar */}
          <Avatar color="blue" radius="xl">{getInitials(user?.name || "User")}</Avatar>
        </Group>
      </Group>

      {/* ── Role-specific content ── */}
      {(userRole==="SUPER_ADMIN"||userRole==="ADMIN") && <AdminDashboard employees={employees} leaves={leaves} />}
      {userRole==="HR" && <HRDashboard employees={employees} leaves={leaves} />}
      {userRole==="MANAGER" && <ManagerDashboard employees={employees} leaves={leaves} user={user} />}
      {userRole==="FINANCE" && <FinanceDashboard employees={employees} />}
      {userRole==="EMPLOYEE" && <EmployeeDashboard leaves={leaves} user={user} />}
    </Box>
  );
};

export default Dashboard;
