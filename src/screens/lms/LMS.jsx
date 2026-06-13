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
  IconX as X,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

import { COLORS }                              from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT } from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }       from "../../theme/spacing";
import { RADIUS, SHADOW, TRANSITION, ICON_SIZE, Z_INDEX } from "../../theme/sizes";

// ── Data ─────────────────────────────────────────────────────────────────────

const COURSES = [
  { id: 1,  title: "React Fundamentals",          category: "Frontend",    duration: "8h",  enrolled: 12, difficulty: "Beginner",     progress: 65,  isEnrolled: true,  rating: 4.8, lessons: 24, instructor: "Siva",      gradient: `linear-gradient(135deg, ${COLORS.primary} 0%, #1d4ed8 100%)`,  icon: "⚛️"  },
  { id: 2,  title: "Information Security Basics", category: "Security",   duration: "4h",  enrolled: 25, difficulty: "Intermediate", progress: 0,   isEnrolled: false, rating: 4.6, lessons: 14, instructor: "Suganthan", gradient: `linear-gradient(135deg, ${COLORS.danger}  0%, #b91c1c 100%)`,  icon: "🔐"  },
  { id: 3,  title: "HR Policies & Compliance",    category: "HR",         duration: "2h",  enrolled: 30, difficulty: "Beginner",     progress: 100, isEnrolled: true,  rating: 4.5, lessons: 8,  instructor: "Big Kundi", gradient: `linear-gradient(135deg, ${COLORS.success} 0%, #15803d 100%)`,  icon: "📋"  },
  { id: 4,  title: "Advanced Node.js",            category: "Backend",    duration: "12h", enrolled: 8,  difficulty: "Advanced",     progress: 30,  isEnrolled: true,  rating: 4.9, lessons: 36, instructor: "Mani",      gradient: `linear-gradient(135deg, ${COLORS.purple}  0%, #6d28d9 100%)`,  icon: "🚀"  },
  { id: 5,  title: "Data Analysis with Excel",    category: "Analytics",  duration: "6h",  enrolled: 18, difficulty: "Intermediate", progress: 0,   isEnrolled: false, rating: 4.3, lessons: 20, instructor: "Safeer",    gradient: `linear-gradient(135deg, ${COLORS.warning} 0%, #b45309 100%)`,  icon: "📊"  },
  { id: 6,  title: "Leadership & Management",     category: "Leadership", duration: "5h",  enrolled: 15, difficulty: "Intermediate", progress: 80,  isEnrolled: true,  rating: 4.7, lessons: 16, instructor: "Siva",      gradient: `linear-gradient(135deg, ${COLORS.info}    0%, #0284c7 100%)`,  icon: "🎯"  },
  { id: 7,  title: "Python for Data Science",     category: "Analytics",  duration: "10h", enrolled: 22, difficulty: "Intermediate", progress: 0,   isEnrolled: false, rating: 4.8, lessons: 30, instructor: "Aravinth",  gradient: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`,            icon: "🐍"  },
  { id: 8,  title: "UI/UX Design Principles",     category: "Design",     duration: "7h",  enrolled: 14, difficulty: "Beginner",     progress: 0,   isEnrolled: false, rating: 4.6, lessons: 22, instructor: "Suriya",    gradient: `linear-gradient(135deg, #ec4899 0%, #be185d 100%)`,            icon: "🎨"  },
];

const CERTIFICATIONS = [
  { id: 1, employee: "Mani",       course: "React Fundamentals",       date: "2026-03-15", category: "Frontend",  score: 94 },
  { id: 2, employee: "Suriya",     course: "Information Security",      date: "2026-04-02", category: "Security",  score: 88 },
  { id: 3, employee: "Big Kundi",  course: "HR Policies & Compliance",  date: "2026-02-20", category: "HR",        score: 96 },
  { id: 4, employee: "Suganthan",  course: "Leadership & Management",   date: "2026-01-10", category: "Leadership",score: 91 },
  { id: 5, employee: "Santhosh",   course: "Advanced Node.js",          date: "2026-05-01", category: "Backend",   score: 89 },
  { id: 6, employee: "Aravinth",   course: "Python for Data Science",   date: "2026-05-20", category: "Analytics", score: 93 },
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

const CAT_COLORS = {
  Frontend:   { bg: COLORS.primaryMuted,  text: COLORS.primary, dot: COLORS.primary },
  Security:   { bg: COLORS.dangerMuted,   text: COLORS.danger,  dot: COLORS.danger  },
  HR:         { bg: COLORS.successLight,  text: COLORS.success, dot: COLORS.success },
  Backend:    { bg: COLORS.purpleMuted,   text: COLORS.purple,  dot: COLORS.purple  },
  Analytics:  { bg: COLORS.warningLight,  text: COLORS.warning, dot: COLORS.warning },
  Leadership: { bg: COLORS.infoLight,     text: COLORS.info,    dot: COLORS.info    },
  Design:     { bg: "#fce7f3",            text: "#be185d",      dot: "#ec4899"      },
};

const DIFF_COLORS = {
  Beginner:     { bg: COLORS.successLight, text: COLORS.success },
  Intermediate: { bg: COLORS.warningLight, text: COLORS.warning },
  Advanced:     { bg: COLORS.dangerMuted,  text: COLORS.danger  },
};

const CATEGORIES = ["All", "Frontend", "Backend", "Security", "HR", "Analytics", "Leadership", "Design"];

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const initials = (n = "") => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={11} fill={s <= Math.round(rating) ? COLORS.warning : "none"} color={s <= Math.round(rating) ? COLORS.warning : COLORS.borderLight} />
    ))}
    <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMutedLight, marginLeft: 3 }}>{rating}</span>
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVT_COLORS = [
  { bg: COLORS.primaryMuted, color: COLORS.primary },
  { bg: COLORS.successLight, color: COLORS.success },
  { bg: COLORS.purpleMuted,  color: COLORS.purple  },
  { bg: COLORS.warningLight, color: COLORS.warning },
];
const avatarFor = (name) => AVT_COLORS[name.charCodeAt(0) % AVT_COLORS.length];

// ── Main ─────────────────────────────────────────────────────────────────────

const LMS = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab]   = useState("courses");
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [viewCourse, setViewCourse] = useState(null);

  const enrolled  = COURSES.filter((c) => c.isEnrolled);
  const completed = COURSES.filter((c) => c.progress === 100);
  const avgProg   = Math.round(enrolled.reduce((s, c) => s + c.progress, 0) / (enrolled.length || 1));

  const kpis = [
    { label: "Total Courses",        value: COURSES.length,        icon: BookOpen,   color: COLORS.primary, bg: COLORS.primaryMuted, sub: `${CATEGORIES.length - 1} categories`  },
    { label: "Enrolled",             value: enrolled.length,       icon: Users,      color: COLORS.purple,  bg: COLORS.purpleMuted,  sub: "Active courses"                         },
    { label: "Completed",            value: completed.length,      icon: CheckCircle,color: COLORS.success, bg: COLORS.successLight, sub: `${avgProg}% avg progress`               },
    { label: "Certifications",       value: CERTIFICATIONS.length, icon: Award,      color: COLORS.warning, bg: COLORS.warningLight, sub: "Earned this year"                       },
  ];

  const filteredCourses = COURSES.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    const matchCat    = catFilter === "All" || c.category === catFilter;
    return matchSearch && matchCat;
  });

  const TABS = [
    { id: "courses",       label: "Courses",        icon: BookOpen   },
    { id: "mylearning",    label: "My Learning",    icon: Target     },
    { id: "certifications",label: "Certifications", icon: Award      },
    { id: "analytics",     label: "Analytics",      icon: BarChart2  },
    { id: "leaderboard",   label: "Leaderboard",    icon: TrendingUp },
  ];

  return (
    <div style={{ fontFamily: FONT_FAMILY.base, color: surface.text }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING[5], flexWrap: "wrap", gap: GAP.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, display: "flex", alignItems: "center", gap: GAP.sm }}>
            <BookOpen size={26} color={COLORS.primary} /> Learning Management System
          </h1>
          <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, color: surface.subtext }}>Grow your skills, earn certifications, lead the leaderboard</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: GAP.xs, background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: PADDING.btn, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Course
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: `${SPACING[4]}px ${SPACING[5]}px`, display: "flex", alignItems: "center", gap: GAP.md }}>
            <div style={{ width: LAYOUT.iconBoxLg, height: LAYOUT.iconBoxLg, borderRadius: RADIUS.xl, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <k.icon size={ICON_SIZE.lg} color={k.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1 }}>{k.value}</p>
              <p style={{ margin: "3px 0 1px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{k.label}</p>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: GAP.xs, marginBottom: SPACING[5], background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: GAP.xs, width: "fit-content" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: `${GAP.sm}px ${SPACING[4]}px`,
            borderRadius: RADIUS.md, border: "none", cursor: "pointer",
            fontSize: FONT_SIZE.base, fontWeight: activeTab === id ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium,
            fontFamily: FONT_FAMILY.base,
            background: activeTab === id ? COLORS.primary : "transparent",
            color: activeTab === id ? COLORS.white : surface.subtext,
            transition: TRANSITION.fast,
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          COURSES TAB
      ══════════════════════════════════════ */}
      {activeTab === "courses" && (
        <>
          {/* Search + Filter bar */}
          <div style={{ display: "flex", gap: GAP.md, marginBottom: SPACING[5], flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <Search size={15} color={COLORS.gray400} style={{ position: "absolute", left: SPACING[3], top: "50%", transform: "translateY(-50%)" }} />
              <input placeholder="Search courses, instructors…" value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: `${GAP.sm}px ${GAP.md}px ${GAP.sm}px ${SPACING[8]}px`, fontSize: FONT_SIZE.base, fontFamily: FONT_FAMILY.base, background: surface.inputBg, color: surface.text, outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: GAP.xs, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCatFilter(cat)} style={{
                  padding: `${GAP.xs}px ${GAP.md}px`, borderRadius: RADIUS.full,
                  border: `1px solid ${catFilter === cat ? COLORS.primary : surface.border}`,
                  background: catFilter === cat ? COLORS.primary : surface.inputBg,
                  color: catFilter === cat ? COLORS.white : surface.subtext,
                  fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base, cursor: "pointer", transition: TRANSITION.fast,
                }}>
                  {cat}
                </button>
              ))}
            </div>
            <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext, marginLeft: "auto" }}>{filteredCourses.length} courses</span>
          </div>

          {/* Course Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: GAP.lg }}>
            {filteredCourses.map((course) => {
              const cat = CAT_COLORS[course.category] || { bg: COLORS.gray50, text: COLORS.gray700 };
              return (
                <div key={course.id}
                  style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden", display: "flex", flexDirection: "column", transition: TRANSITION.fast, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = SHADOW.modal, e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW.card, e.currentTarget.style.transform = "translateY(0)")}
                  onClick={() => setViewCourse(course)}
                >
                  {/* Thumbnail */}
                  <div style={{ height: 140, background: course.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ fontSize: 48, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>{course.icon}</span>
                    {/* Difficulty chip */}
                    <span style={{ position: "absolute", top: SPACING[3], right: SPACING[3], background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", borderRadius: RADIUS.md, padding: `2px 10px`, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.white }}>
                      {course.difficulty}
                    </span>
                    {/* Enrolled indicator */}
                    {course.isEnrolled && (
                      <span style={{ position: "absolute", top: SPACING[3], left: SPACING[3], background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", borderRadius: RADIUS.md, padding: `2px 8px`, fontSize: 10, fontWeight: FONT_WEIGHT.bold, color: COLORS.white }}>
                        ENROLLED
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: SPACING[4], flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Category badge */}
                    <div style={{ display: "flex", gap: GAP.xs, marginBottom: GAP.sm, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: cat.bg, color: cat.text }}>{course.category}</span>
                    </div>

                    {/* Title */}
                    <h3 style={{ margin: `0 0 ${GAP.xs}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1.3 }}>{course.title}</h3>

                    {/* Instructor + Rating */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: GAP.sm }}>
                      <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>by {course.instructor}</span>
                      <Stars rating={course.rating} />
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "flex", gap: GAP.md, marginBottom: GAP.md, color: surface.subtext, fontSize: FONT_SIZE.xs }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{course.duration}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={12} />{course.lessons} lessons</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={12} />{course.enrolled}</span>
                    </div>

                    {/* Progress bar — enrolled only */}
                    {course.isEnrolled && (
                      <div style={{ marginBottom: GAP.md }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: FONT_SIZE.xs, color: surface.subtext, marginBottom: 5 }}>
                          <span>Progress</span>
                          <span style={{ fontWeight: FONT_WEIGHT.bold, color: course.progress === 100 ? COLORS.success : surface.text }}>{course.progress}%</span>
                        </div>
                        <div style={{ height: 6, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${course.progress}%`, background: course.progress === 100 ? `linear-gradient(90deg,${COLORS.success},#15803d)` : `linear-gradient(90deg,${COLORS.primary},#1d4ed8)`, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      style={{
                        marginTop: "auto", width: "100%",
                        padding: `${GAP.sm + 2}px 0`,
                        borderRadius: RADIUS.lg,
                        border: course.isEnrolled ? "none" : `1.5px solid ${COLORS.primary}`,
                        background: course.isEnrolled ? (course.progress === 100 ? COLORS.success : COLORS.primary) : "transparent",
                        color: course.isEnrolled ? COLORS.white : COLORS.primary,
                        fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.base,
                        fontFamily: FONT_FAMILY.base, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: GAP.xs + 2,
                        transition: TRANSITION.fast,
                      }}>
                      {course.isEnrolled
                        ? course.progress === 100
                          ? <><CheckCircle size={15} /> Completed</>
                          : <><Play size={15} /> Continue</>
                        : <><BookOpen size={15} /> Enroll Now</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          MY LEARNING TAB
      ══════════════════════════════════════ */}
      {activeTab === "mylearning" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: GAP.lg, alignItems: "start" }}>
          {/* Course list */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
            <h3 style={{ margin: `0 0 ${GAP.xs}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>In Progress & Completed</h3>
            {enrolled.map((course) => {
              const cat = CAT_COLORS[course.category] || { bg: COLORS.gray50, text: COLORS.gray700 };
              return (
                <div key={course.id} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${course.progress === 100 ? COLORS.success + "40" : surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
                  {course.progress === 100 && <div style={{ height: 3, background: `linear-gradient(90deg,${COLORS.success},#34d399)` }} />}
                  <div style={{ padding: `${SPACING[4]}px ${SPACING[5]}px`, display: "flex", alignItems: "center", gap: GAP.lg, flexWrap: "wrap" }}>
                    {/* Icon */}
                    <div style={{ width: 56, height: 56, borderRadius: RADIUS.xl, background: course.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                      {course.icon}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, flexWrap: "wrap", marginBottom: 3 }}>
                        <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{course.title}</p>
                        <span style={{ padding: "2px 8px", borderRadius: RADIUS.full, fontSize: 10, fontWeight: FONT_WEIGHT.semibold, background: cat.bg, color: cat.text }}>{course.category}</span>
                      </div>
                      <div style={{ display: "flex", gap: GAP.md, fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} />{course.duration}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><BookOpen size={11} />{course.lessons} lessons</span>
                        <span>by {course.instructor}</span>
                      </div>
                    </div>
                    {/* Progress */}
                    <div style={{ minWidth: 160, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: FONT_SIZE.xs, color: surface.subtext, marginBottom: 5 }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: FONT_WEIGHT.bold, color: course.progress === 100 ? COLORS.success : COLORS.primary }}>{course.progress}%</span>
                      </div>
                      <div style={{ height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${course.progress}%`, background: course.progress === 100 ? `linear-gradient(90deg,${COLORS.success},#34d399)` : `linear-gradient(90deg,${COLORS.primary},#1d4ed8)`, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                      </div>
                    </div>
                    {/* Status */}
                    <div style={{ flexShrink: 0 }}>
                      {course.progress === 100
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: COLORS.successLight, color: COLORS.success }}><CheckCircle size={13} />Completed</span>
                        : <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: COLORS.primary, color: COLORS.white, border: "none", cursor: "pointer" }}><Play size={12} />Continue</button>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
            {/* My stats */}
            <div style={{ background: `linear-gradient(135deg,${COLORS.primary},#1d4ed8)`, borderRadius: RADIUS["2xl"], padding: SPACING[5], color: COLORS.white }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>My Learning Stats</p>
              {[
                { label: "Courses Enrolled",  value: enrolled.length  },
                { label: "Completed",          value: completed.length },
                { label: "Avg Progress",       value: `${avgProg}%`   },
                { label: "Certifications",     value: CERTIFICATIONS.length },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < arr.length - 1 ? GAP.sm : 0, marginBottom: i < arr.length - 1 ? GAP.sm : 0, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                  <span style={{ fontSize: FONT_SIZE.sm, opacity: 0.85 }}>{label}</span>
                  <span style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recommended */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
              <div style={{ padding: `${SPACING[4]}px ${SPACING[4]}px ${SPACING[3]}px`, borderBottom: `1px solid ${surface.border}` }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Recommended For You</p>
              </div>
              {COURSES.filter((c) => !c.isEnrolled).slice(0, 3).map((c, i, arr) => {
                const cat = CAT_COLORS[c.category] || { bg: COLORS.gray50, text: COLORS.gray700 };
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: `${SPACING[3]}px ${SPACING[4]}px`, borderBottom: i < arr.length - 1 ? `1px solid ${surface.border}` : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: RADIUS.lg, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                      <span style={{ padding: "1px 7px", borderRadius: RADIUS.full, fontSize: 10, fontWeight: FONT_WEIGHT.semibold, background: cat.bg, color: cat.text }}>{c.category}</span>
                    </div>
                    <ChevronRight size={14} color={COLORS.gray400} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CERTIFICATIONS TAB
      ══════════════════════════════════════ */}
      {activeTab === "certifications" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: GAP.lg }}>
          {CERTIFICATIONS.map((cert) => {
            const cat = CAT_COLORS[cert.category] || { bg: COLORS.gray50, text: COLORS.gray700 };
            const av  = avatarFor(cert.employee);
            return (
              <div key={cert.id} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden", position: "relative" }}>
                {/* Gold top accent */}
                <div style={{ height: 4, background: `linear-gradient(90deg,${COLORS.warning},#f59e0b)` }} />

                <div style={{ padding: SPACING[5] }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.md, marginBottom: SPACING[4] }}>
                    <div style={{ width: 48, height: 48, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                      {initials(cert.employee)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{cert.employee}</p>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{cert.course}</p>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: RADIUS.full, background: COLORS.warningLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Award size={22} color={COLORS.warning} />
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: surface.inputBg, borderRadius: RADIUS.lg, padding: `${GAP.sm}px ${GAP.md}px`, marginBottom: SPACING[4], border: `1px solid ${surface.border}` }}>
                    <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext }}>Score Achieved</span>
                    <span style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: cert.score >= 90 ? COLORS.success : COLORS.primary }}>{cert.score}%</span>
                  </div>

                  {/* Score bar */}
                  <div style={{ height: 6, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden", marginBottom: SPACING[4] }}>
                    <div style={{ height: "100%", width: `${cert.score}%`, background: cert.score >= 90 ? `linear-gradient(90deg,${COLORS.success},#34d399)` : `linear-gradient(90deg,${COLORS.primary},#1d4ed8)`, borderRadius: RADIUS.full }} />
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: cat.bg, color: cat.text }}>{cert.category}</span>
                    <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={11} color={COLORS.success} /> {fmtDate(cert.date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          ANALYTICS TAB
      ══════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: GAP.lg }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: GAP.lg }}>
            {/* Monthly chart */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: PADDING.card }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Course Completion Trend</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={PROGRESS_CHART} barSize={16} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                  <XAxis dataKey="month" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
                  <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, background: surface.cardBg, border: `1px solid ${surface.border}` }} />
                  <Bar dataKey="enrolled"  name="Enrolled"   fill={COLORS.primaryMuted} radius={[3,3,0,0]} />
                  <Bar dataKey="completed" name="Completed"  fill={COLORS.success}      radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category distribution */}
            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: PADDING.card }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>By Category</p>
              {Object.entries(
                COURSES.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {})
              ).map(([cat, count]) => {
                const c   = CAT_COLORS[cat] || { bg: COLORS.gray50, text: COLORS.gray700, dot: COLORS.gray700 };
                const pct = Math.round((count / COURSES.length) * 100);
                return (
                  <div key={cat} style={{ marginBottom: SPACING[3] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: FONT_SIZE.sm, color: surface.text, fontWeight: FONT_WEIGHT.medium }}>{cat}</span>
                      <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>{count} <span style={{ color: COLORS.gray400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 7, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: c.dot, borderRadius: RADIUS.full, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md }}>
            {[
              { label: "Completion Rate",  value: `${Math.round((completed.length/COURSES.length)*100)}%`, color: COLORS.success, bg: COLORS.successLight },
              { label: "Avg Course Rating",value: (COURSES.reduce((s,c)=>s+c.rating,0)/COURSES.length).toFixed(1), color: COLORS.warning, bg: COLORS.warningLight },
              { label: "Total Enrollments",value: COURSES.reduce((s,c)=>s+c.enrolled,0), color: COLORS.primary, bg: COLORS.primaryMuted },
              { label: "Avg Duration",     value: `${Math.round(COURSES.reduce((s,c)=>s+parseInt(c.duration),0)/COURSES.length)}h`, color: COLORS.purple, bg: COLORS.purpleMuted },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: SPACING[5], textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color }}>{value}</p>
                <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          LEADERBOARD TAB
      ══════════════════════════════════════ */}
      {activeTab === "leaderboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: GAP.lg, alignItems: "start" }}>
          {/* Table */}
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, overflow: "hidden" }}>
            <div style={{ padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}` }}>
              <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>🏆 Top Learners</p>
              <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Ranked by learning points</p>
            </div>
            {LEADERBOARD.map((p, i, arr) => {
              const av = avatarFor(p.name);
              return (
                <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: GAP.md, padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: i < arr.length - 1 ? `1px solid ${surface.border}` : "none", transition: TRANSITION.fast }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: 32, textAlign: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: p.rank <= 3 ? FONT_SIZE.lg : FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: p.rank <= 3 ? COLORS.warning : COLORS.gray400 }}>{p.badge}</span>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: RADIUS.full, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, flexShrink: 0 }}>
                    {initials(p.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{p.courses} courses completed</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary }}>{p.points.toLocaleString()}</p>
                    <p style={{ margin: 0, fontSize: 10, color: surface.subtext }}>points</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My rank + achievements */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP.md }}>
            <div style={{ background: `linear-gradient(135deg,${COLORS.warning},#b45309)`, borderRadius: RADIUS["2xl"], padding: SPACING[5], color: COLORS.white, textAlign: "center" }}>
              <p style={{ margin: `0 0 ${GAP.xs}px`, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Rank</p>
              <p style={{ margin: 0, fontSize: 56, fontWeight: FONT_WEIGHT.bold, lineHeight: 1 }}>#1</p>
              <p style={{ margin: `${GAP.xs}px 0 0`, fontSize: FONT_SIZE.base, opacity: 0.9 }}>Mani · 2,840 pts</p>
            </div>

            <div style={{ background: surface.cardBg, borderRadius: RADIUS["2xl"], border: `1px solid ${surface.border}`, boxShadow: SHADOW.card, padding: SPACING[5] }}>
              <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Achievements</p>
              {[
                { emoji: "🎯", label: "First Course",      desc: "Completed your first course",    earned: true  },
                { emoji: "🔥", label: "On Fire",           desc: "3 courses in one month",          earned: true  },
                { emoji: "💡", label: "Quick Learner",     desc: "Finished a course in one day",    earned: true  },
                { emoji: "🏅", label: "Top Scorer",        desc: "Score 95%+ on any assessment",    earned: false },
                { emoji: "🎓", label: "Graduate",          desc: "Earn 5 certifications",           earned: false },
              ].map(({ emoji, label, desc, earned }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: GAP.sm, padding: `${GAP.sm}px 0`, opacity: earned ? 1 : 0.4 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>{label}</p>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{desc}</p>
                  </div>
                  {earned && <CheckCircle size={15} color={COLORS.success} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Course Detail Modal ── */}
      {viewCourse && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: Z_INDEX.modal, display: "flex", alignItems: "center", justifyContent: "center", padding: SPACING[5] }}
          onClick={(e) => e.target === e.currentTarget && setViewCourse(null)}>
          <div style={{ background: surface.cardBg, borderRadius: RADIUS["3xl"], width: "100%", maxWidth: 520, boxShadow: SHADOW.modal, overflow: "hidden" }}>
            {/* Gradient header */}
            <div style={{ height: 120, background: viewCourse.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ fontSize: 52 }}>{viewCourse.icon}</span>
              <button onClick={() => setViewCourse(null)} style={{ position: "absolute", top: SPACING[3], right: SPACING[3], background: "rgba(255,255,255,0.2)", border: "none", borderRadius: RADIUS.full, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.white }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: SPACING[5] }}>
              <div style={{ display: "flex", gap: GAP.xs, marginBottom: GAP.sm }}>
                {(() => { const c = CAT_COLORS[viewCourse.category] || { bg: COLORS.gray50, text: COLORS.gray700 }; return <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: c.bg, color: c.text }}>{viewCourse.category}</span>; })()}
                {(() => { const d = DIFF_COLORS[viewCourse.difficulty] || { bg: COLORS.gray50, text: COLORS.gray700 }; return <span style={{ padding: "3px 10px", borderRadius: RADIUS.full, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, background: d.bg, color: d.text }}>{viewCourse.difficulty}</span>; })()}
              </div>
              <h2 style={{ margin: `0 0 ${GAP.xs}px`, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{viewCourse.title}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: GAP.sm, marginBottom: SPACING[4] }}>
                <Stars rating={viewCourse.rating} />
                <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>· by {viewCourse.instructor}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: GAP.sm, marginBottom: SPACING[4] }}>
                {[["Duration", viewCourse.duration], ["Lessons", viewCourse.lessons], ["Enrolled", viewCourse.enrolled]].map(([label, value]) => (
                  <div key={label} style={{ background: surface.inputBg, borderRadius: RADIUS.lg, padding: `${GAP.sm}px ${GAP.md}px`, border: `1px solid ${surface.border}`, textAlign: "center" }}>
                    <p style={{ margin: "0 0 3px", fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{value}</p>
                    <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>{label}</p>
                  </div>
                ))}
              </div>
              {viewCourse.isEnrolled && (
                <div style={{ marginBottom: SPACING[4] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: FONT_SIZE.xs, color: surface.subtext }}>
                    <span>Your Progress</span><span style={{ fontWeight: FONT_WEIGHT.bold, color: COLORS.primary }}>{viewCourse.progress}%</span>
                  </div>
                  <div style={{ height: 8, background: surface.border, borderRadius: RADIUS.full, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${viewCourse.progress}%`, background: viewCourse.progress === 100 ? `linear-gradient(90deg,${COLORS.success},#34d399)` : `linear-gradient(90deg,${COLORS.primary},#1d4ed8)`, borderRadius: RADIUS.full }} />
                  </div>
                </div>
              )}
              <button onClick={() => setViewCourse(null)} style={{ width: "100%", padding: PADDING.btn, borderRadius: RADIUS.lg, border: "none", background: COLORS.primary, color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>
                {viewCourse.isEnrolled ? (viewCourse.progress === 100 ? "View Certificate" : "Continue Learning") : "Enroll Now"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LMS;
