import { createClient } from "@/lib/supabase/server";

const EVENTS_SELECT_POLICY_SQL = `grant usage on schema public to anon, authenticated;
grant select on table public.events to anon, authenticated;

alter table public.events enable row level security;

drop policy if exists "events_select_public" on public.events;

create policy "events_select_public"
on public.events
for select
to anon, authenticated
using (true);`;

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default async function TestEventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase.from("events").select("*");

  const columns =
    events && events.length > 0
      ? Object.keys(events[0] as Record<string, unknown>)
      : [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Supabase test
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          All rows from the <code className="font-mono text-sm">events</code>{" "}
          table.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">Failed to fetch events</p>
          <p className="mt-1 font-mono text-sm">{error.message}</p>
          {error.message.includes("permission denied") && (
            <div className="mt-4 space-y-3 text-sm text-red-900 dark:text-red-100">
              <p>
                Supabase blocks reads until you grant access. In your Supabase
                dashboard, open <strong>SQL Editor</strong>, paste this, and
                click <strong>Run</strong>:
              </p>
              <pre className="overflow-x-auto rounded-md bg-red-100 p-3 font-mono text-xs text-red-950 dark:bg-red-900 dark:text-red-50">
                {EVENTS_SELECT_POLICY_SQL}
              </pre>
            </div>
          )}
        </div>
      ) : events && events.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-black">
              {events.map((event, index) => (
                <tr key={(event as { id?: string }).id ?? index}>
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="max-w-xs truncate px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200"
                      title={formatCellValue(
                        (event as Record<string, unknown>)[column],
                      )}
                    >
                      {formatCellValue(
                        (event as Record<string, unknown>)[column],
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No events found.
        </div>
      )}

      {!error && (
        <p className="text-sm text-zinc-500">
          {events?.length ?? 0} row{events?.length === 1 ? "" : "s"} loaded.
        </p>
      )}
    </div>
  );
}
