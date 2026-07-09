import Link from "next/link";

import { SeatingFeatureLockedCard } from "./components/seating-feature-locked";

type SeatingAccessSectionProps = {
  eventId: string;
  seatingEnabled: boolean;
};

export function SeatingAccessSection({
  eventId,
  seatingEnabled,
}: SeatingAccessSectionProps) {
  if (!seatingEnabled) {
    return <SeatingFeatureLockedCard variant="dashboard" />;
  }

  return (
    <Link
      href={`/dashboard/events/${eventId}/seating`}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-200 to-amber-300 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-950/20 transition-all hover:from-amber-100 hover:to-amber-200 active:scale-[0.99] sm:w-auto"
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
      Otvori raspored gostiju
    </Link>
  );
}
