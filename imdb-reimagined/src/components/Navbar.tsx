"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/", label: "Home" },
  { href: "/new-title", label: "New Title" },
  { href: "/review", label: "Review" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setLoggingOut(false);
    router.push("/login");
    router.refresh();
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-imdb-black/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          {/* Gold IMDb badge */}
          <motion.span
            className="flex items-center justify-center rounded-md bg-imdb-gradient px-2 py-0.5 text-lg font-bold text-imdb-black"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
          >
            IMDb
          </motion.span>
          <span className="text-white/90 transition-colors group-hover:text-white">Reimagined</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2"
            >
              <span className={`font-display text-sm uppercase tracking-widest transition-colors duration-200 ${
                pathname === link.href
                  ? "text-imdb-gold"
                  : "text-white/50 hover:text-white/90"
              }`}>
                {link.label}
              </span>
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute inset-x-2 -bottom-[15px] h-[2px] rounded-full bg-imdb-gradient"
                  transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {/* Auth section */}
          {!isAuthPage && (
            <div className="ml-4 flex items-center gap-3 border-l border-white/[0.08] pl-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* User avatar circle */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-imdb-gold/20 font-display text-[10px] font-bold uppercase text-imdb-gold">
                    {user.email?.[0] ?? "U"}
                  </div>
                  <span className="hidden max-w-[120px] truncate text-xs text-white/40 lg:block">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 font-display text-[10px] uppercase tracking-widest text-white/50 transition-all hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {loggingOut ? "..." : "Logout"}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg bg-imdb-gold/10 px-4 py-2 font-display text-[10px] uppercase tracking-widest text-imdb-gold transition-all hover:bg-imdb-gold/20"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" as const }}
            className="overflow-hidden border-t border-white/[0.06] bg-imdb-black/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center rounded-xl px-3 py-2.5 font-display text-sm uppercase tracking-widest transition-colors ${
                      pathname === link.href
                        ? "bg-imdb-gold/10 text-imdb-gold"
                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile auth */}
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-imdb-gold/20 font-display text-xs font-bold uppercase text-imdb-gold">
                        {user.email?.[0] ?? "U"}
                      </div>
                      <p className="truncate text-xs text-white/40">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-display text-sm uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {loggingOut ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" className="btn-gold flex-1 text-center text-xs">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="flex flex-1 items-center justify-center rounded-xl border border-imdb-gold/30 py-2.5 font-display text-xs uppercase tracking-wider text-imdb-gold transition-all hover:bg-imdb-gold/10"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
