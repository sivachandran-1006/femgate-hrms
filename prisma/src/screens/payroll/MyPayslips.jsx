import { useState } from "react";
import {
  IconWallet, IconDownload, IconEye, IconFileText,
  IconX, IconPrinter, IconChevronDown,
} from "@tabler/icons-react";
import { useAuth }              from "../../hooks/useAuth";
import { COLORS }               from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { SPACING, GAP, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOW }       from "../../theme/sizes";

const MY_PAYSLIPS = [
  { _id:"ps001", month:"May",   year:"2026", salary:60000, bonus:3000, deduction:2200, net:60800, status:"Paid",   paidOn:"31 May 2026"  },
  { _id:"ps002", month:"April", year:"2026", salary:60000, bonus:2000, deduction:2200, net:59800, status:"Paid",   paidOn:"30 Apr 2026"  },
  { _id:"ps003", month:"March", year:"2026", salary:60000, bonus:1500, deduction:2200, net:59300, status:"Paid",   paidOn:"31 Mar 2026"  },
  { _id:"ps004", month:"February","year":"2026",salary:60000,bonus:0, deduction:2200, net:57800, status:"Paid",   paidOn:"28 Feb 2026"  },
  { _id:"ps005", month:"January","year":"2026",salary:60000,bonus:2500,deduction:2200,net:60300, status:"Paid",   paidOn:"31 Jan 2026"  },
  { _id:"ps006", month:"June",  year:"2026", salary:60000, bonus:3000, deduction:2200, net:60800, status:"Pending",paidOn:"—"            },
];

const computeBreakdown = (slip) => {
  const basic     = Math.round(slip.salary * 0.5);
  const hra       = Math.round(basic * 0.4);
  const transport = 1500;
  const special   = Math.max(0, slip.salary - basic - hra - transport);
  const gross     = basic + hra + transport + special + (slip.bonus||0);
  const pf        = Math.round(basic * 0.12);
  const profTax   = 200;
  const tds       = Math.round(Math.max(0,(gross*12-250000)/12*0.1));
  const totalDed  = pf + profTax + tds;
  return { basic, hra, transport, special, gross, pf, profTax, tds, totalDed, net: gross - totalDed };
};

const MyPayslips = ({ darkMode: dark = false }) => {
  const { user } = useAuth();
  const surface = dark ? COLORS.dark : COLORS.light;
  const [viewSlip, setViewSlip] = useState(null);

  const totalPaid = MY_PAYSLIPS.filter((s)=>s.status==="Paid").reduce((a,s)=>a+s.net,0);
  const avgNet    = Math.round(MY_PAYSLIPS.filter((s)=>s.status==="Paid").reduce((a,s)=>a+s.net,0)/MY_PAYSLIPS.filter((s)=>s.status==="Paid").length);

  const Card = ({ children, style={} }) => (
    <div style={{ background:surface.cardBg, borderRadius:RADIUS["2xl"], border:`1px solid ${surface.border}`, boxShadow:SHADOW.sm, ...style }}>
      {children}
    </div>
  );

  const bd = viewSlip ? computeBreakdown(viewSlip) : null;

  return (
    <div style={{ fontFamily:FONT_FAMILY.base }}>

      {/* Header */}
      <div style={{ marginBottom:SPACING[5] }}>
        <h1 style={{ margin:0, fontSize:FONT_SIZE["2xl"], fontWeight:FONT_WEIGHT.bold, color:surface.text }}>My Payslips</h1>
        <p style={{ margin:"4px 0 0", fontSize:FONT_SIZE.sm, color:surface.subtext }}>View and download your monthly salary statements</p>
      </div>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        {[
          { label:"YTD Earnings",   value:`₹${(totalPaid/1000).toFixed(1)}k`,  color:COLORS.primary, bg:COLORS.primaryMuted, icon:IconWallet   },
          { label:"Average Monthly",value:`₹${(avgNet/1000).toFixed(1)}k`,     color:COLORS.success, bg:COLORS.successLight, icon:IconFileText  },
          { label:"Total Payslips", value:MY_PAYSLIPS.length,                  color:COLORS.purple,  bg:COLORS.purpleMuted,  icon:IconFileText  },
        ].map((k)=>(
          <div key={k.label} style={{ background:surface.cardBg, borderRadius:RADIUS["2xl"], border:`1px solid ${surface.border}`, boxShadow:SHADOW.sm, padding:SPACING[4], display:"flex", alignItems:"center", gap:GAP.md }}>
            <div style={{ width:46, height:46, borderRadius:RADIUS.xl, background:k.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <k.icon size={22} color={k.color} stroke={1.8}/>
            </div>
            <div>
              <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:surface.subtext, fontWeight:FONT_WEIGHT.medium }}>{k.label}</p>
              <p style={{ margin:"2px 0 0", fontSize:FONT_SIZE["2xl"], fontWeight:FONT_WEIGHT.bold, color:k.color, lineHeight:1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payslips list */}
      <Card>
        <div style={{ padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${surface.border}` }}>
          <p style={{ margin:0, fontSize:FONT_SIZE.md, fontWeight:FONT_WEIGHT.bold, color:surface.text }}>Payslip History</p>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:surface.theadBg }}>
                {["Month","Gross Salary","Deductions","Net Pay","Status","Actions"].map((h)=>(
                  <th key={h} style={{ padding:PADDING.tableHeader, textAlign:"left", fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${surface.border}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MY_PAYSLIPS.map((slip,i,arr)=>{
                const gross  = slip.salary + (slip.bonus||0);
                const isPaid = slip.status==="Paid";
                return (
                  <tr key={slip._id} style={{ borderBottom:i<arr.length-1?`1px solid ${surface.border}`:"none" }}
                    onMouseEnter={(e)=>(e.currentTarget.style.background=surface.rowHover)}
                    onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}>
                    <td style={{ padding:PADDING.tableCell }}>
                      <div style={{ display:"flex", alignItems:"center", gap:GAP.sm }}>
                        <div style={{ width:36, height:36, borderRadius:RADIUS.lg, background:isPaid?COLORS.successLight:COLORS.warningLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <IconFileText size={17} color={isPaid?COLORS.success:COLORS.warning} stroke={2}/>
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.semibold, color:surface.text }}>{slip.month} {slip.year}</p>
                          <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:surface.subtext }}>Paid on: {slip.paidOn}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:PADDING.tableCell, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.medium, color:surface.text }}>₹{gross.toLocaleString("en-IN")}</td>
                    <td style={{ padding:PADDING.tableCell, fontSize:FONT_SIZE.sm, color:COLORS.danger }}>-₹{slip.deduction.toLocaleString("en-IN")}</td>
                    <td style={{ padding:PADDING.tableCell, fontSize:FONT_SIZE.sm, fontWeight:FONT_WEIGHT.bold, color:COLORS.success }}>₹{slip.net.toLocaleString("en-IN")}</td>
                    <td style={{ padding:PADDING.tableCell }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:RADIUS.full, fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, background:isPaid?COLORS.successLight:COLORS.warningLight, color:isPaid?COLORS.success:COLORS.warning }}>
                        <span style={{ width:5,height:5,borderRadius:"50%",background:isPaid?COLORS.success:COLORS.warning,display:"inline-block" }}/>
                        {slip.status}
                      </span>
                    </td>
                    <td style={{ padding:PADDING.tableCell }}>
                      <div style={{ display:"flex", gap:GAP.xs }}>
                        <button onClick={()=>setViewSlip(slip)} title="View" style={{ width:30,height:30,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.primary }}>
                          <IconEye size={14}/>
                        </button>
                        {isPaid && (
                          <button title="Download" style={{ width:30,height:30,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.success }}>
                            <IconDownload size={14}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payslip detail modal */}
      {viewSlip && bd && (
        <div onClick={()=>setViewSlip(null)} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:surface.cardBg,borderRadius:RADIUS["2xl"],border:`1px solid ${surface.border}`,boxShadow:"0 25px 50px rgba(0,0,0,0.25)",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto" }}>

            {/* Modal header */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:`${SPACING[4]}px ${SPACING[5]}px`,borderBottom:`1px solid ${surface.border}`,position:"sticky",top:0,background:surface.cardBg,zIndex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:GAP.sm }}>
                <div style={{ width:36,height:36,borderRadius:RADIUS.lg,background:COLORS.primaryMuted,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <IconFileText size={18} color={COLORS.primary} stroke={2}/>
                </div>
                <div>
                  <p style={{ margin:0,fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:surface.text }}>Payslip — {viewSlip.month} {viewSlip.year}</p>
                  <p style={{ margin:0,fontSize:FONT_SIZE.xs,color:surface.subtext }}>{user?.name || "John Employee"} · MGT-EMP-009</p>
                </div>
              </div>
              <div style={{ display:"flex",gap:GAP.xs }}>
                <button title="Print" style={{ width:32,height:32,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:surface.subtext }}>
                  <IconPrinter size={15}/>
                </button>
                <button title="Download" style={{ width:32,height:32,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.success }}>
                  <IconDownload size={15}/>
                </button>
                <button onClick={()=>setViewSlip(null)} style={{ width:32,height:32,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:surface.subtext }}>
                  <IconX size={15}/>
                </button>
              </div>
            </div>

            <div style={{ padding:SPACING[5] }}>
              {/* Earnings */}
              <p style={{ margin:`0 0 ${SPACING[3]}px`,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,color:surface.subtext,textTransform:"uppercase",letterSpacing:"0.05em" }}>Earnings</p>
              {[
                { label:"Basic Salary",   value:bd.basic     },
                { label:"HRA",            value:bd.hra       },
                { label:"Transport Allowance",value:bd.transport },
                { label:"Special Allowance",  value:bd.special   },
                ...(viewSlip.bonus>0?[{ label:"Bonus",value:viewSlip.bonus }]:[]),
              ].map((r)=>(
                <div key={r.label} style={{ display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${surface.border}`,padding:`${SPACING[2]}px 0` }}>
                  <span style={{ fontSize:FONT_SIZE.sm,color:surface.subtext }}>{r.label}</span>
                  <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:surface.text }}>₹{r.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",padding:`${SPACING[3]}px 0`,borderBottom:`2px solid ${surface.border}` }}>
                <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:surface.text }}>Gross Earnings</span>
                <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:COLORS.success }}>₹{bd.gross.toLocaleString("en-IN")}</span>
              </div>

              {/* Deductions */}
              <p style={{ margin:`${SPACING[4]}px 0 ${SPACING[3]}px`,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,color:surface.subtext,textTransform:"uppercase",letterSpacing:"0.05em" }}>Deductions</p>
              {[
                { label:"Provident Fund (12%)", value:bd.pf      },
                { label:"Professional Tax",     value:bd.profTax },
                { label:"TDS",                  value:bd.tds     },
              ].map((r)=>(
                <div key={r.label} style={{ display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${surface.border}`,padding:`${SPACING[2]}px 0` }}>
                  <span style={{ fontSize:FONT_SIZE.sm,color:surface.subtext }}>{r.label}</span>
                  <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:COLORS.danger }}>-₹{r.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",padding:`${SPACING[3]}px 0`,borderBottom:`2px solid ${surface.border}` }}>
                <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:surface.text }}>Total Deductions</span>
                <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.bold,color:COLORS.danger }}>-₹{bd.totalDed.toLocaleString("en-IN")}</span>
              </div>

              {/* Net */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:SPACING[4],padding:`${SPACING[4]}px`,borderRadius:RADIUS.xl,background:COLORS.successLight,border:`1px solid ${COLORS.success}30` }}>
                <span style={{ fontSize:FONT_SIZE.md,fontWeight:FONT_WEIGHT.bold,color:COLORS.success }}>Net Pay</span>
                <span style={{ fontSize:FONT_SIZE.xl,fontWeight:FONT_WEIGHT.bold,color:COLORS.success }}>₹{bd.net.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayslips;
