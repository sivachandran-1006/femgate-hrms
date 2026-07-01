import { useState, useEffect, useMemo } from "react";
import {
  IconSun as Sun,
  IconSunrise as Sunset,
  IconMoon as Moon,
  IconCalendar as Calendar,
  IconUsers as Users,
  IconRefresh as RefreshCw,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconPlus as Plus,
  IconClock as Clock,
  IconCheck as Check,
  IconCircleX as XCircle,
  IconPencil as Pencil,
  IconTrash as Trash,
} from "@tabler/icons-react";
import {
  Box,
  Stack,
  Group,
  Paper,
  Text,
  Button,
  ActionIcon,
  Table,
  Select,
  Modal,
  TextInput,
  NumberInput,
  Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { COLORS }                        from "../../theme/colors";
import { useShifts as useHrShifts, useSetShift } from "../../queries/useHr";
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useChangeRequests,
  useReviewChangeRequest,
} from "../../queries/useRoster";
import { useFetchAllEmployees }           from "../../queries/useEmployees";
import { useToast }                       from "../../components/ui/Toast";
import { AppPageHeader }                  from "../../components/ui/AppPageHeader";

// ── Constants ────────────────────────────────────────────────────────────────
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SHIFT_TYPES = {
  Morning: { label: "Morning", bg: "#dbeafe", color: "#1d4ed8", darkBg: "#1e3a8a", darkColor: "#93c5fd" },
  Evening: { label: "Evening", bg: "#ffedd5", color: "#c2410c", darkBg: "#7c2d12", darkColor: "#fdba74" },
  Night:   { label: "Night",   bg: "#ede9fe", color: "#6d28d9", darkBg: "#3b0764", darkColor: "#c4b5fd" },
  Off:     { label: "Off",     bg: "#f1f5f9", color: "#475569", darkBg: "#1e293b", darkColor: "#94a3b8" },
  Leave:   { label: "Leave",   bg: "#fef9c3", color: "#a16207", darkBg: "#713f12", darkColor: "#fde047" },
};

// Mock fallback for shift definitions
const MOCK_SHIFT_DEFINITIONS = [
  {
    id: "morning",
    name: "Morning Shift",
    startTime: "09:00",
    endTime: "18:00",
    workingDays: "Mon – Fri",
    gracePeriod: 15,
    employeeCount: 5,
    accent: "#2563eb",
    accentMuted: "#dbeafe",
    accentMutedDark: "#1e3a8a",
  },
  {
    id: "evening",
    name: "Evening Shift",
    startTime: "14:00",
    endTime: "23:00",
    workingDays: "Mon – Sat",
    gracePeriod: 10,
    employeeCount: 3,
    accent: "#ea580c",
    accentMuted: "#ffedd5",
    accentMutedDark: "#7c2d12",
  },
  {
    id: "night",
    name: "Night Shift",
    startTime: "22:00",
    endTime: "07:00",
    workingDays: "Mon – Sun",
    gracePeriod: 20,
    employeeCount: 2,
    accent: "#7c3aed",
    accentMuted: "#ede9fe",
    accentMutedDark: "#3b0764",
  },
];

// Mock fallback for swap/change requests
const MOCK_CHANGE_REQUESTS = [
  {
    id: "sw1",
    requestedBy: "Aravinth",
    withEmployee: "P Santhosh",
    originalShift: "Evening",
    swapShift: "Morning",
    date: "Jun 4, 2026",
    reason: "Family function",
    status: "Pending",
  },
  {
    id: "sw2",
    requestedBy: "Vignesh",
    withEmployee: "Sabari",
    originalShift: "Night",
    swapShift: "Night",
    date: "Jun 5, 2026",
    reason: "Medical appointment",
    status: "Approved",
  },
  {
    id: "sw3",
    requestedBy: "Suriya",
    withEmployee: "Mani",
    originalShift: "Morning",
    swapShift: "Morning",
    date: "Jun 7, 2026",
    reason: "Personal errand",
    status: "Rejected",
  },
];

const STAT_CARDS = [
  { label: "Total Shifts",          value: 3,  icon: Calendar, accent: "#2563eb", muted: "#dbeafe", mutedDark: "#1e3a8a" },
  { label: "Employees on Morning",  value: 5,  icon: Sun,      accent: "#d97706", muted: "#fef3c7", mutedDark: "#713f12" },
  { label: "Employees on Evening",  value: 3,  icon: Sunset,   accent: "#ea580c", muted: "#ffedd5", mutedDark: "#7c2d12" },
  { label: "Night Shift",           value: 2,  icon: Moon,     accent: "#7c3aed", muted: "#ede9fe", mutedDark: "#3b0764" },
  { label: "On Leave Today",        value: 1,  icon: Users,    accent: "#16a34a", muted: "#dcfce7", mutedDark: "#14532d" },
];

const STATUS_COLORS = {
  Pending:  { bg: "#e0e7ff", color: "#4338ca", darkBg: "#312e81", darkColor: "#a5b4fc" },
  Approved: { bg: "#dcfce7", color: "#15803d", darkBg: "#14532d", darkColor: "#86efac" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c", darkBg: "#7f1d1d", darkColor: "#fca5a5" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const r = (res) => res.data?.data ?? res.data ?? res;

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// Derive a display-friendly time string from startTime/endTime fields
const formatShiftTime = (def) => {
  if (def.time) return def.time;
  if (def.startTime && def.endTime) return `${def.startTime} – ${def.endTime}`;
  return "—";
};

// Pick accent colours — fallback to blue for unknown shifts
const ACCENT_PALETTE = [
  { accent: "#2563eb", accentMuted: "#dbeafe", accentMutedDark: "#1e3a8a" },
  { accent: "#ea580c", accentMuted: "#ffedd5", accentMutedDark: "#7c2d12" },
  { accent: "#7c3aed", accentMuted: "#ede9fe", accentMutedDark: "#3b0764" },
  { accent: "#16a34a", accentMuted: "#dcfce7", accentMutedDark: "#14532d" },
  { accent: "#d97706", accentMuted: "#fef3c7", accentMutedDark: "#713f12" },
];
const paletteFor = (idx) => ACCENT_PALETTE[idx % ACCENT_PALETTE.length];

// ── Sub-components ───────────────────────────────────────────────────────────

function ShiftBadge({ type, darkMode }) {
  const def = SHIFT_TYPES[type] || SHIFT_TYPES.Off;
  return (
    <Box
      component="span"
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 600,
        background: darkMode ? def.darkBg : def.bg,
        color: darkMode ? def.darkColor : def.color,
        whiteSpace: "nowrap",
      }}
    >
      {def.label}
    </Box>
  );
}

function StatCard({ card, darkMode }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const Icon = card.icon;
  return (
    <Paper
      withBorder
      radius="xl"
      shadow="sm"
      p="md"
      style={{ flex: "1 1 160px", minWidth: 140, background: surface.cardBg, border: `1px solid ${surface.border}` }}
    >
      <Stack gap="xs">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: darkMode ? card.mutedDark : card.muted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={card.accent} strokeWidth={2} />
        </Box>
        <Text fw={700} c={surface.text} style={{ fontSize: "1.5rem", lineHeight: 1 }}>
          {card.value}
        </Text>
        <Text size="xs" fw={500} c={surface.subtext}>
          {card.label}
        </Text>
      </Stack>
    </Paper>
  );
}

// ── Assign Shift Modal ────────────────────────────────────────────────────────
function AssignShiftModal({ darkMode, onClose, onSave, employees = [], weekDates = [] }) {
  const [employee, setEmployee] = useState(employees[0] || "");
  const [dayIndex, setDayIndex] = useState("0");
  const [shift, setShift] = useState("Morning");

  useEffect(() => {
    if (!employee && employees.length) setEmployee(employees[0]);
  }, [employees, employee]);

  const employeeOptions = employees.map((emp) => ({ value: emp, label: emp }));
  const dayOptions = WEEK_DAYS.map((day, i) => ({ value: String(i), label: `${day}, ${weekDates[i] || ""}` }));
  const shiftOptions = Object.keys(SHIFT_TYPES).map((s) => ({ value: s, label: s }));

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Text fw={700} size="lg">Assign Shift</Text>
          <Text size="xs" c="dimmed">Week of Jun 2 – 8, 2026</Text>
        </Stack>
      }
      centered
      radius="xl"
    >
      <Stack gap="md">
        <Select
          label="Employee"
          data={employeeOptions}
          value={employee}
          onChange={(v) => setEmployee(v || "")}
        />
        <Select
          label="Date"
          data={dayOptions}
          value={dayIndex}
          onChange={(v) => setDayIndex(v || "0")}
        />
        <Select
          label="Shift"
          data={shiftOptions}
          value={shift}
          onChange={(v) => setShift(v || "Morning")}
        />
        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!employee}
            onClick={() => { if (!employee) return; onSave(employee, Number(dayIndex), shift); onClose(); }}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Shift Roster Tab ──────────────────────────────────────────────────────────
function ShiftRosterTab({ darkMode, roster, onAssign, employees = [], weekDates = [] }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const [showModal, setShowModal] = useState(false);

  return (
    <Stack gap="md">
      {/* Week Navigator + Assign Button */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm">
          <ActionIcon variant="default" size="md" radius="md">
            <ChevronLeft size={16} />
          </ActionIcon>
          <Text size="sm" fw={600} c={surface.text}>Week: Jun 2 – 8, 2026</Text>
          <ActionIcon variant="default" size="md" radius="md">
            <ChevronRight size={16} />
          </ActionIcon>
        </Group>
        <Button leftSection={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Assign Shift
        </Button>
      </Group>

      {/* Roster Grid */}
      <Paper
        withBorder
        radius="xl"
        shadow="sm"
        style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, overflowX: "auto" }}
      >
        <Table style={{ minWidth: 700 }}>
          <Table.Thead style={{ background: surface.theadBg }}>
            <Table.Tr>
              <Table.Th style={{ minWidth: 140, textAlign: "left", paddingLeft: 16 }}>
                <Text size="xs" fw={600} c={surface.subtext} tt="uppercase" style={{ letterSpacing: "0.05em" }}>Employee</Text>
              </Table.Th>
              {WEEK_DAYS.map((day, i) => (
                <Table.Th key={day} style={{ minWidth: 96, textAlign: "center" }}>
                  <Text size="xs" fw={700} c={surface.subtext} tt="uppercase" style={{ letterSpacing: "0.05em" }}>{day}</Text>
                  <Text size="xs" c={surface.subtext} style={{ opacity: 0.8, marginTop: 2 }}>{weekDates[i]}</Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {employees.map((emp) => (
              <Table.Tr key={emp}>
                <Table.Td style={{ textAlign: "left", paddingLeft: 16, background: surface.cardBg }}>
                  <Group gap="sm">
                    <Box
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        background: COLORS.primaryLight,
                        color: COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials(emp)}
                    </Box>
                    <Text size="sm" fw={500} c={surface.text}>{emp}</Text>
                  </Group>
                </Table.Td>
                {(roster[emp] || []).map((shift, di) => (
                  <Table.Td key={di} style={{ textAlign: "center", background: surface.cardBg }}>
                    <ShiftBadge type={shift} darkMode={darkMode} />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Legend */}
      <Group gap="md" wrap="wrap">
        {Object.entries(SHIFT_TYPES).map(([key, def]) => (
          <Group key={key} gap="xs">
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: darkMode ? def.darkColor : def.color,
                display: "inline-block",
              }}
            />
            <Text size="xs" fw={500} c={surface.subtext}>{key}</Text>
          </Group>
        ))}
      </Group>

      {showModal && (
        <AssignShiftModal
          darkMode={darkMode}
          onClose={() => setShowModal(false)}
          onSave={(emp, dayIndex, shift) => onAssign(emp, dayIndex, shift)}
          employees={employees}
          weekDates={weekDates}
        />
      )}
    </Stack>
  );
}

// ── Shift Definition Form Modal ───────────────────────────────────────────────
const EMPTY_FORM = { name: "", startTime: "", endTime: "", workingDays: "", gracePeriod: 15 };

function ShiftDefModal({ opened, onClose, initial, onSave, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  useEffect(() => {
    setForm(initial || EMPTY_FORM);
  }, [initial, opened]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial?.id;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="lg">{isEdit ? "Edit Shift" : "Add Shift"}</Text>}
      centered
      radius="xl"
    >
      <Stack gap="md">
        <TextInput
          label="Shift Name"
          placeholder="e.g. Morning Shift"
          value={form.name}
          onChange={(e) => set("name")(e.currentTarget.value)}
          required
        />
        <Group grow>
          <TextInput
            label="Start Time"
            placeholder="09:00"
            value={form.startTime}
            onChange={(e) => set("startTime")(e.currentTarget.value)}
          />
          <TextInput
            label="End Time"
            placeholder="18:00"
            value={form.endTime}
            onChange={(e) => set("endTime")(e.currentTarget.value)}
          />
        </Group>
        <TextInput
          label="Working Days"
          placeholder="e.g. Mon – Fri"
          value={form.workingDays}
          onChange={(e) => set("workingDays")(e.currentTarget.value)}
        />
        <NumberInput
          label="Grace Period (minutes)"
          min={0}
          max={60}
          value={form.gracePeriod}
          onChange={set("gracePeriod")}
        />
        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            loading={saving}
            disabled={!form.name.trim()}
            onClick={() => onSave(form)}
          >
            {isEdit ? "Save Changes" : "Add Shift"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Shift Definitions Tab ─────────────────────────────────────────────────────
function ShiftDefinitionsTab({ darkMode }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const { show } = useToast();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: raw, isLoading } = useShifts();
  const definitions = raw?.length ? raw : MOCK_SHIFT_DEFINITIONS;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const deleteMutation = useDeleteShift();

  // ── Form modal ────────────────────────────────────────────────────────────
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit

  const handleOpenAdd = () => { setEditTarget(null); openForm(); };
  const handleOpenEdit = (def) => { setEditTarget(def); openForm(); };

  const handleSave = (form) => {
    if (editTarget?.id) {
      updateMutation.mutate(
        { id: editTarget.id, ...form },
        {
          onSuccess: () => { show("Shift updated", "success"); closeForm(); },
          onError:   () => show("Failed to update shift", "error"),
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => { show("Shift created", "success"); closeForm(); },
        onError:   () => show("Failed to create shift", "error"),
      });
    }
  };

  // ── Delete confirm modal ──────────────────────────────────────────────────
  const [delOpened, { open: openDel, close: closeDel }] = useDisclosure(false);
  const [delId, setDelId] = useState(null);
  const [delName, setDelName] = useState("");

  const handleRequestDelete = (def) => {
    setDelId(def.id);
    setDelName(def.name);
    openDel();
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(delId, {
      onSuccess: () => { show("Shift deleted", "success"); closeDel(); },
      onError:   () => show("Failed to delete shift", "error"),
    });
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* Toolbar */}
      <Group justify="flex-end" mb="md">
        <Button leftSection={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Shift
        </Button>
      </Group>

      {isLoading ? (
        <Group justify="center" py="xl"><Loader size="sm" /></Group>
      ) : (
        <Group gap="lg" align="stretch" wrap="wrap">
          {definitions.map((def, idx) => {
            const palette = def.accent ? def : paletteFor(idx);
            const accent         = palette.accent;
            const accentMuted    = palette.accentMuted;
            const accentMutedDark = palette.accentMutedDark;
            const timeStr = formatShiftTime(def);
            const daysStr = def.workingDays || def.days || "—";
            const grace   = def.gracePeriod != null ? `${def.gracePeriod} min` : (def.grace || "—");
            const count   = def.employeeCount ?? def.count ?? 0;

            return (
              <Paper
                key={def.id}
                withBorder
                radius="xl"
                shadow="sm"
                style={{
                  flex: "1 1 280px",
                  minWidth: 260,
                  background: surface.cardBg,
                  border: `1px solid ${surface.border}`,
                  overflow: "hidden",
                }}
              >
                {/* Accent bar — decorative top colour strip, no Mantine prop equivalent */}
                <Box style={{ height: 4, background: accent }} />

                <Box p="md">
                  {/* Title row with Edit/Delete */}
                  <Group justify="space-between" gap="md" mb="md" wrap="nowrap">
                    <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <Box
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: darkMode ? accentMutedDark : accentMuted,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={22} color={accent} strokeWidth={2} />
                      </Box>
                      <Stack gap={2} style={{ minWidth: 0 }}>
                        <Text size="md" fw={700} c={surface.text} truncate>{def.name}</Text>
                        <Text size="sm" fw={600} style={{ color: accent }}>{timeStr}</Text>
                      </Stack>
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        radius="md"
                        onClick={() => handleOpenEdit(def)}
                        title="Edit shift"
                        color="blue"
                      >
                        <Pencil size={14} strokeWidth={2} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        radius="md"
                        onClick={() => handleRequestDelete(def)}
                        title="Delete shift"
                        color="red"
                      >
                        <Trash size={14} strokeWidth={2} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  {/* Details */}
                  <Stack gap="sm">
                    <InfoRow icon={Calendar} label="Working Days" value={daysStr}  surface={surface} />
                    <InfoRow icon={Clock}    label="Grace Period"  value={grace}    surface={surface} />
                    <InfoRow icon={Users}    label="Employees"     value={`${count} assigned`} surface={surface} />
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Group>
      )}

      {/* Add / Edit modal */}
      <ShiftDefModal
        opened={formOpened}
        onClose={closeForm}
        initial={editTarget}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete confirm modal */}
      <Modal
        opened={delOpened}
        onClose={closeDel}
        title={<Text fw={700} size="lg">Delete Shift</Text>}
        centered
        radius="xl"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Are you sure you want to delete <Text component="span" fw={600} c="red">{delName}</Text>? This cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeDel} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

function InfoRow({ icon: Icon, label, value, surface }) {
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <Icon size={14} color={surface.subtext} strokeWidth={2} />
        <Text size="xs" fw={500} c={surface.subtext}>{label}</Text>
      </Group>
      <Text size="xs" fw={600} c={surface.text}>{value}</Text>
    </Group>
  );
}

// ── Swap Requests Tab ─────────────────────────────────────────────────────────
function SwapRequestsTab({ darkMode }) {
  const surface = darkMode ? COLORS.dark : COLORS.light;
  const { show } = useToast();

  const { data: rawRequests } = useChangeRequests();
  const swapRequests = rawRequests?.length ? rawRequests : MOCK_CHANGE_REQUESTS;

  const reviewMutation = useReviewChangeRequest();

  const handleUpdateStatus = (id, status) => {
    reviewMutation.mutate(
      { id, status },
      {
        onSuccess: () => show(`Request ${status.toLowerCase()}`, "success"),
        onError:   () => show("Failed to update request", "error"),
      }
    );
  };

  return (
    <Paper
      withBorder
      radius="xl"
      shadow="sm"
      style={{ background: surface.cardBg, border: `1px solid ${surface.border}`, overflowX: "auto" }}
    >
      <Table style={{ minWidth: 780 }}>
        <Table.Thead style={{ background: surface.theadBg }}>
          <Table.Tr>
            {["Requested By", "With Employee", "Original Shift", "Swap Shift", "Date", "Reason", "Status", "Actions"].map((h) => (
              <Table.Th key={h}>
                <Text size="xs" fw={600} c={surface.subtext} tt="uppercase" style={{ letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {swapRequests.map((req) => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.Pending;
            return (
              <Table.Tr key={req.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Box
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: COLORS.primaryLight,
                        color: COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials(req.requestedBy)}
                    </Box>
                    <Text size="sm" c={surface.text}>{req.requestedBy}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={surface.text}>{req.withEmployee}</Text>
                </Table.Td>
                <Table.Td><ShiftBadge type={req.originalShift} darkMode={darkMode} /></Table.Td>
                <Table.Td><ShiftBadge type={req.swapShift} darkMode={darkMode} /></Table.Td>
                <Table.Td>
                  <Text size="sm" c={surface.subtext}>{req.date}</Text>
                </Table.Td>
                <Table.Td>
                  <Text
                    size="sm"
                    c={surface.text}
                    style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {req.reason}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Box
                    component="span"
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: darkMode ? sc.darkBg : sc.bg,
                      color: darkMode ? sc.darkColor : sc.color,
                    }}
                  >
                    {req.status}
                  </Box>
                </Table.Td>
                <Table.Td>
                  {req.status === "Pending" ? (
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        radius="md"
                        onClick={() => handleUpdateStatus(req.id, "Approved")}
                        title="Approve"
                        style={{ background: darkMode ? "#14532d" : COLORS.successLight, border: "none", color: COLORS.success }}
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        radius="md"
                        onClick={() => handleUpdateStatus(req.id, "Rejected")}
                        title="Reject"
                        style={{ background: darkMode ? "#7f1d1d" : "#fee2e2", border: "none", color: COLORS.error }}
                      >
                        <XCircle size={14} strokeWidth={2.5} />
                      </ActionIcon>
                    </Group>
                  ) : (
                    <Text size="xs" c={surface.subtext}>—</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const ShiftManagement = ({ darkMode = false }) => {
  const surface = darkMode ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab] = useState("roster");
  const [roster, setRoster] = useState({});

  const { data: shiftsData } = useHrShifts();
  const { data: allEmployees = [] } = useFetchAllEmployees();
  const setShiftMutation = useSetShift();
  const { show } = useToast();

  // Sync roster from API data
  useEffect(() => {
    if (shiftsData?.roster) {
      setRoster(Object.fromEntries(shiftsData.roster.map((r) => [r.employeeName, r.shifts])));
    }
  }, [shiftsData]);

  // Dropdown / grid employees: ALL employees (so first-time assignment works),
  // unioned with anyone already in the roster.
  const employees = useMemo(() => {
    const fromApi = (allEmployees || []).map((e) => e.name).filter(Boolean);
    const fromRoster = shiftsData?.roster ? shiftsData.roster.map((row) => row.employeeName) : [];
    return [...new Set([...fromApi, ...fromRoster])];
  }, [allEmployees, shiftsData]);

  const weekDates = useMemo(() => {
    if (!shiftsData?.weekStart) return [];
    const start = new Date(`${shiftsData.weekStart}T00:00:00`);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
  }, [shiftsData]);

  const handleAssignShift = (employee, dayIndex, shift) => {
    if (!employee) { show("Please select an employee", "error"); return; }
    if (!shiftsData?.weekStart) { show("Roster still loading, please retry", "error"); return; }
    // Optimistic local update
    setRoster((prev) => {
      const updated = { ...prev };
      const row = [...(updated[employee] || [])];
      row[dayIndex] = shift;
      updated[employee] = row;
      return updated;
    });
    setShiftMutation
      .mutateAsync({ employeeName: employee, weekStart: shiftsData.weekStart, dayIndex, shift })
      .then(() => show(`Shift updated for ${employee}`, "success"))
      .catch(() => show(`Failed to update shift for ${employee}`, "error"));
  };

  const TABS = [
    { id: "roster",      label: "Shift Roster",      icon: Calendar  },
    { id: "definitions", label: "Shift Definitions",  icon: Clock     },
    { id: "swaps",       label: "Swap Requests",      icon: RefreshCw },
  ];

  return (
    <Box style={{ minHeight: "100vh", background: surface.pageBg }} p="md">
      <AppPageHeader title="Shift Management" sub="Manage employee shifts, rosters, and swap requests" />

      {/* Stat Cards */}
      <Group gap="md" mb="lg" wrap="wrap">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} card={card} darkMode={darkMode} />
        ))}
      </Group>

      {/* Tabs */}
      <Box style={{ borderBottom: `2px solid ${surface.border}` }} mb="lg">
        <Group gap={0}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="subtle"
                onClick={() => setActiveTab(tab.id)}
                leftSection={<Icon size={15} strokeWidth={2} />}
                style={{
                  borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                  marginBottom: -2,
                  borderRadius: 0,
                  color: active ? COLORS.primary : surface.subtext,
                  fontWeight: active ? 600 : 500,
                  background: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Group>
      </Box>

      {/* Tab Content */}
      {activeTab === "roster" && (
        <ShiftRosterTab
          darkMode={darkMode}
          roster={roster}
          onAssign={handleAssignShift}
          employees={employees}
          weekDates={weekDates}
        />
      )}
      {activeTab === "definitions" && (
        <ShiftDefinitionsTab darkMode={darkMode} />
      )}
      {activeTab === "swaps" && (
        <SwapRequestsTab darkMode={darkMode} />
      )}
    </Box>
  );
};

export default ShiftManagement;
