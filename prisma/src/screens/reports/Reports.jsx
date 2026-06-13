import { useState } from "react";
import {
  Stack, Group, Text, Paper, Badge, Button, Select,
  SimpleGrid, Tabs, Table, ScrollArea,
} from "@mantine/core";
import {
  IconDownload, IconFilter, IconTrendingUp, IconUsers,
  IconClock, IconCalendar, IconPackage, IconFileText,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { AppStatCard }   from "../../components/ui/AppStatCard";
import { AppSection }    from "../../components/ui/AppSection";
import { useToast }      from "../../components/ui/Toast";

const DEPT_LIST  = ["All Departments","Engineering","HR","Finance","Sales","Design","Marketing"];
const DATE_RANGES = ["This Month","Last Month","Last 3 Months","This Year","Custom"];

const STATUS_COLOR = {
  Active: "green", Pending: "yellow", Suspended: "red",
  Approved: "green", Rejected: "red",
  Paid: "green", Hold: "red",
  "In Use": "blue", Available: "green", Maintenance: "yellow",
};

const EMP_ROWS = [
  { id:"EMP-001", name:"John Employee",  dept:"Engineering", status:"Active",    joined:"2022-07-01", salary:"₹65,000" },
  { id:"EMP-002", name:"Priya Sharma",   dept:"Design",      status:"Active",    joined:"2022-08-15", salary:"₹70,000" },
  { id:"EMP-003", name:"Arjun Kumar",    dept:"Engineering", status:"Pending",   joined:"2026-05-01", salary:"₹60,000" },
  { id:"EMP-004", name:"Safeer Ahmed",   dept:"Sales",       status:"Active",    joined:"2023-03-01", salary:"₹55,000" },
  { id:"EMP-005", name:"Mani Raj",       dept:"Marketing",   status:"Suspended", joined:"2023-01-20", salary:"₹52,000" },
  { id:"EMP-006", name:"Kavitha R",      dept:"HR",          status:"Active",    joined:"2023-11-01", salary:"₹68,000" },
  { id:"EMP-007", name:"Rajan Patel",    dept:"Finance",     status:"Active",    joined:"2021-04-10", salary:"₹75,000" },
  { id:"EMP-008", name:"Sneha Iyer",     dept:"Design",      status:"Active",    joined:"2024-01-15", salary:"₹62,000" },
];

const ATT_ROWS = [
  { id:"EMP-001", name:"John Employee",  dept:"Engineering", present:22, absent:1, late:2, leave:1, pct:91.7 },
  { id:"EMP-002", name:"Priya Sharma",   dept:"Design",      present:24, absent:0, late:1, leave:0, pct:100  },
  { id:"EMP-003", name:"Arjun Kumar",    dept:"Engineering", present:18, absent:3, late:3, leave:0, pct:75   },
  { id:"EMP-004", name:"Safeer Ahmed",   dept:"Sales",       present:23, absent:1, late:0, leave:2, pct:95.8 },
  { id:"EMP-005", name:"Mani Raj",       dept:"Marketing",   present:14, absent:8, late:5, leave:4, pct:58.3 },
  { id:"EMP-006", name:"Kavitha R",      dept:"HR",          present:25, absent:0, late:0, leave:1, pct:100  },
];

const LEAVE_ROWS = [
  { id:"LV-045", emp:"Priya Sharma",  type:"Annual",  from:"2026-06-15", to:"2026-06-17", days:3, status:"Approved" },
  { id:"LV-046", emp:"Arjun Kumar",   type:"Sick",    from:"2026-06-10", to:"2026-06-11", days:2, status:"Approved" },
  { id:"LV-047", emp:"Safeer Ahmed",  type:"Casual",  from:"2026-06-20", to:"2026-06-20", days:1, status:"Pending"  },
  { id:"LV-048", emp:"Mani Raj",      type:"Annual",  from:"2026-07-01", to:"2026-07-05", days:5, status:"Rejected" },
  { id:"LV-049", emp:"Rajan Patel",   type:"Earned",  from:"2026-06-25", to:"2026-06-26", days:2, status:"Approved" },
  { id:"LV-050", emp:"Sneha Iyer",    type:"Sick",    from:"2026-06-12", to:"2026-06-12", days:1, status:"Approved" },
];

const PAY_ROWS = [
  { id:"PAY-001", emp:"John Employee",  dept:"Engineering", gross:"₹65,000", deductions:"₹8,450", net:"₹56,550", status:"Paid"    },
  { id:"PAY-002", emp:"Priya Sharma",   dept:"Design",      gross:"₹70,000", deductions:"₹9,100", net:"₹60,900", status:"Paid"    },
  { id:"PAY-003", emp:"Arjun Kumar",    dept:"Engineering", gross:"₹60,000", deductions:"₹7,800", net:"₹52,200", status:"Pending" },
  { id:"PAY-004", emp:"Safeer Ahmed",   dept:"Sales",       gross:"₹55,000", deductions:"₹7,150", net:"₹47,850", status:"Paid"    },
  { id:"PAY-005", emp:"Mani Raj",       dept:"Marketing",   gross:"₹52,000", deductions:"₹6,760", net:"₹45,240", status:"Hold"    },
  { id:"PAY-006", emp:"Kavitha R",      dept:"HR",          gross:"₹68,000", deductions:"₹8,840", net:"₹59,160", status:"Paid"    },
  { id:"PAY-007", emp:"Rajan Patel",    dept:"Finance",     gross:"₹75,000", deductions:"₹9,750", net:"₹65,250", status:"Paid"    },
];

const ASSET_ROWS = [
  { id:"AST-001", name:"MacBook Pro 14\"", category:"Laptop",  assignedTo:"John Employee", dept:"Engineering", status:"In Use",      value:"₹1,20,000" },
  { id:"AST-002", name:"iPhone 14",        category:"Phone",   assignedTo:"Priya Sharma",  dept:"Design",      status:"In Use",      value:"₹75,000"   },
  { id:"AST-003", name:"Dell Monitor",     category:"Monitor", assignedTo:"Unassigned",    dept:"—",           status:"Available",   value:"₹18,000"   },
  { id:"AST-004", name:"MacBook Air",      category:"Laptop",  assignedTo:"Arjun Kumar",   dept:"Engineering", status:"In Use",      value:"₹95,000"   },
  { id:"AST-005", name:"HP Printer",       category:"Printer", assignedTo:"HR Dept",       dept:"HR",          status:"Maintenance", value:"₹22,000"   },
  { id:"AST-006", name:"iPad Pro",         category:"Tablet",  assignedTo:"Safeer Ahmed",  dept:"Sales",       status:"In Use",      value:"₹80,000"   },
];

const CHART_COLORS = {
  employee: "#2563eb", attendance: "#16a34a", leave: "#f59e0b", payroll: "#7c3aed", assets: "#0ea5e9",
};

const CHART_DATA = {
  employee:   [{ label:"Eng",  value:3 },{ label:"HR",  value:2 },{ label:"Fin", value:1 },{ label:"Sales",value:1 },{ label:"Des",value:1 }],
  attendance: [{ label:"Mon",  value:11},{ label:"Tue", value:12},{ label:"Wed", value:10},{ label:"Thu",  value:11},{ label:"Fri",value:9  }],
  leave:      [{ label:"Apr",  value:4 },{ label:"May", value:7 },{ label:"Jun", value:6 },{ label:"Jul",  value:3 }],
  payroll:    [{ label:"Feb",  value:465},{ label:"Mar",value:472},{ label:"Apr", value:468},{ label:"May",  value:485}],
  assets:     [{ label:"Laptop",value:2},{ label:"Phone",value:2},{ label:"Monitor",value:1},{ label:"Tablet",value:1}],
};

const SUMMARY = {
  employee:   [
    { label:"Total Employees", value:String(EMP_ROWS.length),                               color:"blue"   },
    { label:"Active",          value:String(EMP_ROWS.filter(r=>r.status==="Active").length), color:"green"  },
    { label:"Pending",         value:String(EMP_ROWS.filter(r=>r.status==="Pending").length),color:"yellow" },
    { label:"Suspended",       value:String(EMP_ROWS.filter(r=>r.status==="Suspended").length),color:"red" },
  ],
  attendance: [
    { label:"Avg Attendance",  value:"87.5%", color:"blue"   },
    { label:"Total Present",   value:"126",   color:"green"  },
    { label:"Absences",        value:"13",    color:"red"    },
    { label:"Late Arrivals",   value:"11",    color:"yellow" },
  ],
  leave: [
    { label:"Total Leaves", value:String(LEAVE_ROWS.length),                                  color:"blue"   },
    { label:"Approved",     value:String(LEAVE_ROWS.filter(r=>r.status==="Approved").length),  color:"green"  },
    { label:"Pending",      value:String(LEAVE_ROWS.filter(r=>r.status==="Pending").length),   color:"yellow" },
    { label:"Rejected",     value:String(LEAVE_ROWS.filter(r=>r.status==="Rejected").length),  color:"red"    },
  ],
  payroll: [
    { label:"Total Gross",  value:"₹4,45,000", color:"blue"   },
    { label:"Total Net",    value:"₹3,87,200", color:"green"  },
    { label:"Deductions",   value:"₹57,800",   color:"red"    },
    { label:"Pending",      value:String(PAY_ROWS.filter(r=>r.status!=="Paid").length), color:"yellow" },
  ],
  assets: [
    { label:"Total Assets", value:String(ASSET_ROWS.length),                                       color:"blue"   },
    { label:"In Use",       value:String(ASSET_ROWS.filter(r=>r.status==="In Use").length),         color:"green"  },
    { label:"Available",    value:String(ASSET_ROWS.filter(r=>r.status==="Available").length),      color:"cyan"   },
    { label:"Maintenance",  value:String(ASSET_ROWS.filter(r=>r.status==="Maintenance").length),    color:"yellow" },
  ],
};

export default function Reports() {
  const { show } = useToast();
  const [tab, setTab]     = useState("employee");
  const [dept, setDept]   = useState("All Departments");
  const [range, setRange] = useState("This Month");

  const exportReport = (fmt) => show(`Exporting ${tab} report as ${fmt}…`, "success");

  return (
    <Stack gap="lg">
      <AppPageHeader
        title="Reports"
        sub="Generate and export detailed HR reports"
        action={
          <Group gap="sm">
            <Button size="sm" leftSection={<IconDownload size={14} />} color="green" onClick={() => exportReport("Excel")}>
              Excel
            </Button>
            <Button size="sm" leftSection={<IconDownload size={14} />} onClick={() => exportReport("PDF")}>
              PDF
            </Button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {SUMMARY[tab].map(s => (
          <AppStatCard key={s.label} label={s.label} value={s.value} color={s.color} />
        ))}
      </SimpleGrid>

      <Group align="flex-start" grow gap="lg">
        {/* Chart */}
        <AppSection title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Overview`}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CHART_DATA[tab]} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
              <XAxis dataKey="label" tick={{ fill: "var(--mantine-color-gray-6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--mantine-color-gray-6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--mantine-color-gray-2)" }} />
              <Bar dataKey="value" fill={CHART_COLORS[tab]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AppSection>

        {/* Filters */}
        <Paper p="md" radius="lg" withBorder style={{ maxWidth: 260 }}>
          <Group gap={6} mb="md">
            <IconFilter size={14} color="var(--mantine-color-gray-6)" />
            <Text size="sm" fw={600}>Filters</Text>
          </Group>
          <Stack gap="sm">
            <Select
              label="Date Range"
              data={DATE_RANGES}
              value={range}
              onChange={v => setRange(v)}
              size="sm"
            />
            <Select
              label="Department"
              data={DEPT_LIST}
              value={dept}
              onChange={v => setDept(v)}
              size="sm"
            />
          </Stack>
          <Paper mt="md" p="xs" radius="md" bg="blue.0">
            <Text size="xs" c="blue.7" fw={500}>Showing: {dept} · {range}</Text>
          </Paper>
        </Paper>
      </Group>

      <Paper radius="lg" withBorder>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List px="md" pt="xs">
            <Tabs.Tab value="employee"   leftSection={<IconUsers size={14} />}>Employees</Tabs.Tab>
            <Tabs.Tab value="attendance" leftSection={<IconClock size={14} />}>Attendance</Tabs.Tab>
            <Tabs.Tab value="leave"      leftSection={<IconCalendar size={14} />}>Leave</Tabs.Tab>
            <Tabs.Tab value="payroll"    leftSection={<IconTrendingUp size={14} />}>Payroll</Tabs.Tab>
            <Tabs.Tab value="assets"     leftSection={<IconPackage size={14} />}>Assets</Tabs.Tab>
          </Tabs.List>

          {/* Employee */}
          <Tabs.Panel value="employee">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Emp ID","Name","Department","Status","Joined","Salary"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {EMP_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.joined}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.salary}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Attendance */}
          <Tabs.Panel value="attendance">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Emp ID","Name","Department","Present","Absent","Late","Leave","%"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ATT_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.present}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.absent}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.late}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.leave}</Text></Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={700} c={r.pct < 70 ? "red" : "green"}>{r.pct}%</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Leave */}
          <Tabs.Panel value="leave">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Leave ID","Employee","Type","From","To","Days","Status"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {LEAVE_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.emp}</Text></Table.Td>
                      <Table.Td><Badge variant="outline" color="gray" radius="sm" size="sm">{r.type}</Badge></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.from}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.to}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.days}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Payroll */}
          <Tabs.Panel value="payroll">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Pay ID","Employee","Department","Gross","Deductions","Net","Status"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {PAY_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.emp}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Text size="sm">{r.gross}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="red">{r.deductions}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600} c="green">{r.net}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          {/* Assets */}
          <Tabs.Panel value="assets">
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {["Asset ID","Name","Category","Assigned To","Department","Status","Value"].map(h => (
                      <Table.Th key={h}><Text size="xs" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ASSET_ROWS.map(r => (
                    <Table.Tr key={r.id}>
                      <Table.Td><Text size="xs" c="dimmed" ff="monospace">{r.id}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.name}</Text></Table.Td>
                      <Table.Td><Badge variant="outline" color="gray" radius="sm" size="sm">{r.category}</Badge></Table.Td>
                      <Table.Td><Text size="sm">{r.assignedTo}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{r.dept}</Text></Table.Td>
                      <Table.Td><Badge color={STATUS_COLOR[r.status]} variant="light" radius="xl" size="sm">{r.status}</Badge></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{r.value}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            <Group p="md" justify="flex-end" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
              <Button size="xs" variant="outline" leftSection={<IconDownload size={12} />} onClick={() => exportReport("Excel")}>Export Excel</Button>
              <Button size="xs" variant="outline" leftSection={<IconDownload size={12} />} onClick={() => exportReport("PDF")}>Export PDF</Button>
            </Group>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
