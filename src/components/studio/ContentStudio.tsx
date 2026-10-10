'use client';

import React, { useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { Reel } from '@/src/data/reels';
import { bins, formats, workflow } from '@/src/data/contentStudio';


const ReelCard: React.FC<{ reel: Reel; active: boolean; onActivate: (id: string | null) => void }> = ({ reel, active, onActivate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    onActivate(reel.id);
    videoRef.current?.play().catch(() => undefined);
  };
  const pause = () => videoRef.current?.pause();

  // Only the card being watched keeps playing.
  React.useEffect(() => {
    if (!active) videoRef.current?.pause();
  }, [active]);

  return (
    <article className={`studio-reel${active ? ' is-active' : ''}`}>
      <div
        className="studio-reel-screen"
        onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) play(); }}
        onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches && muted) pause(); }}
      >
        <video
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          muted={muted}
          loop
          playsInline
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className="studio-reel-controls">
          <button type="button" onClick={() => (playing ? pause() : play())} aria-label={playing ? `Pause ${reel.title}` : `Play ${reel.title}`}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" onClick={() => { setMuted((value) => !value); play(); }} aria-pressed={!muted} aria-label={muted ? `Play ${reel.title} with sound` : 'Turn sound off'}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
      <div className="studio-reel-meta">
        <h4>{reel.title}</h4>
        <span className="studio-mono studio-dim">{reel.timecode}</span>
      </div>
      <p>{reel.summary}</p>
      <ul className="studio-tags">{reel.craft.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
};

/** The content department: real reels, the whole suite by discipline, formats, and the workflow. */
export const ContentStudio: React.FC<{ reels: Reel[] }> = ({ reels }) => {
  const [activeReel, setActiveReel] = useState<string | null>(null);
  const [binId, setBinId] = useState(bins[0].id);
  const bin = bins.find((item) => item.id === binId) ?? bins[0];

  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = bins.findIndex((item) => item.id === binId);
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % bins.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + bins.length) % bins.length;
    else return;
    event.preventDefault();
    setBinId(bins[next].id);
    document.getElementById(`studio-bin-tab-${bins[next].id}`)?.focus();
  };

  return (
    <section className="studio-content" id="content" aria-labelledby="studio-content-title">
      <div className="studio-content-top">
        <div className="studio-content-head">
          <h2 id="studio-content-title">Built to be seen.</h2>
          <p className="studio-lede">A website gives the work a home. Short-form content gives people a reason to visit.</p>
          <p>We make both. The full Adobe Creative Cloud suite and DaVinci Resolve sit with the same team that builds your site, so we shoot, edit, design, and deliver in the sizes your customers actually scroll.</p>
          <p className="studio-dim">Vertical edits, Reels, TikTok, and campaign systems. Hover or tap a reel to play it.</p>
        </div>
        <div className="studio-reels">
          {reels.map((reel) => <ReelCard key={reel.id} reel={reel} active={activeReel === reel.id} onActivate={setActiveReel} />)}
        </div>
      </div>

      <div className="studio-bins">
        <div className="studio-panel-tab"><span>Project: what we make with each app</span><span className="studio-mono">{bins.length} bins</span></div>
        <div className="studio-bins-body">
          <div className="studio-bin-list" role="tablist" aria-label="Disciplines" onKeyDown={onTabKey}>
            {bins.map((item) => (
              <button
                key={item.id}
                id={`studio-bin-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={item.id === binId}
                aria-controls="studio-bin-panel"
                tabIndex={item.id === binId ? 0 : -1}
                onClick={() => setBinId(item.id)}
              >
                <span className="studio-folder" aria-hidden="true" />
                {item.name}
                <span className="studio-mono studio-dim">{item.make.length}</span>
              </button>
            ))}
          </div>
          <div className="studio-bin-panel" id="studio-bin-panel" role="tabpanel" aria-labelledby={`studio-bin-tab-${bin.id}`}>
            <ul className="studio-app-list" aria-label={`${bin.name} apps`}>
              {bin.apps.map(([mark, name]) => <li key={name}><b className="studio-app-tile" aria-hidden="true">{mark}</b>{name}</li>)}
            </ul>
            <h3>{bin.name}: what you get</h3>
            <ul className="studio-make-list">{bin.make.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="studio-content-grid">
        <div className="studio-formats">
          <h3>Every size, from one edit</h3>
          <ul>
            {formats.map((format) => (
              <li key={format.name}>
                <span className="studio-frame" style={{ aspectRatio: format.ratio }} aria-hidden="true" />
                <span className="studio-mono">{format.name}</span>
                <small>{format.use}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="studio-workflow">
          <h3>From brief to delivery</h3>
          <ol>{workflow.map((step) => <li key={step}>{step}</li>)}</ol>
          <a className="studio-button" href="#contact">Talk about a campaign</a>
        </div>
      </div>
    </section>
  );
};
