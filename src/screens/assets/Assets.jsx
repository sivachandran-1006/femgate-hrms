import { useState } from "react";
import {
  Box,
  Stack,
  Group,
  Paper,
  Text,
  Button,
  ActionIcon,
  SimpleGrid,
  Table,
  Alert,
} from "@mantine/core";
import {
  IconDeviceLaptop as Laptop,
  IconDeviceDesktop as Monitor,
  IconDeviceMobile as Smartphone,
  IconDatabase as Server,
  IconPackage as Package,
  IconAlertTriangle as AlertTriangle,
  IconSearch as Search,
  IconPlus as Plus,
  IconX as X,
} from "@tabler/icons-react";

// ── Theme token imports (NO hardcoded values) ─────────────────────────────
import { COLORS }                                                        from "../../theme/colors";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT }                           from "../../theme/fonts";
import { SPACING, PADDING, GAP, LAYOUT }                                 from "../../theme/spacing";
import { RADIUS, SHADOW, Z_INDEX, TRANSITION, ICON_SIZE, ICON_STROKE }  from "../../theme/sizes";
import { getStatusBadge }                                                from "../../utils/helpers";
import { usePermission }                                                  from "../../hooks/usePermission";
import { useAssets, useCreateAsset }                                      from "../../queries/useHr";
import { useToast }                                                       from "../../components/ui/Toast";
import { AppPageHeader }                                                  from "../../components/ui/AppPageHeader";

// API status → UI label
const STATUS_LABELS = {
  Available: "Available",
  InUse: "Assigned",
  Maintenance: "Maintenance",
  Disposed: "Retired",
};

const mapAsset = (a) => ({
  id: a.assetId || a.id,
  name: a.name,
  type: a.category,
  serial: a.serialNumber || "—",
  assignedTo: a.assignedTo?.name || "—",
  status: STATUS_LABELS[a.status] || a.status,
  purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : "—",
  value: a.purchaseValue,
});

const TYPE_ICONS = {
  Laptop: Laptop,
  Desktop: Monitor,
  Mobile: Smartphone,
  Monitor: Monitor,
  License: Package,
  Server: Server,
};

function StatusBadge({ status }) {
  const badge = getStatusBadge(status);
  return (
    <Text
      component="span"
      size="sm"
      fw={600}
      style={{
        padding: PADDING.badge,
        borderRadius: RADIUS.full,
        background: badge.bg,
        color: badge.color,
      }}
    >
      {status}
    </Text>
  );
}

const EMPTY_FORM = {
  name: "",
  category: "Laptop",
  serialNumber: "",
  purchaseDate: "",
  purchaseValue: "",
};

export default function Assets({ darkMode = false }) {
  const can = usePermission();
  const { show } = useToast();
  const { data: assetsData = [], isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const assets = assetsData.map(mapAsset);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const surface = darkMode ? COLORS.dark : COLORS.light;

  // KPIs (computed from API data)
  const totalAssets = assets.length;
  const assignedCount = assets.filter((a) => a.status === "Assigned").length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const maintenanceCount = assets.filter((a) => a.status === "Maintenance").length;

  const kpiCards = [
    { label: "Total Assets", value: totalAssets, color: COLORS.primary, icon: Package },
    { label: "Assigned", value: assignedCount, color: COLORS.purple, icon: Laptop },
    { label: "Available", value: availableCount, color: COLORS.success, icon: Server },
    { label: "Maintenance", value: maintenanceCount, color: COLORS.warning, icon: AlertTriangle },
  ];

  // Tabs
  const tabs = ["All", "Assigned", "Available", "Maintenance"];

  // Type options from API data
  const typeOptions = [...new Set(assets.map((a) => a.type).filter(Boolean))];

  // Filtering
  const filtered = assets.filter((a) => {
    const matchTab = activeTab === "All" || a.status === activeTab;

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(a.id).toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.assignedTo.toLowerCase().includes(q) ||
      a.serial.toLowerCase().includes(q);

    const matchType = typeFilter === "All" || a.type === typeFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;

    return matchTab && matchSearch && matchType && matchStatus;
  });

  // Modal
  function openModal() {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleAddAsset(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      setFormError("Please fill in all required fields.");
      return;
    }
    createAsset.mutate(
      {
        name: form.name.trim(),
        category: form.category,
        serialNumber: form.serialNumber.trim() || undefined,
        purchaseDate: form.purchaseDate || undefined,
        purchaseValue: form.purchaseValue !== "" ? Number(form.purchaseValue) : undefined,
      },
      {
        onSuccess: () => {
          show("Asset added successfully");
          closeModal();
        },
        onError: (err) => {
          setFormError(err?.response?.data?.message || "Failed to add asset.");
        },
      }
    );
  }

  const inputStyle = {
    width: "100%",
    padding: PADDING.input,
    borderRadius: RADIUS.md,
    border: `1px solid ${surface.border}`,
    background: surface.inputBg,
    color: surface.text,
    fontSize: FONT_SIZE.md,
    fontFamily: FONT_FAMILY.base,
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  return (
    <Box>
      <AppPageHeader
        title="Asset Management"
        sub="Track and manage company assets"
        action={can("assets.add") && (
          <Button onClick={openModal} leftSection={<Plus size={16} />}>Add Asset</Button>
        )}
      />

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg" mb="xl">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Paper
              key={k.label}
              radius="xl"
              p="xl"
              style={{
                background: surface.cardBg,
                border: `1px solid ${surface.border}`,
                boxShadow: SHADOW.card,
              }}
            >
              <Group gap="lg">
                <Box
                  style={{
                    width: LAYOUT.iconBoxLg - 4,
                    height: LAYOUT.iconBoxLg - 4,
                    borderRadius: RADIUS.lg,
                    background: k.color + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={ICON_SIZE.lg + 2} color={k.color} />
                </Box>
                <Stack gap={4}>
                  <Text fw={700} size="xl" c={surface.text} lh={1}>
                    {k.value}
                  </Text>
                  <Text size="sm" c={surface.subtext}>
                    {k.label}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Main Card */}
      <Paper
        radius="xl"
        style={{
          background: surface.cardBg,
          border: `1px solid ${surface.border}`,
          overflow: "hidden",
          boxShadow: SHADOW.card,
        }}
      >
        {/* Tabs */}
        <Box
          px="xl"
          style={{
            display: "flex",
            borderBottom: `1px solid ${surface.border}`,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <Box
              key={tab}
              component="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: `${SPACING[3] + 2}px ${SPACING[4] + 2}px`,
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                color: activeTab === tab ? COLORS.primary : surface.subtext,
                fontSize: FONT_SIZE.md,
                fontWeight: activeTab === tab ? FONT_WEIGHT.semibold : FONT_WEIGHT.normal,
                fontFamily: FONT_FAMILY.base,
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {/* Filters */}
        <Group
          gap="md"
          wrap="wrap"
          px="xl"
          py="md"
          style={{ borderBottom: `1px solid ${surface.border}` }}
        >
          {/* Search */}
          <Box style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <Search
              size={ICON_SIZE.sm - 1}
              style={{
                position: "absolute",
                left: SPACING[2] + 2,
                top: "50%",
                transform: "translateY(-50%)",
                color: surface.subtext,
                zIndex: 1,
              }}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: SPACING[8] }}
            />
          </Box>

          {/* Type Filter */}
          <Box style={{ position: "relative", flex: "0 1 160px" }}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Box>

          {/* Status Filter */}
          <Box style={{ flex: "0 1 160px" }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Status</option>
              {["Assigned", "Available", "Maintenance", "Retired"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Box>
        </Group>

        {/* Table */}
        <Box style={{ overflowX: "auto" }}>
          <Table style={{ fontSize: FONT_SIZE.md, fontFamily: FONT_FAMILY.base }}>
            <Table.Thead style={{ background: surface.theadBg }}>
              <Table.Tr>
                {["Asset ID", "Asset Name", "Type", "Assigned To", "Serial No", "Status", "Purchase Date", "Action"].map((col) => (
                  <Table.Th
                    key={col}
                    style={{
                      padding: PADDING.tableHeader,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: surface.subtext,
                      fontSize: FONT_SIZE.sm,
                      fontFamily: FONT_FAMILY.base,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${surface.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={8}
                    style={{ padding: SPACING[10], textAlign: "center" }}
                  >
                    <Text c={surface.subtext}>
                      {isLoading ? "Loading assets..." : "No assets found."}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((asset) => {
                  const Icon = TYPE_ICONS[asset.type] || Package;
                  const rowBg = surface.cardBg;

                  return (
                    <Table.Tr
                      key={asset.id}
                      style={{
                        background: rowBg,
                        borderBottom: `1px solid ${surface.border}`,
                        transition: TRANSITION,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                    >
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Text c={COLORS.primary} fw={600} ff="monospace">
                          {asset.id}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Text c={surface.text} fw={500}>
                          {asset.name}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Group gap={GAP.sm - 2} wrap="nowrap">
                          <Icon size={ICON_SIZE.sm - 2} color={surface.subtext} />
                          <Text c={surface.subtext}>{asset.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Text c={surface.text}>{asset.assignedTo}</Text>
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Text c={surface.subtext}>{asset.serial}</Text>
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <StatusBadge status={asset.status} />
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Text c={surface.subtext}>{asset.purchaseDate}</Text>
                      </Table.Td>
                      <Table.Td style={{ padding: PADDING.tableCell, whiteSpace: "nowrap" }}>
                        <Button variant="outline" size="xs" color="gray">
                          View
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Box>

        {/* Table Footer */}
        <Box
          px="xl"
          py="sm"
          style={{ borderTop: `1px solid ${surface.border}` }}
        >
          <Text size="sm" c={surface.subtext}>
            Showing {filtered.length} of {assets.length} assets
          </Text>
        </Box>
      </Paper>

      {/* Add Asset Modal — only IT_ADMIN / ADMIN / SUPER_ADMIN */}
      {showModal && can("assets.add") && (
        <Box
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: Z_INDEX.modal,
            padding: GAP.lg,
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <Paper
            radius="xl"
            style={{
              background: surface.cardBg,
              border: `1px solid ${surface.border}`,
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: SHADOW.modal,
            }}
          >
            {/* Modal Header */}
            <Group
              justify="space-between"
              align="center"
              p="xl"
              style={{ borderBottom: `1px solid ${surface.border}` }}
            >
              <Text size="xl" fw={700} c={surface.text}>
                Add New Asset
              </Text>
              <ActionIcon
                variant="transparent"
                onClick={closeModal}
                c={surface.subtext}
              >
                <X size={ICON_SIZE.lg} />
              </ActionIcon>
            </Group>

            {/* Modal Body */}
            <Stack
              component="form"
              onSubmit={handleAddAsset}
              gap="lg"
              p="xl"
            >
              {formError && (
                <Alert
                  icon={<AlertTriangle size={ICON_SIZE.md - 4} />}
                  color="red"
                  variant="light"
                >
                  {formError}
                </Alert>
              )}

              <SimpleGrid cols={2} spacing="md">
                {/* Asset ID (read-only) */}
                <Stack gap={4}>
                  <Text size="sm" fw={600} c={surface.subtext}>
                    Asset ID
                  </Text>
                  <input
                    name="id"
                    value="Auto-generated"
                    readOnly
                    style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                  />
                </Stack>

                {/* Type */}
                <Stack gap={4}>
                  <Text size="sm" fw={600} c={surface.subtext}>
                    Type *
                  </Text>
                  <select name="category" value={form.category} onChange={handleFormChange} style={selectStyle}>
                    {["Laptop", "Desktop", "Mobile", "Monitor", "License", "Server"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Stack>
              </SimpleGrid>

              {/* Asset Name */}
              <Stack gap={4}>
                <Text size="sm" fw={600} c={surface.subtext}>
                  Asset Name *
                </Text>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Dell Laptop XPS 15"
                  style={inputStyle}
                />
              </Stack>

              <SimpleGrid cols={2} spacing="md">
                {/* Serial Number */}
                <Stack gap={4}>
                  <Text size="sm" fw={600} c={surface.subtext}>
                    Serial Number
                  </Text>
                  <input
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleFormChange}
                    placeholder="e.g. SN-12345"
                    style={inputStyle}
                  />
                </Stack>

                {/* Purchase Value */}
                <Stack gap={4}>
                  <Text size="sm" fw={600} c={surface.subtext}>
                    Purchase Value
                  </Text>
                  <input
                    name="purchaseValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.purchaseValue}
                    onChange={handleFormChange}
                    placeholder="e.g. 85000"
                    style={inputStyle}
                  />
                </Stack>
              </SimpleGrid>

              <SimpleGrid cols={2} spacing="md">
                {/* Purchase Date */}
                <Stack gap={4}>
                  <Text size="sm" fw={600} c={surface.subtext}>
                    Purchase Date
                  </Text>
                  <input
                    name="purchaseDate"
                    type="date"
                    value={form.purchaseDate}
                    onChange={handleFormChange}
                    style={inputStyle}
                  />
                </Stack>
              </SimpleGrid>

              {/* Actions */}
              <Group justify="flex-end" gap="md" mt={4}>
                <Button
                  type="button"
                  variant="outline"
                  color="gray"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAsset.isPending}
                  loading={createAsset.isPending}
                >
                  {createAsset.isPending ? "Adding..." : "Add Asset"}
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
