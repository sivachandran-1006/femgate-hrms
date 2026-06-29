import { useState, useMemo } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, Table, Modal, Select,
  TextInput, NumberInput, ActionIcon, Tooltip, SimpleGrid, ScrollArea,
  Center, Loader,
} from "@mantine/core";
import {
  IconReceipt2, IconSearch, IconPencil, IconX, IconRefresh,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";
import {
  useSubscriptions, useSubDashboard, useUpdateSub, useCancelSub, useReactivateSub,
} from "../../queries/usePlatform";

const MOCK_SUBS = [
  { id:1, companyId:1, company:{ name:"Mgate Technologies" }, plan:"Enterprise", status:"Active",    billingCycle:"Monthly", mrr:45000, renewalDate:"2026-07-01", discountPct:10 },
  { id:2, companyId:2, company:{ name:"Nexgen Solutions"   }, plan:"Pro",        status:"Active",    billingCycle:"Yearly",  mrr:28000, renewalDate:"2027-01-01", discountPct:0  },
  { id:3, companyId:3, company:{ name:"Infospark Pvt Ltd"  }, plan:"Starter",    status:"Trial",     billingCycle:"Monthly", mrr:0,     renewalDate:"2026-07-15", discountPct:0  },
  { id:4, companyId:4, company:{ name:"Brightwave Corp"    }, plan:"Pro",        status:"Active",    billingCycle:"Monthly", mrr:28000, renewalDate:"2026-07-05", discountPct:5  },
  { id:5, companyId:5, company:{ name:"Zenith Retail"      }, plan:"Starter",    status:"Suspended", billingCycle:"Monthly", mrr:0,     renewalDate:"2026-06-01", discountPct:0  },
  { id:6, companyId:6, company:{ name:"CloudBase Inc"      }, plan:"Enterprise", status:"Active",    billingCycle:"Yearly",  mrr:45000, renewalDate:"2027-03-01", discountPct:20 },
];

const STATUS_COLOR = {
  Active:    "green",
  Trial:     "blue",
  Suspended: "orange",
  Cancelled: "red",
  Expired:   "gray",
};

const PLAN_COLOR = {
  Starter:    "teal",
  Pro:        "violet",
  Enterprise: "indigo",
};

function fmt(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN").format(n);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function renewalDueThisWeek(subs) {
  const now   = new Date();
  const week  = new Date(now.getTime() + 7 * 86400 * 1000);
  return subs.filter(s => {
    if (!s.renewalDate) return false;
    const rd = new Date(s.renewalDate);
    return rd >= now && rd <= week;
  }).length;
}

const BLANK_FORM = {
  plan:          "Pro",
  status:        "Active",
  billingCycle:  "Monthly",
  discountCode:  "",
  discountPct:   0,
  trialEndsAt:   "",
  renewalDate:   "",
};

export default function SubscriptionEngine() {
  const { user } = useAuth();
  const toast    = useToast();
  const isSA     = ["SUPER_ADMIN"].includes(user?.role);

  const { data: rawSubs, isLoading, refetch } = useSubscriptions();
  const { data: dash }                        = useSubDashboard();
  const updateSub     = useUpdateSub();
  const cancelSub     = useCancelSub();
  const reactivateSub = useReactivateSub();

  const allSubs = useMemo(() => {
    const list = rawSubs?.subscriptions ?? rawSubs ?? [];
    return list.length ? list : MOCK_SUBS;
  }, [rawSubs]);

  // Filters
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlan,   setFilterPlan]   = useState("");

  const filtered = useMemo(() => allSubs.filter(s => {
    const matchSearch = !search || s.company?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchPlan   = !filterPlan   || s.plan   === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  }), [allSubs, search, filterStatus, filterPlan]);

  // Dashboard stats
  const active    = dash?.active    ?? allSubs.filter(s => s.status === "Active").length;
  const trial     = dash?.trial     ?? allSubs.filter(s => s.status === "Trial").length;
  const suspended = dash?.suspended ?? allSubs.filter(s => s.status === "Suspended").length;
  const cancelled = dash?.cancelled ?? allSubs.filter(s => s.status === "Cancelled").length;
  const mrr       = dash?.mrr       ?? allSubs.reduce((sum, s) => sum + (s.mrr ?? 0), 0);
  const arr       = dash?.arr       ?? mrr * 12;
  const dueWeek   = dash?.renewalsDueThisWeek ?? renewalDueThisWeek(allSubs);

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(BLANK_FORM);

  const openEdit = (sub) => {
    setEditing(sub);
    setForm({
      plan:         sub.plan         ?? "Pro",
      status:       sub.status       ?? "Active",
      billingCycle: sub.billingCycle ?? "Monthly",
      discountCode: sub.discountCode ?? "",
      discountPct:  sub.discountPct  ?? 0,
      trialEndsAt:  sub.trialEndsAt  ? sub.trialEndsAt.slice(0, 10)  : "",
      renewalDate:  sub.renewalDate  ? sub.renewalDate.slice(0, 10)  : "",
    });
  };

  const handleSave = async () => {
    try {
      await updateSub.mutateAsync({ cid: editing.companyId, ...form });
      toast.show("Subscription updated", "success");
      setEditing(null);
    } catch {
      toast.show("Failed to update subscription", "error");
    }
  };

  const handleCancel = async (sub) => {
    try {
      await cancelSub.mutateAsync(sub.companyId);
      toast.show(`Subscription for ${sub.company?.name} cancelled`, "warning");
    } catch {
      toast.show("Failed to cancel subscription", "error");
    }
  };

  const handleReactivate = async (sub) => {
    try {
      await reactivateSub.mutateAsync(sub.companyId);
      toast.show(`Subscription for ${sub.company?.name} reactivated`, "success");
    } catch {
      toast.show("Failed to reactivate subscription", "error");
    }
  };

  if (!isSA) {
    return (
      <AppEmptyState
        icon={<IconReceipt2 size={22} />}
        message="Access Restricted"
        sub="This page is only accessible to Super Admins."
      />
    );
  }

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Subscription Engine"
        sub="Manage all tenant subscriptions, plans, and renewals"
        onRefresh={refetch}
      />

      {/* Dashboard cards */}
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} spacing="md">
        {[
          { label: "Active",        value: active,    color: "green"  },
          { label: "Trial",         value: trial,     color: "blue"   },
          { label: "Suspended",     value: suspended, color: "orange" },
          { label: "Cancelled",     value: cancelled, color: "red"    },
          { label: "MRR (₹)",       value: `₹${fmt(mrr)}`,  color: "teal"   },
          { label: "ARR (₹)",       value: `₹${fmt(arr)}`,  color: "violet" },
          { label: "Renewals / 7d", value: dueWeek,   color: "yellow" },
        ].map(s => (
          <Paper key={s.label} withBorder p="md" radius="lg">
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" lh={1.3}>{s.label}</Text>
            <Text fw={800} size="lg" c={s.color} style={{ fontVariantNumeric:"tabular-nums" }}>
              {s.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Filters */}
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search by company…"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          maw={260}
          radius="md"
        />
        <Select
          placeholder="All statuses"
          value={filterStatus}
          onChange={v => setFilterStatus(v ?? "")}
          data={["Active", "Trial", "Suspended", "Cancelled", "Expired"]}
          clearable
          maw={160}
          radius="md"
        />
        <Select
          placeholder="All plans"
          value={filterPlan}
          onChange={v => setFilterPlan(v ?? "")}
          data={["Starter", "Pro", "Enterprise"]}
          clearable
          maw={160}
          radius="md"
        />
      </Group>

      {/* Table */}
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Company</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Billing Cycle</Table.Th>
                <Table.Th style={{ textAlign:"right" }}>MRR (₹)</Table.Th>
                <Table.Th>Renewal Date</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Center py="xl"><Loader size="sm" /></Center>
                  </Table.Td>
                </Table.Tr>
              ) : filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <AppEmptyState
                      icon={<IconReceipt2 size={20} />}
                      message="No subscriptions found"
                      sub="Try adjusting your filters."
                    />
                  </Table.Td>
                </Table.Tr>
              ) : filtered.map(sub => (
                <Table.Tr key={sub.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>{sub.company?.name ?? "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={PLAN_COLOR[sub.plan] ?? "gray"}>
                      {sub.plan}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={STATUS_COLOR[sub.status] ?? "gray"}>
                      {sub.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{sub.billingCycle}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign:"right" }}>
                    <Text size="sm" fw={600} style={{ fontVariantNumeric:"tabular-nums" }}>
                      {sub.mrr ? `₹${fmt(sub.mrr)}` : <Text component="span" c="dimmed" size="sm">—</Text>}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{fmtDate(sub.renewalDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {sub.discountPct > 0
                      ? <Badge size="xs" variant="outline" color="yellow">{sub.discountPct}% off</Badge>
                      : <Text size="xs" c="dimmed">—</Text>
                    }
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="Edit Plan">
                        <ActionIcon size="sm" variant="subtle" onClick={() => openEdit(sub)}>
                          <IconPencil size={13} />
                        </ActionIcon>
                      </Tooltip>
                      {sub.status !== "Cancelled" && sub.status !== "Expired" && (
                        <Tooltip label="Cancel">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => handleCancel(sub)}
                            loading={cancelSub.isPending}
                          >
                            <IconX size={13} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {(sub.status === "Cancelled" || sub.status === "Suspended" || sub.status === "Expired") && (
                        <Tooltip label="Reactivate">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="green"
                            onClick={() => handleReactivate(sub)}
                            loading={reactivateSub.isPending}
                          >
                            <IconRefresh size={13} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Edit Plan Modal */}
      <Modal
        opened={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit Subscription — ${editing?.company?.name ?? ""}`}
        size="md"
        radius="lg"
      >
        <Stack gap="sm">
          <Select
            label="Plan"
            value={form.plan}
            onChange={v => setForm(f => ({ ...f, plan: v }))}
            data={["Starter", "Pro", "Enterprise"]}
            radius="md"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={v => setForm(f => ({ ...f, status: v }))}
            data={["Active", "Trial", "Suspended", "Cancelled", "Expired"]}
            radius="md"
          />
          <Select
            label="Billing Cycle"
            value={form.billingCycle}
            onChange={v => setForm(f => ({ ...f, billingCycle: v }))}
            data={["Monthly", "Yearly"]}
            radius="md"
          />
          <TextInput
            label="Discount Code"
            placeholder="SAVE20"
            value={form.discountCode}
            onChange={e => setForm(f => ({ ...f, discountCode: e.target.value }))}
            radius="md"
          />
          <NumberInput
            label="Discount %"
            value={form.discountPct}
            onChange={v => setForm(f => ({ ...f, discountPct: v }))}
            min={0}
            max={100}
            radius="md"
          />
          <TextInput
            label="Trial Ends At"
            type="date"
            value={form.trialEndsAt}
            onChange={e => setForm(f => ({ ...f, trialEndsAt: e.target.value }))}
            radius="md"
          />
          <TextInput
            label="Renewal Date"
            type="date"
            value={form.renewalDate}
            onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))}
            radius="md"
          />
          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={updateSub.isPending}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
