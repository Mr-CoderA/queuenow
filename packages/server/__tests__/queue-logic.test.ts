import { describe, expect, it } from "vitest";
import type { Ticket } from "@queuenow/shared";
import {
  enrichTickets,
  ticketPosition,
  ticketWaitMinutes,
} from "../src/lib/queue-logic";

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

describe("enrichTickets", () => {
  it("adds position and estimated wait via shared queue helpers", () => {
    const tickets = [
      ticket({
        id: "serving",
        joined_at: "2026-01-01T10:00:00.000Z",
        serving: true,
      }),
      ticket({ id: "first", joined_at: "2026-01-01T10:01:00.000Z" }),
      ticket({ id: "second", joined_at: "2026-01-01T10:02:00.000Z" }),
    ];

    expect(enrichTickets(tickets, 5)).toEqual([
      { ...tickets[0], position: 0, estimated_wait_minutes: 0 },
      { ...tickets[1], position: 1, estimated_wait_minutes: 5 },
      { ...tickets[2], position: 2, estimated_wait_minutes: 10 },
    ]);
  });
});

describe("ticketPosition", () => {
  it("returns 1-based waiting position", () => {
    const tickets = [
      ticket({ id: "a", joined_at: "2026-01-01T10:00:00.000Z" }),
      ticket({ id: "b", joined_at: "2026-01-01T10:01:00.000Z" }),
    ];
    expect(ticketPosition(tickets, "b")).toBe(2);
  });
});

describe("ticketWaitMinutes", () => {
  it("multiplies position by average service minutes", () => {
    expect(ticketWaitMinutes(2, 5)).toBe(10);
  });
});
