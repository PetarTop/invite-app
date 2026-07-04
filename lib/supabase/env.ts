function normalizeSupabaseUrl(url: string): string {
  const trimmed = url.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  if (/^[a-z0-9]+$/.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL: "${trimmed}". Use https://<project-ref>.supabase.co or your project reference.`,
  );
}

export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return { url: normalizeSupabaseUrl(rawUrl), anonKey: anonKey.trim() };
}
