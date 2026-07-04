import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local. Add it from Supabase → Project Settings → API → service_role.",
    );
  }

  const { url } = getSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
