import { useMemo, useState } from "react";
import {
  Stepper, Stack, Group, SimpleGrid, Text, Box, Checkbox, Radio,
  MultiSelect, NumberInput, Switch, ScrollArea, Badge, ActionIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Dropzone } from "@mantine/dropzone";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  IconPlus, IconUpload, IconFile, IconX, IconChevronLeft, IconChevronRight,
} from "@tabler/icons-react";

import { AppModal } from "../../components/ui/AppModal";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { MasterDataSelect } from "../../components/ui/MasterDataSelect";
import { AppUnsavedChangesModal } from "../../components/ui/AppModalFooter";
import { COLORS } from "../../theme/colors";

import { useDepartments } from "../../queries/useDepartments";
import { useBranches } from "../../queries/useBranches";
import { useFetchAllEmployees } from "../../queries/useEmployees";

const EMPLOYMENT_TYPES = [
  "Full-Time", "Part-Time", "Contract", "Temporary", "Vendor Resource",
  "Outsourced Employee", "Consultant", "Freelancer", "Intern", "Apprentice",
];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];
const SHIFTS = ["General", "Morning", "Evening", "Night", "Flexible"];
const GRADES = ["A1", "A2", "A3", "B1", "B2", "C1", "C2"];
const LEVELS = ["Intern", "Associate", "Executive", "Senior Executive", "Lead", "Manager", "Senior Manager", "Director", "VP", "CEO"];
const SALARY_TYPES = ["Annual CTC", "Monthly", "Hourly", "Daily"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];
const EDUCATION_OPTIONS = ["High School", "Diploma", "Bachelor's", "Master's", "MBA", "PhD"];
const SKILL_OPTIONS = ["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "AWS", "Communication", "Leadership", "Project Management"];
const CERT_OPTIONS = ["PMP", "AWS Certified", "Scrum Master", "Six Sigma", "CPA", "SHRM-CP"];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "French", "German"];
const HIRING_WORKFLOWS = ["Standard", "Fast-Track", "Executive Search", "Bulk Hiring"];
const APPROVAL_WORKFLOWS = ["Single Approver", "Manager + HR", "Manager + HR + Finance", "Executive Approval"];
const INTERVIEW_PROCESSES = ["Single Round", "Technical + HR", "Technical + Managerial + HR", "Panel Interview + HR"];
const RECRUITMENT_SOURCES = [
  "Career Portal", "Company Website", "LinkedIn", "Naukri", "Indeed", "Monster",
  "Employee Referral", "Recruitment Agency", "Internal Job Posting",
];
const CANDIDATE_SETTINGS = [
  { key: "allowResumeUpload", label: "Allow Resume Upload" },
  { key: "allowCoverLetter", label: "Allow Cover Letter" },
  { key: "allowPortfolio", label: "Allow Portfolio" },
  { key: "allowLinkedIn", label: "Allow LinkedIn Profile" },
  { key: "allowNoticePeriod", label: "Allow Notice Period" },
  { key: "allowCurrentSalary", label: "Allow Current Salary" },
  { key: "allowExpectedSalary", label: "Allow Expected Salary" },
  { key: "allowRelocation", label: "Allow Relocation" },
  { key: "allowWorkAuthorization", label: "Allow Work Authorization" },
];
const AI_SETTINGS = [
  { key: "aiResumeScreening", label: "AI Resume Screening" },
  { key: "aiSkillMatch", label: "AI Skill Match" },
  { key: "aiRanking", label: "AI Ranking" },
  { key: "aiInterviewQuestions", label: "AI Interview Question Generation" },
];
const ATTACHMENT_SLOTS = [
  { key: "jdPdf", label: "JD PDF" },
  { key: "hiringApproval", label: "Hiring Approval" },
  { key: "budgetApproval", label: "Budget Approval" },
  { key: "orgChart", label: "Organization Chart" },
];
const DESCRIPTION_SECTIONS = [
  { key: "aboutCompany", label: "About Company" },
  { key: "jobSummary", label: "Job Summary" },
  { key: "responsibilities", label: "Responsibilities" },
  { key: "requirements", label: "Requirements" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "softSkills", label: "Soft Skills" },
  { key: "benefits", label: "Benefits" },
  { key: "companyCulture", label: "Company Culture" },
];

const genJobCode = () => `JOB-${Math.floor(1000 + Math.random() * 9000)}`;

const emptyForm = () => ({
  jobTitle: "", jobCode: genJobCode(), departmentId: "", branchId: "", workLocation: "",
  hiringManagerId: "", recruiterId: "", openings: 1,
  employmentType: "", workMode: "", shift: "", experienceMin: "", experienceMax: "", grade: "", level: "",
  salaryType: "", salaryMin: "", salaryMax: "", currency: "INR", salaryVisible: false,
  education: [], skills: [], certifications: [], languages: [],
  description: DESCRIPTION_SECTIONS.reduce((acc, s) => ({ ...acc, [s.key]: "" }), {}),
  hiringWorkflow: "", approvalRequired: false, approvalWorkflow: "", interviewProcess: "",
  recruitmentSources: [],
  openingDate: null, closingDate: null, expectedJoiningDate: null,
  recruiter: [], hiringManagerTeam: [], interviewPanel: [], hrbp: [], approver: [],
  attachments: {},
  visibility: "Both",
  candidateSettings: CANDIDATE_SETTINGS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {}),
  aiSettings: AI_SETTINGS.reduce((acc, a) => ({ ...acc, [a.key]: false }), {}),
  status: "Draft",
});

const STEP_TITLES = [
  "Basic Information", "Employment Details", "Salary & Qualification",
  "Job Description", "Hiring Workflow", "Publish & Review",
];

function DescriptionEditor({ label, value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <Box>
      <Text size="sm" fw={500} mb={4}>{label}</Text>
      <RichTextEditor editor={editor} styles={{ root: { border: "1px solid var(--mantine-color-gray-3)" } }}>
        <RichTextEditor.Toolbar sticky>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.H3 />
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content mih={90} />
      </RichTextEditor>
    </Box>
  );
}

function AttachmentDropzone({ label, file, onChange }) {
  return (
    <Box>
      <Text size="sm" fw={500} mb={4}>{label}</Text>
      {file ? (
        <Group justify="space-between" p="sm" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
          <Group gap="xs">
            <IconFile size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" truncate maw={220}>{file.name}</Text>
          </Group>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onChange(null)}>
            <IconX size={14} />
          </ActionIcon>
        </Group>
      ) : (
        <Dropzone onDrop={(files) => onChange(files[0])} maxFiles={1} radius="md" p="sm">
          <Group justify="center" gap="xs" style={{ pointerEvents: "none" }}>
            <IconUpload size={16} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">Drag file here or click to upload</Text>
          </Group>
        </Dropzone>
      )}
    </Box>
  );
}

export function PostJobWizard({ opened, onClose, onSubmit, saving }) {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [confirmClose, setConfirmClose] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: departments = [], isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useDepartments();
  const { data: branches = [], isLoading: branchLoading, isError: branchError, refetch: refetchBranch } = useBranches();
  const { data: employees = [] } = useFetchAllEmployees();

  const employeeOptions = useMemo(
    () => employees.map((e) => ({ value: String(e.id ?? e._id), label: e.name })),
    [employees]
  );

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setDesc = (key) => (html) => setForm((f) => ({ ...f, description: { ...f.description, [key]: html } }));
  const setNested = (group, key) => (value) => setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  const setAttachment = (key) => (file) => setForm((f) => ({ ...f, attachments: { ...f.attachments, [key]: file } }));

  const isDirty = JSON.stringify(form) !== JSON.stringify(emptyForm());

  const validateStep1 = () => {
    const e = {};
    if (!form.jobTitle.trim()) e.jobTitle = "Job title is required";
    if (!form.departmentId) e.departmentId = "Department is required";
    if (!form.branchId) e.branchId = "Branch is required";
    if (!form.hiringManagerId) e.hiringManagerId = "Hiring manager is required";
    if (!form.openings || form.openings < 1) e.openings = "At least 1 opening is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.employmentType) e.employmentType = "Employment type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateFinal = () => {
    const e = {};
    if (!form.closingDate) e.closingDate = "Closing date is required";
    const hasDescription = Object.values(form.description).some((v) => v && v.replace(/<[^>]*>/g, "").trim());
    if (!hasDescription) e.description = "Job description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (active === 0 && !validateStep1()) return;
    if (active === 1 && !validateStep2()) return;
    setActive((a) => Math.min(a + 1, STEP_TITLES.length - 1));
  };
  const goBack = () => setActive((a) => Math.max(a - 1, 0));

  const requestClose = () => {
    if (saving) return;
    if (isDirty) setConfirmClose(true);
    else doClose();
  };
  const doClose = () => {
    setForm(emptyForm());
    setActive(0);
    setErrors({});
    setConfirmClose(false);
    onClose();
  };

  const buildPayload = (status) => ({
    title: form.jobTitle,
    jobCode: form.jobCode,
    department: departments.find((d) => String(d.id ?? d._id) === form.departmentId)?.name || "",
    departmentId: form.departmentId,
    branchId: form.branchId,
    location: form.workLocation,
    hiringManagerId: form.hiringManagerId,
    recruiterId: form.recruiterId,
    openings: form.openings,
    type: form.employmentType || "Full-Time",
    employmentType: form.employmentType,
    workMode: form.workMode,
    shift: form.shift,
    experience: { min: form.experienceMin, max: form.experienceMax },
    grade: form.grade,
    level: form.level,
    salary: {
      type: form.salaryType, min: form.salaryMin, max: form.salaryMax,
      currency: form.currency, visible: form.salaryVisible,
    },
    qualification: {
      education: form.education, skills: form.skills,
      certifications: form.certifications, languages: form.languages,
    },
    description: form.description,
    hiringWorkflow: form.hiringWorkflow,
    approvalRequired: form.approvalRequired,
    approvalWorkflow: form.approvalWorkflow,
    interviewProcess: form.interviewProcess,
    recruitmentSources: form.recruitmentSources,
    openingDate: form.openingDate,
    closingDate: form.closingDate,
    expectedJoiningDate: form.expectedJoiningDate,
    hiringTeam: {
      recruiter: form.recruiter, hiringManager: form.hiringManagerTeam,
      interviewPanel: form.interviewPanel, hrbp: form.hrbp, approver: form.approver,
    },
    visibility: form.visibility,
    candidateSettings: form.candidateSettings,
    aiSettings: form.aiSettings,
    status,
  });

  const handleAction = async (status) => {
    if (!validateStep1()) return setActive(0);
    if (!validateStep2()) return setActive(1);
    if (status !== "Draft" && !validateFinal()) return setActive(STEP_TITLES.length - 1);
    await onSubmit(buildPayload(status));
    doClose();
  };

  return (
    <>
      <AppModal
        opened={opened}
        onClose={requestClose}
        title="Post New Job"
        subtitle={`Job Code: ${form.jobCode}`}
        icon={<IconPlus size={16} color={COLORS.primary} />}
        iconColor={COLORS.primary}
        size="xl"
      >
        <Stepper active={active} onStepClick={setActive} size="xs" iconSize={28} mb="md">
          {STEP_TITLES.map((title) => <Stepper.Step key={title} label={title} />)}
        </Stepper>

        <ScrollArea.Autosize mah={460} offsetScrollbars>
          <Stack gap="md" pr="xs">
            {active === 0 && (
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <AppInput label="Job Title *" placeholder="e.g. Software Engineer"
                    value={form.jobTitle} onChange={(e) => set("jobTitle")(e.target.value)} error={errors.jobTitle} />
                  <AppInput label="Job Code" value={form.jobCode} onChange={(e) => set("jobCode")(e.target.value)} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <MasterDataSelect
                    label="Department *" placeholder="Select department"
                    data={departments} isLoading={deptLoading} isError={deptError} onRetry={refetchDept}
                    getOptionValue={(d) => String(d.id ?? d._id)} getOptionLabel={(d) => d.name}
                    value={form.departmentId} onChange={set("departmentId")} error={errors.departmentId}
                    emptyTitle="No departments found." createHref="/departments" createLabel="Create Department"
                  />
                  <MasterDataSelect
                    label="Branch *" placeholder="Select branch"
                    data={branches} isLoading={branchLoading} isError={branchError} onRetry={refetchBranch}
                    getOptionValue={(b) => String(b.id ?? b._id)} getOptionLabel={(b) => b.name}
                    value={form.branchId} onChange={set("branchId")} error={errors.branchId}
                    emptyTitle="No branches found." createHref="/branches" createLabel="Create Branch"
                  />
                </SimpleGrid>
                <AppInput label="Work Location" placeholder="e.g. Chennai / Remote"
                  value={form.workLocation} onChange={(e) => set("workLocation")(e.target.value)} />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <MasterDataSelect
                    label="Hiring Manager *" placeholder="Search employee"
                    data={employees} getOptionValue={(e) => String(e.id ?? e._id)} getOptionLabel={(e) => e.name}
                    value={form.hiringManagerId} onChange={set("hiringManagerId")} error={errors.hiringManagerId}
                    emptyTitle="No employees found."
                  />
                  <MasterDataSelect
                    label="Recruiter" placeholder="Search employee"
                    data={employees} getOptionValue={(e) => String(e.id ?? e._id)} getOptionLabel={(e) => e.name}
                    value={form.recruiterId} onChange={set("recruiterId")}
                    emptyTitle="No employees found."
                  />
                </SimpleGrid>
                <NumberInput label="Number of Openings *" min={1} value={form.openings}
                  onChange={set("openings")} error={errors.openings} w={220} radius="md" />
              </Stack>
            )}

            {active === 1 && (
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <AppInput type="select" label="Employment Type *" data={EMPLOYMENT_TYPES}
                    value={form.employmentType} onChange={set("employmentType")} error={errors.employmentType} />
                  <AppInput type="select" label="Work Mode" data={WORK_MODES}
                    value={form.workMode} onChange={set("workMode")} />
                  <AppInput type="select" label="Shift" data={SHIFTS}
                    value={form.shift} onChange={set("shift")} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <NumberInput label="Experience (Min yrs)" min={0} value={form.experienceMin} onChange={set("experienceMin")} radius="md" />
                  <NumberInput label="Experience (Max yrs)" min={0} value={form.experienceMax} onChange={set("experienceMax")} radius="md" />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <AppInput type="select" label="Grade" data={GRADES} value={form.grade} onChange={set("grade")} />
                  <AppInput type="select" label="Level" data={LEVELS} value={form.level} onChange={set("level")} />
                </SimpleGrid>
              </Stack>
            )}

            {active === 2 && (
              <Stack gap="lg">
                <Box>
                  <Text size="sm" fw={600} mb="xs">Salary</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <AppInput type="select" label="Salary Type" data={SALARY_TYPES} value={form.salaryType} onChange={set("salaryType")} />
                    <AppInput type="select" label="Currency" data={CURRENCIES} value={form.currency} onChange={set("currency")} />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                    <NumberInput label="Minimum Salary" min={0} value={form.salaryMin} onChange={set("salaryMin")} radius="md" />
                    <NumberInput label="Maximum Salary" min={0} value={form.salaryMax} onChange={set("salaryMax")} radius="md" />
                  </SimpleGrid>
                  <Switch mt="sm" label="Salary Visible to Candidates" checked={form.salaryVisible} onChange={(e) => set("salaryVisible")(e.currentTarget.checked)} />
                </Box>
                <Box>
                  <Text size="sm" fw={600} mb="xs">Qualification</Text>
                  <Stack gap="sm">
                    <MultiSelect label="Education" data={EDUCATION_OPTIONS} searchable clearable radius="md"
                      value={form.education} onChange={set("education")} />
                    <MultiSelect label="Skills" data={SKILL_OPTIONS} searchable clearable radius="md"
                      value={form.skills} onChange={set("skills")} />
                    <MultiSelect label="Certifications" data={CERT_OPTIONS} searchable clearable radius="md"
                      value={form.certifications} onChange={set("certifications")} />
                    <MultiSelect label="Languages" data={LANGUAGE_OPTIONS} searchable clearable radius="md"
                      value={form.languages} onChange={set("languages")} />
                  </Stack>
                </Box>
              </Stack>
            )}

            {active === 3 && (
              <Stack gap="lg">
                {errors.description && <Text size="xs" c="red">{errors.description}</Text>}
                {DESCRIPTION_SECTIONS.map((s) => (
                  <DescriptionEditor key={s.key} label={s.label} value={form.description[s.key]} onChange={setDesc(s.key)} />
                ))}
              </Stack>
            )}

            {active === 4 && (
              <Stack gap="lg">
                <Box>
                  <Text size="sm" fw={600} mb="xs">Hiring Workflow</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <AppInput type="select" label="Hiring Workflow" data={HIRING_WORKFLOWS} value={form.hiringWorkflow} onChange={set("hiringWorkflow")} />
                    <AppInput type="select" label="Interview Process" data={INTERVIEW_PROCESSES} value={form.interviewProcess} onChange={set("interviewProcess")} />
                  </SimpleGrid>
                  <Switch mt="sm" label="Approval Required" checked={form.approvalRequired} onChange={(e) => set("approvalRequired")(e.currentTarget.checked)} />
                  {form.approvalRequired && (
                    <AppInput type="select" mt="sm" label="Approval Workflow" data={APPROVAL_WORKFLOWS}
                      value={form.approvalWorkflow} onChange={set("approvalWorkflow")} w={280} />
                  )}
                </Box>

                <Box>
                  <Text size="sm" fw={600} mb="xs">Recruitment Source</Text>
                  <Checkbox.Group value={form.recruitmentSources} onChange={set("recruitmentSources")}>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                      {RECRUITMENT_SOURCES.map((s) => <Checkbox key={s} value={s} label={s} />)}
                    </SimpleGrid>
                  </Checkbox.Group>
                </Box>

                <Box>
                  <Text size="sm" fw={600} mb="xs">Important Dates</Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <DateInput label="Opening Date" value={form.openingDate} onChange={set("openingDate")} radius="md" clearable />
                    <DateInput label="Closing Date *" value={form.closingDate} onChange={set("closingDate")} radius="md" clearable error={errors.closingDate} />
                    <DateInput label="Expected Joining Date" value={form.expectedJoiningDate} onChange={set("expectedJoiningDate")} radius="md" clearable />
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text size="sm" fw={600} mb="xs">Hiring Team</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <MultiSelect label="Recruiter" data={employeeOptions} searchable clearable radius="md" value={form.recruiter} onChange={set("recruiter")} />
                    <MultiSelect label="Hiring Manager" data={employeeOptions} searchable clearable radius="md" value={form.hiringManagerTeam} onChange={set("hiringManagerTeam")} />
                    <MultiSelect label="Interview Panel" data={employeeOptions} searchable clearable radius="md" value={form.interviewPanel} onChange={set("interviewPanel")} />
                    <MultiSelect label="HRBP" data={employeeOptions} searchable clearable radius="md" value={form.hrbp} onChange={set("hrbp")} />
                    <MultiSelect label="Approver" data={employeeOptions} searchable clearable radius="md" value={form.approver} onChange={set("approver")} />
                  </SimpleGrid>
                </Box>
              </Stack>
            )}

            {active === 5 && (
              <Stack gap="lg">
                <Box>
                  <Text size="sm" fw={600} mb="xs">Attachments</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    {ATTACHMENT_SLOTS.map((a) => (
                      <AttachmentDropzone key={a.key} label={a.label} file={form.attachments[a.key]} onChange={setAttachment(a.key)} />
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text size="sm" fw={600} mb="xs">Visibility</Text>
                  <Radio.Group value={form.visibility} onChange={set("visibility")}>
                    <Group gap="lg">
                      <Radio value="Internal Only" label="Internal Only" />
                      <Radio value="External Only" label="External Only" />
                      <Radio value="Both" label="Both" />
                    </Group>
                  </Radio.Group>
                </Box>

                <Box>
                  <Text size="sm" fw={600} mb="xs">Candidate Settings</Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                    {CANDIDATE_SETTINGS.map((c) => (
                      <Checkbox key={c.key} label={c.label} checked={form.candidateSettings[c.key]}
                        onChange={(e) => setNested("candidateSettings", c.key)(e.currentTarget.checked)} />
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text size="sm" fw={600} mb="xs">AI Settings</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    {AI_SETTINGS.map((a) => (
                      <Checkbox key={a.key} label={a.label} checked={form.aiSettings[a.key]}
                        onChange={(e) => setNested("aiSettings", a.key)(e.currentTarget.checked)} />
                    ))}
                  </SimpleGrid>
                </Box>

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <AppInput type="select" label="Status" data={["Draft", "Pending Approval", "Approved", "Published", "On Hold", "Closed", "Cancelled"]}
                    value={form.status} onChange={set("status")} />
                  <Box>
                    <Text size="sm" fw={500} mb={4}>Preview</Text>
                    <Badge variant="light" size="lg" radius="md">{form.jobTitle || "Untitled Job"} · {form.employmentType || "—"}</Badge>
                  </Box>
                </SimpleGrid>
              </Stack>
            )}
          </Stack>
        </ScrollArea.Autosize>

        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
          <AppButton variant="default" color="gray" disabled={saving} onClick={requestClose}>Cancel</AppButton>
          <Group gap="sm">
            {active > 0 && (
              <AppButton variant="light" leftSection={<IconChevronLeft size={14} />} disabled={saving} onClick={goBack}>
                Back
              </AppButton>
            )}
            {active === 0 && (
              <AppButton variant="light" disabled={saving} loading={saving} onClick={() => handleAction("Draft")}>
                Save Draft
              </AppButton>
            )}
            {active < STEP_TITLES.length - 1 ? (
              <AppButton rightSection={<IconChevronRight size={14} />} onClick={goNext}>Next</AppButton>
            ) : (
              <>
                <AppButton variant="light" disabled={saving} loading={saving} onClick={() => handleAction("Draft")}>
                  Save Draft
                </AppButton>
                <AppButton variant="light" color="yellow" disabled={saving} loading={saving} onClick={() => handleAction("Pending Approval")}>
                  Submit for Approval
                </AppButton>
                <AppButton disabled={saving} loading={saving} onClick={() => handleAction("Published")}>
                  Publish Job
                </AppButton>
              </>
            )}
          </Group>
        </Group>
      </AppModal>

      <AppUnsavedChangesModal
        opened={confirmClose}
        onContinueEditing={() => setConfirmClose(false)}
        onDiscard={doClose}
      />
    </>
  );
}
