import express, { type Express } from "express";
import { createQueryBuilders, type Dao } from "./db/query";
import { createAuthRouter } from "./routes/auth";
import { createQueuesRouter } from "./routes/queues";
import { createTicketsRouter } from "./routes/tickets";

export { users, queues, tickets } from "./db/schema";
export {
  createQueryBuilders,
  type Dao,
  type QueryBuilders,
} from "./db/query";
export {
  enrichTickets,
  ticketPosition,
  ticketWaitMinutes,
} from "./lib/queue-logic";

/**
 * Build the Express application against a DAO implementation.
 * Does not open a database connection; callers supply the DAO (e.g. Drizzle-backed or test mock).
 */
export function createApp(dao: Dao): Express {
  const queries = createQueryBuilders(dao);
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/api/auth", createAuthRouter(queries));
  app.use("/api/queues", createQueuesRouter(queries));
  app.use("/api/queues/:queueId/tickets", createTicketsRouter(queries));

  return app;
}
