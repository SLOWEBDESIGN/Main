import { useEffect, useRef, useState } from "react";
import { Pause, Play, VolumeX } from "lucide-react";
import { getReelsForBrand } from "@/src/data/reels";
import type { BrandVariant } from "@/src/lib/schema";
import { StepLink } from "./Step";

// The stack shows three cards; any more wait out of sight behind the last one.
const STACK_SHOWN = 3;

export default function ReelGallery({
  paused,
  reduced,
  variant = "slowebdesign",
}: {
  paused: boolean;
  reduced: boolean;
  variant?: BrandVariant;
}) {
  const reels = getReelsForBrand(variant);
  const [active, setActive] = useState(0);
  const [manualPlaying, setManualPlaying] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  // One video per card in the deck; only the front card plays.
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const section = useRef<HTMLElement>(null);
  const reel = reels[active];
  const playing = visible && (manualPlaying ?? (!paused && !reduced));
  useEffect(() => {
    setManualPlaying(null);
  }, [paused, reduced]);
  useEffect(() => {
    if (!section.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    videos.current.forEach((element, index) => {
      if (!element) return;
      if (index === active && playing) void element.play().catch(() => undefined);
      else element.pause();
    });
  }, [playing, active]);
  // Clicking the deck deals the next card: the current reel pauses and the next one plays.
  const deal = () => {
    setActive((current) => (current + 1) % reels.length);
    setManualPlaying(true);
  };
  const next = reels[(active + 1) % reels.length];
  return (
    <section id="reels" ref={section} className="atelier-reels atelier-section">
      <div className="atelier-section-heading">
        <span className="atelier-kicker">MOTION & CONTENT</span>
        <span className="atelier-kicker">
          <VolumeX size={13} /> ORIGINAL WORK. SILENT PREVIEW.
        </span>
      </div>
      <div className="atelier-reel-layout">
        <div className="atelier-reel-copy">
          <h2 className="atelier-reveal">Built to be seen.</h2>
          <p>
            A website gives the work a home. Short-form content gives people a reason to visit.
          </p>
          <p className="atelier-reel-sub atelier-desktop-only">
            A cut. A color. A perfectly timed word. Vertical edits, Reels, TikTok, and campaign systems.
          </p>
          <div className="atelier-reel-list atelier-desktop-only" aria-label="Choose a reel">
            {reels.map((item, i) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                <strong>{item.title}</strong>
                <small>{Math.round(item.seconds)} SEC</small>
                <Play size={13} />
              </button>
            ))}
          </div>
          <div className="atelier-reel-tags atelier-desktop-only">
            {reel.craft.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <StepLink quiet className="atelier-desktop-only" href="#queue">Have something worth showing?</StepLink>
        </div>
        <div className="atelier-reel-stage">
          <div className="atelier-deck">
            {reels.map((item, index) => {
              const position = (index - active + reels.length) % reels.length;
              const front = position === 0;
              return (
                <button
                  type="button"
                  key={item.id}
                  className="atelier-deck-card"
                  data-position={Math.min(position, STACK_SHOWN)}
                  onClick={deal}
                  tabIndex={front ? 0 : -1}
                  aria-hidden={front ? undefined : true}
                  aria-label={front ? `${item.title}. Show the next reel, ${next.title}` : undefined}
                >
                  <video
                    ref={(element) => {
                      videos.current[index] = element;
                    }}
                    src={item.src}
                    poster={item.poster}
                    muted
                    loop
                    playsInline
                    preload={front ? "metadata" : "none"}
                  />
                </button>
              );
            })}
          </div>
          <div className="atelier-reel-controls">
            <span>{reel.title}</span>
            <button
              type="button"
              onClick={() => setManualPlaying(!playing)}
              aria-label={playing ? "Pause reel" : "Play reel"}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
          <span className="atelier-film-label">COLOR / CUT / COMPOSITION</span>
        </div>
      </div>
    </section>
  );
}
