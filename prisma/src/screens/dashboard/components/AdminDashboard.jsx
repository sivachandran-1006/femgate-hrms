import { SimpleGrid, Box, Group, Text, Progress, Avatar, ActionIcon, Badge } from "@mantine/core";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, UserCheck, UserMinus, Clock, Wallet, Calendar } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { getInitials } from "../../../utils/helpers";
import { MONTHLY_HEADCOUNT, ATTENDANCE_WEEK, PAYROLL_MONTHS, LEAVE_PIPELINE, ANNOUNCEMENTS, UPCOMING_EVENTS, RECENT_ACTIVITY, ACTIVITY_ICON } from "../data";

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

const fmtINR = (v) => `₹${(v/1000).toFixed(0)}k`;

export const AdminDashboard = ({ employees, leaves }) => {
  const total        = employees.length;
  const present      = employees.filter((e) => e.status==="Present").length;
  const onLeave      = employees.filter((e) => e.status==="Leave").length;
  const absent       = Math.max(0, total - present - onLeave);
  const pendingLeaves= leaves.filter((l) => l.status==="Pending").length;
  const attendPct    = total>0 ? Math.round((present/total)*100) : 0;
  const totalPayroll = employees.reduce((s,e)=>s+(Number(e.salary)||0),0);
  const avgSalary    = total>0 ? Math.round(totalPayroll/total) : 0;
  const deptCount    = new Set(employees.map((e)=>e.department).filter(Boolean)).size;

  const deptDist = Object.entries(
    employees.reduce((acc,e)=>{ acc[e.department]=(acc[e.department]||0)+1; return acc; },{})
  ).map(([name,value],i)=>({ name,value, color:["blue","violet","green","yellow","cyan","orange"][i%6] }));

  const attendancePie = [
    { name:"Present", value:present, color:"var(--mantine-color-green-5)" },
    { name:"Absent",  value:absent,  color:"var(--mantine-color-red-5)"  },
    { name:"Leave",   value:onLeave, color:"var(--mantine-color-yellow-5)" },
  ].filter((d)=>d.value>0);

  const TopPerformers = employees
    .filter((e)=>Number(e.score)>0)
    .sort((a,b)=>Number(b.score)-Number(a.score))
    .slice(0,4)
    .map((e)=>({ name:e.name, dept:e.department, score:Number(e.score) }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md" mb="md">
        <AppStatCard icon={<Users/>}     label="Total Employees"   value={total}        sub={`${deptCount} departments`}                               color="blue" trend="+3"  up/>
        <AppStatCard icon={<UserCheck/>} label="Present Today"     value={present}      sub={`${attendPct}% attendance`}                              color="green" trend="+2%" up/>
        <AppStatCard icon={<UserMinus/>} label="On Leave"          value={onLeave}      sub="Active leave requests"                                   color="yellow" trend="-1"  up={false}/>
        <AppStatCard icon={<Clock/>}     label="Pending Approvals" value={pendingLeaves}sub="Awaiting HR review"                                      color="red" trend="+2"  up={false}/>
        <AppStatCard icon={<Wallet/>}    label="Monthly Payroll"   value={`₹${(totalPayroll/1000).toFixed(0)}k`} sub={`Avg ₹${avgSalary.toLocaleString("en-IN")}`} color="violet" trend="+4%" up/>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <AppSection title="Headcount Growth" sub="Monthly employee count — 2026">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_HEADCOUNT}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)"/>
              <XAxis dataKey="month" tick={{ fontSize:12, fill:"var(--mantine-color-dimmed)" }}/>
              <YAxis tick={{ fontSize:12, fill:"var(--mantine-color-dimmed)" }}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="employees" name="Employees" stroke="var(--mantine-color-blue-6)" fill="var(--mantine-color-blue-1)" strokeWidth={2.5} dot={false}/>
              <Area type="monotone" dataKey="joiners"   name="Joiners"   stroke="var(--mantine-color-green-6)" fill="none" strokeWidth={2} strokeDasharray="4 3" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Today's Attendance" sub={`${present} present of ${total}`}>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={attendancePie} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={2}>
                {attendancePie.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <Group grow mt="sm" gap={4}>
            {attendancePie.map((d)=>(
              <Box key={d.name}>
                <Group gap={4} wrap="nowrap"><Box w={8} h={8} style={{ borderRadius: "50%", background: d.color }} /><Text fz="xs" c="dimmed">{d.name}</Text></Group>
                <Text fz="sm" fw={700}>{d.value}</Text>
              </Box>
            ))}
          </Group>
        </AppSection>

        <AppSection title="Today's Numbers" noPadding>
          <Box p="md" pb="xs">
            {[
              { label:"Present",        value:present,       color:"green", pct:attendPct },
              { label:"Absent",         value:absent,        color:"red",  pct:total>0?Math.round(absent/total*100):0 },
              { label:"On Leave",       value:onLeave,       color:"yellow", pct:total>0?Math.round(onLeave/total*100):0 },
              { label:"Pending Leaves", value:pendingLeaves, color:"violet",  pct:null },
              { label:"Departments",    value:deptCount,     color:"cyan",    pct:null },
            ].map(({ label,value,color,pct },i,arr)=>(
              <Box key={label} py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Group justify="space-between" mb={pct !== null ? 4 : 0}>
                  <Text fz="sm" c="dimmed">{label}</Text>
                  <Text fz="sm" fw={700} c={color}>{value}{pct!==null?` (${pct}%)`:""}</Text>
                </Group>
                {pct !== null && <Progress value={pct} color={color} size="sm" radius="xl" />}
              </Box>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="Weekly Attendance" sub="Present / Absent / Leave — this week">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={ATTENDANCE_WEEK} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)"/>
              <XAxis dataKey="day" tick={{ fontSize:12, fill:"var(--mantine-color-dimmed)" }}/>
              <YAxis tick={{ fontSize:12, fill:"var(--mantine-color-dimmed)" }}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Legend wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="present" name="Present" fill="var(--mantine-color-green-5)" radius={[3,3,0,0]}/>
              <Bar dataKey="absent"  name="Absent"  fill="var(--mantine-color-red-5)"  radius={[3,3,0,0]}/>
              <Bar dataKey="leave"   name="Leave"   fill="var(--mantine-color-yellow-5)" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Dept Distribution" sub={`${total} employees · ${deptCount} depts`}>
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
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <AppSection title="Payroll Trend" sub="Monthly payroll spend — Jan–Jun 2026">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={PAYROLL_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)"/>
              <XAxis dataKey="month" tick={{ fontSize:12, fill:"var(--mantine-color-dimmed)" }}/>
              <YAxis tickFormatter={fmtINR} tick={{ fontSize:12, fill:"var(--mantine-color-dimmed)" }}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Line type="monotone" dataKey="payroll" name="Payroll" stroke="var(--mantine-color-violet-6)" strokeWidth={2.5} dot={{ fill:"var(--mantine-color-violet-6)", r:4 }} activeDot={{ r:6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Leave by Type" sub="Approved requests this month">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={LEAVE_PIPELINE} dataKey="value" cx="50%" cy="50%" outerRadius={52} innerRadius={28} paddingAngle={3}>
                {LEAVE_PIPELINE.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <Box style={{ display:"flex", flexDirection:"column", gap:8 }} mt="sm">
            {LEAVE_PIPELINE.map((d)=>(
              <Group key={d.name} justify="space-between">
                <Group gap={6}>
                  <Box w={8} h={8} style={{ borderRadius: "50%", background: d.color }} />
                  <Text fz="xs" c="dimmed">{d.name}</Text>
                </Group>
                <Text fz="xs" fw={700}>{d.value}</Text>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Top Performers" sub="Q2 2026 leaderboard" noPadding>
          <Box p="md" pb="xs">
            {TopPerformers.map((p,i,arr)=>{
              return (
                <Group key={p.name} wrap="nowrap" py="xs" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                  <Avatar radius="xl" color="blue" size="sm">{getInitials(p.name)}</Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz="sm" fw={600} truncate>{p.name}</Text>
                    <Text fz="xs" c="dimmed">{p.dept}</Text>
                  </Box>
                  <Box ta="right">
                    <Text fz="sm" fw={700} c="green">{p.score}</Text>
                    <Text fz="xs" c="dimmed">score</Text>
                  </Box>
                </Group>
              );
            })}
          </Box>
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <AppSection title="Recent Activity" sub="Latest HR events across the org">
          <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {RECENT_ACTIVITY.map((a)=>{
              const type = ACTIVITY_ICON[a.type]||ACTIVITY_ICON.attend;
              return (
                <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Avatar radius="xl" color="blue" size="sm">{getInitials(a.name)}</Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz="sm" fw={600} truncate>{a.name}</Text>
                    <Text fz="xs" c="dimmed">{a.action}</Text>
                  </Box>
                  <Box ta="right">
                    <ActionIcon variant="light" color={type.color} size="sm" radius="xl">{type.icon}</ActionIcon>
                    <Text fz={10} c="dimmed" mt={2}>{a.time}</Text>
                  </Box>
                </Group>
              );
            })}
          </Box>
        </AppSection>

        <AppSection title="Announcements" sub="Company-wide notices">
          <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {ANNOUNCEMENTS.map((a,i,arr)=>(
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none", alignItems: "flex-start" }}>
                <Box w={3} style={{ background: `var(--mantine-color-${a.color}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text fz="sm" fw={600}>{a.title}</Text>
                    <Badge color={a.color} variant="light" size="xs">{a.tag}</Badge>
                  </Group>
                  <Group gap={4} mt={4}>
                    <Calendar size={10} color="var(--mantine-color-dimmed)" />
                    <Text fz="xs" c="dimmed">{a.date}</Text>
                  </Group>
                </Box>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Upcoming Events" sub="Next 30 days">
          <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {UPCOMING_EVENTS.map((e,i,arr)=>(
              <Group key={i} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                <Box w={40} h={40} style={{ background: `var(--mantine-color-${e.color}-0)`, borderRadius: "var(--mantine-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Text fz={9} fw={700} c={e.color} tt="uppercase">{e.date.split(" ")[0]}</Text>
                  <Text fz="sm" fw={700} c={e.color} lh={1}>{e.date.split(" ")[1]}</Text>
                </Box>
                <Text fz="sm" fw={500}>{e.label}</Text>
              </Group>
            ))}
          </Box>
        </AppSection>
      </SimpleGrid>
    </>
  );
};
