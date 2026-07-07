import type { ActiveTicketStatus, TicketCategory, TicketPriority, TicketStatus } from "@/types/tickets";

export const TICKET_STATUSES = [
  "Open",
  "In Progress",
  "Waiting for Client",
  "Resolved",
  "Closed",
] as const satisfies readonly TicketStatus[];

export const ACTIVE_TICKET_STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Waiting for Client",
  "Resolved",
] as const satisfies readonly ActiveTicketStatus[];

export const TICKET_PRIORITY_OPTIONS = [
  "High",
  "Medium",
  "Low",
] as const satisfies readonly TicketPriority[];

export const CREATE_TICKET_CATEGORY_OPTIONS = [
  "Account",
  "Billing",
  "Bug Report",
  "Technical Issue",
] as const satisfies readonly TicketCategory[];

export const CLIENT_EDIT_CATEGORY_OPTIONS = [
  "General",
  "Account",
  "Billing",
  "Bug Report",
  "Technical Issue",
] as const satisfies readonly TicketCategory[];

export const SUPPORT_FILTER_CATEGORY_OPTIONS = [
  "Account Access",
  "Billing",
  "Feature Request",
  "Technical Issue",
] as const satisfies readonly TicketCategory[];

export const SUPPORT_MANAGE_CATEGORY_OPTIONS = [
  "General",
  "Account",
  "Account Access",
  "Billing",
  "Bug Report",
  "Feature Request",
  "Technical Issue",
] as const satisfies readonly TicketCategory[];
