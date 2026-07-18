import { useState } from "react";
import {
  IconBriefcase as Briefcase,
  IconUsers as Users,
  IconCalendarCheck as CalendarCheck,
  IconCircleCheck as CheckCircle,
  IconSearch as Search,
  IconEye as Eye,
  IconPlus as Plus,
  IconX as X,
  IconMapPin as MapPin,
  IconClock as Clock,
  IconTrendingUp as TrendingUp,
  IconStar as Star,
  IconArrowUpRight as ArrowUpRight,
} from "@tabler/icons-react";
import {
  Group, SimpleGrid, Stack, Text, Badge, Avatar,
  ScrollArea, Table, Progress, Tabs, Paper, Box,
  ActionIcon, TextInput, Select, Pagination,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { AppInput }       from "../../components/ui/AppInput";

import { COLORS }         from "../../theme/colors";
import { getAvatarColor } from "../../utils/helpers";
import { useToast }       from "../../components/ui/Toast";


const PIPELINE_STAGES = [
  { key: "Applied",   label: "Applied",   color: "blue"   },
  { key: "Screening", label: "Screening", color: "cyan"   },
  { key: "Interview", label: "Interview", color: "yellow" },
  { key: "Selected",  label: "Selected",  color: "green"  },
  { key: "Rejected",  label: "Rejected",  color: "red"    },
  { key: "On Hold",   label: "On Hold",   color: "gray"   },
];

const STATUS_COLOR = {
  Applied:   "blue",
  Screening: "cyan",
  Interview: "yellow",
  Selected:  "green",
  Rejected:  "red",
  "On Hold": "gray",
};

const PRIORITY_COLOR = {
  High:   "red",
  Medium: "yellow",
  Low:    "green",
};

const DEPT_COLOR = {
  IT:         "blue",
  HR:         "violet",
  Finance:    "green",
  Management: "yellow",
};

const ROWS_PER_PAGE = 5;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Recruitment() {
  const [activeTab, setActiveTab]         = useState("overview");
  const [searchQuery, setSearchQuery]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [deptFilter, setDeptFilter]       = useState("All");
  const [currentPage, setCurrentPage]     = useState(1);
  const [viewJob, setViewJob]             = useState(null);
  const [viewCandidate, setViewCandidate] = useState(null);
  const [showPostJob, setShowPostJob]     = useState(false);
  const [jobForm, setJobForm]             = useState({ title: "", dept: "", loc: "", type: "Full-time" });

  const { show } = useToast();
  const { data: jobsRaw = [] }  = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const { data: candsRaw = [] } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createJobMut  = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const candStatusMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const MOCK_JOBS = jobsRaw.map((j) => ({
    ...j,
    postedDate: (j.postedDate || "").split("T")[0],
  }));
  const MOCK_CANDIDATES = candsRaw.map((c) => ({
    ...c,
    initials:    c.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    appliedDate: (c.appliedDate || "").split("T")[0],
  }));

  const handlePostJob = async () => {
    if (!jobForm.title.trim()) return show("Job title is required", "error");
    try {
      await createJobMut.mutateAsync({
        title: jobForm.title, department: jobForm.dept,
        location: jobForm.loc, type: jobForm.type || "Full-time",
      });
      show("Job posted", "success");
      setJobForm({ title: "", dept: "", loc: "", type: "Full-time" });
      setShowPostJob(false);
    } catch {
      show("Failed to post job", "error");
    }
  };

  const handleCandidateStatus = async (id, status) => {
    try {
      await candStatusMut.mutateAsync({ id, status });
      show(`Candidate moved to ${status}`, "success");
      setViewCandidate(null);
    } catch {
      show("Failed to update candidate", "error");
    }
  };

  const openJobs       = MOCK_JOBS.filter((j) => j.status === "Open").length;
  const totalApps      = MOCK_JOBS.reduce((s, j) => s + j.applications, 0);
  const interviewCount = MOCK_CANDIDATES.filter((c) => c.status === "Interview").length;
  const selectedCount  = MOCK_CANDIDATES.filter((c) => c.status === "Selected").length;

  const filteredCandidates = MOCK_CANDIDATES.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.position.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / ROWS_PER_PAGE));
  const paginated  = filteredCandidates.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const filteredJobs = MOCK_JOBS.filter((j) => deptFilter === "All" || j.department === deptFilter);

  const StarRow = ({ rating }) => (
    <Group gap={2} wrap="nowrap">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} fill={s <= rating ? COLORS.warning : "none"} color={s <= rating ? COLORS.warning : "#dee2e6"} />
      ))}
    </Group>
  );

  return (
    <>
      <AppPageHeader
        title="Recruitment & ATS"
        sub="Manage job openings, track applicants, and streamline your hiring pipeline"
        action={
          <AppButton leftSection={<Plus size={16} />} onClick={() => setShowPostJob(true)}>
            Post Job
          </AppButton>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <AppStatCard icon={<Briefcase size={22} />}    label="Open Positions"        value={openJobs}       color="blue"   trend="+2 this week" up />
        <AppStatCard icon={<Users size={22} />}        label="Total Applications"    value={totalApps}      color="violet" trend="+12 this week" up />
        <AppStatCard icon={<CalendarCheck size={22} />}label="Interviews Scheduled"  value={interviewCount} color="yellow" trend="3 today"       up />
        <AppStatCard icon={<CheckCircle size={22} />}  label="Offers Made"           value={selectedCount}  color="green"  trend="+1 this week"  up />
      </SimpleGrid>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="jobs">Jobs</Tabs.Tab>
          <Tabs.Tab value="pipeline">Pipeline</Tabs.Tab>
          <Tabs.Tab value="candidates">Candidates</Tabs.Tab>
        </Tabs.List>

        {/* ── OVERVIEW ── */}
        <Tabs.Panel value="overview">
          <Group align="flex-start" gap="lg">
            {/* Active Job Openings */}
            <AppSection
              noPadding
              title="Active Job Openings"
              sub={`${openJobs} open positions`}
              action={
                <AppButton variant="subtle" size="xs" rightSection={<ArrowUpRight size={13} />} onClick={() => setActiveTab("jobs")}>
                  View all
                </AppButton>
              }
              style={{ flex: "1.4 1 0", minWidth: 0 }}
            >
              {MOCK_JOBS.filter((j) => j.status === "Open").slice(0, 5).map((job, i, arr) => (
                <Group
                  key={job.id}
                  gap="md"
                  p="sm"
                  wrap="nowrap"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--mantine-color-gray-2)" : "none", cursor: "default" }}
                >
                  <Avatar size={36} radius="md" color={DEPT_COLOR[job.department] || "gray"} variant="light" style={{ flexShrink: 0 }}>
                    <Briefcase size={16} />
                  </Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={600} truncate>{job.title}</Text>
                    <Group gap={6} wrap="nowrap">
                      <MapPin size={10} />
                      <Text size="xs" c="dimmed">{job.location}</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Clock size={10} />
                      <Text size="xs" c="dimmed">{job.type}</Text>
                    </Group>
                  </Box>
                  <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                    <Group gap={4} wrap="nowrap">
                      <Users size={12} />
                      <Text size="xs" c="dimmed">{job.applications}</Text>
                    </Group>
                    <Badge color={PRIORITY_COLOR[job.priority] || "gray"} variant="light" radius="xl" size="xs">{job.priority}</Badge>
                  </Group>
                </Group>
              ))}
            </AppSection>

            {/* Hiring Pipeline */}
            <AppSection title="Hiring Pipeline" style={{ flex: "1 1 0", minWidth: 240 }}>
              <Stack gap="sm">
                {PIPELINE_STAGES.filter((s) => s.key !== "On Hold").map((stage) => {
                  const count = MOCK_CANDIDATES.filter((c) => c.status === stage.key).length;
                  const pct   = Math.round((count / MOCK_CANDIDATES.length) * 100);
                  return (
                    <Box key={stage.key}>
                      <Group justify="space-between" mb={5}>
                        <Text size="sm" fw={500}>{stage.label}</Text>
                        <Text size="sm" c="dimmed">{count} <Text span c="gray.4">({pct}%)</Text></Text>
                      </Group>
                      <Progress value={pct} color={stage.color} radius="xl" size="sm" />
                    </Box>
                  );
                })}
              </Stack>
              <Box mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                <Text size="xs" c="dimmed" fw={600} mb="sm" tt="uppercase">Recent Activity</Text>
                {(MOCK_CANDIDATES.slice(0, 5)).map((c, i) => {
                  const colorMap = { Selected: "green", Interview: "yellow", Applied: "blue", Rejected: "red", Screening: "cyan" };
                  const color = colorMap[c.status] ?? "gray";
                  const text = `${c.name} — ${c.status}${c.jobTitle ? ` for ${c.jobTitle}` : ""}`;
                  const time = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "Recently";
                  return (
                    <Group key={c.id ?? i} gap="sm" mt="xs" wrap="nowrap">
                      <Box style={{ width: 8, height: 8, borderRadius: "50%", background: `var(--mantine-color-${color}-6)`, flexShrink: 0 }} />
                      <Text size="xs" style={{ flex: 1 }}>{text}</Text>
                      <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>{time}</Text>
                    </Group>
                  );
                })}
              </Box>
            </AppSection>
          </Group>
        </Tabs.Panel>

        {/* ── JOBS ── */}
        <Tabs.Panel value="jobs">
          <AppSection noPadding title={`All Job Openings (${MOCK_JOBS.length})`} action={
            <Select
              value={deptFilter}
              onChange={(v) => setDeptFilter(v || "All")}
              data={["All", "IT", "HR", "Finance", "Management"].map((d) => ({ value: d, label: d === "All" ? "All Departments" : d }))}
              size="xs"
              radius="md"
              w={160}
            />
          }>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Job Title", "Department", "Location", "Type", "Posted", "Applications", "Priority", "Status", "Action"].map((h) => (
                      <Table.Th key={h}>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredJobs.map((job) => (
                    <Table.Tr key={job.id}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar size={32} radius="md" color={DEPT_COLOR[job.department] || "gray"} variant="light" style={{ flexShrink: 0 }}>
                            <Briefcase size={14} />
                          </Avatar>
                          <Text size="sm" fw={600}>{job.title}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={DEPT_COLOR[job.department] || "gray"} variant="light" radius="xl" size="sm">{job.department}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <MapPin size={12} />
                          <Text size="sm" c="dimmed">{job.location}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{job.type}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>{job.postedDate}</Text></Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <Users size={14} color="#868e96" />
                          <Text size="sm" fw={600}>{job.applications}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={PRIORITY_COLOR[job.priority] || "gray"} variant="light" radius="xl" size="sm">{job.priority}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={job.status === "Open" ? "green" : "red"} variant="light" radius="xl" size="sm">{job.status}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon variant="light" color="blue" size="sm" radius="md" onClick={() => setViewJob(job)}>
                          <Eye size={13} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </AppSection>
        </Tabs.Panel>

        {/* ── PIPELINE (Kanban) ── */}
        <Tabs.Panel value="pipeline">
          <Group align="flex-start" gap="md" wrap="nowrap" style={{ overflowX: "auto" }} pb={8}>
            {PIPELINE_STAGES.map((stage) => {
              const stageCandidates = MOCK_CANDIDATES.filter((c) => c.status === stage.key);
              return (
                <Box key={stage.key} style={{ minWidth: 220, flex: "0 0 220px" }}>
                  <Group justify="space-between" mb="sm" p="xs" bg={`${stage.color}.0`} style={{ borderRadius: 8 }}>
                    <Text size="sm" fw={700} c={`${stage.color}.7`}>{stage.label}</Text>
                    <Avatar size={22} radius="xl" color={stage.color} variant="filled">
                      <Text size="xs" fw={700}>{stageCandidates.length}</Text>
                    </Avatar>
                  </Group>
                  <Stack gap="xs">
                    {stageCandidates.map((c) => {
                      const av = getAvatarColor(c.name);
                      return (
                        <Paper
                          key={c.id}
                          withBorder
                          radius="xl"
                          p="md"
                          style={{ cursor: "pointer" }}
                          onClick={() => setViewCandidate(c)}
                        >
                          <Group gap="sm" mb="xs" wrap="nowrap">
                            <Avatar size={34} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                              <Text size="xs" fw={700}>{c.initials}</Text>
                            </Avatar>
                            <Box style={{ minWidth: 0 }}>
                              <Text size="xs" fw={600} truncate>{c.name}</Text>
                              <Text size="xs" c="dimmed" truncate>{c.position}</Text>
                            </Box>
                          </Group>
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">{c.experience}</Text>
                            <StarRow rating={c.rating} />
                          </Group>
                        </Paper>
                      );
                    })}
                    {stageCandidates.length === 0 && (
                      <AppEmptyState icon={<Users size={24} />} message="No candidates" py={12} />
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Group>
        </Tabs.Panel>

        {/* ── CANDIDATES ── */}
        <Tabs.Panel value="candidates">
          <AppSection noPadding title="" action={null}>
            <Group gap="md" p="md" wrap="wrap" align="center" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
              <TextInput
                placeholder="Search candidates..."
                leftSection={<Search size={15} />}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ flex: 1 }}
                miw={220}
                size="sm"
                radius="md"
              />
              <Select
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v || "All"); setCurrentPage(1); }}
                data={["All", "Applied", "Screening", "Interview", "Selected", "Rejected", "On Hold"].map((s) => ({ value: s, label: s === "All" ? "All Stages" : s }))}
                size="sm"
                radius="md"
                w={150}
              />
              <Text size="sm" c="dimmed" ml="auto">{filteredCandidates.length} candidates</Text>
            </Group>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Candidate", "Position", "Applied", "Rating", "Stage", "Action"].map((h) => (
                      <Table.Th key={h}>
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginated.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}><AppEmptyState message="No candidates found" /></Table.Td>
                    </Table.Tr>
                  ) : paginated.map((c) => {
                    const av = getAvatarColor(c.name);
                    return (
                      <Table.Tr key={c.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={36} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                              <Text size="xs" fw={700}>{c.initials}</Text>
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={600}>{c.name}</Text>
                              <Text size="xs" c="dimmed">{c.experience} experience</Text>
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{c.position}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>{c.appliedDate}</Text></Table.Td>
                        <Table.Td><StarRow rating={c.rating} /></Table.Td>
                        <Table.Td>
                          <Badge color={STATUS_COLOR[c.status] || "gray"} variant="light" radius="xl" size="sm">{c.status}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon variant="light" color="blue" size="sm" radius="md" onClick={() => setViewCandidate(c)}>
                            <Eye size={13} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {totalPages > 1 && (
              <Group justify="space-between" p="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                <Text size="sm" c="dimmed">
                  {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filteredCandidates.length)} of {filteredCandidates.length}
                </Text>
                <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" radius="md" />
              </Group>
            )}
          </AppSection>
        </Tabs.Panel>
      </Tabs>

      {/* Job Detail Modal */}
      <AppModal
        opened={!!viewJob}
        onClose={() => setViewJob(null)}
        title={viewJob?.title || ""}
        icon={<Briefcase size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
      >
        {viewJob && (
          <Stack gap="sm">
            {[["Department", viewJob.department], ["Location", viewJob.location], ["Type", viewJob.type], ["Posted", viewJob.postedDate], ["Applications", viewJob.applications], ["Priority", viewJob.priority], ["Status", viewJob.status]].map(([l, v]) => (
              <Group key={l} justify="space-between" pb="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                <Text size="sm" fw={600} c="dimmed">{l}</Text>
                <Text size="sm">{String(v)}</Text>
              </Group>
            ))}
            <Group justify="flex-end" mt="xs">
              <AppButton onClick={() => setViewJob(null)}>Close</AppButton>
            </Group>
          </Stack>
        )}
      </AppModal>

      {/* Candidate Detail Modal */}
      <AppModal
        opened={!!viewCandidate}
        onClose={() => setViewCandidate(null)}
        title="Candidate Profile"
        icon={<Users size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
      >
        {viewCandidate && (() => {
          const av = getAvatarColor(viewCandidate.name);
          return (
            <Stack gap="md">
              <Group gap="md" p="sm" bg="gray.0" style={{ borderRadius: 12 }} wrap="nowrap">
                <Avatar size={56} radius="xl" style={{ background: av.bg, color: av.color, flexShrink: 0 }}>
                  <Text fw={700} size="xl">{viewCandidate.initials}</Text>
                </Avatar>
                <Box>
                  <Text size="md" fw={700}>{viewCandidate.name}</Text>
                  <Text size="sm" c="dimmed">{viewCandidate.position}</Text>
                  <Group gap={2} mt={4}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} fill={s <= viewCandidate.rating ? COLORS.warning : "none"} color={s <= viewCandidate.rating ? COLORS.warning : "#dee2e6"} />
                    ))}
                  </Group>
                </Box>
              </Group>
              {[["Experience", viewCandidate.experience], ["Applied Date", viewCandidate.appliedDate], ["Position", viewCandidate.position]].map(([l, v]) => (
                <Group key={l} justify="space-between" pb="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                  <Text size="sm" fw={600} c="dimmed">{l}</Text>
                  <Text size="sm">{v}</Text>
                </Group>
              ))}
              <Group justify="space-between">
                <Text size="sm" fw={600} c="dimmed">Stage</Text>
                <Badge color={STATUS_COLOR[viewCandidate.status] || "gray"} variant="light" radius="xl">{viewCandidate.status}</Badge>
              </Group>
              {!["Selected", "Rejected"].includes(viewCandidate.status) && (() => {
                const NEXT = { Applied: "Screening", Screening: "Interview", Interview: "Selected" };
                const next = NEXT[viewCandidate.status];
                return (
                  <Group gap="xs" grow>
                    {next && (
                      <AppButton size="xs" color="green" loading={candStatusMut.isPending}
                        onClick={() => handleCandidateStatus(viewCandidate.id, next)}>
                        Move to {next}
                      </AppButton>
                    )}
                    <AppButton size="xs" color="red" variant="light" loading={candStatusMut.isPending}
                      onClick={() => handleCandidateStatus(viewCandidate.id, "Rejected")}>
                      Reject
                    </AppButton>
                  </Group>
                );
              })()}
              <Group justify="flex-end" mt="xs">
                <AppButton onClick={() => setViewCandidate(null)}>Close</AppButton>
              </Group>
            </Stack>
          );
        })()}
      </AppModal>

      {/* Post Job Modal */}
      <AppModal
        opened={showPostJob}
        onClose={() => setShowPostJob(false)}
        title="Post New Job"
        icon={<Plus size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
      >
        <Stack gap="md">
          {[
            { label: "Job Title *",  key: "title", ph: "e.g. Software Engineer"   },
            { label: "Department",   key: "dept",  ph: "e.g. Engineering"         },
            { label: "Location",     key: "loc",   ph: "e.g. Chennai / Remote"    },
            { label: "Job Type",     key: "type",  ph: "Full-time / Contract"     },
          ].map(({ label, key, ph }) => (
            <AppInput
              key={key}
              label={label}
              placeholder={ph}
              value={jobForm[key]}
              onChange={(e) => setJobForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          ))}
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowPostJob(false)}>Cancel</AppButton>
            <AppButton onClick={handlePostJob} loading={createJobMut.isPending}>Post Job</AppButton>
          </Group>
        </Stack>
      </AppModal>
    </>
  );
}
