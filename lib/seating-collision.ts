import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DroppableContainer,
} from "@dnd-kit/core";

import { isGuestDragId } from "@/lib/seating-dnd";

function dropType(
  containers: DroppableContainer[],
  id: string | number,
): string | null {
  const container = containers.find((item) => item.id === id);
  const current = container?.data.current as { type?: string } | undefined;
  return current?.type ?? null;
}

/**
 * Prefer pointer hits on chair droppables, then other droppables,
 * with rectIntersection and closestCenter as fallbacks for small targets.
 */
export const seatingCollisionDetection: CollisionDetection = (args) => {
  const { active, droppableContainers } = args;
  const containers = [...droppableContainers];

  if (!isGuestDragId(String(active.id))) {
    return closestCenter(args);
  }

  const pointerHits = pointerWithin(args);
  const chairPointer = pointerHits.find(
    (hit) => dropType(containers, hit.id) === "chair",
  );
  if (chairPointer) {
    return [chairPointer];
  }
  if (pointerHits.length > 0) {
    return pointerHits;
  }

  const rectHits = rectIntersection(args);
  const chairRect = rectHits.find(
    (hit) => dropType(containers, hit.id) === "chair",
  );
  if (chairRect) {
    return [chairRect];
  }
  if (rectHits.length > 0) {
    return rectHits;
  }

  return closestCenter(args);
};
