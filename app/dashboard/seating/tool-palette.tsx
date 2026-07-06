"use client";

import type { TableShape } from "@/lib/seating-layout";

import {
  studioToolBtn,
  studioToolBtnActive,
  studioToolBtnDisabled,
} from "./seating-ui";

export type StudioTool = "select" | "add-round" | "add-rectangle" | "add-square";

type ToolPaletteProps = {
  activeTool: StudioTool;
  onSelectTool: (tool: StudioTool) => void;
  onAddTable: (shape: TableShape) => void;
};

const FUTURE_TOOLS = [
  { id: "label", label: "Text label", icon: "T" },
  { id: "dance", label: "Dance floor", icon: "♫" },
  { id: "entrance", label: "Entrance", icon: "→" },
  { id: "stage", label: "Stage", icon: "▭" },
  { id: "bar", label: "Bar", icon: "⌇" },
  { id: "area", label: "Custom area", icon: "⬚" },
] as const;

function ToolIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-[11px] font-semibold text-zinc-400">
      {children}
    </span>
  );
}

export function ToolPalette({
  activeTool,
  onSelectTool,
  onAddTable,
}: ToolPaletteProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        Tools
      </p>

      <button
        type="button"
        onClick={() => onSelectTool("select")}
        className={`${studioToolBtn} ${
          activeTool === "select" ? studioToolBtnActive : ""
        }`}
      >
        <ToolIcon>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672z"
            />
          </svg>
        </ToolIcon>
        Select / move
      </button>

      <div className="my-2 h-px bg-zinc-800/80" />

      <p className="mb-1 text-[10px] font-medium text-zinc-600">Tables</p>

      <button
        type="button"
        onClick={() => {
          onSelectTool("add-round");
          onAddTable("round");
        }}
        className={`${studioToolBtn} ${
          activeTool === "add-round" ? studioToolBtnActive : ""
        }`}
      >
        <ToolIcon>○</ToolIcon>
        Round table
      </button>

      <button
        type="button"
        onClick={() => {
          onSelectTool("add-rectangle");
          onAddTable("rectangle");
        }}
        className={`${studioToolBtn} ${
          activeTool === "add-rectangle" ? studioToolBtnActive : ""
        }`}
      >
        <ToolIcon>▭</ToolIcon>
        Rectangular table
      </button>

      <button
        type="button"
        onClick={() => {
          onSelectTool("add-square");
          onAddTable("square");
        }}
        className={`${studioToolBtn} ${
          activeTool === "add-square" ? studioToolBtnActive : ""
        }`}
      >
        <ToolIcon>□</ToolIcon>
        Square table
      </button>

      <div className="my-2 h-px bg-zinc-800/80" />

      <p className="mb-1 text-[10px] font-medium text-zinc-600">Coming soon</p>

      {FUTURE_TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          disabled
          className={`${studioToolBtn} ${studioToolBtnDisabled}`}
          title="Coming soon"
        >
          <ToolIcon>{tool.icon}</ToolIcon>
          {tool.label}
        </button>
      ))}
    </div>
  );
}
