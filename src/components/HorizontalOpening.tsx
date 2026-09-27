'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { OpeningProject, OpeningScene } from '@/src/data/opening';

interface HorizontalOpeningProps {
  location: string;
  scenes: OpeningScene[];
  projects: OpeningProject[];
  onOpenProject: (projectId: string) => void;
}

const projectFor = (projects: OpeningProject[], id: string): OpeningProject | undefined =>
  projects.find((project) => project.id === id);

/** Static poster. Renders supplied art when present, otherwise a styled placeholder. */
function ScenePoster({ project, large }: { project: OpeningProject; large?: boolean }) {
  return (
    <span
      className={`redesign-opening-poster-art redesign-opening-tone-${project.posterTone}${
        large ? ' redesign-opening-poster-art-large' : ''
      }`}
    >
      {project.posterImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.posterImage} alt="" aria-hidden="true" />
      ) : (
        <span className="redesign-opening-poster-abstract" aria-hidden="true">
          <span className="redesign-opening-poster-bar">
            <i />
            <i />
            <i />
            <b>{project.name}</b>
          </span>
          <span className="redesign-opening-poster-body">
            <span className="redesign-opening-poster-lines">
              <i />
              <i />
              <i />
            </span>
            <span className="redesign-opening-poster-blocks">
              <i />
              <i />
              <i />
            </span>
          </span>
          <span className="redesign-opening-poster-tag">Static preview</span>
        </span>
      )}
      {!large && <span className="redesign-opening-interact">Click to interact</span>}
    </span>
  );
}

export const HorizontalOpening: React.FC<HorizontalOpeningProps> = ({
  location,
  scenes,
  projects,
  onOpenProject,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'static' | 'pinned'>('static');
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Desktop gets the pinned rail; narrow widths and reduced motion get a static stack.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 851px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compute = () => setMode(wide.matches && !reduced.matches ? 'pinned' : 'static');
    compute();
    wide.addEventListener('change', compute);
    reduced.addEventListener('change', compute);
    return () => {
      wide.removeEventListener('change', compute);
      reduced.removeEventListener('change', compute);
    };
  }, []);

  // Drive the horizontal track from native vertical scroll. No wheel capture.
  useEffect(() => {
    if (mode !== 'pinned') return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const vh = window.innerHeight;
      const travel = section.offsetHeight - vh;
      if (travel <= 0) return;
      const rect = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      const maxX = Math.max(0, track.scrollWidth - track.clientWidth);
      track.style.transform = `translate3d(${(-p * maxX).toFixed(1)}px, 0, 0)`;
      const next = Math.min(scenes.length - 1, Math.round(p * (scenes.length - 1)));
      if (next !== activeIndexRef.current) {
        activeIndexRef.current = next;
        setActiveIndex(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode, scenes.length]);

  const goToScene = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const vh = window.innerHeight;
    const travel = Math.max(1, section.offsetHeight - vh);
    const top =
      section.getBoundingClientRect().top +
      window.scrollY +
      (travel * Math.min(Math.max(index, 0), scenes.length - 1)) / Math.max(1, scenes.length - 1);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const onSectionKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToScene(activeIndexRef.current + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToScene(activeIndexRef.current - 1);
    }
  };

  if (mode === 'static') {
    return (
      <section className="redesign-opening-static" aria-label="What the studio builds">
        <p className="redesign-kicker">Independent web design / {location}, CA</p>
        <h1>Good work deserves a better place to land.</h1>
        <p className="redesign-opening-support-static">
          Websites, apps, software, AI workflows, and content.
        </p>
        <a className="redesign-dark-button redesign-large-button" href="#contact">
          Start a project <ArrowUpRight size={16} />
        </a>
        <div className="redesign-opening-static-list">
          {scenes.map((scene) => {
            const project = projectFor(projects, scene.projectId);
            return (
              <article key={scene.id} className="redesign-opening-static-card">
                <p className="redesign-kicker">{scene.kicker}</p>
                <h2>{scene.headline}</h2>
                <p>{scene.statement}</p>
                {project && (
                  <button
                    type="button"
                    className="redesign-opening-poster"
                    onClick={() => onOpenProject(project.id)}
                    aria-label={`Open details for ${project.name}`}
                  >
                    <ScenePoster project={project} />
                  </button>
                )}
                <p className="redesign-opening-caption">{scene.caption}</p>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="redesign-opening"
      aria-label="What the studio builds"
      onKeyDown={onSectionKeyDown}
    >
      <h1 className="redesign-sr-only">
        SLO Web Design: websites, apps, software, AI workflows, and content.
      </h1>
      <div className="redesign-opening-pin">
        <div className="redesign-opening-top">
          <div>
            <p className="redesign-kicker">Independent web design / {location}, CA</p>
            <p className="redesign-opening-support">
              Websites, apps, software, AI workflows, and content.
            </p>
          </div>
          <a className="redesign-dark-button" href="#contact">
            Start a project <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="redesign-opening-viewport">
          <div ref={trackRef} className="redesign-opening-track">
            {scenes.map((scene, index) => {
              const project = projectFor(projects, scene.projectId);
              return (
                <article
                  key={scene.id}
                  className={`redesign-opening-scene${
                    index === activeIndex ? ' is-active' : ''
                  }`}
                  aria-label={`${scene.kicker}: ${scene.headline}`}
                >
                  <div className="redesign-opening-scene-text">
                    <p className="redesign-kicker">{scene.kicker}</p>
                    <h2 className="redesign-opening-headline">{scene.headline}</h2>
                    <p className="redesign-opening-statement">{scene.statement}</p>
                    <p className="redesign-opening-caption">{scene.caption}</p>
                    {project && (
                      <button
                        type="button"
                        className="redesign-opening-chip"
                        onClick={() => onOpenProject(project.id)}
                      >
                        Evidence: {scene.chipLabel}
                      </button>
                    )}
                  </div>
                  <div className="redesign-opening-scene-visual">
                    {project && (
                      <button
                        type="button"
                        className="redesign-opening-poster"
                        onClick={() => onOpenProject(project.id)}
                        aria-label={`Open details for ${project.name}`}
                      >
                        <ScenePoster project={project} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            <div className="redesign-opening-exit">
              <p className="redesign-kicker">Where this goes</p>
              <h2>
                We build whatever&rsquo;s next.
              </h2>
              <p>Bring the idea. We&rsquo;ll find the shape.</p>
              <a className="redesign-dark-button redesign-large-button" href="#contact">
                Start a project <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="redesign-opening-controls">
          <div className="redesign-opening-nav">
            <button
              type="button"
              className="redesign-opening-arrow"
              onClick={() => goToScene(activeIndexRef.current - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous scene"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="redesign-opening-dots" role="group" aria-label="Choose a scene">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  className={`redesign-opening-dot${
                    index === activeIndex ? ' is-active' : ''
                  }`}
                  onClick={() => goToScene(index)}
                  aria-label={`Go to scene ${index + 1}: ${scene.headline}`}
                  aria-current={index === activeIndex}
                />
              ))}
            </div>
            <button
              type="button"
              className="redesign-opening-arrow"
              onClick={() => goToScene(activeIndexRef.current + 1)}
              disabled={activeIndex === scenes.length - 1}
              aria-label="Next scene"
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <a href="#capabilities" className="redesign-opening-skip">
            Skip to capabilities <ArrowDown size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export { ScenePoster };
