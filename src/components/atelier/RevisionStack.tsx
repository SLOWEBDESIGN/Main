import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import { StepButton, StepLink } from "./Step";
import type { BrandVariant } from "@/src/lib/schema";
import ModernRevisionPreview from "./ModernRevisionPreview";

const REVISIONS = [
  { number: "Start", label: "The starting point", note: "The original site: a straightforward starting point.", src: "/media/previews/revision-0-full.jpg" },
  { number: "Revision 01", label: "A new direction", note: "The first redesign explored a more visual way to tell the story.", src: "/media/previews/revision-1-full.jpg" },
  { number: "Revision 02", label: "More depth", note: "The second revision brought far more depth to the content and the services.", src: "/media/previews/revision-2-full.jpg" },
  { number: "Revision 03", label: "A different perspective", note: "From a straightforward service page to a world you can explore. You're standing in it.", src: "/media/previews/revision-3-full.jpg" },
];
const LAST = REVISIONS.length - 1;

/** Local captures, plus the current branded markup, read in wheel-sized strokes. */
function ScrollPreview({ src, alt, active, playing, onComplete, modern }: {
  src: string; alt: string; active: boolean; playing: boolean; onComplete: () => void;
  modern?: { variant: BrandVariant; theme: "light" | "dark" };
}) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [opened, setOpened] = useState(false);
  const markReady = useCallback(() => setLoaded(true), []);
  const latestComplete = useRef(onComplete);
  latestComplete.current = onComplete;
  const motion = useRef({ phase: "reading", elapsed: 0, duration: 1450, from: 0, to: 0, offset: 0, stroke: 0 });

  useEffect(() => {
    // Cached images may finish before hydration attaches the load handler.
    if (!modern) setLoaded(Boolean(image.current?.complete && image.current.naturalHeight));
  }, [src, modern]);

  useEffect(() => { if (active) setOpened(true); }, [active]);

  useEffect(() => {
    motion.current = { phase: "reading", elapsed: 0, duration: 1450, from: 0, to: 0, offset: 0, stroke: 0 };
    if (page.current) page.current.style.transform = "translateY(0px)";
    if (frame.current) {
      frame.current.dataset.scrollPhase = "top";
      frame.current.dataset.scrollOffset = "0";
    }
  }, [active, src]);

  useEffect(() => {
    if (!active || !playing || !loaded) return;
    const viewport = frame.current, content = page.current;
    if (!viewport || !content) return;
    let raf = 0, previous = 0;
    const tick = (now: number) => {
      const dt = previous ? Math.min(64, now - previous) : 0;
      previous = now;
      if (!document.hidden) {
        const s = motion.current;
        const max = Math.max(0, content.offsetHeight - viewport.clientHeight);
        s.elapsed += dt;
        if (s.phase === "scrolling") {
          const t = Math.min(1, s.elapsed / s.duration);
          const eased = 1 - Math.pow(1 - t, 3);
          s.offset = s.from + (s.to - s.from) * eased;
          content.style.transform = "translateY(" + (-s.offset).toFixed(2) + "px)";
          if (t === 1) {
            s.phase = "reading";
            s.elapsed = 0;
            s.duration = s.offset >= max - 1 ? 1750 : 680 + (s.stroke % 3) * 170;
          }
        } else if (s.elapsed >= s.duration) {
          if (s.offset >= max - 1) {
            viewport.dataset.scrollPhase = "complete";
            latestComplete.current();
            return;
          }
          s.from = s.offset;
          s.to = Math.min(max, s.offset + viewport.clientHeight * [0.82, 1.08, 0.72, 0.94][s.stroke % 4]);
          s.phase = "scrolling";
          s.duration = 480 + (s.stroke % 3) * 75;
          s.elapsed = 0;
          s.stroke++;
        }
        viewport.dataset.scrollPhase = s.phase;
        viewport.dataset.scrollOffset = s.offset.toFixed(2);
        viewport.dataset.scrollMax = max.toFixed(2);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, loaded]);

  return <div ref={frame} className="atelier-revision-scroll">
    <div ref={page} className="atelier-revision-scroll-page">
      {modern
        ? opened && <ModernRevisionPreview variant={modern.variant} theme={modern.theme} onReady={markReady} />
        : <img ref={image} src={src} alt={alt} loading="lazy" onLoad={markReady} />}
    </div>
  </div>;
}

export default function RevisionStack({ paused, reduced, variant, theme }: {
  paused: boolean; reduced: boolean; variant: BrandVariant; theme: "light" | "dark";
}) {
  const [open, setOpen] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const [visible, setVisible] = useState(false);
  const [stopped, setStopped] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const shown = REVISIONS[open];
  const playing = visible && !paused && !reduced && !stopped && !completed.has(open);
  const advance = useCallback((index: number) => {
    setCompleted((previous) => new Set(previous).add(index));
    setOpen((current) => current === index ? Math.min(LAST, current + 1) : current);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="atelier-revision-stack atelier-desktop-only" data-revision={open}
      data-completed={[...completed].join(",")}>
      <div className="atelier-revision-stage">
        <ScrollPreview src={REVISIONS[0].src} alt="The starting point: the complete original website"
          active={open === 0} playing={playing} onComplete={() => advance(0)} />
        {REVISIONS.slice(1).map((revision, k) => {
          const i = k + 1;
          const state = i > open ? "is-waiting" : i === open ? "is-top" : "is-under";
          return (
            <div role="button" key={revision.number} className={"atelier-revision-card " + state}
              style={{ "--slot": LAST - i + 1 } as CSSProperties}
              onClick={() => setOpen(i > open ? i : i - 1)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpen(i > open ? i : i - 1);
                }
              }}
              tabIndex={state === "is-under" ? -1 : 0}
              aria-hidden={state === "is-under" ? true : undefined}
              aria-label={i > open ? "Slide in " + revision.number + ": " + revision.label : "Slide " + revision.number + " back out"}>
              <ScrollPreview src={revision.src} alt="" active={open === i} playing={playing} onComplete={() => advance(i)}
                modern={i === LAST ? { variant, theme } : undefined} />
              <span className="atelier-revision-tab" aria-hidden="true">
                <small>{revision.number}</small>{revision.label}{i === LAST && <i>You are here</i>}
              </span>
            </div>
          );
        })}
      </div>
      <div className="atelier-revision-caption" aria-live="polite">
        <span className="atelier-overview-label">{shown.number}</span>
        <h3>{shown.label}</h3><p>{shown.note}</p>
        <ol className="atelier-revision-progress" aria-label={open + 1 + " of " + REVISIONS.length}>
          {REVISIONS.map((revision, i) => <li key={revision.number} className={i <= open ? "is-on" : undefined} />)}
        </ol>
        {open < LAST
          ? <StepButton quiet onClick={() => setOpen(open + 1)}>Slide in {REVISIONS[open + 1].number.toLowerCase()}</StepButton>
          : <StepLink quiet href="#top">Revisit the sculpture</StepLink>}
        {open > 0 && <button type="button" className="atelier-revision-back" onClick={() => setOpen(open - 1)}>Slide back</button>}
        {!reduced && !completed.has(open) && <button type="button" className="atelier-revision-play" aria-pressed={stopped}
          onClick={() => setStopped((value) => !value)}>
          {stopped ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {stopped ? "Resume previews" : "Pause previews"}
        </button>}
      </div>
    </div>
  );
}
