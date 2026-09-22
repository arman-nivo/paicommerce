"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Full-bleed background media for the Stride hero.
 *  - Always renders the poster image first (fast LCP, and the only thing shown to people who
 *    prefer reduced motion).
 *  - An mp4/webm file plays muted + looped inline; a YouTube/Vimeo `embed` URL is shown as a
 *    cover-fitted, non-interactive background iframe.
 *  - A visible pause/play button satisfies WCAG 2.2.2 (moving content can be paused).
 */
export function HeroMedia({
  poster,
  posterMobile,
  alt,
  video,
  embed,
  className,
}: {
  poster?: string;
  posterMobile?: string;
  alt?: string;
  video?: string;
  embed?: string | null;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(false);
  const [playing, setPlaying] = useState(true);
  const hasVideo = Boolean(video || embed);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionOk(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing && motionOk) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, motionOk]);

  const showVideo = hasVideo && motionOk;

  return (
    <div className={className}>
      {poster ? (
        <picture>
          {posterMobile ? <source media="(max-width: 767px)" srcSet={posterMobile} /> : null}
          <img src={poster} alt={alt ?? ""} fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover" />
        </picture>
      ) : null}
      {showVideo && video ? (
        <video
          ref={ref}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {showVideo && !video && embed && playing ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <iframe
            src={embed}
            title="Background video"
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0"
          />
        </div>
      ) : null}
      {showVideo ? (
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause background video" : "Play background video"}
          className="stride-hero-toggle absolute bottom-20 right-4 z-20 grid size-11 place-items-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur transition hover:bg-black/60 md:bottom-24 md:right-8"
        >
          {playing ? <Pause className="size-4 fill-current" aria-hidden /> : <Play className="size-4 fill-current" aria-hidden />}
        </button>
      ) : null}
    </div>
  );
}
