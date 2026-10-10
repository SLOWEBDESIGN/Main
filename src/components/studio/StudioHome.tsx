'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google';
import { ArrowUpRight, X } from 'lucide-react';
import { ContactForm } from '@/src/components/ContactForm';
import { BookingScheduler } from '@/src/components/BookingScheduler';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { ScenePoster } from '@/src/components/HorizontalOpening';
import { getOpeningProject, openingProjects, openingScenes } from '@/src/data/opening';
import { getReel, reels } from '@/src/data/reels';
import type { BrandVariant } from '@/src/lib/schema';
import { getBrandCopy } from '@/src/lib/schema';
import { ContentStudio } from './ContentStudio';
import { PresencePanel } from './PresencePanel';
import { ProgramMonitor, toTimecode } from './ProgramMonitor';
import { StudioTimeline } from './StudioTimeline';
import { ToolRibbon } from './ToolRibbon';

const sans = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz', 'wdth'], variable: '--studio-sans', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--studio-mono', display: 'swap' });

// The menu bar readout treats the whole page as a two-minute sequence.
const PAGE_RUNTIME = 120;

// Each opening scene sits on the timeline track that matches it.
const sceneTracks: Record<string, { code: string; name: string; tone: string }> = {
  website: { code: 'V1', name: 'Websites', tone: 'cerulean' },
  tools: { code: 'V2', name: 'Apps & tools', tone: 'lavender' },
  system: { code: 'V3', name: 'Platforms', tone: 'mango' },
};

// Display order for the "other work" list; records live in src/data/opening.ts.
const builtOrder = ['3dprintdash', 'slocal-fulfillment', 'waylight'];

type Bar = { x: number; w: number; lane: number; kind?: 'cut' | 'ghost' | 'audio' };
const directions: { label: string; title: string; tone: string; bars: Bar[]; marker?: number }[] = [
  {
    label: 'Modernization',
    title: 'The site you have, with the friction taken out.',
    tone: 'rose',
    bars: [
      { x: 2, w: 34, lane: 0 }, { x: 36, w: 22, lane: 0, kind: 'cut' }, { x: 58, w: 40, lane: 0 },
      { x: 8, w: 46, lane: 1 }, { x: 62, w: 30, lane: 1 },
      { x: 2, w: 96, lane: 2, kind: 'audio' },
    ],
  },
  {
    label: 'Custom build',
    title: 'A new digital home for the work you are proud of.',
    tone: 'cerulean',
    bars: [
      { x: 2, w: 96, lane: 0, kind: 'ghost' },
      { x: 2, w: 40, lane: 1 }, { x: 44, w: 26, lane: 1 },
      { x: 2, w: 68, lane: 2, kind: 'audio' },
    ],
  },
  {
    label: 'Growth system',
    title: 'A site that keeps doing useful work after launch.',
    tone: 'forest',
    marker: 34,
    bars: [
      { x: 2, w: 30, lane: 0 }, { x: 36, w: 18, lane: 0 }, { x: 58, w: 18, lane: 0 }, { x: 80, w: 18, lane: 0 },
      { x: 2, w: 30, lane: 1 }, { x: 40, w: 24, lane: 1 }, { x: 70, w: 28, lane: 1 },
      { x: 2, w: 96, lane: 2, kind: 'audio' },
    ],
  },
];

const capabilities: [string, string][] = [
  ['Strategy', 'Positioning, offers, and a clear plan for what the site should make easier.'],
  ['Design', 'A visual system with a point of view, built around the people who will use it.'],
  ['Development', 'Fast, responsive, accessible websites that are designed to keep working.'],
  ['Copywriting', 'Words that make the value obvious without sounding like everyone else.'],
  ['SEO', 'Technical foundations and local signals that help the right people find you.'],
  ['Care', 'Updates, maintenance, and a real person to call when the site needs attention.'],
];

const processSteps: [string, string][] = [
  ['Listen closely', 'We learn the business, the customers, and what the site needs to make easier.'],
  ['Find the shape', 'Structure, words, and visual direction, agreed before anything gets built.'],
  ['Build the thing', 'Design and development in short rounds you can review as it comes together.'],
  ['Keep it healthy', 'Updates, fixes, and improvements after launch, from the same people.'],
];

const hostOf = (href: string) => {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
};

/** Where you are on the page, read out as sequence timecode. */
const PageTimecode: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setSeconds(max > 0 ? (window.scrollY / max) * PAGE_RUNTIME : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <span className="studio-mono studio-page-timecode" aria-hidden="true">{toTimecode(seconds)}</span>;
};

export const StudioHome: React.FC<{ variant: BrandVariant }> = ({ variant }) => {
  const copy = getBrandCopy(variant);
  const location = variant === 'sdwebdesign' ? 'San Diego' : 'San Luis Obispo';
  const [activeReelId, setActiveReelId] = useState(reels[0].id);
  const activeReel = getReel(activeReelId);
  const monitorRef = useRef<HTMLDivElement | null>(null);

  const [modal, setModal] = useState<'old' | 'new' | { project: string } | null>(null);
  const projectModal = modal && typeof modal !== 'string' ? getOpeningProject(modal.project) : undefined;
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const openModal = (value: 'old' | 'new' | { project: string }) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal(value);
  };

  // Load a reel into the program monitor, and bring the monitor back on screen if it scrolled away.
  const selectReel = (id: string) => {
    setActiveReelId(id);
    const monitor = monitorRef.current;
    if (!monitor) return;
    const rect = monitor.getBoundingClientRect();
    if (rect.bottom < 80 || rect.top > window.innerHeight - 80) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      monitor.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (!modal) return;
    // Move focus into the dialog, trap Tab inside it, and restore focus on close.
    const dialog = dialogRef.current;
    const initial = dialog?.querySelector<HTMLElement>('[data-autofocus]') ?? dialog;
    initial?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModal(null);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openerRef.current?.focus();
    };
  }, [modal]);

  const closeOnBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setModal(null);
  };

  return (
    <div className={`studio-page ${sans.variable} ${mono.variable}`} id="top">
      <a className="studio-skip" href="#main">Skip to main content</a>
      <header className="studio-menubar">
        <a href="#top" className="studio-wordmark" aria-label={`${copy.siteName} home`}>
          <span className="studio-mark" aria-hidden="true">S</span>
          <span>{copy.siteName}</span>
        </a>
        <nav className="studio-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#content">Content</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <PageTimecode />
        <div className="studio-menubar-actions">
          <a className="studio-text-link" href="/legacy">Original site</a>
          <a className="studio-text-link" href="/projects">Fun projects</a>
          <ThemeToggle />
          <a className="studio-button studio-button-primary" href="#contact">Start a project</a>
        </div>
      </header>

      <main id="main">
        <section className="studio-hero" aria-labelledby="studio-hero-title">
          <div className="studio-hero-copy">
            <h1 id="studio-hero-title">
              <span className="studio-u studio-tone-cerulean">Websites</span>, <span className="studio-u studio-tone-lavender">apps</span>,{' '}
              <span className="studio-u studio-tone-mango">software</span>, <span className="studio-u studio-tone-teal">AI workflows</span>, and{' '}
              <span className="studio-u studio-tone-rose">content</span>.
            </h1>
            <p className="studio-hero-sub">Good work deserves a better place to land.</p>
            <p className="studio-hero-note">Independent web design in {location}, CA. One studio for the site, the software behind it, and the content that brings people to it.</p>
            <div className="studio-hero-actions">
              <a className="studio-button studio-button-primary studio-button-large" href="#contact">Start a project</a>
              <a className="studio-button studio-button-large" href="#content">Watch the reels</a>
            </div>
          </div>
          <div className="studio-hero-monitor" ref={monitorRef}>
            <ProgramMonitor reel={activeReel} />
          </div>
          <StudioTimeline reels={reels} activeReel={activeReel.id} onSelectReel={selectReel} onOpenProject={(id) => openModal({ project: id })} />
        </section>

        <ToolRibbon />

        <ContentStudio reels={reels} />

        <section className="studio-sequences" id="work" aria-labelledby="studio-work-title">
          <div className="studio-section-head">
            <h2 id="studio-work-title">The work, track by track.</h2>
            <p>Every track on the timeline is real work. Open one to see what it does.</p>
          </div>
          <ul className="studio-sequence-list">
            {openingScenes.map((scene) => {
              const project = getOpeningProject(scene.projectId);
              const track = sceneTracks[scene.id] ?? sceneTracks.website;
              return (
                <li className="studio-sequence" key={scene.id}>
                  {project && (
                    <button type="button" className="redesign-opening-poster studio-sequence-poster" onClick={() => openModal({ project: project.id })} aria-label={`Open details for ${project.name}`}>
                      <ScenePoster project={project} />
                    </button>
                  )}
                  <div className="studio-sequence-text">
                    <p className="studio-track-label"><b className={`studio-chip studio-tone-${track.tone}`} aria-hidden="true" /><span className="studio-mono">{track.code}</span>{track.name}</p>
                    <h3>{scene.headline}</h3>
                    <p>{scene.statement}</p>
                    {project && <p className="studio-dim">{project.capabilities}</p>}
                    {project && (
                      <button type="button" className="studio-evidence" onClick={() => openModal({ project: project.id })}>
                        Evidence: {scene.chipLabel}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            <li className="studio-sequence is-next">
              <div className="studio-sequence-empty" aria-hidden="true"><span>Drop your idea here</span></div>
              <div className="studio-sequence-text">
                <p className="studio-track-label"><b className="studio-chip studio-chip-empty" aria-hidden="true" />New sequence</p>
                <h3>We build whatever&rsquo;s next.</h3>
                <p>Bring the idea. We&rsquo;ll find the shape.</p>
                <a className="studio-button studio-button-primary" href="#contact">Start a project</a>
              </div>
            </li>
          </ul>
        </section>

        <PresencePanel />

        <section className="studio-compare" aria-labelledby="studio-compare-title">
          <div className="studio-section-head">
            <h2 id="studio-compare-title">A before and after you can inspect.</h2>
            <p>Choose a version.</p>
          </div>
          <div className="studio-compare-split">
            <button type="button" className="studio-compare-half is-before" onClick={() => openModal('old')}>
              <span className="studio-compare-tag">Before</span>
              <span className="studio-compare-label">Old version of this website</span>
              <strong>See the original site</strong>
              <span className="studio-compare-action">Open view-only preview</span>
            </button>
            <button type="button" className="studio-compare-half is-after" onClick={() => openModal('new')}>
              <span className="studio-compare-tag">After</span>
              <span className="studio-compare-label">Version after a redesign</span>
              <strong>See what the new direction changes</strong>
              <span className="studio-compare-action">Explore the redesign</span>
            </button>
          </div>
          <div className="studio-other">
            <h3>Below are some other websites we&apos;ve built.</h3>
            <ul className="studio-other-list">
              {builtOrder.map((id) => {
                const project = getOpeningProject(id);
                if (!project?.href) return null;
                return (
                  <li key={project.id}>
                    <a href={project.href} target="_blank" rel="noopener noreferrer">
                      <strong>{project.name}</strong>
                      <span className="studio-dim">{project.summary}</span>
                      <span className="studio-mono studio-dim">{hostOf(project.href)}</span>
                      <ArrowUpRight size={17} aria-hidden="true" />
                      <span className="studio-sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="studio-statement" aria-labelledby="studio-statement-title">
          <div className="studio-title-card">
            <h2 id="studio-statement-title"><span>Not another template.</span> <span>A site with something to say.</span></h2>
          </div>
          <p>A small studio with a wide toolkit. Most websites ask visitors to work too hard. We bring the strategy, structure, and sharp edges needed to make your next step obvious.</p>
        </section>

        <section className="studio-directions" aria-labelledby="studio-directions-title">
          <div className="studio-section-head">
            <h2 id="studio-directions-title">Selected directions.</h2>
            <p>Three ways a project usually starts.</p>
          </div>
          <div className="studio-direction-grid">
            {directions.map((direction) => (
              <article className="studio-direction" key={direction.label}>
                <div className={`studio-diagram studio-tone-${direction.tone}`} aria-hidden="true">
                  {direction.bars.map((bar, index) => (
                    <i key={index} className={bar.kind ? `is-${bar.kind}` : undefined} style={{ left: `${bar.x}%`, width: `${bar.w}%`, top: `${10 + bar.lane * 22}px` }} />
                  ))}
                  {direction.marker !== undefined && <span className="studio-diagram-marker" style={{ left: `${direction.marker}%` }}>Launch</span>}
                </div>
                <h3>{direction.label}</h3>
                <p>{direction.title}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-capabilities" id="capabilities" aria-labelledby="studio-capabilities-title">
          <div className="studio-section-head">
            <h2 id="studio-capabilities-title">Everything in one room.</h2>
            <p>What we bring to every project.</p>
          </div>
          <dl className="studio-capability-grid">
            {capabilities.map(([title, description]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="studio-process" id="process" aria-labelledby="studio-process-title">
          <div className="studio-section-head">
            <h2 id="studio-process-title">Clear steps. Good momentum.</h2>
            <p>The process, from the first call to the years after launch.</p>
          </div>
          <ol className="studio-process-list">
            {processSteps.map(([step, description], index) => (
              <li key={step}>
                <span className="studio-mono">{index + 1}</span>
                <h3>{step}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="studio-cta" aria-labelledby="studio-cta-title">
          <h2 id="studio-cta-title">Let&apos;s make the next version the good one.</h2>
          <p>Ready when you are.</p>
          <a className="studio-button studio-button-primary studio-button-large" href="#contact">Start a conversation</a>
        </section>

        <section className="redesign-functional-section studio-functional" aria-labelledby="studio-contact-title">
          <div className="redesign-functional-intro">
            <h2 id="studio-contact-title">Let&apos;s talk about the work.</h2>
            <p>The original contact and scheduling tools are still here, fully connected. This is the new front door, not a facade.</p>
          </div>
          <ContactForm />
          <BookingScheduler />
        </section>
      </main>

      <footer className="studio-footer">
        <div className="studio-footer-main">
          <a href="#top" className="studio-wordmark"><span className="studio-mark" aria-hidden="true">S</span><span>{copy.siteName}</span></a>
          <p>Independent web design for {location} and everywhere a good idea needs a home.</p>
          <a className="studio-button" href="#top">Back to top</a>
        </div>
        <div className="studio-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Domain owner. No rights reserved.</span>
          <span>Temporary project name; domain operated by the site owner.</span>
          <nav aria-label="More from the studio">
            <a href="/projects">Fun projects</a>
            <a href="/1LhYKNpDUb9vRK95brXe/index.html">All site statuses</a>
            <a href="/legacy">Original site</a>
          </nav>
        </div>
      </footer>

      {modal && typeof modal === 'string' && (
        <div className="redesign-modal-backdrop" role="presentation" onMouseDown={closeOnBackdrop}>
          <div ref={dialogRef} tabIndex={-1} className="redesign-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="redesign-modal-header">
              <div>
                <p className="studio-modal-context">{modal === 'old' ? 'View-only archive' : 'Current direction'}</p>
                <h2 id="modal-title">{modal === 'old' ? 'The original website' : <><span className="redesign-modal-highlight">This is the redesigned website</span> of our old website.</>}</h2>
              </div>
              <button type="button" data-autofocus className="redesign-modal-close" aria-label="Close preview" onClick={() => setModal(null)}><X size={21} /></button>
            </div>
            {modal === 'old' ? (
              <iframe className="redesign-legacy-frame" title="View-only original SLO Web Design website" src="/legacy" />
            ) : (
              <div className="redesign-projects-modal">
                <p>Here are some more websites we&apos;ve built:</p>
                <div className="redesign-project-list">
                  {openingProjects.map((project) => project.href ? (
                    <a key={project.id} href={project.href} target="_blank" rel="noopener noreferrer"><span><strong>{project.name}</strong><small>{project.summary}</small></span><ArrowUpRight size={18} aria-hidden="true" /></a>
                  ) : (
                    <div className="redesign-project-disabled" key={project.id}><span><strong>{project.name}</strong><small>{project.summary}</small></span><span className="redesign-project-status">In preparation</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {projectModal && (
        <div className="redesign-modal-backdrop" role="presentation" onMouseDown={closeOnBackdrop}>
          <div ref={dialogRef} tabIndex={-1} className="redesign-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
            <div className="redesign-modal-header">
              <div>
                <p className="studio-modal-context">Selected work, static preview</p>
                <h2 id="project-modal-title">{projectModal.name}</h2>
              </div>
              <button type="button" data-autofocus className="redesign-modal-close" aria-label="Close preview" onClick={() => setModal(null)}><X size={21} /></button>
            </div>
            <div className="redesign-project-modal-body">
              <p className="redesign-project-tagline">{projectModal.tagline}</p>
              <ScenePoster project={projectModal} large />
              <p>{projectModal.description}</p>
              <p className="redesign-project-modal-capabilities">{projectModal.capabilities}</p>
              <div className="redesign-project-modal-actions">
                <a className="studio-button studio-button-primary" href="#contact" onClick={() => setModal(null)}>Discuss a project like this</a>
                <span className="redesign-demo-unavailable" aria-disabled="true">Interactive demo not available in this preview</span>
              </div>
              <p className="redesign-project-modal-note">This preview is static. Nothing here runs, submits, or plays audio. A live interactive demo would only ever use synthetic sample data, never real customer information.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
