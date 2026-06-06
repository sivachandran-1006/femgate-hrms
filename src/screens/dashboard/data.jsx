import { UserCheck, Calendar, AlertCircle, Clock, Award } from "lucide-react";

export const MONTHLY_HEADCOUNT = [
  { month:"Jan",employees:8, joiners:1 },{ month:"Feb",employees:8, joiners:0 },
  { month:"Mar",employees:9, joiners:1 },{ month:"Apr",employees:10,joiners:1 },
  { month:"May",employees:11,joiners:1 },{ month:"Jun",employees:13,joiners:2 },
];

export const ATTENDANCE_WEEK = [
  { day:"Mon",present:11,absent:1,leave:1 },{ day:"Tue",present:12,absent:0,leave:1 },
  { day:"Wed",present:10,absent:2,leave:1 },{ day:"Thu",present:12,absent:0,leave:1 },
  { day:"Fri",present:11,absent:1,leave:1 },{ day:"Sat",present:5, absent:0,leave:0 },
];

export const PAYROLL_MONTHS = [
  { month:"Jan",payroll:520000 },{ month:"Feb",payroll:535000 },
  { month:"Mar",payroll:548000 },{ month:"Apr",payroll:562000 },
  { month:"May",payroll:578000 },{ month:"Jun",payroll:591000 },
];

export const LEAVE_PIPELINE = [
  { name:"Casual Leave", value:4, color: "var(--mantine-color-yellow-5)" },
  { name:"Sick Leave",   value:3, color: "var(--mantine-color-red-5)"  },
  { name:"Annual Leave", value:2, color: "var(--mantine-color-blue-5)" },
];

export const ANNOUNCEMENTS = [
  { id:1, title:"Q2 Appraisal Cycle Begins",   date:"Jun 5, 2026",  tag:"HR",      color:"blue" },
  { id:2, title:"Office Closed — National Day", date:"Jun 10, 2026", tag:"Admin",   color:"yellow" },
  { id:3, title:"New Payroll Policy Effective",  date:"Jun 15, 2026", tag:"Finance", color:"green" },
  { id:4, title:"Team Building Event",           date:"Jun 20, 2026", tag:"HR",      color:"violet"  },
];

export const UPCOMING_EVENTS = [
  { label:"Arjun Kumar joining",  date:"Jun 3",  color:"green" },
  { label:"Q2 Appraisal kickoff", date:"Jun 5",  color:"blue" },
  { label:"Payroll processing",   date:"Jun 10", color:"yellow" },
  { label:"National Holiday",     date:"Jun 10", color:"red"  },
];

export const RECENT_ACTIVITY = [
  { id:1, name:"Arjun Kumar", action:"Joined onboarding",       time:"2h ago",  type:"join"     },
  { id:2, name:"Safeer",      action:"Leave request approved",   time:"3h ago",  type:"leave"    },
  { id:3, name:"Suriya",      action:"Performance review due",   time:"1d ago",  type:"alert"    },
  { id:4, name:"Mani",        action:"Check-in recorded",        time:"1d ago",  type:"attend"   },
  { id:5, name:"Big Kundi",   action:"Onboarding completed",     time:"2d ago",  type:"complete" },
];

export const ACTIVITY_ICON = {
  join:     { icon:<UserCheck   size={14}/>, color:"green" },
  leave:    { icon:<Calendar    size={14}/>, color:"yellow" },
  alert:    { icon:<AlertCircle size={14}/>, color:"red"  },
  attend:   { icon:<Clock       size={14}/>, color:"blue" },
  complete: { icon:<Award       size={14}/>, color:"violet"  },
};

export const NOTIF_BY_ROLE = {
  SUPER_ADMIN: [
    { id:1, title:"Arjun Kumar submitted a leave request",  time:"2 min ago", type:"leave",   dotColor:"orange"  },
    { id:2, title:"Payroll for May 2026 processed",         time:"1h ago",    type:"payroll", dotColor:"green" },
    { id:3, title:"Q2 Appraisal cycle starts Jun 5",        time:"1d ago",    type:"info",    dotColor:"cyan"    },
    { id:4, title:"Safeer's sick leave approved",           time:"2d ago",    type:"leave",   dotColor:"orange"  },
  ],
  ADMIN: [
    { id:1, title:"Arjun Kumar submitted a leave request",  time:"2 min ago", type:"leave",   dotColor:"orange"  },
    { id:2, title:"Payroll for May 2026 processed",         time:"1h ago",    type:"payroll", dotColor:"green" },
    { id:3, title:"Asset LT-009 assigned to Mani",          time:"2d ago",    type:"asset",   dotColor:"violet"  },
  ],
  HR: [
    { id:1, title:"Aravinth submitted a leave request",     time:"30 min ago",type:"leave",   dotColor:"orange"  },
    { id:2, title:"Priya onboarding completed",             time:"2h ago",    type:"success", dotColor:"green" },
    { id:3, title:"Performance review cycle starts Jun 5",  time:"1d ago",    type:"info",    dotColor:"cyan"    },
  ],
  MANAGER: [
    { id:1, title:"Aravinth requested leave Jun 2–3",       time:"1h ago",    type:"leave",   dotColor:"orange"  },
    { id:2, title:"Sabari's performance review is due",     time:"1d ago",    type:"alert",   dotColor:"red"  },
    { id:3, title:"Team standup at 10 AM today",            time:"2d ago",    type:"info",    dotColor:"cyan"    },
  ],
  FINANCE: [
    { id:1, title:"May 2026 payroll processed successfully", time:"1h ago",   type:"payroll", dotColor:"green" },
    { id:2, title:"New payroll policy effective Jun 15",     time:"1d ago",   type:"info",    dotColor:"cyan"    },
    { id:3, title:"Safeer expense claim pending approval",   time:"2d ago",   type:"leave",   dotColor:"orange"  },
  ],
  IT_ADMIN: [
    { id:1, title:"Asset LT-009 reported as faulty",         time:"30m ago",  type:"asset",   dotColor:"orange"  },
    { id:2, title:"New helpdesk ticket from Suriya",         time:"1h ago",   type:"leave",   dotColor:"red"  },
    { id:3, title:"Server maintenance window: Jun 8 11pm",   time:"2d ago",   type:"info",    dotColor:"cyan"    },
  ],
  EMPLOYEE: [
    { id:1, title:"Your leave request was approved",         time:"3h ago",   type:"success", dotColor:"green" },
    { id:2, title:"Q2 appraisal form is due Jun 10",         time:"1d ago",   type:"alert",   dotColor:"red"  },
    { id:3, title:"Team building event on Jun 20",           time:"2d ago",   type:"info",    dotColor:"cyan"    },
  ],
};
