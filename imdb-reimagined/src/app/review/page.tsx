"use client";

import PageTransition from "@/components/PageTransition";

export default function Review() {
  return (
    <PageTransition>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <span className="font-display text-xs uppercase tracking-widest text-imdb-gold">
          Critique
        </span>
        <h1 className="page-heading mt-2 text-center">Write a Review</h1>
        <p className="mt-6 max-w-lg text-center text-imdb-gray">
          Share your thoughts on a title. Rating system and review
          submission will be implemented here.
        </p>

        <div className="mt-12 w-full max-w-lg space-y-6">
          <div className="card">
            <label className="block font-display text-xs uppercase tracking-widest text-imdb-gold">
              Select Title
            </label>
            <div className="mt-2 h-10 w-full rounded-lg border border-imdb-black/10 bg-imdb-white" />
          </div>
          <div className="card">
            <label className="block font-display text-xs uppercase tracking-widest text-imdb-gold">
              Rating
            </label>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded border border-imdb-black/10 font-display text-sm text-imdb-gray transition-colors hover:border-imdb-gold hover:text-imdb-gold"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <label className="block font-display text-xs uppercase tracking-widest text-imdb-gold">
              Your Review
            </label>
            <div className="mt-2 h-32 w-full rounded-lg border border-imdb-black/10 bg-imdb-white" />
          </div>
          <button className="btn-gold w-full" disabled>
            Submit Review (Coming Soon)
          </button>
        </div>
      </section>
    </PageTransition>
  );
}
