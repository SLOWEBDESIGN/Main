import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import DesignConstellation from "./DesignConstellation";
import ConstellationField from "./ConstellationField";
import {
  ArrowDown,
  ArrowUpRight,
  Moon,
  Sun,
  Pause,
  Play,
  Plus,
  X,
} from "lucide-react";
import { process } from "@/src/data/atelier";
import { getBrandCopy, getBrandContactCopy, type BrandVariant } from "@/src/lib/schema";
import { ToolRibbon } from "@/src/components/studio/ToolRibbon";
import type { HeroStatus } from "./IcyStaircase";
import type { HeroPhase } from "./heroScene";
import WorkGrid, { WORK_SHOWN } from "./WorkGrid";
import ReelGallery from "./ReelGallery";
import ContentDepth from "./ContentDepth";
import ApplicationForm from "./ApplicationForm";
import AboutSection from "./AboutSection";
import ServiceStack from "./ServiceStack";
import NextSlot from "./NextSlot";
import RevisionStack from "./RevisionStack";
import HowItWorksButton from "./HowItWorksButton";
import { StepButton, StepLink } from "./Step";
import VisitCodeDialog from "./VisitCodeDialog";
import StatusLinks from "./StatusLinks";

const Staircase = dynamic(() => import("./IcyStaircase"), {
  ssr: false,
  loading: () => <div className="atelier-scene-loading" aria-hidden="true" />,
});

function useMotionPreference(preview: boolean) {
  const [preference, setPreference] = useState({ reduced: true, known: preview });
  useEffect(() => {
    if (preview) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPreference({ reduced: query.matches, known: true });
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preview]);
  return preference;
}

function useHeroInteraction(preview: boolean) {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    if (preview) return;
    const query = window.matchMedia("(min-width: 701px) and (hover: hover) and (pointer: fine)");
    const update = () => setInteractive(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preview]);
  return interactive;
}

const workCount = String(WORK_SHOWN).padStart(2, "0");
// React 18 emits this native boolean attribute as an empty string. Use the
// same compatibility map as the read-only archive, without a typed JSX prop.
const viewOnly = { inert: "" } as Record<string, string>;

export default function AtelierHome({ variant, preview = false, previewTheme = "dark" }: {
  variant: BrandVariant;
  preview?: boolean;
  previewTheme?: "light" | "dark";
}) {
  const copy = getBrandCopy(variant);
  const contactCopy = getBrandContactCopy(variant);
  const showSloSections = variant === "slowebdesign";
  const [light, setLight] = useState(preview && previewTheme === "light");
  const [paused, setPaused] = useState(preview);
  const [runner, setRunner] = useState<HeroStatus>("arriving");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [heroPhase, setHeroPhase] = useState<HeroPhase>(preview ? "ready" : "waiting");
  const [skipIntro, setSkipIntro] = useState(preview);
  const [heroUnavailable, setHeroUnavailable] = useState(false);
  const { reduced, known: motionKnown } = useMotionPreference(preview);
  const heroInteractive = useHeroInteraction(preview);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preview) return;
    const directSection =
      !!window.location.hash && window.location.hash !== "#top";
    const finish = () => {
      setSkipIntro(true);
      setHeroPhase("ready");
    };
    if (
      directSection ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      finish();
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    const leaveHero = () => {
      if (window.scrollY > 80) finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("scroll", leaveHero, { passive: true });
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("scroll", leaveHero);
    };
  }, [preview]);

  useEffect(() => {
    // The miniature is read-only. It must never change the real page's theme,
    // scroll listeners, document classes, or saved preferences.
    if (preview) {
      setLight(previewTheme === "light");
      return;
    }
    try {
      const value = localStorage.getItem("slo-theme");
      setLight(value === "light");
      document.documentElement.dataset.theme =
        value === "light" ? "light" : "dark";
    } catch {
      document.documentElement.dataset.theme = "dark";
    }
    document.documentElement.classList.add("atelier-document");
    return () => {
      document.documentElement.classList.remove("atelier-document");
    };
  }, [preview, previewTheme]);
  // Handle section links before the browser can jump to a hash. This covers
  // the header, footer, buttons, and links inside the page with one handler.
  useEffect(() => {
    if (preview) return;
    const element = page.current;
    if (!element) return;
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank') return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      setSkipIntro(true);
      setHeroPhase('ready');
      setMenuOpen(false);
      history.pushState(null, '', url.hash);
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    };
    element.addEventListener('click', navigate);
    return () => element.removeEventListener('click', navigate);
  }, [preview]);

  useEffect(() => {
    if (preview) return;
    const switchTheme = (event: Event) => { event.preventDefault(); toggleTheme(); };
    window.addEventListener('studio:toggle-theme', switchTheme);
    return () => window.removeEventListener('studio:toggle-theme', switchTheme);
  });

  // Native wheel/touch scrolling is unaffected by section navigation.
  useEffect(() => {
    const element = page.current;
    if (!element) return;
    if (reduced) {
      element
        .querySelectorAll(".atelier-reveal")
        .forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.18 }
    );
    element
      .querySelectorAll(".atelier-reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reduced]);
  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    try {
      localStorage.setItem("slo-theme", next ? "light" : "dark");
    } catch {
      /* Theme still works without storage. */
    }
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      ref={page}
      className={`atelier ${paused || reduced ? "atelier-motion-paused" : ""}`}
      data-theme={light ? "light" : "dark"}
      data-hero-phase={heroPhase}
      data-scroll-discovery={preview ? undefined : "waiting"}
      data-scroll-delay={preview ? undefined : "7000"}
      data-scroll-peek={preview ? undefined : ""}
      {...(preview ? viewOnly : {})}
      aria-hidden={preview || undefined}
    >
      {!preview && <Script src="/scroll-discovery.js" strategy="afterInteractive" onReady={() => {
        (window as Window & { initializeScrollDiscovery?: () => void }).initializeScrollDiscovery?.();
      }} />}
      <noscript>
        <style>{`.atelier-nav,.atelier-hero-title,.atelier-scene-coordinate,.atelier-sculpture-control,.atelier-hero-bottom,.atelier-content,.atelier-footer{visibility:visible!important;opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <a
        href={showSloSections ? "#work" : "#capabilities"}
        className="atelier-skip"
        onClick={() => setSkipIntro(true)}
      >
        {showSloSections ? "Skip to the work" : "Skip to services"}
      </a>
      <header className="atelier-nav">
        <a
          href="#top"
          className="atelier-brand"
          aria-label={`${copy.siteName} home`}
        >
          <span className="atelier-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            {copy.shortName}
            <small>WEB DESIGN</small>
          </span>
        </a>
        <nav
          id="mobile-navigation"
          aria-label="Main navigation"
          className={menuOpen ? "is-open" : ""}
        >
          {showSloSections && <a href="#work" onClick={closeMenu}>
            Work <span>{workCount}</span>
          </a>}
          <a href="#capabilities" onClick={closeMenu}>
            Capabilities
          </a>
          <a href="#reels" onClick={closeMenu}>Reels</a>
          {showSloSections && <a href="#about" onClick={closeMenu}>About</a>}
          <a href="#approach" onClick={closeMenu}>
            Approach
          </a>
          <a href="#queue" className="atelier-nav-queue" onClick={closeMenu}>
            Let&rsquo;s talk <ArrowUpRight size={14} />
          </a>
        </nav>
        <div className="atelier-nav-tools">
          <button type="button" className="atelier-visit-button" aria-label="Have a visit code?" onClick={() => setVisitOpen(true)}>
            <span className="atelier-desktop-only">Have a visit code?</span>
            <span className="atelier-mobile-only">Visit code</span>
          </button>
          <a href="/machine" className="atelier-machine-link atelier-desktop-only">
            <span>Human</span>
            <span>Machine ↗</span>
          </a>
          <button
            type="button"
            aria-label={`Switch to ${light ? "dark" : "light"} mode`}
            onClick={toggleTheme}
          >
            {light ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            type="button"
            className="atelier-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Plus />}
          </button>
        </div>
      </header>
      <main>
        <section className="atelier-hero" id="top" aria-labelledby="hero-title">
          <div className="atelier-cosmic-backdrop" aria-hidden="true">
            <img src="/media/hero/white-space-v1.png" alt="" />
            <ConstellationField interactive={heroInteractive} />
            <DesignConstellation interactive={heroInteractive} />
          </div>
          {motionKnown && (
            <Staircase
              paused={paused}
              reduced={reduced}
              light={light}
              skipIntro={skipIntro}
              interactive={!preview}
              onState={setRunner}
              onPhase={setHeroPhase}
              onUnavailable={() => setHeroUnavailable(true)}
            />
          )}
          <div className="atelier-hero-shade" aria-hidden="true" />
          <div className="atelier-hero-title">
            <h1 id="hero-title">
              We make the
              <br />
              impossible
              <br />
              possible.
            </h1>
            <div className="atelier-hero-actions atelier-desktop-only">
              <StepLink large href="#queue" className="atelier-hero-cta">
                Let&rsquo;s talk
              </StepLink>
              {showSloSections && <StepLink large quiet href="#work" className="atelier-hero-cta">
                See our work
              </StepLink>}
            </div>
          </div>
          <div className="atelier-scene-coordinate" aria-hidden="true">
            PENROSE STAIRCASE
            <br />
            PERSPECTIVE IS EVERYTHING
          </div>
          <div className="atelier-sculpture-control">
            <p className="atelier-sculpture-name">The impossible staircase</p>
            {/* The stones answer the pointer directly; this only says so. */}
            <p className="atelier-sculpture-hint">
              <span aria-hidden="true">+</span>
              {heroUnavailable || reduced || paused ? (
                "Still perspective"
              ) : (
                <>
                  <span className="atelier-hint-hover">
                    Hover a step. Break the illusion.
                  </span>
                  <span className="atelier-hint-touch">
                    Touch a step. Break the illusion.
                  </span>
                </>
              )}
              <small>
                {heroUnavailable || reduced
                  ? "A DIFFERENT PERSPECTIVE"
                  : paused
                  ? "RESUME MOTION BELOW TO TRY IT"
                  : "GO ON. IT PUTS ITSELF BACK TOGETHER."}
              </small>
            </p>
            <span aria-live="polite" className="atelier-runner-status">
              {runner === "falling"
                ? "Some paths only exist from one perspective."
                : runner === "loose"
                ? "A moment between possibilities."
                : "An impossible path. A little light."}
            </span>
          </div>
          <div className="atelier-hero-bottom">
            <p>
              Distinctive websites.
              <br />
              Reels with a reason to watch.
              <br />
              <span>Everything that connects them.</span>
            </p>
            <a href={showSloSections ? "#work" : "#capabilities"} className="atelier-explore" data-scroll-cue>
              <span>
                <strong>{showSloSections ? "Scroll to the work" : "Explore our services"}</strong>
                <small>{showSloSections ? "Websites, reels & useful tools" : "See what we can make for you"}</small>
              </span>
              <ArrowDown size={22} aria-hidden="true" />
              <svg className="atelier-scroll-trail" viewBox="0 0 180 48" aria-hidden="true">
                <path d="M2 8H42V18H82V28H122V38H172" />
                <circle cx="42" cy="18" r="2.5" /><circle cx="82" cy="28" r="2.5" />
                <circle cx="122" cy="38" r="2.5" />
                <path className="atelier-scroll-trail-tip" d="m164 32 8 6-8 6" />
              </svg>
            </a>
            {/* On phones the way in takes the place of the scroll prompt. */}
            <StepLink href="#queue" className="atelier-hero-cta atelier-mobile-only">
              Let&rsquo;s talk
            </StepLink>
            <button
              type="button"
              className="atelier-motion-toggle"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
              aria-label={paused ? "Resume site motion" : "Pause site motion"}
            >
              {paused || reduced ? <Play size={13} /> : <Pause size={13} />}
              <span>
                {reduced
                  ? "Reduced motion"
                  : paused
                  ? "Motion paused"
                  : "Motion on"}
              </span>
            </button>
          </div>
        </section>
        <div className="atelier-architecture" aria-hidden="true" />
        <div className="atelier-content">
          {showSloSections && <WorkGrid paused={paused} reduced={reduced} onVisitCode={preview ? undefined : () => setVisitOpen(true)} />}
          <div className="atelier-ribbon-band atelier-desktop-only">
            <ToolRibbon />
            <p className="atelier-footnote">
              Tools and platforms we work with. No affiliation or endorsement
              implied.
            </p>
          </div>
          <section id="approach" className="atelier-approach atelier-section">
            <div className="atelier-overview">
              <span className="atelier-overview-label">
                Not the first draft
              </span>
              <div className="atelier-overview-body">
                <h2 className="atelier-statement atelier-reveal">
                  Good gets worked on.
                </h2>
                <p>
                  A before and after you can inspect. The first idea is a place
                  to start; revisions are where it becomes yours. This website
                  is the proof.
                </p>
              </div>
            </div>
            {!preview && <RevisionStack paused={paused} reduced={reduced} variant={variant} theme={light ? "light" : "dark"} />}
            <div className="atelier-process">
              {process.map(([number, title, description]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
          <NextSlot />
          <ReelGallery key={variant} paused={paused} reduced={reduced} variant={variant} />
          <ContentDepth />
          <section id="queue" className="atelier-queue atelier-section">
            <div className="atelier-queue-intro">
              <span className="atelier-overview-label">The next project</span>
              <h2 className="atelier-reveal">
                Tell us what&rsquo;s next.
              </h2>
              <p>
                A website that finally feels like you. A reel people stop for.
                A tool that makes the day easier. Start with the idea, even if
                you haven&rsquo;t figured out the rest.
              </p>
              <div className="atelier-inquiry-next">
                <h3>What happens next?</h3>
                <p>{contactCopy.next} We talk through
                  the direction, scope, and timing before anything is booked.</p>
                <span>No finished brief needed. No call to book first.</span>
              </div>
              <p className="atelier-queue-alt">
                Prefer email? Write to{" "}
                <a href={`mailto:${copy.contactEmail}`}>
                  {copy.contactEmail}
                </a>
                .
              </p>
              {!preview && <StepButton quiet onClick={() => setVisitOpen(true)}>Have a visit code?</StepButton>}
              <span className="atelier-location atelier-desktop-only">
                {copy.city}, California
                <br />
                Working wherever the right project takes us.
              </span>
            </div>
            <ApplicationForm variant={variant} />
          </section>
          {showSloSections && <AboutSection city={copy.city} />}
          <ServiceStack />
          <section
            className="atelier-manifesto-section atelier-section atelier-desktop-only"
            aria-label="What the studio stands for"
          >
            <figure className="atelier-manifesto">
              <blockquote>
                Not another template. A site with something to say.
              </blockquote>
              <figcaption>
                A small studio with a wide toolkit. Most websites ask visitors
                to work too hard. We bring the strategy, structure, and sharp
                edges needed to make your next step obvious.
              </figcaption>
              <div className="atelier-manifesto-links">
                <StepLink quiet href="/legacy">
                  See the original site
                </StepLink>
                <StepLink quiet href="/projects">
                  Fun projects
                </StepLink>
              </div>
            </figure>
          </section>
          <section
            className="atelier-closing atelier-section"
            aria-labelledby="closing-title"
          >
            <span className="atelier-overview-label">Ready when you are.</span>
            <h2 id="closing-title">
              Let&rsquo;s make the next version the good one.
            </h2>
            <StepLink large href="#queue">
              Let&rsquo;s talk
            </StepLink>
          </section>
        </div>
      </main>
      <footer className="atelier-fineprint">
        <p>
          Independent web design for {copy.city} and everywhere a good idea
          needs a home.
        </p>
        <div>
          <span>
            {copy.siteName}
            <br />
            Websites. Content. Useful things.
          </span>
          <span>
            &copy; {new Date().getFullYear()} Domain owner. No rights reserved.
            <br />
            Temporary project name; domain operated by the site owner.
          </span>
          <nav aria-label="More from the studio">
            <button type="button" className="atelier-footer-visit" onClick={() => setVisitOpen(true)}>Have a visit code?</button>
            <a href="/projects">Fun projects</a>
            {showSloSections && <a href="/1LhYKNpDUb9vRK95brXe/index.html">All site statuses</a>}
            <a href="/legacy">Original site</a>
            <a href="/machine" className="atelier-desktop-only">For machines ↗</a>
            <a href="#top">Back to the top ↑</a>
          </nav>
        </div>
        {showSloSections && <StatusLinks />}
      </footer>
      {!preview && <HowItWorksButton />}
      {!preview && visitOpen && <VisitCodeDialog onClose={() => setVisitOpen(false)} />}
    </div>
  );
}
