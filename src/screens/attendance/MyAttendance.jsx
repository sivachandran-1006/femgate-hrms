import { useState, useEffect } from "react";
import {
  IconClock, IconCheck, IconX, IconCalendar,
  IconCircleCheck, IconAlertTriangle, IconCalendarOff,
} from "@tabler/icons-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { 
  Box, Group, Stack, Text, SimpleGrid, Badge, Button, Paper, Table 
} from "@mantine/core";

import { useAuth }              from "../../hooks/useAuth";
import { useToast }             from "../../components/ui/Toast";
import { AppPageHeader }        from "../../components/ui/AppPageHeader";
import { AppStatCard }          from "../../components/ui/AppStatCard";
import { AppSection }           from "../../components/ui/AppSection";
import { AppTable }             from "../../components/ui/AppTable";
import { AppModal }             from "../../components/ui/AppModal";
import { AppButton }            from "../../components/ui/AppButton";

const TODAY = new Date().toISOString().split("T")[0];

const fmt12 = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const calcHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  try {
    const s = new Date('1970-01-01 ' + checkIn);
    const e = new Date('1970-01-01 ' + checkOut);
    const diff = e - s;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  } catch { return null; }
};

const buildHistory = () => {
  const rows = [];
  const statuses = ["Present","Present","Present","Present","Late","Present","Present","Absent","Present","Present",
                    "Present","Late","Present","Present","Present","Leave","Present","Present","Present","Present"];
  let idx = 0;
  for (let i = 19; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    const iso = d.toISOString().split("T")[0];
    const st  = statuses[idx % statuses.length];
    idx++;
    let checkIn = "", checkOut = "";
    if (st === "Present") { checkIn = "09:05 AM"; checkOut = "06:10 PM"; }
    if (st === "Late")    { checkIn = "10:25 AM"; checkOut = "07:15 PM"; }
    rows.push({ _id: 'my' + i, date: iso, checkIn, checkOut, status: st });
  }
  return rows;
};

const STATUS_STYLE = {
  Present: "green",
  Late:    "yellow",
  Absent:  "red",
  Leave:   "blue",
};

const MyAttendance = () => {
  const { user }  = useAuth();
  const { show }  = useToast();

  const [checkedIn,  setCheckedIn]  = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime,  setCheckInTime]  = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [currentTime,  setCurrentTime]  = useState(fmt12());
  const [history, setHistory] = useState(buildHistory);

  const [confirmType, setConfirmType] = useState(null);

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
        ? 'Checked in at ' + time + ' — marked as Late'
        : 'Checked in successfully at ' + time,
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
    show('Checked out at ' + time + (hrs ? ' · ' + hrs + ' worked' : ''), "success");
  };

  const totalDays   = history.length;
  const presentDays = history.filter((r) => r.status === "Present").length;
  const lateDays    = history.filter((r) => r.status === "Late").length;
  const absentDays  = history.filter((r) => r.status === "Absent").length;
  const attendPct   = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

  const chartData = history.slice(0, 10).reverse().map((r) => {
    const hrs = calcHours(r.checkIn, r.checkOut);
    const val = hrs ? parseFloat(hrs.replace("h", ".").replace("m","")) : 0;
    return {
      date:  new Date(r.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
      hours: val > 0 ? parseFloat((Math.floor(val) + (val % 1) * 100 / 60).toFixed(1)) : 0,
    };
  });

  const todayRecord = history.find((r) => r.date === TODAY);
  const hours = todayRecord ? calcHours(todayRecord.checkIn, todayRecord.checkOut) : null;

  return (
    <Box>
      <AppPageHeader
        title="My Attendance"
        sub={`${fmtDate(TODAY)} · ${user?.name || "John Employee"}`}
      />

      <Paper
        p="xl"
        mb="xl"
        radius="xl"
        style={{
          background: "linear-gradient(135deg, var(--mantine-color-blue-0), var(--mantine-color-green-0))",
          border: "1px solid var(--mantine-color-blue-2)",
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap">
          <Stack gap={4}>
            <Text fz="xs" fw={700} c="dimmed" tt="uppercase" letterSpacing="0.06em">
              {checkedOut ? "Today Completed" : checkedIn ? "Currently Working" : "Ready to Check In"}
            </Text>
            <Text fz={36} fw={800} lh={1} style={{ fontVariantNumeric: "tabular-nums" }}>
              {currentTime}
            </Text>
            <Text fz="sm" c="dimmed">{fmtDate(TODAY)}</Text>

            {(checkedIn || checkInTime) && (
              <Group gap="lg" mt="md">
                {checkInTime && (
                  <Group gap="xs">
                    <Box w={8} h={8} style={{ borderRadius: "50%", background: "var(--mantine-color-green-6)" }} />
                    <Text fz="xs" c="dimmed">In: <Text component="span" fw={600} c="green.7">{checkInTime}</Text></Text>
                  </Group>
                )}
                {checkOutTime && (
                  <Group gap="xs">
                    <Box w={8} h={8} style={{ borderRadius: "50%", background: "var(--mantine-color-red-6)" }} />
                    <Text fz="xs" c="dimmed">Out: <Text component="span" fw={600} c="red.7">{checkOutTime}</Text></Text>
                  </Group>
                )}
                {hours && (
                  <Group gap="xs">
                    <IconClock size={12} style={{ color: "var(--mantine-color-dimmed)" }} />
                    <Text fz="xs" c="dimmed">Hours: <Text component="span" fw={600} c="blue.7">{hours}</Text></Text>
                  </Group>
                )}
              </Group>
            )}
          </Stack>

          <Stack align="center" gap="sm">
            {!checkedIn ? (
              <>
                <Button
                  size="xl"
                  radius="calc(100px)"
                  h={120} w={120}
                  color="green"
                  onClick={() => setConfirmType("checkin")}
                  style={{
                    display: "flex", flexDirection: "column", gap: 6,
                    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  <IconClock size={32} />
                  <Text fz="sm" fw={700}>CHECK IN</Text>
                </Button>
                {isLate() && (
                  <Group gap="xs">
                    <IconAlertTriangle size={13} color="var(--mantine-color-yellow-6)" />
                    <Text fz="xs" c="yellow.7" fw={600}>Will be marked Late</Text>
                  </Group>
                )}
              </>
            ) : !checkedOut ? (
              <>
                <Box
                  h={120} w={120}
                  style={{
                    borderRadius: "50%",
                    background: "var(--mantine-color-green-0)",
                    border: "3px solid var(--mantine-color-green-5)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <IconCircleCheck size={32} stroke={1.8} color="var(--mantine-color-green-6)" />
                  <Text fz="xs" fw={700} c="green.7">WORKING</Text>
                </Box>
                <AppButton color="red" leftSection={<IconClock size={15} />} onClick={() => setConfirmType("checkout")}>
                  CHECK OUT
                </AppButton>
              </>
            ) : (
              <Box
                h={120} w={120}
                style={{
                  borderRadius: "50%",
                  background: "var(--mantine-color-blue-0)",
                  border: "3px solid var(--mantine-color-blue-5)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <IconCircleCheck size={32} stroke={1.8} color="var(--mantine-color-blue-6)" />
                <Text fz="xs" fw={700} c="blue.7">DONE</Text>
              </Box>
            )}
          </Stack>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <AppStatCard icon={<IconClock size={22}/>}         label="Attendance %"  value={`${attendPct}%`} color="blue" />
        <AppStatCard icon={<IconCheck size={22}/>}         label="Present Days"  value={presentDays}    color="green" />
        <AppStatCard icon={<IconAlertTriangle size={22}/>} label="Late Arrivals" value={lateDays}       color="yellow" />
        <AppStatCard icon={<IconX size={22}/>}             label="Absent Days"   value={absentDays}     color="red" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AppSection title="Daily Hours (Last 10 Days)">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--mantine-color-blue-6)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--mantine-color-dimmed)" }} domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}h`, "Hours"]} />
              <Area type="monotone" dataKey="hours" stroke="var(--mantine-color-blue-6)" fill="url(#hoursGrad)" strokeWidth={2.5} dot={{ fill: "var(--mantine-color-blue-6)", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </AppSection>

        <AppSection title="Attendance History" sub="Your recent records" noPadding>
          <Box style={{ overflowY: "auto", maxHeight: 310 }}>
            <AppTable
              headers={["Date", "Check In", "Check Out", "Hours", "Status"]}
              data={history}
              renderRow={(r) => (
                <Table.Tr key={r._id} style={{ background: r.date === TODAY ? "var(--mantine-color-green-0)" : undefined }}>
                  <Table.Td>
                    {r.date === TODAY ? (
                      <Badge color="blue" size="xs">TODAY</Badge>
                    ) : (
                      <Text fz="sm" fw={500}>{new Date(r.date).toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short" })}</Text>
                    )}
                  </Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed" fw={r.date === TODAY ? 600 : 400}>{r.checkIn || "—"}</Text></Table.Td>
                  <Table.Td><Text fz="sm" c={r.date === TODAY && r.checkOut ? "red" : "dimmed"} fw={r.date === TODAY ? 600 : 400}>{r.checkOut || (r.date === TODAY && checkedIn ? "Working..." : "—")}</Text></Table.Td>
                  <Table.Td><Text fz="sm" c="dimmed">{calcHours(r.checkIn, r.checkOut) || "—"}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_STYLE[r.status] || "gray"} variant="light" size="sm">
                      {r.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              )}
            />
          </Box>
        </AppSection>
      </SimpleGrid>

      <AppModal opened={!!confirmType} onClose={() => setConfirmType(null)} withCloseButton={false} size="sm">
        <Stack align="center" ta="center" gap="sm" p="sm">
          <Box
            w={64} h={64}
            style={{
              borderRadius: "50%",
              background: confirmType === "checkin" ? "var(--mantine-color-green-0)" : "var(--mantine-color-red-0)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IconClock size={30} color={confirmType === "checkin" ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"} />
          </Box>
          <Text fz="lg" fw={700}>
            {confirmType === "checkin" ? "Confirm Check In" : "Confirm Check Out"}
          </Text>
          <Text fz={32} fw={800} lh={1}>{currentTime}</Text>
          <Text fz="xs" c="dimmed">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </Text>

          {confirmType === "checkin" && isLate() && (
            <Group gap="xs" p="xs" style={{ background: "var(--mantine-color-yellow-0)", borderRadius: "var(--mantine-radius-md)" }}>
              <IconAlertTriangle size={14} color="var(--mantine-color-yellow-6)" />
              <Text fz="xs" c="yellow.8" fw={600}>You will be marked as Late</Text>
            </Group>
          )}

          <Text fz="sm" c="dimmed" mt="md" mb="xl">
            {confirmType === "checkin"
              ? "Are you sure you want to check in now?"
              : `Are you sure you want to check out? You checked in at ${checkInTime}.`
            }
          </Text>

          <Group grow w="100%">
            <AppButton variant="default" onClick={() => setConfirmType(null)}>Cancel</AppButton>
            <AppButton color={confirmType === "checkin" ? "green" : "red"} onClick={confirmType === "checkin" ? handleCheckIn : handleCheckOut}>
              {confirmType === "checkin" ? "Yes, Check In" : "Yes, Check Out"}
            </AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default MyAttendance;
