import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { PublicUser, User } from "@queuenow/shared";

/** Read a required deployment secret; never invent fallbacks. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function toPublicUser(user: User): PublicUser {
  const { password_hash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function hashPassword(password: string, authSecret: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(`${password}:${authSecret}`, salt, 64).toString(
    "hex",
  );
  return `${salt}:${derived}`;
}

export function verifyPassword(
  password: string,
  passwordHash: string,
  authSecret: string,
): boolean {
  const [salt, expected] = passwordHash.split(":");
  if (!salt || !expected) {
    return false;
  }
  const actual = scryptSync(`${password}:${authSecret}`, salt, 64).toString(
    "hex",
  );
  try {
    return timingSafeEqual(
      Buffer.from(actual, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

interface SessionPayload {
  sub: string;
  email: string;
  exp: number;
}

export function signSessionToken(
  user: Pick<User, "id" | "email">,
  authSecret: string,
  ttlSeconds = 60 * 60 * 24 * 7,
): string {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", authSecret)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function verifySessionToken(
  token: string,
  authSecret: string,
): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  const expected = createHmac("sha256", authSecret)
    .update(body)
    .digest("base64url");
  try {
    const valid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
    if (!valid) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
