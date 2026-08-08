import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const EXPORT_FIELD_GROUPS = [
  {
    key: "basic",
    label: "Basic Information",
    fields: [
      { key: "id",           label: "Employee ID",     get: (e) => e.id ?? e._id },
      { key: "employeeCode", label: "Employee Code",   get: (e) => e.employeeCode ?? e.code },
      { key: "name",         label: "Employee Name",   get: (e) => e.name },
      { key: "gender",       label: "Gender",          get: (e) => e.gender },
      { key: "dob",          label: "Date of Birth",   get: (e) => e.dob ?? e.dateOfBirth },
      { key: "email",        label: "Email",           get: (e) => e.email },
      { key: "phone",        label: "Mobile",          get: (e) => e.phone },
      { key: "status",       label: "Employee Status", get: (e) => e.status },
    ],
  },
  {
    key: "organization",
    label: "Organization",
    fields: [
      { key: "company",           label: "Company",            get: (e) => e.company ?? e.companyName },
      { key: "branch",            label: "Branch",              get: (e) => e.branch ?? e.branchName },
      { key: "department",        label: "Department",          get: (e) => e.department },
      { key: "designation",       label: "Designation",         get: (e) => e.designation },
      { key: "grade",             label: "Grade",                get: (e) => e.grade },
      { key: "level",             label: "Level",                get: (e) => e.level },
      { key: "reportingManager",  label: "Reporting Manager",    get: (e) => e.reportingManager },
      { key: "businessUnit",      label: "Business Unit",        get: (e) => e.businessUnit },
      { key: "costCenter",        label: "Cost Center",          get: (e) => e.costCenter },
    ],
  },
  {
    key: "employment",
    label: "Employment",
    fields: [
      { key: "joiningDate",       label: "Joining Date",       get: (e) => e.joiningDate ?? e.joinDate },
      { key: "confirmationDate",  label: "Confirmation Date",  get: (e) => e.confirmationDate },
      { key: "employmentType",    label: "Employment Type",    get: (e) => e.employmentType ?? e.type },
      { key: "workMode",          label: "Work Mode",          get: (e) => e.workMode },
      { key: "shift",             label: "Shift",               get: (e) => e.shift },
      { key: "probationStatus",   label: "Probation Status",   get: (e) => e.probationStatus },
      { key: "noticePeriod",      label: "Notice Period",      get: (e) => e.noticePeriod },
    ],
  },
  {
    key: "payroll",
    label: "Payroll",
    sensitive: true,
    fields: [
      { key: "salary",         label: "Salary",          get: (e) => e.salary },
      { key: "currency",       label: "Currency",         get: (e) => e.currency ?? "INR" },
      { key: "payrollGroup",   label: "Payroll Group",   get: (e) => e.payrollGroup },
      { key: "bankName",       label: "Bank Name",        get: (e) => e.bankName },
      { key: "accountNumber",  label: "Account Number",  get: (e) => e.accountNumber, sensitive: true },
      { key: "uan",            label: "UAN",               get: (e) => e.uan, sensitive: true },
      { key: "pfNumber",       label: "PF Number",        get: (e) => e.pfNumber, sensitive: true },
      { key: "esiNumber",      label: "ESI Number",       get: (e) => e.esiNumber, sensitive: true },
    ],
  },
  {
    key: "leave",
    label: "Leave",
    fields: [
      { key: "leaveBalance", label: "Leave Balance", get: (e) => e.leaveBalance },
      { key: "casualLeave",  label: "Casual Leave",  get: (e) => e.casualLeave },
      { key: "sickLeave",    label: "Sick Leave",    get: (e) => e.sickLeave },
      { key: "earnedLeave",  label: "Earned Leave",  get: (e) => e.earnedLeave },
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    fields: [
      { key: "presentDays", label: "Present Days", get: (e) => e.presentDays },
      { key: "absentDays",  label: "Absent Days",  get: (e) => e.absentDays },
      { key: "lateComing",  label: "Late Coming",  get: (e) => e.lateComing },
      { key: "overtime",    label: "Overtime",     get: (e) => e.overtime },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    fields: [
      { key: "aadhaarUploaded",   label: "Aadhaar Uploaded",   get: (e) => e.aadhaarUploaded },
      { key: "panUploaded",       label: "PAN Uploaded",       get: (e) => e.panUploaded },
      { key: "passportUploaded",  label: "Passport Uploaded",  get: (e) => e.passportUploaded },
      { key: "offerLetter",       label: "Offer Letter",       get: (e) => e.offerLetter },
      { key: "relievingLetter",   label: "Relieving Letter",   get: (e) => e.relievingLetter },
    ],
  },
  {
    key: "performance",
    label: "Performance",
    fields: [
      { key: "currentRating", label: "Current Rating", get: (e) => e.currentRating ?? e.score },
      { key: "lastReview",    label: "Last Review",     get: (e) => e.lastReview },
      { key: "goalStatus",    label: "Goal Status",     get: (e) => e.goalStatus },
    ],
  },
  {
    key: "assets",
    label: "Assets",
    fields: [
      { key: "laptop",       label: "Laptop",       get: (e) => e.assets?.laptop },
      { key: "mobileAsset",  label: "Mobile",       get: (e) => e.assets?.mobile },
      { key: "idCard",       label: "ID Card",      get: (e) => e.assets?.idCard },
      { key: "otherAssets",  label: "Other Assets", get: (e) => e.assets?.other },
    ],
  },
];

export const DEFAULT_SELECTED_FIELDS = EXPORT_FIELD_GROUPS.flatMap((g) => g.fields.map((f) => `${g.key}.${f.key}`));

export const SENSITIVE_FIELD_KEYS = EXPORT_FIELD_GROUPS.flatMap((g) =>
  g.fields.filter((f) => f.sensitive).map((f) => `${g.key}.${f.key}`)
);

export function resolveExportColumns(selectedFieldKeys) {
  const selected = new Set(selectedFieldKeys);
  return EXPORT_FIELD_GROUPS.flatMap((g) =>
    g.fields
      .filter((f) => selected.has(`${g.key}.${f.key}`))
      .map((f) => ({ label: f.label, get: f.get }))
  );
}

export function buildExportRows(employees, columns) {
  return employees.map((emp) => {
    const row = {};
    columns.forEach((col) => { row[col.label] = col.get(emp) ?? ""; });
    return row;
  });
}

export function buildFileName({ format, deptFilter }) {
  const today = new Date().toISOString().slice(0, 10);
  const scopeLabel = deptFilter && deptFilter !== "All" ? `_${deptFilter.replace(/\s+/g, "")}` : "";
  const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
  return `Employees${scopeLabel}_${today}.${ext}`;
}

export function exportToExcel(rows, fileName) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, fileName);
}

export function exportToCsv(rows, fileName) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, fileName);
}

export function exportToPdf(rows, fileName) {
  const doc = new jsPDF({ orientation: "landscape" });
  const columns = rows.length ? Object.keys(rows[0]) : [];
  doc.setFontSize(14);
  doc.text("Employee Export Summary", 14, 14);
  autoTable(doc, {
    startY: 20,
    head: [columns],
    body: rows.map((r) => columns.map((c) => String(r[c] ?? ""))),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [109, 40, 217] },
  });
  doc.save(fileName);
}

export function runExport({ format, rows, fileName }) {
  if (format === "csv") return exportToCsv(rows, fileName);
  if (format === "pdf") return exportToPdf(rows, fileName);
  return exportToExcel(rows, fileName);
}
