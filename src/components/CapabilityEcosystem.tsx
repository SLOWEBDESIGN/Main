'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

const groups = [
  { id: 'online', label: 'Get online', color: 'ecosystem-red', items: ['Website design', 'Development', 'Domains + DNS', 'Hosting + deployment', 'SSL + security'] },
  { id: 'found', label: 'Get found', color: 'ecosystem-blue', items: ['SEO foundations', 'Search indexing', 'Metadata + schema', 'Performance', 'Analytics'] },
  { id: 'brand', label: 'Build your brand', color: 'ecosystem-yellow', items: ['Visual identity', 'Digital assets', 'Content systems', 'Short-form video', 'Social presence'] },
  { id: 'sell', label: 'Sell + operate', color: 'ecosystem-green', items: ['E-commerce', 'Payments', 'Forms + flows', 'Integrations', 'Automation'] },
  { id: 'connect', label: 'Connect everything', color: 'ecosystem-violet', items: ['APIs', 'Email', 'Cloudflare', 'Netlify + Vercel', 'Third-party services'] },
  { id: 'grow', label: 'Keep growing', color: 'ecosystem-coral', items: ['Campaigns', 'Conversion improvements', 'Social content', 'Measurement', 'Iterative improvements'] },
];

export const CapabilityEcosystem: React.FC = () => {
  const [active, setActive] = useState('online');
  const activeGroup = groups.find((group) => group.id === active) ?? groups[0];

  return (
    <section className="capability-ecosystem" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="ecosystem-intro"><p className="redesign-kicker">What we can do for the business</p><h2 id="ecosystem-title">Your online <em>presence.</em></h2><p>Start with a website. Expand only where the idea needs more room.</p></div>
      <div className="ecosystem-map">
        <div className="ecosystem-center"><span>YOUR</span><strong>ONLINE<br />PRESENCE</strong><small>one connected system</small></div>
        <div className="ecosystem-orbit ecosystem-orbit-one" /><div className="ecosystem-orbit ecosystem-orbit-two" />
        {groups.map((group, index) => (
          <button type="button" key={group.id} className={`ecosystem-node ${group.color} ecosystem-node-${index} ${active === group.id ? 'is-active' : ''}`} onClick={() => setActive(group.id)} aria-expanded={active === group.id}><span>{String(index + 1).padStart(2, '0')}</span>{group.label}<ChevronDown size={15} /></button>
        ))}
      </div>
      <div className={`ecosystem-detail ${activeGroup.color}`}><div><p className="redesign-kicker">{activeGroup.label}</p><h3>Enough depth to make the next step possible.</h3></div><ul>{activeGroup.items.map((item) => <li key={item}>{item}</li>)}</ul><a href="#contact">Bring us the idea <ArrowUpRight size={16} /></a></div>
      <p className="ecosystem-footnote">We are not a law firm. Copyright and IP support means implementation guidance and workflow assistance, not legal advice.</p>
    </section>
  );
};
