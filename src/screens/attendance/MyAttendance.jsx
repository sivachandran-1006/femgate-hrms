import { useState, useEffect } from "react";
import {
  IconClock, IconCheck, IconX, IconCalendar,
  IconCircleCheck, IconAlertTriangle, IconCalendarOff,
} from "@tabler/icons-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth }              from "../../hooks/useAuth";
import { useToast }             from "../../components/ui/Toast";
import { COLORS }               from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { SPACING, GAP, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOW }       from "../../theme/sizes";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

const fmt12 = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const calcHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  try {
    const s = new Date(`1970-01-01 ${checkIn}`);
    const e = new Date(`1970-01-01 ${checkOut}`);
    const diff = e - s;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  } catch { return null; }
};

// ── Mock history for John Employee ───────────────────────────────────────────

const buildHistory = () => {
  const rows = [];
  // Last 20 working days
  const statuses = ["Present","Present","Present","Present","Late","Present","Present","Absent","Present","Present",
                    "Present","Late","Present","Present","Present","Leave","Present","Present","Present","Present"];
  let idx = 0;
  for (let i = 19; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // skip weekends
    const iso = d.toISOString().split("T")[0];
    const st  = statuses[idx % statuses.length];
    idx++;
    let checkIn = "", checkOut = "";
    if (st === "Present") { checkIn = "09:05 AM"; checkOut = "06:10 PM"; }
    if (st === "Late")    { checkIn = "10:25 AM"; checkOut = "07:15 PM"; }
    rows.push({ _id: `my${i}`, date: iso, checkIn, checkOut, status: st });
  }
  return rows;
};

const STATUS_STYLE = {
  Present: { bg: COLORS.successLight, color: COLORS.success, dot: COLORS.success },
  Late:    { bg: COLORS.warningLight, color: COLORS.warning, dot: COLORS.warning },
  Absent:  { bg: COLORS.dangerMuted,  color: COLORS.danger,  dot: COLORS.danger  },
  Leave:   { bg: COLORS.primaryMuted, color: COLORS.primary, dot: COLORS.primary },
};

// ── Main Component ─────────────────────────────────────────────────────────────

const MyAttendance = ({ darkMode: dark = false }) => {
  const { user }  = useAuth();
  const { show }  = useToast();
  const surface   = dark ? COLORS.dark : COLORS.light;

  // Today's check-in state
  const [checkedIn,  setCheckedIn]  = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime,  setCheckInTime]  = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [currentTime,  setCurrentTime]  = useState(fmt12());
  const [history, setHistory] = useState(buildHistory);

  // Confirm modal state
  const [confirmType, setConfirmType] = useState(null); // "checkin" | "checkout"

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(fmt12()), 1000);
    return () => clearInterval(t);
  }, []);

  const isLate = () => new Date().getHours() >= 10;

  const handleCheckIn = () => {
    const time   = fmt12();
    const late   = isLate();
    setCheckInTime(time);
    setCheckedIn(true);
    setConfirmType(null);
    setHistory((prev) => [
      { _id: "today", date: TODAY, checkIn: time, checkOut: "", status: late ? "Late" : "Present" },
      ...prev.filter((r) => r.date !== TODAY),
    ]);
    show(
      late
        ? `Checked in at ${time} — marked as Late`
        : `Checked in successfully at ${time}`,
      late ? "warning" : "success"
    );
  };

  const handleCheckOut = () => {
    const time = fmt12();
    setCheckOutTime(time);
    setCheckedOut(true);
    setConfirmType(null);
    setHistory((prev) =>
      prev.map((r) => r.date === TODAY ? { ...r, checkOut: time } : r)
    );
    const hrs = calcHours(checkInTime, time);
    show(`Checked out at ${time}${hrs ? ` · ${hrs} worked` : ""}`, "success");
  };

  // Stats
  const totalDays   = history.length;
  const presentDays = history.filter((r) => r.status === "Present").length;
  const lateDays    = history.filter((r) => r.status === "Late").length;
  const absentDays  = history.filter((r) => r.status === "Absent").length;
  const attendPct   = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

  // Chart — last 10 days hours worked
  const chartData = history.slice(0, 10).reverse().map((r) => {
    const hrs = calcHours(r.checkIn, r.checkOut);
    const val = hrs ? parseFloat(hrs.replace("h", ".").replace("m","")) : 0;
    return {
      date:  new Date(r.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
      hours: val > 0 ? parseFloat((Math.floor(val) + (val % 1) * 100 / 60).toFixed(1)) : 0,
    };
  });

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: surface.cardBg,
      borderRadius: RADIUS["2xl"],
      border: `1px solid ${surface.border}`,
      boxShadow: SHADOW.sm,
      ...style,
    }}>
      {children}
    </div>
  );

  const todayRecord = history.find((r) => r.date === TODAY);
  const hours = todayRecord ? calcHours(todayRecord.checkIn, todayRecord.checkOut) : null;

  return (
    <div style={{ fontFamily: FONT_FAMILY.base }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: SPACING[5] }}>
        <h1 style={{ margin: 0, fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: surface.text }}>
          My Attendance
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>
          {fmtDate(TODAY)} &nbsp;·&nbsp; {user?.name || "John Employee"}
        </p>
      </div>

      {/* ── Today Check-in Card ── */}
      <Card style={{
        padding: SPACING[6],
        marginBottom: SPACING[5],
        background: dark
          ? "linear-gradient(135deg,#1e293b,#0f172a)"
          : "linear-gradient(135deg,#eff6ff,#f0fdf4)",
        border: `1px solid ${dark ? COLORS.dark.border : COLORS.primaryLight}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: GAP.md }}>

          {/* Left — live clock + greeting */}
          <div>
            <p style={{ margin: 0, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {checkedOut ? "Today Completed" : checkedIn ? "Currently Working" : "Ready to Check In"}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "2.4rem", fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {currentTime}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: FONT_SIZE.sm, color: surface.subtext }}>{fmtDate(TODAY)}</p>

            {/* Check-in/out times */}
            {(checkedIn || checkInTime) && (
              <div style={{ display: "flex", gap: GAP.lg, marginTop: SPACING[3] }}>
                {checkInTime && (
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success }} />
                    <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>In: <strong style={{ color: COLORS.success }}>{checkInTime}</strong></span>
                  </div>
                )}
                {checkOutTime && (
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.danger }} />
                    <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>Out: <strong style={{ color: COLORS.danger }}>{checkOutTime}</strong></span>
                  </div>
                )}
                {hours && (
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
                    <IconClock size={12} color={surface.subtext} />
                    <span style={{ fontSize: FONT_SIZE.xs, color: surface.subtext }}>Hours: <strong style={{ color: COLORS.primary }}>{hours}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — action button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: GAP.sm }}>
            {!checkedIn ? (
              <>
                <button
                  onClick={() => setConfirmType("checkin")}
                  style={{
                    width: 120, height: 120,
                    borderRadius: RADIUS.full,
                    border: "none",
                    background: COLORS.success,
                    color: COLORS.white,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    cursor: "pointer",
                    boxShadow: `0 8px 24px ${COLORS.success}55`,
                    transition: "transform 0.15s, box-shadow 0.15s",
                    fontSize: FONT_SIZE.sm,
                    fontWeight: FONT_WEIGHT.bold,
                    fontFamily: FONT_FAMILY.base,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <IconClock size={32} stroke={1.8} />
                  CHECK IN
                </button>
                {isLate() && (
                  <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
                    <IconAlertTriangle size={13} color={COLORS.warning} />
                    <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: FONT_WEIGHT.semibold }}>Will be marked Late</span>
                  </div>
                )}
              </>
            ) : !checkedOut ? (
              <>
                <div style={{
                  width: 120, height: 120,
                  borderRadius: RADIUS.full,
                  background: COLORS.successLight,
                  border: `3px solid ${COLORS.success}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: FONT_SIZE.xs,
                  fontWeight: FONT_WEIGHT.bold,
                  color: COLORS.success,
                }}>
                  <IconCircleCheck size={32} stroke={1.8} />
                  WORKING
                </div>
                <button
                  onClick={() => setConfirmType("checkout")}
                  style={{
                    padding: "8px 24px",
                    borderRadius: RADIUS.lg,
                    border: "none",
                    background: COLORS.danger,
                    color: COLORS.white,
                    fontSize: FONT_SIZE.sm,
                    fontWeight: FONT_WEIGHT.bold,
                    fontFamily: FONT_FAMILY.base,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: GAP.xs,
                    boxShadow: `0 4px 12px ${COLORS.danger}44`,
                  }}
                >
                  <IconClock size={15} /> CHECK OUT
                </button>
              </>
            ) : (
              <div style={{
                width: 120, height: 120,
                borderRadius: RADIUS.full,
                background: COLORS.primaryMuted,
                border: `3px solid ${COLORS.primary}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: FONT_SIZE.xs,
                fontWeight: FONT_WEIGHT.bold,
                color: COLORS.primary,
              }}>
                <IconCircleCheck size={32} stroke={1.8} />
                DONE
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: GAP.md, marginBottom: SPACING[5] }}>
        {[
          { label: "Attendance %",   value: `${attendPct}%`,  color: COLORS.primary, bg: COLORS.primaryMuted,  icon: IconClock         },
          { label: "Present Days",   value: presentDays,       color: COLORS.success, bg: COLORS.successLight,  icon: IconCheck         },
          { label: "Late Arrivals",  value: lateDays,          color: COLORS.warning, bg: COLORS.warningLight,  icon: IconAlertTriangle },
          { label: "Absent Days",    value: absentDays,        color: COLORS.danger,  bg: COLORS.dangerMuted,   icon: IconX             },
        ].map((k) => (
          <Card key={k.label} style={{ padding: `${SPACING[4]}px`, display: "flex", alignItems: "center", gap: GAP.md }}>
            <div style={{ width: 46, height: 46, borderRadius: RADIUS.xl, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <k.icon size={22} color={k.color} stroke={1.8} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: FONT_SIZE.xs, color: surface.subtext, fontWeight: FONT_WEIGHT.medium }}>{k.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE["2xl"], fontWeight: FONT_WEIGHT.bold, color: k.color, lineHeight: 1 }}>{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Bottom: Chart + History ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: GAP.md }}>

        {/* Hours chart */}
        <Card style={{ padding: PADDING.card }}>
          <p style={{ margin: `0 0 ${SPACING[4]}px`, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>
            Daily Hours (Last 10 Days)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={surface.border} />
              <XAxis dataKey="date" tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} />
              <YAxis tick={{ fontSize: FONT_SIZE.xs, fill: surface.subtext }} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ background: surface.cardBg, border: `1px solid ${surface.border}`, borderRadius: RADIUS.lg, fontSize: FONT_SIZE.xs }}
                formatter={(v) => [`${v}h`, "Hours"]}
              />
              <Area type="monotone" dataKey="hours" stroke={COLORS.primary} fill="url(#hoursGrad)" strokeWidth={2.5} dot={{ fill: COLORS.primary, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Attendance history table */}
        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: `${SPACING[4]}px ${SPACING[5]}px`, borderBottom: `1px solid ${surface.border}` }}>
            <p style={{ margin: 0, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>Attendance History</p>
            <p style={{ margin: "2px 0 0", fontSize: FONT_SIZE.xs, color: surface.subtext }}>Your recent records</p>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 280 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0 }}>
                <tr style={{ background: surface.theadBg }}>
                  {["Date", "Check In", "Check Out", "Hours", "Status"].map((h) => (
                    <th key={h} style={{ padding: PADDING.tableHeader, textAlign: "left", fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: surface.subtext, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${surface.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Today's row first */}
                {todayRecord && (
                  <tr style={{ background: dark ? COLORS.dark.rowHover : "#f0fdf4", borderBottom: `1px solid ${surface.border}` }}>
                    <td style={{ padding: PADDING.tableCell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: GAP.xs }}>
                        <span style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, background: COLORS.primaryMuted, padding: "1px 7px", borderRadius: RADIUS.full }}>TODAY</span>
                      </div>
                    </td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: FONT_WEIGHT.semibold }}>{todayRecord.checkIn || "—"}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: todayRecord.checkOut ? COLORS.danger : surface.subtext, fontWeight: FONT_WEIGHT.semibold }}>{todayRecord.checkOut || (checkedIn ? "Working..." : "—")}</td>
                    <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{calcHours(todayRecord.checkIn, todayRecord.checkOut) || "—"}</td>
                    <td style={{ padding: PADDING.tableCell }}>
                      {(() => { const st = STATUS_STYLE[todayRecord.status] || STATUS_STYLE.Present; return (
                        <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:st.bg,color:st.color }}>
                          <span style={{ width:5,height:5,borderRadius:"50%",background:st.dot,display:"inline-block" }}/>
                          {todayRecord.status}
                        </span>
                      ); })()}
                    </td>
                  </tr>
                )}
                {history.filter((r) => r.date !== TODAY).map((r, i, arr) => {
                  const st = STATUS_STYLE[r.status] || STATUS_STYLE.Present;
                  return (
                    <tr key={r._id} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${surface.border}` : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: surface.text, whiteSpace: "nowrap" }}>
                        {new Date(r.date).toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short" })}
                      </td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{r.checkIn || "—"}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{r.checkOut || "—"}</td>
                      <td style={{ padding: PADDING.tableCell, fontSize: FONT_SIZE.sm, color: surface.subtext }}>{calcHours(r.checkIn, r.checkOut) || "—"}</td>
                      <td style={{ padding: PADDING.tableCell }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:st.bg,color:st.color }}>
                          <span style={{ width:5,height:5,borderRadius:"50%",background:st.dot,display:"inline-block" }}/>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Confirm Modal ── */}
      {confirmType && (
        <div
          onClick={() => setConfirmType(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.55)",
            zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:   surface.cardBg,
              borderRadius: RADIUS["2xl"],
              border:       `1px solid ${surface.border}`,
              boxShadow:    "0 25px 50px rgba(0,0,0,0.25)",
              width:        "100%",
              maxWidth:     380,
              padding:      SPACING[6],
              textAlign:    "center",
              fontFamily:   FONT_FAMILY.base,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 64, height: 64,
              borderRadius: RADIUS.full,
              background: confirmType === "checkin" ? COLORS.successLight : COLORS.dangerMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto",
              marginBottom: SPACING[4],
            }}>
              <IconClock
                size={30}
                stroke={1.8}
                color={confirmType === "checkin" ? COLORS.success : COLORS.danger}
              />
            </div>

            {/* Title */}
            <p style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: surface.text }}>
              {confirmType === "checkin" ? "Confirm Check In" : "Confirm Check Out"}
            </p>

            {/* Time */}
            <p style={{ margin: "8px 0 4px", fontSize: "2rem", fontWeight: FONT_WEIGHT.bold, color: surface.text, lineHeight: 1 }}>
              {currentTime}
            </p>
            <p style={{ margin: "0 0 8px", fontSize: FONT_SIZE.xs, color: surface.subtext }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>

            {/* Late warning */}
            {confirmType === "checkin" && isLate() && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: GAP.xs,
                padding: "6px 14px", borderRadius: RADIUS.lg,
                background: COLORS.warningLight, border: `1px solid ${COLORS.warning}30`,
                marginBottom: SPACING[4],
              }}>
                <IconAlertTriangle size={14} color={COLORS.warning} stroke={2} />
                <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: FONT_WEIGHT.semibold }}>
                  You will be marked as Late
                </span>
              </div>
            )}

            {/* Sub message */}
            <p style={{ margin: `${SPACING[3]}px 0 ${SPACING[5]}px`, fontSize: FONT_SIZE.sm, color: surface.subtext, lineHeight: 1.5 }}>
              {confirmType === "checkin"
                ? "Are you sure you want to check in now?"
                : `Are you sure you want to check out? You checked in at ${checkInTime}.`
              }
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: GAP.sm }}>
              <button
                onClick={() => setConfirmType(null)}
                style={{
                  flex: 1, padding: "10px 0",
                  borderRadius: RADIUS.lg,
                  border: `1px solid ${surface.border}`,
                  background: "transparent",
                  color: surface.subtext,
                  fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium,
                  cursor: "pointer", fontFamily: FONT_FAMILY.base,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = surface.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Cancel
              </button>
              <button
                onClick={confirmType === "checkin" ? handleCheckIn : handleCheckOut}
                style={{
                  flex: 1, padding: "10px 0",
                  borderRadius: RADIUS.lg,
                  border: "none",
                  background: confirmType === "checkin" ? COLORS.success : COLORS.danger,
                  color: COLORS.white,
                  fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
                  cursor: "pointer", fontFamily: FONT_FAMILY.base,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {confirmType === "checkin" ? "Yes, Check In" : "Yes, Check Out"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyAttendance;
