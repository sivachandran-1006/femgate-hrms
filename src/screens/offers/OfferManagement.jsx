import { useState } from "react";
import {
  IconFileCheck as FileCheck,
  IconSend as Send,
  IconCircleCheck as CheckCircle,
  IconClockHour4 as Clock,
  IconPlus as Plus,
  IconEye as Eye,
} from "@tabler/icons-react";
import {
  Group, Stack, Text, Badge, ScrollArea, Table, Tabs, Select,
  TextInput, NumberInput, Textarea, Box,
} from "@mantine/core";

import { AppPageHeader }  from "../../components/ui/AppPageHeader";
import { AppStatCard }    from "../../components/ui/AppStatCard";
import { AppSection }     from "../../components/ui/AppSection";
import { AppEmptyState }  from "../../components/ui/AppEmptyState";
import { AppButton }      from "../../components/ui/AppButton";
import { AppModal }       from "../../components/ui/AppModal";
import { useToast }       from "../../components/ui/Toast";

const STATUS_COLOR = {
  Draft: "gray", "Pending Approval": "yellow", Approved: "blue", Released: "cyan",
  Negotiating: "orange", Accepted: "green", Declined: "red", Expired: "gray", Withdrawn: "red",
};

const TABS = ["All", "Draft", "Pending Approval", "Approved", "Released", "Negotiating", "Accepted", "Declined"];

const EMPTY_FORM = { candidateName: "", position: "", department: "", ctc: "", joiningDate: "", expiryDate: "" };

export default function OfferManagement() {
  const [tab, setTab]             = useState("All");
  const [showNew, setShowNew]     = useState(false);
  const [viewOffer, setViewOffer] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [declineReason, setDeclineReason] = useState("");
  const [negotiateNotes, setNegotiateNotes] = useState("");
  const [revisedCtc, setRevisedCtc] = useState("");

  const { show } = useToast();
  const { data: offers = [], isLoading } = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const createMut    = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const approveMut   = { mutateAsync: async () => {}, isPending: false, mutate: () => {} };
  const releaseMut   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const acceptMut    = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const declineMut   = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const negotiateMut = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };
  const withdrawMut  = { data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} };

  const counts = {
    pending:   offers.filter((o) => o.status === "Pending Approval").length,
    released:  offers.filter((o) => o.status === "Released").length,
    accepted:  offers.filter((o) => o.status === "Accepted").length,
    negotiating: offers.filter((o) => o.status === "Negotiating").length,
  };

  const handleCreate = async () => {
    if (!form.candidateName.trim() || !form.position.trim()) return show("Candidate name and position are required", "error");
    try {
      await createMut.mutateAsync({ ...form, ctc: Number(form.ctc) || 0 });
      show("Offer created", "success");
      setForm(EMPTY_FORM);
      setShowNew(false);
    } catch {
      show("Failed to create offer", "error");
    }
  };

  const act = (mutation, id, successMsg, extra) => async () => {
    try {
      await mutation.mutateAsync(extra ? { id, ...extra } : id);
      show(successMsg, "success");
      setViewOffer(null);
    } catch {
      show("Action failed", "error");
    }
  };

  return (
    <>
      <AppPageHeader
        title="Offer Management"
        sub="Approve, release, and track candidate offers through to acceptance"
        action={
          <AppButton leftSection={<Plus size={16} />} onClick={() => setShowNew(true)}>
            New Offer
          </AppButton>
        }
      />

      <Group grow mb="lg">
        <AppStatCard icon={<Clock size={22} />}       label="Pending Approval" value={counts.pending}     color="yellow" />
        <AppStatCard icon={<Send size={22} />}        label="Released"        value={counts.released}    color="cyan" />
        <AppStatCard icon={<FileCheck size={22} />}   label="Negotiating"     value={counts.negotiating} color="orange" />
        <AppStatCard icon={<CheckCircle size={22} />} label="Accepted"        value={counts.accepted}    color="green" />
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="lg">
          {TABS.map((t) => <Tabs.Tab key={t} value={t}>{t}</Tabs.Tab>)}
        </Tabs.List>

        <Tabs.Panel value={tab}>
          <AppSection noPadding title={`Offers (${offers.length})`}>
            {isLoading ? null : offers.length === 0 ? (
              <AppEmptyState
                icon={<FileCheck size={24} />}
                message="No offers found"
                sub="Create an offer to get started."
                action={<AppButton leftSection={<Plus size={14} />} onClick={() => setShowNew(true)}>New Offer</AppButton>}
              />
            ) : (
              <ScrollArea>
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      {["Offer ID", "Candidate", "Position", "CTC", "Status", "Expiry", ""].map((h) => (
                        <Table.Th key={h}>
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</Text>
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {offers.map((o) => (
                      <Table.Tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setViewOffer(o)}>
                        <Table.Td><Text size="sm" fw={600}>{o.offerId}</Text></Table.Td>
                        <Table.Td><Text size="sm">{o.candidateName}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{o.position}</Text></Table.Td>
                        <Table.Td><Text size="sm">₹{Number(o.ctc).toLocaleString("en-IN")}</Text></Table.Td>
                        <Table.Td><Badge color={STATUS_COLOR[o.status] || "gray"} variant="light" radius="xl" size="sm">{o.status}</Badge></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{o.expiryDate ? new Date(o.expiryDate).toLocaleDateString("en-IN") : "—"}</Text></Table.Td>
                        <Table.Td>
                          <AppButton size="xs" variant="subtle" leftSection={<Eye size={13} />} onClick={(e) => { e.stopPropagation(); setViewOffer(o); }}>
                            View
                          </AppButton>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </AppSection>
        </Tabs.Panel>
      </Tabs>

      {/* New Offer Modal */}
      <AppModal opened={showNew} onClose={() => setShowNew(false)} title="New Offer" icon={<FileCheck size={18} />} size="md">
        <Stack gap="sm">
          <TextInput label="Candidate Name" required value={form.candidateName} onChange={(e) => setForm((f) => ({ ...f, candidateName: e.target.value }))} />
          <TextInput label="Position" required value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
          <TextInput label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
          <NumberInput label="CTC (Annual)" min={0} value={form.ctc} onChange={(v) => setForm((f) => ({ ...f, ctc: v }))} />
          <Group grow>
            <TextInput type="date" label="Joining Date" value={form.joiningDate} onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))} />
            <TextInput type="date" label="Offer Expiry" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
          </Group>
          <Group justify="flex-end" mt="sm">
            <AppButton variant="default" onClick={() => setShowNew(false)}>Cancel</AppButton>
            <AppButton onClick={handleCreate} loading={createMut.isPending}>Create Offer</AppButton>
          </Group>
        </Stack>
      </AppModal>

      {/* Offer Detail / Actions Modal */}
      <AppModal opened={!!viewOffer} onClose={() => setViewOffer(null)} title={viewOffer?.offerId} icon={<FileCheck size={18} />} size="md">
        {viewOffer && (
          <Stack gap="md">
            <Group justify="space-between">
              <Box>
                <Text fw={700}>{viewOffer.candidateName}</Text>
                <Text size="sm" c="dimmed">{viewOffer.position}{viewOffer.department ? ` · ${viewOffer.department}` : ""}</Text>
              </Box>
              <Badge color={STATUS_COLOR[viewOffer.status] || "gray"} variant="light" size="lg">{viewOffer.status}</Badge>
            </Group>

            <Group grow>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>CTC</Text>
                <Text fw={600}>₹{Number(viewOffer.ctc).toLocaleString("en-IN")}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Joining Date</Text>
                <Text fw={600}>{viewOffer.joiningDate ? new Date(viewOffer.joiningDate).toLocaleDateString("en-IN") : "—"}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Expiry</Text>
                <Text fw={600}>{viewOffer.expiryDate ? new Date(viewOffer.expiryDate).toLocaleDateString("en-IN") : "—"}</Text>
              </Box>
            </Group>

            {viewOffer.negotiationNotes && (
              <Box p="sm" style={{ background: "var(--mantine-color-orange-0)", borderRadius: 8 }}>
                <Text size="xs" fw={600} c="orange">Negotiation Notes</Text>
                <Text size="sm">{viewOffer.negotiationNotes}</Text>
                {viewOffer.revisedCtc && <Text size="sm" fw={600} mt={4}>Revised CTC: ₹{Number(viewOffer.revisedCtc).toLocaleString("en-IN")}</Text>}
              </Box>
            )}

            {viewOffer.declinedReason && (
              <Box p="sm" style={{ background: "var(--mantine-color-red-0)", borderRadius: 8 }}>
                <Text size="xs" fw={600} c="red">Decline Reason</Text>
                <Text size="sm">{viewOffer.declinedReason}</Text>
              </Box>
            )}

            {/* Status-specific actions */}
            {viewOffer.status === "Draft" && (
              <Group justify="flex-end">
                <AppButton onClick={act(approveMut, viewOffer.id, "Offer approved")} loading={approveMut.isPending}>Approve</AppButton>
              </Group>
            )}

            {viewOffer.status === "Approved" && (
              <Group justify="flex-end">
                <AppButton onClick={act(releaseMut, viewOffer.id, "Offer released")} loading={releaseMut.isPending}>Release to Candidate</AppButton>
              </Group>
            )}

            {(viewOffer.status === "Released" || viewOffer.status === "Negotiating") && (
              <Stack gap="sm">
                <Textarea
                  label="Negotiation notes (optional)"
                  placeholder="Candidate requested revised terms..."
                  minRows={2}
                  value={negotiateNotes}
                  onChange={(e) => setNegotiateNotes(e.target.value)}
                />
                <NumberInput label="Revised CTC (optional)" min={0} value={revisedCtc} onChange={setRevisedCtc} />
                <Textarea
                  label="Decline reason (optional)"
                  placeholder="If declining, note the reason..."
                  minRows={2}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
                <Group justify="flex-end">
                  <AppButton
                    variant="default"
                    onClick={act(negotiateMut, viewOffer.id, "Negotiation recorded", { notes: negotiateNotes, revisedCtc })}
                    loading={negotiateMut.isPending}
                  >
                    Record Negotiation
                  </AppButton>
                  <AppButton
                    color="red"
                    variant="light"
                    onClick={act(declineMut, viewOffer.id, "Offer declined", { reason: declineReason })}
                    loading={declineMut.isPending}
                  >
                    Decline
                  </AppButton>
                  <AppButton onClick={act(acceptMut, viewOffer.id, "Offer accepted")} loading={acceptMut.isPending}>
                    Accept
                  </AppButton>
                </Group>
              </Stack>
            )}

            {!["Accepted", "Declined", "Expired", "Withdrawn"].includes(viewOffer.status) && (
              <Group justify="flex-end" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                <AppButton variant="subtle" color="red" size="xs" onClick={act(withdrawMut, viewOffer.id, "Offer withdrawn")} loading={withdrawMut.isPending}>
                  Withdraw Offer
                </AppButton>
              </Group>
            )}
          </Stack>
        )}
      </AppModal>
    </>
  );
}
