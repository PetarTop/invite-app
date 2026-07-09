import type { ReactNode } from "react";

/** Locks the seating route to the viewport — no document-level scroll. */
export default function SeatingStudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-dvh w-full max-w-[100vw] overflow-hidden">{children}</div>
  );
}
