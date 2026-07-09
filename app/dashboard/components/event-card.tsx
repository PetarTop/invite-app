"use client";

import { useMemo, useState } from "react";

import type { GuestRealtimeRow } from "@/lib/guest-realtime";
import { isDeclinedGuest } from "@/lib/guest-realtime";
import { packageTierLabel } from "@/lib/event-package";
import { calculateRsvpStats, isGoingGuest } from "@/lib/rsvp-stats";

import { SeatingAccessSection } from "../seating-access-section";
import { dashboardCard, dashboardLabel } from "../dashboard-ui";

type EventCardProps = {
  event: {
    id: string;
    name: string;
    slug: string;
    package_tier: string | null;
    seating_enabled: boolean;
  };
  guests: GuestRealtimeRow[];
};

type GuestFilter = "going" | "declined" | "all";

function filterGuests(guests: GuestRealtimeRow[], filter: GuestFilter) {
  if (filter === "going") {
    return guests.filter((guest) => isGoingGuest(guest.status));
  }

  if (filter === "declined") {
    return guests.filter((guest) => isDeclinedGuest(guest.status));
  }

  return guests;
}

function emptyGuestMessage(filter: GuestFilter) {
  switch (filter) {
    case "going":
      return "Još uvek nema potvrđenih gostiju.";
    case "declined":
      return "Nema odbijenih odgovora.";
    default:
      return "Još nema prijavljenih gostiju.";
  }
}

export function EventCard({ event, guests }: EventCardProps) {
  const [filter, setFilter] = useState<GuestFilter>("going");
  const stats = useMemo(() => calculateRsvpStats(guests), [guests]);
  const filteredGuests = useMemo(
    () => filterGuests(guests, filter),
    [guests, filter],
  );
  const invitationUrl = `/${event.slug}`;

  const tabs: { id: GuestFilter; label: string }[] = [
    { id: "going", label: "Dolaze" },
    { id: "declined", label: "Ne dolaze" },
    { id: "all", label: "Svi" },
  ];

  return (
    <article className={`${dashboardCard} overflow-hidden`}>
      <div className="border-b border-zinc-800/80 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
              {event.name}
            </h3>
            {event.package_tier && (
              <span className="rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                {packageTierLabel(event.package_tier)}
              </span>
            )}
          </div>

          <p className={`mt-3 ${dashboardLabel}`}>Javna pozivnica</p>
          <a
            href={invitationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-amber-200/90 transition-colors hover:text-amber-100"
          >
            <span className="truncate">{invitationUrl}</span>
            <span aria-hidden className="shrink-0 text-zinc-500">
              ↗
            </span>
          </a>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatPill label="Dolazi" value={stats.going} tone="green" />
          <StatPill label="Ne dolazi" value={stats.not_going} tone="red" />
          <StatPill label="Bez odgovora" value={stats.pending} tone="zinc" />
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className={dashboardLabel}>Gosti</p>
          <div className="flex gap-1 rounded-lg bg-zinc-950/60 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === tab.id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {filteredGuests.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-6 text-center text-sm text-zinc-500">
              {emptyGuestMessage(filter)}
            </li>
          ) : (
            filteredGuests.map((guest) => (
              <li
                key={guest.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-4 py-3"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    isGoingGuest(guest.status)
                      ? "bg-emerald-400"
                      : isDeclinedGuest(guest.status)
                        ? "bg-red-400"
                        : "bg-zinc-500"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">
                  {guest.name}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="border-t border-zinc-800/80 px-5 py-5 sm:px-6">
        <SeatingAccessSection
          eventId={event.id}
          seatingEnabled={event.seating_enabled}
        />
      </div>
    </article>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "zinc";
}) {
  const tones = {
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    red: "border-red-500/20 bg-red-500/10 text-red-300",
    zinc: "border-zinc-700/60 bg-zinc-800/40 text-zinc-300",
  };

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-center ${tones[tone]}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
