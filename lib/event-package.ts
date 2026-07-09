export type PackageTier = "basic" | "rsvp" | "premium" | (string & {});

export type EventPackageFields = {
  package_tier: PackageTier | null;
  seating_enabled: boolean;
};

export type DashboardEventWithPackage = {
  id: string;
  name: string;
  slug: string;
} & EventPackageFields;

export function normalizeEventPackage(row: {
  package_tier?: string | null;
  seating_enabled?: boolean | null;
}): EventPackageFields {
  return {
    package_tier: row.package_tier ?? null,
    seating_enabled: row.seating_enabled === true,
  };
}

export function packageTierLabel(tier: PackageTier | null): string {
  switch (tier) {
    case "premium":
      return "Premium";
    case "rsvp":
      return "RSVP";
    case "basic":
      return "Basic";
    default:
      return tier ? String(tier) : "Paket";
  }
}
