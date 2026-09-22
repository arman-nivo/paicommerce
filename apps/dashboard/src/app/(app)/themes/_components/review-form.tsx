"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button, cn, Textarea } from "@pai/ui";
import { run } from "@/lib/client";
import { saveThemeReview } from "../actions";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({ themeId, initial }: { themeId: string; initial: { rating: number; body: string | null } | null }) {
  const router = useRouter();
  const [rating, setRating] = React.useState(initial?.rating ?? 0);
  const [hover, setHover] = React.useState(0);
  const [body, setBody] = React.useState(initial?.body ?? "");
  const [saving, setSaving] = React.useState(false);
  const shown = hover || rating;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await run(saveThemeReview({ themeId, rating, body }), { success: initial ? "Review updated" : "Thanks for your review!" });
    setSaving(false);
    if (res) router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium">{initial ? "Your review" : "Rate this theme"}</p>
      <div className="flex items-center gap-2">
        <div className="flex" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
              className="p-0.5"
            >
              <Star className={cn("size-6 transition", shown >= i ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
            </button>
          ))}
        </div>
        {shown > 0 && <span className="text-sm text-muted-foreground">{LABELS[shown]}</span>}
      </div>
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you like? What could be better? (optional)" rows={3} maxLength={2000} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={saving} disabled={!rating}>
          {initial ? "Update review" : "Post review"}
        </Button>
      </div>
    </form>
  );
}
