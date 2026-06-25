export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "High" | "Medium" | "Low";

export interface TicketProgressDates {
  submitted: string;
  open: string;
  inProgress: string;
  resolved?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  date: string;
  category: string;
  client: string;
  createdAt: string;
  lastUpdated: string;
  progress: TicketProgressDates;
}

export const tickets: Ticket[] = [
  {
    id: "1025",
    subject: "Login issue",
    title: "Login Issue",
    description: "I cannot log in to my account after resetting my password...",
    priority: "High",
    status: "In Progress",
    date: "Today",
    category: "Account Access",
    client: "JD",
    createdAt: "Sept 20, 2025 at 10:15 AM",
    lastUpdated: "Sept 21, 2025 at 11:00 AM",
    progress: {
      submitted: "Sept 20, 10:15 AM",
      open: "Sept 20, 10:30 AM",
      inProgress: "Sept 21, 11 AM",
    },
  },
  {
    id: "1024",
    subject: "Billing issue",
    title: "Billing Issue",
    description: "Payment was deducted but the invoice still appears unpaid.",
    priority: "Medium",
    status: "Open",
    date: "Yesterday",
    category: "Billing",
    client: "KN",
    createdAt: "Sept 19, 2025 at 3:15 PM",
    lastUpdated: "Sept 19, 2025 at 3:20 PM",
    progress: {
      submitted: "Sept 19, 3:15 PM",
      open: "Sept 19, 3:20 PM",
      inProgress: "Pending",
    },
  },
  {
    id: "1023",
    subject: "Bug report",
    title: "Bug Report",
    description: "Some dashboard rows are not aligned correctly.",
    priority: "Low",
    status: "Resolved",
    date: "Sept 20, 2025",
    category: "Bug Report",
    client: "LF",
    createdAt: "Sept 18, 2025 at 1:00 PM",
    lastUpdated: "Sept 20, 2025 at 9:00 AM",
    progress: {
      submitted: "Sept 18, 1:00 PM",
      open: "Sept 18, 1:30 PM",
      inProgress: "Sept 19, 10 AM",
      resolved: "Sept 20, 9 AM",
    },
  },
];
