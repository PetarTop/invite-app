export type InvitationContent = {
  eventName: string;
  heading: string;
  names: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  message: string;
  schedule: { time: string; label: string }[];
  closing: string;
};

const PETAR_MARIJA: InvitationContent = {
  eventName: "Petar i Marija",
  heading: "Pozvani ste na proslavu",
  names: "Petar & Marija",
  date: "20. septembar 2026.",
  time: "17:00",
  venue: "Restoran / Sala za proslave",
  location: "Adresa će biti naknadno potvrđena",
  message:
    "Sa velikom radošću vas pozivamo da budete deo našeg posebnog dana. Molimo vas da potvrdite svoj dolazak putem forme ispod.",
  schedule: [
    { time: "17:00", label: "Dolazak gostiju" },
    { time: "17:30", label: "Dobrodošlica i koktel" },
    { time: "18:30", label: "Proslava" },
    { time: "22:00", label: "Večera i zabava" },
  ],
  closing: "Vaše prisustvo bi nam značilo više nego što riječima možemo izraziti.",
};

const INVITATION_BY_SLUG: Record<string, InvitationContent> = {
  "petar-marija": PETAR_MARIJA,
};

export function getInvitationContent(
  slug: string,
  eventName: string,
): InvitationContent {
  const preset = INVITATION_BY_SLUG[slug];
  if (preset) {
    return preset;
  }

  return {
    eventName,
    heading: "Pozvani ste",
    names: eventName,
    date: "Datum će biti objavljen uskoro",
    time: "—",
    venue: "Lokacija će biti objavljena uskoro",
    location: "",
    message:
      "Molimo vas da potvrdite svoj dolazak putem forme ispod.",
    schedule: [],
    closing: "Hvala vam na pažnji.",
  };
}
