import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { RsvpForm } from "./rsvp-form";

type EventRow = {
  id: string;
  name: string;
  slug: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!event) {
    notFound();
  }

  const { id, name } = event as EventRow;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          You are invited
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Please let us know if you can make it.
        </p>
      </header>

      <RsvpForm eventId={id} slug={slug} />
    </div>
  );
}
