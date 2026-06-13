import React, { useState } from "react";
import {
  BookOpen,
  Award,
  Play,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";

const mockCourses = [
  {
    id: 1,
    title: "React Fundamentals",
    category: "Frontend",
    duration: "8h",
    enrolled: 12,
    difficulty: "Beginner",
    gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    progress: 65,
    isEnrolled: true,
  },
  {
    id: 2,
    title: "Information Security Basics",
    category: "Security",
    duration: "4h",
    enrolled: 25,
    difficulty: "Intermediate",
    gradient: "linear-gradient(135deg, #dc2626, #b91c1c)",
    progress: 0,
    isEnrolled: false,
  },
  {
    id: 3,
    title: "HR Policies & Compliance",
    category: "HR",
    duration: "2h",
    enrolled: 30,
    difficulty: "Beginner",
    gradient: "linear-gradient(135deg, #16a34a, #15803d)",
    progress: 100,
    isEnrolled: true,
  },
  {
    id: 4,
    title: "Advanced Node.js",
    category: "Backend",
    duration: "12h",
    enrolled: 8,
    difficulty: "Advanced",
    gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    progress: 30,
    isEnrolled: true,
  },
  {
    id: 5,
    title: "Data Analysis with Excel",
    category: "Analytics",
    duration: "6h",
    enrolled: 18,
    difficulty: "Intermediate",
    gradient: "linear-gradient(135deg, #d97706, #b45309)",
    progress: 0,
    isEnrolled: false,
  },
  {
    id: 6,
    title: "Leadership & Management",
    category: "Leadership",
    duration: "5h",
    enrolled: 15,
    difficulty: "Intermediate",
    gradient: "linear-gradient(135deg, #0891b2, #0e7490)",
    progress: 80,
    isEnrolled: true,
  },
];

const mockCertifications = [
  {
    id: 1,
    employee: "Mani",
    course: "React Fundamentals",
    date: "2026-03-15",
    category: "Frontend",
  },
  {
    id: 2,
    employee: "Suriya",
    course: "Information Security Basics",
    date: "2026-04-02",
    category: "Security",
  },
  {
    id: 3,
    employee: "Big Kundi",
    course: "HR Policies & Compliance",
    date: "2026-02-20",
    category: "HR",
  },
  {
    id: 4,
    employee: "Suganthan",
    course: "Leadership & Management",
    date: "2026-01-10",
    category: "Leadership",
  },
  {
    id: 5,
    employee: "Santhosh",
    course: "Advanced Node.js",
    date: "2026-05-01",
    category: "Backend",
  },
];

const categoryColors = {
  Frontend: { bg: "#dbeafe", text: "#1d4ed8" },
  Security: { bg: "#fee2e2", text: "#b91c1c" },
  HR: { bg: "#dcfce7", text: "#15803d" },
  Backend: { bg: "#ede9fe", text: "#6d28d9" },
  Analytics: { bg: "#fef3c7", text: "#b45309" },
  Leadership: { bg: "#cffafe", text: "#0e7490" },
};

const difficultyColors = {
  Beginner: { bg: "#dcfce7", text: "#15803d" },
  Intermediate: { bg: "#fef3c7", text: "#b45309" },
  Advanced: { bg: "#fee2e2", text: "#b91c1c" },
};

const LMS = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState("courses");

  const colors = {
    pageBg: darkMode ? "#0f172a" : "#f1f5f9",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#0f172a",
    border: darkMode ? "#334155" : "#e2e8f0",
    subText: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    tabActiveBg: darkMode ? "#2563eb" : "#2563eb",
    tabInactiveBg: darkMode ? "#1e293b" : "#ffffff",
    tabInactiveText: darkMode ? "#94a3b8" : "#64748b",
    progressBg: darkMode ? "#334155" : "#e2e8f0",
  };

  const enrolledCourses = mockCourses.filter((c) => c.isEnrolled);
  const completedCourses = mockCourses.filter((c) => c.progress === 100);

  const kpiCards = [
    {
      label: "Total Courses",
      value: mockCourses.length,
      icon: <BookOpen size={22} />,
      color: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      label: "Enrolled",
      value: enrolledCourses.length,
      icon: <Users size={22} />,
      color: "#7c3aed",
      bgColor: "#ede9fe",
    },
    {
      label: "Completed",
      value: completedCourses.length,
      icon: <CheckCircle size={22} />,
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      label: "Certifications Earned",
      value: mockCertifications.length,
      icon: <Award size={22} />,
      color: "#d97706",
      bgColor: "#fef3c7",
    },
  ];

  const tabs = [
    { id: "courses", label: "Courses" },
    { id: "mylearning", label: "My Learning" },
    { id: "certifications", label: "Certifications" },
  ];

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: colors.pageBg,
    padding: "24px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: colors.text,
    boxSizing: "border-box",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  };

  const headingStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: colors.text,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const addButtonStyle = {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s",
  };

  const kpiGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  };

  const kpiCardStyle = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: darkMode
      ? "0 1px 4px rgba(0,0,0,0.4)"
      : "0 1px 4px rgba(0,0,0,0.06)",
  };

  const tabsContainerStyle = {
    display: "flex",
    gap: "4px",
    marginBottom: "24px",
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "10px",
    padding: "4px",
    width: "fit-content",
  };

  const courseGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  };

  const cardStyle = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: darkMode
      ? "0 2px 8px rgba(0,0,0,0.4)"
      : "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={headingStyle}>
          <BookOpen size={26} color="#2563eb" />
          Learning Management System
        </h1>
        <button style={addButtonStyle}>
          <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
          Add Course
        </button>
      </div>

      {/* KPI Cards */}
      <div style={kpiGridStyle}>
        {kpiCards.map((card, index) => (
          <div key={index} style={kpiCardStyle}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                backgroundColor: card.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: colors.text,
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: colors.subText,
                  marginTop: "2px",
                }}
              >
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={tabsContainerStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 20px",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "600" : "500",
              backgroundColor:
                activeTab === tab.id
                  ? colors.tabActiveBg
                  : "transparent",
              color:
                activeTab === tab.id ? "#ffffff" : colors.tabInactiveText,
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div style={courseGridStyle}>
          {mockCourses.map((course) => {
            const catColor = categoryColors[course.category] || {
              bg: "#e2e8f0",
              text: "#475569",
            };
            const diffColor = difficultyColors[course.difficulty] || {
              bg: "#e2e8f0",
              text: "#475569",
            };
            return (
              <div key={course.id} style={cardStyle}>
                {/* Thumbnail */}
                <div
                  style={{
                    height: "120px",
                    background: course.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <BookOpen size={40} color="rgba(255,255,255,0.7)" />
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#ffffff",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {course.difficulty}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Badges */}
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: catColor.bg,
                        color: catColor.text,
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {course.category}
                    </span>
                    <span
                      style={{
                        backgroundColor: diffColor.bg,
                        color: diffColor.text,
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: colors.text,
                      margin: "0 0 10px 0",
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h3>

                  {/* Meta */}
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      marginBottom: "12px",
                      color: colors.subText,
                      fontSize: "13px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock size={13} />
                      {course.duration}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Users size={13} />
                      {course.enrolled} enrolled
                    </span>
                  </div>

                  {/* Progress bar for enrolled courses */}
                  {course.isEnrolled && (
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: colors.subText,
                          marginBottom: "5px",
                        }}
                      >
                        <span>Progress</span>
                        <span style={{ fontWeight: "600", color: colors.text }}>
                          {course.progress}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          backgroundColor: colors.progressBg,
                          borderRadius: "99px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${course.progress}%`,
                            background:
                              course.progress === 100
                                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                : "linear-gradient(90deg, #2563eb, #3b82f6)",
                            borderRadius: "99px",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div style={{ marginTop: "auto" }}>
                    <button
                      style={{
                        width: "100%",
                        padding: "9px 0",
                        borderRadius: "8px",
                        border: course.isEnrolled
                          ? "none"
                          : `1.5px solid #2563eb`,
                        backgroundColor: course.isEnrolled
                          ? course.progress === 100
                            ? "#16a34a"
                            : "#2563eb"
                          : "transparent",
                        color: course.isEnrolled ? "#ffffff" : "#2563eb",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      {course.isEnrolled ? (
                        course.progress === 100 ? (
                          <>
                            <CheckCircle size={14} />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            Continue
                          </>
                        )
                      ) : (
                        <>
                          <BookOpen size={14} />
                          Enroll
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My Learning Tab */}
      {activeTab === "mylearning" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {enrolledCourses.map((course) => {
            const catColor = categoryColors[course.category] || {
              bg: "#e2e8f0",
              text: "#475569",
            };
            return (
              <div
                key={course.id}
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: darkMode
                    ? "0 1px 4px rgba(0,0,0,0.3)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
                  flexWrap: "wrap",
                }}
              >
                {/* Thumbnail mini */}
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "10px",
                    background: course.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={22} color="rgba(255,255,255,0.85)" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: colors.text,
                      marginBottom: "4px",
                    }}
                  >
                    {course.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: catColor.bg,
                        color: catColor.text,
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {course.category}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: colors.subText,
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Clock size={12} />
                      {course.duration}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ minWidth: "200px", flex: 2 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: colors.subText,
                      marginBottom: "6px",
                    }}
                  >
                    <span>Progress</span>
                    <span
                      style={{
                        fontWeight: "700",
                        color:
                          course.progress === 100
                            ? "#16a34a"
                            : colors.text,
                      }}
                    >
                      {course.progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: colors.progressBg,
                      borderRadius: "99px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${course.progress}%`,
                        background:
                          course.progress === 100
                            ? "linear-gradient(90deg, #16a34a, #22c55e)"
                            : "linear-gradient(90deg, #2563eb, #60a5fa)",
                        borderRadius: "99px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ flexShrink: 0 }}>
                  {course.progress === 100 ? (
                    <span
                      style={{
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <CheckCircle size={13} />
                      Completed
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: "#dbeafe",
                        color: "#1d4ed8",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Play size={13} />
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === "certifications" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {mockCertifications.map((cert) => {
            const catColor = categoryColors[cert.category] || {
              bg: "#e2e8f0",
              text: "#475569",
            };
            return (
              <div
                key={cert.id}
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: darkMode
                    ? "0 2px 8px rgba(0,0,0,0.35)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative top accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                      "linear-gradient(90deg, #d97706, #f59e0b)",
                  }}
                />

                {/* Badge icon */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    backgroundColor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <Award size={26} color="#d97706" />
                </div>

                {/* Employee name */}
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: "4px",
                  }}
                >
                  {cert.employee}
                </div>

                {/* Course name */}
                <div
                  style={{
                    fontSize: "13px",
                    color: colors.subText,
                    marginBottom: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  {cert.course}
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: "1px",
                    backgroundColor: colors.border,
                    marginBottom: "12px",
                  }}
                />

                {/* Footer row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: catColor.bg,
                      color: catColor.text,
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "3px 9px",
                      borderRadius: "20px",
                    }}
                  >
                    {cert.category}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: colors.subText,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle size={13} color="#16a34a" />
                    {new Date(cert.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LMS;
