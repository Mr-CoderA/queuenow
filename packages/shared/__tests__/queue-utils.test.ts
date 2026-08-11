import { describe, expect, it } from "vitest";
import type { Ticket } from "../src/types";
import {
  calculateQueuePosition,
  DEFAULT_AVERAGE_SERVICE_MINUTES,
  estimateWaitTime,
  getWaitingTickets,
  sortTicketsByJoinTime,
  withQueueMetrics,
} from "../src/queue-utils";

function ticket(
  overrides: Partial<Ticket> & Pick<Ticket, "id" | "joined_at">,
): Ticket {
  return {
    queue_id: "queue-1",
    customer_name: "Customer",
    serving: false,
    created_by_id: "user-1",
    ...overrides,
  };
}

describe("sortTicketsByJoinTime", () => {
  it("orders by joined_at ascending", () => {
    const tickets = [
      ticket({ id: "b", joined_at: "2026-01-01T10:02:00.000Z" }),
      ticket({ id: "a", joined_at: "2026-01-01T10:00:00.000Z" }),
      ticket({ id: "c", joined_at: "2026-01-01T10:01:00.000Z" }),
    ];

    expect(sortTicketsByJoinTime(tickets).map((t) => t.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });
});

describe("getWaitingTickets", () => {
  it("excludes tickets that are currently serving", () => {
    const tickets = [
      ticket({
        id: "serving",
        joined_at: "2026-01-01T10:00:00.000Z",
        serving: true,
      }),
      ticket({ id: "wait-1", joined_at: "2026-01-01T10:01:00.000Z" }),
      ticket({ id: "wait-2", joined_at: "2026-01-01T10:02:00.000Z" }),
    ];

    expect(getWaitingTickets(tickets).map((t) => t.id)).toEqual([
      "wait-1",
      "wait-2",
    ]);
  });
});

describe("calculateQueuePosition", () => {
  const tickets = [
    ticket({
      id: "serving",
      joined_at: "2026-01-01T10:00:00.000Z",
      serving: true,
    }),
    ticket({ id: "first", joined_at: "2026-01-01T10:01:00.000Z" }),
    ticket({ id: "second", joined_at: "2026-01-01T10:02:00.000Z" }),
  ];

  it("returns 0 for the ticket currently being served", () => {
    expect(calculateQueuePosition(tickets, "serving")).toBe(0);
  });

  it("returns 1-based positions for waiting tickets", () => {
    expect(calculateQueuePosition(tickets, "first")).toBe(1);
    expect(calculateQueuePosition(tickets, "second")).toBe(2);
  });

  it("returns -1 when the ticket is missing", () => {
    expect(calculateQueuePosition(tickets, "missing")).toBe(-1);
  });
});

describe("estimateWaitTime", () => {
  it("returns 0 for non-positive positions", () => {
    expect(estimateWaitTime(0)).toBe(0);
    expect(estimateWaitTime(-1)).toBe(0);
  });

  it("multiplies position by average service minutes", () => {
    expect(estimateWaitTime(1)).toBe(DEFAULT_AVERAGE_SERVICE_MINUTES);
    expect(estimateWaitTime(3, 4)).toBe(12);
  });

  it("returns 0 when average service minutes is negative", () => {
    expect(estimateWaitTime(2, -1)).toBe(0);
  });
});

describe("withQueueMetrics", () => {
  it("attaches position and estimated wait for each ticket", () => {
    const tickets = [
      ticket({
        id: "serving",
        joined_at: "2026-01-01T10:00:00.000Z",
        serving: true,
      }),
      ticket({ id: "first", joined_at: "2026-01-01T10:01:00.000Z" }),
      ticket({ id: "second", joined_at: "2026-01-01T10:02:00.000Z" }),
    ];

    const enriched = withQueueMetrics(tickets, 5);

    expect(enriched).toEqual([
      {
        ...tickets[0],
        position: 0,
        estimated_wait_minutes: 0,
      },
      {
        ...tickets[1],
        position: 1,
        estimated_wait_minutes: 5,
      },
      {
        ...tickets[2],
        position: 2,
        estimated_wait_minutes: 10,
      },
    ]);
  });
});
