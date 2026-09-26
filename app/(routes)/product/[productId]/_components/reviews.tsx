"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthUser } from "@/hooks/use-auth-user";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  created_at: string;
};

type ReviewData = {
  reviews: Review[];
  count: number;
  average: number;
  breakdown: Record<string, number>;
  mine: boolean;
};

const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <div className="flex items-center" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
      />
    ))}
  </div>
);

const Reviews = ({ productId }: { productId: string }) => {
  const { user, isLoading: authLoading } = useAuthUser();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      setData(await res.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load, user?.id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!rating) {
      setFormError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, authorName: name, rating, title, body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(json.error || "Could not submit your review.");
        return;
      }
      toast.success("Thanks! Your review has been posted.");
      setRating(0);
      setTitle("");
      setBody("");
      await load();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 bg-white border border-border rounded-lg shadow-soft-sm overflow-hidden" id="reviews">
      <div className="px-4 sm:px-8 py-4 border-b border-border">
        <h3 className="font-semibold text-lg text-foreground">Customer Reviews</h3>
      </div>

      <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {loadError && <p className="text-sm text-destructive">Reviews could not be loaded right now.</p>}
          {!data && !loadError && <p className="text-sm text-muted-foreground">Loading reviews…</p>}

          {data && data.count > 0 && (
            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
              <div className="text-3xl font-bold tabular-nums text-foreground">{data.average.toFixed(1)}</div>
              <div>
                <Stars value={data.average} size={18} />
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {data.count} review{data.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="ml-auto hidden sm:block space-y-0.5 text-[11px] text-muted-foreground tabular-nums">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="w-3">{n}</span>
                    <div className="w-24 h-1.5 rounded bg-surface-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${((data.breakdown[String(n)] || 0) / data.count) * 100}%` }}
                      />
                    </div>
                    <span className="w-4">{data.breakdown[String(n)] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && data.count === 0 && (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
          )}

          {data?.reviews.map((r) => (
            <div key={r.id} className="pb-5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Stars value={r.rating} size={14} />
                {r.title && <span className="text-sm font-semibold text-foreground">{r.title}</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{r.body}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{r.author_name}</span>
                <span>·</span>
                <span>{new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <BadgeCheck size={13} /> Verified purchase
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-surface-1 border border-border rounded-lg p-4 sm:p-5">
            <h4 className="font-semibold text-foreground mb-3">Write a review</h4>

            {authLoading ? (
              <p className="text-sm text-muted-foreground">Checking your account…</p>
            ) : !user ? (
              <p className="text-sm text-muted-foreground">
                Please{" "}
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                  className="text-primary font-semibold hover:underline"
                >
                  sign in
                </Link>{" "}
                to write a review.
              </p>
            ) : data?.mine ? (
              <p className="text-sm text-muted-foreground">You have already reviewed this product. Thank you!</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Rating *</label>
                  <div className="flex items-center gap-1 mt-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        aria-label={`${n} star${n === 1 ? "" : "s"}`}
                        className="p-0.5"
                      >
                        <Star
                          size={24}
                          className={n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="review-name">Display name *</label>
                  <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required placeholder="How your name appears" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="review-title">Title (optional)</label>
                  <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Summarise your review" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="review-body">Review *</label>
                  <Textarea id="review-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required minLength={10} className="min-h-[100px]" placeholder="What did you like or dislike?" />
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit review"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
