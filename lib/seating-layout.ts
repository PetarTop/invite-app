export type TableShape = "round" | "rectangle" | "square";

export type LayoutTable = {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  shape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 560;
export const DEFAULT_TABLE_CAPACITY = 8;

export const SHAPE_DEFAULTS: Record<
  TableShape,
  { width: number; height: number }
> = {
  round: { width: 120, height: 120 },
  square: { width: 120, height: 120 },
  rectangle: { width: 160, height: 100 },
};

export function isTableShape(value: string): value is TableShape {
  return value === "round" || value === "rectangle" || value === "square";
}

export function defaultPositionForIndex(index: number) {
  return {
    x: 40 + (index % 4) * 180,
    y: 40 + Math.floor(index / 4) * 180,
  };
}

export function clampTablePosition(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    x: Math.max(0, Math.min(x, CANVAS_WIDTH - width)),
    y: Math.max(0, Math.min(y, CANVAS_HEIGHT - height)),
  };
}

export function layoutTableDragId(eventId: string, tableId: string) {
  return `layout-table-${eventId}-${tableId}`;
}

export function parseLayoutTableDragId(id: string) {
  const parts = id.split("-");
  return parts[parts.length - 1] ?? "";
}

export function normalizeLayoutTable(row: {
  id: string | number;
  event_id: string | number;
  name: string;
  capacity: number;
  shape?: string | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  rotation?: number | null;
}): LayoutTable {
  const shape =
    row.shape && isTableShape(row.shape) ? row.shape : ("round" as const);
  const defaults = SHAPE_DEFAULTS[shape];

  return {
    id: String(row.id),
    event_id: String(row.event_id),
    name: row.name,
    capacity: row.capacity,
    shape,
    x: Number(row.x ?? 40),
    y: Number(row.y ?? 40),
    width: Number(row.width ?? defaults.width),
    height: Number(row.height ?? defaults.height),
    rotation: Number(row.rotation ?? 0),
  };
}
