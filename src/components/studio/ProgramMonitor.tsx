'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { Reel } from '@/src/data/reels';

/** Seconds as SMPTE timecode at 30 fps, e.g. 00:00:12:04. */
export const toTimecode = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const whole = Math.floor(safe);
  const frames = Math.floor((safe - whole) * 30);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(whole / 3600))}:${pad(Math.floor(whole / 60) % 60)}:${pad(whole % 60)}:${pad(frames)}`;
};

/** The hero's program monitor: one reel, muted autoplay while on screen, with real controls. */
export const ProgramMonitor: React.FC<{ reel: Reel }> = ({ reel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setTime(0);
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reel.id]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  };

  return (
    <figure className="studio-monitor" aria-label={`Program monitor playing ${reel.title}`}>
      <figcaption className="studio-panel-tab"><span>Program: {reel.title}</span><span className="studio-mono">1080 × 1920</span></figcaption>
      <div className="studio-monitor-screen">
        <video
          key={reel.id}
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        />
        <span className="studio-safe studio-safe-action" aria-hidden="true" />
        <span className="studio-safe studio-safe-title" aria-hidden="true" />
      </div>
      <div className="studio-monitor-bar">
        <span className="studio-mono studio-timecode-live">{toTimecode(time)}</span>
        <div className="studio-monitor-controls">
          <button type="button" onClick={toggle} aria-label={playing ? `Pause ${reel.title}` : `Play ${reel.title}`}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" onClick={() => setMuted((value) => !value)} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
        <span className="studio-mono studio-dim">{reel.timecode}</span>
      </div>
    </figure>
  );
};
