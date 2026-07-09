import { requireUser } from "@/lib/auth";
import {
  normalizeEventPackage,
  type DashboardEventWithPackage,
} from "@/lib/event-package";
import { getDashboardClient } from "@/lib/supabase/dashboard";

type EventRow = {
  id: string | number;
  name: string;
  slug: string;
  package_tier?: string | null;
  seating_enabled?: boolean | null;
};

async function fetchOwnedEventRow(
  eventId: number,
  userId: string,
): Promise<{ data: EventRow | null; error: { message: string } | null }> {
  const supabase = await getDashboardClient();

  const withPackage = await supabase
    .from("events")
    .select("id, name, slug, package_tier, seating_enabled")
    .eq("id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (
    withPackage.error &&
    (withPackage.error.message.includes("package_tier") ||
      withPackage.error.message.includes("seating_enabled"))
  ) {
    const fallback = await supabase
      .from("events")
      .select("id, name, slug")
      .eq("id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    return {
      data: fallback.data as EventRow | null,
      error: fallback.error,
    };
  }

  return {
    data: withPackage.data as EventRow | null,
    error: withPackage.error,
  };
}

export async function getOwnedEventWithPackage(
  eventId: string,
): Promise<DashboardEventWithPackage | null> {
  const user = await requireUser();
  const numericEventId = Number(eventId);

  if (!Number.isFinite(numericEventId)) {
    return null;
  }

  const { data, error } = await fetchOwnedEventRow(numericEventId, user.id);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const packageFields = normalizeEventPackage(data);

  return {
    id: String(data.id),
    name: data.name,
    slug: data.slug,
    ...packageFields,
  };
}

export async function listOwnedEventsWithPackage(
  userId: string,
): Promise<DashboardEventWithPackage[]> {
  const supabase = await getDashboardClient();

  const withPackage = await supabase
    .from("events")
    .select("id, name, slug, package_tier, seating_enabled")
    .eq("user_id", userId)
    .order("name");

  if (
    withPackage.error &&
    (withPackage.error.message.includes("package_tier") ||
      withPackage.error.message.includes("seating_enabled"))
  ) {
    const fallback = await supabase
      .from("events")
      .select("id, name, slug")
      .eq("user_id", userId)
      .order("name");

    if (fallback.error) {
      throw new Error(fallback.error.message);
    }

    return (fallback.data ?? []).map((event) => ({
      id: String(event.id),
      name: event.name,
      slug: event.slug,
      package_tier: null,
      seating_enabled: false,
    }));
  }

  if (withPackage.error) {
    throw new Error(withPackage.error.message);
  }

  return (withPackage.data ?? []).map((event) => {
    const packageFields = normalizeEventPackage(event);

    return {
      id: String(event.id),
      name: event.name,
      slug: event.slug,
      ...packageFields,
    };
  });
}
