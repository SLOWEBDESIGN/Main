/** Public facts shared by the visual site and its machine-readable counterpart. */
export const serviceGroups = [
  {
    id: "web",
    title: "Websites & digital experiences",
    short: "From first impression to the final click.",
    items: [
      "Custom website design",
      "Website redesigns",
      "Responsive development",
      "E-commerce & payments",
      "Landing pages",
      "Booking & lead flows",
      "Performance & accessibility",
      "Domains, DNS & hosting",
    ],
    detail:
      "A distinctive public face, with the practical details underneath it. Structure, copy, design, development, and the connections that make a website useful.",
  },
  {
    id: "content",
    title: "Reels, films & visual content",
    short: "Worth stopping the scroll for.",
    items: [
      "Short-form reels",
      "Brand & product films",
      "Event recaps",
      "Kinetic typography",
      "Motion graphics",
      "Color grading",
      "YouTube editing",
      "Campaign cutdowns",
    ],
    detail:
      "A single idea can become a reel, a launch film, a campaign, and a library of smaller moments. Editing, pacing, titles, color, and delivery, considered together.",
  },
  {
    id: "software",
    title: "Apps, extensions & business systems",
    short: "The part that makes everything work.",
    items: [
      "Browser extensions",
      "Web applications",
      "Customer & admin portals",
      "API integrations",
      "Workflow automation",
      "AI-assisted tools",
      "Dashboards",
      "Payment & email connections",
    ],
    detail:
      "From a small browser tool to the operational system behind a business. Interfaces shaped around the job people actually need to get done.",
  },
  {
    id: "identity",
    title: "Identity, imagery & print",
    short: "One recognizable world. Every surface.",
    items: [
      "Logos & visual identity",
      "Photo editing & retouching",
      "Product imagery",
      "Illustration & icons",
      "Menus, flyers & signage",
      "Presentations & catalogs",
      "Packaging concepts",
      "3D product visualization",
    ],
    detail:
      "The visual pieces around your website matter, too. A coherent identity across screens, photographs, printed materials, and product presentations.",
  },
  {
    id: "growth",
    title: "Search, launch & ongoing care",
    short: "A launch is a beginning.",
    items: [
      "Technical & local SEO",
      "Structured data",
      "Analytics setup",
      "Conversion improvements",
      "Email & campaign assets",
      "Site maintenance",
      "Updates & iteration",
      "Hosting support",
    ],
    detail:
      "Make the site discoverable, measure what happens, and keep improving it. Practical support for the website and the systems connected to it.",
  },
  {
    id: "production",
    title: "The production details",
    short: "All the useful things between the big things.",
    items: [
      "Fillable PDF forms",
      "Document layouts",
      "Audio cleanup & editing",
      "Podcast editing",
      "Subtitles & captions",
      "AI-assisted concepts",
      "Background removal",
      "Asset preparation",
    ],
    detail:
      "The finishing work that turns a collection of files into something ready to use. Clean assets, clear documents, accessible captions, and platform-ready exports.",
  },
] as const;

export const websiteProjects = [
  {
    id: "s2s",
    name: "Street to Seat",
    category: "Coaching / direction",
    title: "Built for the next big step.",
    description:
      "An aviation coaching website with a cinematic opening and a clear path from curiosity to a conversation.",
    url: "https://s2s-guidance.vercel.app/",
    tags: ["3D direction", "Lead generation", "Responsive design"],
    tone: "olive",
  },
  {
    id: "fulfillment",
    name: "SLO CAL Fulfillment",
    category: "Logistics / connection",
    title: "A different kind of logistics site.",
    description:
      "A coastal identity and an approachable inquiry flow for a fulfillment partner-matching service.",
    url: "https://slocalfulfillment.com",
    tags: ["Art direction", "Scroll motion", "Inquiry flow"],
    tone: "sand",
  },
  {
    id: "swim",
    name: "Swim lessons",
    category: "Local service / booking",
    title: "Confidence starts in the water.",
    description:
      "A sunlit, water-led website that makes a local swim lesson service easy to understand on any screen.",
    url: null,
    tags: ["Visual storytelling", "Mobile-first", "Service design"],
    tone: "aqua",
  },
  {
    id: "printdash",
    name: "3DPrintDash",
    category: "Commerce / platform",
    title: "From an idea to an object.",
    description:
      "A 3D printing platform connecting file uploads, quotes, ordering, and the operations behind them.",
    url: "https://www.3dprintdash.com",
    tags: ["Product design", "Commerce", "Business systems"],
    tone: "blue",
  },
] as const;

export const toolGroups = [
  {
    title: "Design & motion",
    tools: [
      "Figma",
      "Premiere Pro",
      "After Effects",
      "Photoshop",
      "Illustrator",
      "Lightroom",
      "DaVinci Resolve",
      "Blender",
      "InDesign",
      "Audition",
      "Media Encoder",
      "Character Animator",
      "Animate",
      "Express",
      "Firefly",
      "Substance 3D",
      "Acrobat",
      "Frame.io",
    ],
  },
  {
    title: "Build & connect",
    tools: [
      "VS Code",
      "Supabase",
      "Stripe",
      "Vercel",
      "Netlify",
      "Resend",
      "Shippo",
      "Cloudflare",
      "Analytics",
      "SEO",
    ],
  },
  {
    title: "AI & workflows",
    tools: ["Claude", "Codex", "OpenAI", "Anthropic", "Gemini", "Perplexity"],
  },
  {
    title: "Apps & platforms",
    tools: [
      "Xcode",
      "App Store",
      "Android Studio",
      "Google Play",
      "Capacitor",
      "Electron",
      "Chrome",
      "Safari",
      "Firefox",
      "Edge",
      "Brave",
      "Opera",
      "Chrome Web Store",
    ],
  },
];

export const process = [
  [
    "01",
    "Listen closely.",
    "Your business, your audience, and what needs to change. We start with the outcome, then work backward.",
  ],
  [
    "02",
    "Find the shape.",
    "A clear visual direction and something you can react to. We work through revisions together, not a guessing game at the finish line.",
  ],
  [
    "03",
    "Build the thing.",
    "Design, development, content, and integrations. The details are part of the work, not a separate problem.",
  ],
  [
    "04",
    "Keep it healthy.",
    "Test across screens, connect the essentials, and put it in the world. Then keep improving it as the business moves.",
  ],
] as const;

/** The three ways a project usually starts; the application asks which one fits. */
export const directions = [
  { id: "modernization", label: "Modernization", title: "The site you have, with the friction taken out." },
  { id: "custom-build", label: "Custom build", title: "A new digital home for the work you are proud of." },
  { id: "growth-system", label: "Growth system", title: "A site that keeps doing useful work after launch." },
  { id: "something-else", label: "Something else", title: "An app, an extension, a system, or a film. Tell us below." },
] as const;

/** What every project gets, whichever direction it takes. */
export const capabilities = [
  ["Strategy", "Positioning, offers, and a clear plan for what the site should make easier."],
  ["Design", "A visual system with a point of view, built around the people who will use it."],
  ["Development", "Fast, responsive, accessible websites that are designed to keep working."],
  ["Copywriting", "Words that make the value obvious without sounding like everyone else."],
  ["SEO", "Technical foundations and local signals that help the right people find you."],
  ["Care", "Updates, maintenance, and a real person to call when the site needs attention."],
] as const;

/**
 * The browser extension in the work grid. Its preview opens the real extension:
 * public/demos/waylight runs Waylight's own popup and content script, synced from
 * the focus-reader repo with tools/sync-waylight.mjs.
 */
export const extensionProject = {
  id: "waylight",
  name: "Waylight",
  category: "Browser extension / reading",
  title: "A calmer way to read any page.",
  description:
    "Word anchors, line focus, and optional reading fonts, on any web page. A visual layer only: the page's text is never rewritten. Built for Chrome, Edge, Firefox, and Safari.",
  url: "https://waylight.netlify.app",
  tags: ["Browser extension", "Accessibility", "Reading engine"],
} as const;
