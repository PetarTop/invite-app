import type { LayoutTable, TableShape } from "@/lib/seating-layout";

export type ChairPosition = {
  x: number;
  y: number;
  rotation: number;
};

export const CHAIR_VISUAL_SIZE = 22;
export const CHAIR_HITBOX_SIZE = 40;
/** @deprecated Use CHAIR_VISUAL_SIZE for layout math */
export const CHAIR_WIDTH = CHAIR_VISUAL_SIZE;
/** @deprecated Use CHAIR_VISUAL_SIZE for layout math */
export const CHAIR_HEIGHT = CHAIR_VISUAL_SIZE;
export const CHAIR_GAP = 10;

function allocateCounts(capacity: number, sideLengths: number[]): number[] {
  if (capacity <= 0) {
    return sideLengths.map(() => 0);
  }

  const totalLength = sideLengths.reduce((sum, length) => sum + length, 0);
  const exact = sideLengths.map(
    (length) => (capacity * length) / totalLength,
  );
  const counts = exact.map((value) => Math.floor(value));
  let remaining = capacity - counts.reduce((sum, count) => sum + count, 0);

  const remainders = exact
    .map((value, index) => ({ index, remainder: value - counts[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (const item of remainders) {
    if (remaining <= 0) {
      break;
    }

    counts[item.index] += 1;
    remaining -= 1;
  }

  return counts;
}

function roundChairPositions(
  capacity: number,
  width: number,
  height: number,
): ChairPosition[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) / 2 + CHAIR_GAP;

  return Array.from({ length: capacity }, (_, index) => {
    const angle = (2 * Math.PI * index) / capacity - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const rotation = (angle * 180) / Math.PI + 90;

    return { x, y, rotation };
  });
}

function sideChairPositions(
  side: "top" | "right" | "bottom" | "left",
  count: number,
  width: number,
  height: number,
): ChairPosition[] {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const slot = (index + 1) / (count + 1);

    switch (side) {
      case "top":
        return {
          x: width * slot,
          y: -CHAIR_GAP,
          rotation: 180,
        };
      case "bottom":
        return {
          x: width * slot,
          y: height + CHAIR_GAP,
          rotation: 0,
        };
      case "left":
        return {
          x: -CHAIR_GAP,
          y: height * slot,
          rotation: 90,
        };
      case "right":
        return {
          x: width + CHAIR_GAP,
          y: height * slot,
          rotation: -90,
        };
    }
  });
}

function rectangularChairPositions(
  capacity: number,
  width: number,
  height: number,
): ChairPosition[] {
  const sides = ["top", "right", "bottom", "left"] as const;
  const sideLengths = [width, height, width, height];
  const counts = allocateCounts(capacity, sideLengths);

  return sides.flatMap((side, index) =>
    sideChairPositions(side, counts[index], width, height),
  );
}

export function calculateChairPositions(table: {
  shape: TableShape;
  capacity: number;
  width: number;
  height: number;
}): ChairPosition[] {
  const capacity = Math.max(0, Math.floor(table.capacity));

  if (capacity === 0) {
    return [];
  }

  if (table.shape === "round") {
    return roundChairPositions(capacity, table.width, table.height);
  }

  return rectangularChairPositions(capacity, table.width, table.height);
}

export function calculateChairPositionsForTable(
  table: LayoutTable,
): ChairPosition[] {
  return calculateChairPositions(table);
}
