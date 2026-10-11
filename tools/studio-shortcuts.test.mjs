import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const script = readFileSync(new URL('../public/studio-shortcuts.js', import.meta.url), 'utf8');
function setup(hostname = 'slowebdesign.com', pathname = '/') {
  const listeners = new Map(); let toggles = 0;
  class Element { constructor(input = false) { this.input = input; } closest() { return this.input ? this : null; } }
  const window = { dispatchEvent() { toggles++; return false; } };
  window.top = {};
  const document = { readyState: 'loading', addEventListener(name, action) { listeners.set(name, action); } };
  vm.runInNewContext(script, { window, document, location: { hostname, pathname }, Element, Date, CustomEvent: class {} });
  const key = (value, flags = {}, input = false) => {
    let blocked = false;
    listeners.get('keydown')?.({ key: value, target: new Element(input), preventDefault() { blocked = true; }, stopImmediatePropagation() {}, ...flags });
    return blocked;
  };
  return { key, listeners, Element, toggles: () => toggles };
}
for (const [name, key, flags] of [
  ['Windows save', 's', { ctrlKey: true }], ['Mac save', 's', { metaKey: true }],
  ['Windows print', 'p', { ctrlKey: true }], ['Mac print', 'p', { metaKey: true }],
  ['Windows source', 'u', { ctrlKey: true }], ['Mac source', 'u', { metaKey: true, altKey: true }],
  ['Windows inspect', 'i', { ctrlKey: true, shiftKey: true }], ['Mac inspect', 'i', { metaKey: true, altKey: true }],
  ['Function-key inspect', 'F12', {}], ['Windows copy', 'c', { ctrlKey: true }], ['Mac copy', 'c', { metaKey: true }],
]) test(name + ' is intercepted and triggers the theme event', () => {
  const state = setup(); assert.ok(state.key(key, flags)); assert.equal(state.toggles(), 1);
});
test('ordinary typing, paste, and copying form answers still work', () => {
  const state = setup();
  assert.equal(state.key('a'), false);
  assert.equal(state.key('v', { ctrlKey: true }, true), false);
  assert.equal(state.key('c', { metaKey: true }, true), false);
  assert.equal(state.toggles(), 0);
});
test('3DPrintDash app, status subdomain, and hosted status directory are excluded', () => {
  for (const [host, path] of [['www.3dprintdash.com', '/'], ['status.3dprintdash.com', '/'], ['slowebdesign.com', '/3dprintdash/status']]) {
    const state = setup(host, path); assert.equal(state.listeners.size, 0);
  }
});
