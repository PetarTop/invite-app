"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  userOwnsEvent,
  userOwnsGuest,
  userOwnsTable,
} from "@/lib/dashboard-events";
import { getDashboardClient } from "@/lib/supabase/dashboard";

export type CreateEventState = {
  error?: string;
  success?: boolean;
};

export type CreateTableState = {
  error?: string;
  success?: boolean;
};

export async function createEvent(
  _prevState: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const user = await requireUser();

  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim().toLowerCase();

  if (!name || !slug) {
    return { error: "Name and slug are required." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      error: "Slug must use lowercase letters, numbers, and hyphens only.",
    };
  }

  const supabase = await getDashboardClient();

  const { error } = await supabase.from("events").insert({
    name,
    slug,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function createTable(
  _prevState: CreateTableState,
  formData: FormData,
): Promise<CreateTableState> {
  const user = await requireUser();

  const eventId = formData.get("event_id")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const capacityValue = formData.get("capacity")?.toString().trim();
  const capacity = Number(capacityValue);

  if (!eventId || !name || !capacityValue) {
    return { error: "Table name and capacity are required." };
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    return { error: "Capacity must be a positive whole number." };
  }

  const parsedEventId = Number(eventId);
  if (!Number.isInteger(parsedEventId)) {
    return { error: "Invalid event." };
  }

  const ownsEvent = await userOwnsEvent(user.id, parsedEventId);
  if (!ownsEvent) {
    return { error: "Event not found." };
  }

  const supabase = await getDashboardClient();

  const { error } = await supabase.from("tables").insert({
    event_id: parsedEventId,
    name,
    capacity,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignGuestToTableAction(
  guestId: string,
  tableId: string | null,
): Promise<{ error?: string }> {
  const user = await requireUser();

  const parsedGuestId = Number(guestId);

  if (!Number.isInteger(parsedGuestId)) {
    return { error: "Invalid guest." };
  }

  const parsedTableId =
    tableId === null || tableId === "" ? null : Number(tableId);

  if (parsedTableId !== null && !Number.isInteger(parsedTableId)) {
    return { error: "Invalid table." };
  }

  const guestOwnership = await userOwnsGuest(user.id, parsedGuestId);
  if (!guestOwnership.owned || guestOwnership.eventId === null) {
    return { error: "Guest not found." };
  }

  if (parsedTableId !== null) {
    const ownsTable = await userOwnsTable(
      user.id,
      parsedTableId,
      guestOwnership.eventId,
    );

    if (!ownsTable) {
      return { error: "Table not found." };
    }
  }

  const supabase = await getDashboardClient();

  const { error } = await supabase
    .from("guests")
    .update({ table_id: parsedTableId })
    .eq("id", parsedGuestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function assignGuestToTable(formData: FormData) {
  const guestId = formData.get("guest_id")?.toString().trim();
  const tableId = formData.get("table_id")?.toString().trim();

  if (!guestId || !tableId) {
    return;
  }

  const result = await assignGuestToTableAction(guestId, tableId);

  if (result.error) {
    console.error("Failed to assign guest:", result.error);
  }
}
