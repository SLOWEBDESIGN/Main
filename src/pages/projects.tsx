import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { ArrowUpRight, Lock, MapPin, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { getBrandCopy, getBrandVariant, type BrandVariant } from '@/src/lib/schema';

const entries = [
  {
    number: '01',
    kind: 'Private / local build',
    title: '3PD Local Admin',
    description: 'A tiny operations desktop for a 3D printing business: folders, live counts, queues, support, and the wonderfully specific tools that make a real system feel alive.',
    note: 'Runs on localhost:3000. Not public. Not for customer use.',
    tone: 'project-entry-teal',
    icon: 'admin',
  },
  {
    number: '02',
    kind: 'Product / live site',
    title: '3D Print Dash',
    description: 'A quoting, uploading, and fulfillment experience built around making custom manufacturing feel less mysterious.',
    note: 'A separate product with its own status infrastructure.',
    tone: 'project-entry-yellow',
    href: 'https://www.3dprintdash.com',
    icon: 'dash',
  },
  {
    number: '03',
    kind: 'Accessibility / experiment',
    title: 'Waylight',
    description: 'A visual reading aid for webpages, PDFs, pasted text, and AI output. A quiet tool with a very opinionated relationship to words.',
    note: 'Local reading tools, browser extensions, and a small public site.',
    tone: 'project-entry-blue',
    href: 'https://waylight.netlify.app',
    icon: 'waylight',
  },
];

export const getServerSideProps: GetServerSideProps<{ variant: BrandVariant }> = async ({ req }) => {
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host ?? '';
  return { props: { variant: getBrandVariant(host) } };
};

export default function Projects({ variant }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const copy = getBrandCopy(variant);
  const location = variant === 'sdwebdesign' ? 'San Diego' : 'San Luis Obispo';

  return (
    <>
      <Head>
        <title>Fun projects | {copy.siteName}</title>
        <meta name="description" content="A living notebook of websites, tools, and experiments from the SLOWEBDESIGN studio." />
        <link rel="canonical" href={`${copy.canonical}/projects`} />
      </Head>
      <div className="projects-page">
        <header className="projects-nav">
          <a href="/" className="redesign-wordmark"><span className="redesign-mark">S</span><span>{copy.siteName}</span></a>
          <div className="projects-nav-right"><a href="/">Back to the studio <ArrowUpRight size={15} /></a><ThemeToggle /></div>
        </header>
        <main className="projects-main">
          <section className="projects-intro">
            <p className="redesign-kicker">Fun projects / {location}, CA</p>
            <h1>Things worth <em>making</em> time for.</h1>
            <p>A living notebook of websites, interfaces, experiments, and useful little worlds. This is where we keep the work that does not fit neatly into a service list.</p>
          </section>
          <section className="projects-list" aria-label="Project entries">
            {entries.map((entry) => {
              const content = <><div className="project-entry-top"><span>{entry.number} / {entry.kind}</span>{entry.href ? <ArrowUpRight size={18} /> : <Lock size={17} />}</div><div className={`project-entry-visual ${entry.tone}`}><div className={`project-visual-${entry.icon}`}><span /><span /><span /><span /></div></div><div className="project-entry-copy"><h2>{entry.title}</h2><p>{entry.description}</p><small>{entry.note}</small></div></>;
              return entry.href ? <a className="project-entry" href={entry.href} target="_blank" rel="noopener noreferrer" key={entry.number}>{content}</a> : <article className="project-entry" key={entry.number}>{content}</article>;
            })}
          </section>
          <section className="projects-post-note"><Sparkles size={20} /><div><strong>More experiments are coming.</strong><p>Add the next entry to the project list in <code>src/pages/projects.tsx</code>. That is intentionally the whole publishing workflow for now.</p></div></section>
        </main>
        <footer className="projects-footer"><span>© {new Date().getFullYear()} Domain owner. No rights reserved.</span><span><MapPin size={13} /> {location}, California</span><a href="/1LhYKNpDUb9vRK95brXe/index.html">All site statuses</a></footer>
      </div>
    </>
  );
}
