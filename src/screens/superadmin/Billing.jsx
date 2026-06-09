import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, Tabs,
  SimpleGrid, Progress, Table, ActionIcon, Loader, Center,
} from "@mantine/core";
import {
  IconDownload, IconCreditCard, IconCheck, IconPlus, IconTrendingUp,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";
import {
  getBillingPlan,
  getBillingInvoices,
  downloadInvoice,
  getBillingUsage,
  upgradePlan,
  getPaymentMethods,
} from "../../api/billingApi";

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

export default function Billing() {
  const [activeTab, setActiveTab] = useState("overview");
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ["billing-plan"],
    queryFn: getBillingPlan,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: getBillingInvoices,
  });

  const { data: usageData } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: getBillingUsage,
  });

  const { data: cardsData } = useQuery({
    queryKey: ["billing-payment-methods"],
    queryFn: getPaymentMethods,
  });

  const upgradeMutation = useMutation({
    mutationFn: upgradePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-plan"] });
      toast.show("Plan upgraded successfully", "success");
    },
    onError: () => {
      toast.show("Failed to upgrade plan. Please try again.", "error");
    },
  });

  const plan     = planData?.data    || {};
  const invoices = invoicesData?.data?.invoices || [];
  const usage    = usageData?.data   || {};
  const cards    = cardsData?.data?.methods || [];

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
    queryClient.invalidateQueries({ queryKey: ["billing-payment-methods"] });
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
      <Group justify="space-between">
        <div>
          <Title order={3}>Billing &amp; Subscription</Title>
          <Text size="sm" c="dimmed">Manage your plan, invoices and payment methods</Text>
        </div>
        <Button
          leftSection={<IconTrendingUp size={16} />}
          loading={upgradeMutation.isPending}
          onClick={() => upgradeMutation.mutate(plan.plan || "Enterprise")}
        >
          Upgrade Plan
        </Button>
      </Group>

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
                <Button fullWidth justify="left" onClick={() => toast.show("Upgrade options coming soon", "info")}>
                  Upgrade to Custom Enterprise
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
                onClick={() => toast.show("Add card flow coming soon", "info")}
              >
                Add Payment Method
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
