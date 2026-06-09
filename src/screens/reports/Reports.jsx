import { useState } from "react";
import { Download, Filter, TrendingUp, Users, Clock, Calendar, Package, FileText } from "lucide-react";
import { COLORS } from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { RADIUS } from "../../theme/sizes";
import { StatCard, PageHeader, TabBar, Toast, TableHead, Td, mkInputStyle, mkBtnPrimary, mkCard } from "../../components/ui/AdminUI";

// ── Mock report data ───────────────────────────────────────────────────────────
const DEPT_LIST = ["All Departments","Engineering","HR","Finance","Sales","Design","Marketing"];
const DATE_RANGES = ["This Month","Last Month","Last 3 Months","This Year","Custom"];

const EMP_ROWS = [
  { id:"EMP-001", name:"John Employee",  dept:"Engineering", status:"Active",    joined:"2022-07-01", salary:"₹65,000" },
  { id:"EMP-002", name:"Priya Sharma",   dept:"Design",       status:"Active",    joined:"2022-08-15", salary:"₹70,000" },
  { id:"EMP-003", name:"Arjun Kumar",    dept:"Engineering", status:"Pending",   joined:"2026-05-01", salary:"₹60,000" },
  { id:"EMP-004", name:"Safeer Ahmed",   dept:"Sales",        status:"Active",    joined:"2023-03-01", salary:"₹55,000" },
  { id:"EMP-005", name:"Mani Raj",       dept:"Marketing",    status:"Suspended", joined:"2023-01-20", salary:"₹52,000" },
  { id:"EMP-006", name:"Kavitha R",      dept:"HR",           status:"Active",    joined:"2023-11-01", salary:"₹68,000" },
  { id:"EMP-007", name:"Rajan Patel",    dept:"Finance",      status:"Active",    joined:"2021-04-10", salary:"₹75,000" },
  { id:"EMP-008", name:"Sneha Iyer",     dept:"Design",       status:"Active",    joined:"2024-01-15", salary:"₹62,000" },
];

const ATT_ROWS = [
  { id:"EMP-001", name:"John Employee",  dept:"Engineering", present:22, absent:1, late:2,  leave:1, pct:"91.7%" },
  { id:"EMP-002", name:"Priya Sharma",   dept:"Design",       present:24, absent:0, late:1,  leave:0, pct:"100%"  },
  { id:"EMP-003", name:"Arjun Kumar",    dept:"Engineering", present:18, absent:3, late:3,  leave:0, pct:"75%"   },
  { id:"EMP-004", name:"Safeer Ahmed",   dept:"Sales",        present:23, absent:1, late:0,  leave:2, pct:"95.8%" },
  { id:"EMP-005", name:"Mani Raj",       dept:"Marketing",    present:14, absent:8, late:5,  leave:4, pct:"58.3%" },
  { id:"EMP-006", name:"Kavitha R",      dept:"HR",           present:25, absent:0, late:0,  leave:1, pct:"100%"  },
];

const LEAVE_ROWS = [
  { id:"LV-045", emp:"Priya Sharma",  type:"Annual",   from:"2026-06-15", to:"2026-06-17", days:3, status:"Approved" },
  { id:"LV-046", emp:"Arjun Kumar",   type:"Sick",     from:"2026-06-10", to:"2026-06-11", days:2, status:"Approved" },
  { id:"LV-047", emp:"Safeer Ahmed",  type:"Casual",   from:"2026-06-20", to:"2026-06-20", days:1, status:"Pending"  },
  { id:"LV-048", emp:"Mani Raj",      type:"Annual",   from:"2026-07-01", to:"2026-07-05", days:5, status:"Rejected" },
  { id:"LV-049", emp:"Rajan Patel",   type:"Earned",   from:"2026-06-25", to:"2026-06-26", days:2, status:"Approved" },
  { id:"LV-050", emp:"Sneha Iyer",    type:"Sick",     from:"2026-06-12", to:"2026-06-12", days:1, status:"Approved" },
];

const PAY_ROWS = [
  { id:"PAY-001", emp:"John Employee",  dept:"Engineering", gross:"₹65,000", deductions:"₹8,450", net:"₹56,550", status:"Paid"    },
  { id:"PAY-002", emp:"Priya Sharma",   dept:"Design",       gross:"₹70,000", deductions:"₹9,100", net:"₹60,900", status:"Paid"    },
  { id:"PAY-003", emp:"Arjun Kumar",    dept:"Engineering", gross:"₹60,000", deductions:"₹7,800", net:"₹52,200", status:"Pending" },
  { id:"PAY-004", emp:"Safeer Ahmed",   dept:"Sales",        gross:"₹55,000", deductions:"₹7,150", net:"₹47,850", status:"Paid"    },
  { id:"PAY-005", emp:"Mani Raj",       dept:"Marketing",    gross:"₹52,000", deductions:"₹6,760", net:"₹45,240", status:"Hold"    },
  { id:"PAY-006", emp:"Kavitha R",      dept:"HR",           gross:"₹68,000", deductions:"₹8,840", net:"₹59,160", status:"Paid"    },
  { id:"PAY-007", emp:"Rajan Patel",    dept:"Finance",      gross:"₹75,000", deductions:"₹9,750", net:"₹65,250", status:"Paid"    },
];

const ASSET_ROWS = [
  { id:"AST-001", name:"MacBook Pro 14\"", category:"Laptop",   assignedTo:"John Employee",  dept:"Engineering", status:"In Use",      value:"₹1,20,000" },
  { id:"AST-002", name:"iPhone 14",        category:"Phone",    assignedTo:"Priya Sharma",   dept:"Design",       status:"In Use",      value:"₹75,000"   },
  { id:"AST-003", name:"Dell Monitor",     category:"Monitor",  assignedTo:"Unassigned",     dept:"—",            status:"Available",   value:"₹18,000"   },
  { id:"AST-004", name:"MacBook Air",      category:"Laptop",   assignedTo:"Arjun Kumar",    dept:"Engineering", status:"In Use",      value:"₹95,000"   },
  { id:"AST-005", name:"HP Printer",       category:"Printer",  assignedTo:"HR Dept",        dept:"HR",           status:"Maintenance", value:"₹22,000"   },
  { id:"AST-006", name:"iPad Pro",         category:"Tablet",   assignedTo:"Safeer Ahmed",   dept:"Sales",        status:"In Use",      value:"₹80,000"   },
];

// ── Status badge colours ───────────────────────────────────────────────────────
const STATUS_COL = {
  Active:      { bg:"#dcfce7", text:"#16a34a" },
  Pending:     { bg:"#fef3c7", text:"#d97706" },
  Suspended:   { bg:"#fee2e2", text:"#dc2626" },
  Approved:    { bg:"#dcfce7", text:"#16a34a" },
  Rejected:    { bg:"#fee2e2", text:"#dc2626" },
  Paid:        { bg:"#dcfce7", text:"#16a34a" },
  Hold:        { bg:"#fee2e2", text:"#dc2626" },
  "In Use":    { bg:"#dbeafe", text:"#2563eb" },
  Available:   { bg:"#dcfce7", text:"#16a34a" },
  Maintenance: { bg:"#fef3c7", text:"#d97706" },
};

const SBadge = ({ v }) => {
  const c = STATUS_COL[v] || { bg:COLORS.gray100, text:COLORS.gray600 };
  return <span style={{ display:"inline-block", fontSize:11, fontWeight:FONT_WEIGHT.semibold, padding:"2px 9px", borderRadius:RADIUS.full, background:c.bg, color:c.text }}>{v}</span>;
};

// ── Mini bar chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data, color, surface }) => {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontSize:10, color:surface.subtext, fontWeight:FONT_WEIGHT.semibold }}>{d.value}</span>
          <div style={{ width:"100%", background:color, borderRadius:`${RADIUS.sm}px ${RADIUS.sm}px 0 0`, height:`${Math.max((d.value/max)*60,4)}px`, transition:"height 0.3s" }} />
          <span style={{ fontSize:9, color:surface.subtext, whiteSpace:"nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Report types config ────────────────────────────────────────────────────────
const REPORT_TABS = [
  { id:"employee",   label:"Employees",   icon: Users      },
  { id:"attendance", label:"Attendance",  icon: Clock      },
  { id:"leave",      label:"Leave",       icon: Calendar   },
  { id:"payroll",    label:"Payroll",     icon: TrendingUp },
  { id:"assets",     label:"Assets",      icon: Package    },
];

export default function Reports({ darkMode = false }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const inp = mkInputStyle(surface);

  const [tab, setTab]       = useState("employee");
  const [dept, setDept]     = useState("All Departments");
  const [range, setRange]   = useState("This Month");
  const [toastMsg, setToastMsg] = useState(null);

  const toast = (msg) => { setToastMsg(msg); setTimeout(()=>setToastMsg(null), 2500); };
  const exportReport = (fmt) => toast(`Exporting ${tab} report as ${fmt}…`);

  const chartDataMap = {
    employee:   [{ label:"Eng",  value:3 },{ label:"HR",   value:2 },{ label:"Fin",  value:1 },{ label:"Sales",value:1 },{ label:"Des", value:1 }],
    attendance: [{ label:"Mon",  value:11},{ label:"Tue",  value:12},{ label:"Wed",  value:10},{ label:"Thu",  value:11},{ label:"Fri", value:9  }],
    leave:      [{ label:"Apr",  value:4 },{ label:"May",  value:7 },{ label:"Jun",  value:6 },{ label:"Jul",  value:3 }],
    payroll:    [{ label:"Feb",  value:465},{ label:"Mar", value:472},{ label:"Apr",  value:468},{ label:"May",  value:485}],
    assets:     [{ label:"Laptop",value:2},{ label:"Phone",value:2},{ label:"Monitor",value:1},{ label:"Tablet",value:1}],
  };
  const chartColors = { employee:COLORS.primary, attendance:COLORS.success, leave:COLORS.warning, payroll:"#7c3aed", assets:COLORS.info };

  const summaryMap = {
    employee:   [{ label:"Total Employees", value:EMP_ROWS.length, sub:"registered" },{ label:"Active", value:EMP_ROWS.filter(r=>r.status==="Active").length, sub:"currently active" },{ label:"Pending", value:EMP_ROWS.filter(r=>r.status==="Pending").length, sub:"onboarding" },{ label:"Suspended", value:EMP_ROWS.filter(r=>r.status==="Suspended").length, sub:"inactive" }],
    attendance: [{ label:"Avg Attendance",  value:"87.5%", sub:"this month" },{ label:"Total Present", value:126, sub:"person-days" },{ label:"Absences", value:13, sub:"this month" },{ label:"Late Arrivals", value:11, sub:"this month" }],
    leave:      [{ label:"Total Leaves",    value:LEAVE_ROWS.length, sub:"this month" },{ label:"Approved", value:LEAVE_ROWS.filter(r=>r.status==="Approved").length, sub:"leaves" },{ label:"Pending", value:LEAVE_ROWS.filter(r=>r.status==="Pending").length, sub:"awaiting" },{ label:"Rejected", value:LEAVE_ROWS.filter(r=>r.status==="Rejected").length, sub:"rejected" }],
    payroll:    [{ label:"Total Gross",     value:"₹4,45,000", sub:"this month" },{ label:"Total Net",   value:"₹3,87,200", sub:"disbursed" },{ label:"Deductions", value:"₹57,800", sub:"this month" },{ label:"Pending",    value:PAY_ROWS.filter(r=>r.status!=="Paid").length, sub:"not processed" }],
    assets:     [{ label:"Total Assets",    value:ASSET_ROWS.length, sub:"in inventory" },{ label:"In Use", value:ASSET_ROWS.filter(r=>r.status==="In Use").length, sub:"assigned" },{ label:"Available", value:ASSET_ROWS.filter(r=>r.status==="Available").length, sub:"free" },{ label:"Maintenance", value:ASSET_ROWS.filter(r=>r.status==="Maintenance").length, sub:"under service" }],
  };

  const tableMap = {
    employee: {
      cols: ["Emp ID","Name","Department","Status","Joined","Salary"],
      rows: EMP_ROWS,
      render: r => [r.id, r.name, r.dept, <SBadge v={r.status}/>, r.joined, r.salary],
    },
    attendance: {
      cols: ["Emp ID","Name","Department","Present","Absent","Late","Leave","%"],
      rows: ATT_ROWS,
      render: r => [r.id, r.name, r.dept, r.present, r.absent, r.late, r.leave, <span style={{ fontWeight:FONT_WEIGHT.bold, color: parseFloat(r.pct)<70?COLORS.danger:COLORS.success }}>{r.pct}</span>],
    },
    leave: {
      cols: ["Leave ID","Employee","Type","From","To","Days","Status"],
      rows: LEAVE_ROWS,
      render: r => [r.id, r.emp, r.type, r.from, r.to, r.days, <SBadge v={r.status}/>],
    },
    payroll: {
      cols: ["Pay ID","Employee","Department","Gross","Deductions","Net","Status"],
      rows: PAY_ROWS,
      render: r => [r.id, r.emp, r.dept, r.gross, r.deductions, r.net, <SBadge v={r.status}/>],
    },
    assets: {
      cols: ["Asset ID","Name","Category","Assigned To","Department","Status","Value"],
      rows: ASSET_ROWS,
      render: r => [r.id, r.name, r.category, r.assignedTo, r.dept, <SBadge v={r.status}/>, r.value],
    },
  };

  const current = tableMap[tab];

  return (
    <div style={{ padding:24, fontFamily:FONT_FAMILY.base, background:surface.pageBg, minHeight:"100vh", position:"relative" }}>
      {toastMsg && <Toast msg={toastMsg}/>}

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <PageHeader icon={FileText} title="Reports" sub="Generate and export detailed HR reports" surface={surface}/>
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <button onClick={()=>exportReport("Excel")} style={{ ...mkBtnPrimary(), background:"#16a34a" }}><Download size={14}/> Excel</button>
          <button onClick={()=>exportReport("PDF")}   style={mkBtnPrimary()}><Download size={14}/> PDF</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {summaryMap[tab].map(s=><StatCard key={s.label} {...s} surface={surface}/>)}
      </div>

      {/* Chart + filters row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16, marginBottom:24 }}>
        <div style={{ ...mkCard(surface), padding:20 }}>
          <p style={{ margin:"0 0 16px", fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.text }}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)} Overview
          </p>
          <BarChart data={chartDataMap[tab]} color={chartColors[tab]} surface={surface}/>
        </div>
        <div style={{ ...mkCard(surface), padding:20, display:"flex", flexDirection:"column", gap:14 }}>
          <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.text, display:"flex", alignItems:"center", gap:6 }}>
            <Filter size={14} color={surface.subtext}/> Filters
          </p>
          <div>
            <label style={{ display:"block", fontSize:FONT_SIZE.xs, color:surface.subtext, fontWeight:FONT_WEIGHT.medium, marginBottom:5 }}>DATE RANGE</label>
            <select value={range} onChange={e=>setRange(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
              {DATE_RANGES.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:FONT_SIZE.xs, color:surface.subtext, fontWeight:FONT_WEIGHT.medium, marginBottom:5 }}>DEPARTMENT</label>
            <select value={dept} onChange={e=>setDept(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
              {DEPT_LIST.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ marginTop:"auto", background:COLORS.primaryMuted, borderRadius:RADIUS.lg, padding:"10px 12px" }}>
            <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:COLORS.primary, fontWeight:FONT_WEIGHT.medium }}>Showing: {dept} · {range}</p>
          </div>
        </div>
      </div>

      {/* Tabs + table */}
      <TabBar tabs={REPORT_TABS} active={tab} onChange={setTab} surface={surface}/>

      <div style={{ ...mkCard(surface), overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <TableHead cols={current.cols} surface={surface}/>
            <tbody>
              {current.rows.map((r,i)=>(
                <tr key={i} style={{ background:i%2===0?"transparent":(darkMode?"#1e293b20":"#f8fafc") }}>
                  {current.render(r).map((cell,j)=>(
                    <Td key={j} style={{ color:surface.text }}>{cell}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"12px 20px", borderTop:`1px solid ${surface.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:FONT_SIZE.xs, color:surface.subtext }}>{current.rows.length} records</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>exportReport("Excel")} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:RADIUS.lg, border:`1px solid ${surface.border}`, background:"transparent", color:surface.subtext, fontSize:FONT_SIZE.xs, cursor:"pointer", fontFamily:FONT_FAMILY.base }}>
              <Download size={12}/> Export Excel
            </button>
            <button onClick={()=>exportReport("PDF")} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:RADIUS.lg, border:`1px solid ${surface.border}`, background:"transparent", color:surface.subtext, fontSize:FONT_SIZE.xs, cursor:"pointer", fontFamily:FONT_FAMILY.base }}>
              <Download size={12}/> Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
