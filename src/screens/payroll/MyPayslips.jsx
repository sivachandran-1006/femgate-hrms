import { useState } from "react";
import {
  IconWallet, IconDownload, IconEye, IconFileText,
  IconX, IconPrinter,
} from "@tabler/icons-react";
import {
  Box,
  Stack,
  Group,
  Paper,
  Text,
  ActionIcon,
  Table,
  Modal,
} from "@mantine/core";
import { useAuth }              from "../../hooks/useAuth";
import { useMyPayslips, useMyProfile } from "../../queries/useSelfService";
import { COLORS }               from "../../theme/colors";
import { AppPageHeader }        from "../../components/ui/AppPageHeader";

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

  const { data: slipsRaw = [] } = useMyPayslips();
  const { data: me }            = useMyProfile();

  const MY_PAYSLIPS = slipsRaw.map((s) => ({
    _id:       s.id,
    month:     s.month,
    year:      s.year,
    salary:    s.salary,
    bonus:     s.bonus || 0,
    deduction: s.deduction || 0,
    net:       s.netSalary,
    status:    s.status,
    paidOn:    s.paidAt
      ? new Date(s.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
  }));

  const paidSlips = MY_PAYSLIPS.filter((s)=>s.status==="Paid");
  const totalPaid = paidSlips.reduce((a,s)=>a+s.net,0);
  const avgNet    = paidSlips.length ? Math.round(totalPaid / paidSlips.length) : 0;

  const bd = viewSlip ? computeBreakdown(viewSlip) : null;

  // ── Build a clean, self-contained payslip document for print / download ──
  const buildPayslipHTML = (slip) => {
    const b = computeBreakdown(slip);
    const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
    const row = (label, val) => `<tr><td style="padding:6px 0;color:#475569">${label}</td><td style="padding:6px 0;text-align:right;font-weight:600">${fmt(val)}</td></tr>`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>Payslip ${slip.month} ${slip.year}</title>
      <style>body{font-family:system-ui,-apple-system,sans-serif;color:#0f172a;max-width:640px;margin:24px auto;padding:0 16px}
      h1{font-size:20px;margin:0}h2{font-size:13px;color:#64748b;margin:2px 0 20px;font-weight:500}
      table{width:100%;border-collapse:collapse;font-size:13px}
      .sec{font-weight:700;border-bottom:2px solid #e2e8f0;padding-bottom:4px;margin:18px 0 6px}
      .net{margin-top:18px;padding:14px;background:#eff6ff;border-radius:10px;display:flex;justify-content:space-between;align-items:center}
      .net b{font-size:20px;color:#1d4ed8}</style></head><body>
      <h1>MGate HRMS — Payslip</h1>
      <h2>${slip.month} ${slip.year}</h2>
      <table><tr><td style="color:#475569">Employee</td><td style="text-align:right;font-weight:600">${user?.name || "Employee"}</td></tr>
      <tr><td style="color:#475569">Employee ID</td><td style="text-align:right;font-weight:600">${me?.employeeId || "—"}</td></tr>
      <tr><td style="color:#475569">Department</td><td style="text-align:right;font-weight:600">${me?.department || "—"}</td></tr>
      <tr><td style="color:#475569">Paid On</td><td style="text-align:right;font-weight:600">${slip.paidOn}</td></tr></table>
      <div class="sec">Earnings</div>
      <table>${row("Basic", b.basic)}${row("HRA", b.hra)}${row("Transport", b.transport)}${row("Special Allowance", b.special)}${slip.bonus ? row("Bonus", slip.bonus) : ""}${row("Gross", b.gross)}</table>
      <div class="sec">Deductions</div>
      <table>${row("Provident Fund", b.pf)}${row("Professional Tax", b.profTax)}${row("TDS", b.tds)}${row("Total Deductions", b.totalDed)}</table>
      <div class="net"><span style="font-weight:700">Net Pay</span><b>${fmt(b.net)}</b></div>
      </body></html>`;
  };

  const printPayslip = (slip) => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(buildPayslipHTML(slip));
    w.document.close();
    w.focus();
    w.onload = () => { w.print(); };
    setTimeout(() => { try { w.print(); } catch { /* already triggered */ } }, 300);
  };

  const downloadPayslip = (slip) => {
    const blob = new Blob([buildPayslipHTML(slip)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payslip-${slip.month}-${slip.year}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <AppPageHeader title="My Payslips" sub="View and download your monthly salary statements" />

      {/* KPI row */}
      <Box style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label:"YTD Earnings",   value:`₹${(totalPaid/1000).toFixed(1)}k`,  color:COLORS.primary, bg:COLORS.primaryMuted, icon:IconWallet   },
          { label:"Average Monthly",value:`₹${(avgNet/1000).toFixed(1)}k`,     color:COLORS.success, bg:COLORS.successLight, icon:IconFileText  },
          { label:"Total Payslips", value:MY_PAYSLIPS.length,                  color:COLORS.purple,  bg:COLORS.purpleMuted,  icon:IconFileText  },
        ].map((k)=>(
          <Paper
            key={k.label}
            withBorder
            radius="xl"
            shadow="sm"
            p="md"
            style={{ background: surface.cardBg, border: `1px solid ${surface.border}` }}
          >
            <Group gap="md">
              <Box
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: k.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <k.icon size={22} color={k.color} stroke={1.8}/>
              </Box>
              <Stack gap={2}>
                <Text size="xs" fw={500} c={surface.subtext}>{k.label}</Text>
                <Text fw={700} style={{ color: k.color, fontSize: "1.5rem", lineHeight: 1, marginTop: 2 }}>{k.value}</Text>
              </Stack>
            </Group>
          </Paper>
        ))}
      </Box>

      {/* Payslips list */}
      <Paper withBorder radius="xl" shadow="sm" style={{ background: surface.cardBg, border: `1px solid ${surface.border}` }}>
        <Box p="md" style={{ borderBottom: `1px solid ${surface.border}` }}>
          <Text size="md" fw={700} c={surface.text}>Payslip History</Text>
        </Box>
        <Box style={{ overflowX: "auto" }}>
          <Table>
            <Table.Thead style={{ background: surface.theadBg }}>
              <Table.Tr>
                {["Month","Gross Salary","Deductions","Net Pay","Status","Actions"].map((h)=>(
                  <Table.Th key={h}>
                    <Text size="xs" fw={600} c={surface.subtext} tt="uppercase" style={{ letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {MY_PAYSLIPS.map((slip)=>{
                const gross  = slip.salary + (slip.bonus||0);
                const isPaid = slip.status==="Paid";
                return (
                  <Table.Tr
                    key={slip._id}
                    onMouseEnter={(e)=>(e.currentTarget.style.background=surface.rowHover)}
                    onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}
                  >
                    <Table.Td>
                      <Group gap="sm">
                        <Box
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: isPaid ? COLORS.successLight : COLORS.warningLight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconFileText size={17} color={isPaid?COLORS.success:COLORS.warning} stroke={2}/>
                        </Box>
                        <Stack gap={0}>
                          <Text size="sm" fw={600} c={surface.text}>{slip.month} {slip.year}</Text>
                          <Text size="xs" c={surface.subtext}>Paid on: {slip.paidOn}</Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500} c={surface.text}>₹{gross.toLocaleString("en-IN")}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={COLORS.danger}>-₹{slip.deduction.toLocaleString("en-IN")}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={700} c={COLORS.success}>₹{slip.net.toLocaleString("en-IN")}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Box
                        component="span"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: isPaid ? COLORS.successLight : COLORS.warningLight,
                          color: isPaid ? COLORS.success : COLORS.warning,
                        }}
                      >
                        <Box
                          component="span"
                          style={{ width: 5, height: 5, borderRadius: "50%", background: isPaid ? COLORS.success : COLORS.warning, display: "inline-block" }}
                        />
                        {slip.status}
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="default"
                          size="sm"
                          radius="md"
                          onClick={()=>setViewSlip(slip)}
                          title="View"
                          style={{ color: COLORS.primary }}
                        >
                          <IconEye size={14}/>
                        </ActionIcon>
                        {isPaid && (
                          <ActionIcon
                            variant="default"
                            size="sm"
                            radius="md"
                            title="Download"
                            onClick={()=>downloadPayslip(slip)}
                            style={{ color: COLORS.success }}
                          >
                            <IconDownload size={14}/>
                          </ActionIcon>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Payslip detail modal */}
      {viewSlip && bd && (
        <Modal
          opened
          onClose={()=>setViewSlip(null)}
          size="lg"
          radius="xl"
          title={
            <Group gap="sm">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: COLORS.primaryMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconFileText size={18} color={COLORS.primary} stroke={2}/>
              </Box>
              <Stack gap={0}>
                <Text size="md" fw={700} c={surface.text}>Payslip — {viewSlip.month} {viewSlip.year}</Text>
                <Text size="xs" c={surface.subtext}>{user?.name || "Employee"} · {me?.employeeId || ""}</Text>
              </Stack>
            </Group>
          }
          centered
          styles={{
            header: { background: surface.cardBg },
            body: { background: surface.cardBg, padding: 20 },
          }}
          withCloseButton={false}
        >
          {/* Custom header actions */}
          <Group justify="flex-end" gap="xs" mb="md">
            <ActionIcon variant="default" size="sm" radius="md" title="Print" onClick={()=>printPayslip(viewSlip)} style={{ color: surface.subtext }}>
              <IconPrinter size={15}/>
            </ActionIcon>
            <ActionIcon variant="default" size="sm" radius="md" title="Download" onClick={()=>downloadPayslip(viewSlip)} style={{ color: COLORS.success }}>
              <IconDownload size={15}/>
            </ActionIcon>
            <ActionIcon variant="default" size="sm" radius="md" onClick={()=>setViewSlip(null)} style={{ color: surface.subtext }}>
              <IconX size={15}/>
            </ActionIcon>
          </Group>

          {/* Earnings */}
          <Text size="xs" fw={600} c={surface.subtext} tt="uppercase" style={{ letterSpacing: "0.05em", marginBottom: 8 }}>Earnings</Text>
          {[
            { label:"Basic Salary",       value:bd.basic     },
            { label:"HRA",                value:bd.hra       },
            { label:"Transport Allowance",value:bd.transport },
            { label:"Special Allowance",  value:bd.special   },
            ...(viewSlip.bonus>0?[{ label:"Bonus",value:viewSlip.bonus }]:[]),
          ].map((r)=>(
            <Group key={r.label} justify="space-between" style={{ borderBottom: `1px solid ${surface.border}`, padding: "8px 0" }}>
              <Text size="sm" c={surface.subtext}>{r.label}</Text>
              <Text size="sm" fw={500} c={surface.text}>₹{r.value.toLocaleString("en-IN")}</Text>
            </Group>
          ))}
          <Group justify="space-between" style={{ padding: "10px 0", borderBottom: `2px solid ${surface.border}` }}>
            <Text size="sm" fw={700} c={surface.text}>Gross Earnings</Text>
            <Text size="sm" fw={700} c={COLORS.success}>₹{bd.gross.toLocaleString("en-IN")}</Text>
          </Group>

          {/* Deductions */}
          <Text size="xs" fw={600} c={surface.subtext} tt="uppercase" style={{ letterSpacing: "0.05em", marginBottom: 8, marginTop: 16 }}>Deductions</Text>
          {[
            { label:"Provident Fund (12%)", value:bd.pf      },
            { label:"Professional Tax",     value:bd.profTax },
            { label:"TDS",                  value:bd.tds     },
          ].map((r)=>(
            <Group key={r.label} justify="space-between" style={{ borderBottom: `1px solid ${surface.border}`, padding: "8px 0" }}>
              <Text size="sm" c={surface.subtext}>{r.label}</Text>
              <Text size="sm" fw={500} c={COLORS.danger}>-₹{r.value.toLocaleString("en-IN")}</Text>
            </Group>
          ))}
          <Group justify="space-between" style={{ padding: "10px 0", borderBottom: `2px solid ${surface.border}` }}>
            <Text size="sm" fw={700} c={surface.text}>Total Deductions</Text>
            <Text size="sm" fw={700} c={COLORS.danger}>-₹{bd.totalDed.toLocaleString("en-IN")}</Text>
          </Group>

          {/* Net Pay */}
          <Group
            justify="space-between"
            align="center"
            mt="md"
            p="md"
            style={{ borderRadius: 12, background: COLORS.successLight, border: `1px solid ${COLORS.success}30` }}
          >
            <Text size="md" fw={700} c={COLORS.success}>Net Pay</Text>
            <Text fw={700} c={COLORS.success} style={{ fontSize: "1.25rem" }}>₹{bd.net.toLocaleString("en-IN")}</Text>
          </Group>
        </Modal>
      )}
    </Box>
  );
};

export default MyPayslips;
