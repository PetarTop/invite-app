"use client";

import { useActionState } from "react";

import { createEvent, type CreateEventState } from "./actions";

const initialState: CreateEventState = {};

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(
    createEvent,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Event name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ana & Marko"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          placeholder="ana-marko-2026"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
        />
        <p className="text-xs text-zinc-500">
          Used in the invitation URL, e.g. /invite/ana-marko-2026
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Event created successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "Saving..." : "Create event"}
      </button>
    </form>
  );
}
