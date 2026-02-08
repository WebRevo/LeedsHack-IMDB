"use client";

import { ReactNode } from "react";
import CinematicShell from "@/components/cinema/CinematicShell";

interface WizardLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export default function WizardLayout({ left, right }: WizardLayoutProps) {
  return (
    <CinematicShell>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 pt-20 pb-10 sm:gap-8 sm:px-6 sm:pt-24 sm:pb-12 lg:flex-row lg:gap-10">
        {/* Main area — step content */}
        <div className="flex flex-1 flex-col">{left}</div>

        {/* Sidebar — below content on mobile, sticky on desktop */}
        <aside className="w-full shrink-0 lg:w-80">{right}</aside>
      </div>
    </CinematicShell>
  );
}
