import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const read = file => fs.readFileSync(file, 'utf8');
const directory = JSON.parse(read('src/data/status-directory.json'));

function branding() {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(read('src/lib/schema.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, process: { env: { NODE_ENV: 'production' } } });
  return exports;
}

test('SD contact copy has no personal names in any form or private-visit state', () => {
  const { getBrandContactCopy } = branding();
  const sd = getBrandContactCopy('sdwebdesign');
  for (const value of Object.values(sd)) assert.doesNotMatch(value, /\bBen\b|Benyamin/i);
  assert.equal(sd.emailPlaceholder, 'Where we can reply');
  assert.equal(sd.note, 'Your note goes directly to our studio. No commitment, no payment.');
  assert.equal(sd.visitCta, 'Talk to us');
  assert.equal(getBrandContactCopy('slowebdesign').emailPlaceholder, 'Where Ben can reply');
  assert.equal(getBrandContactCopy('slowebdesign').sentPrefix, 'Ben will read your note and reply to');
  assert.equal(getBrandContactCopy().note, 'Your note goes directly to Ben. No commitment, no payment.');
  assert.match(read('src/components/atelier/AtelierHome.tsx'), /<ApplicationForm variant=\{variant\}/);
});

test('share cards are explicit, domain-specific, and never use a personal photo', () => {
  const { getBrandCopy, getBrandVariant, getRequestBrandVariant } = branding();
  for (const [host, variant] of [['sdwebdesign.tech', 'sdwebdesign'], ['slowebdesign.com', 'slowebdesign']]) {
    assert.equal(getBrandVariant(host), variant);
    assert.equal(getRequestBrandVariant({ 'x-forwarded-host': host }), variant);
    const copy = getBrandCopy(variant);
    assert.equal(copy.contactEmail, 'contact@slowebdesign.com');
    assert.match(copy.shareImage, /^\/brand\/share-(sd|slo)-v2\.jpg$/);
    assert.ok(fs.existsSync(`public${copy.shareImage}`));
    assert.equal(copy.favicon, '/brand/studio-mark-v2.svg');
    assert.doesNotMatch(copy.shareImage, /about|ben|kitchen/i);
  }
  const page = read('src/pages/index.tsx');
  assert.match(page, /property="og:image" content=\{copy.canonical \+ copy.shareImage\}/);
  assert.match(page, /name="twitter:image" content=\{copy.canonical \+ copy.shareImage\}/);
  assert.match(read('src/pages/_document.tsx'), /studio-icon-180-v2\.png/);
});

test('SD reels contain only Lambda and PrintDash, while SLO keeps all five', () => {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(read('src/data/reels.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports });
  assert.deepEqual(Array.from(exports.getReelsForBrand('sdwebdesign'), reel => reel.id),
    ['lambda-casino-night', 'printdash-operators', 'printdash-customers']);
  assert.equal(exports.getReelsForBrand('slowebdesign').length, 5);
  assert.match(read('src/components/atelier/AtelierHome.tsx'), /<ReelGallery key=\{variant\}.*variant=\{variant\}/);
});

test('all connected hosting projects and both studio domains are in the directory', () => {
  const urls = directory.sites.map(site => site.url);
  for (const url of ['https://slowebdesign.com', 'https://sdwebdesign.tech',
    'https://slocalfulfillment.com', 'https://waylight.netlify.app', 'https://www.3dprintdash.com',
    ...['s2s-guidance', 'benyamin-portfolio', 'sunwater-swim', 'print-lessons-muse-html',
      'sensorium-relia', 'sensorium-therapy', 'redding-weed-suppression'].map(name => `https://${name}.vercel.app`)]) {
    assert.ok(urls.includes(url), url);
  }
  const services = new Set(directory.services.map(service => service.id));
  for (const site of directory.sites) for (const service of site.services) assert.ok(services.has(service));
});

test('private demo routes and passwords stay out of the public directory', () => {
  const json = JSON.stringify(directory);
  assert.doesNotMatch(json, /\/visit\/\d|accessCode|password"|\b(?:253308|779109|820674|855578)\b/);
  assert.equal(directory.sites.filter(site => /concept$/.test(site.name)).length, 4);
});

test('mobile advice does not block either access form', () => {
  const visit = read('src/pages/visit/[code].tsx');
  const dialog = read('src/components/atelier/VisitCodeDialog.tsx');
  assert.doesNotMatch(visit, /busy \|\| mobile|\{mobile \? <section/);
  assert.doesNotMatch(dialog, /\{mobile \? <>/);
  assert.match(visit, /Request Desktop Site/);
  assert.match(dialog, /You can still continue here/);
});

test('SLO retains About, photos, work, and statuses; SD has services navigation', () => {
  const home = read('src/components/atelier/AtelierHome.tsx');
  assert.match(home, /const showSloSections = variant === "slowebdesign"/);
  assert.match(home, /\{showSloSections && <AboutSection city=\{copy.city\} \/>\}/);
  assert.match(home, /\{showSloSections && <a href="#about"/);
  assert.match(home, /\{showSloSections && <a href="\/1LhYKNpDUb9vRK95brXe\/index.html"/);
  assert.match(home, /\{showSloSections && <StatusLinks \/>\}/);
  assert.match(home, /\{showSloSections && <WorkGrid/);
  assert.match(home, /\{showSloSections && <StepLink large quiet href="#work"/);
  assert.match(home, /href=\{showSloSections \? "#work" : "#capabilities"\}/);
  assert.match(read('src/components/atelier/AboutSection.tsx'), /ben-kitchen\.jpg/);
  assert.match(home, /interactive=\{!preview\}/);
});

function inputFixture() {
  const source = read('src/components/atelier/IcyStaircase.tsx');
  const handlers = source.slice(source.indexOf('    const place = '), source.indexOf('    const project = '));
  const element = new EventTarget();
  element.getBoundingClientRect = () => ({ left: 10, top: 20 });
  const pointer = { x: 0, y: 0, active: false };
  const settings = { current: { interactive: true } };
  const context = { renderer: { domElement: element }, pointer, settings, window: new EventTarget() };
  vm.runInNewContext(ts.transpileModule(handlers, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
  const fire = (type, pointerType = 'touch', x = 40, y = 70) => element.dispatchEvent(Object.assign(new Event(type), { pointerType, clientX: x, clientY: y }));
  return { pointer, settings, fire };
}

test('touch down and movement use mouse coordinates, and release restores the loop', () => {
  const { pointer, fire } = inputFixture();
  fire('pointerdown');
  assert.equal(pointer.active, true);
  assert.equal(pointer.x, 30);
  assert.equal(pointer.y, 50);
  fire('pointermove', 'touch', 80, 110);
  assert.equal(pointer.x, 70);
  assert.equal(pointer.y, 90);
  fire('pointerup');
  assert.equal(pointer.active, false);
});

test('native scrolling cancels touch; mouse hover remains active after a click', () => {
  const { pointer, settings, fire } = inputFixture();
  fire('pointerdown');
  fire('pointercancel');
  assert.equal(pointer.active, false);
  fire('pointermove', 'mouse');
  fire('pointerup', 'mouse');
  assert.equal(pointer.active, true);
  fire('pointerleave');
  settings.current.interactive = false;
  fire('pointerdown');
  assert.equal(pointer.active, false);
  assert.match(read('src/styles/atelier.css'), /touch-action: pan-y pinch-zoom/);
  assert.doesNotMatch(read('src/styles/atelier-rework.css'), /\.atelier \.atelier-scene\s*\{\s*pointer-events: none/);
});
