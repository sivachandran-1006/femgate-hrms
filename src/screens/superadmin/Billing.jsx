import { useState } from "react";
import {
  Stack, Group, Text, Title, Paper, Badge, Button, Tabs,
  SimpleGrid, Progress, Table, ActionIcon, Notification,
} from "@mantine/core";
import {
  IconDownload, IconCreditCard, IconCheck, IconPlus, IconTrendingUp,
} from "@tabler/icons-react";

const INVOICES = [
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: "₹45,000", status: "Paid" },
  { id: "INV-2026-005", date: "May 1, 2026", amount: "₹45,000", status: "Paid" },
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "₹42,000", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "₹42,000", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "₹38,000", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "₹38,000", status: "Paid" },
];

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

const PAYMENT_METHODS = [
  { id: 1, type: "Visa", last4: "4242", expiry: "12/27", primary: true },
  { id: 2, type: "Mastercard", last4: "8888", expiry: "08/26", primary: false },
];

const USAGE_BARS = [
  { label: "User Seats",          used: 12,   total: 50,    unit: "",    color: "blue" },
  { label: "Storage",             used: 30.5, total: 50,    unit: " GB", color: "violet" },
  { label: "API Calls Today",     used: 2847, total: 10000, unit: "",    color: "cyan" },
  { label: "Active Integrations", used: 4,    total: 20,    unit: "",    color: "green" },
];

const STATS = [
  { label: "Monthly Cost",  value: "₹45,000", sub: "Enterprise plan" },
  { label: "Users",         value: "12/50",   sub: "seats used" },
  { label: "Storage Used",  value: "61%",     sub: "30.5 GB of 50 GB" },
  { label: "Next Invoice",  value: "Aug 1",   sub: "auto-renews" },
];

export default function Billing() {
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [cards, setCards] = useState(PAYMENT_METHODS);

  const showToast = (msg, color = "green") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetPrimary = (id) => {
    setCards(cards.map((c) => ({ ...c, primary: c.id === id })));
    showToast("Primary payment method updated");
  };

  return (
    <Stack p="lg" gap="lg" style={{ minHeight: "100vh" }}>
      {toast && (
        <Notification
          color={toast.color}
          onClose={() => setToast(null)}
          style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, minWidth: 260 }}
        >
          {toast.msg}
        </Notification>
      )}

      <Group justify="space-between">
        <div>
          <Title order={3}>Billing &amp; Subscription</Title>
          <Text size="sm" c="dimmed">Manage your plan, invoices and payment methods</Text>
        </div>
        <Button leftSection={<IconTrendingUp size={16} />} onClick={() => showToast("Opening upgrade plan page...")}>
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
              <Text size="xl" fw={700} c="white">Enterprise Plan</Text>
              <Badge color="green" variant="filled">Active</Badge>
            </Group>
            <Text size="sm" c="white" opacity={0.85}>50 user seats included</Text>
            <Text size="xs" c="white" opacity={0.7}>Renews August 1, 2026 — auto-renewal enabled</Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Text size="xl" fw={700} c="white">₹45,000</Text>
            <Text size="sm" c="white" opacity={0.8}>per month</Text>
          </div>
        </Group>
      </Paper>

      <SimpleGrid cols={4}>
        {STATS.map((s) => (
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
                {PLAN_FEATURES.map((feat) => (
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
                <Button fullWidth justify="left" onClick={() => showToast("Upgrade options coming soon")}>
                  Upgrade to Custom Enterprise
                </Button>
                <Button fullWidth justify="left" variant="default" onClick={() => showToast("Downgrade confirmation required")}>
                  Downgrade Plan
                </Button>
                <Button fullWidth justify="left" variant="outline" color="red" onClick={() => showToast("Cancellation request initiated")}>
                  Cancel Subscription
                </Button>
                <Paper withBorder p="sm" radius="md" bg="gray.0">
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Billing Contact</Text>
                  <Text size="sm">superadmin@mgatesystems.com</Text>
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
                {INVOICES.map((inv) => (
                  <Table.Tr key={inv.id}>
                    <Table.Td c="dimmed">{inv.date}</Table.Td>
                    <Table.Td fw={500}>{inv.id}</Table.Td>
                    <Table.Td fw={600}>{inv.amount}</Table.Td>
                    <Table.Td>
                      <Badge color="green" variant="light">{inv.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon variant="default" size="sm" onClick={() => showToast(`Downloading ${inv.id}...`)}>
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
              {USAGE_BARS.map((u) => {
                const pct = Math.round((u.used / u.total) * 100);
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
              {cards.map((card) => (
                <Paper
                  key={card.id} withBorder p="md" radius="md"
                  style={{ borderColor: card.primary ? "var(--mantine-color-blue-5)" : undefined }}
                >
                  <Group justify="space-between">
                    <Group gap="md">
                      <IconCreditCard size={20} color={card.primary ? "var(--mantine-color-blue-6)" : undefined} />
                      <div>
                        <Text size="sm" fw={500}>{card.type} ending in {card.last4}</Text>
                        <Text size="xs" c="dimmed">Expires {card.expiry}</Text>
                      </div>
                      {card.primary && <Badge variant="light">Primary</Badge>}
                    </Group>
                    {!card.primary && (
                      <Button size="xs" variant="default" onClick={() => handleSetPrimary(card.id)}>
                        Set Primary
                      </Button>
                    )}
                  </Group>
                </Paper>
              ))}
              <Button
                variant="default"
                leftSection={<IconPlus size={16} />}
                fullWidth
                style={{ borderStyle: "dashed" }}
                onClick={() => showToast("Add card flow coming soon")}
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
