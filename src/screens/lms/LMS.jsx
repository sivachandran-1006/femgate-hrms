import { useState } from "react";
import {
  IconBook as BookOpen,
  IconAward as Award,
  IconPlayerPlay as Play,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconUsers as Users,
  IconStar as Star,
  IconTrendingUp as TrendingUp,
  IconTarget as Target,
  IconSearch as Search,
  IconChevronRight as ChevronRight,
  IconChartBar as BarChart2,
  IconX,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Box, Stack, Group, Text, Paper, Badge, Tabs, SimpleGrid,
  Progress, Button, TextInput, Avatar, Modal, ThemeIcon,
  ActionIcon,
} from "@mantine/core";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

// ── Data ─────────────────────────────────────────────────────────────────────

const COURSES = [
  { id: 1,  title: "React Fundamentals",          category: "Frontend",    duration: "8h",  enrolled: 12, difficulty: "Beginner",     progress: 65,  isEnrolled: true,  rating: 4.8, lessons: 24, instructor: "Siva",      gradient: "linear-gradient(135deg,#6366f1,#1d4ed8)",  icon: "⚛️"  },
  { id: 2,  title: "Information Security Basics", category: "Security",    duration: "4h",  enrolled: 25, difficulty: "Intermediate", progress: 0,   isEnrolled: false, rating: 4.6, lessons: 14, instructor: "Suganthan", gradient: "linear-gradient(135deg,#ef4444,#b91c1c)",  icon: "🔐"  },
  { id: 3,  title: "HR Policies & Compliance",    category: "HR",          duration: "2h",  enrolled: 30, difficulty: "Beginner",     progress: 100, isEnrolled: true,  rating: 4.5, lessons: 8,  instructor: "Big Kundi", gradient: "linear-gradient(135deg,#22c55e,#15803d)",  icon: "📋"  },
  { id: 4,  title: "Advanced Node.js",            category: "Backend",     duration: "12h", enrolled: 8,  difficulty: "Advanced",     progress: 30,  isEnrolled: true,  rating: 4.9, lessons: 36, instructor: "Mani",      gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",  icon: "🚀"  },
  { id: 5,  title: "Data Analysis with Excel",    category: "Analytics",   duration: "6h",  enrolled: 18, difficulty: "Intermediate", progress: 0,   isEnrolled: false, rating: 4.3, lessons: 20, instructor: "Safeer",    gradient: "linear-gradient(135deg,#f59e0b,#b45309)",  icon: "📊"  },
  { id: 6,  title: "Leadership & Management",     category: "Leadership",  duration: "5h",  enrolled: 15, difficulty: "Intermediate", progress: 80,  isEnrolled: true,  rating: 4.7, lessons: 16, instructor: "Siva",      gradient: "linear-gradient(135deg,#3b82f6,#0284c7)",  icon: "🎯"  },
  { id: 7,  title: "Python for Data Science",     category: "Analytics",   duration: "10h", enrolled: 22, difficulty: "Intermediate", progress: 0,   isEnrolled: false, rating: 4.8, lessons: 30, instructor: "Aravinth",  gradient: "linear-gradient(135deg,#f59e0b,#d97706)",  icon: "🐍"  },
  { id: 8,  title: "UI/UX Design Principles",     category: "Design",      duration: "7h",  enrolled: 14, difficulty: "Beginner",     progress: 0,   isEnrolled: false, rating: 4.6, lessons: 22, instructor: "Suriya",    gradient: "linear-gradient(135deg,#ec4899,#be185d)",  icon: "🎨"  },
];

const CERTIFICATIONS = [
  { id: 1, employee: "Mani",       course: "React Fundamentals",       date: "2026-03-15", category: "Frontend",   score: 94 },
  { id: 2, employee: "Suriya",     course: "Information Security",      date: "2026-04-02", category: "Security",   score: 88 },
  { id: 3, employee: "Big Kundi",  course: "HR Policies & Compliance",  date: "2026-02-20", category: "HR",         score: 96 },
  { id: 4, employee: "Suganthan",  course: "Leadership & Management",   date: "2026-01-10", category: "Leadership", score: 91 },
  { id: 5, employee: "Santhosh",   course: "Advanced Node.js",          date: "2026-05-01", category: "Backend",    score: 89 },
  { id: 6, employee: "Aravinth",   course: "Python for Data Science",   date: "2026-05-20", category: "Analytics",  score: 93 },
];

const LEADERBOARD = [
  { rank: 1, name: "Mani",       points: 2840, badge: "🏆", courses: 5 },
  { rank: 2, name: "Suriya",     points: 2650, badge: "🥈", courses: 4 },
  { rank: 3, name: "Santhosh",   points: 2480, badge: "🥉", courses: 4 },
  { rank: 4, name: "Big Kundi",  points: 2200, badge: "⭐", courses: 3 },
  { rank: 5, name: "Aravinth",   points: 1980, badge: "⭐", courses: 3 },
];

const PROGRESS_CHART = [
  { month: "Jan", completed: 3, enrolled: 8  },
  { month: "Feb", completed: 5, enrolled: 10 },
  { month: "Mar", completed: 4, enrolled: 12 },
  { month: "Apr", completed: 6, enrolled: 11 },
  { month: "May", completed: 7, enrolled: 14 },
  { month: "Jun", completed: 5, enrolled: 13 },
];

const CAT_COLOR = {
  Frontend: "indigo", Security: "red", HR: "green", Backend: "violet",
  Analytics: "yellow", Leadership: "blue", Design: "pink",
};
const DIFF_COLOR = { Beginner: "green", Intermediate: "yellow", Advanced: "red" };
const CATEGORIES  = ["All","Frontend","Backend","Security","HR","Analytics","Leadership","Design"];

const fmtDate   = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const initials  = (n = "") => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const AVT_COLORS = ["blue","green","violet","orange","teal","cyan","red"];
const avatarColor = (name) => AVT_COLORS[name.charCodeAt(0) % AVT_COLORS.length];

// ── Star rating ───────────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <Group gap={2}>
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={11}
        fill={s <= Math.round(rating) ? "var(--mantine-color-yellow-5)" : "none"}
        color={s <= Math.round(rating) ? "var(--mantine-color-yellow-5)" : "var(--mantine-color-gray-4)"} />
    ))}
    <Text size="xs" c="dimmed" ml={2}>{rating}</Text>
  </Group>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const LMS = () => {
  const { show } = useToast();
  const [activeTab, setActiveTab]   = useState("courses");
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [viewCourse, setViewCourse] = useState(null);

  const enrolled  = COURSES.filter((c) => c.isEnrolled);
  const completed = COURSES.filter((c) => c.progress === 100);
  const avgProg   = Math.round(enrolled.reduce((s, c) => s + c.progress, 0) / (enrolled.length || 1));

  const filteredCourses = COURSES.filter((c) => {
    const q = search.toLowerCase();
    return (!q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q))
      && (catFilter === "All" || c.category === catFilter);
  });

  return (
    <Stack gap="lg">
      <AppPageHeader title="Learning Management System" sub="Grow your skills, earn certifications, lead the leaderboard" />

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {[
          { label:"Total Courses",   value: COURSES.length,        icon: BookOpen,    color:"blue",   sub:`${CATEGORIES.length-1} categories`  },
          { label:"Enrolled",        value: enrolled.length,       icon: Users,       color:"violet", sub:"Active courses"                      },
          { label:"Completed",       value: completed.length,      icon: CheckCircle, color:"green",  sub:`${avgProg}% avg progress`            },
          { label:"Certifications",  value: CERTIFICATIONS.length, icon: Award,       color:"yellow", sub:"Earned this year"                    },
        ].map((k) => (
          <Paper key={k.label} withBorder radius="xl" p="md">
            <Group gap="md" wrap="nowrap">
              <ThemeIcon color={k.color} variant="light" size={46} radius="xl"><k.icon size={22} /></ThemeIcon>
              <Box miw={0}>
                <Text size="xl" fw={800} lh={1}>{k.value}</Text>
                <Text size="sm" fw={600} mt={2}>{k.label}</Text>
                <Text size="xs" c="dimmed">{k.sub}</Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="courses"        leftSection={<BookOpen size={14} />}>Courses</Tabs.Tab>
          <Tabs.Tab value="mylearning"     leftSection={<Target size={14} />}>My Learning</Tabs.Tab>
          <Tabs.Tab value="certifications" leftSection={<Award size={14} />}>Certifications</Tabs.Tab>
          <Tabs.Tab value="analytics"      leftSection={<BarChart2 size={14} />}>Analytics</Tabs.Tab>
          <Tabs.Tab value="leaderboard"    leftSection={<TrendingUp size={14} />}>Leaderboard</Tabs.Tab>
        </Tabs.List>

        {/* ── COURSES ── */}
        <Tabs.Panel value="courses" pt="md">
          <Stack gap="md">
            <Group gap="md" wrap="wrap" align="center">
              <TextInput
                placeholder="Search courses, instructors…"
                leftSection={<Search size={14} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1, minWidth: 240 }}
                radius="lg"
              />
              <Group gap="xs" wrap="wrap">
                {CATEGORIES.map((cat) => (
                  <Badge key={cat} variant={catFilter === cat ? "filled" : "outline"}
                    color="blue" style={{ cursor: "pointer" }}
                    onClick={() => setCatFilter(cat)}>
                    {cat}
                  </Badge>
                ))}
              </Group>
              <Text size="sm" c="dimmed">{filteredCourses.length} courses</Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
              {filteredCourses.map((course) => (
                <Paper key={course.id} withBorder radius="xl" style={{ overflow:"hidden", cursor:"pointer" }}
                  onClick={() => setViewCourse(course)}>
                  {/* Gradient header */}
                  <Box h={130} style={{ background: course.gradient, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Text size="2xl">{course.icon}</Text>
                    <Box pos="absolute" top={8} right={8}>
                      <Badge size="xs" variant="white" color="dark" style={{ backdropFilter:"blur(6px)" }}>
                        {course.difficulty}
                      </Badge>
                    </Box>
                    {course.isEnrolled && (
                      <Box pos="absolute" top={8} left={8}>
                        <Badge size="xs" variant="white" color="green">ENROLLED</Badge>
                      </Box>
                    )}
                  </Box>

                  <Stack gap="xs" p="md">
                    <Badge size="xs" color={CAT_COLOR[course.category] ?? "gray"} variant="light">{course.category}</Badge>
                    <Text fw={700} size="sm" lh={1.3}>{course.title}</Text>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">by {course.instructor}</Text>
                      <Stars rating={course.rating} />
                    </Group>
                    <Group gap="md" c="dimmed">
                      <Group gap={4}><Clock size={12} /><Text size="xs">{course.duration}</Text></Group>
                      <Group gap={4}><BookOpen size={12} /><Text size="xs">{course.lessons} lessons</Text></Group>
                      <Group gap={4}><Users size={12} /><Text size="xs">{course.enrolled}</Text></Group>
                    </Group>

                    {course.isEnrolled && (
                      <Box>
                        <Group justify="space-between" mb={4}>
                          <Text size="xs" c="dimmed">Progress</Text>
                          <Text size="xs" fw={700} c={course.progress === 100 ? "green" : "blue"}>{course.progress}%</Text>
                        </Group>
                        <Progress value={course.progress} color={course.progress === 100 ? "green" : "blue"} size="sm" radius="xl" />
                      </Box>
                    )}

                    <Button mt="auto" size="xs" radius="md"
                      color={course.isEnrolled ? (course.progress === 100 ? "green" : "blue") : "blue"}
                      variant={course.isEnrolled ? "filled" : "outline"}
                      leftSection={course.isEnrolled ? (course.progress === 100 ? <CheckCircle size={13} /> : <Play size={13} />) : <BookOpen size={13} />}
                      onClick={(e) => { e.stopPropagation(); show(course.isEnrolled ? (course.progress===100 ? "Course already completed!" : "Continuing course...") : "Enrolled successfully!", course.isEnrolled && course.progress===100 ? "info" : "success"); }}>
                      {course.isEnrolled ? (course.progress === 100 ? "Completed" : "Continue") : "Enroll Now"}
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── MY LEARNING ── */}
        <Tabs.Panel value="mylearning" pt="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ alignItems: "start" }}>
            <Stack gap="md">
              <Text fw={700} size="sm">In Progress & Completed</Text>
              {enrolled.map((course) => (
                <Paper key={course.id} withBorder radius="xl" style={{ overflow:"hidden" }}>
                  {course.progress === 100 && <Box h={3} style={{ background:"linear-gradient(90deg,#22c55e,#34d399)" }} />}
                  <Group p="md" gap="md" wrap="nowrap" align="flex-start">
                    <Box w={52} h={52} style={{ borderRadius:12, background: course.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                      {course.icon}
                    </Box>
                    <Stack flex={1} gap={4} miw={0}>
                      <Group gap="xs" wrap="wrap">
                        <Text size="sm" fw={700}>{course.title}</Text>
                        <Badge size="xs" color={CAT_COLOR[course.category] ?? "gray"} variant="light">{course.category}</Badge>
                      </Group>
                      <Group gap="md" c="dimmed">
                        <Group gap={3}><Clock size={11} /><Text size="xs">{course.duration}</Text></Group>
                        <Group gap={3}><BookOpen size={11} /><Text size="xs">{course.lessons} lessons</Text></Group>
                        <Text size="xs">by {course.instructor}</Text>
                      </Group>
                      <Box>
                        <Group justify="space-between" mb={4}>
                          <Text size="xs" c="dimmed">Progress</Text>
                          <Text size="xs" fw={700} c={course.progress === 100 ? "green" : "blue"}>{course.progress}%</Text>
                        </Group>
                        <Progress value={course.progress} color={course.progress === 100 ? "green" : "blue"} size="sm" radius="xl" />
                      </Box>
                    </Stack>
                    <Box style={{ flexShrink: 0 }}>
                      {course.progress === 100
                        ? <Badge color="green" variant="light" leftSection={<CheckCircle size={11} />}>Completed</Badge>
                        : <Button size="xs" leftSection={<Play size={11} />}>Continue</Button>}
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>

            <Stack gap="md">
              {/* Stats gradient card */}
              <Paper radius="xl" p="lg" style={{ background:"linear-gradient(135deg,#6366f1,#1d4ed8)", color:"white" }}>
                <Text size="xs" fw={600} tt="uppercase" style={{ opacity:0.8, letterSpacing:"0.08em" }} mb="md">My Learning Stats</Text>
                <Stack gap="sm">
                  {[
                    { label:"Courses Enrolled",  value: enrolled.length          },
                    { label:"Completed",          value: completed.length         },
                    { label:"Avg Progress",       value: `${avgProg}%`            },
                    { label:"Certifications",     value: CERTIFICATIONS.length    },
                  ].map(({ label, value }, i, arr) => (
                    <Box key={label} pb={i < arr.length-1 ? "sm" : 0} mb={i < arr.length-1 ? "sm" : 0}
                      style={{ borderBottom: i < arr.length-1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                      <Group justify="space-between">
                        <Text size="sm" style={{ opacity:0.85 }}>{label}</Text>
                        <Text size="md" fw={700}>{value}</Text>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Recommended */}
              <Paper withBorder radius="xl" style={{ overflow:"hidden" }}>
                <Box px="md" py="sm" style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                  <Text fw={700} size="sm">Recommended For You</Text>
                </Box>
                <Stack gap={0}>
                  {COURSES.filter((c) => !c.isEnrolled).slice(0, 3).map((c, i, arr) => (
                    <Group key={c.id} px="md" py="sm" gap="sm"
                      style={{ borderBottom: i < arr.length-1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                      <Box w={36} h={36} style={{ borderRadius:10, background: c.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.icon}</Box>
                      <Box flex={1} miw={0}>
                        <Text size="sm" fw={600} truncate>{c.title}</Text>
                        <Badge size="xs" color={CAT_COLOR[c.category] ?? "gray"} variant="light">{c.category}</Badge>
                      </Box>
                      <ChevronRight size={14} color="var(--mantine-color-dimmed)" />
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>

        {/* ── CERTIFICATIONS ── */}
        <Tabs.Panel value="certifications" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {CERTIFICATIONS.map((cert) => (
              <Paper key={cert.id} withBorder radius="xl" style={{ overflow:"hidden" }}>
                <Box h={4} style={{ background:"linear-gradient(90deg,#f59e0b,#fbbf24)" }} />
                <Stack p="lg" gap="md">
                  <Group gap="md" wrap="nowrap">
                    <Avatar size={48} radius="xl" color={avatarColor(cert.employee)}>{initials(cert.employee)}</Avatar>
                    <Box flex={1} miw={0}>
                      <Text fw={700}>{cert.employee}</Text>
                      <Text size="xs" c="dimmed" truncate>{cert.course}</Text>
                    </Box>
                    <ThemeIcon color="yellow" variant="light" size={44} radius="xl"><Award size={22} /></ThemeIcon>
                  </Group>

                  <Paper withBorder p="xs" radius="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Score Achieved</Text>
                      <Text size="lg" fw={700} c={cert.score >= 90 ? "green" : "blue"}>{cert.score}%</Text>
                    </Group>
                  </Paper>
                  <Progress value={cert.score} color={cert.score >= 90 ? "green" : "blue"} size="sm" radius="xl" />

                  <Group justify="space-between">
                    <Badge size="xs" color={CAT_COLOR[cert.category] ?? "gray"} variant="light">{cert.category}</Badge>
                    <Group gap={4}><CheckCircle size={11} color="var(--mantine-color-green-6)" /><Text size="xs" c="dimmed">{fmtDate(cert.date)}</Text></Group>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        {/* ── ANALYTICS ── */}
        <Tabs.Panel value="analytics" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper withBorder p="lg" radius="lg">
                <Text fw={700} size="sm" mb="md">Course Completion Trend</Text>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={PROGRESS_CHART} barSize={16} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="enrolled"  name="Enrolled"  fill="#a5b4fc" radius={[3,3,0,0]} />
                    <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Paper withBorder p="lg" radius="lg">
                <Text fw={700} size="sm" mb="md">By Category</Text>
                <Stack gap="sm">
                  {Object.entries(COURSES.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {})).map(([cat, count]) => {
                    const pct = Math.round((count / COURSES.length) * 100);
                    return (
                      <Box key={cat}>
                        <Group justify="space-between" mb={4}>
                          <Text size="sm" fw={500}>{cat}</Text>
                          <Text size="xs" c="dimmed">{count} ({pct}%)</Text>
                        </Group>
                        <Progress value={pct} color={CAT_COLOR[cat] ?? "gray"} size="sm" radius="xl" />
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              {[
                { label:"Completion Rate",   value:`${Math.round((completed.length/COURSES.length)*100)}%`, color:"green"  },
                { label:"Avg Course Rating", value:(COURSES.reduce((s,c)=>s+c.rating,0)/COURSES.length).toFixed(1), color:"yellow" },
                { label:"Total Enrollments", value:COURSES.reduce((s,c)=>s+c.enrolled,0), color:"blue"   },
                { label:"Avg Duration",      value:`${Math.round(COURSES.reduce((s,c)=>s+parseInt(c.duration),0)/COURSES.length)}h`, color:"violet" },
              ].map(({ label, value, color }) => (
                <Paper key={label} withBorder p="lg" radius="lg" ta="center">
                  <Text size="xl" fw={800} c={color}>{value}</Text>
                  <Text size="xs" c="dimmed" mt={4}>{label}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── LEADERBOARD ── */}
        <Tabs.Panel value="leaderboard" pt="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ alignItems: "start" }}>
            <Paper withBorder radius="xl" style={{ overflow:"hidden" }}>
              <Box px="lg" py="md" style={{ borderBottom:"1px solid var(--mantine-color-default-border)" }}>
                <Text fw={700}>🏆 Top Learners</Text>
                <Text size="xs" c="dimmed">Ranked by learning points</Text>
              </Box>
              <Stack gap={0}>
                {LEADERBOARD.map((p, i, arr) => (
                  <Group key={p.rank} px="lg" py="md" gap="md"
                    style={{ borderBottom: i < arr.length-1 ? "1px solid var(--mantine-color-default-border)" : "none" }}>
                    <Text size={p.rank <= 3 ? "lg" : "sm"} fw={700} w={32} ta="center"
                      c={p.rank <= 3 ? "yellow" : "dimmed"}>{p.badge}</Text>
                    <Avatar size={36} radius="xl" color={avatarColor(p.name)}>{initials(p.name)}</Avatar>
                    <Box flex={1}>
                      <Text size="sm" fw={600}>{p.name}</Text>
                      <Text size="xs" c="dimmed">{p.courses} courses completed</Text>
                    </Box>
                    <Box ta="right">
                      <Text size="md" fw={700} c="blue">{p.points.toLocaleString()}</Text>
                      <Text size="xs" c="dimmed">points</Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Stack gap="md">
              <Paper radius="xl" p="xl" ta="center" style={{ background:"linear-gradient(135deg,#f59e0b,#b45309)", color:"white" }}>
                <Text size="xs" fw={600} tt="uppercase" style={{ opacity:0.85, letterSpacing:"0.08em" }}>Your Rank</Text>
                <Text size="3rem" fw={800} lh={1} my="xs">#1</Text>
                <Text size="sm" style={{ opacity:0.9 }}>Mani · 2,840 pts</Text>
              </Paper>

              <Paper withBorder radius="xl" p="lg">
                <Text fw={700} mb="md">Achievements</Text>
                <Stack gap="sm">
                  {[
                    { emoji:"🎯", label:"First Course",   desc:"Completed your first course",  earned:true  },
                    { emoji:"🔥", label:"On Fire",         desc:"3 courses in one month",        earned:true  },
                    { emoji:"💡", label:"Quick Learner",   desc:"Finished a course in one day",  earned:true  },
                    { emoji:"🏅", label:"Top Scorer",      desc:"Score 95%+ on any assessment",  earned:false },
                    { emoji:"🎓", label:"Graduate",        desc:"Earn 5 certifications",         earned:false },
                  ].map(({ emoji, label, desc, earned }) => (
                    <Group key={label} gap="sm" style={{ opacity: earned ? 1 : 0.4 }}>
                      <Text size="xl" style={{ flexShrink:0 }}>{emoji}</Text>
                      <Box flex={1}>
                        <Text size="sm" fw={600}>{label}</Text>
                        <Text size="xs" c="dimmed">{desc}</Text>
                      </Box>
                      {earned && <CheckCircle size={15} color="var(--mantine-color-green-6)" />}
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Course Detail Modal */}
      <Modal opened={!!viewCourse} onClose={() => setViewCourse(null)} size="md" radius="xl" padding={0}
        title={null} withCloseButton={false}>
        {viewCourse && (
          <>
            <Box h={120} style={{ background: viewCourse.gradient, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"var(--mantine-radius-xl) var(--mantine-radius-xl) 0 0" }}>
              <Text size="3rem">{viewCourse.icon}</Text>
              <ActionIcon pos="absolute" top={12} right={12} variant="white" radius="xl" size="sm"
                onClick={() => setViewCourse(null)}><IconX size={14} /></ActionIcon>
            </Box>
            <Stack p="lg" gap="md">
              <Group gap="xs">
                <Badge size="sm" color={CAT_COLOR[viewCourse.category] ?? "gray"} variant="light">{viewCourse.category}</Badge>
                <Badge size="sm" color={DIFF_COLOR[viewCourse.difficulty] ?? "gray"} variant="light">{viewCourse.difficulty}</Badge>
              </Group>
              <Text size="xl" fw={700}>{viewCourse.title}</Text>
              <Group gap="sm">
                <Stars rating={viewCourse.rating} />
                <Text size="xs" c="dimmed">· by {viewCourse.instructor}</Text>
              </Group>
              <SimpleGrid cols={3} spacing="sm">
                {[["Duration",viewCourse.duration],["Lessons",viewCourse.lessons],["Enrolled",viewCourse.enrolled]].map(([label,value]) => (
                  <Paper key={label} withBorder p="sm" radius="md" ta="center">
                    <Text size="lg" fw={700}>{value}</Text>
                    <Text size="xs" c="dimmed">{label}</Text>
                  </Paper>
                ))}
              </SimpleGrid>
              {viewCourse.isEnrolled && (
                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">Your Progress</Text>
                    <Text size="xs" fw={700} c="blue">{viewCourse.progress}%</Text>
                  </Group>
                  <Progress value={viewCourse.progress} color={viewCourse.progress === 100 ? "green" : "blue"} size="sm" radius="xl" />
                </Box>
              )}
              <Button fullWidth radius="md" size="md" onClick={() => setViewCourse(null)}>
                {viewCourse.isEnrolled ? (viewCourse.progress === 100 ? "View Certificate" : "Continue Learning") : "Enroll Now"}
              </Button>
            </Stack>
          </>
        )}
      </Modal>
    </Stack>
  );
};

export default LMS;
