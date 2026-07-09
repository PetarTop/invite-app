"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

import {
  applyGuestDelete,
  applyGuestInsert,
  applyGuestUpdate,
  GUEST_REALTIME_SETUP_NOTE,
  normalizeGuestRow,
  rsvpToastMessage,
  shouldNotifyNewGoingGuest,
  type GuestRealtimeEvent,
  type GuestRealtimeRow,
} from "@/lib/guest-realtime";
import { createClient } from "@/lib/supabase/client";

const REALTIME_DEBUG = process.env.NODE_ENV === "development";

type DbGuestRow = {
  id: number | string;
  event_id: number | string;
  name: string;
  status: string | null;
  table_id?: number | string | null;
  seat_index?: number | null;
};

type UseGuestRealtimeOptions = {
  eventIds: string[];
  initialGuests: GuestRealtimeRow[];
  /** Dashboard-style simple RSVP toasts (INSERT only). */
  onRsvpToast?: (message: string) => void;
  /** Seating Studio: new going guest (INSERT or status UPDATE). Dedupe in consumer. */
  onNewGoingGuest?: (guest: GuestRealtimeRow) => void;
  enabled?: boolean;
};

export function useGuestRealtime({
  eventIds,
  initialGuests,
  onRsvpToast,
  onNewGoingGuest,
  enabled = true,
}: UseGuestRealtimeOptions) {
  const [guests, setGuests] = useState(initialGuests);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("idle");
  const guestsRef = useRef(initialGuests);
  const onRsvpToastRef = useRef(onRsvpToast);
  const onNewGoingGuestRef = useRef(onNewGoingGuest);
  const dashboardNotifiedIdsRef = useRef(
    new Set(initialGuests.map((guest) => guest.id)),
  );

  useEffect(() => {
    onRsvpToastRef.current = onRsvpToast;
  }, [onRsvpToast]);

  useEffect(() => {
    onNewGoingGuestRef.current = onNewGoingGuest;
  }, [onNewGoingGuest]);

  useEffect(() => {
    guestsRef.current = initialGuests;
    setGuests(initialGuests);
    for (const guest of initialGuests) {
      dashboardNotifiedIdsRef.current.add(guest.id);
    }
  }, [initialGuests]);

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<DbGuestRow>) => {
      const eventType = payload.eventType as GuestRealtimeEvent;

      if (eventType === "DELETE") {
        const oldRow = payload.old as Partial<DbGuestRow> | null;
        if (!oldRow?.id) {
          return;
        }

        const guestId = String(oldRow.id);
        const next = applyGuestDelete(guestsRef.current, guestId);
        guestsRef.current = next;
        setGuests(next);
        return;
      }

      const record = payload.new as DbGuestRow | null;
      if (!record?.id) {
        return;
      }

      const normalized = normalizeGuestRow(record);
      const current = guestsRef.current;
      const previous = current.find((guest) => guest.id === normalized.id);
      const alreadyExists = Boolean(previous);

      const next =
        eventType === "INSERT"
          ? applyGuestInsert(current, normalized)
          : applyGuestUpdate(current, normalized);

      guestsRef.current = next;
      setGuests(next);

      if (
        shouldNotifyNewGoingGuest(
          eventType,
          previous,
          normalized,
          alreadyExists,
        )
      ) {
        onNewGoingGuestRef.current?.(normalized);
      }

      const dashboardToast = rsvpToastMessage(
        normalized.name,
        normalized.status,
        eventType,
      );

      if (
        dashboardToast &&
        eventType === "INSERT" &&
        !dashboardNotifiedIdsRef.current.has(normalized.id)
      ) {
        dashboardNotifiedIdsRef.current.add(normalized.id);
        onRsvpToastRef.current?.(dashboardToast);
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled || eventIds.length === 0) {
      return;
    }

    const supabase = createClient();
    const channelName = `guests-realtime-${[...eventIds].sort().join("-")}`;
    let channel: RealtimeChannel = supabase.channel(channelName);

    for (const eventId of eventIds) {
      const filter = `event_id=eq.${eventId}`;

      channel = channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "guests",
            filter,
          },
          handleChange,
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "guests",
            filter,
          },
          handleChange,
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "guests",
            filter,
          },
          handleChange,
        );
    }

    channel.subscribe((status) => {
      setSubscriptionStatus(status);

      if (REALTIME_DEBUG) {
        console.log("[guest-realtime]", {
          status,
          channel: channelName,
          eventIds,
        });

        if (status === "CHANNEL_ERROR") {
          console.warn("[guest-realtime]", GUEST_REALTIME_SETUP_NOTE);
        }
      }
    });

    return () => {
      if (REALTIME_DEBUG) {
        console.log("[guest-realtime] unsubscribe", channelName);
      }

      void supabase.removeChannel(channel);
    };
  }, [enabled, eventIds.join(","), handleChange]);

  return { guests, subscriptionStatus };
}
