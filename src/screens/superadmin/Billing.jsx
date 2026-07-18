import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, Tabs,
  SimpleGrid, Progress, Table, ActionIcon, Loader, Center, Modal, Select, TextInput, Divider,
} from "@mantine/core";
import {
  IconDownload, IconCreditCard, IconCheck, IconPlus, IconTrendingUp,
} from "@tabler/icons-react";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";

// ── Mock stubs for removed service functions ──
const downloadInvoice = async (...args) => { console.log("Mock: downloadInvoice"); return new Blob(["mock data"], { type: "text/csv" }); };


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

const PLAN_OPTIONS = ["Starter", "Pro", "Enterprise"];

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_BILLING_PLAN = {
  plan:           "Enterprise",
  status:         "active",
  amount:         45000,
  currency:       "INR",
  billingCycle:   "month",
  nextBillingDate:"2026-08-01T00:00:00",
  billingEmail:   "billing@annztech.com",
};

const MOCK_INVOICES = [
  { id: "INV-2026-007", date: "2026-07-01T00:00:00", amount: 45000, status: "Paid" },
  { id: "INV-2026-006", date: "2026-06-01T00:00:00", amount: 45000, status: "Paid" },
  { id: "INV-2026-005", date: "2026-05-01T00:00:00", amount: 45000, status: "Paid" },
  { id: "INV-2026-004", date: "2026-04-01T00:00:00", amount: 45000, status: "Paid" },
  { id: "INV-2026-003", date: "2026-03-01T00:00:00", amount: 45000, status: "Paid" },
];

const MOCK_USAGE = {
  employees: { used: 134, limit: 200 },
  storage:   { used: 18,  limit: 50 },
  apiCalls:  { used: 24820, limit: 100000 },
};

const MOCK_PAYMENT_METHODS = [
  { id: "pm1", cardBrand: "Visa",       cardLast4: "4242", expiry: "08/28", isDefault: true  },
  { id: "pm2", cardBrand: "Mastercard", cardLast4: "1234", expiry: "03/27", isDefault: false },
];

export default function Billing() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const toast = useToast();
  const queryClient = { invalidateQueries: () => {}, setQueryData: () => {} };

  const { data: planData, isLoading: planLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const { data: invoicesData } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const { data: usageData } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const { data: cardsData } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const upgradeMutation = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const [showAddCard, setShowAddCard]   = useState(false);
  const [cardForm, setCardForm]         = useState({ number: "", expiry: "", cvv: "", name: "" });
  const addCardMut = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const openUpgrade = () => {
    setSelectedPlan(plan.plan || "Enterprise");
    setShowUpgrade(true);
  };

  const handleUpgrade = () => {
    if (!selectedPlan) {
      toast.show("Please select a plan", "error");
      return;
    }
    upgradeMutation.mutate(selectedPlan);
  };

  const plan     = planData?.data    || planData    || MOCK_BILLING_PLAN;
  const rawInvoices = invoicesData?.data?.invoices || [];
  const invoices = rawInvoices.length ? rawInvoices : MOCK_INVOICES;
  const usage    = usageData?.data   || usageData   || MOCK_USAGE;
  const rawCards = cardsData?.data?.methods || [];
  const cards    = rawCards.length ? rawCards : MOCK_PAYMENT_METHODS;

  const usageBars = [
    {
      label: "User Seats",
      used: usage.employees?.used || 0,
      total: usage.employees?.limit || 200,
      unit: "",
      color: "blue",
    },
    {
      label: "Storage",
      used: usage.storage?.used || 0,
      total: usage.storage?.limit || 50,
      unit: " GB",
      color: "violet",
    },
    {
      label: "API Calls Today",
      used: usage.apiCalls?.used || 0,
      total: usage.apiCalls?.limit || 100000,
      unit: "",
      color: "cyan",
    },
  ];

  const seatsUsed = usage.employees?.used || 0;
  const seatsTotal = usage.employees?.limit || 200;
  const storageUsed = usage.storage?.used || 0;
  const storageTotal = usage.storage?.limit || 50;
  const storagePct = storageTotal > 0 ? Math.round((storageUsed / storageTotal) * 100) : 0;

  const formatCurrency = (amount, currency) => {
    if (!amount) return "—";
    const symbol = currency === "INR" ? "₹" : currency || "₹";
    return `${symbol}${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const stats = [
    {
      label: "Monthly Cost",
      value: formatCurrency(plan.amount, plan.currency),
      sub: plan.plan ? `${plan.plan} plan` : "Enterprise plan",
    },
    {
      label: "Users",
      value: `${seatsUsed}/${seatsTotal}`,
      sub: "seats used",
    },
    {
      label: "Storage Used",
      value: `${storagePct}%`,
      sub: `${storageUsed} GB of ${storageTotal} GB`,
    },
    {
      label: "Next Invoice",
      value: formatDate(plan.nextBillingDate),
      sub: "auto-renews",
    },
  ];

  const handleDownloadInvoice = async (inv) => {
    toast.show(`Downloading ${inv.id}...`, "info");
    try {
      const response = await downloadInvoice(inv.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show(`${inv.id} downloaded`, "success");
    } catch {
      toast.show(`Failed to download ${inv.id}`, "error");
    }
  };

  const handleSetPrimary = () => {
    toast.show("Primary payment method updated", "success");
    /* no-op: query cache removed */
  };

  if (planLoading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      <AppPageHeader title="Billing & Subscription" sub="Manage your plan, invoices and payment methods"
        action={<Button leftSection={<IconTrendingUp size={16} />} loading={upgradeMutation.isPending} onClick={openUpgrade}>Upgrade Plan</Button>}
      />

      <Paper
        p="xl"
        radius="lg"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", color: "#fff" }}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <div>
            <Group gap="xs" mb={6}>
              <Text size="xl" fw={700} c="white">{plan.plan || "Enterprise"} Plan</Text>
              <Badge color={plan.status === "active" ? "green" : "orange"} variant="filled">
                {plan.status ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1) : "Active"}
              </Badge>
            </Group>
            <Text size="sm" c="white" opacity={0.85}>{seatsTotal} user seats included</Text>
            <Text size="xs" c="white" opacity={0.7}>
              Renews {plan.nextBillingDate ? new Date(plan.nextBillingDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "August 1, 2026"} — auto-renewal enabled
            </Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Text size="xl" fw={700} c="white">{formatCurrency(plan.amount, plan.currency)}</Text>
            <Text size="sm" c="white" opacity={0.8}>per {plan.billingCycle || "month"}</Text>
          </div>
        </Group>
      </Paper>

      <SimpleGrid cols={4}>
        {stats.map((s) => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>{s.label}</Text>
            <Text size="xl" fw={700}>{s.value}</Text>
            <Text size="xs" c="dimmed" mt={4}>{s.sub}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="invoices">Invoices</Tabs.Tab>
            <Tabs.Tab value="usage">Usage</Tabs.Tab>
            <Tabs.Tab value="payment">Payment Methods</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" p="lg">
            <SimpleGrid cols={2} spacing="xl">
              <Stack gap="xs">
                <Text fw={600}>Plan Features</Text>
                {(plan.features || PLAN_FEATURES).map((feat) => (
                  <Group key={feat} gap="xs">
                    <Paper
                      w={20} h={20} radius="xl"
                      style={{ background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      <IconCheck size={12} color="#16a34a" />
                    </Paper>
                    <Text size="sm">{feat}</Text>
                  </Group>
                ))}
              </Stack>
              <Stack gap="sm">
                <Text fw={600}>Plan Actions</Text>
                <Button fullWidth justify="left" onClick={openUpgrade}>
                  Change Plan
                </Button>
                <Button fullWidth justify="left" variant="default" onClick={() => toast.show("Downgrade confirmation required", "warning")}>
                  Downgrade Plan
                </Button>
                <Button fullWidth justify="left" variant="outline" color="red" onClick={() => toast.show("Cancellation request initiated", "warning")}>
                  Cancel Subscription
                </Button>
                <Paper withBorder p="sm" radius="md" bg="gray.0">
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Billing Contact</Text>
                  <Text size="sm">{plan.billingEmail || plan.email || "—"}</Text>
                  <Text size="xs" c="dimmed" mt={2}>Billing notifications sent here</Text>
                </Paper>
              </Stack>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="invoices" p="lg">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Invoice #</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoices.map((inv) => (
                  <Table.Tr key={inv.id}>
                    <Table.Td c="dimmed">{inv.date ? new Date(inv.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}</Table.Td>
                    <Table.Td fw={500}>{inv.id}</Table.Td>
                    <Table.Td fw={600}>{typeof inv.amount === "number" ? `₹${inv.amount.toLocaleString("en-IN")}` : inv.amount}</Table.Td>
                    <Table.Td>
                      <Badge color="green" variant="light">{inv.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon variant="default" size="sm" onClick={() => handleDownloadInvoice(inv)}>
                        <IconDownload size={12} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="usage" p="lg">
            <Stack maw={580} gap="md">
              <Text fw={600}>Current Usage</Text>
              {usageBars.map((u) => {
                const pct = u.total > 0 ? Math.round((u.used / u.total) * 100) : 0;
                return (
                  <Stack key={u.label} gap={6}>
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>{u.label}</Text>
                      <Text size="sm" c="dimmed">
                        {u.used}{u.unit} / {u.total}{u.unit}{" "}
                        <Text span fw={600} c={pct > 80 ? "red" : "green"}>({pct}%)</Text>
                      </Text>
                    </Group>
                    <Progress value={pct} color={pct > 80 ? "red" : u.color} size="sm" radius="xl" />
                  </Stack>
                );
              })}
              <Paper withBorder p="sm" radius="md" bg="gray.0">
                <Text size="xs" c="dimmed">Usage data refreshes every 15 minutes. API calls reset daily at midnight UTC.</Text>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="payment" p="lg">
            <Stack maw={500} gap="md">
              <Text fw={600}>Saved Cards</Text>
              {cards.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">No payment methods added yet.</Text>
              )}
              {cards.map((card) => {
                const isPrimary = card.isDefault ?? card.primary;
                const brand     = card.cardBrand  ?? card.type   ?? "Card";
                const last4     = card.cardLast4  ?? card.last4  ?? "****";
                const expiry    = card.expiry     ?? "";
                return (
                  <Paper
                    key={card.id} withBorder p="md" radius="md"
                    style={{ borderColor: isPrimary ? "var(--mantine-color-blue-5)" : undefined }}
                  >
                    <Group justify="space-between">
                      <Group gap="md">
                        <IconCreditCard size={20} color={isPrimary ? "var(--mantine-color-blue-6)" : undefined} />
                        <div>
                          <Text size="sm" fw={500}>{brand} ending in {last4}</Text>
                          {expiry && <Text size="xs" c="dimmed">Expires {expiry}</Text>}
                        </div>
                        {isPrimary && <Badge variant="light">Primary</Badge>}
                      </Group>
                      {!isPrimary && (
                        <Button size="xs" variant="default" onClick={() => handleSetPrimary(card.id)}>
                          Set Primary
                        </Button>
                      )}
                    </Group>
                  </Paper>
                );
              })}
              <Button
                variant="default"
                leftSection={<IconPlus size={16} />}
                fullWidth
                style={{ borderStyle: "dashed" }}
                onClick={() => setShowAddCard(true)}
              >
                Add Payment Method
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* ── Change Plan Modal ── */}
      <Modal opened={showUpgrade} onClose={() => setShowUpgrade(false)} title="Change Subscription Plan" size="sm">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Current plan: <Text span fw={600}>{plan.plan || "Enterprise"}</Text>. Select a new plan below.
          </Text>
          <Select
            label="Plan"
            data={PLAN_OPTIONS}
            value={selectedPlan}
            onChange={setSelectedPlan}
            allowDeselect={false}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setShowUpgrade(false)}>Cancel</Button>
            <Button
              onClick={handleUpgrade}
              loading={upgradeMutation.isPending}
              disabled={selectedPlan === plan.plan}
            >
              Confirm Change
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── Add Payment Method Modal ── */}
      <Modal opened={showAddCard} onClose={() => setShowAddCard(false)} title="Add Payment Method" size="sm" radius="lg">
        <Stack gap="sm">
          <TextInput label="Cardholder Name" placeholder="Name on card" value={cardForm.name} onChange={e => setCardForm(p => ({ ...p, name: e.currentTarget.value }))} radius="md" />
          <TextInput label="Card Number" placeholder="1234 5678 9012 3456" value={cardForm.number} onChange={e => setCardForm(p => ({ ...p, number: e.currentTarget.value }))} radius="md" maxLength={19} />
          <Group grow>
            <TextInput label="Expiry" placeholder="MM/YY" value={cardForm.expiry} onChange={e => setCardForm(p => ({ ...p, expiry: e.currentTarget.value }))} radius="md" maxLength={5} />
            <TextInput label="CVV" placeholder="•••" value={cardForm.cvv} onChange={e => setCardForm(p => ({ ...p, cvv: e.currentTarget.value }))} radius="md" maxLength={4} type="password" />
          </Group>
          <Divider />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setShowAddCard(false)}>Cancel</Button>
            <Button
              loading={addCardMut.isPending}
              disabled={!cardForm.name || !cardForm.number || !cardForm.expiry || !cardForm.cvv}
              onClick={() => addCardMut.mutate({ name: cardForm.name, number: cardForm.number, expiry: cardForm.expiry, cvv: cardForm.cvv })}
            >
              Add Card
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
