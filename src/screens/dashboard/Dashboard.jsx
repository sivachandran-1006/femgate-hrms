import { Group, Text, Box } from "@mantine/core";

import { useFetchAllEmployees } from "../../queries/useEmployees";
import { useFetchAllLeaves }    from "../../queries/useLeaves";
import { AppLoader }            from "../../components/ui/AppLoader";
import { useAuth }              from "../../hooks/useAuth";
import { usePermission }        from "../../hooks/usePermission";

import { AdminDashboard }    from "./components/AdminDashboard";
import { HRDashboard }       from "./components/HRDashboard";
import { ManagerDashboard }  from "./components/ManagerDashboard";
import { FinanceDashboard }  from "./components/FinanceDashboard";
import { EmployeeDashboard } from "./components/EmployeeDashboard";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const can = usePermission();
  const { data: employees = [], isLoading: loadEmp  } = useFetchAllEmployees();
  const { data: leaves    = [], isLoading: loadLeave } = useFetchAllLeaves();

  if (loadEmp || loadLeave) return <AppLoader fullScreen />;

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const ROLE_WELCOME = {
    SUPER_ADMIN: "Full system overview",
    ADMIN:       "Full system overview",
    HR:          "HR & people operations",
    MANAGER:     "Your team at a glance",
    FINANCE:     "Payroll & compensation",
    IT_ADMIN:    "IT systems & support",
    EMPLOYEE:    "Your personal workspace",
  };

  return (
    <Box>
      {/* ── Welcome ── */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <Box>
          <Text fz={24} fw={800}>
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </Text>
          <Text fz="sm" c="dimmed" mt={4}>
            {ROLE_WELCOME[userRole] || "Dashboard"} &nbsp;·&nbsp; {today}
          </Text>
        </Box>
      </Group>

      {/* ── Role-specific content ── */}
      {can("employees.add")                                                                         && <AdminDashboard   employees={employees} leaves={leaves} />}
      {can("attendance.view_all")    && !can("employees.add")                                      && <HRDashboard      employees={employees} leaves={leaves} />}
      {can("leave.approve")          && !can("attendance.view_all")                                && <ManagerDashboard employees={employees} leaves={leaves} user={user} />}
      {can("payroll.generate")       && !can("employees.add")                                      && <FinanceDashboard employees={employees} />}
      {can("helpdesk.manage_tickets") && !can("employees.add") && !can("payroll.generate")         && <EmployeeDashboard leaves={leaves} user={user} />}
      {!can("employees.add") && !can("attendance.view_all") && !can("leave.approve") && !can("payroll.generate") && !can("helpdesk.manage_tickets") && <EmployeeDashboard leaves={leaves} user={user} />}
    </Box>
  );
};

export default Dashboard;
