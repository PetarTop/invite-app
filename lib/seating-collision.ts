import {
  closestCenter,
  pointerWithin,
  type Collision,
  type CollisionDetection,
  type DroppableContainer,
} from "@dnd-kit/core";

import { isGuestDragId } from "@/lib/seating-dnd";

type PointerCoords = { x: number; y: number };

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function dropType(
  containers: DroppableContainer[],
  id: string | number,
): string | null {
  const container = containers.find((item) => item.id === id);
  const current = container?.data.current as { type?: string } | undefined;
  return current?.type ?? null;
}

function distanceToRectCenter(pointer: PointerCoords, rect: Rect): number {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = pointer.x - centerX;
  const dy = pointer.y - centerY;
  return dx * dx + dy * dy;
}

function pickClosestToPointer(
  hits: Collision[],
  pointer: PointerCoords,
  droppableRects: Map<string | number, Rect>,
): Collision[] {
  if (hits.length === 0) {
    return [];
  }

  if (hits.length === 1) {
    return hits;
  }

  let best = hits[0];
  let bestDistance = Infinity;

  for (const hit of hits) {
    const rect = droppableRects.get(hit.id);
    if (!rect) {
      continue;
    }

    const distance = distanceToRectCenter(pointer, rect);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = hit;
    }
  }

  return [best];
}

function closestChairToPointer(
  args: Parameters<CollisionDetection>[0],
): Collision[] {
  const { droppableContainers, droppableRects, pointerCoordinates } = args;

  if (!pointerCoordinates) {
    return [];
  }

  const chairHits: Collision[] = [];

  for (const container of droppableContainers) {
    if (dropType(droppableContainers, container.id) !== "chair") {
      continue;
    }

    const rect = droppableRects.get(container.id);
    if (!rect) {
      continue;
    }

    chairHits.push({ id: container.id });
  }

  return pickClosestToPointer(
    chairHits,
    pointerCoordinates,
    droppableRects,
  );
}

/**
 * Guest drags: pointerWithin on chair droppables first (closest chair if
 * several overlap), then closest chair to pointer, then closestCenter.
 * Table drags: closestCenter.
 */
export const seatingCollisionDetection: CollisionDetection = (args) => {
  const { active, droppableContainers } = args;
  const containers = [...droppableContainers];

  if (!isGuestDragId(String(active.id))) {
    return closestCenter(args);
  }

  const pointer = args.pointerCoordinates;

  const pointerHits = pointerWithin(args);
  const chairPointerHits = pointerHits.filter(
    (hit) => dropType(containers, hit.id) === "chair",
  );

  if (chairPointerHits.length > 0) {
    if (pointer && chairPointerHits.length > 1) {
      return pickClosestToPointer(
        chairPointerHits,
        pointer,
        args.droppableRects,
      );
    }

    return [chairPointerHits[0]];
  }

  if (pointerHits.length > 0) {
    return [pointerHits[0]];
  }

  const chairClosest = closestChairToPointer(args);
  if (chairClosest.length > 0) {
    return chairClosest;
  }

  return closestCenter(args);
};
