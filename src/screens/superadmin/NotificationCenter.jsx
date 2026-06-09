import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Search, Filter, AlertCircle, Info, CreditCard, Users, Calendar, Package, FileText, Shield } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const CATEGORIES = ["All", "HR", "Payroll", "Security", "System", "Assets", "Leave"];

const CATEGORY_STYLE = {
  HR:       { bg: COLORS.purpleMuted,  text: COLORS.purple,  icon: Users      },
  Payroll:  { bg: COLORS.successLight, text: COLORS.success, icon: CreditCard  },
  Security: { bg: COLORS.dangerMuted,  text: COLORS.danger,  icon: Shield     },
  System:   { bg: COLORS.primaryMuted, text: COLORS.primary, icon: Info        },
  Assets:   { bg: COLORS.warningLight, text: COLORS.warning, icon: Package    },
  Leave:    { bg: "#e0f2fe",           text: "#0284c7",      icon: Calendar   },
  Document: { bg: COLORS.gray100,      text: COLORS.gray600, icon: FileText   },
};

const INIT_NOTIFICATIONS = [
  { id: 1,  category: "Security", title: "Failed login attempt detected",         body: "3 consecutive failed login attempts from IP 203.0.113.12 for superadmin account.",              time: "2 min ago",  read: false, severity: "critical" },
  { id: 2,  category: "Payroll",  title: "May 2026 payroll processed",             body: "Payroll for 12 employees has been processed. Total disbursement: ₹4,85,000.",                 time: "1 hour ago", read: false, severity: "info"     },
  { id: 3,  category: "HR",       title: "New employee onboarding: Arjun Kumar",   body: "Arjun Kumar (EMP-013) has completed onboarding and is now active in the system.",              time: "3 hours ago", read: false, severity: "info"    },
  { id: 4,  category: "Leave",    title: "Leave request pending approval",          body: "Priya Sharma has requested 3 days of Annual Leave (Jun 15–17). Awaiting manager approval.",    time: "4 hours ago", read: false, severity: "info"   },
  { id: 5,  category: "System",   title: "System backup completed",                 body: "Automated backup (BKP-20260609) completed successfully. Size: 2.3 GB.",                        time: "6 hours ago", read: true,  severity: "info"    },
  { id: 6,  category: "Assets",   title: "Asset assigned: MacBook Pro",             body: "Asset AST-045 (MacBook Pro 14\") assigned to Kavitha R by IT Admin.",                          time: "Yesterday",  read: true,  severity: "info"     },
  { id: 7,  category: "Security", title: "MFA enabled globally",                   body: "Super Admin has enforced Multi-Factor Authentication for all admin accounts.",                  time: "Yesterday",  read: true,  severity: "warning"  },
  { id: 8,  category: "HR",       title: "Performance review cycle started",        body: "Q2 2026 performance review cycle has been initiated for all employees.",                        time: "2 days ago", read: true,  severity: "info"     },
  { id: 9,  category: "Payroll",  title: "Tax report ready for download",           body: "FY 2025-26 tax summary report is available for download in the Payroll module.",               time: "2 days ago", read: true,  severity: "info"     },
  { id: 10, category: "System",   title: "API rate limit warning",                  body: "Endpoint /api/employees exceeded 80% of rate limit (800/1000 req/hour).",                      time: "3 days ago", read: true,  severity: "warning"  },
  { id: 11, category: "Leave",    title: "Leave balance updated",                   body: "Annual leave balance refreshed for all employees. Policy: 18 days per year.",                   time: "4 days ago", read: true,  severity: "info"    },
  { id: 12, category: "Assets",   title: "Asset maintenance due",                   body: "2 assets (AST-012, AST-031) are due for scheduled maintenance this week.",                      time: "5 days ago", read: true,  severity: "warning"  },
];

const SEVERITY_DOT = { critical: COLORS.danger, warning: COLORS.warning, info: COLORS.primary };

export default function NotificationCenter({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [notifications, setNotifications] = useState(INIT_NOTIFICATIONS);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showUnread, setShowUnread] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = notifications.filter(n => {
    const catMatch = category === "All" || n.category === category;
    const readMatch = !showUnread || !n.read;
    const q = search.toLowerCase();
    const searchMatch = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    return catMatch && readMatch && searchMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifications(p => p.map(n => ({ ...n, read: true }))); showToast("All notifications marked as read"); };
  const deleteNotif = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const clearAll = () => { setNotifications(p => p.filter(n => !n.read)); showToast("Read notifications cleared"); };

  const inputStyle = {
    border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 12px",
    fontSize: FONT_SIZE.sm, background: surface.inputBg, color: surface.text,
    fontFamily: FONT_FAMILY.base, outline: "none",
  };

  const stats = [
    { label: "Total",    value: notifications.length,    sub: "all notifications",  color: COLORS.primary  },
    { label: "Unread",   value: unreadCount,             sub: "need attention",     color: COLORS.danger   },
    { label: "Critical", value: notifications.filter(n => n.severity === "critical").length, sub: "high priority", color: COLORS.danger },
    { label: "Today",    value: notifications.filter(n => ["2 min ago","1 hour ago","3 hours ago","4 hours ago","6 hours ago"].includes(n.time)).length, sub: "received today", color: COLORS.success },
  ];

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md, display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={14} strokeWidth={3} /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: RADIUS.xl, background: COLORS.warningLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color={COLORS.warning} strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Notification Center</h1>
            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext }}>
              {unreadCount > 0 ? <><strong style={{ color: COLORS.danger }}>{unreadCount} unread</strong> notifications</> : "All caught up!"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={clearAll} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, padding: "8px 14px", fontSize: FONT_SIZE.sm, cursor: "pointer", color: surface.subtext, fontFamily: FONT_FAMILY.base, display: "flex", alignItems: "center", gap: 6 }}>
            <Trash2 size={14} /> Clear Read
          </button>
          <button onClick={markAllRead} disabled={unreadCount === 0} style={{ background: unreadCount === 0 ? COLORS.gray200 : COLORS.primary, color: unreadCount === 0 ? COLORS.gray500 : COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 16px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: unreadCount === 0 ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY.base, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: "16px 20px", boxShadow: SHADOW.xs }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{s.label.toUpperCase()}</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: s.color }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], boxShadow: SHADOW.xs, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${surface.border}`, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: surface.subtext }} />
            <input style={{ ...inputStyle, paddingLeft: 32, width: "100%", boxSizing: "border-box" }} placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: "6px 14px", borderRadius: RADIUS.full, border: `1px solid ${category === c ? COLORS.primary : surface.border}`, background: category === c ? COLORS.primaryMuted : "transparent", color: category === c ? COLORS.primary : surface.subtext, fontSize: FONT_SIZE.xs, fontWeight: category === c ? FONT_WEIGHT.semibold : FONT_WEIGHT.medium, cursor: "pointer", fontFamily: FONT_FAMILY.base }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowUnread(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: RADIUS.lg, border: `1px solid ${showUnread ? COLORS.primary : surface.border}`, background: showUnread ? COLORS.primaryMuted : "transparent", color: showUnread ? COLORS.primary : surface.subtext, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, cursor: "pointer", fontFamily: FONT_FAMILY.base, flexShrink: 0 }}>
            <Filter size={12} /> Unread only
          </button>
        </div>

        {/* Notification list */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <Bell size={32} color={surface.subtext} strokeWidth={1.2} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.subtext }}>No notifications found</p>
            </div>
          ) : (
            filtered.map((n, i) => {
              const cat = CATEGORY_STYLE[n.category] || CATEGORY_STYLE.Document;
              const CatIcon = cat.icon;
              return (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${surface.border}` : "none", background: n.read ? "transparent" : (darkMode ? COLORS.primaryMuted + "08" : "#eff6ff50"), cursor: "pointer", transition: "background 0.1s" }}>

                  {/* Unread dot */}
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : SEVERITY_DOT[n.severity], flexShrink: 0, marginTop: 6 }} />

                  {/* Category icon */}
                  <div style={{ width: 36, height: 36, borderRadius: RADIUS.xl, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CatIcon size={16} color={cat.text} strokeWidth={1.8} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                      <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: n.read ? FONT_WEIGHT.medium : FONT_WEIGHT.bold, color: surface.text }}>{n.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: surface.subtext, whiteSpace: "nowrap" }}>{n.time}</span>
                        <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: surface.subtext, display: "flex", alignItems: "center", padding: 2, borderRadius: RADIUS.sm, opacity: 0.6 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: FONT_SIZE.xs, color: surface.subtext, lineHeight: 1.5 }}>{n.body}</p>
                    <span style={{ fontSize: 10, fontWeight: FONT_WEIGHT.semibold, padding: "1px 7px", borderRadius: RADIUS.full, background: cat.bg, color: cat.text }}>{n.category}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
