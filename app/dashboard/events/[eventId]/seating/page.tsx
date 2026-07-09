import { notFound } from "next/navigation";

import { SeatingFeatureLockedPage } from "@/app/dashboard/components/seating-feature-locked";
import { getOwnedEventWithPackage } from "@/lib/seating-access";
import { loadSeatingStudioData } from "@/lib/seating-studio-data";

import { SeatingStudioClient } from "./seating-studio-client";

type SeatingStudioPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function SeatingStudioPage({
  params,
}: SeatingStudioPageProps) {
  const { eventId } = await params;
  const event = await getOwnedEventWithPackage(eventId);

  if (!event) {
    notFound();
  }

  if (!event.seating_enabled) {
    return <SeatingFeatureLockedPage />;
  }

  const data = await loadSeatingStudioData(eventId);

  return (
    <SeatingStudioClient
      eventId={data.event.id}
      eventName={data.event.name}
      tables={data.tables}
      initialGuests={data.allGuests}
    />
  );
}
