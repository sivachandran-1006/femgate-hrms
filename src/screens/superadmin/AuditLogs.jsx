import { useState } from "react";
import { Search, Download, ChevronDown, ChevronRight, Shield, Settings, User } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS } from "../../theme/sizes";
import { StatCard, PageHeader, Toast, TableHead, Td, mkInputStyle, mkCard } from "../../components/ui/AdminUI";

const SEV = {
  Critical: { bg: COLORS.dangerMuted,  text: COLORS.danger  },
  Warning:  { bg: COLORS.warningLight, text: COLORS.warning  },
  Info:     { bg: COLORS.primaryLight, text: COLORS.primary  },
};

const MOD_ICON = { Security: Shield, System: Settings };
const ModIcon = ({ m }) => { const I = MOD_ICON[m] || User; return <I size={13} />; };

const LOGS = [
  { id:1,  ts:"2026-06-09 09:14", actor:"superadmin@mgatesystems.com", action:"Login failed — 3 attempts",              module:"Security",     ip:"203.0.113.12", sev:"Critical", detail:{ event:"brute_force",  attempts:3, blocked:true } },
  { id:2,  ts:"2026-06-09 08:30", actor:"finance@mgatesystems.com",    action:"Payroll approved for May 2026",           module:"System",       ip:"10.0.1.22",    sev:"Info",     detail:{ payroll_id:"PAY-2026-05", total:485000, employees:12 } },
  { id:3,  ts:"2026-06-08 07:45", actor:"admin@mgatesystems.com",      action:"Role permissions updated: HR",            module:"System",       ip:"10.0.1.15",    sev:"Warning",  detail:{ role:"HR", added:["edit_employees","export_reports"] } },
  { id:4,  ts:"2026-06-08 16:20", actor:"admin@mgatesystems.com",      action:"Employee record deleted: EMP-009",        module:"User Actions", ip:"10.0.1.15",    sev:"Warning",  detail:{ employee_id:"EMP-009", reason:"Resigned" } },
  { id:5,  ts:"2026-06-08 15:10", actor:"admin@mgatesystems.com",      action:"New user created: kavitha@mgatesystems.com", module:"User Actions",ip:"10.0.1.15",  sev:"Info",     detail:{ user_id:12, role:"HR" } },
  { id:6,  ts:"2026-06-07 14:00", actor:"superadmin@mgatesystems.com", action:"MFA enabled globally",                    module:"Security",     ip:"203.0.113.12", sev:"Critical", detail:{ policy:"mfa_enforcement", before:"optional", after:"required" } },
  { id:7,  ts:"2026-06-07 12:30", actor:"hr@mgatesystems.com",         action:"Leave approved: Priya Sharma",            module:"User Actions", ip:"10.0.1.18",    sev:"Info",     detail:{ leave_id:"LV-045", days:3, type:"Annual" } },
  { id:8,  ts:"2026-06-07 11:15", actor:"itadmin@mgatesystems.com",    action:"System backup initiated",                 module:"System",       ip:"10.0.1.30",    sev:"Info",     detail:{ backup_id:"BKP-20260607", size:"2.3 GB" } },
  { id:9,  ts:"2026-06-06 10:05", actor:"superadmin@mgatesystems.com", action:"Integration disconnected: SAP",           module:"System",       ip:"203.0.113.12", sev:"Warning",  detail:{ integration:"SAP", reason:"API key expired" } },
  { id:10, ts:"2026-06-06 09:00", actor:"finance@mgatesystems.com",    action:"Invoice downloaded: INV-2026-005",        module:"User Actions", ip:"10.0.1.22",    sev:"Info",     detail:{ invoice_id:"INV-2026-005", amount:45000 } },
  { id:11, ts:"2026-06-05 17:40", actor:"admin@mgatesystems.com",      action:"Password reset: mani@mgatesystems.com",  module:"User Actions", ip:"10.0.1.15",    sev:"Info",     detail:{ user:"mani@mgatesystems.com", method:"email_link" } },
  { id:12, ts:"2026-06-05 16:20", actor:"superadmin@mgatesystems.com", action:"Suspicious login from new country: US",  module:"Security",     ip:"198.51.100.5", sev:"Critical", detail:{ country:"US", previous:"IN", blocked:false } },
  { id:13, ts:"2026-06-04 14:00", actor:"hr@mgatesystems.com",         action:"Bulk employee import: 3 records",         module:"System",       ip:"10.0.1.18",    sev:"Info",     detail:{ records:3, source:"CSV" } },
  { id:14, ts:"2026-06-04 12:30", actor:"manager@mgatesystems.com",    action:"Performance review submitted: Arjun",     module:"User Actions", ip:"10.0.1.20",    sev:"Info",     detail:{ review_id:"REV-034", rating:4.2 } },
  { id:15, ts:"2026-06-04 11:00", actor:"itadmin@mgatesystems.com",    action:"API rate limit exceeded",                 module:"Security",     ip:"10.0.1.30",    sev:"Warning",  detail:{ endpoint:"/api/employees", actual:1243 } },
  { id:16, ts:"2026-06-03 09:45", actor:"admin@mgatesystems.com",      action:"User suspended: mani@mgatesystems.com",  module:"User Actions", ip:"10.0.1.15",    sev:"Warning",  detail:{ reason:"Policy violation" } },
  { id:17, ts:"2026-06-02 16:10", actor:"finance@mgatesystems.com",    action:"Tax report exported: FY 2025-26",         module:"User Actions", ip:"10.0.1.22",    sev:"Info",     detail:{ format:"PDF", size:"1.2 MB" } },
  { id:18, ts:"2026-06-02 14:00", actor:"superadmin@mgatesystems.com", action:"New tenant created: SynEx Systems",      module:"System",       ip:"203.0.113.12", sev:"Warning",  detail:{ company:"SynEx Systems", plan:"Starter" } },
  { id:19, ts:"2026-06-01 11:30", actor:"admin@mgatesystems.com",      action:"Email template updated: leave_approval", module:"System",       ip:"10.0.1.15",    sev:"Info",     detail:{ template:"leave_approval", fields:["subject","body"] } },
  { id:20, ts:"2026-06-01 09:00", actor:"superadmin@mgatesystems.com", action:"Session timeout changed: 30 min",        module:"Security",     ip:"203.0.113.12", sev:"Warning",  detail:{ before:"60", after:"30", unit:"minutes" } },
];

const ALL_TABS   = ["All Logs","Security","System","User Actions"];
const DATE_OPT   = ["All Time","Today","This Week","This Month"];
const SEV_OPT    = ["All","Critical","Warning","Info"];
const ACTOR_OPT  = ["All", ...Array.from(new Set(LOGS.map(l=>l.actor)))];

const todayPfx   = "2026-06-09";
const weekPfxs   = ["2026-06-09","2026-06-08","2026-06-07","2026-06-06","2026-06-05","2026-06-04","2026-06-03"];
const monthPfxs  = weekPfxs.concat(["2026-06-02","2026-06-01"]);

export default function AuditLogs({ darkMode = false, userRole = "SUPER_ADMIN" }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const inp = mkInputStyle(surface);

  const [search, setSearch]       = useState("");
  const [dateFilter, setDate]     = useState("This Month");
  const [sevFilter, setSev]       = useState("All");
  const [actorFilter, setActor]   = useState("All");
  const [activeTab, setTab]       = useState("All Logs");
  const [expanded, setExpanded]   = useState(null);
  const [toastMsg, setToastMsg]   = useState(null);

  const toast = (msg) => { setToastMsg(msg); setTimeout(()=>setToastMsg(null), 2500); };

  const visibleLogs = userRole === "SUPER_ADMIN" ? LOGS : LOGS.filter(l=>l.module!=="Security");

  const filtered = visibleLogs.filter(l => {
    const tabOk  = activeTab === "All Logs" || l.module === activeTab;
    const sevOk  = sevFilter === "All" || l.sev === sevFilter;
    const actorOk = actorFilter === "All" || l.actor === actorFilter;
    const q = search.toLowerCase();
    const searchOk = !q || l.action.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q);
    const dateOk = dateFilter === "All Time"
      || (dateFilter === "Today"      && l.ts.startsWith(todayPfx))
      || (dateFilter === "This Week"  && weekPfxs.some(p=>l.ts.startsWith(p)))
      || (dateFilter === "This Month" && monthPfxs.some(p=>l.ts.startsWith(p)));
    return tabOk && sevOk && actorOk && searchOk && dateOk;
  });

  const stats = [
    { label:"Total Events",    value:248, sub:"all time"     },
    { label:"Security Events", value:LOGS.filter(l=>l.module==="Security").length, sub:"in dataset" },
    { label:"System Changes",  value:LOGS.filter(l=>l.module==="System").length,   sub:"in dataset" },
    { label:"User Actions",    value:LOGS.filter(l=>l.module==="User Actions").length, sub:"in dataset" },
  ];

  return (
    <div style={{ padding:24, fontFamily:FONT_FAMILY.base, background:surface.pageBg, minHeight:"100vh", position:"relative" }}>
      {toastMsg && <Toast msg={toastMsg} />}

      {userRole !== "SUPER_ADMIN" && (
        <div style={{ marginBottom:16, padding:"10px 16px", background:COLORS.warningLight, border:`1px solid ${COLORS.warning}40`, borderRadius:RADIUS.lg, fontSize:FONT_SIZE.xs, color:COLORS.warning, fontWeight:FONT_WEIGHT.medium }}>
          View Only — Security logs restricted to Super Admin.
        </div>
      )}

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <PageHeader icon={Shield} iconBg={COLORS.dangerMuted} iconColor={COLORS.danger} title="Audit Logs" sub="Track all system events and user actions" surface={surface} />
        {userRole==="SUPER_ADMIN" && (
          <button onClick={()=>toast("Exporting logs as CSV…")} style={{ display:"flex", alignItems:"center", gap:6, background:COLORS.primary, color:COLORS.white, border:"none", borderRadius:RADIUS.lg, padding:"8px 16px", fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, cursor:"pointer", fontFamily:FONT_FAMILY.base, marginTop:4 }}>
            <Download size={14}/> Export CSV
          </button>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {stats.map(s=><StatCard key={s.label} {...s} surface={surface}/>)}
      </div>

      <div style={{ ...mkCard(surface), overflow:"hidden" }}>
        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${surface.border}` }}>
          {ALL_TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"12px 20px", fontSize:FONT_SIZE.sm, fontWeight:activeTab===t?FONT_WEIGHT.semibold:FONT_WEIGHT.normal, color:activeTab===t?COLORS.primary:surface.subtext, background:"transparent", border:"none", borderBottom:activeTab===t?`2px solid ${COLORS.primary}`:"2px solid transparent", cursor:"pointer", whiteSpace:"nowrap" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${surface.border}`, display:"flex", gap:12, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={15} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:surface.subtext }} />
            <input style={{ ...inp, paddingLeft:32 }} placeholder="Search actions or actors…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select style={{ ...inp, width:"auto", minWidth:130 }} value={dateFilter} onChange={e=>setDate(e.target.value)}>
            {DATE_OPT.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <select style={{ ...inp, width:"auto", minWidth:140 }} value={actorFilter} onChange={e=>setActor(e.target.value)}>
            {ACTOR_OPT.map(a=><option key={a} value={a}>{a==="All"?"All Users":a.split("@")[0]}</option>)}
          </select>
          <select style={{ ...inp, width:"auto", minWidth:120 }} value={sevFilter} onChange={e=>setSev(e.target.value)}>
            {SEV_OPT.map(s=><option key={s} value={s}>{s==="All"?"All Severity":s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
            <TableHead cols={["","Timestamp","Actor","Action","Module","IP","Severity"]} surface={surface}/>
            <tbody>
              {filtered.map((log,i)=>(
                <div key={log.id} style={{ display:"contents" }}>
                  <tr style={{ background:i%2===0?"transparent":(darkMode?COLORS.dark.rowHover+"20":COLORS.gray50), cursor:"pointer" }} onClick={()=>setExpanded(expanded===log.id?null:log.id)}>
                    <Td style={{ color:surface.subtext, width:32, borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>
                      {expanded===log.id?<ChevronDown size={14}/>:<ChevronRight size={14}/>}
                    </Td>
                    <Td style={{ fontSize:FONT_SIZE.xs, color:surface.subtext, whiteSpace:"nowrap", borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>{log.ts}</Td>
                    <Td style={{ borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>{log.actor}</Td>
                    <Td style={{ maxWidth:260, borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>{log.action}</Td>
                    <Td style={{ borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:FONT_SIZE.xs, color:surface.subtext }}>
                        <ModIcon m={log.module}/> {log.module}
                      </div>
                    </Td>
                    <Td style={{ fontSize:FONT_SIZE.xs, color:surface.subtext, fontFamily:"monospace", borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>{log.ip}</Td>
                    <Td style={{ borderBottom: expanded===log.id?"none":`1px solid ${surface.border}` }}>
                      <span style={{ display:"inline-block", fontSize:11, fontWeight:FONT_WEIGHT.semibold, padding:"2px 9px", borderRadius:RADIUS.full, background:SEV[log.sev]?.bg, color:SEV[log.sev]?.text }}>{log.sev}</span>
                    </Td>
                  </tr>
                  {expanded===log.id && (
                    <tr key={`${log.id}-d`}>
                      <td colSpan={7} style={{ padding:"0 16px 14px", borderBottom:`1px solid ${surface.border}`, background: darkMode?COLORS.dark.rowHover+"30":COLORS.gray50 }}>
                        <div style={{ background:surface.inputBg, border:`1px solid ${surface.border}`, borderRadius:RADIUS.md, padding:"12px 14px" }}>
                          <p style={{ margin:"0 0 6px", fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext }}>EVENT DETAILS</p>
                          <pre style={{ margin:0, fontSize:12, color:surface.text, fontFamily:"monospace", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{JSON.stringify(log.detail,null,2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div style={{ padding:40, textAlign:"center", color:surface.subtext, fontSize:FONT_SIZE.sm }}>No log entries match your filters.</div>}
        </div>
      </div>
    </div>
  );
}
