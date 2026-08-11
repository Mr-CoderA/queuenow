import type {
  AuthTokenResponse,
  PublicUser,
  Queue,
  Ticket,
  TicketWithMetrics,
} from "@queuenow/shared";

const TOKEN_KEY = "queuenow_token";
const USER_KEY = "queuenow_user";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function persistSession(response: AuthTokenResponse): void {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (authenticated) {
    const token = getStoredToken();
    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return body as T;
}

export const apiClient = {
  register(email: string, password: string): Promise<AuthTokenResponse> {
    return request<AuthTokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string): Promise<AuthTokenResponse> {
    return request<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  listQueues(): Promise<Queue[]> {
    return request<Queue[]>("/api/queues", { method: "GET" }, true);
  },

  createQueue(name: string): Promise<Queue> {
    return request<Queue>(
      "/api/queues",
      { method: "POST", body: JSON.stringify({ name }) },
      true,
    );
  },

  listTickets(queueId: string): Promise<TicketWithMetrics[]> {
    return request<TicketWithMetrics[]>(
      `/api/queues/${encodeURIComponent(queueId)}/tickets`,
      { method: "GET" },
      true,
    );
  },

  addTicket(queueId: string, customerName: string): Promise<Ticket> {
    return request<Ticket>(
      `/api/queues/${encodeURIComponent(queueId)}/tickets`,
      {
        method: "POST",
        body: JSON.stringify({ customer_name: customerName }),
      },
      true,
    );
  },

  updateTicket(
    queueId: string,
    ticketId: string,
    serving: boolean,
  ): Promise<Ticket> {
    return request<Ticket>(
      `/api/queues/${encodeURIComponent(queueId)}/tickets/${encodeURIComponent(ticketId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ serving }),
      },
      true,
    );
  },
};
