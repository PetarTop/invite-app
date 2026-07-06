"use client";

import Link from "next/link";

import type { RsvpStats } from "@/lib/rsvp-stats";

export type StudioSaveStatus = "idle" | "saving" | "saved";

type SeatingToolbarProps = {
  eventName: string;
  rsvpStats: RsvpStats;
  saveStatus: StudioSaveStatus;
};

export function SeatingToolbar({
  eventName,
  rsvpStats,
  saveStatus,
}: SeatingToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-800/90 bg-zinc-900/80 px-4 backdrop-blur-md sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Dashboard
        </Link>

        <div className="hidden h-6 w-px bg-zinc-800 sm:block" aria-hidden />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-zinc-100">
            {eventName}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Seating Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 sm:flex">
          <RsvpPill label="Going" value={rsvpStats.going} tone="green" />
          <RsvpPill label="Pending" value={rsvpStats.pending} tone="zinc" />
          <RsvpPill label="Declined" value={rsvpStats.not_going} tone="red" />
        </div>

        <div
          className="flex items-center gap-2 text-xs text-zinc-500"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              saveStatus === "saving"
                ? "animate-pulse bg-amber-400"
                : saveStatus === "saved"
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
            }`}
          />
          <span className="hidden sm:inline">
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "All changes saved"
                : "Ready"}
          </span>
        </div>
      </div>
    </header>
  );
}

function RsvpPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "zinc";
}) {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    zinc: "bg-zinc-800 text-zinc-400",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {label} {value}
    </span>
  );
}
