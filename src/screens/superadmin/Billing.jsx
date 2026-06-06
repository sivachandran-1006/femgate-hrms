import { useState } from "react";
import { Download, CreditCard, Check, Plus, TrendingUp } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme/sizes";

const INVOICES = [
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: "₹45,000", status: "Paid" },
  { id: "INV-2026-005", date: "May 1, 2026", amount: "₹45,000", status: "Paid" },
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "₹42,000", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "₹42,000", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "₹38,000", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "₹38,000", status: "Paid" },
];

const PLAN_FEATURES = [
  "Unlimited modules access",
  "Priority support (< 2h response)",
  "Custom branding & white-label",
  "Full API access",
  "Single Sign-On (SSO)",
  "Comprehensive audit logs",
  "Multi-company management",
  "Dedicated account manager",
];

const PAYMENT_METHODS = [
  { id: 1, type: "Visa", last4: "4242", expiry: "12/27", primary: true },
  { id: 2, type: "Mastercard", last4: "8888", expiry: "08/26", primary: false },
];

const TABS = ["Overview", "Invoices", "Usage", "Payment Methods"];

const STATUS_COLORS = {
  Paid: { bg: "#dcfce7", text: "#16a34a" },
  Pending: { bg: "#fef3c7", text: "#d97706" },
  Failed: { bg: "#fee2e2", text: "#dc2626" },
};

export default function Billing({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [activeTab, setActiveTab] = useState("Overview");
  const [toast, setToast] = useState(null);
  const [cards, setCards] = useState(PAYMENT_METHODS);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetPrimary = (id) => {
    setCards(cards.map((c) => ({ ...c, primary: c.id === id })));
    showToast("Primary payment method updated");
  };

  const handleDownloadInvoice = (id) => showToast(`Downloading ${id}...`);

  const inputStyle = {
    border: `1px solid ${surface.border}`,
    borderRadius: RADIUS.lg,
    padding: "8px 12px",
    fontSize: FONT_SIZE.sm,
    background: surface.inputBg,
    color: surface.text,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
  };

  const UsageBar = ({ label, used, total, unit, color }) => {
    const pct = Math.round((used / total) * 100);
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{label}</span>
          <span style={{ fontSize: FONT_SIZE.sm, color: surface.subtext }}>{used}{unit} / {total}{unit} <span style={{ color: pct > 80 ? COLORS.danger : COLORS.success, fontWeight: FONT_WEIGHT.semibold }}>({pct}%)</span></span>
        </div>
        <div style={{ height: 8, background: surface.inputBg, borderRadius: RADIUS.full, border: `1px solid ${surface.border}`, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? COLORS.danger : color, borderRadius: RADIUS.full, transition: "width 0.3s ease" }} />
        </div>
      </div>
    );
  };

  const stats = [
    { label: "Monthly Cost", value: "₹45,000", sub: "Enterprise plan" },
    { label: "Users", value: "12/50", sub: "seats used" },
    { label: "Storage Used", value: "61%", sub: "30.5 GB of 50 GB" },
    { label: "Next Invoice", value: "Aug 1", sub: "auto-renews" },
  ];

  return (
    <div style={{ padding: 24, fontFamily: FONT_FAMILY.base, background: surface.pageBg, minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.type === "error" ? COLORS.danger : COLORS.success, color: COLORS.white, padding: "10px 20px", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, boxShadow: SHADOW.md }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Billing &amp; Subscription</h1>
          <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>Manage your plan, invoices and payment methods</p>
        </div>
        <button onClick={() => showToast("Opening upgrade plan page...")} style={{ background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, padding: "8px 16px", fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={16} /> Upgrade Plan
        </button>
      </div>

      <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", borderRadius: RADIUS["2xl"], padding: "24px 28px", marginBottom: 24, color: COLORS.white, boxShadow: SHADOW.md }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold }}>Enterprise Plan</span>
              <span style={{ background: "#22c55e", color: COLORS.white, fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 10px", borderRadius: RADIUS.full }}>Active</span>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: FONT_SIZE.sm, opacity: 0.85 }}>50 user seats included</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, opacity: 0.7 }}>Renews August 1, 2026 — auto-renewal enabled</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 2px", fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold }}>₹45,000</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE.sm, opacity: 0.8 }}>per month</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], padding: "16px 20px", boxShadow: SHADOW.xs }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium, marginBottom: 4 }}>{s.label.toUpperCase()}</p>
            <p style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS["2xl"], boxShadow: SHADOW.xs, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${surface.border}` }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 20px", fontSize: FONT_SIZE.sm, fontWeight: activeTab === tab ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal, color: activeTab === tab ? COLORS.primary : surface.subtext, background: "transparent", border: "none", borderBottom: activeTab === tab ? `2px solid ${COLORS.primary}` : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {activeTab === "Overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <p style={{ margin: "0 0 14px", fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>Plan Features</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PLAN_FEATURES.map((feat) => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: RADIUS.full, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={12} color="#16a34a" />
                      </div>
                      <span style={{ fontSize: FONT_SIZE.sm, color: surface.text }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ margin: "0 0 14px", fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>Plan Actions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => showToast("Upgrade options coming soon")} style={{ padding: "10px 16px", background: COLORS.primary, color: COLORS.white, border: "none", borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, cursor: "pointer", textAlign: "left" }}>
                    Upgrade to Custom Enterprise
                  </button>
                  <button onClick={() => showToast("Downgrade confirmation required")} style={{ padding: "10px 16px", background: "transparent", color: surface.subtext, border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, cursor: "pointer", textAlign: "left" }}>
                    Downgrade Plan
                  </button>
                  <button onClick={() => showToast("Cancellation request initiated")} style={{ padding: "10px 16px", background: "transparent", color: COLORS.danger, border: `1px solid #fecaca`, borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, cursor: "pointer", textAlign: "left" }}>
                    Cancel Subscription
                  </button>
                </div>
                <div style={{ marginTop: 20, padding: 14, background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
                  <p style={{ margin: "0 0 4px", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext }}>BILLING CONTACT</p>
                  <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: surface.text }}>superadmin@mgatesystems.com</p>
                  <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Billing notifications sent here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Invoices" && (
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: surface.theadBg }}>
                    {["Date", "Invoice #", "Amount", "Status", ""].map((col, ci) => (
                      <th key={ci} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: surface.subtext, borderBottom: `1px solid ${surface.border}` }}>{col.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv, i) => (
                    <tr key={inv.id} style={{ background: i % 2 === 0 ? "transparent" : (darkMode ? "#1e293b20" : "#f8fafc") }}>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{inv.date}</td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.text, fontWeight: FONT_WEIGHT.medium }}>{inv.id}</td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}`, fontSize: FONT_SIZE.sm, color: surface.text, fontWeight: FONT_WEIGHT.semibold }}>{inv.amount}</td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                        <span style={{ display: "inline-block", fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "2px 9px", borderRadius: RADIUS.full, background: STATUS_COLORS[inv.status]?.bg, color: STATUS_COLORS[inv.status]?.text }}>{inv.status}</span>
                      </td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${surface.border}` }}>
                        <button onClick={() => handleDownloadInvoice(inv.id)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "5px 10px", cursor: "pointer", color: surface.subtext, fontSize: FONT_SIZE.xs, display: "flex", alignItems: "center", gap: 5 }}>
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Usage" && (
            <div style={{ maxWidth: 580 }}>
              <p style={{ margin: "0 0 20px", fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>Current Usage</p>
              <UsageBar label="User Seats" used={12} total={50} unit="" color={COLORS.primary} />
              <UsageBar label="Storage" used={30.5} total={50} unit=" GB" color="#7c3aed" />
              <UsageBar label="API Calls Today" used={2847} total={10000} unit="" color="#0284c7" />
              <UsageBar label="Active Integrations" used={4} total={20} unit="" color={COLORS.success} />
              <div style={{ marginTop: 12, padding: "12px 16px", background: surface.inputBg, borderRadius: RADIUS.lg, border: `1px solid ${surface.border}` }}>
                <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext }}>Usage data refreshes every 15 minutes. API calls reset daily at midnight UTC.</p>
              </div>
            </div>
          )}

          {activeTab === "Payment Methods" && (
            <div style={{ maxWidth: 500 }}>
              <p style={{ margin: "0 0 16px", fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: surface.text }}>Saved Cards</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {cards.map((card) => (
                  <div key={card.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: surface.inputBg, border: `1px solid ${card.primary ? COLORS.primary : surface.border}`, borderRadius: RADIUS.lg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CreditCard size={20} color={card.primary ? COLORS.primary : surface.subtext} />
                      <div>
                        <p style={{ margin: 0, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: surface.text }}>{card.type} ending in {card.last4}</p>
                        <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Expires {card.expiry}</p>
                      </div>
                      {card.primary && (
                        <span style={{ fontSize: 11, fontWeight: FONT_WEIGHT.semibold, padding: "1px 8px", borderRadius: RADIUS.full, background: COLORS.primaryMuted, color: COLORS.primary, marginLeft: 4 }}>Primary</span>
                      )}
                    </div>
                    {!card.primary && (
                      <button onClick={() => handleSetPrimary(card.id)} style={{ background: "transparent", border: `1px solid ${surface.border}`, borderRadius: RADIUS.md, padding: "5px 10px", fontSize: FONT_SIZE.xs, cursor: "pointer", color: surface.subtext }}>
                        Set Primary
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => showToast("Add card flow coming soon")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "transparent", border: `1px dashed ${surface.border}`, borderRadius: RADIUS.lg, fontSize: FONT_SIZE.sm, color: surface.subtext, cursor: "pointer", width: "100%", justifyContent: "center" }}>
                <Plus size={16} /> Add Payment Method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
