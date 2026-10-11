import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { extensionProject, websiteProjects } from "@/src/data/atelier";
import { openingScenes } from "@/src/data/opening";
import { StepButton, StepLink } from "./Step";

type WebsiteProject = (typeof websiteProjects)[number];
type Opened = { kind: "website"; project: WebsiteProject } | { kind: "extension" } | null;

const scene = (id: string) => openingScenes.find((item) => item.id === id);
const project = (id: string) => websiteProjects.find((item) => item.id === id) ?? websiteProjects[0];

// The roll-back effect runs on CSS scroll timelines where the browser has them.
// Elsewhere this mirrors the same keyframes in JS, one row at a time, so no
// ancestor style changes on scroll. Keep the numbers in step with atelier.css.
function rollAt(p: number) {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  if (p < 0.3) {
    const t = p / 0.3;
    return { origin: "50% 0%", opacity: lerp(0.55, 1, t),
      transform: `perspective(1400px) translateY(${lerp(40, 0, t)}px) rotateX(${lerp(-14, 0, t)}deg) scale(${lerp(0.96, 1, t)})` };
  }
  if (p < 0.62) return { origin: "50% 100%", opacity: 1, transform: "none" };
  const t = (p - 0.62) / 0.38;
  return { origin: "50% 100%", opacity: lerp(1, 0.15, t),
    transform: `perspective(1400px) translateY(${lerp(0, -12, t)}%) translateZ(${lerp(0, -240, t)}px) rotateX(${lerp(0, 48, t)}deg) scale(${lerp(1, 0.9, t)})` };
}

// `layout` changes when rows are added or removed, so the row list is read again.
function useRollFallback(root: RefObject<HTMLElement>, still: boolean, layout: unknown) {
  useEffect(() => {
    const element = root.current;
    if (!element || (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()"))) return;
    const rows = Array.from(element.querySelectorAll<HTMLElement>(".atelier-depth-row"));
    const wide = window.matchMedia("(min-width: 900px)");
    const reset = () => rows.forEach((row) => { row.style.transform = ""; row.style.opacity = ""; row.style.transformOrigin = ""; });
    if (still) { reset(); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!wide.matches) return reset();
      const height = window.innerHeight;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > height + 200) continue;
        const { origin, opacity, transform } = rollAt(Math.min(1, Math.max(0, (height - rect.top) / (height + rect.height))));
        row.style.transformOrigin = origin;
        row.style.transform = transform;
        row.style.opacity = String(opacity);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reset();
    };
  }, [root, still, layout]);
}

/** A device frame playing a recorded preview of the real build. */
function PreviewVideo({ id, mobile, playing }: { id: string; mobile?: boolean; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const file = `/media/previews/${id}-${mobile ? "mobile" : "desktop"}`;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) void element.play().catch(() => undefined);
    else element.pause();
  }, [playing, id]);
  return (
    <div className={`atelier-device ${mobile ? "atelier-phone" : "atelier-desktop"}`}>
      <div className="atelier-device-bar" aria-hidden="true">
        {mobile ? <span /> : <><i /><i /><i /></>}
      </div>
      <video key={file} ref={video} loop muted playsInline preload="metadata" poster={`${file}.jpg`}
        aria-label={`${id} ${mobile ? "mobile" : "desktop"} website preview`} onError={() => setError(true)}>
        <source src={`${file}.mp4`} type="video/mp4" />
      </video>
      {error && <p className="atelier-media-note">Preview unavailable. The project details are beside it.</p>}
    </div>
  );
}

/** A work card: a muted preview that plays while it is on screen. */
function WorkCard({ name, category, poster, video, url, autoplay, onOpen }: {
  name: string; category: string; poster: string; video?: string; url?: string | null; autoplay: boolean; onOpen: (from: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!autoplay) { element.pause(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void element.play().catch(() => undefined);
      else element.pause();
    }, { threshold: 0.55 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoplay]);
  return (
    <article className="atelier-card">
      {/* The step button below is the keyboard control; the picture is a larger target for a pointer. */}
      <div className="atelier-card-media" aria-hidden="true"
        onClick={(event) => onOpen(event.currentTarget.parentElement?.querySelector<HTMLElement>(".atelier-step") ?? null)}>
        <span className="atelier-card-bar"><i /><i /><i /></span>
        {video ? <video ref={ref} muted loop playsInline preload="none" poster={poster} src={video} /> : <img src={poster} alt="" loading="lazy" />}
      </div>
      <div className="atelier-card-caption">
        <div>
          <h3>{name}</h3>
          <p>{category}</p>
        </div>
        <div className="atelier-card-actions">
          <StepButton quiet onClick={(event) => onOpen(event.currentTarget)} aria-label={`Preview ${name}`}>Preview</StepButton>
          {url && <a className="atelier-card-live" href={url} target="_blank" rel="noopener noreferrer">Visit site <span aria-hidden="true">↗</span></a>}
        </div>
      </div>
    </article>
  );
}

function SceneText({ track, id, children }: { track: string; id: string; children?: ReactNode }) {
  const item = scene(id);
  return (
    <div className="atelier-scene-text">
      <span className="atelier-track-label">{track}</span>
      <h3>{item?.headline}</h3>
      <p>{item?.statement}</p>
      {children}
    </div>
  );
}

function Overlay({ label, title, onClose, returnFocus, children }: {
  label: string; title: string; onClose: () => void; returnFocus: RefObject<HTMLElement | null>; children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The control that opened the overlay; Safari doesn't focus buttons on click,
    // so document.activeElement can't be trusted here.
    const opener = returnFocus.current;
    const dialog = panel.current;
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return onClose();
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex='-1'])"))
        .filter((element) => element.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = overflow;
      opener?.focus();
    };
  }, [onClose, returnFocus]);
  // Rendered at the .atelier root: inside the content layer it would sit under the fixed nav.
  const overlay = (
    <div className="atelier-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} className="atelier-overlay-panel" role="dialog" aria-modal="true" aria-labelledby="atelier-overlay-title" tabIndex={-1}>
        <header className="atelier-overlay-head">
          <div>
            <span>{label}</span>
            <h2 id="atelier-overlay-title">{title}</h2>
          </div>
          <button type="button" className="atelier-overlay-close" data-autofocus aria-label="Close" onClick={onClose}>
            <X size={24} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
  const root = document.querySelector<HTMLElement>(".atelier");
  return root ? createPortal(overlay, root) : overlay;
}

/** How many pieces of work the grid shows, folded ones included: three websites and Waylight. */
export const WORK_SHOWN = 4;

export default function WorkGrid({ paused, reduced, onVisitCode }: { paused: boolean; reduced: boolean; onVisitCode?: () => void }) {
  const [opened, setOpened] = useState<Opened>(null);
  const [more, setMore] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const still = paused || reduced;
  const close = useCallback(() => setOpened(null), []);
  useRollFallback(grid, still, more);

  const card = (id: string) => {
    const item = project(id);
    return (
      <WorkCard name={item.name} category={item.category} poster={`/media/previews/${item.id}-desktop.jpg`}
        video={`/media/previews/${item.id}-desktop.mp4`} url={item.url} autoplay={!still && !opened}
        onOpen={(from) => { opener.current = from; setOpened({ kind: "website", project: item }); }} />
    );
  };

  return (
    <section id="work" className={`atelier-work atelier-section${still ? " is-still" : ""}`}>
      <div className="atelier-overview">
        <span className="atelier-overview-label">Selected work</span>
        <div className="atelier-overview-body">
          <h2 className="atelier-statement">Looks different. Works everywhere.</h2>
          <p>Not just a nice first screen. A complete experience, down to the phone in your hand. Every piece below is real, and every one opens.</p>
        </div>
      </div>

      <div className="atelier-depth" ref={grid}>
        <div className="atelier-depth-row">
          <SceneText track="Websites" id="website" />
          {card("s2s")}
        </div>
        <div className="atelier-depth-row atelier-desktop-only">
          {card("fulfillment")}
          {card("printdash")}
        </div>
        {/* The extension waits behind "See more". */}
        <div className="atelier-more atelier-desktop-only">
          <StepButton quiet aria-expanded={more} aria-controls="more-work" onClick={() => setMore((value) => !value)}>
            {more ? "Show less" : "See more work"}
          </StepButton>
          {onVisitCode && <StepButton quiet onClick={onVisitCode}>Have a visit code?</StepButton>}
        </div>
        <div id="more-work" className="atelier-depth-more atelier-desktop-only" hidden={!more}>
          <div className="atelier-depth-row">
            <SceneText track="Apps and tools" id="tools" />
            <WorkCard name={extensionProject.name} category={extensionProject.category}
              poster="/media/previews/waylight-desktop.jpg" autoplay={false}
              onOpen={(from) => { opener.current = from; setOpened({ kind: "extension" }); }} />
          </div>
        </div>
      </div>

      {opened?.kind === "website" && (
        <Overlay label={opened.project.category} title={opened.project.name} onClose={close} returnFocus={opener}>
          <div className="atelier-showcase-stage atelier-overlay-stage" data-tone={opened.project.tone}>
            <div className="atelier-depth-grid" aria-hidden="true" />
            <div className="atelier-device-pair">
              <PreviewVideo id={opened.project.id} playing={!reduced} />
              <PreviewVideo id={opened.project.id} mobile playing={!reduced} />
            </div>
          </div>
          <div className="atelier-overlay-copy">
            <div>
              <h3>{opened.project.title}</h3>
              <div className="atelier-tags">{opened.project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div>
              <p>{opened.project.description}</p>
              {opened.project.url ? (
                <>
                  <p className="atelier-overlay-note">Live website. This preview shows the local build.</p>
                  <StepLink href={opened.project.url} target="_blank" rel="noopener noreferrer">Visit site</StepLink>
                </>
              ) : (
                <p className="atelier-overlay-note">Not public yet. The preview is a screen recording of the real build.</p>
              )}
            </div>
          </div>
        </Overlay>
      )}

      {opened?.kind === "extension" && (
        <Overlay label={extensionProject.category} title="Waylight, running for real" onClose={close} returnFocus={opener}>
          <iframe className="atelier-waylight-frame" src="/demos/waylight/index.html" title="Waylight running on a sample page" />
          <div className="atelier-overlay-copy">
            <div>
              <h3>{extensionProject.title}</h3>
              <div className="atelier-tags">{extensionProject.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div>
              <p>This is the actual extension: Waylight&rsquo;s own popup and reading engine, running on a sample page. Flip a switch in the popup and the page changes. {extensionProject.description}</p>
              <StepLink href={extensionProject.url} target="_blank" rel="noopener noreferrer">Get Waylight</StepLink>
            </div>
          </div>
        </Overlay>
      )}
    </section>
  );
}
