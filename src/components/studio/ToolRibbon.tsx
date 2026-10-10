'use client';

import React, { useEffect, useRef, useState } from 'react';

// slug: a Simple Icons CDN logo. Brands Simple Icons removed (OpenAI, VS Code, every Adobe
// app, Edge) use a short `mark` tile, and any logo that fails to load (blocked, renamed,
// removed) falls back to its tile instead of showing a broken image.
type Tool = { name: string; slug?: string; mark?: string };

const buildStack: Tool[] = [
  { name: 'VS Code', mark: 'VS' },
  { name: 'Codex', mark: 'Cx' },
  { name: 'Claude', slug: 'claude' },
  { name: 'OpenAI', mark: 'OA' },
  { name: 'Anthropic', slug: 'anthropic' },
  { name: 'Gemini', slug: 'googlegemini' },
  { name: 'Perplexity', slug: 'perplexity' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'Netlify', slug: 'netlify' },
  { name: 'Resend', slug: 'resend' },
  { name: 'Shippo', mark: 'Sh' },
  { name: 'Figma', slug: 'figma' },
  { name: 'SEO', mark: 'SEO' },
  { name: 'Analytics', slug: 'googleanalytics' },
  { name: 'Copyright', mark: '©' },
];

const createAndShip: Tool[] = [
  { name: 'Creative Cloud', mark: 'Cc' },
  { name: 'Premiere Pro', mark: 'Pr' },
  { name: 'After Effects', mark: 'Ae' },
  { name: 'Photoshop', mark: 'Ps' },
  { name: 'Illustrator', mark: 'Ai' },
  { name: 'Lightroom', mark: 'Lr' },
  { name: 'InDesign', mark: 'Id' },
  { name: 'Audition', mark: 'Au' },
  { name: 'Media Encoder', mark: 'Me' },
  { name: 'Character Animator', mark: 'Ch' },
  { name: 'Animate', mark: 'An' },
  { name: 'Express', mark: 'Ex' },
  { name: 'Firefly', mark: 'Ff' },
  { name: 'Substance 3D', mark: '3D' },
  { name: 'Acrobat', mark: 'Ac' },
  { name: 'Frame.io', mark: 'Fo' },
  { name: 'DaVinci Resolve', slug: 'davinciresolve' },
  { name: 'Blender', slug: 'blender' },
  { name: 'Apple', slug: 'apple' },
  { name: 'App Store', slug: 'appstore' },
  { name: 'Xcode', slug: 'xcode' },
  { name: 'Android', slug: 'android' },
  { name: 'Google Play', slug: 'googleplay' },
  { name: 'Android Studio', slug: 'androidstudio' },
  { name: 'Capacitor', slug: 'capacitor' },
  { name: 'Electron', slug: 'electron' },
  { name: 'Chrome', slug: 'googlechrome' },
  { name: 'Safari', slug: 'safari' },
  { name: 'Firefox', slug: 'firefoxbrowser' },
  { name: 'Edge', mark: 'Ed' },
  { name: 'Brave', slug: 'brave' },
  { name: 'Opera', slug: 'opera' },
  { name: 'Chrome Web Store', slug: 'chromewebstore' },
];

const ToolLogo: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  // An image that failed before hydration never fires onError, so check once on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (!tool.slug || failed) {
    return <b className="studio-tool-tile" aria-hidden="true">{tool.mark ?? tool.name.slice(0, 1)}</b>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={imgRef} src={`https://cdn.simpleicons.org/${tool.slug}/8a94a3`} alt="" aria-hidden="true" width={18} height={18} onError={() => setFailed(true)} />;
};

const Row: React.FC<{ tools: Tool[]; reverse?: boolean; label: string }> = ({ tools, reverse, label }) => (
  <div className="studio-ribbon-row" role="group" aria-label={label}>
    {/* Two copies so the -50% loop is seamless; about 2.4s per tool keeps names readable. */}
    <div className={`studio-ribbon-track${reverse ? ' is-reverse' : ''}`} style={{ animationDuration: `${tools.length * 2.4}s` }}>
      {[...tools, ...tools].map((tool, index) => (
        <span className="studio-tool" key={`${tool.name}-${index}`} aria-hidden={index >= tools.length ? true : undefined}>
          <ToolLogo tool={tool} />
          {tool.name}
        </span>
      ))}
    </div>
  </div>
);

/** Two counter-scrolling rows: what we build with, and what we create and ship to. */
export const ToolRibbon: React.FC = () => (
  <section className="studio-ribbon" aria-label="Tools and platforms">
    <Row tools={buildStack} label="Build and AI tools" />
    <Row tools={createAndShip} reverse label="Creative apps, devices, stores, and browsers" />
  </section>
);
