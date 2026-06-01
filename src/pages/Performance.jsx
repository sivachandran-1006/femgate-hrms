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

const StatusBadge = ({ status, darkMode }) => {
  const colorMap = {
    'On Track': { bg: '#dcfce7', text: '#15803d' },
    'At Risk': { bg: '#fef9c3', text: '#a16207' },
    Completed: { bg: '#dbeafe', text: '#1d4ed8' },
    Draft: { bg: darkMode ? '#1e293b' : '#f1f5f9', text: darkMode ? '#94a3b8' : '#64748b', border: darkMode ? '#334155' : '#e2e8f0' },
    Submitted: { bg: '#fef3c7', text: '#92400e' },
    Reviewed: { bg: '#d1fae5', text: '#065f46' },
  };

  const colors = colorMap[status] || colorMap['Draft'];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.text,
        border: colors.border ? `1px solid ${colors.border}` : 'none',
      }}
    >
      {status}
    </span>
  );
};

const ProgressBar = ({ value, darkMode, color = '#6366f1' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div
      style={{
        flex: 1,
        height: '8px',
        borderRadius: '4px',
        backgroundColor: darkMode ? '#334155' : '#e2e8f0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          borderRadius: '4px',
          backgroundColor: color,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
    <span style={{ fontSize: '13px', fontWeight: 600, color: darkMode ? '#94a3b8' : '#64748b', minWidth: '36px' }}>
      {value}%
    </span>
  </div>
);

const StarRating = ({ value, darkMode }) => {
  if (value === null) return <span style={{ color: darkMode ? '#475569' : '#cbd5e1', fontSize: '13px' }}>—</span>;
  return (
    <span style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i <= value ? '#f59e0b' : 'none'}
          color={i <= value ? '#f59e0b' : darkMode ? '#475569' : '#cbd5e1'}
        />
      ))}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Performance = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Theme tokens
  const theme = {
    pageBg: darkMode ? '#0f172a' : '#f1f5f9',
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    chartText: darkMode ? '#94a3b8' : '#64748b',
    tableRowHover: darkMode ? '#273449' : '#f8fafc',
  };

  const kpiCards = [
    {
      label: 'Active Reviews',
      value: '24',
      icon: <PlayCircle size={22} color="#6366f1" />,
      accent: '#6366f1',
      accentBg: darkMode ? '#312e81' : '#ede9fe',
    },
    {
      label: 'Completed Reviews',
      value: '61',
      icon: <CheckCircle size={22} color="#10b981" />,
      accent: '#10b981',
      accentBg: darkMode ? '#064e3b' : '#d1fae5',
    },
    {
      label: 'Avg Rating',
      value: '4.1 / 5',
      icon: <Star size={22} color="#f59e0b" />,
      accent: '#f59e0b',
      accentBg: darkMode ? '#78350f' : '#fef3c7',
    },
    {
      label: 'Pending Self-Appraisals',
      value: '9',
      icon: <Clock size={22} color="#ef4444" />,
      accent: '#ef4444',
      accentBg: darkMode ? '#7f1d1d' : '#fee2e2',
    },
  ];

  const tabs = ['overview', 'goals', 'appraisals'];
  const tabLabels = { overview: 'Overview', goals: 'Goals', appraisals: 'Appraisals' };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.pageBg,
        padding: '24px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: theme.text,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: theme.text }}>
            Performance Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: theme.subtext }}>
            Track goals, appraisals, and employee performance ratings
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          }}
        >
          <PlayCircle size={16} />
          Start Review Cycle
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {kpiCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
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
              <div style={{ fontSize: '22px', fontWeight: 700, color: theme.text }}>{card.value}</div>
              <div style={{ fontSize: '13px', color: theme.subtext, marginTop: '2px' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Switcher ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '24px',
          width: 'fit-content',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#6366f1' : 'transparent',
              color: activeTab === tab ? '#ffffff' : theme.subtext,
              transition: 'all 0.15s ease',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Rating Distribution Chart */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={18} color="#6366f1" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>
                Rating Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ratingDistribution} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis
                  dataKey="rating"
                  tick={{ fill: theme.chartText, fontSize: 12 }}
                  axisLine={{ stroke: theme.border }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme.chartText, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                    fontSize: '13px',
                  }}
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="count" name="Employees" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance Table */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Target size={18} color="#6366f1" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>
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
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: theme.subtext,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${theme.border}`,
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
                        padding: '10px 10px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: theme.text,
                        borderBottom: idx < departmentPerformance.length - 1 ? `1px solid ${theme.border}` : 'none',
                      }}
                    >
                      {dept.department}
                    </td>
                    <td
                      style={{
                        padding: '10px 10px',
                        fontSize: '13px',
                        color: theme.subtext,
                        borderBottom: idx < departmentPerformance.length - 1 ? `1px solid ${theme.border}` : 'none',
                      }}
                    >
                      {dept.employees}
                    </td>
                    <td
                      style={{
                        padding: '10px 10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: theme.text,
                        borderBottom: idx < departmentPerformance.length - 1 ? `1px solid ${theme.border}` : 'none',
                      }}
                    >
                      {dept.avgRating}
                    </td>
                    <td
                      style={{
                        padding: '10px 10px',
                        width: '120px',
                        borderBottom: idx < departmentPerformance.length - 1 ? `1px solid ${theme.border}` : 'none',
                      }}
                    >
                      <ProgressBar
                        value={Math.round((dept.avgRating / 5) * 100)}
                        darkMode={darkMode}
                        color={dept.avgRating >= 4.2 ? '#10b981' : dept.avgRating >= 4.0 ? '#6366f1' : '#f59e0b'}
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
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#6366f1" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>
                Employee Goals
              </h2>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? '#162032' : '#f8fafc' }}>
                  {['Employee', 'Goal', 'Target Date', 'Progress', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '12px 20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: theme.subtext,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${theme.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {goals.map((goal, idx) => (
                  <tr
                    key={goal.id}
                    style={{
                      borderBottom: idx < goals.length - 1 ? `1px solid ${theme.border}` : 'none',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#6366f1',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {goal.employee.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text }}>
                          {goal.employee}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', maxWidth: '280px' }}>
                      <span style={{ fontSize: '14px', color: theme.text }}>{goal.goal}</span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', color: theme.subtext }}>{goal.targetDate}</span>
                    </td>
                    <td style={{ padding: '14px 20px', minWidth: '160px' }}>
                      <ProgressBar
                        value={goal.progress}
                        darkMode={darkMode}
                        color={goal.status === 'Completed' ? '#10b981' : goal.status === 'At Risk' ? '#f59e0b' : '#6366f1'}
                      />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={goal.status} darkMode={darkMode} />
                    </td>
                  </tr>
                ))}
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
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} color="#6366f1" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>
                Appraisals
              </h2>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? '#162032' : '#f8fafc' }}>
                  {['Employee', 'Reviewer', 'Period', 'Self Rating', 'Manager Rating', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '12px 20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: theme.subtext,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${theme.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appraisals.map((appraisal, idx) => (
                  <tr
                    key={appraisal.id}
                    style={{
                      borderBottom: idx < appraisals.length - 1 ? `1px solid ${theme.border}` : 'none',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {appraisal.employee.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text }}>
                          {appraisal.employee}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color={theme.subtext} />
                        <span style={{ fontSize: '14px', color: theme.subtext }}>{appraisal.reviewer}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          color: theme.subtext,
                          backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {appraisal.period}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StarRating value={appraisal.selfRating} darkMode={darkMode} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StarRating value={appraisal.managerRating} darkMode={darkMode} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={appraisal.status} darkMode={darkMode} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
