export const siteConfig = {
  name: "Invite",
  tagline: "Digitalne pozivnice za vaš poseban dan",
  contactEmail: "info@example.com",
  contactPhone: "+385 91 000 0000",
} as const;

export function mailtoInquiry(subject?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  const query = params.toString();
  return `mailto:${siteConfig.contactEmail}${query ? `?${query}` : ""}`;
}

export function mailtoConsultation() {
  return mailtoInquiry("Zakaži konsultaciju — digitalna pozivnica");
}
