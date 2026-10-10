'use client';

import React, { useState } from 'react';
import { groups } from '@/src/components/CapabilityEcosystem';

// Label colors per group, from the same palette as the timeline tracks.
const tones: Record<string, string> = {
  online: 'cerulean',
  found: 'teal',
  brand: 'rose',
  sell: 'mango',
  connect: 'lavender',
  grow: 'forest',
};

/** "Your online presence" as an effect controls panel: every group twirls open to its parts. */
export const PresencePanel: React.FC = () => {
  const [open, setOpen] = useState<Set<string>>(() => new Set(['online']));

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="studio-presence" id="ecosystem" aria-labelledby="studio-presence-title">
      <div className="studio-presence-intro">
        <h2 id="studio-presence-title">Your online presence.</h2>
        <p className="studio-lede">Start with a website. Expand only where the idea needs more room.</p>
        <p>What we can do for the business, as one connected system. Each part has enough depth to make the next step possible.</p>
        <a className="studio-button" href="#contact">Bring us the idea</a>
      </div>
      <div className="studio-presence-panel">
        <div className="studio-panel-tab"><span>Effect controls: your online presence</span><span className="studio-mono">{groups.length} groups</span></div>
        <ul className="studio-effects">
          {groups.map((group) => {
            const expanded = open.has(group.id);
            return (
              <li key={group.id} className={`studio-effect${expanded ? ' is-open' : ''}`}>
                <button type="button" aria-expanded={expanded} aria-controls={`studio-effect-${group.id}`} onClick={() => toggle(group.id)}>
                  <span className="studio-effect-twisty" aria-hidden="true" />
                  <b className={`studio-chip studio-tone-${tones[group.id] ?? 'cerulean'}`} aria-hidden="true" />
                  {group.label}
                  <span className="studio-mono studio-dim">{group.items.length}</span>
                </button>
                <ul id={`studio-effect-${group.id}`} hidden={!expanded}>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="studio-footnote">We are not a law firm. Copyright and IP support means implementation guidance and workflow assistance, not legal advice.</p>
    </section>
  );
};
