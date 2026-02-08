"use client";

import { ReactNode } from "react";

interface CinematicShellProps {
  children: ReactNode;
}

export default function CinematicShell({ children }: CinematicShellProps) {
  return (
    <div className="cinema-shell relative min-h-screen overflow-hidden bg-[#faf8f0]">
      {/* ── A) Base warm ambient washes ───────────────────── */}
      {/* Top-center gold wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(245,197,24,0.18),transparent_70%)]" />
      {/* Bottom-right orange wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_90%,rgba(255,104,0,0.10),transparent_70%)]" />
      {/* Left-side gold wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_5%_50%,rgba(245,197,24,0.08),transparent_65%)]" />
      {/* Center warm bloom */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_45%,rgba(249,220,116,0.12),transparent_70%)]" />

      {/* ── B) Vignette — darker corners ─────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_50%,rgba(22,22,22,0.07))]" />

      {/* ── C) Hero title glow — bright gold behind center ── */}
      <div
        className="pointer-events-none absolute left-1/2 top-[35%] h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 100% 80%, rgba(245,197,24,0.14) 0%, rgba(249,220,116,0.06) 45%, transparent 75%)",
        }}
      />

      {/* ── Floating mesh orbs (CSS animated) ────────────── */}
      {/* Gold orb — top left */}
      <div
        className="pointer-events-none absolute -left-[10%] -top-[8%] h-[600px] w-[600px] animate-mesh-1 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(245,197,24,0.25) 0%, rgba(249,220,116,0.08) 50%, transparent 70%)",
        }}
      />
      {/* Orange orb — bottom right */}
      <div
        className="pointer-events-none absolute -bottom-[12%] -right-[10%] h-[550px] w-[550px] animate-mesh-2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,104,0,0.18) 0%, rgba(245,197,24,0.06) 50%, transparent 70%)",
        }}
      />
      {/* Warm orb — center right */}
      <div
        className="pointer-events-none absolute right-[5%] top-[30%] h-[400px] w-[400px] animate-gradient-drift rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,170,0,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Aurora gradient band ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 animate-aurora opacity-[0.06]"
        style={{
          background:
            "linear-gradient(135deg, rgba(245,197,24,0.5) 0%, transparent 25%, rgba(255,104,0,0.4) 50%, transparent 75%, rgba(249,220,116,0.5) 100%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* ── D) Film grain texture ────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── E) Subtle dot grid pattern ───────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,197,24,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
