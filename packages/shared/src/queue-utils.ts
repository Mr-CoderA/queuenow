import type { Ticket, TicketWithMetrics } from "./types";

/** Default average minutes to fully serve one ticket. */
export const DEFAULT_AVERAGE_SERVICE_MINUTES = 5;

/**
 * Sort tickets into queue order (earliest join first).
 * Stable for equal timestamps by id.
 */
export function sortTicketsByJoinTime(tickets: readonly Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const byTime = Date.parse(a.joined_at) - Date.parse(b.joined_at);
    if (byTime !== 0) {
      return byTime;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Tickets still waiting (not currently being served), in join order.
 */
export function getWaitingTickets(tickets: readonly Ticket[]): Ticket[] {
  return sortTicketsByJoinTime(tickets).filter((ticket) => !ticket.serving);
}

/**
 * 1-based position among waiting tickets.
 * Returns 0 when the ticket is currently being served.
 * Returns -1 when the ticket is not in the list.
 */
export function calculateQueuePosition(
  tickets: readonly Ticket[],
  ticketId: string,
): number {
  const match = tickets.find((ticket) => ticket.id === ticketId);
  if (!match) {
    return -1;
  }
  if (match.serving) {
    return 0;
  }

  const waiting = getWaitingTickets(tickets);
  const index = waiting.findIndex((ticket) => ticket.id === ticketId);
  return index === -1 ? -1 : index + 1;
}

/**
 * Estimated wait in whole minutes for a waiting position.
 * Position <= 0 (serving / unknown) yields 0.
 * Assumes one ticket is actively served; first waiter waits one service interval.
 */
export function estimateWaitTime(
  position: number,
  averageServiceMinutes: number = DEFAULT_AVERAGE_SERVICE_MINUTES,
): number {
  if (position <= 0 || averageServiceMinutes < 0) {
    return 0;
  }
  return position * averageServiceMinutes;
}

/**
 * Attach position and estimated wait to every ticket in a queue snapshot.
 */
export function withQueueMetrics(
  tickets: readonly Ticket[],
  averageServiceMinutes: number = DEFAULT_AVERAGE_SERVICE_MINUTES,
): TicketWithMetrics[] {
  return sortTicketsByJoinTime(tickets).map((ticket) => {
    const position = calculateQueuePosition(tickets, ticket.id);
    return {
      ...ticket,
      position,
      estimated_wait_minutes: estimateWaitTime(position, averageServiceMinutes),
    };
  });
}
