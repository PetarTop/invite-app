"use client";

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/seating-layout";

import { studioCanvasScroll, studioCanvasViewport } from "./seating-ui";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1.5;
const ZOOM_STEP = 0.1;
const CANVAS_PADDING = 24;

type CanvasWorkspaceProps = {
  children: ReactNode;
  error?: string | null;
};

export function CanvasWorkspace({ children, error }: CanvasWorkspaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const scaledWidth = CANVAS_WIDTH * zoom;
  const scaledHeight = CANVAS_HEIGHT * zoom;

  const resetView = useCallback(() => {
    setZoom(1);
    scrollRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  }, []);

  const fitView = useCallback(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const availableWidth = container.clientWidth - CANVAS_PADDING * 2;
    const availableHeight = container.clientHeight - CANVAS_PADDING * 2;
    const fitZoom = Math.min(
      availableWidth / CANVAS_WIDTH,
      availableHeight / CANVAS_HEIGHT,
      1,
    );
    const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoom));

    setZoom(nextZoom);
    requestAnimationFrame(() => {
      container.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((current) =>
      Math.min(ZOOM_MAX, Math.round((current + ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((current) =>
      Math.max(ZOOM_MIN, Math.round((current - ZOOM_STEP) * 100) / 100),
    );
  }, []);

  return (
    <div className={studioCanvasViewport}>
      {error && (
        <p
          className="shrink-0 border-b border-red-900/40 bg-red-950/40 px-4 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden border-x border-zinc-800/60 bg-[radial-gradient(ellipse_at_center,_rgba(39,39,42,0.35)_0%,_rgba(9,9,11,0.9)_70%)]">
        <div ref={scrollRef} className={studioCanvasScroll}>
          <div
            className="box-border p-6"
            style={{
              width: scaledWidth + CANVAS_PADDING * 2,
              minHeight: scaledHeight + CANVAS_PADDING * 2,
            }}
          >
            <div
              style={{
                width: scaledWidth,
                height: scaledHeight,
              }}
            >
              <div
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${zoom})`,
                  transformOrigin: "0 0",
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>

        <CanvasViewControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onFit={fitView}
        />
      </div>
    </div>
  );
}

function CanvasViewControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-20">
      <div className="pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-900/95 shadow-lg shadow-black/40 backdrop-blur-sm">
        <ControlButton label="Zoom in" onClick={onZoomIn}>
          +
        </ControlButton>
        <ControlButton label="Zoom out" onClick={onZoomOut}>
          −
        </ControlButton>
        <div className="border-y border-zinc-800/80 px-2 py-1 text-center text-[10px] font-medium tabular-nums text-zinc-500">
          {Math.round(zoom * 100)}%
        </div>
        <ControlButton label="Fit view" onClick={onFit}>
          Fit
        </ControlButton>
        <ControlButton label="Reset view" onClick={onReset}>
          1:1
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
    >
      {children}
    </button>
  );
}
