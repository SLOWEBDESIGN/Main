// Structured records for the horizontal opening (desktop) and the
// selected-work cards further down the page. One record powers both:
// the opening scenes reference these by id, and the "other work" grid
// plus the projects modal list render from the same array.
// Project names are secondary metadata: swapping a candidate must not
// require rewriting the scene component. Poster art is static only;
// replace `posterTone` with a real `posterImage` when art is supplied.

export interface OpeningProject {
  id: string;
  name: string;
  tagline: string;
  /** One-line summary used on the selected-work cards and modal list. */
  summary: string;
  description: string;
  capabilities: string;
  href: string | null;
  /** Optional static poster image. When absent, a styled placeholder renders. */
  posterImage?: string;
  /** Placeholder art direction key, used until real art is supplied. */
  posterTone: 'craft' | 'tool' | 'system';
}

export interface OpeningScene {
  id: string;
  kicker: string;
  headline: string;
  statement: string;
  caption: string;
  chipLabel: string;
  projectId: string;
}

export const openingProjects: OpeningProject[] = [
  {
    id: 'slocal-fulfillment',
    name: 'SLO CAL Fulfillment',
    tagline: 'A lead-generation site with real visual craft.',
    summary: 'A lead-generation site with real visual craft.',
    description:
      'Marketing site for a Southern California 3PL lead-matching service: clear positioning, service explainers, and an inquiry flow that connects shippers with suitable fulfillment partners.',
    capabilities: 'Websites and visual craft',
    href: 'https://slocalfulfillment.com',
    posterTone: 'craft',
  },
  {
    id: 'waylight',
    name: "Waylight's reading interface",
    tagline: 'A focused tool, not a marketing page.',
    summary: 'A visual reading aid for webpages, PDFs, and AI output.',
    description:
      'The reading interface of Waylight, a visual reading aid for webpages, PDFs, and AI output. Built to get out of the way so the text can do its work.',
    capabilities: 'Apps and reading tools',
    href: 'https://waylight.netlify.app',
    posterTone: 'tool',
  },
  {
    id: '3dprintdash',
    name: '3D Print Dash',
    tagline: 'Customer, operator, and admin views in one system.',
    summary: 'Quotes, uploads, pricing, and operations for 3D printing.',
    description:
      'Coordinated software for a 3D printing service: quotes, uploads, and pricing for customers, with operator and admin views behind the same platform.',
    capabilities: 'Platforms and business systems',
    href: 'https://www.3dprintdash.com',
    posterTone: 'system',
  },
  {
    id: 'sensorium-therapy',
    name: 'Sensorium Therapy',
    tagline: 'A future project in preparation.',
    summary: 'A future project currently listed in the private status index.',
    description:
      'A future project currently listed in the private status index.',
    capabilities: 'In preparation',
    href: null,
    posterTone: 'tool',
  },
  {
    id: 'avila-cake-design',
    name: 'Avila Cake Design',
    tagline: 'A future project in preparation.',
    summary: 'A future commerce project currently in preparation.',
    description:
      'A future commerce project currently in preparation.',
    capabilities: 'In preparation',
    href: null,
    posterTone: 'craft',
  },
  {
    id: '3d-print-lessons',
    name: '3D Print Lessons',
    tagline: 'A future project in preparation.',
    summary: 'A future learning project currently in preparation.',
    description:
      'A future learning project currently in preparation.',
    capabilities: 'In preparation',
    href: null,
    posterTone: 'system',
  },
];

export const openingScenes: OpeningScene[] = [
  {
    id: 'website',
    kicker: 'Scene 01 — Websites',
    headline: 'We build the website.',
    statement: 'A site that explains the business and brings in the right inquiries.',
    caption: 'Websites · Visual craft',
    chipLabel: 'SLO CAL Fulfillment',
    projectId: 'slocal-fulfillment',
  },
  {
    id: 'tools',
    kicker: 'Scene 02 — Apps and tools',
    headline: 'We build the tools your team actually uses.',
    statement: 'Focused software that does one job well.',
    caption: 'Apps · Reading tools',
    chipLabel: 'Waylight reading interface',
    projectId: 'waylight',
  },
  {
    id: 'system',
    kicker: 'Scene 03 — Platforms',
    headline: 'We build the system behind it.',
    statement: 'The coordinated operations underneath the interface.',
    caption: 'Platforms · Business systems',
    chipLabel: '3D Print Dash',
    projectId: '3dprintdash',
  },
];

export const getOpeningProject = (id: string): OpeningProject | undefined =>
  openingProjects.find((project) => project.id === id);
