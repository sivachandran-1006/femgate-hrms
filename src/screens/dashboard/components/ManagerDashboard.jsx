import { SimpleGrid, Box, Group, Text, Avatar, Badge } from "@mantine/core";
import { Users, UserCheck, UserMinus, Clock } from "lucide-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { AppTable } from "../../../components/ui/AppTable";
import { getInitials } from "../../../utils/helpers";
import { UPCOMING_EVENTS, ANNOUNCEMENTS } from "../data";

export const ManagerDashboard = ({ employees, leaves, user }) => {
  const myTeam        = employees.filter((e)=>e.department==="IT"||e.reportingManager===user?.name);
  const teamTotal     = myTeam.length;
  const teamPresent   = myTeam.filter((e)=>e.status==="Present").length;
  const teamOnLeave   = myTeam.filter((e)=>e.status==="Leave").length;
  const pendingLeaves = leaves.filter((l)=>myTeam.some((e)=>e.name===l.employee)&&l.status==="Pending").length;
  const attendPct     = teamTotal>0?Math.round((teamPresent/teamTotal)*100):0;

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<Users/>}     label="My Team Size"      value={teamTotal}    sub="Direct reports"               color="blue"/>
        <AppStatCard icon={<UserCheck/>} label="Present Today"     value={teamPresent}  sub={`\${attendPct}% attendance`}  color="green"/>
        <AppStatCard icon={<UserMinus/>} label="On Leave"          value={teamOnLeave}  sub="Team members away"            color="yellow"/>
        <AppStatCard icon={<Clock/>}     label="Pending Approvals" value={pendingLeaves}sub="Leave requests to review"    color="red"/>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="My Team" sub={`\${teamTotal} members`} noPadding>
          <AppTable 
            headers={["Employee", "Role", "Status"]}
            data={myTeam}
            renderRow={(e, i) => {
              const statusColor = e.status==="Present"?"green":e.status==="Leave"?"yellow":"red";
              return (
                <tr key={e._id}>
                  <td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="blue" radius="xl" size="sm">{getInitials(e.name)}</Avatar>
                      <Text fz="sm" fw={500}>{e.name}</Text>
                    </Group>
                  </td>
                  <td><Text fz="xs" c="dimmed">{e.designation}</Text></td>
                  <td>
                    <Badge color={statusColor} variant="light" size="sm">{e.status}</Badge>
                  </td>
                </tr>
              );
            }}
          />
        </AppSection>

        <Box style={{ display:"flex", flexDirection:"column", gap:"var(--mantine-spacing-md)" }}>
          <AppSection title="Upcoming Events" sub="Next 30 days">
            <Box style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {UPCOMING_EVENTS.slice(0,3).map((e,i,arr)=>(
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
          <AppSection title="Announcements">
            <Box style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {ANNOUNCEMENTS.slice(0,3).map((a,i,arr)=>(
                <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i<arr.length-1?"1px solid var(--mantine-color-default-border)":"none" }}>
                  <Box w={3} style={{ background:`var(--mantine-color-\${a.color}-5)`, alignSelf:"stretch", borderRadius:4 }}/>
                  <Text fz="sm" fw={500}>{a.title}</Text>
                </Group>
              ))}
            </Box>
          </AppSection>
        </Box>
      </SimpleGrid>
    </>
  );
};
