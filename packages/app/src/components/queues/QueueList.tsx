import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Queue } from "@queuenow/shared";
import { useApi } from "../../hooks/useApi";
import { apiClient } from "../../lib/api-client";

export function QueueList() {
  const { run, error, loading } = useApi();
  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await run(() => apiClient.listQueues());
        if (!cancelled) {
          setQueues(result);
        }
      } catch {
        // error surfaced via useApi
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [run]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your queues</h1>
          <p className="text-sm text-slate-600">
            Create a queue and manage waiting tickets.
          </p>
        </div>
        <Link
          to="/queues/new"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Create queue
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading && queues.length === 0 ? (
        <p className="text-sm text-slate-600">Loading queues…</p>
      ) : null}

      {queues.length === 0 && !loading ? (
        <p className="text-sm text-slate-600">No queues yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {queues.map((queue) => (
            <li key={queue.id}>
              <Link
                to={`/queues/${queue.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{queue.name}</span>
                <span className="text-xs text-slate-500">
                  {new Date(queue.created_at).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CreateQueue() {
  const { run, error, loading } = useApi();
  const [name, setName] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const queue = await run(() => apiClient.createQueue(name));
      setCreatedId(queue.id);
    } catch {
      // error surfaced via useApi
    }
  }

  if (createdId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Queue created</h1>
        <Link
          className="inline-block rounded bg-slate-900 px-4 py-2 text-sm text-white"
          to={`/queues/${createdId}`}
        >
          Open queue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New queue</h1>
        <p className="text-sm text-slate-600">
          Give your queue a name customers will recognize.
        </p>
      </div>
      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-6" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create"}
          </button>
          <Link
            to="/queues"
            className="rounded border border-slate-300 px-4 py-2 text-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
