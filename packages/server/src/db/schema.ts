import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Drizzle schema for managed PostgreSQL.
 * Connection is supplied at runtime via the DATABASE_URL environment variable.
 */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
});

export const queues = pgTable("queues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_by_id: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  queue_id: uuid("queue_id")
    .notNull()
    .references(() => queues.id),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  joined_at: timestamp("joined_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
  serving: boolean("serving").notNull().default(false),
  created_by_id: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
});

export type UserRow = typeof users.$inferSelect;
export type QueueRow = typeof queues.$inferSelect;
export type TicketRow = typeof tickets.$inferSelect;
