// What each part of the creative suite lets the studio make, the delivery sizes,
// and the content workflow. Shared by the studio and atelier homepages.

export type Bin = { id: string; name: string; apps: [string, string][]; make: string[] };

// App marks are two-letter tiles, not logos.
export const bins: Bin[] = [
  {
    id: 'video',
    name: 'Video & motion',
    apps: [['Pr', 'Premiere Pro'], ['Ae', 'After Effects'], ['Dv', 'DaVinci Resolve'], ['Me', 'Media Encoder'], ['Ch', 'Character Animator'], ['Fo', 'Frame.io']],
    make: [
      'Short-form reels for Instagram, TikTok, and YouTube Shorts',
      'Brand films and product spots',
      'Event recaps cut to the beat',
      'Kinetic type and logo animations',
      'Lower thirds, titles, and caption styles',
      'Color grading that matches across every clip',
      'Animated explainers and character spots',
      'YouTube edits with chapters and thumbnails',
      'Campaign systems: one shoot cut into a month of posts',
    ],
  },
  {
    id: 'photo',
    name: 'Photo',
    apps: [['Ps', 'Photoshop'], ['Lr', 'Lightroom'], ['LrC', 'Lightroom Classic'], ['Br', 'Bridge'], ['Cr', 'Camera Raw']],
    make: [
      'Product retouching and background removal',
      'Team photos and headshot edits',
      'Food and menu photography',
      'Composites and campaign key art',
      'Color presets so every post looks like one brand',
      'Thumbnails and social image sets',
    ],
  },
  {
    id: 'design',
    name: 'Design & print',
    apps: [['Ai', 'Illustrator'], ['Id', 'InDesign'], ['Ex', 'Adobe Express'], ['Fr', 'Fresco'], ['Fn', 'Adobe Fonts']],
    make: [
      'Logos and identity systems',
      'Icons, illustrations, and stickers',
      'Menus, flyers, posters, and signage',
      'Brochures, one-pagers, and pitch decks',
      'Business cards and print-ready files',
      'Social templates your team can reuse',
      'Packaging and merch graphics',
    ],
  },
  {
    id: '3d',
    name: '3D',
    apps: [['Pt', 'Substance 3D Painter'], ['Ds', 'Substance 3D Designer'], ['Sa', 'Substance 3D Sampler'], ['St', 'Substance 3D Stager'], ['Bl', 'Blender']],
    make: [
      'Product renders without a photo shoot',
      'Packaging visualizations',
      'Materials and textures made from real photos',
      'Staged 3D scenes for ads and listings',
      'Renders of 3D-printed parts and prototypes',
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    apps: [['Au', 'Audition'], ['Pr', 'Premiere Pro'], ['Dv', 'DaVinci Resolve']],
    make: [
      'Podcast editing and mixing',
      'Voiceover cleanup and noise reduction',
      'Music edits timed to the cut',
      'Loudness set for each platform',
      'Sound design for reels and ads',
    ],
  },
  {
    id: 'ai',
    name: 'AI-assisted',
    apps: [['Ff', 'Firefly'], ['Ps', 'Photoshop generative fill'], ['Pr', 'Premiere generative extend']],
    make: [
      'Concept frames and storyboards before a shoot',
      'Backgrounds extended to fit new aspect ratios',
      'Distractions removed from photos and footage',
      'Quick variations for testing ad creative',
      'Transcripts and captions generated from speech',
    ],
  },
  {
    id: 'docs',
    name: 'Documents',
    apps: [['Ac', 'Acrobat Pro']],
    make: [
      'Fillable PDF forms',
      'Interactive menus and catalogs',
      'Contracts ready for e-signature',
      'Print-ready PDFs with correct bleeds',
      'Accessibility checks on PDFs',
    ],
  },
  {
    id: 'web',
    name: 'Web & interactive',
    apps: [['An', 'Animate'], ['Ex', 'Adobe Express'], ['Fg', 'Figma'], ['Ae', 'After Effects']],
    make: [
      'Animated banners and HTML5 ads',
      'Looping web video and GIFs',
      'Motion for websites and apps',
      'Email headers and graphics',
      'Art direction for landing pages',
    ],
  },
];

export const formats = [
  { ratio: '9 / 16', name: '9:16', use: 'Reels, TikTok, Shorts, Stories' },
  { ratio: '4 / 5', name: '4:5', use: 'Feed posts' },
  { ratio: '1 / 1', name: '1:1', use: 'Square posts and ads' },
  { ratio: '16 / 9', name: '16:9', use: 'YouTube, websites, screens' },
  { ratio: '1.91 / 1', name: '1.91:1', use: 'Link previews and banners' },
];

export const workflow = ['Brief', 'Capture', 'Edit', 'Color', 'Sound', 'Motion and type', 'Captions', 'Review', 'Deliver'];
