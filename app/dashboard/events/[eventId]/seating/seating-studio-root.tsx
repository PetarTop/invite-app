"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Locks document scroll while Seating Studio is mounted and provides
 * a fixed full-viewport shell so the 2400px canvas cannot expand the page.
 */
export function SeatingStudioRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverflowX = html.style.overflowX;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverflowX = body.style.overflowX;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    html.style.overflowX = "hidden";
    body.style.overflow = "hidden";
    body.style.overflowX = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.overflowX = previousHtmlOverflowX;
      body.style.overflow = previousBodyOverflow;
      body.style.overflowX = previousBodyOverflowX;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden overflow-x-hidden bg-zinc-950">
      {children}
    </div>
  );
}
