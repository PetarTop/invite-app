import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getInvitationContent } from "@/lib/invitation-content";
import { createClient } from "@/lib/supabase/server";

import { InvitationView } from "./invitation-view";

type EventRow = {
  id: string;
  name: string;
  slug: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return { title: "Pozivnica nije pronađena" };
  }

  const content = getInvitationContent(slug, event.name);

  return {
    title: `${content.names} — Digitalna pozivnica`,
    description: content.message,
  };
}

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
  const content = getInvitationContent(slug, name);

  return <InvitationView eventId={id} slug={slug} content={content} />;
}
