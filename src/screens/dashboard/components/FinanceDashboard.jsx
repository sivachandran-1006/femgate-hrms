import { SimpleGrid, Box, Group, Text, Badge, Table } from "@mantine/core";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, Award, ShieldCheck } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { AppTable } from "../../../components/ui/AppTable";
import { PAYROLL_MONTHS } from "../data";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box p="sm" style={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
      <Text fw={600} fz="sm" mb={4}>{label}</Text>
      {payload.map((p) => (
        <Text key={p.dataKey} fz="sm" c={p.color}>{p.name}: <Text span fw={700}>₹{p.value?.toLocaleString("en-IN")}</Text></Text>
      ))}
    </Box>
  );
};

const fmtINR = (v) => `₹\${(v/1000).toFixed(0)}k`;

export const FinanceDashboard = ({ employees }) => {
  const totalPayroll = employees.reduce((s,e)=>s+(Number(e.salary)||0),0);
  const avgSalary    = employees.length>0?Math.round(totalPayroll/employees.length):0;
  const maxSalary    = Math.max(...employees.map((e)=>Number(e.salary)||0),0);

  const deptPayroll = Object.entries(
    employees.reduce((acc,e)=>{ acc[e.department]=(acc[e.department]||0)+(Number(e.salary)||0); return acc; },{})
  ).map(([dept,total])=>({ dept,total }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<Wallet/>}     label="Total Monthly Payroll" value={`₹\${(totalPayroll/1000).toFixed(0)}k`}  sub="All employees"   color="violet"  trend="+4%" up/>
        <AppStatCard icon={<TrendingUp/>} label="Average Salary"        value={`₹\${(avgSalary/1000).toFixed(1)}k`}     sub="Per employee"    color="blue" />
        <AppStatCard icon={<Award/>}      label="Highest Salary"        value={`₹\${(maxSalary/1000).toFixed(0)}k`}     sub="Top earner"      color="green" />
        <AppStatCard icon={<ShieldCheck/>}label="Payroll Status"        value="On Track"                               sub="Jun 2026 payroll" color="cyan"    />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="Payroll Trend" sub="Monthly payroll spend — Jan–Jun 2026">
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={PAYROLL_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)"/>
              <XAxis dataKey="month" tick={{ fontSize:12,fill:"var(--mantine-color-dimmed)" }}/>
              <YAxis tickFormatter={fmtINR} tick={{ fontSize:12,fill:"var(--mantine-color-dimmed)" }}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke="var(--mantine-color-violet-6)" strokeWidth={2.5} dot={{ fill:"var(--mantine-color-violet-6)",r:4 }} activeDot={{ r:6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Payroll by Department">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={deptPayroll} barSize={28} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)"/>
              <XAxis type="number" tickFormatter={fmtINR} tick={{ fontSize:12,fill:"var(--mantine-color-dimmed)" }}/>
              <YAxis type="category" dataKey="dept" tick={{ fontSize:12,fill:"var(--mantine-color-dimmed)" }} width={80}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="total" name="Payroll" fill="var(--mantine-color-violet-5)" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </AppSection>
      </SimpleGrid>

      <AppSection title="Employee Salary Breakdown" noPadding>
        <AppTable 
          headers={["Employee", "Department", "Salary", "Band"]}
          data={[...employees].sort((a,b)=>(Number(b.salary)||0)-(Number(a.salary)||0))}
          renderRow={(e, i) => {
            const sal  = Number(e.salary)||0;
            const band = sal>=80000?{ label:"Senior",color:"violet" }:sal>=65000?{ label:"Mid",color:"blue" }:{ label:"Junior",color:"green" };
            return (
              <Table.Tr key={e._id}>
                <Table.Td><Text fz="sm" fw={600}>{e.name}</Text></Table.Td>
                <Table.Td><Text fz="sm" c="dimmed">{e.department}</Text></Table.Td>
                <Table.Td><Text fz="sm" fw={700}>₹{sal.toLocaleString("en-IN")}</Text></Table.Td>
                <Table.Td><Badge color={band.color} variant="light">{band.label}</Badge></Table.Td>
              </Table.Tr>
            );
          }}
        />
      </AppSection>
    </>
  );
};
