import type { InvitationContent } from "@/lib/invitation-content";

import { RsvpForm } from "./rsvp-form";

type InvitationViewProps = {
  eventId: string;
  slug: string;
  content: InvitationContent;
};

export function InvitationView({ eventId, slug, content }: InvitationViewProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0b0a] text-stone-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(212,175,120,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(120,90,60,0.12),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-2xl flex-col px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <article className="invitation-enter rounded-[1.75rem] border border-stone-700/40 bg-gradient-to-b from-stone-900/90 via-stone-950/95 to-black/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-sm sm:p-10 lg:p-12">
          <header className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-amber-200/70">
              {content.heading}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-invite-display)] text-5xl font-medium leading-none tracking-tight text-stone-50 sm:text-6xl lg:text-7xl">
              {content.names}
            </h1>
            <div className="mx-auto mt-8 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-200/40" />
              <span className="text-amber-200/60" aria-hidden>
                ✦
              </span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-200/40" />
            </div>
            <p className="mt-6 text-sm text-stone-400">{content.eventName}</p>
          </header>

          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            <DetailCard label="Datum" value={content.date} />
            <DetailCard label="Vrijeme" value={content.time} />
            <DetailCard
              className="sm:col-span-2"
              label="Mjesto"
              value={content.venue}
              subvalue={content.location || undefined}
            />
          </section>

          {content.schedule.length > 0 && (
            <section className="mt-10">
              <SectionTitle>Program</SectionTitle>
              <ol className="mt-5 space-y-3">
                {content.schedule.map((item) => (
                  <li
                    key={`${item.time}-${item.label}`}
                    className="flex items-center gap-4 rounded-xl border border-stone-800/80 bg-stone-950/40 px-4 py-3"
                  >
                    <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-amber-200/90">
                      {item.time}
                    </span>
                    <span className="text-sm text-stone-300">{item.label}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="mt-10 text-center">
            <p className="mx-auto max-w-lg text-base leading-relaxed text-stone-300 sm:text-lg">
              {content.message}
            </p>
          </section>

          <section className="mt-10">
            <SectionTitle>Potvrda dolaska</SectionTitle>
            <div className="mt-5">
              <RsvpForm eventId={eventId} slug={slug} />
            </div>
          </section>

          {content.location && (
            <section className="mt-10 rounded-xl border border-stone-800/70 bg-stone-950/30 p-5 text-center">
              <SectionTitle>Lokacija</SectionTitle>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                {content.location}
              </p>
            </section>
          )}

          <footer className="mt-10 border-t border-stone-800/60 pt-8 text-center">
            <p className="mx-auto max-w-md font-[family-name:var(--font-invite-display)] text-xl leading-relaxed text-stone-300 italic">
              {content.closing}
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-stone-600">
              Sa ljubavlju
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-center text-[11px] font-medium uppercase tracking-[0.3em] text-amber-200/75">
      {children}
    </h2>
  );
}

function DetailCard({
  label,
  value,
  subvalue,
  className = "",
}: {
  label: string;
  value: string;
  subvalue?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-stone-800/80 bg-stone-950/50 px-5 py-4 text-center ${className}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-invite-display)] text-2xl text-stone-100">
        {value}
      </p>
      {subvalue && (
        <p className="mt-1 text-sm leading-relaxed text-stone-400">{subvalue}</p>
      )}
    </div>
  );
}
