/** Shared domain types for QueueNow. */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Queue {
  id: string;
  name: string;
  created_by_id: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  queue_id: string;
  customer_name: string;
  joined_at: string;
  serving: boolean;
  created_by_id: string;
}

/** Ticket with live queue metrics for API/UI consumers. */
export interface TicketWithMetrics extends Ticket {
  position: number;
  estimated_wait_minutes: number;
}

export type PublicUser = Omit<User, "password_hash">;

export interface AuthTokenResponse {
  token: string;
  user: PublicUser;
}
