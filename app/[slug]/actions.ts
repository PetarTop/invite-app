"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type RsvpStatus = "going" | "not_going";

export type RsvpState = {
  error?: string;
  success?: boolean;
  status?: RsvpStatus;
};

export async function submitRsvp(
  _prevState: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const eventId = formData.get("event_id")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const status = formData.get("status")?.toString().trim();

  if (!eventId || !slug || !name) {
    return { error: "Ime je obavezno." };
  }

  if (status !== "going" && status !== "not_going") {
    return { error: "Molimo odaberite dolazite li ili ne." };
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : await createClient();

  let { error } = await supabase.from("guests").insert({
    event_id: eventId,
    name,
    status,
    table_id: null,
    seat_index: null,
  });

  if (
    error &&
    (error.message.includes("table_id") ||
      error.message.includes("seat_index"))
  ) {
    ({ error } = await supabase.from("guests").insert({
      event_id: eventId,
      name,
      status,
    }));
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/${slug}`);
  revalidatePath("/dashboard");
  return { success: true, status };
}
