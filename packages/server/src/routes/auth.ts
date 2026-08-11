import { Router, type RequestHandler } from "express";
import type { QueryBuilders } from "../db/query";
import {
  hashPassword,
  requireEnv,
  signSessionToken,
  toPublicUser,
  verifyPassword,
  verifySessionToken,
} from "../lib/auth";

type AuthedRequest = Parameters<RequestHandler>[0] & {
  userId?: string;
  userEmail?: string;
};

export function createAuthMiddleware(): RequestHandler {
  return (req, res, next) => {
    let authSecret: string;
    try {
      authSecret = requireEnv("AUTH_SECRET");
    } catch {
      res.status(500).json({ error: "Server authentication is not configured" });
      return;
    }

    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing bearer token" });
      return;
    }

    const payload = verifySessionToken(header.slice("Bearer ".length), authSecret);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const authed = req as AuthedRequest;
    authed.userId = payload.sub;
    authed.userEmail = payload.email;
    next();
  };
}

export function createAuthRouter(queries: QueryBuilders): Router {
  const router = Router();

  router.post("/register", async (req, res) => {
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    let authSecret: string;
    try {
      authSecret = requireEnv("AUTH_SECRET");
    } catch {
      res.status(500).json({ error: "Server authentication is not configured" });
      return;
    }

    const existing = await queries.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const user = await queries.createUser({
      email,
      password_hash: hashPassword(password, authSecret),
    });

    const token = signSessionToken(user, authSecret);
    res.status(201).json({ token, user: toPublicUser(user) });
  });

  router.post("/login", async (req, res) => {
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    let authSecret: string;
    try {
      authSecret = requireEnv("AUTH_SECRET");
    } catch {
      res.status(500).json({ error: "Server authentication is not configured" });
      return;
    }

    const user = await queries.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash, authSecret)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signSessionToken(user, authSecret);
    res.status(200).json({ token, user: toPublicUser(user) });
  });

  return router;
}
