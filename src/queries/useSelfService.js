import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile, updateMyProfile, getMyAttendance,
  getMyPayslips, getMyDocuments, getMyAssets,
  createDocument, deleteDocument, selfCheckIn, selfCheckOut,
} from "../services/selfService";
import { addMaintenance, returnAsset } from "../api/assetApi";

// ── Mock fallback data (main_v1 UI-only demo branch) ──────────────────────
// Shapes mirror the real API responses consumed by MyProfile, MyAttendance,
// MyPayslips, MyDocuments and MyAssets screens.

const MOCK_MY_PROFILE = {
  employeeId:       "EMP-1029",
  name:             "Rajesh Kumar",
  email:            "employee@mgate.com",
  phone:            "+91 98765 43210",
  address:          "204, Lakeview Residency, HSR Layout",
  city:             "Bengaluru",
  state:            "Karnataka",
  dob:              "1994-03-12T00:00:00.000Z",
  gender:           "Male",
  bloodGroup:       "O+",
  maritalStatus:    "Single",
  emergencyContact: "+91 91234 56789 (Father)",
  pan:              "ABCDE1234F",
  aadhaar:          "XXXX-XXXX-4821",
  department:       "Engineering",
  designation:      "Senior Software Engineer",
  joinDate:         "2021-06-14T00:00:00.000Z",
  bankDetails: JSON.stringify({
    bankName:      "HDFC Bank",
    accountHolder: "Rajesh Kumar",
    accountNumber: "50100234567890",
    ifsc:          "HDFC0001234",
    upi:           "rajesh.kumar@okhdfcbank",
  }),
};

const MOCK_MY_ATTENDANCE = [
  { id: "att-1",  date: "2026-07-18T00:00:00.000Z", checkIn: "2026-07-18T04:05:00.000Z", checkOut: null,                                hoursWorked: null, status: "Present" },
  { id: "att-2",  date: "2026-07-17T00:00:00.000Z", checkIn: "2026-07-17T04:02:00.000Z", checkOut: "2026-07-17T13:10:00.000Z",           hoursWorked: 9.13, status: "Present" },
  { id: "att-3",  date: "2026-07-16T00:00:00.000Z", checkIn: "2026-07-16T04:35:00.000Z", checkOut: "2026-07-16T13:05:00.000Z",           hoursWorked: 8.5,  status: "Late" },
  { id: "att-4",  date: "2026-07-15T00:00:00.000Z", checkIn: "2026-07-15T04:00:00.000Z", checkOut: "2026-07-15T13:30:00.000Z",           hoursWorked: 9.5,  status: "Present" },
  { id: "att-5",  date: "2026-07-14T00:00:00.000Z", checkIn: null,                        checkOut: null,                                hoursWorked: null, status: "OnLeave" },
  { id: "att-6",  date: "2026-07-13T00:00:00.000Z", checkIn: null,                        checkOut: null,                                hoursWorked: 0,    status: "Absent" },
  { id: "att-7",  date: "2026-07-11T00:00:00.000Z", checkIn: "2026-07-11T04:10:00.000Z", checkOut: "2026-07-11T13:00:00.000Z",           hoursWorked: 8.83, status: "Present" },
  { id: "att-8",  date: "2026-07-10T00:00:00.000Z", checkIn: "2026-07-10T03:58:00.000Z", checkOut: "2026-07-10T12:45:00.000Z",           hoursWorked: 8.78, status: "Present" },
  { id: "att-9",  date: "2026-07-09T00:00:00.000Z", checkIn: "2026-07-09T04:40:00.000Z", checkOut: "2026-07-09T13:20:00.000Z",           hoursWorked: 8.67, status: "Late" },
  { id: "att-10", date: "2026-07-08T00:00:00.000Z", checkIn: "2026-07-08T04:03:00.000Z", checkOut: "2026-07-08T13:15:00.000Z",           hoursWorked: 9.2,  status: "Present" },
  { id: "att-11", date: "2026-07-07T00:00:00.000Z", checkIn: "2026-07-07T04:00:00.000Z", checkOut: "2026-07-07T13:00:00.000Z",           hoursWorked: 9,    status: "Present" },
  { id: "att-12", date: "2026-07-04T00:00:00.000Z", checkIn: "2026-07-04T04:12:00.000Z", checkOut: "2026-07-04T12:50:00.000Z",           hoursWorked: 8.63, status: "Present" },
];

const MOCK_MY_PAYSLIPS = [
  { id: "ps-1",  month: "June",      year: 2026, salary: 85000, bonus: 0,    deduction: 12400, netSalary: 72600, status: "Paid",    paidAt: "2026-07-01T00:00:00.000Z" },
  { id: "ps-2",  month: "May",       year: 2026, salary: 85000, bonus: 5000, deduction: 12900, netSalary: 77100, status: "Paid",    paidAt: "2026-06-01T00:00:00.000Z" },
  { id: "ps-3",  month: "April",     year: 2026, salary: 85000, bonus: 0,    deduction: 12400, netSalary: 72600, status: "Paid",    paidAt: "2026-05-01T00:00:00.000Z" },
  { id: "ps-4",  month: "March",     year: 2026, salary: 82000, bonus: 0,    deduction: 12000, netSalary: 70000, status: "Paid",    paidAt: "2026-04-01T00:00:00.000Z" },
  { id: "ps-5",  month: "February",  year: 2026, salary: 82000, bonus: 0,    deduction: 12000, netSalary: 70000, status: "Paid",    paidAt: "2026-03-01T00:00:00.000Z" },
  { id: "ps-6",  month: "January",   year: 2026, salary: 82000, bonus: 10000, deduction: 13500, netSalary: 78500, status: "Paid",   paidAt: "2026-02-01T00:00:00.000Z" },
  { id: "ps-7",  month: "December",  year: 2025, salary: 82000, bonus: 0,    deduction: 12000, netSalary: 70000, status: "Paid",    paidAt: "2026-01-01T00:00:00.000Z" },
  { id: "ps-8",  month: "November",  year: 2025, salary: 82000, bonus: 0,    deduction: 12000, netSalary: 70000, status: "Paid",    paidAt: "2025-12-01T00:00:00.000Z" },
  { id: "ps-9",  month: "October",   year: 2025, salary: 80000, bonus: 0,    deduction: 11700, netSalary: 68300, status: "Paid",    paidAt: "2025-11-01T00:00:00.000Z" },
];

const MOCK_MY_DOCUMENTS = [
  { id: "doc-1", name: "Aadhaar Card",          category: "Identity",   createdAt: "2024-02-10T00:00:00.000Z", expiryDate: null,                       fileSize: "1.2 MB" },
  { id: "doc-2", name: "PAN Card",              category: "Identity",   createdAt: "2024-02-10T00:00:00.000Z", expiryDate: null,                       fileSize: "0.8 MB" },
  { id: "doc-3", name: "B.Tech Degree Certificate", category: "Education", createdAt: "2021-06-20T00:00:00.000Z", expiryDate: null,                    fileSize: "2.1 MB" },
  { id: "doc-4", name: "Offer Letter",          category: "Employment", createdAt: "2021-06-14T00:00:00.000Z", expiryDate: null,                       fileSize: "0.5 MB" },
  { id: "doc-5", name: "Passport",              category: "Identity",   createdAt: "2023-01-05T00:00:00.000Z", expiryDate: "2025-01-04T00:00:00.000Z", fileSize: "1.5 MB" },
];

const MOCK_MY_ASSETS = [
  { assetId: "AST-201", name: "MacBook Pro 14\"",        category: "Laptop",    serialNumber: "C02FX3A9MD6P", assignedAt: "2021-06-15T00:00:00.000Z", status: "InUse" },
  { assetId: "AST-202", name: "iPhone 13",               category: "Mobile",    serialNumber: "IMEI-8823910231", assignedAt: "2022-03-01T00:00:00.000Z", status: "InUse" },
  { assetId: "AST-203", name: "Dell 27\" Monitor",        category: "Monitor",   serialNumber: "DL27-99213", assignedAt: "2021-06-15T00:00:00.000Z", status: "InUse" },
  { assetId: "AST-204", name: "Logitech MX Keys",        category: "Keyboard",  serialNumber: "LGK-44821", assignedAt: "2023-08-10T00:00:00.000Z", status: "Maintenance" },
];

export const useMyProfile = () => {
  const { data: rawMe, isLoading, isError: rawIsError } = useQuery({ queryKey: ["me", "profile"], queryFn: getMyProfile });
  const me = rawMe ?? MOCK_MY_PROFILE;
  const isError = rawIsError && !me;
  return { data: me, isLoading, isError };
};

export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "profile"] }),
  });
};

export const useMyAttendance = () => {
  const { data: rawAttendance, isLoading, isError: rawIsError } = useQuery({ queryKey: ["me", "attendance"], queryFn: getMyAttendance });
  const attendance = rawAttendance?.length ? rawAttendance : MOCK_MY_ATTENDANCE;
  const isError = rawIsError && !attendance.length;
  return { data: attendance, isLoading, isError };
};

export const useSelfCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selfCheckIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "attendance"] });
      qc.invalidateQueries({ queryKey: ["my-attendance"] });
    },
  });
};

export const useSelfCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selfCheckOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "attendance"] });
      qc.invalidateQueries({ queryKey: ["my-attendance"] });
    },
  });
};

export const useMyPayslips = () => {
  const { data: rawPayslips, isLoading, isError: rawIsError } = useQuery({ queryKey: ["me", "payslips"], queryFn: getMyPayslips });
  const payslips = rawPayslips?.length ? rawPayslips : MOCK_MY_PAYSLIPS;
  const isError = rawIsError && !payslips.length;
  return { data: payslips, isLoading, isError };
};

export const useMyDocuments = () => {
  const { data: rawDocuments, isLoading, isError: rawIsError } = useQuery({ queryKey: ["me", "documents"], queryFn: getMyDocuments });
  const documents = rawDocuments?.length ? rawDocuments : MOCK_MY_DOCUMENTS;
  const isError = rawIsError && !documents.length;
  return { data: documents, isLoading, isError };
};

export const useCreateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "documents"] }),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "documents"] }),
  });
};

export const useMyAssets = () => {
  const { data: rawAssets, isLoading, isError: rawIsError } = useQuery({ queryKey: ["me", "assets"], queryFn: getMyAssets });
  const assets = rawAssets?.length ? rawAssets : MOCK_MY_ASSETS;
  const isError = rawIsError && !assets.length;
  return { data: assets, isLoading, isError };
};

// Report an issue → logs a maintenance record + flags the asset for repair
export const useReportAssetIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, description }) =>
      addMaintenance(id, { type: "Issue Reported", description, status: "Pending", setUnderRepair: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "assets"] }),
  });
};

// Request return → marks the assignment returned (pending IT pickup)
export const useRequestAssetReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }) =>
      returnAsset(id, { remarks: remarks || "Return requested by employee", accept: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "assets"] }),
  });
};
