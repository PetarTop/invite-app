import Link from "next/link";
import {
  mailtoConsultation,
  mailtoInquiry,
  siteConfig,
} from "@/lib/site-config";

const features = [
  {
    title: "Digitalne pozivnice",
    description:
      "Elegantna online pozivnica prilagođena vašem događaju — dijelite jednim linkom.",
  },
  {
    title: "RSVP praćenje",
    description:
      "Gosti potvrđuju dolazak u par klikova. Vi vidite odgovore u stvarnom vremenu.",
  },
  {
    title: "Organizerska nadzorna ploča",
    description:
      "Pregled događaja, statistike dolazaka i cjelokupnog statusa na jednom mjestu.",
  },
  {
    title: "Upravljanje popisom gostiju",
    description:
      "Centralizirani popis s statusima — tko dolazi, tko ne, sve na dohvat ruke.",
  },
  {
    title: "Raspored sjedenja",
    description:
      "Povucite i ispustite goste za stolove — intuitivno planiranje sjedenja.",
  },
  {
    title: "Dizajn po dogovoru",
    description:
      "Vizualni identitet usklađen s vašom vizijom — boje, tipografija i detalji.",
  },
] as const;

const packages = [
  {
    name: "Digitalna pozivnica",
    description: "Profesionalna online pozivnica s vašim sadržajem i brendiranjem.",
    highlights: [
      "Jedinstveni link za dijeljenje",
      "Prilagođeni dizajn po dogovoru",
      "Mobilna optimizacija",
    ],
    featured: false,
  },
  {
    name: "Pozivnica + RSVP",
    description:
      "Sve iz osnovnog paketa uz jednostavno potvrđivanje dolaska za goste.",
    highlights: [
      "Digitalna pozivnica",
      "RSVP forma za goste",
      "Nadzorna ploča s odgovorima",
      "Popis gostiju u stvarnom vremenu",
    ],
    featured: true,
  },
  {
    name: "Premium organizacija gostiju",
    description:
      "Kompletno rješenje za organizaciju — od pozivnice do rasporeda sjedenja.",
    highlights: [
      "Sve iz paketa Pozivnica + RSVP",
      "Upravljanje stolovima",
      "Drag-and-drop raspored sjedenja",
      "Prioritetna podrška i prilagodbe",
    ],
    featured: false,
  },
] as const;

const steps = [
  "Pošaljete upit s osnovnim informacijama o događaju",
  "Dogovorimo dizajn, funkcionalnosti i ponudu",
  "Nakon dogovora pripremamo vašu pozivnicu i pristup",
  "Dijelite link s gostima — vi pratite sve s nadzorne ploče",
] as const;

function EnvelopeIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

export function LandingPage() {
  return (
    <div className="landing-page bg-[#faf9f7] text-[#1c1917]">
      <header className="sticky top-0 z-50 border-b border-[#e7e5e4]/80 bg-[#faf9f7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-[#1c1917]">
              {siteConfig.name}
            </span>
            <span className="text-xs tracking-wide text-[#78716c]">
              Digitalne pozivnice
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            <a
              href="#paketi"
              className="hidden text-sm text-[#57534e] transition-colors hover:text-[#1c1917] sm:inline"
            >
              Paketi
            </a>
            <a
              href="#kontakt"
              className="hidden text-sm text-[#57534e] transition-colors hover:text-[#1c1917] sm:inline"
            >
              Kontakt
            </a>
            <Link
              href="/login"
              className="text-sm text-[#57534e] transition-colors hover:text-[#1c1917]"
            >
              Prijava
            </Link>
            <a
              href={mailtoInquiry("Upit — digitalna pozivnica")}
              className="inline-flex items-center gap-2 rounded-full bg-[#1c1917] px-4 py-2 text-sm font-medium text-[#faf9f7] transition-colors hover:bg-[#44403c]"
            >
              <EnvelopeIcon />
              <span className="hidden sm:inline">Pošalji upit</span>
              <span className="sm:hidden">Upit</span>
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(180,155,120,0.18),transparent)]"
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#a16207]">
                Vjenčanja i posebni događaji
              </p>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#1c1917] sm:text-5xl lg:text-6xl">
                Digitalne pozivnice s nadzornom pločom za organizatore
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#57534e] sm:text-xl">
                Profesionalno rješenje za vašu online pozivnicu, RSVP praćenje i
                organizaciju gostiju — prilagođeno vašem događaju, bez
                samoposlužnog modela.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={mailtoInquiry("Upit — digitalna pozivnica")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1c1917] px-7 py-3.5 text-sm font-medium text-[#faf9f7] transition-colors hover:bg-[#44403c]"
                >
                  <EnvelopeIcon />
                  Pošalji upit
                </a>
                <a
                  href={mailtoConsultation()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d6d3d1] bg-white px-7 py-3.5 text-sm font-medium text-[#1c1917] transition-colors hover:border-[#a8a29e] hover:bg-[#f5f5f4]"
                >
                  <CalendarIcon />
                  Zakaži konsultaciju
                </a>
              </div>
              <p className="mt-6 text-sm text-[#78716c]">
                Individualna ponuda nakon razgovora — bez javnih cijena i online
                plaćanja.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-[#e7e5e4] bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-[#1c1917] sm:text-4xl">
                Sve što vam treba za organizaciju gostiju
              </h2>
              <p className="mt-4 text-[#57534e]">
                Platforma je namijenjena parovima i organizatorima koji žele
                elegantno digitalno iskustvo — vi vodite događaj, mi brinemo o
                tehničkoj strani.
              </p>
            </div>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-[#e7e5e4] bg-[#faf9f7] p-6 transition-shadow hover:shadow-sm"
                >
                  <h3 className="text-lg font-medium text-[#1c1917]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#57534e]">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="paketi" className="scroll-mt-20 px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-[#1c1917] sm:text-4xl">
                Paketi usluge
              </h2>
              <p className="mt-4 text-[#57534e]">
                Tri razine usluge — sadržaj i cijena dogovaraju se individualno
                prema vašim potrebama.
              </p>
            </div>
            <ul className="mt-14 grid gap-6 lg:grid-cols-3">
              {packages.map((pkg) => (
                <li
                  key={pkg.name}
                  className={`flex flex-col rounded-2xl border p-8 ${
                    pkg.featured
                      ? "border-[#a16207]/40 bg-white shadow-lg shadow-[#a16207]/5 ring-1 ring-[#a16207]/20"
                      : "border-[#e7e5e4] bg-white"
                  }`}
                >
                  {pkg.featured ? (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#92400e]">
                      Najpopularnije
                    </span>
                  ) : (
                    <span className="mb-4 h-6" aria-hidden />
                  )}
                  <h3 className="text-xl font-semibold text-[#1c1917]">
                    {pkg.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#57534e]">
                    {pkg.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {pkg.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm text-[#44403c]"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a16207]"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm font-medium text-[#78716c]">
                    Cijena po dogovoru
                  </p>
                  <a
                    href={mailtoInquiry(`Upit — ${pkg.name}`)}
                    className={`mt-4 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                      pkg.featured
                        ? "bg-[#1c1917] text-[#faf9f7] hover:bg-[#44403c]"
                        : "border border-[#d6d3d1] bg-[#faf9f7] text-[#1c1917] hover:border-[#a8a29e]"
                    }`}
                  >
                    Pošalji upit
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-[#e7e5e4] bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[#1c1917] sm:text-4xl">
                  Kako surađujemo
                </h2>
                <p className="mt-4 text-[#57534e]">
                  Nema samoposlužne registracije — svaki klijent dobiva
                  personaliziranu uslugu od prvog kontakta do objave pozivnice.
                </p>
              </div>
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-4 rounded-xl border border-[#e7e5e4] bg-[#faf9f7] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c1917] text-sm font-medium text-[#faf9f7]">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-[#44403c]">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="kontakt" className="scroll-mt-20 px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-3xl border border-[#e7e5e4] bg-white">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 sm:p-12 lg:p-14">
                  <h2 className="text-3xl font-semibold tracking-tight text-[#1c1917]">
                    Javite nam se
                  </h2>
                  <p className="mt-4 text-[#57534e]">
                    Opisite datum događaja, broj gostiju i što vam je važno — u
                    kratkom roku vraćamo se s prijedlogom i ponudom.
                  </p>
                  <dl className="mt-8 space-y-4 text-sm">
                    <div>
                      <dt className="font-medium text-[#78716c]">E-mail</dt>
                      <dd className="mt-1">
                        <a
                          href={mailtoInquiry()}
                          className="text-[#1c1917] underline decoration-[#d6d3d1] underline-offset-4 transition-colors hover:decoration-[#a16207]"
                        >
                          {siteConfig.contactEmail}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[#78716c]">Telefon</dt>
                      <dd className="mt-1 text-[#1c1917]">
                        {siteConfig.contactPhone}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-col justify-center gap-4 border-t border-[#e7e5e4] bg-[#faf9f7] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14">
                  <a
                    href={mailtoInquiry("Upit — digitalna pozivnica")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1c1917] px-7 py-3.5 text-sm font-medium text-[#faf9f7] transition-colors hover:bg-[#44403c]"
                  >
                    <EnvelopeIcon />
                    Pošalji upit
                  </a>
                  <a
                    href={mailtoConsultation()}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d6d3d1] bg-white px-7 py-3.5 text-sm font-medium text-[#1c1917] transition-colors hover:border-[#a8a29e]"
                  >
                    <CalendarIcon />
                    Zakaži konsultaciju
                  </a>
                  <p className="text-center text-xs text-[#78716c]">
                    Postojeći klijenti mogu se{" "}
                    <Link
                      href="/login"
                      className="underline decoration-[#d6d3d1] underline-offset-2 hover:decoration-[#a16207]"
                    >
                      prijaviti ovdje
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e7e5e4] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#78716c] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Sva prava pridržana.
          </p>
          <div className="flex gap-6">
            <a href="#paketi" className="hover:text-[#1c1917]">
              Paketi
            </a>
            <a href="#kontakt" className="hover:text-[#1c1917]">
              Kontakt
            </a>
            <Link href="/login" className="hover:text-[#1c1917]">
              Prijava
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
