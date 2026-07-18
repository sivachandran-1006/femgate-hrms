import { useState } from "react";
import {
  Stack, Group, Text, Badge, Button, Paper, Modal, TextInput, Textarea,
  Select, NumberInput, SimpleGrid, ScrollArea, Center, Loader, Tabs,
  ThemeIcon, ActionIcon, Tooltip,
} from "@mantine/core";
import {
  IconBuildingStore, IconPlus, IconSearch, IconDownload, IconTrash,
  IconStar, IconCheck, IconPackage,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppEmptyState } from "../../components/ui/AppEmptyState";

const MOCK_APPS = [
  { id:1, name:"Slack Notifications",  slug:"slack",    category:"Integration", developer:"Slack Inc",    installs:142, rating:4.8, pricingModel:"Free",  price:0,    status:"Active" },
  { id:2, name:"Razorpay Billing",     slug:"razorpay", category:"Payroll",     developer:"Razorpay",     installs:98,  rating:4.6, pricingModel:"Free",  price:0,    status:"Active" },
  { id:3, name:"GST Compliance",       slug:"gst",      category:"Compliance",  developer:"ClearTax",     installs:67,  rating:4.4, pricingModel:"Paid",  price:2999, status:"Active" },
  { id:4, name:"Power BI Connector",   slug:"powerbi",  category:"Analytics",   developer:"Microsoft",    installs:54,  rating:4.5, pricingModel:"Free",  price:0,    status:"Active" },
  { id:5, name:"DocuSign",             slug:"docusign", category:"HRMS",        developer:"DocuSign Inc", installs:31,  rating:4.3, pricingModel:"Usage", price:0,    status:"Active" },
  { id:6, name:"Zoom Interviews",      slug:"zoom",     category:"HRMS",        developer:"Zoom",         installs:88,  rating:4.7, pricingModel:"Free",  price:0,    status:"Active" },
  { id:7, name:"QuickBooks Sync",      slug:"qbooks",   category:"Payroll",     developer:"Intuit",       installs:22,  rating:4.1, pricingModel:"Paid",  price:1499, status:"Active" },
  { id:8, name:"Jira Integration",     slug:"jira",     category:"Productivity",developer:"Atlassian",    installs:45,  rating:4.4, pricingModel:"Free",  price:0,    status:"Active" },
];

const CATS = ["All","HRMS","Payroll","Compliance","Integration","Analytics","Productivity"];
const PRICE_COLOR = { Free:"green", Paid:"orange", Usage:"blue" };
const CAT_COLOR   = { HRMS:"blue", Payroll:"green", Compliance:"red", Integration:"violet", Analytics:"cyan", Productivity:"orange" };

const BLANK = { name:"", slug:"", category:"Integration", description:"", developer:"", pricingModel:"Free", price:0 };

export default function Marketplace() {
  const { user } = useAuth();
  const toast    = useToast();
  const isSA     = ["SUPER_ADMIN"].includes(user?.role);

  const { data: rawApps = [],     isLoading, refetch } = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const { data: installedRaw = []                     } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const installApp   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const uninstallApp = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createApp    = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };

  const apps      = rawApps.length ? rawApps : MOCK_APPS;
  const installed = installedRaw.map ? installedRaw.map(i => i.appId ?? i.app?.id ?? i.id) : [];

  const [tab, setTab]           = useState("browse");
  const [cat, setCat]           = useState("All");
  const [search, setSearch]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]         = useState(BLANK);

  const filtered = apps.filter(a =>
    (cat === "All" || a.category === cat) &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const isInstalled = (id) => installed.includes(id);

  const handleInstall = async (app) => {
    try {
      if (isInstalled(app.id)) {
        await uninstallApp.mutateAsync(app.id);
        toast.show(`${app.name} uninstalled`, "info");
      } else {
        await installApp.mutateAsync(app.id);
        toast.show(`${app.name} installed`, "success");
      }
    } catch { toast.show("Action failed", "error"); }
  };

  const handleCreate = async () => {
    try {
      await createApp.mutateAsync(form);
      toast.show("App published to marketplace", "success");
      setShowCreate(false); setForm(BLANK);
    } catch { toast.show("Failed to publish", "error"); }
  };

  const Stars = ({ rating }) => (
    <Group gap={2}>
      <IconStar size={11} fill="#f59e0b" color="#f59e0b" />
      <Text size="xs" fw={600}>{rating}</Text>
    </Group>
  );

  const AppCard = ({ app }) => (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="sm" align="flex-start">
        <ThemeIcon size={42} radius={12} variant="light" color={CAT_COLOR[app.category] || "blue"}>
          <Text fw={800} size="sm">{app.name.slice(0,2).toUpperCase()}</Text>
        </ThemeIcon>
        <Badge size="xs" color={PRICE_COLOR[app.pricingModel]} variant="light">
          {app.pricingModel === "Paid" ? `₹${app.price.toLocaleString("en-IN")}/mo` : app.pricingModel}
        </Badge>
      </Group>
      <Text fw={700} size="sm" mb={2}>{app.name}</Text>
      <Text size="xs" c="dimmed" mb={4}>{app.developer}</Text>
      <Badge size="xs" color={CAT_COLOR[app.category]} variant="dot" mb="sm">{app.category}</Badge>
      <Group justify="space-between" mb="md">
        <Stars rating={app.rating} />
        <Text size="xs" c="dimmed">{app.installs} installs</Text>
      </Group>
      <Button size="xs" fullWidth
        variant={isInstalled(app.id) ? "light" : "filled"}
        color={isInstalled(app.id) ? "gray" : "blue"}
        leftSection={isInstalled(app.id) ? <IconCheck size={12} /> : <IconDownload size={12} />}
        onClick={() => handleInstall(app)}
        loading={installApp.isPending || uninstallApp.isPending}>
        {isInstalled(app.id) ? "Installed" : "Install"}
      </Button>
    </Paper>
  );

  return (
    <Stack p="lg" gap="lg">
      <AppPageHeader
        title="Marketplace"
        sub="Browse and install integrations and add-ons"
        action={isSA && <Button leftSection={<IconPlus size={14} />} onClick={() => setShowCreate(true)}>Publish App</Button>}
        onRefresh={refetch}
      />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="browse" leftSection={<IconBuildingStore size={14} />}>Browse</Tabs.Tab>
          <Tabs.Tab value="installed" leftSection={<IconPackage size={14} />}>Installed ({installed.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="browse">
          <Stack gap="md">
            <Group gap="sm" wrap="wrap">
              <TextInput placeholder="Search apps…" leftSection={<IconSearch size={14} />}
                value={search} onChange={e => setSearch(e.currentTarget.value)} maw={260} radius="md" />
              <Group gap="xs">
                {CATS.map(c => (
                  <Button key={c} size="xs" variant={cat === c ? "filled" : "default"} onClick={() => setCat(c)}>{c}</Button>
                ))}
              </Group>
            </Group>
            {isLoading ? <Center h={200}><Loader /></Center> :
              filtered.length === 0 ? <AppEmptyState icon={<IconBuildingStore size={22} />} message="No apps found" sub="Try a different category or search term." /> :
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
                {filtered.map(a => <AppCard key={a.id} app={a} />)}
              </SimpleGrid>
            }
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="installed">
          {installed.length === 0 ? (
            <AppEmptyState icon={<IconPackage size={22} />} message="No apps installed" sub="Browse the marketplace to install integrations." />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {apps.filter(a => isInstalled(a.id)).map(a => <AppCard key={a.id} app={a} />)}
            </SimpleGrid>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Publish New App" size="md" radius="lg">
        <Stack gap="sm">
          <Group grow>
            <TextInput label="App Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} radius="md" />
            <TextInput label="Slug" placeholder="app-slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} radius="md" />
          </Group>
          <Select label="Category" data={CATS.slice(1)} value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} radius="md" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} minRows={2} radius="md" />
          <TextInput label="Developer" value={form.developer} onChange={e => setForm(f => ({ ...f, developer: e.target.value }))} radius="md" />
          <Group grow>
            <Select label="Pricing" data={["Free","Paid","Usage"]} value={form.pricingModel} onChange={v => setForm(f => ({ ...f, pricingModel: v }))} radius="md" />
            {form.pricingModel === "Paid" && <NumberInput label="Price (₹/mo)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} min={0} radius="md" />}
          </Group>
          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createApp.isPending}>Publish</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
