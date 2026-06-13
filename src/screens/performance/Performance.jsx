import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  IconTarget as Target,
  IconStar as Star,
  IconClipboardList as ClipboardList,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconPlayerPlayFilled as PlayCircle,
  IconTrendingUp as TrendingUp,
  IconUser as User,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, Stack, Text, Badge, Avatar,
  ScrollArea, Table, Progress, Tabs,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppButton }      from "../../components/ui/AppButton";

import { COLORS }               from "../../theme/colors";
import { getAvatarColor, getStatusBadge } from "../../utils/helpers";
import { usePerformance }       from "../../queries/useHr";

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusColor = (status) => {
  if (status === "Completed" || status === "Reviewed") return "green";
  if (status === "At Risk")                             return "orange";
  if (status === "On Track")                            return "blue";
  if (status === "Submitted")                           return "cyan";
  return "gray";
};

const progressColor = (status) => {
  if (status === "Completed") return "green";
  if (status === "At Risk")   return "orange";
  return "violet";
};

const StarRating = ({ value }) => {
  if (value === null) return <Text size="sm" c="dimmed">—</Text>;
  return (
    <Group gap={2} wrap="nowrap">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          fill={i <= value ? COLORS.warning : "none"}
          color={i <= value ? COLORS.warning : "#dee2e6"}
        />
      ))}
    </Group>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Performance = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: perfData } = usePerformance();
  const ratingDistribution    = perfData?.ratingDistribution    || [];
  const departmentPerformance = perfData?.departmentPerformance || [];
  const goals = (perfData?.goals || []).map((g) => ({
    ...g,
    targetDate: g.targetDate ? g.targetDate.split("T")[0] : "—",
  }));
  const appraisals = perfData?.appraisals || [];

  return (
    <>
      <AppPageHeader
        title="Performance Management"
        sub="Track goals, appraisals, and employee performance ratings"
        action={
          <AppButton leftSection={<PlayCircle size={16} />} color="violet">
            Start Review Cycle
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<PlayCircle size={22} />}   label="Active Reviews"           value="24"    color="violet" />
        <AppStatCard icon={<CheckCircle size={22} />}  label="Completed Reviews"         value="61"    color="green"  />
        <AppStatCard icon={<Star size={22} />}         label="Avg Rating"                value="4.1/5" color="yellow" />
        <AppStatCard icon={<Clock size={22} />}        label="Pending Self-Appraisals"   value="9"     color="red"    />
      </SimpleGrid>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="goals">Goals</Tabs.Tab>
          <Tabs.Tab value="appraisals">Appraisals</Tabs.Tab>
        </Tabs.List>

        {/* ── OVERVIEW ── */}
        <Tabs.Panel value="overview">
          <Group align="flex-start" grow gap="lg">
            {/* Rating Distribution Chart */}
            <AppSection title="Rating Distribution" icon={<TrendingUp size={18} color={COLORS.purple} />}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ratingDistribution} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                  <XAxis dataKey="rating" tick={{ fill: "#868e96", fontSize: 12 }} axisLine={{ stroke: "#dee2e6" }} tickLine={false} />
                  <YAxis tick={{ fill: "#868e96", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #dee2e6", borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="count" name="Employees" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AppSection>

            {/* Department Performance */}
            <AppSection title="Department Performance" icon={<Target size={18} color={COLORS.purple} />} noPadding>
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Department", "Employees", "Avg Rating", "Score"].map((h) => (
                      <Table.Th key={h}>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {departmentPerformance.map((dept) => (
                    <Table.Tr key={dept.department}>
                      <Table.Td><Text size="sm" fw={500}>{dept.department}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{dept.employees}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600}>{dept.avgRating}</Text></Table.Td>
                      <Table.Td style={{ minWidth: 120 }}>
                        <Group gap="xs" wrap="nowrap">
                          <Progress
                            value={Math.round((dept.avgRating / 5) * 100)}
                            color={dept.avgRating >= 4.2 ? "green" : dept.avgRating >= 4.0 ? "violet" : "yellow"}
                            radius="xl"
                            size="sm"
                            style={{ flex: 1 }}
                          />
                          <Text size="xs" fw={600} c="dimmed" w={32}>{Math.round((dept.avgRating / 5) * 100)}%</Text>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </AppSection>
          </Group>
        </Tabs.Panel>

        {/* ── GOALS ── */}
        <Tabs.Panel value="goals">
          <AppSection noPadding title="Employee Goals" icon={<Target size={18} color={COLORS.purple} />}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Employee", "Goal", "Target Date", "Progress", "Status"].map((h) => (
                      <Table.Th key={h}>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {goals.map((goal) => {
                    const av = getAvatarColor(goal.employee);
                    return (
                      <Table.Tr key={goal.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar
                              size={34}
                              radius="xl"
                              style={{ background: av.bg, color: av.color }}
                            >
                              <Text size="xs" fw={700}>{goal.employee.charAt(0).toUpperCase()}</Text>
                            </Avatar>
                            <Text size="sm" fw={500}>{goal.employee}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 280 }}>
                          <Text size="sm">{goal.goal}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>{goal.targetDate}</Text>
                        </Table.Td>
                        <Table.Td style={{ minWidth: 160 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Progress
                              value={goal.progress}
                              color={progressColor(goal.status)}
                              radius="xl"
                              size="sm"
                              style={{ flex: 1 }}
                            />
                            <Text size="xs" fw={600} c="dimmed" w={32}>{goal.progress}%</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={statusColor(goal.status)} variant="light" radius="xl">
                            {goal.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* ── APPRAISALS ── */}
        <Tabs.Panel value="appraisals">
          <AppSection noPadding title="Appraisals" icon={<ClipboardList size={18} color={COLORS.purple} />}>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Employee", "Reviewer", "Period", "Self Rating", "Manager Rating", "Status"].map((h) => (
                      <Table.Th key={h}>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {appraisals.map((appraisal) => {
                    const av = getAvatarColor(appraisal.employee);
                    return (
                      <Table.Tr key={appraisal.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color }}>
                              <Text size="xs" fw={700}>{appraisal.employee.charAt(0).toUpperCase()}</Text>
                            </Avatar>
                            <Text size="sm" fw={500}>{appraisal.employee}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={6} wrap="nowrap">
                            <User size={13} color="#868e96" />
                            <Text size="sm" c="dimmed">{appraisal.reviewer}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" color="gray" radius="sm">{appraisal.period}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <StarRating value={appraisal.selfRating} />
                        </Table.Td>
                        <Table.Td>
                          <StarRating value={appraisal.managerRating} />
                        </Table.Td>
                        <Table.Td>
                          <Badge color={statusColor(appraisal.status)} variant="light" radius="xl">
                            {appraisal.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default Performance;
