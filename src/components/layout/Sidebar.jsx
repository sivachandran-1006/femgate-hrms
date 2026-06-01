import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { NavLink, Stack, ScrollArea, Divider } from "@mantine/core";
import {
  IconLayoutDashboard, IconUsers, IconBuildingCommunity, IconClock, IconCalendarOff,
  IconCurrencyRupee, IconBriefcase, IconUserPlus, IconTarget, IconPackage,
  IconLifebuoy, IconBook, IconChartBar, IconSettings, IconLogout
} from "@tabler/icons-react";

const MENU_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   Icon: IconLayoutDashboard },
  { id: "employees",   label: "Employees",   Icon: IconUsers           },
  { id: "departments", label: "Departments", Icon: IconBuildingCommunity       },
  { id: "attendance",  label: "Attendance",  Icon: IconClock           },
  { id: "leave",       label: "Leave",       Icon: IconCalendarOff      },
  { id: "payroll",     label: "Payroll",     Icon: IconCurrencyRupee     },
  { id: "recruitment", label: "Recruitment", Icon: IconBriefcase       },
  { id: "onboarding",  label: "Onboarding",  Icon: IconUserPlus        },
  { id: "performance", label: "Performance", Icon: IconTarget          },
  { id: "assets",      label: "Assets",      Icon: IconPackage         },
  { id: "helpdesk",    label: "Helpdesk",    Icon: IconLifebuoy        },
  { id: "lms",         label: "Learning",    Icon: IconBook        },
  { id: "analytics",   label: "Analytics",   Icon: IconChartBar       },
  { id: "settings",    label: "Settings",    Icon: IconSettings        },
];

const Sidebar = ({ onLogout, onCloseMobile }) => {
  const location = useLocation();

  return (
    <>
      <ScrollArea style={{ flex: 1 }} type="never">
        <Stack gap="xs">
          {MENU_ITEMS.map(({ id, label, Icon }) => {
            const path = `/${id}`;
            const active = location.pathname === path;
            return (
              <NavLink
                key={id}
                component={RouterNavLink}
                to={path}
                label={label}
                leftSection={<Icon size={20} stroke={1.5} />}
                active={active}
                variant="filled"
                color="primary"
                onClick={onCloseMobile}
                style={{ borderRadius: 8 }}
              />
            );
          })}
        </Stack>
      </ScrollArea>
      <Divider my="sm" />
      <NavLink
        label="Logout"
        leftSection={<IconLogout size={20} stroke={1.5} />}
        onClick={() => {
          onLogout();
          onCloseMobile();
        }}
        color="red"
        active
        variant="subtle"
        style={{ borderRadius: 8 }}
      />
    </>
  );
};

export default Sidebar;
