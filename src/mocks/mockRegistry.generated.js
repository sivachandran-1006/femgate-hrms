// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT.
import assets from "./data/assets.json" with { type: "json" };
import attendance from "./data/attendance.json" with { type: "json" };
import departments from "./data/departments.json" with { type: "json" };
import employees from "./data/employees.json" with { type: "json" };
import leaves from "./data/leaves.json" with { type: "json" };
import payroll from "./data/payroll.json" with { type: "json" };

export const mockRegistry = {
  "/assets": assets.default?.["assets"] || assets["assets"],
  "/assets/:id": assets.default?.["asset"] || assets["asset"],
  "/attendance": attendance.default?.["attendance"] || attendance["attendance"],
  "/attendance/:id": attendance.default?.["attendance"] || attendance["attendance"],
  "/departments": departments.default?.["departments"] || departments["departments"],
  "/departments/:id": departments.default?.["department"] || departments["department"],
  "/employees": employees.default?.["employees"] || employees["employees"],
  "/employees/:id": employees.default?.["employee"] || employees["employee"],
  "/leaves": leaves.default?.["leaves"] || leaves["leaves"],
  "/leaves/:id": leaves.default?.["leave"] || leaves["leave"],
  "/payroll": payroll.default?.["payroll"] || payroll["payroll"],
  "/payroll/:id": payroll.default?.["payroll"] || payroll["payroll"],
};
