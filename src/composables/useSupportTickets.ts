import { reactive } from "vue";

export type SupportStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
export type SupportPriority = "High" | "Medium" | "Low";

export interface SupportTicket {
  id: string;
  client: string;
  clientEmail: string;
  subject: string;
  title: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo: string;
  category: string;
  createdAt: string;
  lastUpdated: string;
  date: string;
}

const supportTickets = reactive<SupportTicket[]>([
  {
    id: "1025",
    client: "Joe Dib",
    clientEmail: "joe.m.deeb@gmail.com",
    subject: "Login issue",
    title: "Login Issue",
    description: "The client cannot log in to their account after resetting the password.",
    priority: "High",
    status: "In Progress",
    assignedTo: "John Doe",
    category: "Account Access",
    createdAt: "Sept 20, 2025 at 10:15 AM",
    lastUpdated: "Sept 21, 2025 at 11:00 AM",
    date: "Sept 20, 2025",
  },
  {
    id: "1024",
    client: "Joe Dib",
    clientEmail: "joe.m.deeb@gmail.com",
    subject: "Billing issue",
    title: "Billing Issue",
    description: "Payment was deducted but the invoice still appears unpaid.",
    priority: "Medium",
    status: "Open",
    assignedTo: "John Doe",
    category: "Billing",
    createdAt: "Sept 19, 2025 at 3:15 PM",
    lastUpdated: "Sept 19, 2025 at 3:20 PM",
    date: "Yesterday",
  },
  {
    id: "1023",
    client: "Joe Dib",
    clientEmail: "joe.m.deeb@gmail.com",
    subject: "Feature request",
    title: "Feature Request",
    description: "The client is requesting a new dashboard feature.",
    priority: "Low",
    status: "Waiting for Client",
    assignedTo: "John Doe",
    category: "Feature Request",
    createdAt: "Sept 18, 2025 at 12:00 PM",
    lastUpdated: "Today at 9:30 AM",
    date: "Today",
  },
  {
    id: "1022",
    client: "Joe Dib",
    clientEmail: "joe.m.deeb@gmail.com",
    subject: "Login issue",
    title: "Login Issue",
    description: "The client had a previous login issue that was resolved.",
    priority: "High",
    status: "Resolved",
    assignedTo: "John Doe",
    category: "Account Access",
    createdAt: "Sept 17, 2025 at 2:00 PM",
    lastUpdated: "Today at 10:30 AM",
    date: "Today",
  },
]);

export function useSupportTickets() {
  function getSupportTicketById(ticketId: string) {
    const cleanId = ticketId.replace("#", "");

    return supportTickets.find((ticket) => ticket.id === cleanId);
  }

  function updateSupportTicket(
    ticketId: string,
    updates: Partial<Pick<SupportTicket, "status" | "priority" | "assignedTo" | "category">>,
  ) {
    const ticket = getSupportTicketById(ticketId);

    if (!ticket) {
      return;
    }

    Object.assign(ticket, {
      ...updates,
      lastUpdated: "Just now",
      date: "Today",
    });
  }

  return {
    supportTickets,
    getSupportTicketById,
    updateSupportTicket,
  };
}
