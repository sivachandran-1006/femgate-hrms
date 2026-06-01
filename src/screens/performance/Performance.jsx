import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Target,
  Star,
  ClipboardList,
  CheckCircle,
  Clock,
  PlayCircle,
  TrendingUp,
  AlertTriangle,
  User,
  ChevronRight,
} from 'lucide-react';

// ── Theme token imports (NO hardcoded values) ─────────────────────────────
import { COLORS }                                          from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }            from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                  from "../../theme/spacing";
import { RADIUS, SHADOW, TRANSITION, ICON_SIZE }                       from "../../theme/sizes";
import { getAvatarColor, getStatusBadge }                 from "../../utils/helpers";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ratingDistribution = [
  { rating: '1 Star', count: 2 },
  { rating: '2 Stars', count: 5 },
  { rating: '3 Stars', count: 14 },
  { rating: '4 Stars', count: 28 },
  { rating: '5 Stars', count: 11 },
];

const departmentPerformance = [
  { department: 'Engineering', avgRating: 4.3, employees: 18 },
  { department: 'Design', avgRating: 4.1, employees: 7 },
  { department: 'Product', avgRating: 3.9, employees: 5 },
  { department: 'Marketing', avgRating: 4.0, employees: 8 },
  { department: 'HR', avgRating: 4.5, employees: 4 },
  { department: 'Finance', avgRating: 3.8, employees: 6 },
];

const goals = [
  {
    id: 1,
    employee: 'Mani',
    goal: 'Complete AWS Solutions Architect certification',
    targetDate: '2025-06-30',
    progress: 72,
    status: 'On Track',
  },
  {
    id: 2,
    employee: 'Siva',
    goal: 'Reduce API response time by 40%',
    targetDate: '2025-05-15',
    progress: 55,
    status: 'At Risk',
  },
  {
    id: 3,
    employee: 'Santhosh',
    goal: 'Launch v2 of the mobile application',
    targetDate: '2025-07-01',
    progress: 100,
    status: 'Completed',
  },
  {
    id: 4,
    employee: 'Safeer',
    goal: 'Onboard 3 enterprise clients',
    targetDate: '2025-06-01',
    progress: 66,
    status: 'On Track',
  },
  {
    id: 5,
    employee: 'Hari',
    goal: 'Implement automated test coverage to 85%',
    targetDate: '2025-05-31',
    progress: 40,
    status: 'At Risk',
  },
  {
    id: 6,
    employee: 'Suriya',
    goal: 'Design new design system components library',
    targetDate: '2025-08-15',
    progress: 85,
    status: 'On Track',
  },
  {
    id: 7,
    employee: 'Big Kundi',
    goal: 'Reduce employee churn by 15%',
    targetDate: '2025-09-30',
    progress: 100,
    status: 'Completed',
  },
  {
    id: 8,
    employee: 'Suganthan',
    goal: 'Migrate legacy services to microservices',
    targetDate: '2025-10-01',
    progress: 30,
    status: 'On Track',
  },
];

const appraisals = [
  {
    id: 1,
    employee: 'Mani',
    reviewer: 'Siva',
    period: 'Q1 2025',
    selfRating: 4,
    managerRating: 4,
    status: 'Reviewed',
  },
  {
    id: 2,
    employee: 'Santhosh',
    reviewer: 'Big Kundi',
    period: 'Q1 2025',
    selfRating: 5,
    managerRating: 4,
    status: 'Submitted',
  },
  {
    id: 3,
    employee: 'Safeer',
    reviewer: 'Suganthan',
    period: 'Q1 2025',
    selfRating: 3,
    managerRating: null,
    status: 'Draft',
  },
  {
    id: 4,
    employee: 'Hari',
    reviewer: 'Siva',
    period: 'Q1 2025',
    selfRating: 4,
    managerRating: 3,
    status: 'Reviewed',
  },
  {
    id: 5,
    employee: 'Suriya',
    reviewer: 'Small Kundi',
    period: 'Q1 2025',
    selfRating: 4,
    managerRating: 5,
    status: 'Reviewed',
  },
  {
    id: 6,
    employee: 'Sabari',
    reviewer: 'Big Kundi',
    period: 'Q1 2025',
    selfRating: null,
    managerRating: null,
    status: 'Draft',
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const badge = getStatusBadge(status);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: PADDING.badge,
        borderRadius: RADIUS.full,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
        fontFamily: FONT_FAMILY.base,
        backgroundColor: badge.bg,
        color: badge.color,
      }}
    >
      {status}
    </span>
  );
};

const ProgressBar = ({ value, darkMode, color }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const barColor = color || COLORS.purple;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: GAP.sm }}>
      <div
        style={{
          flex: 1,
          height: SPACING[2],
          borderRadius: RADIUS.sm,
          backgroundColor: surface.border,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            borderRadius: RADIUS.sm,
            backgroundColor: barColor,
            transition: TRANSITION.slow,
          }}
        />
      </div>
      <span
        style={{
          fontSize: FONT_SIZE.base,
          fontWeight: FONT_WEIGHT.semibold,
          fontFamily: FONT_FAMILY.base,
          color: surface.subtext,
          minWidth: SPACING[10] - SPACING[4],
        }}
      >
        {value}%
      </span>
    </div>
  );
};

const StarRating = ({ value, darkMode }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  if (value === null)
    return (
      <span
        style={{
          color: surface.border,
          fontSize: FONT_SIZE.base,
          fontFamily: FONT_FAMILY.base,
        }}
      >
        —
      </span>
    );
  return (
    <span style={{ display: 'flex', gap: GAP.xs / 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={ICON_SIZE.xs}
          fill={i <= value ? COLORS.warning : 'none'}
          color={i <= value ? COLORS.warning : surface.border}
        />
      ))}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Performance = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const kpiCards = [
    {
      label: 'Active Reviews',
      value: '24',
      icon: <PlayCircle size={ICON_SIZE.xl} color={COLORS.purple} />,
      accentBg: darkMode ? COLORS.surfaceDark : COLORS.purpleLight,
    },
    {
      label: 'Completed Reviews',
      value: '61',
      icon: <CheckCircle size={ICON_SIZE.xl} color={COLORS.success} />,
      accentBg: darkMode ? COLORS.surfaceDark : COLORS.successLight,
    },
    {
      label: 'Avg Rating',
      value: '4.1 / 5',
      icon: <Star size={ICON_SIZE.xl} color={COLORS.warning} />,
      accentBg: darkMode ? COLORS.surfaceDark : COLORS.warningLight,
    },
    {
      label: 'Pending Self-Appraisals',
      value: '9',
      icon: <Clock size={ICON_SIZE.xl} color={COLORS.danger} />,
      accentBg: darkMode ? COLORS.surfaceDark : COLORS.dangerMuted,
    },
  ];

  const tabs = ['overview', 'goals', 'appraisals'];
  const tabLabels = { overview: 'Overview', goals: 'Goals', appraisals: 'Appraisals' };

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY.base,
        color: surface.text,
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: SPACING[7],
          flexWrap: 'wrap',
          gap: GAP.md,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: FONT_SIZE["2xl"],
              fontWeight: FONT_WEIGHT.bold,
              fontFamily: FONT_FAMILY.base,
              color: surface.text,
            }}
          >
            Performance Management
          </h1>
          <p
            style={{
              margin: `${GAP.xs}px 0 0`,
              fontSize: FONT_SIZE.md,
              fontFamily: FONT_FAMILY.base,
              color: surface.subtext,
            }}
          >
            Track goals, appraisals, and employee performance ratings
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: GAP.sm,
            backgroundColor: COLORS.purple,
            color: COLORS.white,
            border: 'none',
            borderRadius: RADIUS.md,
            padding: PADDING.btn,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.semibold,
            fontFamily: FONT_FAMILY.base,
            cursor: 'pointer',
            boxShadow: `0 2px 8px rgba(124,58,237,0.35)`,
          }}
        >
          <PlayCircle size={ICON_SIZE.sm} />
          Start Review Cycle
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: GAP.lg,
          marginBottom: SPACING[7],
        }}
      >
        {kpiCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: surface.cardBg,
              border: `1px solid ${surface.border}`,
              borderRadius: RADIUS.xl,
              padding: SPACING[5],
              display: 'flex',
              alignItems: 'center',
              gap: GAP.lg,
              boxShadow: darkMode ? "none" : SHADOW.card,
            }}
          >
            <div
              style={{
                width: LAYOUT.iconBoxLg,
                height: LAYOUT.iconBoxLg,
                borderRadius: RADIUS.xl,
                backgroundColor: card.accentBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: FONT_SIZE["2xl"],
                  fontWeight: FONT_WEIGHT.bold,
                  fontFamily: FONT_FAMILY.base,
                  color: surface.text,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: FONT_SIZE.base,
                  fontFamily: FONT_FAMILY.base,
                  color: surface.subtext,
                  marginTop: GAP.xs / 2,
                }}
              >
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Switcher ── */}
      <div
        style={{
          display: 'flex',
          gap: GAP.xs,
          backgroundColor: surface.cardBg,
          border: `1px solid ${surface.border}`,
          borderRadius: RADIUS.lg,
          padding: GAP.xs,
          marginBottom: SPACING[6],
          width: 'fit-content',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: `${SPACING[2]}px ${SPACING[5]}px`,
              borderRadius: RADIUS.md - 1,
              border: 'none',
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.medium,
              fontFamily: FONT_FAMILY.base,
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? COLORS.purple : 'transparent',
              color: activeTab === tab ? COLORS.white : surface.subtext,
              transition: TRANSITION.base,
            }}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP.xl }}>
          {/* Rating Distribution Chart */}
          <div
            style={{
              backgroundColor: surface.cardBg,
              border: `1px solid ${surface.border}`,
              borderRadius: RADIUS.xl,
              padding: SPACING[6],
              boxShadow: darkMode ? "none" : SHADOW.card,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: GAP.sm, marginBottom: GAP.xl }}>
              <TrendingUp size={ICON_SIZE.md} color={COLORS.purple} />
              <h2
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.lg,
                  fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base,
                  color: surface.text,
                }}
              >
                Rating Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ratingDistribution} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
                <XAxis
                  dataKey="rating"
                  tick={{ fill: surface.subtext, fontSize: FONT_SIZE.sm }}
                  axisLine={{ stroke: surface.border }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: surface.subtext, fontSize: FONT_SIZE.sm }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: surface.cardBg,
                    border: `1px solid ${surface.border}`,
                    borderRadius: RADIUS.lg,
                    color: surface.text,
                    fontSize: FONT_SIZE.sm,
                  }}
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="count" name="Employees" fill={COLORS.purple} radius={[RADIUS.sm, RADIUS.sm, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance Table */}
          <div
            style={{
              backgroundColor: surface.cardBg,
              border: `1px solid ${surface.border}`,
              borderRadius: RADIUS.xl,
              padding: SPACING[6],
              boxShadow: darkMode ? "none" : SHADOW.card,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: GAP.sm, marginBottom: GAP.xl }}>
              <Target size={ICON_SIZE.md} color={COLORS.purple} />
              <h2
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.lg,
                  fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base,
                  color: surface.text,
                }}
              >
                Department Performance
              </h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Department', 'Employees', 'Avg Rating', 'Score'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: `${SPACING[2]}px ${SPACING[2] + GAP.xs / 2}px`,
                        fontSize: FONT_SIZE.sm,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        color: surface.subtext,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${surface.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departmentPerformance.map((dept, idx) => (
                  <tr key={dept.department}>
                    <td
                      style={{
                        padding: `${SPACING[2] + GAP.xs / 2}px ${SPACING[2] + GAP.xs / 2}px`,
                        fontSize: FONT_SIZE.md,
                        fontWeight: FONT_WEIGHT.medium,
                        fontFamily: FONT_FAMILY.base,
                        color: surface.text,
                        borderBottom:
                          idx < departmentPerformance.length - 1 ? `1px solid ${surface.border}` : 'none',
                      }}
                    >
                      {dept.department}
                    </td>
                    <td
                      style={{
                        padding: `${SPACING[2] + GAP.xs / 2}px ${SPACING[2] + GAP.xs / 2}px`,
                        fontSize: FONT_SIZE.base,
                        fontFamily: FONT_FAMILY.base,
                        color: surface.subtext,
                        borderBottom:
                          idx < departmentPerformance.length - 1 ? `1px solid ${surface.border}` : 'none',
                      }}
                    >
                      {dept.employees}
                    </td>
                    <td
                      style={{
                        padding: `${SPACING[2] + GAP.xs / 2}px ${SPACING[2] + GAP.xs / 2}px`,
                        fontSize: FONT_SIZE.md,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        color: surface.text,
                        borderBottom:
                          idx < departmentPerformance.length - 1 ? `1px solid ${surface.border}` : 'none',
                      }}
                    >
                      {dept.avgRating}
                    </td>
                    <td
                      style={{
                        padding: `${SPACING[2] + GAP.xs / 2}px ${SPACING[2] + GAP.xs / 2}px`,
                        width: 120,
                        borderBottom:
                          idx < departmentPerformance.length - 1 ? `1px solid ${surface.border}` : 'none',
                      }}
                    >
                      <ProgressBar
                        value={Math.round((dept.avgRating / 5) * 100)}
                        darkMode={darkMode}
                        color={
                          dept.avgRating >= 4.2
                            ? COLORS.success
                            : dept.avgRating >= 4.0
                            ? COLORS.purple
                            : COLORS.warning
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: GOALS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'goals' && (
        <div
          style={{
            backgroundColor: surface.cardBg,
            border: `1px solid ${surface.border}`,
            borderRadius: RADIUS.xl,
            overflow: 'hidden',
            boxShadow: darkMode ? "none" : SHADOW.card,
          }}
        >
          <div
            style={{
              padding: PADDING.card,
              borderBottom: `1px solid ${surface.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: GAP.sm }}>
              <Target size={ICON_SIZE.md} color={COLORS.purple} />
              <h2
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.lg,
                  fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base,
                  color: surface.text,
                }}
              >
                Employee Goals
              </h2>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: surface.theadBg }}>
                  {['Employee', 'Goal', 'Target Date', 'Progress', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: PADDING.tableHeader,
                        fontSize: FONT_SIZE.sm,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        color: surface.subtext,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${surface.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {goals.map((goal, idx) => {
                  const av = getAvatarColor(goal.employee);
                  return (
                    <tr
                      key={goal.id}
                      style={{
                        borderBottom: idx < goals.length - 1 ? `1px solid ${surface.border}` : 'none',
                        transition: TRANSITION.fast,
                      }}
                    >
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: GAP.md - GAP.xs }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.full,
                              backgroundColor: av.bg,
                              color: av.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: FONT_SIZE.base,
                              fontWeight: FONT_WEIGHT.bold,
                              fontFamily: FONT_FAMILY.base,
                              flexShrink: 0,
                            }}
                          >
                            {goal.employee.charAt(0).toUpperCase()}
                          </div>
                          <span
                            style={{
                              fontSize: FONT_SIZE.md,
                              fontWeight: FONT_WEIGHT.medium,
                              fontFamily: FONT_FAMILY.base,
                              color: surface.text,
                            }}
                          >
                            {goal.employee}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: PADDING.tableCell, maxWidth: 280 }}>
                        <span
                          style={{
                            fontSize: FONT_SIZE.md,
                            fontFamily: FONT_FAMILY.base,
                            color: surface.text,
                          }}
                        >
                          {goal.goal}
                        </span>
                      </td>
                      <td style={{ padding: PADDING.tableCell, whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: FONT_SIZE.base,
                            fontFamily: FONT_FAMILY.base,
                            color: surface.subtext,
                          }}
                        >
                          {goal.targetDate}
                        </span>
                      </td>
                      <td style={{ padding: PADDING.tableCell, minWidth: 160 }}>
                        <ProgressBar
                          value={goal.progress}
                          darkMode={darkMode}
                          color={
                            goal.status === 'Completed'
                              ? COLORS.success
                              : goal.status === 'At Risk'
                              ? COLORS.warning
                              : COLORS.purple
                          }
                        />
                      </td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <StatusBadge status={goal.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: APPRAISALS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'appraisals' && (
        <div
          style={{
            backgroundColor: surface.cardBg,
            border: `1px solid ${surface.border}`,
            borderRadius: RADIUS.xl,
            overflow: 'hidden',
            boxShadow: darkMode ? "none" : SHADOW.card,
          }}
        >
          <div
            style={{
              padding: PADDING.card,
              borderBottom: `1px solid ${surface.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: GAP.sm }}>
              <ClipboardList size={ICON_SIZE.md} color={COLORS.purple} />
              <h2
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.lg,
                  fontWeight: FONT_WEIGHT.semibold,
                  fontFamily: FONT_FAMILY.base,
                  color: surface.text,
                }}
              >
                Appraisals
              </h2>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: surface.theadBg }}>
                  {['Employee', 'Reviewer', 'Period', 'Self Rating', 'Manager Rating', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: PADDING.tableHeader,
                        fontSize: FONT_SIZE.sm,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontFamily: FONT_FAMILY.base,
                        color: surface.subtext,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${surface.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appraisals.map((appraisal, idx) => {
                  const av = getAvatarColor(appraisal.employee);
                  return (
                    <tr
                      key={appraisal.id}
                      style={{
                        borderBottom: idx < appraisals.length - 1 ? `1px solid ${surface.border}` : 'none',
                      }}
                    >
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: GAP.md - GAP.xs }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.full,
                              backgroundColor: av.bg,
                              color: av.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: FONT_SIZE.base,
                              fontWeight: FONT_WEIGHT.bold,
                              fontFamily: FONT_FAMILY.base,
                              flexShrink: 0,
                            }}
                          >
                            {appraisal.employee.charAt(0).toUpperCase()}
                          </div>
                          <span
                            style={{
                              fontSize: FONT_SIZE.md,
                              fontWeight: FONT_WEIGHT.medium,
                              fontFamily: FONT_FAMILY.base,
                              color: surface.text,
                            }}
                          >
                            {appraisal.employee}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: GAP.xs - GAP.xs / 4 }}>
                          <User size={ICON_SIZE.xs} color={surface.subtext} />
                          <span
                            style={{
                              fontSize: FONT_SIZE.md,
                              fontFamily: FONT_FAMILY.base,
                              color: surface.subtext,
                            }}
                          >
                            {appraisal.reviewer}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: PADDING.tableCell, whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: FONT_SIZE.base,
                            fontFamily: FONT_FAMILY.base,
                            color: surface.subtext,
                            backgroundColor: surface.inputBg,
                            padding: PADDING.badge,
                            borderRadius: RADIUS.sm,
                            border: `1px solid ${surface.border}`,
                          }}
                        >
                          {appraisal.period}
                        </span>
                      </td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <StarRating value={appraisal.selfRating} darkMode={darkMode} />
                      </td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <StarRating value={appraisal.managerRating} darkMode={darkMode} />
                      </td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <StatusBadge status={appraisal.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
