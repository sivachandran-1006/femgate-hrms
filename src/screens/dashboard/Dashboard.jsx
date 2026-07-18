import { Group, Text, Box } from "@mantine/core";

import { useAuth }              from "../../hooks/useAuth";
import { usePermission }        from "../../hooks/usePermission";

import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { AdminDashboard }      from "./components/AdminDashboard";
import { HRDashboard }         from "./components/HRDashboard";
import { ManagerDashboard }    from "./components/ManagerDashboard";
import { FinanceDashboard }    from "./components/FinanceDashboard";
import { EmployeeDashboard }   from "./components/EmployeeDashboard";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const can = usePermission();
  const { data: employees = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: leaves    = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const ROLE_WELCOME = {
    SUPER_ADMIN: "Full system overview",
    ADMIN:       "Operational administrator dashboard",
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
      {can("company.manage")                                                                               && <SuperAdminDashboard />}
      {can("employees.add")          && !can("company.manage")                                            && <AdminDashboard      employees={employees} leaves={leaves} />}
      {can("attendance.view_all")    && !can("employees.add")  && !can("company.manage")                  && <HRDashboard         employees={employees} leaves={leaves} />}
      {can("leave.approve")          && !can("attendance.view_all") && !can("company.manage")             && <ManagerDashboard    employees={employees} leaves={leaves} user={user} />}
      {can("payroll.generate")       && !can("employees.add")  && !can("company.manage")                  && <FinanceDashboard    employees={employees} />}
      {can("helpdesk.manage_tickets") && !can("employees.add") && !can("payroll.generate") && !can("company.manage") && <EmployeeDashboard leaves={leaves} user={user} />}
      {!can("company.manage") && !can("employees.add") && !can("attendance.view_all") && !can("leave.approve") && !can("payroll.generate") && !can("helpdesk.manage_tickets") && <EmployeeDashboard leaves={leaves} user={user} />}
    </Box>
  );
};

export default Dashboard;
