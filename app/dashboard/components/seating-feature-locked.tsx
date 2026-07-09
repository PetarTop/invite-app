import Link from "next/link";

import { mailtoInquiry } from "@/lib/site-config";

type SeatingFeatureLockedCardProps = {
  variant?: "dashboard" | "legacy";
};

export function SeatingFeatureLockedCard({
  variant = "dashboard",
}: SeatingFeatureLockedCardProps) {
  const isDashboard = variant === "dashboard";

  return (
    <div className="rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400"
          aria-hidden
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-200">
            {isDashboard
              ? "Raspored gostiju nije uključen u vaš paket."
              : "Raspored sedenja nije uključen u vaš paket."}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            {isDashboard
              ? "Ukoliko želite mogućnost raspoređivanja gostiju po stolovima, kontaktirajte nas za nadogradnju paketa."
              : "Kontaktirajte nas za nadogradnju paketa."}
          </p>
          <a
            href={mailtoInquiry("Nadogradnja paketa — raspored gostiju")}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Kontakt za nadogradnju
          </a>
        </div>
      </div>
    </div>
  );
}

export function SeatingFeatureLockedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400"
        aria-hidden
      >
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </span>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-100">
        Raspored sedenja nije dostupan
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Ova funkcija nije uključena u trenutni paket za ovaj događaj.
        Kontaktirajte nas za nadogradnju paketa.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
      >
        Vrati se na dashboard
      </Link>
    </div>
  );
}
