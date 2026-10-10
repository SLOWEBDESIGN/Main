'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Reel } from '@/src/data/reels';
import { toTimecode } from './ProgramMonitor';

const RUNTIME = 72; // seconds across the ruler

type Clip = {
  id: string;
  label: string;
  start: number;
  length: number;
  action?: { kind: 'reel' | 'project'; id: string } | { kind: 'link'; href: string };
};
type Track = { id: string; name: string; tone: string; audio?: boolean; clips: Clip[] };

interface StudioTimelineProps {
  reels: Reel[];
  activeReel: string;
  onSelectReel: (id: string) => void;
  onOpenProject: (id: string) => void;
}

/**
 * The studio as one edit: every kind of work on its own track. Content clips load into the
 * program monitor, project clips open their details, and the playhead scrubs with scroll.
 */
export const StudioTimeline: React.FC<StudioTimelineProps> = ({ reels, activeReel, onSelectReel, onOpenProject }) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0.3);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      setProgress(Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span)));
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

  let cursor = 2;
  const contentClips: Clip[] = reels.map((reel) => {
    const clip: Clip = { id: reel.id, label: reel.title, start: cursor, length: reel.seconds, action: { kind: 'reel', id: reel.id } };
    cursor += reel.seconds + 0.6;
    return clip;
  });

  const tracks: Track[] = [
    { id: 'content', name: 'Content', tone: 'rose', clips: contentClips },
    { id: 'platforms', name: 'Platforms', tone: 'mango', clips: [{ id: '3dprintdash', label: '3D Print Dash', start: 24, length: 34, action: { kind: 'project', id: '3dprintdash' } }] },
    { id: 'apps', name: 'Apps & tools', tone: 'lavender', clips: [{ id: 'waylight', label: 'Waylight', start: 10, length: 20, action: { kind: 'project', id: 'waylight' } }] },
    {
      id: 'web',
      name: 'Websites',
      tone: 'cerulean',
      clips: [
        { id: 'slocal-fulfillment', label: 'SLO CAL Fulfillment', start: 0, length: 22, action: { kind: 'project', id: 'slocal-fulfillment' } },
        { id: 'yours', label: 'Your site', start: 47, length: 23, action: { kind: 'link', href: '#contact' } },
      ],
    },
    {
      id: 'ai',
      name: 'AI workflows',
      tone: 'teal',
      audio: true,
      clips: [
        { id: 'claude', label: 'Claude', start: 4, length: 16 },
        { id: 'codex', label: 'Codex', start: 22, length: 14 },
        { id: 'gemini', label: 'Gemini', start: 40, length: 12 },
        { id: 'perplexity', label: 'Perplexity', start: 54, length: 10 },
      ],
    },
  ];

  const ticks = Array.from({ length: RUNTIME / 4 + 1 }, (_, index) => index * 4);
  const pct = (seconds: number) => `${(seconds / RUNTIME) * 100}%`;

  const renderClip = (clip: Clip, track: Track) => {
    const style = { left: pct(clip.start), width: pct(clip.length) };
    const className = `studio-clip studio-tone-${track.tone}${track.audio ? ' is-audio' : ''}`;
    const action = clip.action;
    if (!action) return <span key={clip.id} className={className} style={style}><span>{clip.label}</span></span>;
    if (action.kind === 'link') {
      return <a key={clip.id} className={`${className} is-ghost`} style={style} href={action.href}><span>{clip.label}</span></a>;
    }
    const isReel = action.kind === 'reel';
    return (
      <button
        key={clip.id}
        type="button"
        className={`${className}${isReel && action.id === activeReel ? ' is-active' : ''}`}
        style={style}
        aria-pressed={isReel ? action.id === activeReel : undefined}
        aria-label={isReel ? `Play ${clip.label} in the program monitor` : `Open details for ${clip.label}`}
        onClick={() => (isReel ? onSelectReel(action.id) : onOpenProject(action.id))}
      >
        <span>{clip.label}</span>
      </button>
    );
  };

  return (
    <div className="studio-timeline" role="group" aria-label="Timeline of what the studio builds">
      <div className="studio-panel-tab">
        <span>Timeline: one studio, every track</span>
        <span className="studio-timeline-hint">Select a clip to play it or open the project</span>
        <span className="studio-mono">{toTimecode(progress * RUNTIME)}</span>
      </div>
      <div className="studio-timeline-scroll">
        <div className="studio-timeline-frame" ref={frameRef}>
          <div className="studio-ruler" aria-hidden="true">
            <span className="studio-track-head" />
            <div className="studio-ruler-lane">
              {ticks.map((tick) => (
                <span key={tick} className={tick % 8 === 0 ? 'is-major' : undefined} style={{ left: pct(tick) }}>
                  {tick % 8 === 0 && tick < RUNTIME ? toTimecode(tick).slice(3, 8) : ''}
                </span>
              ))}
            </div>
          </div>
          {tracks.map((track, index) => (
            <div className="studio-track" key={track.id}>
              <span className="studio-track-head">
                <b className={`studio-chip studio-tone-${track.tone}`} aria-hidden="true" />
                <span className="studio-mono studio-dim">{track.audio ? 'A1' : `V${tracks.length - 1 - index}`}</span>
                {track.name}
              </span>
              <div className="studio-track-lane">{track.clips.map((clip) => renderClip(clip, track))}</div>
            </div>
          ))}
          <div className="studio-playhead-lane" aria-hidden="true">
            <span className="studio-playhead" style={{ left: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
