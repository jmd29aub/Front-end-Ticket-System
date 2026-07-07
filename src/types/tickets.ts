export type TicketStatus =
  | "Open"
  | "In Progress"
  | "Resolved"
  | "Waiting for Client"
  | "Closed";

export type ActiveTicketStatus = Exclude<TicketStatus, "Closed">;

export type TicketPriority = "High" | "Medium" | "Low";

export type TicketCategory =
  | "General"
  | "Account"
  | "Account Access"
  | "Billing"
  | "Bug Report"
  | "Feature Request"
  | "Technical Issue";
