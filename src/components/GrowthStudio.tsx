'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Play, VolumeX } from 'lucide-react';

const reels = [
  { id: '01', label: 'A product with a pulse', type: 'product', tone: 'growth-reel-coral' },
  { id: '02', label: 'Make the moment land', type: 'story', tone: 'growth-reel-blue' },
  { id: '03', label: 'Built for the scroll', type: 'campaign', tone: 'growth-reel-lime' },
  { id: '04', label: 'Show the work', type: 'craft', tone: 'growth-reel-violet' },
];

export const GrowthStudio: React.FC = () => {
  const [active, setActive] = useState(1);

  return (
    <section className="growth-studio" aria-labelledby="growth-studio-title">
      <div className="growth-studio-heading">
        <div>
          <p className="redesign-kicker">Beyond the build</p>
          <h2 id="growth-studio-title">Built to be <em>seen.</em></h2>
        </div>
        <p className="growth-studio-intro">A website gives the work a home. Short-form content gives people a reason to visit.</p>
      </div>
      <div className="growth-reel-stage" aria-label="Silent short-form content examples">
        {reels.map((reel, index) => {
          const offset = (index - active + reels.length) % reels.length;
          return (
            <button
              type="button"
              className={`growth-reel ${reel.tone} ${offset === 0 ? 'is-active' : ''}`}
              style={{ '--reel-offset': offset } as React.CSSProperties}
              onClick={() => setActive(index)}
              key={reel.id}
              aria-label={`Show ${reel.label}`}
            >
              <span className="growth-reel-top"><span>{reel.id} / 04</span><VolumeX size={14} /></span>
              <span className={`growth-reel-art growth-art-${reel.type}`} aria-hidden="true">
                <span className="growth-art-orbit" /><span className="growth-art-window"><i /><i /><i /></span><span className="growth-art-caption">{reel.label}</span>
              </span>
              <span className="growth-reel-bottom"><strong>{reel.type === 'campaign' ? 'Campaign content' : 'Short-form edit'}</strong><Play size={15} fill="currentColor" /></span>
            </button>
          );
        })}
      </div>
      <div className="growth-studio-foot"><span>Vertical edits / Reels / TikTok / Campaign systems</span><a href="#contact">Talk about a campaign <ArrowUpRight size={16} /></a></div>
    </section>
  );
};
