import { SimpleGrid, Box, Group, Text, Avatar, Badge, Table, Loader, Center } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconUsers, IconUserCheck, IconUserMinus, IconClock } from "@tabler/icons-react";
import { AppStatCard } from "../../../components/ui/AppStatCard";
import { AppSection } from "../../../components/ui/AppSection";
import { AppTable } from "../../../components/ui/AppTable";
import { getInitials } from "../../../utils/helpers";
import { getAnnouncements, getUpcomingEvents, getDashboardSummary } from "../../../api/dashboardApi";

const ANNOUNCE_COLORS = { high: "red", medium: "yellow", low: "blue", info: "blue", hr: "green", finance: "violet" };

export const ManagerDashboard = ({ employees, leaves }) => {
  const { data: summaryData, isLoading: loadSum } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary, select: (r) => r?.data ?? r });
  const { data: announceData } = useQuery({ queryKey: ["dashboard-announce"], queryFn: getAnnouncements, select: (r) => r?.data ?? r });
  const { data: eventsData }   = useQuery({ queryKey: ["dashboard-events"],   queryFn: getUpcomingEvents, select: (r) => r?.data ?? r });

  if (loadSum) return <Center py="xl"><Loader /></Center>;

  const pendingLeaves  = (summaryData?.pendingLeaves) || leaves.filter((l) => l.status === "Pending").length;
  const announcements  = announceData?.announcements || [];
  const events         = eventsData?.events || [];

  const myTeam         = employees;
  const teamTotal      = myTeam.length;
  const teamPresent    = myTeam.filter((e) => e.status === "Present").length;
  const teamOnLeave    = myTeam.filter((e) => e.status === "Leave").length;
  const attendPct      = teamTotal > 0 ? Math.round((teamPresent / teamTotal) * 100) : 0;

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <AppStatCard icon={<IconUsers size={18}/>}     label="Team Size"         value={teamTotal}    sub="All employees"              color="blue" />
        <AppStatCard icon={<IconUserCheck size={18}/>} label="Present Today"     value={teamPresent}  sub={`${attendPct}% attendance`} color="green" />
        <AppStatCard icon={<IconUserMinus size={18}/>} label="On Leave"          value={teamOnLeave}  sub="Members away"               color="yellow" />
        <AppStatCard icon={<IconClock size={18}/>}     label="Pending Approvals" value={pendingLeaves}sub="Leave requests to review"   color="red" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="Employee List" sub={`${teamTotal} members`} noPadding>
          <AppTable
            headers={["Employee", "Role", "Status"]}
            data={myTeam}
            renderRow={(e, i) => {
              const statusColor = e.status === "Present" ? "green" : e.status === "Leave" ? "yellow" : "red";
              return (
                <Table.Tr key={e.id || e._id || i}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="blue" radius="xl" size="sm">{getInitials(e.name)}</Avatar>
                      <Text fz="sm" fw={500}>{e.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Text fz="xs" c="dimmed">{e.designation}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={statusColor} variant="light" size="sm">{e.status || "Active"}</Badge>
                  </Table.Td>
                </Table.Tr>
              );
            }}
          />
        </AppSection>

        <Box style={{ display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}>
          <AppSection title="Upcoming Events" sub="Next 30 days">
            <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {events.length === 0 ? (
                <Text ta="center" c="dimmed" fz="sm">No upcoming events</Text>
              ) : events.slice(0, 3).map((e, i, arr) => {
                const d = new Date(e.date);
                const mon = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
                const day = d.getDate();
                return (
                  <Group key={e.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                    <Box w={40} h={40} style={{ background: "var(--mantine-color-blue-0)", borderRadius: "var(--mantine-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <Text fz={9} fw={700} c="blue" tt="uppercase">{mon}</Text>
                      <Text fz="sm" fw={700} c="blue" lh={1}>{day}</Text>
                    </Box>
                    <Text fz="sm" fw={500}>{e.title}</Text>
                  </Group>
                );
              })}
            </Box>
          </AppSection>

          <AppSection title="Announcements">
            <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.slice(0, 3).map((a, i, arr) => (
                <Group key={a.id} wrap="nowrap" pb="sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                  <Box w={3} style={{ background: `var(--mantine-color-${ANNOUNCE_COLORS[a.type] || "blue"}-5)`, alignSelf: "stretch", borderRadius: 4 }} />
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
