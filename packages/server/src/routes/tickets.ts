import { Router, type RequestHandler } from "express";
import type { QueryBuilders } from "../db/query";
import { createAuthMiddleware } from "./auth";

type AuthedRequest = Parameters<RequestHandler>[0] & {
  userId?: string;
};

function paramValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return undefined;
}

export function createTicketsRouter(queries: QueryBuilders): Router {
  const router = Router({ mergeParams: true });
  const requireAuth = createAuthMiddleware();

  router.get("/", requireAuth, async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const queueId = paramValue(req.params.queueId);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!queueId) {
      res.status(400).json({ error: "queueId is required" });
      return;
    }

    const queue = await queries.findQueueById(queueId);
    if (!queue || queue.created_by_id !== userId) {
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const tickets = await queries.listTicketsWithMetrics(queueId);
    res.status(200).json(tickets);
  });

  router.post("/", requireAuth, async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const queueId = paramValue(req.params.queueId);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!queueId) {
      res.status(400).json({ error: "queueId is required" });
      return;
    }

    const queue = await queries.findQueueById(queueId);
    if (!queue || queue.created_by_id !== userId) {
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const customerName =
      typeof req.body?.customer_name === "string"
        ? req.body.customer_name.trim()
        : "";
    if (!customerName) {
      res.status(400).json({ error: "customer_name is required" });
      return;
    }

    const ticket = await queries.addTicket({
      queue_id: queueId,
      customer_name: customerName,
      created_by_id: userId,
    });
    res.status(201).json(ticket);
  });

  router.patch("/:ticketId", requireAuth, async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const queueId = paramValue(req.params.queueId);
    const ticketId = paramValue(req.params.ticketId);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!queueId || !ticketId) {
      res.status(400).json({ error: "queueId and ticketId are required" });
      return;
    }

    const queue = await queries.findQueueById(queueId);
    if (!queue || queue.created_by_id !== userId) {
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const existing = await queries.findTicketById(ticketId);
    if (!existing || existing.queue_id !== queueId) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    if (typeof req.body?.serving !== "boolean") {
      res.status(400).json({ error: "serving boolean is required" });
      return;
    }

    const updated = await queries.updateTicketStatus(ticketId, {
      serving: req.body.serving,
    });
    if (!updated) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.status(200).json(updated);
  });

  return router;
}
