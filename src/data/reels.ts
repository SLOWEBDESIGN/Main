// Real short-form edits shown in the program monitor and the content section.
// The first reel is the featured one: it loads first in the reel gallery.
// Files are web encodes (720x1280 H.264, fast start) of the 1080x1920 masters.
// Every preview is silent: the encodes carry no audio track at all.

export interface Reel {
  id: string;
  title: string;
  src: string;
  poster: string;
  /** Runtime as SMPTE timecode at 30 fps. */
  timecode: string;
  seconds: number;
  summary: string;
  craft: string[];
}

export const reels: Reel[] = [
  {
    id: 'nothing-comes-back',
    title: 'Nothing Comes Back to You',
    src: '/media/reels/nothing-comes-back.mp4',
    poster: '/media/reels/nothing-comes-back.jpg',
    timecode: '00:00:19:16',
    seconds: 19.5,
    summary: 'Give it all, and nothing comes back to you: chrome type over the coast, and figures cut out and filled with static.',
    craft: ['Kinetic type', 'Masking', 'Texture effects'],
  },
  {
    id: 'between-stops',
    title: 'Between Stops',
    src: '/media/reels/between-stops.mp4',
    poster: '/media/reels/between-stops.jpg',
    timecode: '00:00:15:00',
    seconds: 15,
    summary: 'A San Diego day on the trolley, cut as a split-screen collage.',
    craft: ['Location montage', 'Split-screen grids', 'Title design'],
  },
  {
    id: 'lambda-casino-night',
    title: 'Lambda casino night',
    src: '/media/reels/lambda-casino-night.mp4',
    poster: '/media/reels/lambda-casino-night.jpg',
    timecode: '00:00:30:14',
    seconds: 30.5,
    summary: 'A beat-synced, casino-themed recruitment edit for Lambda Chi Alpha at San Diego State.',
    craft: ['Beat-synced cuts', 'Glitch transitions', 'Kinetic type'],
  },
  {
    id: 'printdash-operators',
    title: '3DPrintDash for operators',
    src: '/media/reels/printdash-operators.mp4',
    poster: '/media/reels/printdash-operators.jpg',
    timecode: '00:00:38:16',
    seconds: 38.5,
    summary: 'A beat-synced recruitment edit for the first 100 printer operators on 3DPrintDash: big type, image-filled lettering, and a capture of the real quote selector.',
    craft: ['Beat-synced cuts', 'Image-filled type', 'Product capture'],
  },
  {
    id: 'printdash-customers',
    title: '3DPrintDash for customers',
    src: '/media/reels/printdash-customers.mp4',
    poster: '/media/reels/printdash-customers.jpg',
    timecode: '00:00:35:17',
    seconds: 35.5,
    summary: 'A beat-synced introduction to 3DPrintDash: the hassle of ordering one tiny part, then the real site, an AI-to-3D-model example, and a network of independent printers.',
    craft: ['Kinetic type', 'Masking', '3D model render'],
  },
];

export const getReel = (id: string): Reel => reels.find((reel) => reel.id === id) ?? reels[0];
