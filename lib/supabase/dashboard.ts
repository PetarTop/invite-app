import { createClient } from "@/lib/supabase/server";

export async function getDashboardClient() {
  return await createClient();
}
