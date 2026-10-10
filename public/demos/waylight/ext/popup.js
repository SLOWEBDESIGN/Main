(() => {
  // engine/defaults.js
  var DEFAULTS = {
    enabled: true,
    // --- independent reading modes ---
    // Old stored configs do not contain these keys, so they migrate to the
    // previous behaviour: anchors on, everything else off/default.
    anchorsOn: true,
    lineFocusOn: false,
    font: "default",
    // 'default' | 'clear' | 'dyslexic'
    // --- line focus ---
    lfSensitivity: 1,
    // free: 0.5x to 3x mouse travel
    lfCapture: true,
    // free: capture the mouse only after a reading click
    lfDim: 0.78,
    // Supporter: surrounding-page wash strength
    lfBand: "underline",
    // Supporter: 'underline' | 'tint' | 'none'
    lfFollow: true,
    // Supporter: bright segment follows pointer X
    // --- tier ---
    // Free covers the reading engine and every preset. Supporter unlocks the
    // fine controls and always-on. Never gate the ability to read — only the
    // ability to have the tool remember and personalise.
    pro: false,
    // --- fixation: how much of each word gets bolded ---
    strength: 1,
    // multiplier on the length curve. 0.6 = light, 1.4 = heavy
    // --- chaos: which eligible words get skipped ---
    chaosMode: "jitter",
    // 'off' | 'jitter' | 'saccade'
    chaos: 25,
    // jitter: % of eligible words skipped
    saccadeEvery: 2,
    // saccade: bold 1 word in every N
    // --- which words get anchored at all ---
    wordScope: "every",
    // every word by default; 'smart' and 'length' are optional presets
    // --- strategy (only consulted when wordScope === 'smart') ---
    skipStopwords: true,
    minWordLength: 4,
    // an anchor shorter than this is noise, not signal
    skipHeadings: true,
    // headings already carry emphasis; bolding them fights it
    articleOnly: false,
    // skip nav/aside/header/footer — you scan those, you don't read them
    alwaysBoldFrom: 7,
    // words this long always get bolded
    anchorSentenceStart: true,
    // first word of a sentence is always an anchor
    // --- appearance ---
    emphasis: "weight",
    // 'weight' | 'color'
    boldWeight: 700,
    // 600–900. Sites with heavy body text need 800+
    accent: "#c2410c",
    // used when emphasis === 'color'
    dimTail: false,
    tailOpacity: 0.9
  };
  var PRO_KEYS = /* @__PURE__ */ new Set([
    "wordScope",
    "strength",
    "chaos",
    "chaosMode",
    "saccadeEvery",
    "boldWeight",
    "minWordLength",
    "alwaysBoldFrom",
    "tailOpacity",
    "dimTail",
    "emphasis",
    "accent",
    "skipStopwords",
    "anchorSentenceStart",
    "skipHeadings",
    "articleOnly",
    "lfDim",
    "lfBand",
    "lfFollow"
  ]);
  function normalize(raw = {}) {
    const cfg2 = { ...DEFAULTS, ...raw };
    const num = (v, lo, hi, d) => Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d;
    cfg2.strength = num(cfg2.strength, 0.4, 2, DEFAULTS.strength);
    cfg2.chaos = num(cfg2.chaos, 0, 90, DEFAULTS.chaos);
    cfg2.saccadeEvery = Math.round(num(cfg2.saccadeEvery, 1, 6, DEFAULTS.saccadeEvery));
    cfg2.alwaysBoldFrom = Math.round(num(cfg2.alwaysBoldFrom, 3, 20, DEFAULTS.alwaysBoldFrom));
    cfg2.minWordLength = Math.round(num(cfg2.minWordLength, 1, 8, DEFAULTS.minWordLength));
    cfg2.boldWeight = Math.round(num(cfg2.boldWeight, 500, 900, DEFAULTS.boldWeight));
    cfg2.tailOpacity = num(cfg2.tailOpacity, 0.85, 1, DEFAULTS.tailOpacity);
    cfg2.lfSensitivity = num(cfg2.lfSensitivity, 0.5, 3, DEFAULTS.lfSensitivity);
    cfg2.lfDim = num(cfg2.lfDim, 0.4, 0.95, DEFAULTS.lfDim);
    if (!["off", "jitter", "saccade"].includes(cfg2.chaosMode)) cfg2.chaosMode = DEFAULTS.chaosMode;
    if (!["smart", "every", "length"].includes(cfg2.wordScope)) cfg2.wordScope = DEFAULTS.wordScope;
    if (!["weight", "color"].includes(cfg2.emphasis)) cfg2.emphasis = DEFAULTS.emphasis;
    if (!["default", "clear", "dyslexic"].includes(cfg2.font)) cfg2.font = DEFAULTS.font;
    if (!["underline", "tint", "none"].includes(cfg2.lfBand)) cfg2.lfBand = DEFAULTS.lfBand;
    cfg2.anchorsOn = cfg2.anchorsOn !== false;
    cfg2.lineFocusOn = cfg2.lineFocusOn === true;
    cfg2.lfFollow = cfg2.lfFollow !== false;
    cfg2.lfCapture = cfg2.lfCapture !== false;
    cfg2.pro = cfg2.pro === true;
    return cfg2;
  }

  // engine/presets.js
  var PRESETS = {
    every: {
      label: "Every word",
      note: "A clear starting point for every word",
      cfg: { wordScope: "every", strength: 1, boldWeight: 700, dimTail: false, emphasis: "weight" }
    },
    balanced: {
      label: "Balanced",
      note: "Anchors roughly every 2 words",
      cfg: { wordScope: "smart" }
    },
    light: {
      label: "Light touch",
      note: "Fewer anchors, only on words that carry meaning",
      cfg: { wordScope: "smart", chaos: 45, strength: 0.8, alwaysBoldFrom: 9, minWordLength: 5 }
    },
    sparse: {
      label: "Sparse",
      note: "Fewest anchors, each one heavier",
      cfg: {
        wordScope: "smart",
        chaos: 60,
        strength: 0.9,
        alwaysBoldFrom: 8,
        minWordLength: 6,
        anchorSentenceStart: false,
        boldWeight: 800
      }
    },
    even: {
      label: "Even rhythm",
      note: "Every other word, short ones included",
      cfg: {
        wordScope: "smart",
        chaosMode: "saccade",
        saccadeEvery: 2,
        skipStopwords: false,
        anchorSentenceStart: false,
        alwaysBoldFrom: 99,
        minWordLength: 1,
        skipHeadings: false,
        strength: 1
      }
    }
  };
  var PRESET_KEYS = Object.keys(PRESETS);

  // engine/browser-api.js
  var api = globalThis.browser ?? globalThis.chrome;
  function callbackFallback(fn, ...args) {
    return new Promise((resolve, reject) => {
      try {
        fn(...args, (value) => {
          const err = api.runtime?.lastError;
          if (err) reject(new Error(err.message));
          else resolve(value);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  function dual(fn, thisArg, ...args) {
    try {
      const maybe = fn.apply(thisArg, args);
      if (maybe && typeof maybe.then === "function") return maybe;
    } catch {
    }
    return callbackFallback(fn.bind(thisArg), ...args);
  }
  var storageGet = (keys = null) => dual(api.storage.local.get, api.storage.local, keys);
  var storageSet = (obj) => dual(api.storage.local.set, api.storage.local, obj);
  async function activeTab() {
    try {
      const tabs = await dual(api.tabs.query, api.tabs, { active: true, currentWindow: true });
      return tabs?.[0] || null;
    } catch {
      return null;
    }
  }
  async function createTab(url) {
    if (!url || !api.tabs?.create) return null;
    try {
      return await dual(api.tabs.create, api.tabs, { url });
    } catch {
      return null;
    }
  }
  async function syncActiveTab(message = { type: "waylight-sync" }) {
    const tab = await activeTab();
    if (!tab?.id || !api.tabs?.sendMessage) return false;
    try {
      await dual(api.tabs.sendMessage, api.tabs, tab.id, message);
      return true;
    } catch {
      return false;
    }
  }
  async function reloadActiveTab() {
    const tab = await activeTab();
    if (!tab?.id || !api.tabs?.reload) return false;
    try {
      await dual(api.tabs.reload, api.tabs, tab.id);
      return true;
    } catch {
      return false;
    }
  }
  async function activeTabHost() {
    try {
      const tabs = await dual(api.tabs.query, api.tabs, { active: true, currentWindow: true });
      const url = tabs?.[0]?.url;
      return url ? new URL(url).hostname : "";
    } catch {
      return "";
    }
  }

  // engine/license.js
  var PROVIDER = {
    name: "Lemon Squeezy",
    activateUrl: "https://api.lemonsqueezy.com/v1/licenses/activate",
    validateUrl: "https://api.lemonsqueezy.com/v1/licenses/validate",
    buyUrl: "https://waylight.lemonsqueezy.com/checkout/buy/64dfaca0-3976-474e-b059-dc741d77f30d"
  };
  var GRACE_DAYS = 14;
  var RECHECK_AFTER_DAYS = 3;
  var DAY = 864e5;
  var isKeyShaped = (k) => typeof k === "string" && k.trim().length >= 8;
  async function post(url, params) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(params).toString()
    });
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  async function activate(key, instanceName = "Waylight") {
    if (!isKeyShaped(key)) return { valid: false, error: "That does not look like a licence key." };
    try {
      const data = await post(PROVIDER.activateUrl, {
        license_key: key.trim(),
        instance_name: instanceName
      });
      if (!data.activated && !data.valid) {
        return { valid: false, error: data.error || "That key was not accepted." };
      }
      return {
        valid: true,
        instanceId: data.instance?.id || "",
        expiresAt: data.license_key?.expires_at || null
      };
    } catch (e) {
      return { valid: false, offline: true, error: "Could not reach the licence server. Check your connection and try again." };
    }
  }
  async function validate(key, instanceId) {
    if (!isKeyShaped(key)) return { valid: false, error: "No licence key stored." };
    try {
      const params = { license_key: key.trim() };
      if (instanceId) params.instance_id = instanceId;
      const data = await post(PROVIDER.validateUrl, params);
      return {
        valid: !!data.valid,
        error: data.valid ? null : data.error || "Licence is no longer valid.",
        expiresAt: data.license_key?.expires_at || null
      };
    } catch {
      return { valid: false, offline: true, error: "offline" };
    }
  }
  function assess(license2, now = Date.now()) {
    if (!license2 || !license2.key) return { pro: false, shouldRecheck: false, reason: "none" };
    if (license2.valid === false) return { pro: false, shouldRecheck: true, reason: "revoked" };
    const checkedAt = Number(license2.checkedAt) || 0;
    const age = now - checkedAt;
    if (license2.expiresAt) {
      const exp = Date.parse(license2.expiresAt);
      if (Number.isFinite(exp) && now > exp) {
        return { pro: false, shouldRecheck: true, reason: "expired" };
      }
    }
    if (age > GRACE_DAYS * DAY) {
      return { pro: false, shouldRecheck: true, reason: "stale" };
    }
    return {
      pro: true,
      shouldRecheck: age > RECHECK_AFTER_DAYS * DAY,
      reason: age > RECHECK_AFTER_DAYS * DAY ? "due" : "fresh"
    };
  }

  // entries/popup.js
  var $ = (id) => document.getElementById(id);
  var mobileUI = matchMedia("(pointer: coarse)").matches;
  document.documentElement.classList.toggle("mobile-popup", mobileUI);
  var SLIDERS = ["lfSensitivity", "strength", "chaos", "boldWeight", "minWordLength", "alwaysBoldFrom", "tailOpacity", "lfDim"];
  var CHECKS = ["anchorsOn", "lineFocusOn", "lfCapture", "skipStopwords", "anchorSentenceStart", "skipHeadings", "articleOnly", "dimTail", "lfFollow"];
  var SELECTS = ["font", "wordScope", "chaosMode", "emphasis", "lfBand"];
  var globalCfg = normalize({});
  var cfg = normalize({});
  var license = null;
  var sites = {};
  var siteConfigs = {};
  var customSite = false;
  var defaultOn = false;
  var host = "";
  var READER_URL = "https://waylight.netlify.app/reader.html";
  function pdfUrlFromTab(tab) {
    if (!tab?.url) return null;
    try {
      const url = new URL(tab.url);
      if (!/^https?:$/.test(url.protocol)) return null;
      return /\.pdf$/i.test(url.pathname) || /(?:^|[?&])(?:format|type)=pdf(?:&|$)/i.test(url.search) ? url.href : null;
    } catch {
      return null;
    }
  }
  async function openPdfReader(tab) {
    const pdfUrl = pdfUrlFromTab(tab);
    if (!pdfUrl) return false;
    return !!await createTab(`${READER_URL}#pdf=${encodeURIComponent(pdfUrl)}`);
  }
  function note(message = "") {
    $("note").textContent = message;
    $("note").style.display = message ? "block" : "none";
  }
  function withoutEntitlement(value) {
    const clean = { ...value };
    delete clean.pro;
    return clean;
  }
  function siteOn() {
    return host in sites ? sites[host] : defaultOn;
  }
  function effectiveCfg(pro = assess(license).pro) {
    return normalize({ ...globalCfg, ...pro && siteConfigs[host] ? siteConfigs[host] : {}, pro });
  }
  async function save() {
    try {
      await storageSet({ cfg: withoutEntitlement(globalCfg), sites, siteConfigs, defaultOn, license });
      note();
    } catch (error) {
      note(`Could not save settings: ${error?.message || error}`);
    }
  }
  function storeCurrentCfg() {
    if (customSite) siteConfigs[host] = withoutEntitlement(cfg);
    else globalCfg = normalize({ ...withoutEntitlement(cfg), pro: cfg.pro });
  }
  function renderPresets() {
    for (const [key, preset] of Object.entries(PRESETS)) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.preset = key;
      const label = document.createElement("span");
      label.textContent = preset.label;
      const noteText = document.createElement("small");
      noteText.textContent = preset.note;
      button.append(label, noteText);
      $("presets").append(button);
    }
  }
  function paintLicense() {
    const verdict = assess(license);
    $("lic-form").hidden = verdict.pro;
    $("lic-active").hidden = !verdict.pro;
    $("lic-buy").href = PROVIDER.buyUrl;
    $("lic-status").classList.toggle("ok", verdict.pro);
    $("lic-status").textContent = verdict.pro ? "Thank you. You fund the free desktop tools." : verdict.reason === "expired" ? "That license has expired." : verdict.reason === "revoked" ? "That license is no longer valid." : verdict.reason === "stale" ? "Reconnect so Waylight can confirm this license." : "";
  }
  function paintTier() {
    const locked = !cfg.pro;
    for (const wrapper of document.querySelectorAll("[data-pro]")) wrapper.classList.toggle("locked", locked);
    for (const key of PRO_KEYS) if ($(key)) $(key).disabled = locked;
  }
  function paint() {
    if (mobileUI) cfg.lineFocusOn = false;
    const on = siteOn();
    $("host").textContent = host || "this page";
    $("power").checked = on;
    $("power-label").textContent = on ? "On for this site" : "Off for this site";
    document.querySelectorAll(".dimmable").forEach((el) => {
      el.style.opacity = "1";
    });
    for (const key of SLIDERS) {
      $(key).value = cfg[key];
      $("v-" + key).textContent = key === "lfDim" ? `${Math.round(cfg[key] * 100)}%` : cfg[key];
    }
    for (const key of CHECKS) $(key).checked = !!cfg[key];
    for (const key of SELECTS) $(key).value = cfg[key];
    $("accent").value = cfg.accent;
    $("card-anchors").classList.toggle("on", on && cfg.anchorsOn);
    $("card-line").classList.toggle("on", on && cfg.lineFocusOn);
    $("sensitivity-row").style.display = cfg.lineFocusOn ? "block" : "none";
    $("everywhere-btn").classList.toggle("on", defaultOn);
    $("everywhere-title").textContent = defaultOn ? "On for all pages" : "Turn on for all pages";
    $("everywhere-sub").textContent = defaultOn ? "Runs everywhere except sites you switch off" : "New sites stay off until you switch them on";
    $("site-settings").classList.toggle("on", customSite);
    $("site-settings-title").textContent = customSite ? "Using settings for this site" : "Remember settings for this site";
    $("site-settings-sub").textContent = customSite ? "Changes here will stay on this site" : "Keep a different setup here";
    for (const button of document.querySelectorAll("[data-preset]")) {
      const preset = normalize({ ...DEFAULTS, ...PRESETS[button.dataset.preset].cfg });
      const keys = ["wordScope", "chaosMode", "chaos", "strength", "minWordLength", "alwaysBoldFrom"];
      button.classList.toggle("active", keys.every((key) => preset[key] === cfg[key]));
    }
    paintTier();
    paintLicense();
  }
  function bind() {
    $("power").addEventListener("change", async (event) => {
      sites[host] = event.target.checked;
      await save();
      paint();
      const synced = await syncActiveTab();
      if (!synced && event.target.checked) {
        const tab = await activeTab();
        if (await openPdfReader(tab)) {
          note("This PDF uses the browser viewer. Waylight opened a separate Reader tab and left the original untouched.");
          return;
        }
      }
      if (!synced && event.target.checked && confirm("Waylight is not loaded on this page yet. Reload the page to start it?")) {
        await reloadActiveTab();
      } else if (!synced && event.target.checked) {
        note("Waylight is enabled for this site. Reload this page when you are ready.");
      }
    });
    for (const key of [...SLIDERS, ...CHECKS, ...SELECTS, "accent"]) {
      $(key).addEventListener("input", async (event) => {
        if (PRO_KEYS.has(key) && !cfg.pro) return;
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        cfg = normalize({ ...cfg, [key]: value });
        storeCurrentCfg();
        await save();
        paint();
      });
    }
    $("presets").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-preset]");
      if (!button) return;
      cfg = normalize({ ...cfg, ...PRESETS[button.dataset.preset].cfg });
      storeCurrentCfg();
      await save();
      paint();
    });
    $("everywhere-btn").addEventListener("click", async () => {
      if (!cfg.pro) {
        note("Always-on is included with the one-time Supporter unlock.");
        return;
      }
      defaultOn = !defaultOn;
      delete sites[host];
      await save();
      paint();
    });
    $("site-settings").addEventListener("click", async () => {
      if (!cfg.pro) {
        note("Per-site settings are included with the one-time Supporter unlock.");
        return;
      }
      if (customSite) {
        delete siteConfigs[host];
        customSite = false;
        cfg = effectiveCfg(true);
      } else {
        siteConfigs[host] = withoutEntitlement(cfg);
        customSite = true;
      }
      await save();
      paint();
    });
    $("reset").addEventListener("click", async () => {
      cfg = normalize({ ...DEFAULTS, pro: cfg.pro });
      storeCurrentCfg();
      await save();
      paint();
    });
    $("lic-activate").addEventListener("click", async () => {
      const key = $("lic-key").value.trim();
      $("lic-activate").disabled = true;
      $("lic-status").textContent = "Checking\u2026";
      const result = await activate(key);
      $("lic-activate").disabled = false;
      if (!result.valid) {
        $("lic-status").textContent = result.error;
        return;
      }
      license = { key, instanceId: result.instanceId, valid: true, checkedAt: Date.now(), expiresAt: result.expiresAt };
      cfg = effectiveCfg(true);
      await save();
      $("lic-key").value = "";
      paint();
    });
    $("lic-remove").addEventListener("click", async () => {
      license = null;
      defaultOn = false;
      customSite = false;
      cfg = effectiveCfg(false);
      await save();
      paint();
    });
  }
  renderPresets();
  bind();
  paint();
  (async () => {
    try {
      const stored = await storageGet(null);
      globalCfg = normalize(stored?.cfg || {});
      sites = stored?.sites || {};
      siteConfigs = stored?.siteConfigs || {};
      defaultOn = stored?.defaultOn === true;
      license = stored?.license || null;
    } catch (error) {
      note(`Settings could not be loaded. ${error?.message || error}`);
    }
    host = await activeTabHost();
    const verdict = assess(license);
    customSite = verdict.pro && !!siteConfigs[host];
    cfg = effectiveCfg(verdict.pro);
    if (mobileUI && cfg.lineFocusOn) {
      cfg = normalize({ ...cfg, lineFocusOn: false });
      storeCurrentCfg();
      await save();
    }
    paint();
    if (license?.key && verdict.shouldRecheck) {
      const result = await validate(license.key, license.instanceId);
      if (!result.offline) {
        license = { ...license, valid: result.valid, checkedAt: Date.now(), expiresAt: result.expiresAt };
        if (!result.valid) defaultOn = false;
        customSite = result.valid && !!siteConfigs[host];
        cfg = effectiveCfg(result.valid);
        await save();
        paint();
      }
    }
  })();
})();
