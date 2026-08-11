import { Router, type RequestHandler } from "express";
import type { QueryBuilders } from "../db/query";
import { createAuthMiddleware } from "./auth";

type AuthedRequest = Parameters<RequestHandler>[0] & {
  userId?: string;
};

export function createQueuesRouter(queries: QueryBuilders): Router {
  const router = Router();
  const requireAuth = createAuthMiddleware();

  router.get("/", requireAuth, async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const queues = await queries.listQueuesForUser(userId);
    res.status(200).json(queues);
  });

  router.post("/", requireAuth, async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const queue = await queries.createQueueForUser({
      name,
      created_by_id: userId,
    });
    res.status(201).json(queue);
  });

  return router;
}
