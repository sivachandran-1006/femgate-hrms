import {
  UserPlus,
  Users,
  CheckSquare,
  Clock,
  TrendingUp,
  FileText,
  Monitor,
  Mail,
  BookOpen,
  Shield,
  Calendar,
  ChevronRight,
} from "lucide-react";

const TASK_LABELS = [
  { key: "documentCollection", label: "Document Collection", icon: FileText },
  { key: "itAssetSetup", label: "IT Asset Setup", icon: Monitor },
  { key: "emailCreation", label: "Email Creation", icon: Mail },
  { key: "trainingAssignment", label: "Training Assignment", icon: BookOpen },
  { key: "policyAcceptance", label: "Policy Acceptance", icon: Shield },
];

const MOCK_EMPLOYEES = [
  {
    id: 1,
    name: "Arjun Kumar",
    department: "IT",
    joiningDate: "2026-06-03",
    tasks: {
      documentCollection: true,
      itAssetSetup: true,
      emailCreation: true,
      trainingAssignment: false,
      policyAcceptance: false,
    },
    status: "In Progress",
  },
  {
    id: 2,
    name: "Priya Sharma",
    department: "HR",
    joiningDate: "2026-06-05",
    tasks: {
      documentCollection: true,
      itAssetSetup: true,
      emailCreation: false,
      trainingAssignment: false,
      policyAcceptance: false,
    },
    status: "In Progress",
  },
  {
    id: 3,
    name: "Karthik Raj",
    department: "Finance",
    joiningDate: "2026-06-10",
    tasks: {
      documentCollection: true,
      itAssetSetup: false,
      emailCreation: false,
      trainingAssignment: false,
      policyAcceptance: false,
    },
    status: "In Progress",
  },
  {
    id: 4,
    name: "Divya Nair",
    department: "IT",
    joiningDate: "2026-05-28",
    tasks: {
      documentCollection: true,
      itAssetSetup: true,
      emailCreation: true,
      trainingAssignment: true,
      policyAcceptance: true,
    },
    status: "Completed",
  },
];

const UPCOMING_JOINERS = [
  { id: 1, name: "Rohit Menon", department: "Marketing", joiningDate: "2026-06-12", offersAccepted: true },
  { id: 2, name: "Sneha Pillai", department: "Operations", joiningDate: "2026-06-15", offersAccepted: true },
  { id: 3, name: "Arun Nair", department: "IT", joiningDate: "2026-06-20", offersAccepted: false },
];

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#2563eb" },
  { bg: "#dcfce7", color: "#16a34a" },
  { bg: "#fef9c3", color: "#ca8a04" },
  { bg: "#fee2e2", color: "#dc2626" },
  { bg: "#f3e8ff", color: "#9333ea" },
];

const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

const getProgress = (tasks) => {
  const values = Object.values(tasks);
  const done = values.filter(Boolean).length;
  return Math.round((done / values.length) * 100);
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const KPI_DATA = [
  {
    label: "New Joiners This Month",
    value: "3",
    icon: Users,
    accent: "#3b82f6",
    accentBg: "#dbeafe",
  },
  {
    label: "Pending Tasks",
    value: "12",
    icon: Clock,
    accent: "#f59e0b",
    accentBg: "#fef3c7",
  },
  {
    label: "Completed Tasks",
    value: "28",
    icon: CheckSquare,
    accent: "#10b981",
    accentBg: "#d1fae5",
  },
  {
    label: "Avg Completion Rate",
    value: "76%",
    icon: TrendingUp,
    accent: "#8b5cf6",
    accentBg: "#ede9fe",
  },
];

const Onboarding = ({ darkMode = false }) => {
  const theme = {
    pageBg: darkMode ? "#0f172a" : "#f1f5f9",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#0f172a",
    subText: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#334155" : "#e2e8f0",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
  };

  const card = {
    background: theme.cardBg,
    borderRadius: 14,
    border: `1px solid ${theme.border}`,
    boxShadow: darkMode
      ? "0 1px 3px rgba(0,0,0,0.4)"
      : "0 1px 3px rgba(0,0,0,0.06)",
    padding: "20px 24px",
  };

  return (
    <div
      style={{
        background: theme.pageBg,
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
        color: theme.text,
        boxSizing: "border-box",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              margin: 0,
              color: theme.text,
              letterSpacing: "-0.3px",
            }}
          >
            Onboarding
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: theme.subText }}>
            Manage and track new joiner onboarding progress
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
          }}
        >
          <UserPlus size={16} />
          Add New Joiner
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {KPI_DATA.map(({ label, value, icon: Icon, accent, accentBg }) => (
          <div key={label} style={{ ...card, padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: theme.subText,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 30,
                    fontWeight: 700,
                    color: theme.text,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {value}
                </p>
              </div>
              <div
                style={{
                  background: accentBg,
                  borderRadius: 10,
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color={accent} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Task List + Pre-joining Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Onboarding Tasks per Employee */}
        <div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 14,
              marginTop: 0,
              color: theme.text,
            }}
          >
            Employee Onboarding Progress
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MOCK_EMPLOYEES.map((emp, idx) => {
              const progress = getProgress(emp.tasks);
              const avatarColor = getAvatarColor(idx);
              const isCompleted = emp.status === "Completed";
              const completedCount = Object.values(emp.tasks).filter(Boolean).length;

              return (
                <div key={emp.id} style={{ ...card }}>
                  {/* Employee Info Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: avatarColor.bg,
                          color: avatarColor.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        {initials(emp.name)}
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: 15,
                            color: theme.text,
                          }}
                        >
                          {emp.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 12,
                            color: theme.subText,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              background: darkMode ? "#334155" : "#f1f5f9",
                              borderRadius: 6,
                              padding: "1px 8px",
                              fontSize: 11,
                              fontWeight: 500,
                              color: theme.subText,
                            }}
                          >
                            {emp.department}
                          </span>
                          <Calendar size={11} style={{ marginLeft: 2 }} />
                          {formatDate(emp.joiningDate)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      style={{
                        background: isCompleted ? "#d1fae5" : "#fef3c7",
                        color: isCompleted ? "#065f46" : "#92400e",
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: theme.subText,
                        marginBottom: 6,
                      }}
                    >
                      <span>
                        {completedCount} of {TASK_LABELS.length} tasks completed
                      </span>
                      <span style={{ fontWeight: 600, color: isCompleted ? "#10b981" : "#f59e0b" }}>
                        {progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: darkMode ? "#334155" : "#e2e8f0",
                        borderRadius: 99,
                        height: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          background: isCompleted
                            ? "linear-gradient(90deg,#10b981,#34d399)"
                            : "linear-gradient(90deg,#3b82f6,#60a5fa)",
                          borderRadius: 99,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Task Checklist */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {TASK_LABELS.map(({ key, label, icon: TaskIcon }) => {
                      const done = emp.tasks[key];
                      return (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            background: done
                              ? darkMode
                                ? "rgba(16,185,129,0.12)"
                                : "#f0fdf4"
                              : darkMode
                              ? "rgba(148,163,184,0.07)"
                              : "#fafafa",
                            border: `1px solid ${
                              done
                                ? darkMode
                                  ? "rgba(16,185,129,0.25)"
                                  : "#bbf7d0"
                                : theme.border
                            }`,
                            borderRadius: 8,
                            padding: "7px 10px",
                          }}
                        >
                          <TaskIcon
                            size={13}
                            color={done ? "#10b981" : theme.subText}
                            style={{ flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: done ? (darkMode ? "#6ee7b7" : "#065f46") : theme.subText,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {label}
                          </span>
                          {done && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 10,
                                color: "#10b981",
                                fontWeight: 700,
                              }}
                            >
                              Done
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-joining Panel */}
        <div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 14,
              marginTop: 0,
              color: theme.text,
            }}
          >
            Upcoming Joiners
          </h2>
          <div style={{ ...card, padding: "0" }}>
            {UPCOMING_JOINERS.map((joiner, idx) => {
              const avatarColor = getAvatarColor(idx + 2);
              const daysUntil = Math.ceil(
                (new Date(joiner.joiningDate) - new Date("2026-06-01")) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={joiner.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    borderBottom:
                      idx < UPCOMING_JOINERS.length - 1
                        ? `1px solid ${theme.border}`
                        : "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? "#263045" : "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: avatarColor.bg,
                      color: avatarColor.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {initials(joiner.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 14,
                        color: theme.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {joiner.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12,
                        color: theme.subText,
                      }}
                    >
                      {joiner.department}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginTop: 4,
                      }}
                    >
                      <Calendar size={11} color={theme.subText} />
                      <span style={{ fontSize: 11, color: theme.subText }}>
                        {formatDate(joiner.joiningDate)}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: daysUntil <= 7 ? "#f59e0b" : "#3b82f6",
                          background: daysUntil <= 7 ? "#fef3c7" : "#dbeafe",
                          borderRadius: 6,
                          padding: "1px 6px",
                          marginLeft: 2,
                        }}
                      >
                        {daysUntil}d away
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: joiner.offersAccepted ? "#d1fae5" : "#fee2e2",
                        color: joiner.offersAccepted ? "#065f46" : "#991b1b",
                        borderRadius: 6,
                        padding: "2px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {joiner.offersAccepted ? "Offer Accepted" : "Pending"}
                    </span>
                    <ChevronRight size={14} color={theme.subText} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary box */}
          <div
            style={{
              ...card,
              marginTop: 16,
              background: darkMode
                ? "linear-gradient(135deg,#1e3a5f,#1e293b)"
                : "linear-gradient(135deg,#eff6ff,#ffffff)",
              borderColor: darkMode ? "#1e4080" : "#bfdbfe",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 14,
                fontWeight: 700,
                color: darkMode ? "#93c5fd" : "#1d4ed8",
              }}
            >
              Onboarding Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Total Active Onboardings", value: "4" },
                { label: "Fully Completed", value: "1" },
                { label: "In Progress", value: "3" },
                { label: "Pre-joining Stage", value: "3" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: theme.subText }}>{label}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: darkMode ? "#93c5fd" : "#1d4ed8",
                      fontSize: 14,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
