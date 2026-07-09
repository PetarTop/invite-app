import Link from "next/link";

export default function InvitationNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0b0a] px-6 text-stone-100">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-amber-200/60">
          Pozivnica nije pronađena
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-invite-display)] text-4xl text-stone-50">
          Ova pozivnica ne postoji
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-stone-400">
          Provjerite link koji ste dobili ili se obratite organizatoru događaja.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-stone-700 px-6 text-sm font-medium text-stone-200 transition-colors hover:border-amber-200/40 hover:text-amber-100"
        >
          Natrag na početnu
        </Link>
      </div>
    </div>
  );
}
