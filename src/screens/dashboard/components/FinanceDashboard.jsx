import { SimpleGrid, Text, Badge, Table, Loader, Center } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IconWallet, IconTrendingUp, IconAward, IconShieldCheck } from "@tabler/icons-react";
import { AppTable } from "../../../components/ui/AppTable";
import { KpiCard, PanelCard, ChartTooltip, fmtMoney, SPARK_HEX } from "./DashboardKit";

const fmtINR = (v) => `₹${(v / 1000).toFixed(0)}k`;
const ramp = (v) => [v * 0.9, v * 0.93, v * 0.96, v].map(Math.round);

const MOCK_SUMMARY = {
  totalSalary: 9820000,
  avgSalary: 73284,
  departments: [
    { name: "Engineering",  count: 42 },
    { name: "Sales",        count: 28 },
    { name: "HR",           count: 14 },
    { name: "Finance",      count: 18 },
    { name: "Operations",   count: 32 },
  ],
};

const MOCK_PAYROLL = {
  months: [
    { label: "Feb", net: 9200000, gross: 10120000 },
    { label: "Mar", net: 9380000, gross: 10300000 },
    { label: "Apr", net: 9510000, gross: 10450000 },
    { label: "May", net: 9640000, gross: 10580000 },
    { label: "Jun", net: 9820000, gross: 10790000 },
  ],
};

const MOCK_EMPLOYEES = [
  { id: "E001", name: "Arjun Mehta",      department: "Engineering",  salary: 95000 },
  { id: "E002", name: "Divya Krishnan",   department: "Engineering",  salary: 105000 },
  { id: "E003", name: "Sneha Iyer",       department: "Finance",      salary: 74000 },
  { id: "E004", name: "Priya Sharma",     department: "HR",           salary: 72000 },
  { id: "E005", name: "Rahul Nair",       department: "Sales",        salary: 68000 },
  { id: "E006", name: "Kiran Patel",      department: "Operations",   salary: 58000 },
  { id: "E007", name: "Vikram Reddy",     department: "Engineering",  salary: 88000 },
  { id: "E008", name: "Ananya Bose",      department: "Finance",      salary: 80000 },
  { id: "E009", name: "Suresh Kumar",     department: "Sales",        salary: 65000 },
  { id: "E010", name: "Meena Pillai",     department: "Operations",   salary: 62000 },
];

export const FinanceDashboard = ({ employees: empProp }) => {
  const { data: summaryData, isLoading: loadSum } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: payrollData, isLoading: loadPay } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  if (loadSum || loadPay) return <Center py="xl"><Loader /></Center>;

  const employees   = empProp?.length ? empProp : MOCK_EMPLOYEES;
  const rawSummary  = summaryData ?? MOCK_SUMMARY;
  const rawPayroll  = payrollData ?? MOCK_PAYROLL;

  const totalSalary  = rawSummary?.totalSalary || employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const avgSalary    = rawSummary?.avgSalary   || (employees.length > 0 ? Math.round(totalSalary / employees.length) : 0);
  const maxSalary    = Math.max(...employees.map((e) => Number(e.salary) || 0), 0);

  const payrollMonths = (rawPayroll?.months || []).map((m) => ({ month: m.label, payroll: m.net, gross: m.gross }));

  const deptPayroll = (rawSummary?.departments || []).map((d) => ({
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
        <KpiCard icon={IconShieldCheck} label="Payroll Records"       value={rawPayroll?.months?.length || 0} sub="Months processed" color="cyan" spark={ramp(rawPayroll?.months?.length || 0)} />
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
