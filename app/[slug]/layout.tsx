import { Cormorant_Garamond, Geist } from "next/font/google";
import type { ReactNode } from "react";

const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-invite-display",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-invite-sans",
});

export default function InvitationLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${sans.variable} invitation-root min-h-full font-[family-name:var(--font-invite-sans)]`}
    >
      {children}
    </div>
  );
}
