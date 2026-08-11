import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { TicketWithMetrics } from "@queuenow/shared";
import { QueueDetail } from "../src/components/queues/QueueDetail";

const sampleTickets: TicketWithMetrics[] = [
  {
    id: "ticket-1",
    queue_id: "queue-1",
    customer_name: "Alex",
    joined_at: "2026-01-01T00:05:00.000Z",
    serving: false,
    created_by_id: "user-1",
    position: 1,
    estimated_wait_minutes: 5,
  },
  {
    id: "ticket-2",
    queue_id: "queue-1",
    customer_name: "Blake",
    joined_at: "2026-01-01T00:10:00.000Z",
    serving: true,
    created_by_id: "user-1",
    position: 0,
    estimated_wait_minutes: 0,
  },
];

describe("QueueDetail", () => {
  it("renders ticket positions and estimated waits", () => {
    render(
      <MemoryRouter initialEntries={["/queues/queue-1"]}>
        <Routes>
          <Route
            path="/queues/:queueId"
            element={
              <QueueDetail
                queueId="queue-1"
                initialTickets={sampleTickets}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText(/Position 1/)).toBeInTheDocument();
    expect(screen.getByText(/~5 min wait/)).toBeInTheDocument();
    expect(screen.getByText("Blake")).toBeInTheDocument();
    expect(screen.getByText("Currently serving")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark serving" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark done" })).toBeInTheDocument();
  });
});
