import { SimpleGrid, Box, Group, Text, Progress, Badge } from "@mantine/core";
import { UserCheck, Calendar, Clock, Target } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { UPCOMING_EVENTS, ANNOUNCEMENTS } from "../data";

export const EmployeeDashboard = ({ leaves, user }) => {
  const myLeaves      = leaves.filter((l)=>l.employee===user?.name);
  const approvedLeaves= myLeaves.filter((l)=>l.status==="Approved").length;
  const pendingLeaves = myLeaves.filter((l)=>l.status==="Pending").length;
  const usedDays      = myLeaves.filter((l)=>l.status==="Approved").reduce((s,l)=>s+(Number(l.days)||0),0);
  const leaveBal      = [
    { label:"Annual Leave",  total:18, used:usedDays>5?5:usedDays, color:"blue" },
    { label:"Sick Leave",    total:12, used:2,                      color:"red" },
    { label:"Casual Leave",  total:10, used:1,                      color:"yellow" },
  ];

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<UserCheck/>}  label="Attendance Today"  value="Present"       sub="Checked in 09:05 AM"      color="green" />
        <AppStatCard icon={<Calendar/>}   label="Approved Leaves"   value={approvedLeaves} sub="This year"               color="blue" />
        <AppStatCard icon={<Clock/>}      label="Pending Requests"  value={pendingLeaves}  sub="Awaiting approval"       color="yellow" />
        <AppStatCard icon={<Target/>}     label="Performance Score" value="80"             sub="Q2 2026"                  color="violet" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <AppSection title="My Leave Balance" sub="Current year allocation">
          <Box style={{ display:"flex", flexDirection:"column", gap:"var(--mantine-spacing-md)" }}>
            {leaveBal.map((b)=>{
              const remaining = b.total-b.used;
              const pct = Math.round((b.used/b.total)*100);
              return (
                <Box key={b.label}>
                  <Group justify="space-between" mb={4}>
                    <Text fz="sm" fw={600}>{b.label}</Text>
                    <Text fz="xs" c="dimmed">{remaining}/{b.total} days left</Text>
                  </Group>
                  <Progress value={pct} color={b.color} size="md" radius="xl" />
                  <Text fz="xs" c={b.color} fw={600} mt={4}>{b.used} days used</Text>
                </Box>
              );
            })}
          </Box>
        </AppSection>

        <AppSection title="My Leave History" noPadding>
          <Box p="md" pb="xs">
            {myLeaves.length===0 ? (
              <Text ta="center" c="dimmed" fz="sm" py="md">No leave requests yet</Text>
            ) : myLeaves.slice(0,5).map((l,i,arr)=>{
              const sc = l.status==="Approved"?"green":l.status==="Pending"?"yellow":"red";
              return (
                <Group key={l._id} justify="space-between" wrap="nowrap" py="xs" style={{ borderBottom: i<arr.length-1?"1px solid var(--mantine-color-default-border)":"none" }}>
                  <Box>
                    <Text fz="sm" fw={500}>{l.leaveType}</Text>
                    <Text fz="xs" c="dimmed">{l.fromDate} · {l.days}d</Text>
                  </Box>
                  <Badge color={sc} variant="light" size="sm">{l.status}</Badge>
                </Group>
              );
            })}
          </Box>
        </AppSection>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="Upcoming Events" sub="Next 30 days">
          <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {UPCOMING_EVENTS.map((e,i,arr)=>(
              <Group key={i} wrap="nowrap" pb="sm" style={{ borderBottom: i<arr.length-1?"1px solid var(--mantine-color-default-border)":"none" }}>
                <Box w={40} h={40} style={{ background:`var(--mantine-color-\${e.color}-0)`, borderRadius:"var(--mantine-radius-md)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <Text fz={9} fw={700} c={e.color} tt="uppercase">{e.date.split(" ")[0]}</Text>
                  <Text fz="sm" fw={700} c={e.color} lh={1}>{e.date.split(" ")[1]}</Text>
                </Box>
                <Text fz="sm" fw={500}>{e.label}</Text>
              </Group>
            ))}
          </Box>
        </AppSection>

        <AppSection title="Company Announcements">
          <Box style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {ANNOUNCEMENTS.map((a,i,arr)=>(
              <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i<arr.length-1?"1px solid var(--mantine-color-default-border)":"none", alignItems:"flex-start" }}>
                <Box w={3} style={{ background:`var(--mantine-color-\${a.color}-5)`, alignSelf:"stretch", borderRadius:4 }}/>
                <Box>
                  <Text fz="sm" fw={500}>{a.title}</Text>
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
