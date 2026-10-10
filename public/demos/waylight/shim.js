// The browser-extension API for one frame of the demo, backed by the parent's hub.
// Loaded before Waylight's own popup.js or content.js, which read `browser` first.
(() => {
  const hub = window.parent && window.parent !== window ? window.parent.__waylightHub : null;
  // Opened on its own there is no extension to talk to; Waylight stays inert, as it
  // does in a sandboxed frame.
  if (!hub) return;
  const extBase = new URL('ext/', document.currentScript.src).href;
  const owner = window;
  globalThis.browser = {
    runtime: {
      getURL: (file) => new URL(file, extBase).href,
      onMessage: { addListener: (listener) => hub.onMessage(listener, owner) },
      sendMessage: async () => undefined,
    },
    storage: {
      local: {
        get: async (keys) => hub.get(keys),
        set: async (values) => hub.set(values),
      },
      onChanged: { addListener: (listener) => hub.onChanged(listener, owner) },
    },
    tabs: {
      query: async () => [hub.tab()],
      sendMessage: async (_tabId, message) => hub.sendToPage(message),
      reload: async () => hub.reloadPage(),
      create: async ({ url }) => {
        window.open(url, '_blank', 'noopener');
        return { id: 2, url };
      },
    },
  };
})();
