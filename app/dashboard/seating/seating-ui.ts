/** Shared Tailwind class tokens for the seating editor chrome. */

export const seatingPanel =
  "rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-4 shadow-xl shadow-black/25 backdrop-blur-sm";

export const seatingPanelHeader =
  "text-sm font-semibold tracking-tight text-zinc-100";

export const seatingPanelSubtext = "text-xs leading-relaxed text-zinc-500";

export const seatingInput =
  "w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 shadow-inner shadow-black/20 transition-colors placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

export const seatingLabel =
  "text-[11px] font-medium uppercase tracking-wide text-zinc-500";

export const seatingBtnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-md shadow-amber-950/30 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50";

export const seatingBtnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 px-3.5 py-2 text-xs font-medium text-zinc-200 shadow-sm transition-all hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50";

export const seatingBtnDanger =
  "mt-1 w-full rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2.5 text-sm font-medium text-red-300 shadow-sm transition-all hover:border-red-800 hover:bg-red-950/70 active:scale-[0.98] disabled:opacity-50";

export const seatingCanvas =
  "relative overflow-visible rounded-2xl border border-zinc-800/90 bg-zinc-950 shadow-[inset_0_2px_24px_rgba(0,0,0,0.45)] bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]";

export const seatingCanvasEmpty =
  "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center";

export const studioShell =
  "flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden overflow-x-hidden bg-zinc-950 text-zinc-100";

export const studioMain =
  "flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden overflow-x-hidden lg:flex-row";

export const studioSidebar =
  "flex min-h-0 w-full min-w-0 max-w-full shrink-0 flex-col overflow-hidden overflow-x-hidden border-zinc-800/80 bg-zinc-900/50 max-lg:max-h-[38vh] lg:h-full lg:w-72 xl:w-80";

export const studioSidebarSection =
  "shrink-0 border-b border-zinc-800/80 p-4";

export const studioSidebarScroll =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain";

export const studioCanvasViewport =
  "relative flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden overflow-x-hidden bg-zinc-950";

export const studioCanvasScroll =
  "min-h-0 min-w-0 max-w-full flex-1 overflow-auto overflow-x-auto overscroll-contain [scrollbar-gutter:stable]";

export const studioFloorCanvas =
  "relative shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-zinc-700/40 bg-[#0c0c0e] shadow-[inset_0_4px_48px_rgba(0,0,0,0.55)] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]";

export const studioRoomBoundary =
  "pointer-events-none absolute rounded-lg border border-zinc-600/20 bg-zinc-900/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]";

export const studioToolBtn =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800/80 hover:text-zinc-100";

export const studioToolBtnActive =
  "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";

export const studioToolBtnDisabled =
  "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-zinc-300";
