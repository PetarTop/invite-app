"use client";

import { shapeLabel, type LayoutTable } from "@/lib/seating-layout";

import { TableSettingsPanel } from "./table-settings-panel";
import type { StudioSaveStatus } from "./seating-toolbar";
import { seatingLabel, studioSidebar, studioSidebarScroll } from "./seating-ui";

type PropertiesPanelProps = {
  table: LayoutTable | null;
  onUpdate: (tableId: string, patch: Partial<LayoutTable>) => void;
  onDelete: (tableId: string) => void;
  onError: (message: string) => void;
  onClearSelection: () => void;
  onSaveStateChange?: (status: StudioSaveStatus) => void;
};

const panelChrome = `${studioSidebar} h-full shrink-0 border-l`;

export function PropertiesPanel({
  table,
  onUpdate,
  onDelete,
  onError,
  onClearSelection,
  onSaveStateChange,
}: PropertiesPanelProps) {
  if (!table) {
    return (
      <aside
        className={`${panelChrome} flex flex-col items-center justify-center p-6 text-center`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/60 text-zinc-500">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-zinc-400">
          Select a table to edit its settings.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Click any table on the canvas to adjust name, capacity, size, and
          rotation.
        </p>
      </aside>
    );
  }

  return (
    <aside className={`${panelChrome} flex flex-col overflow-hidden`}>
      <div className="shrink-0 border-b border-zinc-800/80 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">Properties</h2>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{table.name}</p>
      </div>

      <div className={`${studioSidebarScroll} p-4`}>
        <div className="mb-4 flex flex-col gap-1.5">
          <span className={seatingLabel}>Shape</span>
          <div className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300">
            {shapeLabel(table.shape)}
          </div>
        </div>

        <TableSettingsPanel
          table={table}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onError={onError}
          onClearSelection={onClearSelection}
          onSaveStateChange={onSaveStateChange}
          variant="embedded"
        />
      </div>
    </aside>
  );
}
