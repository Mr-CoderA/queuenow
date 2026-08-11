import type { Ticket, TicketWithMetrics } from "@queuenow/shared";
import {
  calculateQueuePosition,
  DEFAULT_AVERAGE_SERVICE_MINUTES,
  estimateWaitTime,
  withQueueMetrics,
} from "@queuenow/shared";

/**
 * Server-side wrappers around shared queue calculation helpers.
 */

export function enrichTickets(
  tickets: readonly Ticket[],
  averageServiceMinutes: number = DEFAULT_AVERAGE_SERVICE_MINUTES,
): TicketWithMetrics[] {
  return withQueueMetrics(tickets, averageServiceMinutes);
}

export function ticketPosition(
  tickets: readonly Ticket[],
  ticketId: string,
): number {
  return calculateQueuePosition(tickets, ticketId);
}

export function ticketWaitMinutes(
  position: number,
  averageServiceMinutes: number = DEFAULT_AVERAGE_SERVICE_MINUTES,
): number {
  return estimateWaitTime(position, averageServiceMinutes);
}
