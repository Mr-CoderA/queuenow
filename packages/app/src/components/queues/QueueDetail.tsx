import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { TicketWithMetrics } from "@queuenow/shared";
import { useApi } from "../../hooks/useApi";
import { apiClient } from "../../lib/api-client";
import { TicketControls } from "./TicketControls";

interface QueueDetailProps {
  queueId?: string;
  initialTickets?: TicketWithMetrics[];
}

export function QueueDetail({
  queueId: queueIdProp,
  initialTickets,
}: QueueDetailProps) {
  const params = useParams();
  const queueId = queueIdProp ?? params.queueId ?? "";
  const { run, error, setError, loading } = useApi();
  const [tickets, setTickets] = useState<TicketWithMetrics[]>(
    initialTickets ?? [],
  );
  const [customerName, setCustomerName] = useState("");

  const refresh = useCallback(async () => {
    if (!queueId) {
      return;
    }
    const result = await run(() => apiClient.listTickets(queueId));
    setTickets(result);
  }, [queueId, run]);

  useEffect(() => {
    if (initialTickets) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        if (!cancelled) {
          await refresh();
        }
      } catch {
        // error surfaced via useApi
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialTickets, refresh]);

  async function onAddTicket(event: FormEvent) {
    event.preventDefault();
    if (!queueId) {
      return;
    }
    try {
      await run(() => apiClient.addTicket(queueId, customerName));
      setCustomerName("");
      await refresh();
    } catch {
      // error surfaced via useApi
    }
  }

  async function onMarkServing(ticketId: string) {
    if (!queueId) {
      return;
    }
    try {
      await run(() => apiClient.updateTicket(queueId, ticketId, true));
      await refresh();
    } catch {
      // error surfaced via useApi
    }
  }

  async function onMarkDone(ticketId: string) {
    if (!queueId) {
      return;
    }
    try {
      await run(() => apiClient.updateTicket(queueId, ticketId, false));
      await refresh();
    } catch {
      // error surfaced via useApi
    }
  }

  if (!queueId) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Missing queue id.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            <Link to="/queues" className="underline">
              Queues
            </Link>
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Queue detail
          </h1>
          <p className="text-sm text-slate-600">
            Live position and estimated wait for each ticket.
          </p>
        </div>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1 text-sm"
          onClick={() => {
            void refresh().catch(() => undefined);
          }}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row"
        onSubmit={onAddTicket}
      >
        <label className="block flex-1 text-sm font-medium text-slate-700">
          Customer name
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
            value={customerName}
            onChange={(event) => {
              setCustomerName(event.target.value);
              setError(null);
            }}
          />
        </label>
        <button
          type="submit"
          className="self-end rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          disabled={loading}
        >
          Add ticket
        </button>
      </form>

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {tickets.length === 0 ? (
          <li className="px-4 py-6 text-sm text-slate-600">
            No tickets in this queue yet.
          </li>
        ) : (
          tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {ticket.customer_name}
                </p>
                <p className="text-sm text-slate-600">
                  {ticket.serving
                    ? "Currently serving"
                    : `Position ${ticket.position} · ~${ticket.estimated_wait_minutes} min wait`}
                </p>
              </div>
              <TicketControls
                ticket={ticket}
                disabled={loading}
                onMarkServing={onMarkServing}
                onMarkDone={onMarkDone}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
