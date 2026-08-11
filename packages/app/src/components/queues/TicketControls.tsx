import type { TicketWithMetrics } from "@queuenow/shared";

interface TicketControlsProps {
  ticket: TicketWithMetrics;
  disabled?: boolean;
  onMarkServing: (ticketId: string) => void;
  onMarkDone: (ticketId: string) => void;
}

export function TicketControls({
  ticket,
  disabled = false,
  onMarkServing,
  onMarkDone,
}: TicketControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {!ticket.serving ? (
        <button
          type="button"
          className="rounded bg-emerald-700 px-3 py-1 text-sm text-white disabled:opacity-60"
          disabled={disabled}
          onClick={() => onMarkServing(ticket.id)}
        >
          Mark serving
        </button>
      ) : (
        <button
          type="button"
          className="rounded bg-slate-800 px-3 py-1 text-sm text-white disabled:opacity-60"
          disabled={disabled}
          onClick={() => onMarkDone(ticket.id)}
        >
          Mark done
        </button>
      )}
    </div>
  );
}
