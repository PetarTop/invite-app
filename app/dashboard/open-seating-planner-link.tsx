import Link from "next/link";

type OpenSeatingPlannerLinkProps = {
  eventId: string;
  goingCount: number;
  tableCount: number;
};

export function OpenSeatingPlannerLink({
  eventId,
  goingCount,
  tableCount,
}: OpenSeatingPlannerLinkProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-zinc-500">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {tableCount}
        </span>{" "}
        tables ·{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {goingCount}
        </span>{" "}
        going guests
      </div>

      <Link
        href={`/dashboard/events/${eventId}/seating`}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
        Open seating planner
      </Link>
    </div>
  );
}
