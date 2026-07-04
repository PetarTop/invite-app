import { getDashboardClient } from "@/lib/supabase/dashboard";

export async function getUserEventIds(userId: string): Promise<number[]> {
  const supabase = await getDashboardClient();

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((event) => Number(event.id));
}

export async function userOwnsEvent(
  userId: string,
  eventId: number,
): Promise<boolean> {
  const supabase = await getDashboardClient();

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function userOwnsGuest(
  userId: string,
  guestId: number,
): Promise<{ owned: boolean; eventId: number | null }> {
  const eventIds = await getUserEventIds(userId);

  if (eventIds.length === 0) {
    return { owned: false, eventId: null };
  }

  const supabase = await getDashboardClient();

  const { data, error } = await supabase
    .from("guests")
    .select("id, event_id")
    .eq("id", guestId)
    .in("event_id", eventIds)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { owned: false, eventId: null };
  }

  return { owned: true, eventId: Number(data.event_id) };
}

export async function userOwnsTable(
  userId: string,
  tableId: number,
  eventId?: number,
): Promise<boolean> {
  const eventIds = await getUserEventIds(userId);

  if (eventIds.length === 0) {
    return false;
  }

  const supabase = await getDashboardClient();

  let query = supabase
    .from("tables")
    .select("id, event_id")
    .eq("id", tableId)
    .in("event_id", eventIds);

  if (eventId !== undefined) {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
