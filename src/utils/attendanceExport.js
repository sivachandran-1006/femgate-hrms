import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

export const EXPORT_FIELD_GROUPS = [
  {
    key: "employeeInfo",
    label: "Employee Information",
    fields: [
      { key: "employeeId",        label: "Employee ID",        get: (r) => r.employee?.employeeId },
      { key: "employeeCode",      label: "Employee Code",      get: (r) => r.employee?.employeeCode },
      { key: "employeeName",      label: "Employee Name",      get: (r) => r.employee?.name },
      { key: "company",           label: "Company",            get: (r) => r.employee?.company },
      { key: "branch",            label: "Branch",             get: (r) => r.employee?.branch },
      { key: "department",        label: "Department",         get: (r) => r.employee?.department },
      { key: "designation",       label: "Designation",        get: (r) => r.employee?.designation },
      { key: "reportingManager",  label: "Reporting Manager",  get: (r) => r.employee?.reportingManager },
    ],
  },
  {
    key: "attendanceDetails",
    label: "Attendance Details",
    fields: [
      { key: "date",             label: "Attendance Date",   get: (r) => fmtDate(r.date) },
      { key: "shift",            label: "Shift",              get: (r) => r.shift },
      { key: "shiftTiming",      label: "Shift Timing",      get: (r) => r.shiftTiming },
      { key: "checkIn",          label: "Check-In Time",     get: (r) => fmtTime(r.checkIn) },
      { key: "checkOut",         label: "Check-Out Time",    get: (r) => fmtTime(r.checkOut) },
      { key: "totalHours",       label: "Total Working Hours", get: (r) => r.hoursWorked },
      { key: "breakTime",        label: "Break Time",        get: (r) => r.breakTime },
      { key: "netHours",         label: "Net Working Hours", get: (r) => r.netHours ?? r.hoursWorked },
      { key: "overtimeHours",    label: "Overtime Hours",    get: (r) => r.overtimeHours },
      { key: "status",           label: "Attendance Status", get: (r) => r.status },
      { key: "lateBy",           label: "Late By",            get: (r) => r.lateBy },
      { key: "earlyOut",         label: "Early Out",          get: (r) => r.earlyOut },
      { key: "source",           label: "Attendance Source", get: (r) => r.source },
    ],
  },
  {
    key: "leaveInfo",
    label: "Leave Information",
    fields: [
      { key: "leaveType",     label: "Leave Type",     get: (r) => r.leaveType },
      { key: "leaveDuration", label: "Leave Duration", get: (r) => r.leaveDuration },
      { key: "leaveApprovedBy", label: "Approved By",  get: (r) => r.leaveApprovedBy },
    ],
  },
  {
    key: "gpsDevice",
    label: "GPS & Device Information",
    fields: [
      { key: "checkInLocation",  label: "Check-In Location",  get: (r) => r.checkInLocation },
      { key: "checkOutLocation", label: "Check-Out Location", get: (r) => r.checkOutLocation },
      { key: "deviceName",       label: "Device Name",         get: (r) => r.deviceName },
      { key: "ipAddress",        label: "IP Address",          get: (r) => r.ipAddress },
      { key: "gpsCoordinates",   label: "GPS Coordinates",     get: (r) => r.gpsCoordinates },
    ],
  },
  {
    key: "approval",
    label: "Approval Details",
    fields: [
      { key: "regularizationStatus", label: "Regularization Status", get: (r) => r.regularizationStatus },
      { key: "approvedBy",           label: "Approved By",            get: (r) => r.approvedBy },
      { key: "approvalDate",         label: "Approval Date",          get: (r) => fmtDate(r.approvalDate) },
      { key: "comments",             label: "Comments",                get: (r) => r.comments },
    ],
  },
  {
    key: "timesheet",
    label: "Timesheet",
    fields: [
      { key: "timesheetHours",  label: "Timesheet Hours",   get: (r) => r.timesheetHours },
      { key: "billableHours",   label: "Billable Hours",    get: (r) => r.billableHours },
      { key: "nonBillableHours",label: "Non-Billable Hours",get: (r) => r.nonBillableHours },
      { key: "project",         label: "Project",            get: (r) => r.project },
      { key: "client",          label: "Client",              get: (r) => r.client },
    ],
  },
];

export const DEFAULT_SELECTED_FIELDS = EXPORT_FIELD_GROUPS
  .filter((g) => g.key === "employeeInfo" || g.key === "attendanceDetails")
  .flatMap((g) => g.fields.map((f) => `${g.key}.${f.key}`));

export function resolveExportColumns(selectedFieldKeys) {
  const selected = new Set(selectedFieldKeys);
  return EXPORT_FIELD_GROUPS.flatMap((g) =>
    g.fields
      .filter((f) => selected.has(`${g.key}.${f.key}`))
      .map((f) => ({ label: f.label, get: f.get }))
  );
}

export function buildExportRows(records, columns) {
  return records.map((rec) => {
    const row = {};
    columns.forEach((col) => { row[col.label] = col.get(rec) ?? ""; });
    return row;
  });
}

export function buildFileName({ format, scopeLabel }) {
  const today = new Date().toISOString().slice(0, 10);
  const suffix = scopeLabel ? `_${scopeLabel.replace(/\s+/g, "")}` : "";
  const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
  return `Attendance${suffix}_${today}.${ext}`;
}

export function exportToExcel(rows, fileName) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
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
  doc.text("Attendance Export Summary", 14, 14);
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
