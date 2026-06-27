import { SimpleGrid, Text, Badge, Table, Loader, Center } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { IconWallet, IconTrendingUp, IconAward, IconShieldCheck } from "@tabler/icons-react";
import { AppTable } from "../../../components/ui/AppTable";
import { getDashboardSummary, getPayrollSummary } from "../../../api/dashboardApi";
import { KpiCard, PanelCard, ChartTooltip, fmtMoney, SPARK_HEX } from "./DashboardKit";

const fmtINR = (v) => `₹${(v / 1000).toFixed(0)}k`;
const ramp = (v) => [v * 0.9, v * 0.93, v * 0.96, v].map(Math.round);

export const FinanceDashboard = ({ employees }) => {
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary, select: (r) => r?.data ?? r });
  const { data: payrollData, isLoading: loadPay } = useQuery({ queryKey: ["dashboard-payroll"], queryFn: getPayrollSummary, select: (r) => r?.data ?? r });

  if (loadSum || loadPay) return <Center py="xl"><Loader /></Center>;

  const totalSalary  = summaryData?.totalSalary || employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const avgSalary    = summaryData?.avgSalary   || (employees.length > 0 ? Math.round(totalSalary / employees.length) : 0);
  const maxSalary    = Math.max(...employees.map((e) => Number(e.salary) || 0), 0);

  const payrollMonths = (payrollData?.months || []).map((m) => ({ month: m.label, payroll: m.net, gross: m.gross }));

  const deptPayroll = (summaryData?.departments || []).map((d) => ({
    dept: d.name,
    total: d.count * avgSalary,
  }));

  const payrollSpark = payrollMonths.length > 1 ? payrollMonths.map((m) => m.payroll) : ramp(totalSalary);

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <KpiCard icon={IconWallet}      label="Total Monthly Payroll" value={fmtMoney(totalSalary)} sub="All employees"    color="violet" trend="4%" up spark={payrollSpark} />
        <KpiCard icon={IconTrendingUp}  label="Average Salary"        value={fmtMoney(avgSalary)}   sub="Per employee"     color="blue"  spark={ramp(avgSalary)} />
        <KpiCard icon={IconAward}       label="Highest Salary"        value={fmtMoney(maxSalary)}   sub="Top earner"       color="green" spark={ramp(maxSalary)} />
        <KpiCard icon={IconShieldCheck} label="Payroll Records"       value={payrollData?.months?.length || 0} sub="Months processed" color="cyan" spark={ramp(payrollData?.months?.length || 0)} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <PanelCard title="Payroll Trend" sub="Monthly net payroll">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={payrollMonths}>
              <defs>
                <linearGradient id="finPayroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SPARK_HEX.violet} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={SPARK_HEX.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tickFormatter={fmtINR} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="payroll" name="Net Payroll" stroke={SPARK_HEX.violet} strokeWidth={2.5} fill="url(#finPayroll)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Payroll by Department" sub="Estimated based on avg salary">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={deptPayroll} barSize={16} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" horizontal={false} />
              <XAxis type="number" tickFormatter={fmtINR} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis type="category" dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} width={80} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--mantine-color-default-hover)" }} />
              <Bar dataKey="total" name="Payroll" fill={SPARK_HEX.violet} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>
      </SimpleGrid>

      <PanelCard title="Employee Salary Breakdown" p={0}>
        <AppTable
          headers={["Employee", "Department", "Salary", "Band"]}
          data={[...employees].sort((a, b) => (Number(b.salary) || 0) - (Number(a.salary) || 0))}
          renderRow={(e, i) => {
            const sal  = Number(e.salary) || 0;
            const band = sal >= 80000 ? { label: "Senior", color: "violet" } : sal >= 65000 ? { label: "Mid", color: "blue" } : { label: "Junior", color: "green" };
            return (
              <Table.Tr key={e.id || e._id || i}>
                <Table.Td><Text fz="sm" fw={600}>{e.name}</Text></Table.Td>
                <Table.Td><Text fz="sm" c="dimmed">{e.department}</Text></Table.Td>
                <Table.Td><Text fz="sm" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>{fmtMoney(sal)}</Text></Table.Td>
                <Table.Td><Badge color={band.color} variant="light">{band.label}</Badge></Table.Td>
              </Table.Tr>
            );
          }}
        />
      </PanelCard>
    </>
  );
};
