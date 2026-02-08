"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import PageTransition from "@/components/PageTransition";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/new-title";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <PageTransition>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-12">
        {/* Blurred gold accent */}
        <div className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-imdb-gold/[0.06] blur-3xl" />

        <motion.div
          className="relative z-10 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center">
            <span className="font-display text-xs uppercase tracking-[0.3em] text-imdb-gold/70">
              Welcome Back
            </span>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-imdb-black">
              Sign{" "}
              <span className="bg-imdb-gradient bg-clip-text text-transparent">In</span>
            </h1>
            <p className="mt-2 text-sm text-imdb-gray">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form card */}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-cinema">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-cinema mt-2"
                />
              </div>

              <div>
                <label className="label-cinema">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  minLength={6}
                  className="input-cinema mt-2"
                />
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/15 bg-red-50/50 px-4 py-3 text-xs text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="inline-block h-4 w-4 rounded-full border-2 border-imdb-black/20 border-t-imdb-black"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-imdb-gray">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-display uppercase tracking-wider text-imdb-gold transition-colors hover:text-imdb-gold/80"
            >
              Sign Up
            </Link>
          </p>

          {/* Accent line */}
          <div className="mx-auto mt-8 h-[2px] w-16 rounded-full bg-imdb-gradient" />
        </motion.div>
      </section>
    </PageTransition>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
