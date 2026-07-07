import { apiJsonFetch } from "@/services/authHeaders";

export interface UpdateTicketPayload {
  title?: string;
  category?: string;
  priority?: string;
  description?: string;
  status?: string;
  changed_by_type?: string;
  changed_by_name?: string;
}

export interface CreateTicketCommentPayload {
  author_type: string;
  author_name?: string;
  message: string;
}

export function updateTicket(ticketId: number | string, payload: UpdateTicketPayload) {
  return apiJsonFetch(`/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createTicketComment(ticketId: number | string, payload: CreateTicketCommentPayload) {
  return apiJsonFetch(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
