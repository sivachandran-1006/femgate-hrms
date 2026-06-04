import { SimpleGrid, Box, Group, Text, Progress } from "@mantine/core";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, UserCheck, Clock, Calendar } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { ATTENDANCE_WEEK, ANNOUNCEMENTS } from "../data";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box p="sm" style={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
      <Text fw={600} fz="sm" mb={4}>{label}</Text>
      {payload.map((p) => (
        <Text key={p.dataKey} fz="sm" c={p.color}>{p.name}: <Text span fw={700}>{p.value}</Text></Text>
      ))}
    </Box>
  );
};

export const HRDashboard = ({ employees, leaves }) => {
  const total         = employees.length;
  const present       = employees.filter((e)=>e.status==="Present").length;
  const pendingLeaves = leaves.filter((l)=>l.status==="Pending").length;
  const approvedLeaves= leaves.filter((l)=>l.status==="Approved").length;
  const attendPct     = total>0?Math.round((present/total)*100):0;

  const deptDist = Object.entries(
    employees.reduce((acc,e)=>{ acc[e.department]=(acc[e.department]||0)+1; return acc; },{})
  ).map(([name,value],i)=>({ name,value, color:["blue","violet","green","yellow"][i%4] }));

  const leaveByType = leaves.reduce((acc,l)=>{ const t=l.leaveType||"Other"; acc[t]=(acc[t]||0)+1; return acc; },{});
  const leaveTypeData = Object.entries(leaveByType).map(([name,value],i)=>({ name,value,color:["var(--mantine-color-yellow-5)","var(--mantine-color-red-5)","var(--mantine-color-blue-5)","var(--mantine-color-violet-5)"][i%4] }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<Users/>}     label="Total Employees"    value={total}         sub={`${new Set(employees.map(e=>e.department)).size} departments`} color="blue" trend="+3" up/>
        <AppStatCard icon={<UserCheck/>} label="Present Today"      value={present}       sub={`${attendPct}% attendance`}  color="green" trend="+2%" up/>
        <AppStatCard icon={<Clock/>}     label="Pending Approvals"  value={pendingLeaves} sub="Leave requests waiting"      color="red"/>
        <AppStatCard icon={<Calendar/>}  label="Approved Leaves"    value={approvedLeaves}sub="This month"                  color="yellow"/>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="Weekly Attendance" sub="Present / Absent / Leave — this week">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATTENDANCE_WEEK} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)"/>
              <XAxis dataKey="day" tick={{ fontSize:12,fill:"var(--mantine-color-dimmed)" }}/>
              <YAxis tick={{ fontSize:12,fill:"var(--mantine-color-dimmed)" }}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:12 }}/>
              <Bar dataKey="present" name="Present" fill="var(--mantine-color-green-5)" radius={[3,3,0,0]}/>
              <Bar dataKey="absent"  name="Absent"  fill="var(--mantine-color-red-5)"  radius={[3,3,0,0]}/>
              <Bar dataKey="leave"   name="Leave"   fill="var(--mantine-color-yellow-5)" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Leave by Type" sub="All leave requests">
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={leaveTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={3}>
                {leaveTypeData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <Box style={{ display:"flex", flexDirection:"column", gap:8 }} mt="sm">
            {leaveTypeData.map((d)=>(
              <Group key={d.name} justify="space-between">
                <Group gap={6}>
                  <Box w={8} h={8} style={{ borderRadius:"50%",background:d.color }}/>
                  <Text fz="xs" c="dimmed">{d.name}</Text>
                </Group>
                <Text fz="xs" fw={700}>{d.value}</Text>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="Department Distribution" sub={`${total} employees`}>
          <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {deptDist.map((d)=>{
              const pct = Math.round((d.value/total)*100);
              return (
                <Box key={d.name}>
                  <Group justify="space-between" mb={4}>
                    <Text fz="sm" fw={500}>{d.name}</Text>
                    <Text fz="xs" c="dimmed">{d.value} ({pct}%)</Text>
                  </Group>
                  <Progress value={pct} color={d.color} size="sm" radius="xl" />
                </Box>
              );
            })}
          </Box>
        </AppSection>

        <AppSection title="Announcements" sub="Company-wide notices">
          <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {ANNOUNCEMENTS.slice(0,4).map((a,i,arr)=>(
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i<arr.length-1?"1px solid var(--mantine-color-default-border)":"none", alignItems:"flex-start" }}>
                <Box w={3} style={{ background:`var(--mantine-color-${a.color}-5)`, alignSelf:"stretch", borderRadius:4 }}/>
                <Box>
                  <Text fz="sm" fw={600}>{a.title}</Text>
                  <Text fz="xs" c="dimmed" mt={2}>{a.date}</Text>
                </Box>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>
    </>
  );
};
