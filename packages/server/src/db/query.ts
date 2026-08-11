import type { Queue, Ticket, TicketWithMetrics, User } from "@queuenow/shared";
import { withQueueMetrics } from "@queuenow/shared";

/** Persistence surface used by query builders; implement with Drizzle or an in-memory mock. */
export interface Dao {
  createUser(input: {
    email: string;
    password_hash: string;
  }): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;

  listQueuesByUser(userId: string): Promise<Queue[]>;
  createQueue(input: {
    name: string;
    created_by_id: string;
  }): Promise<Queue>;
  findQueueById(id: string): Promise<Queue | null>;

  listTicketsByQueue(queueId: string): Promise<Ticket[]>;
  createTicket(input: {
    queue_id: string;
    customer_name: string;
    created_by_id: string;
  }): Promise<Ticket>;
  findTicketById(id: string): Promise<Ticket | null>;
  updateTicket(
    id: string,
    patch: { serving?: boolean },
  ): Promise<Ticket | null>;
}

export interface QueryBuilders {
  createUser(input: {
    email: string;
    password_hash: string;
  }): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;

  listQueuesForUser(userId: string): Promise<Queue[]>;
  createQueueForUser(input: {
    name: string;
    created_by_id: string;
  }): Promise<Queue>;
  findQueueById(id: string): Promise<Queue | null>;

  listTicketsWithMetrics(queueId: string): Promise<TicketWithMetrics[]>;
  addTicket(input: {
    queue_id: string;
    customer_name: string;
    created_by_id: string;
  }): Promise<Ticket>;
  updateTicketStatus(
    ticketId: string,
    patch: { serving?: boolean },
  ): Promise<Ticket | null>;
  findTicketById(id: string): Promise<Ticket | null>;
}

/**
 * Query builders that delegate all persistence to the provided DAO.
 * Business enrichment (queue metrics) is applied here, not in the DAO.
 */
export function createQueryBuilders(dao: Dao): QueryBuilders {
  return {
    createUser(input) {
      return dao.createUser(input);
    },
    findUserByEmail(email) {
      return dao.findUserByEmail(email);
    },
    findUserById(id) {
      return dao.findUserById(id);
    },

    listQueuesForUser(userId) {
      return dao.listQueuesByUser(userId);
    },
    createQueueForUser(input) {
      return dao.createQueue(input);
    },
    findQueueById(id) {
      return dao.findQueueById(id);
    },

    async listTicketsWithMetrics(queueId) {
      const tickets = await dao.listTicketsByQueue(queueId);
      return withQueueMetrics(tickets);
    },
    addTicket(input) {
      return dao.createTicket(input);
    },
    updateTicketStatus(ticketId, patch) {
      return dao.updateTicket(ticketId, patch);
    },
    findTicketById(id) {
      return dao.findTicketById(id);
    },
  };
}
