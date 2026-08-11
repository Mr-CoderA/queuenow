import { http, HttpResponse } from "msw";
import type {
  AuthTokenResponse,
  PublicUser,
  Queue,
  Ticket,
  TicketWithMetrics,
} from "@queuenow/shared";
import { withQueueMetrics } from "@queuenow/shared";

const demoUser: PublicUser = {
  id: "user-1",
  email: "demo@example.com",
  created_at: "2026-01-01T00:00:00.000Z",
};

let queues: Queue[] = [
  {
    id: "queue-1",
    name: "Front desk",
    created_by_id: demoUser.id,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

let tickets: Ticket[] = [
  {
    id: "ticket-1",
    queue_id: "queue-1",
    customer_name: "Alex",
    joined_at: "2026-01-01T00:05:00.000Z",
    serving: false,
    created_by_id: demoUser.id,
  },
  {
    id: "ticket-2",
    queue_id: "queue-1",
    customer_name: "Blake",
    joined_at: "2026-01-01T00:10:00.000Z",
    serving: false,
    created_by_id: demoUser.id,
  },
];

function authResponse(): AuthTokenResponse {
  return { token: "demo-token", user: demoUser };
}

function requireAuth(request: Request): boolean {
  const header = request.headers.get("authorization");
  return Boolean(header?.startsWith("Bearer ") && header.length > "Bearer ".length);
}

function ticketsForQueue(queueId: string): TicketWithMetrics[] {
  return withQueueMetrics(tickets.filter((ticket) => ticket.queue_id === queueId));
}

/** In-memory MSW handlers mirroring the QueueNow REST API for local UI development and tests. */
export const apiHandlers = [
  http.post("/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: "email and password are required" },
        { status: 400 },
      );
    }
    return HttpResponse.json(authResponse(), { status: 201 });
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: "email and password are required" },
        { status: 400 },
      );
    }
    return HttpResponse.json(authResponse(), { status: 200 });
  }),

  http.get("/api/queues", ({ request }) => {
    if (!requireAuth(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(queues);
  }),

  http.post("/api/queues", async ({ request }) => {
    if (!requireAuth(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as { name?: string };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return HttpResponse.json({ error: "name is required" }, { status: 400 });
    }
    const queue: Queue = {
      id: `queue-${queues.length + 1}`,
      name,
      created_by_id: demoUser.id,
      created_at: new Date().toISOString(),
    };
    queues = [...queues, queue];
    return HttpResponse.json(queue, { status: 201 });
  }),

  http.get("/api/queues/:queueId/tickets", ({ params, request }) => {
    if (!requireAuth(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const queueId = String(params.queueId);
    const queue = queues.find((item) => item.id === queueId);
    if (!queue) {
      return HttpResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return HttpResponse.json(ticketsForQueue(queueId));
  }),

  http.post("/api/queues/:queueId/tickets", async ({ params, request }) => {
    if (!requireAuth(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const queueId = String(params.queueId);
    const queue = queues.find((item) => item.id === queueId);
    if (!queue) {
      return HttpResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    const body = (await request.json()) as { customer_name?: string };
    const customerName =
      typeof body.customer_name === "string" ? body.customer_name.trim() : "";
    if (!customerName) {
      return HttpResponse.json(
        { error: "customer_name is required" },
        { status: 400 },
      );
    }
    const ticket: Ticket = {
      id: `ticket-${tickets.length + 1}`,
      queue_id: queueId,
      customer_name: customerName,
      joined_at: new Date().toISOString(),
      serving: false,
      created_by_id: demoUser.id,
    };
    tickets = [...tickets, ticket];
    return HttpResponse.json(ticket, { status: 201 });
  }),

  http.patch("/api/queues/:queueId/tickets/:ticketId", async ({ params, request }) => {
    if (!requireAuth(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const queueId = String(params.queueId);
    const ticketId = String(params.ticketId);
    const queue = queues.find((item) => item.id === queueId);
    if (!queue) {
      return HttpResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    const body = (await request.json()) as { serving?: boolean };
    if (typeof body.serving !== "boolean") {
      return HttpResponse.json(
        { error: "serving boolean is required" },
        { status: 400 },
      );
    }
    const index = tickets.findIndex(
      (ticket) => ticket.id === ticketId && ticket.queue_id === queueId,
    );
    if (index === -1) {
      return HttpResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    const updated: Ticket = { ...tickets[index], serving: body.serving };
    tickets = [
      ...tickets.slice(0, index),
      updated,
      ...tickets.slice(index + 1),
    ];
    return HttpResponse.json(updated);
  }),
];

export function resetApiMockState(): void {
  queues = [
    {
      id: "queue-1",
      name: "Front desk",
      created_by_id: demoUser.id,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ];
  tickets = [
    {
      id: "ticket-1",
      queue_id: "queue-1",
      customer_name: "Alex",
      joined_at: "2026-01-01T00:05:00.000Z",
      serving: false,
      created_by_id: demoUser.id,
    },
    {
      id: "ticket-2",
      queue_id: "queue-1",
      customer_name: "Blake",
      joined_at: "2026-01-01T00:10:00.000Z",
      serving: false,
      created_by_id: demoUser.id,
    },
  ];
}
