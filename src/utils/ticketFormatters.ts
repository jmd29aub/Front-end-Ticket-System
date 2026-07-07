import type { ActiveTicketStatus, TicketPriority } from "@/types/tickets";

export function formatTicketStatusForFrontend(status: string): ActiveTicketStatus {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "open") {
    return "Open";
  }

  if (normalizedStatus === "in_progress") {
    return "In Progress";
  }

  if (normalizedStatus === "resolved" || normalizedStatus === "closed") {
    return "Resolved";
  }

  return "Waiting for Client";
}

export function formatTicketPriorityForFrontend(priority: string): TicketPriority {
  const normalizedPriority = priority.toLowerCase();

  if (normalizedPriority === "high") {
    return "High";
  }

  if (normalizedPriority === "low") {
    return "Low";
  }

  return "Medium";
}
