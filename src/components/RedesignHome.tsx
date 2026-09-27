'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { ContactForm } from '@/src/components/ContactForm';
import { BookingScheduler } from '@/src/components/BookingScheduler';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { GrowthStudio } from '@/src/components/GrowthStudio';
import { CapabilityEcosystem } from '@/src/components/CapabilityEcosystem';
import { HorizontalOpening, ScenePoster } from '@/src/components/HorizontalOpening';
import { getOpeningProject, openingProjects, openingScenes } from '@/src/data/opening';
import type { BrandVariant } from '@/src/lib/schema';
import { getBrandCopy } from '@/src/lib/schema';

const tickerItems = [
  { name: 'VS Code', slug: 'visualstudiocode' },
  { name: 'Codex', slug: null },
  { name: 'Claude', slug: 'claude' },
  { name: 'OpenAI', slug: 'openai' },
  { name: 'Anthropic', slug: 'anthropic' },
  { name: 'Adobe', slug: 'adobe' },
  { name: 'Gemini', slug: 'googlegemini' },
  { name: 'Perplexity', slug: 'perplexity' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'Netlify', slug: 'netlify' },
  { name: 'Resend', slug: 'resend' },
  { name: 'Shippo', slug: null },
  { name: 'Copyright', slug: null },
  { name: 'SEO', slug: null },
  { name: 'Analytics', slug: 'googleanalytics' },
];

// Display order for the "other work" cards; records live in src/data/opening.ts.
const builtOrder = ['3dprintdash', 'slocal-fulfillment', 'waylight'];

const capabilities = [
  ['01', 'Strategy', 'Positioning, offers, and a clear plan for what the site should make easier.'],
  ['02', 'Design', 'A visual system with a point of view, built around the people who will use it.'],
  ['03', 'Development', 'Fast, responsive, accessible websites that are designed to keep working.'],
  ['04', 'Copyright', 'Words that make the value obvious without sounding like everyone else.'],
  ['05', 'SEO', 'Technical foundations and local signals that help the right people find you.'],
  ['06', 'Care', 'Updates, maintenance, and a real person to call when the site needs attention.'],
];

const work = [
  { number: '01', label: 'Modernization', title: 'The site you have, with the friction taken out.', tone: 'redesign-surface-red' },
  { number: '02', label: 'Custom build', title: 'A new digital home for the work you are proud of.', tone: 'redesign-surface-blue' },
  { number: '03', label: 'Growth system', title: 'A site that keeps doing useful work after launch.', tone: 'redesign-surface-yellow' },
];

export const RedesignHome: React.FC<{ variant: BrandVariant }> = ({ variant }) => {
  const copy = getBrandCopy(variant);
  const location = variant === 'sdwebdesign' ? 'San Diego' : 'San Luis Obispo';
  const [modal, setModal] = useState<'old' | 'new' | { project: string } | null>(null);
  const projectModal = modal && typeof modal !== 'string' ? getOpeningProject(modal.project) : undefined;
  const openerRef = React.useRef<HTMLElement | null>(null);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);

  const openModal = (value: 'old' | 'new' | { project: string }) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal(value);
  };

  useEffect(() => {
    if (!modal) return;
    // Move focus into the dialog, trap Tab inside it, and restore focus on close.
    const dialog = dialogRef.current;
    const initial =
      dialog?.querySelector<HTMLElement>('[data-autofocus]') ?? dialog;
    initial?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModal(null);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
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

  return (
    <div className="redesign-page">
      <header className="redesign-nav">
        <a href="#top" className="redesign-wordmark" aria-label={`${copy.siteName} home`}>
          <span className="redesign-mark">S</span>
          <span>{copy.siteName}</span>
        </a>
        <nav className="redesign-nav-links" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="redesign-nav-actions">
          <a className="redesign-text-link" href="/legacy">Original site <ArrowUpRight size={15} /></a>
          <a className="redesign-text-link" href="/projects">Fun projects <ArrowUpRight size={15} /></a>
          <ThemeToggle />
          <a className="redesign-dark-button" href="#contact">Start a project <ArrowUpRight size={15} /></a>
        </div>
      </header>

      <main id="top">
        <HorizontalOpening
          location={location}
          scenes={openingScenes}
          projects={openingProjects}
          onOpenProject={(projectId) => openModal({ project: projectId })}
        />

        <section className="redesign-ticker" aria-label="Tools and capabilities">
          <div className="redesign-ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item.name}-${index}`}>
                {item.slug ? <img src={`https://cdn.simpleicons.org/${item.slug}/686862`} alt="" aria-hidden="true" /> : <b className="redesign-wordmark-mark">{item.name.slice(0, 1)}</b>}
                {item.name}
              </span>
            ))}
          </div>
        </section>

        <GrowthStudio />
        <CapabilityEcosystem />

        <section className="redesign-comparison" aria-labelledby="comparison-title">
          <div className="redesign-section-heading"><p className="redesign-kicker">A before / after you can inspect</p><span>Choose a version</span></div>
          <div className="redesign-comparison-grid">
            <button type="button" className="redesign-comparison-card redesign-comparison-old" onClick={() => openModal('old')}>
              <span className="redesign-comparison-label">Old version of this website</span>
              <strong>See the original site</strong>
              <span className="redesign-comparison-action">Open view-only preview <ArrowUpRight size={17} /></span>
            </button>
            <button type="button" className="redesign-comparison-card redesign-comparison-new" onClick={() => openModal('new')}>
              <span className="redesign-comparison-label">Version after a redesign</span>
              <strong id="comparison-title">See what the new direction changes</strong>
              <span className="redesign-comparison-action">Explore the redesign <ArrowUpRight size={17} /></span>
            </button>
          </div>
          <div className="redesign-built-heading"><p className="redesign-kicker">Other work</p><h3>Below are some other websites we&apos;ve built.</h3></div>
          <div className="redesign-built-grid">
            {builtOrder.map((id, index) => {
              const project = getOpeningProject(id);
              if (!project?.href) return null;
              return (
                <a className="redesign-built-card" href={project.href} target="_blank" rel="noopener noreferrer" key={project.id}>
                  <span>0{index + 1}</span>
                  <strong>{project.name}</strong>
                  <small>{project.summary}</small>
                  <ArrowUpRight size={18} />
                </a>
              );
            })}
          </div>
        </section>

        <section className="redesign-statement">
          <p className="redesign-kicker">A small studio with a wide toolkit</p>
          <h2>Not another template. A site with <em>something to say.</em></h2>
          <p>Most websites ask visitors to work too hard. We bring the strategy, structure, and sharp edges needed to make your next step obvious.</p>
        </section>

        <section id="work" className="redesign-work-section">
          <div className="redesign-section-heading"><p className="redesign-kicker">Selected directions</p><span>01—03</span></div>
          <div className="redesign-work-grid">
            {work.map((item) => (
              <article className={`redesign-work-card ${item.tone}`} key={item.number}>
                <div className="redesign-card-top"><span>{item.number}</span><ArrowUpRight size={18} /></div>
                <div className="redesign-card-visual"><div className="redesign-card-window"><span /><span /><span /></div><div className="redesign-card-shape" /></div>
                <p>{item.label}</p>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section id="capabilities" className="redesign-capabilities">
          <div className="redesign-section-heading"><p className="redesign-kicker">What we bring</p><span>Everything in one room</span></div>
          <div className="redesign-capability-grid">
            {capabilities.map(([number, title, description]) => (
              <article key={number} className="redesign-capability"><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><Check size={17} /></article>
            ))}
          </div>
        </section>

        <section id="process" className="redesign-process">
          <div><p className="redesign-kicker">The process</p><h2>Clear steps.<br /><em>Good momentum.</em></h2></div>
          <div className="redesign-process-list">
            {['Listen closely', 'Find the shape', 'Build the thing', 'Keep it healthy'].map((step, index) => (
              <div className="redesign-process-row" key={step}><span>0{index + 1}</span><strong>{step}</strong><ArrowUpRight size={18} /></div>
            ))}
          </div>
        </section>

        <section className="redesign-cta">
          <p className="redesign-kicker">Ready when you are</p>
          <h2>Let&apos;s make the next version <em>the good one.</em></h2>
          <a className="redesign-light-button" href="#contact">Start a conversation <ArrowUpRight size={17} /></a>
        </section>

        <section className="redesign-functional-section">
          <div className="redesign-functional-intro"><p className="redesign-kicker">The practical part</p><h2>Let&apos;s talk about the work.</h2><p>The original contact and scheduling tools are still here, fully connected. This is the new front door, not a facade.</p></div>
          <ContactForm />
          <BookingScheduler />
        </section>
      </main>

      <footer className="redesign-footer">
        <div className="redesign-footer-main"><a href="#top" className="redesign-wordmark"><span className="redesign-mark">S</span><span>{copy.siteName}</span></a><p>Independent web design for {location} and everywhere a good idea needs a home.</p><a className="redesign-dark-button" href="#top">Back to top <ArrowUpRight size={15} /></a></div>
        <div className="redesign-footer-bottom"><span>© {new Date().getFullYear()} Domain owner. No rights reserved.</span><span>Temporary project name; domain operated by the site owner.</span><span><a href="/projects">Fun projects</a> · <a href="/1LhYKNpDUb9vRK95brXe/index.html">All site statuses</a> · <a href="/legacy">Original site</a></span></div>
      </footer>

      {modal && typeof modal === 'string' && (
        <div className="redesign-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <div ref={dialogRef} tabIndex={-1} className="redesign-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="redesign-modal-header"><div><p className="redesign-kicker">{modal === 'old' ? 'View-only archive' : 'Current direction'}</p><h2 id="modal-title">{modal === 'old' ? 'The original website' : <><span className="redesign-modal-highlight">This is the redesigned website</span> of our old website.</>}</h2></div><button type="button" data-autofocus className="redesign-modal-close" aria-label="Close preview" onClick={() => setModal(null)}><X size={21} /></button></div>
            {modal === 'old' ? (
              <iframe className="redesign-legacy-frame" title="View-only original SLO Web Design website" src="/legacy" />
            ) : (
              <div className="redesign-projects-modal"><p>Here are some more websites we&apos;ve built:</p><div className="redesign-project-list">{openingProjects.map((project) => project.href ? <a key={project.id} href={project.href} target="_blank" rel="noopener noreferrer"><span><strong>{project.name}</strong><small>{project.summary}</small></span><ArrowUpRight size={18} /></a> : <div className="redesign-project-disabled" key={project.id}><span><strong>{project.name}</strong><small>{project.summary}</small></span><span className="redesign-project-status">In preparation</span></div>)}</div></div>
            )}
          </div>
        </div>
      )}

      {projectModal && (
        <div className="redesign-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <div ref={dialogRef} tabIndex={-1} className="redesign-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
            <div className="redesign-modal-header"><div><p className="redesign-kicker">Selected work — static preview</p><h2 id="project-modal-title">{projectModal.name}</h2></div><button type="button" data-autofocus className="redesign-modal-close" aria-label="Close preview" onClick={() => setModal(null)}><X size={21} /></button></div>
            <div className="redesign-project-modal-body">
              <p className="redesign-project-tagline">{projectModal.tagline}</p>
              <ScenePoster project={projectModal} large />
              <p>{projectModal.description}</p>
              <p className="redesign-project-modal-capabilities">{projectModal.capabilities}</p>
              <div className="redesign-project-modal-actions">
                <a className="redesign-dark-button" href="#contact" onClick={() => setModal(null)}>Discuss a project like this <ArrowUpRight size={15} /></a>
                <span className="redesign-demo-unavailable" aria-disabled="true">Interactive demo not available in this preview</span>
              </div>
              <p className="redesign-project-modal-note">This preview is static. Nothing here runs, submits, or plays audio. A live interactive demo would only ever use synthetic sample data — never real customer information.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
