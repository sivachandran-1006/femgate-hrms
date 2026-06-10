// ── Route access (which pages each role can visit) ───────────────────────────
export const ROLE_ROUTES = {
  SUPER_ADMIN: ["dashboard","employees","departments","attendance","leave","payroll","recruitment","onboarding","performance","assets","helpdesk","lms","analytics","settings","calendar","documents","exit","shifts","orgchart","user-management","roles-permissions","audit-logs","security","integrations","billing","companies","company-settings","notifications","reports","holiday-calendar","expense","announcements"],
  ADMIN:       ["dashboard","employees","departments","attendance","leave","payroll","recruitment","onboarding","performance","assets","helpdesk","lms","analytics","calendar","documents","exit","shifts","orgchart","audit-logs","security","integrations"],
  HR:          ["dashboard","employees","departments","attendance","leave","recruitment","onboarding","performance","lms","analytics","calendar","documents","exit","shifts","orgchart"],
  MANAGER:     ["dashboard","employees","attendance","leave","performance","lms","calendar","orgchart","shifts"],
  FINANCE:     ["dashboard","payroll","analytics","documents"],
  IT_ADMIN:    ["dashboard","assets","helpdesk","orgchart","calendar"],
  EMPLOYEE:    ["dashboard","attendance","leave","lms","calendar","my-profile","my-payslips","my-documents","my-assets","helpdesk","orgchart"],
};

// ── Sidebar nav items per role ────────────────────────────────────────────────
export const ROLE_SIDEBAR = {
  SUPER_ADMIN: [
    { id: "dashboard",         label: "Dashboard",              icon: "IconLayoutDashboard"   },
    { id: "employees",         label: "Employee Management",    icon: "IconUsers"             },
    { id: "user-management",   label: "User Management",        icon: "IconUserCog"           },
    { id: "roles-permissions", label: "Role & Permissions",     icon: "IconShieldLock"        },
    { id: "departments",       label: "Department Management",  icon: "IconBuildingCommunity" },
    { id: "orgchart",          label: "Organization Chart",     icon: "IconHierarchy"         },
    { id: "attendance",        label: "Attendance Management",  icon: "IconClock"             },
    { id: "shifts",            label: "Shift Management",       icon: "IconRotateClockwise"   },
    { id: "leave",             label: "Leave Management",       icon: "IconCalendarOff"       },
    { id: "holiday-calendar",  label: "Holiday Calendar",       icon: "IconCalendarEvent"     },
    { id: "payroll",           label: "Payroll Management",     icon: "IconCurrencyRupee"     },
    { id: "recruitment",       label: "Recruitment",            icon: "IconBriefcase"         },
    { id: "onboarding",        label: "Onboarding",             icon: "IconUserPlus"          },
    { id: "performance",       label: "Performance Management", icon: "IconTarget"            },
    { id: "documents",         label: "Document Management",    icon: "IconFolder"            },
    { id: "assets",            label: "Asset Management",       icon: "IconPackage"           },
    { id: "helpdesk",          label: "Helpdesk Management",    icon: "IconLifebuoy"          },
    { id: "expense",           label: "Expense Management",     icon: "IconReceipt"           },
    { id: "announcements",     label: "Announcements",          icon: "IconSpeakerphone"      },
    { id: "notifications",     label: "Notification Center",    icon: "IconBell"              },
    { id: "reports",           label: "Reports & Analytics",    icon: "IconReportAnalytics"   },
    { id: "audit-logs",        label: "Audit Logs",             icon: "IconClipboardList"     },
    { id: "company-settings",  label: "Company Settings",       icon: "IconBuildingCog"       },
    { id: "security",          label: "Security Center",        icon: "IconShield"            },
    { id: "integrations",      label: "Integrations",           icon: "IconPlug"              },
    { id: "billing",           label: "Billing",                icon: "IconCreditCard"        },
    { id: "companies",         label: "Multi-Company",          icon: "IconBuildingFactory"   },
    { id: "calendar",          label: "Calendar",               icon: "IconCalendar"          },
    { id: "lms",               label: "Learning",               icon: "IconBook"              },
    { id: "exit",              label: "Exit Management",        icon: "IconDoorExit"          },
    { id: "settings",          label: "Settings",               icon: "IconSettings"          },
  ],
  ADMIN: [
    { id: "dashboard",   label: "Dashboard",   icon: "IconLayoutDashboard"   },
    { id: "employees",   label: "Employees",   icon: "IconUsers"             },
    { id: "departments", label: "Departments", icon: "IconBuildingCommunity" },
    { id: "orgchart",    label: "Org Chart",   icon: "IconHierarchy"         },
    { id: "attendance",  label: "Attendance",  icon: "IconClock"             },
    { id: "shifts",      label: "Shifts",      icon: "IconRotateClockwise"   },
    { id: "leave",       label: "Leave",       icon: "IconCalendarOff"       },
    { id: "calendar",    label: "Calendar",    icon: "IconCalendar"          },
    { id: "payroll",     label: "Payroll",     icon: "IconCurrencyRupee"     },
    { id: "recruitment", label: "Recruitment", icon: "IconBriefcase"         },
    { id: "onboarding",  label: "Onboarding",  icon: "IconUserPlus"          },
    { id: "performance", label: "Performance", icon: "IconTarget"            },
    { id: "documents",   label: "Documents",   icon: "IconFolder"            },
    { id: "exit",        label: "Exit Mgmt",   icon: "IconDoorExit"          },
    { id: "assets",      label: "Assets",      icon: "IconPackage"           },
    { id: "helpdesk",    label: "Helpdesk",    icon: "IconLifebuoy"          },
    { id: "lms",         label: "Learning",    icon: "IconBook"              },
    { id: "analytics",   label: "Analytics",   icon: "IconChartBar"          },
    { id: "audit-logs",  label: "Audit Logs",   icon: "IconClipboardList"     },
    { id: "security",    label: "Security",     icon: "IconShield"            },
    { id: "integrations",label: "Integrations", icon: "IconPlug"             },
  ],
  HR: [
    { id: "dashboard",   label: "Dashboard",   icon: "IconLayoutDashboard"   },
    { id: "employees",   label: "Employees",   icon: "IconUsers"             },
    { id: "departments", label: "Departments", icon: "IconBuildingCommunity" },
    { id: "orgchart",    label: "Org Chart",   icon: "IconHierarchy"         },
    { id: "attendance",  label: "Attendance",  icon: "IconClock"             },
    { id: "shifts",      label: "Shifts",      icon: "IconRotateClockwise"   },
    { id: "leave",       label: "Leave",       icon: "IconCalendarOff"       },
    { id: "calendar",    label: "Calendar",    icon: "IconCalendar"          },
    { id: "recruitment", label: "Recruitment", icon: "IconBriefcase"         },
    { id: "onboarding",  label: "Onboarding",  icon: "IconUserPlus"          },
    { id: "performance", label: "Performance", icon: "IconTarget"            },
    { id: "documents",   label: "Documents",   icon: "IconFolder"            },
    { id: "exit",        label: "Exit Mgmt",   icon: "IconDoorExit"          },
    { id: "lms",         label: "Learning",    icon: "IconBook"              },
    { id: "analytics",   label: "Analytics",   icon: "IconChartBar"          },
  ],
  MANAGER: [
    { id: "dashboard",   label: "Dashboard",   icon: "IconLayoutDashboard"   },
    { id: "employees",   label: "My Team",     icon: "IconUsers"             },
    { id: "orgchart",    label: "Org Chart",   icon: "IconHierarchy"         },
    { id: "attendance",  label: "Attendance",  icon: "IconClock"             },
    { id: "shifts",      label: "Shifts",      icon: "IconRotateClockwise"   },
    { id: "leave",       label: "Leave",       icon: "IconCalendarOff"       },
    { id: "calendar",    label: "Calendar",    icon: "IconCalendar"          },
    { id: "performance", label: "Performance", icon: "IconTarget"            },
    { id: "lms",         label: "Learning",    icon: "IconBook"              },
  ],
  FINANCE: [
    { id: "dashboard",   label: "Dashboard",   icon: "IconLayoutDashboard"   },
    { id: "payroll",     label: "Payroll",     icon: "IconCurrencyRupee"     },
    { id: "documents",   label: "Documents",   icon: "IconFolder"            },
    { id: "analytics",   label: "Analytics",   icon: "IconChartBar"          },
  ],
  IT_ADMIN: [
    { id: "dashboard",   label: "Dashboard",   icon: "IconLayoutDashboard"   },
    { id: "assets",      label: "Assets",      icon: "IconPackage"           },
    { id: "helpdesk",    label: "Helpdesk",    icon: "IconLifebuoy"          },
    { id: "orgchart",    label: "Org Chart",   icon: "IconHierarchy"         },
    { id: "calendar",    label: "Calendar",    icon: "IconCalendar"          },
  ],
  EMPLOYEE: [
    { id: "dashboard",    label: "Dashboard",     icon: "IconLayoutDashboard" },
    { id: "my-profile",   label: "My Profile",    icon: "IconUser"            },
    { id: "attendance",   label: "My Attendance", icon: "IconClock"           },
    { id: "leave",        label: "My Leave",      icon: "IconCalendarOff"     },
    { id: "my-payslips",  label: "My Payslips",   icon: "IconCurrencyRupee"   },
    { id: "my-documents", label: "My Documents",  icon: "IconFolder"          },
    { id: "my-assets",    label: "My Assets",     icon: "IconPackage"         },
    { id: "helpdesk",     label: "Helpdesk",      icon: "IconLifebuoy"        },
    { id: "orgchart",     label: "Org Chart",     icon: "IconHierarchy"       },
    { id: "calendar",     label: "Calendar",      icon: "IconCalendar"        },
    { id: "lms",          label: "Learning",      icon: "IconBook"            },
  ],
};

// ── Granular action-level permissions ─────────────────────────────────────────
// Usage: can(userRole, "leave.approve")
export const PERMISSIONS = {
  // ── Dashboard ──
  "dashboard.view":                   ["SUPER_ADMIN","ADMIN","HR","MANAGER","FINANCE","IT_ADMIN","EMPLOYEE"],

  // ── Employees ──
  "employees.view":                   ["SUPER_ADMIN","ADMIN","HR"],
  "employees.view_team":              ["MANAGER"],
  "employees.add":                    ["SUPER_ADMIN","ADMIN","HR"],
  "employees.edit":                   ["SUPER_ADMIN","ADMIN","HR"],
  "employees.delete":                 ["SUPER_ADMIN","ADMIN"],
  "employees.view_profile_self":      ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],
  "employees.edit_profile_self":      ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],

  // ── Departments ──
  "departments.view":                 ["SUPER_ADMIN","ADMIN","HR"],
  "departments.create":               ["SUPER_ADMIN","ADMIN","HR"],
  "departments.edit":                 ["SUPER_ADMIN","ADMIN","HR"],
  "departments.delete":               ["SUPER_ADMIN","ADMIN"],

  // ── Attendance ──
  "attendance.view_own":              ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "attendance.view_team":             ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "attendance.view_all":              ["HR","ADMIN","SUPER_ADMIN"],
  "attendance.approve_correction":    ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "attendance.approve_wfh":           ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "attendance.regularize_own":        ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],

  // ── Leave ──
  "leave.apply":                      ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "leave.cancel_own":                 ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "leave.view_own":                   ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "leave.view_team":                  ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "leave.view_all":                   ["HR","ADMIN","SUPER_ADMIN"],
  "leave.approve":                    ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "leave.reject":                     ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "leave.configure_policy":           ["HR","ADMIN","SUPER_ADMIN"],

  // ── Payroll ──
  "payroll.view_own":                 ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],
  "payroll.download_own":             ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],
  "payroll.view_all":                 ["FINANCE","ADMIN","SUPER_ADMIN"],
  "payroll.generate":                 ["FINANCE","ADMIN","SUPER_ADMIN"],
  "payroll.process":                  ["FINANCE","ADMIN","SUPER_ADMIN"],
  "payroll.approve":                  ["SUPER_ADMIN"],
  "payroll.publish":                  ["SUPER_ADMIN"],
  "payroll.manage_components":        ["FINANCE","SUPER_ADMIN"],
  "payroll.manage_tax":               ["FINANCE","SUPER_ADMIN"],

  // ── Recruitment ──
  "recruitment.view":                 ["HR","ADMIN","SUPER_ADMIN"],
  "recruitment.create_opening":       ["HR","ADMIN","SUPER_ADMIN"],
  "recruitment.manage_candidates":    ["HR","ADMIN","SUPER_ADMIN"],
  "recruitment.submit_hiring_request":["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "recruitment.participate_interview":["MANAGER","HR","ADMIN","SUPER_ADMIN"],

  // ── Onboarding ──
  "onboarding.view":                  ["HR","ADMIN","SUPER_ADMIN"],
  "onboarding.create_tasks":          ["HR","ADMIN","SUPER_ADMIN"],
  "onboarding.track":                 ["MANAGER","HR","ADMIN","SUPER_ADMIN"],

  // ── Performance ──
  "performance.view_own":             ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "performance.view_team":            ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "performance.set_goals":            ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "performance.review_goals":         ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "performance.submit_rating":        ["MANAGER","HR","ADMIN","SUPER_ADMIN"],
  "performance.manage_cycles":        ["HR","ADMIN","SUPER_ADMIN"],
  "performance.configure_kpis":       ["HR","ADMIN","SUPER_ADMIN"],

  // ── Documents ──
  "documents.view_own":               ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],
  "documents.upload_own":             ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],
  "documents.download_own":           ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","FINANCE","IT_ADMIN"],
  "documents.view_all":               ["HR","ADMIN","SUPER_ADMIN","FINANCE"],
  "documents.verify":                 ["HR","ADMIN","SUPER_ADMIN"],

  // ── Assets ──
  "assets.view_own":                  ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "assets.view_all":                  ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "assets.add":                       ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "assets.assign":                    ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "assets.return":                    ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "assets.maintenance":               ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "assets.report_issue":              ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "assets.request_return":            ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],

  // ── Helpdesk ──
  "helpdesk.create_ticket":           ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "helpdesk.view_own_tickets":        ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "helpdesk.reply_ticket":            ["EMPLOYEE","MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "helpdesk.view_all_tickets":        ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "helpdesk.manage_tickets":          ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "helpdesk.resolve_tickets":         ["IT_ADMIN","ADMIN","SUPER_ADMIN"],
  "helpdesk.view_analytics":          ["IT_ADMIN","ADMIN","SUPER_ADMIN","MANAGER"],
  "helpdesk.view_sla":                ["IT_ADMIN","ADMIN","SUPER_ADMIN"],

  // ── Analytics ──
  "analytics.view_team":              ["MANAGER","HR","ADMIN","SUPER_ADMIN","IT_ADMIN","FINANCE"],
  "analytics.view_full":              ["HR","ADMIN","SUPER_ADMIN","FINANCE"],

  // ── Settings ──
  "settings.view":                    ["SUPER_ADMIN"],
  "settings.company_config":          ["SUPER_ADMIN"],

  // ── Super Admin–only system features ──
  "users.manage":                     ["SUPER_ADMIN"],
  "users.create_admin":               ["SUPER_ADMIN"],
  "users.delete":                     ["SUPER_ADMIN"],
  "users.force_logout":               ["SUPER_ADMIN"],
  "roles.manage":                     ["SUPER_ADMIN"],
  "roles.create":                     ["SUPER_ADMIN"],
  "roles.delete":                     ["SUPER_ADMIN"],
  "roles.assign_permissions":         ["SUPER_ADMIN"],
  "billing.view":                     ["SUPER_ADMIN"],
  "billing.manage":                   ["SUPER_ADMIN"],
  "security.configure":               ["SUPER_ADMIN"],
  "audit.view_all":                   ["SUPER_ADMIN"],
  "audit.view_security":              ["SUPER_ADMIN"],
  "integrations.manage":              ["SUPER_ADMIN"],
  "company.manage":                   ["SUPER_ADMIN"],
  "company.create":                   ["SUPER_ADMIN"],
  "system.health":                    ["SUPER_ADMIN"],
  "system.license":                   ["SUPER_ADMIN"],
  "system.storage":                   ["SUPER_ADMIN"],

  // ── Admin-level user/employee management (subset) ──
  "users.create_employee":            ["ADMIN","SUPER_ADMIN"],
  "users.edit_employee":              ["ADMIN","SUPER_ADMIN"],
  "users.reset_password":             ["ADMIN","SUPER_ADMIN"],
  "roles.assign_existing":            ["ADMIN","SUPER_ADMIN"],
  "audit.view_operational":           ["ADMIN","SUPER_ADMIN"],

  // ── Analytics scope ──
  "analytics.view_billing":           ["SUPER_ADMIN"],
  "analytics.view_tenant":            ["SUPER_ADMIN"],
  "analytics.view_license":           ["SUPER_ADMIN"],

  // ── Calendar ──
  "calendar.view":                    ["SUPER_ADMIN","ADMIN","HR","MANAGER","FINANCE","IT_ADMIN","EMPLOYEE"],
};

// ── Helper function: check if role has permission ─────────────────────────────
export const can = (role, permission) => {
  if (!role || !permission) return false;
  return (PERMISSIONS[permission] || []).includes(role);
};

// ── Role metadata ─────────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Administrator",
  HR:          "HR Manager",
  MANAGER:     "Team Manager",
  FINANCE:     "Finance Admin",
  IT_ADMIN:    "IT Admin",
  EMPLOYEE:    "Employee",
};

export const ROLE_COLORS = {
  SUPER_ADMIN: { bg: "#fef3c7", text: "#d97706" },
  ADMIN:       { bg: "#dbeafe", text: "#2563eb" },
  HR:          { bg: "#f3e8ff", text: "#7c3aed" },
  MANAGER:     { bg: "#dcfce7", text: "#16a34a" },
  FINANCE:     { bg: "#fce7f3", text: "#be185d" },
  IT_ADMIN:    { bg: "#e0f2fe", text: "#0284c7" },
  EMPLOYEE:    { bg: "#f1f5f9", text: "#475569" },
};
