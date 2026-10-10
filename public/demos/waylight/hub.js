// One in-memory extension store, shared by the popup frame and the page frame.
// In the real browser this is chrome.storage plus tab messaging; here the demo
// page plays that role so the unmodified popup can drive the unmodified engine.
(() => {
  const store = {};
  const changeListeners = [];
  const messageListeners = [];
  const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const pageFrame = () => document.getElementById('waylight-page');

  window.__waylightHub = {
    get(keys) {
      const all = clone(store) || {};
      if (keys == null) return all;
      const wanted = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      const defaults = typeof keys === 'object' && !Array.isArray(keys) ? keys : {};
      const result = {};
      for (const key of wanted) {
        if (key in all) result[key] = all[key];
        else if (key in defaults) result[key] = defaults[key];
      }
      return result;
    },
    set(values) {
      const changes = {};
      for (const [key, value] of Object.entries(clone(values) || {})) {
        changes[key] = { oldValue: clone(store[key]), newValue: clone(value) };
        store[key] = value;
      }
      for (const { listener } of [...changeListeners]) {
        try { listener(clone(changes), 'local'); } catch (error) { console.warn('Waylight demo listener failed', error); }
      }
    },
    onChanged(listener, owner) { changeListeners.push({ listener, owner }); },
    onMessage(listener, owner) { messageListeners.push({ listener, owner }); },
    async sendToPage(message) {
      let reply;
      for (const { listener } of [...messageListeners]) {
        await new Promise((resolve) => {
          let settled = false;
          const respond = (value) => { if (!settled) { settled = true; reply = value; resolve(); } };
          const keepOpen = listener(message, { id: 'waylight-demo' }, respond);
          if (keepOpen !== true) respond(undefined);
          setTimeout(() => respond(undefined), 600);
        });
      }
      return reply;
    },
    tab() {
      const frame = pageFrame();
      const url = frame && frame.contentWindow ? frame.contentWindow.location.href : location.href;
      return { id: 1, active: true, url };
    },
    reloadPage() {
      const frame = pageFrame();
      if (!frame || !frame.contentWindow) return;
      // The reloaded page registers fresh listeners when the content script boots again.
      const owner = frame.contentWindow;
      for (const list of [changeListeners, messageListeners]) {
        for (let i = list.length - 1; i >= 0; i -= 1) if (list[i].owner === owner) list.splice(i, 1);
      }
      frame.contentWindow.location.reload();
    },
  };

  // Turned on for this page, which is what the popup shows after someone clicks
  // "on for this site" in the real extension.
  window.__waylightHub.set({ sites: { [location.hostname]: true } });
})();
