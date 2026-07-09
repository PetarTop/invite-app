import type { ReactNode } from "react";

import { SeatingStudioRoot } from "./seating-studio-root";

/** Locks the seating route to the viewport — no document-level scroll. */
export default function SeatingStudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SeatingStudioRoot>{children}</SeatingStudioRoot>;
}
