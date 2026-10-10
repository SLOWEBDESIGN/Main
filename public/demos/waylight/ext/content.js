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
  function normalize(raw = {}) {
    const cfg = { ...DEFAULTS, ...raw };
    const num = (v, lo, hi, d) => Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d;
    cfg.strength = num(cfg.strength, 0.4, 2, DEFAULTS.strength);
    cfg.chaos = num(cfg.chaos, 0, 90, DEFAULTS.chaos);
    cfg.saccadeEvery = Math.round(num(cfg.saccadeEvery, 1, 6, DEFAULTS.saccadeEvery));
    cfg.alwaysBoldFrom = Math.round(num(cfg.alwaysBoldFrom, 3, 20, DEFAULTS.alwaysBoldFrom));
    cfg.minWordLength = Math.round(num(cfg.minWordLength, 1, 8, DEFAULTS.minWordLength));
    cfg.boldWeight = Math.round(num(cfg.boldWeight, 500, 900, DEFAULTS.boldWeight));
    cfg.tailOpacity = num(cfg.tailOpacity, 0.85, 1, DEFAULTS.tailOpacity);
    cfg.lfSensitivity = num(cfg.lfSensitivity, 0.5, 3, DEFAULTS.lfSensitivity);
    cfg.lfDim = num(cfg.lfDim, 0.4, 0.95, DEFAULTS.lfDim);
    if (!["off", "jitter", "saccade"].includes(cfg.chaosMode)) cfg.chaosMode = DEFAULTS.chaosMode;
    if (!["smart", "every", "length"].includes(cfg.wordScope)) cfg.wordScope = DEFAULTS.wordScope;
    if (!["weight", "color"].includes(cfg.emphasis)) cfg.emphasis = DEFAULTS.emphasis;
    if (!["default", "clear", "dyslexic"].includes(cfg.font)) cfg.font = DEFAULTS.font;
    if (!["underline", "tint", "none"].includes(cfg.lfBand)) cfg.lfBand = DEFAULTS.lfBand;
    cfg.anchorsOn = cfg.anchorsOn !== false;
    cfg.lineFocusOn = cfg.lineFocusOn === true;
    cfg.lfFollow = cfg.lfFollow !== false;
    cfg.lfCapture = cfg.lfCapture !== false;
    cfg.pro = cfg.pro === true;
    return cfg;
  }

  // engine/stopwords.js
  var STOPWORDS = /* @__PURE__ */ new Set([
    // articles
    "a",
    "an",
    "the",
    // coordinating conjunctions (bleached ones only)
    "and",
    "or",
    "but",
    "so",
    "yet",
    // prepositions with little standalone content
    "of",
    "in",
    "on",
    "at",
    "to",
    "by",
    "as",
    "into",
    "onto",
    "from",
    "with",
    "for",
    "up",
    "out",
    "off",
    // be-verbs
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "am",
    "isn't",
    "aren't",
    // bleached auxiliaries (modals excluded — they carry meaning)
    "do",
    "does",
    "did",
    "has",
    "have",
    "had",
    // pronouns & determiners
    "i",
    "it",
    "its",
    "it's",
    "he",
    "she",
    "him",
    "her",
    "his",
    "hers",
    "they",
    "them",
    "their",
    "theirs",
    "we",
    "us",
    "our",
    "ours",
    "you",
    "your",
    "yours",
    "my",
    "mine",
    "me",
    "this",
    "that",
    "these",
    "those",
    // misc high-frequency glue
    "there",
    "here",
    "then",
    "than",
    "too",
    "very",
    "just",
    "also"
  ]);

  // engine/policy.js
  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  var KEYWORDS = /* @__PURE__ */ new Set([
    "no",
    "not",
    "nor",
    "non",
    "none",
    "never",
    "cannot",
    "all",
    "any",
    "few",
    "each",
    "every",
    "both",
    "most",
    "some",
    "only",
    "may",
    "can",
    "must",
    "unless"
  ]);
  var HAS_DIGIT = /\d/;
  var HAS_LETTER = new RegExp("\\p{L}", "u");
  function isAcronym(word) {
    return word.length >= 4 && word === word.toUpperCase() && HAS_LETTER.test(word);
  }
  var SKIP = 0;
  var HEAD = 1;
  var FULL = 2;
  function classify(word, index, ctx, cfg) {
    const lower = word.toLowerCase();
    const len = word.length;
    if (HAS_DIGIT.test(word)) return FULL;
    if (isAcronym(word)) return FULL;
    if (cfg.wordScope === "every") return HEAD;
    if (cfg.wordScope === "length") return len >= cfg.minWordLength ? HEAD : SKIP;
    if (len <= 1) return SKIP;
    if (KEYWORDS.has(lower)) return len <= 3 ? FULL : HEAD;
    if (cfg.skipStopwords && STOPWORDS.has(lower)) return SKIP;
    if (len < cfg.minWordLength) return SKIP;
    if (cfg.anchorSentenceStart && ctx.sentenceStart) return HEAD;
    if (len >= cfg.alwaysBoldFrom) return HEAD;
    if (cfg.chaosMode === "off" || cfg.chaos <= 0) return HEAD;
    if (cfg.chaosMode === "saccade") return index % cfg.saccadeEvery === 0 ? HEAD : SKIP;
    return hash32(lower + "#" + index) % 100 >= cfg.chaos ? HEAD : SKIP;
  }

  // engine/fixation.js
  var WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
  var ENDS_SENTENCE = /[.!?:;…]["'’)\]]?\s*$/;
  var ENDS_LINE = /\n\s*$/;
  var STARTS_UPPER = /^[\p{Lu}]/u;
  function fixationLength(len, strength = 1) {
    let n;
    if (len <= 3) n = 1;
    else if (len <= 6) n = 2;
    else if (len <= 8) n = 3;
    else if (len <= 10) n = 4;
    else n = Math.ceil(len * 0.4);
    n = Math.round(n * strength);
    return Math.max(1, Math.min(n, Math.max(1, len - 1)));
  }
  function segment(text, cfg, opts = {}) {
    const parts = [];
    const push = (t, bold) => {
      if (!t) return;
      const prev = parts[parts.length - 1];
      if (prev && prev.bold === bold) prev.text += t;
      else parts.push({ text: t, bold });
    };
    let last = 0;
    let index = 0;
    let sentenceStart = true;
    let m;
    WORD_RE.lastIndex = 0;
    while ((m = WORD_RE.exec(text)) !== null) {
      const word = m[0];
      const gap = text.slice(last, m.index);
      push(gap, false);
      if (index === 0) {
        sentenceStart = STARTS_UPPER.test(word);
      } else {
        sentenceStart = ENDS_SENTENCE.test(gap) || ENDS_LINE.test(gap);
      }
      const midWord = index === 0 && m.index === 0 && opts.continuesWord;
      const kind = midWord ? SKIP : classify(word, index, { sentenceStart }, cfg);
      if (kind === FULL) {
        push(word, true);
      } else if (kind !== SKIP) {
        const n = fixationLength(word.length, cfg.strength);
        push(word.slice(0, n), true);
        push(word.slice(n), false);
      } else {
        push(word, false);
      }
      last = m.index + word.length;
      index++;
    }
    push(text.slice(last), false);
    return parts;
  }

  // dom/apply.js
  var TAG = "rb-t";
  var TAG_UPPER = "RB-T";
  var HEAD_CLASS = "rb-h";
  var TAIL_CLASS = "rb-d";
  var STYLE_ID = "rb-style";
  var SKIP_TAGS = /* @__PURE__ */ new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "OPTION",
    "CODE",
    "PRE",
    "KBD",
    "SAMP",
    "VAR",
    "SVG",
    "MATH",
    "CANVAS",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "VIDEO",
    "AUDIO",
    "TITLE",
    "HEAD",
    TAG_UPPER
  ]);
  function css(cfg) {
    const emphasis = cfg.emphasis === "color" ? `font-weight:${Math.max(700, cfg.boldWeight)};color:${cfg.accent};` : `font-weight:${Math.max(700, cfg.boldWeight)};`;
    return `
${TAG}{display:inline;}
${TAG} b.${HEAD_CLASS}{${emphasis}text-shadow:-.35px 0 currentColor,.35px 0 currentColor,0 -.2px currentColor,0 .2px currentColor;-webkit-text-stroke:.08px currentColor}
${TAG} span.${TAIL_CLASS}{opacity:${cfg.dimTail ? cfg.tailOpacity : 1};}
`;
  }
  function injectStyle(cfg, doc = document) {
    let el = doc.getElementById(STYLE_ID);
    if (!el) {
      el = doc.createElement("style");
      el.id = STYLE_ID;
      (doc.head || doc.documentElement).appendChild(el);
    }
    el.textContent = css(cfg);
  }
  function removeStyle(doc = document) {
    doc.getElementById(STYLE_ID)?.remove();
  }
  function isInsideOurs(node) {
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !!(el && typeof el.closest === "function" && el.closest(TAG));
  }
  function isEditable(node) {
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !!(el && el.isContentEditable);
  }
  var WORD_CONTINUE_CHAR = /[\p{L}\p{N}'’-]/u;
  var MAX_BOUNDARY_WALK = 8;
  function continuesWord(textNode) {
    const first = textNode.data[0];
    if (!first || !WORD_CONTINUE_CHAR.test(first)) return false;
    let node = textNode;
    for (let steps = 0; steps < MAX_BOUNDARY_WALK; steps++) {
      const prev = node.previousSibling;
      if (prev) {
        if (prev.nodeName === "BR") return false;
        const text = prev.nodeType === Node.TEXT_NODE ? prev.data : prev.textContent;
        if (text) return WORD_CONTINUE_CHAR.test(text.slice(-1));
        node = prev;
        continue;
      }
      const parent = node.parentNode;
      if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return false;
      node = parent;
    }
    return false;
  }
  var HEADING_TAGS = /* @__PURE__ */ new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
  var CHROME_TAGS = /* @__PURE__ */ new Set(["NAV", "ASIDE", "HEADER", "FOOTER"]);
  function collectTextNodes(root, cfg = {}, limit = Infinity) {
    const skipTag = (t) => cfg.skipHeadings && HEADING_TAGS.has(t) || cfg.articleOnly && CHROME_TAGS.has(t);
    if (!root) return [];
    if (root.nodeType === Node.ELEMENT_NODE && (SKIP_TAGS.has(root.tagName) || skipTag(root.tagName))) return [];
    if (isInsideOurs(root)) return [];
    if (isEditable(root)) return [];
    if (root.nodeType === Node.TEXT_NODE) {
      return root.data && root.data.trim().length >= 1 ? [root] : [];
    }
    const out = [];
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (SKIP_TAGS.has(node.tagName) || skipTag(node.tagName)) return NodeFilter.FILTER_REJECT;
            if (cfg.articleOnly && node.getAttribute?.("role") === "navigation") return NodeFilter.FILTER_REJECT;
            if (node.isContentEditable) return NodeFilter.FILTER_REJECT;
            if (node.matches("button,label,[data-waylight-controls],[data-waylight-line-focus]")) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_SKIP;
          }
          if (node.parentElement?.isContentEditable) return NodeFilter.FILTER_REJECT;
          return node.data && node.data.trim().length >= 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );
    let n;
    while ((n = walker.nextNode()) && out.length < limit) out.push(n);
    return out;
  }
  function decorate(textNode, cfg) {
    const parent = textNode.parentNode;
    if (!parent || parent.nodeName === TAG_UPPER) return;
    if (parent.isContentEditable) return;
    const parts = segment(textNode.data, cfg, { continuesWord: continuesWord(textNode) });
    if (!parts.some((p) => p.bold)) return;
    const wrap = document.createElement(TAG);
    for (const p of parts) {
      if (p.bold) {
        const b = document.createElement("b");
        b.className = HEAD_CLASS;
        b.textContent = p.text;
        wrap.appendChild(b);
      } else if (cfg.dimTail && p.text.trim()) {
        const s = document.createElement("span");
        s.className = TAIL_CLASS;
        s.textContent = p.text;
        wrap.appendChild(s);
      } else {
        wrap.appendChild(document.createTextNode(p.text));
      }
    }
    parent.replaceChild(wrap, textNode);
  }
  function revertAll(root = document.body) {
    if (!root) return 0;
    const wraps = root.querySelectorAll ? root.querySelectorAll(TAG) : [];
    const parents = /* @__PURE__ */ new Set();
    for (const el of wraps) {
      if (el.parentNode) parents.add(el.parentNode);
      el.replaceWith(document.createTextNode(el.textContent));
    }
    for (const p of parents) p.normalize();
    return wraps.length;
  }
  function applyTo(root, cfg) {
    const nodes = collectTextNodes(root, cfg);
    for (const n of nodes) decorate(n, cfg);
    return nodes.length;
  }

  // dom/visual-anchors.js
  var STYLE_ID2 = "waylight-visual-anchor-style";
  var ANCHOR_NAME = "waylight-word-anchors";
  var TAIL_NAME = "waylight-word-tails";
  var nextInstance = 0;
  function supported(doc) {
    const view = doc.defaultView;
    return !!(view?.Highlight && view?.CSS?.highlights);
  }
  function styleText(cfg) {
    const accent = cfg.emphasis === "color" && /^#[\da-f]{6}$/i.test(cfg.accent) ? `color:${cfg.accent};` : "color:currentColor;";
    const spread = Math.max(0.45, Math.min(1.05, (Math.max(700, cfg.boldWeight) - 500) / 400));
    const tail = Math.round(Math.max(0.85, cfg.tailOpacity) * 100);
    return `
::highlight(${ANCHOR_NAME}){
  ${accent}
  text-shadow:-${spread}px 0 currentColor,${spread}px 0 currentColor,0 -${spread / 2}px currentColor,0 ${spread / 2}px currentColor;
}
::highlight(${TAIL_NAME}){
  color:color-mix(in srgb,currentColor ${tail}%,transparent);
}`;
  }
  function rangesFor(nodes, cfg, doc) {
    const anchors = [];
    const tails = [];
    const text = nodes.map((node) => node.data).join("");
    let offset = 0;
    for (const part of segment(text, cfg)) {
      const end = offset + part.text.length;
      if (end > offset && (part.bold || cfg.dimTail && part.text.trim())) {
        let base = 0;
        for (const node of nodes) {
          const startInNode = Math.max(0, offset - base);
          const endInNode = Math.min(node.length, end - base);
          if (endInNode > startInNode) {
            const range = doc.createRange();
            range.setStart(node, startInNode);
            range.setEnd(node, endInNode);
            (part.bold ? anchors : tails).push(range);
          }
          base += node.length;
          if (base >= end) break;
        }
      }
      offset = end;
    }
    return { anchors, tails };
  }
  function createVisualAnchors(getCfg, doc = document, root = null, options = {}) {
    const suffix = "-" + ++nextInstance;
    const styleId = STYLE_ID2 + suffix, anchorName = ANCHOR_NAME + suffix, tailName = TAIL_NAME + suffix;
    let tailNames = [];
    let running = false;
    let observer = null;
    let frame = 0;
    let domFallback = false;
    function clear() {
      doc.defaultView?.CSS?.highlights?.delete(anchorName);
      for (const name of tailNames) doc.defaultView?.CSS?.highlights?.delete(name);
      tailNames = [];
      doc.getElementById(styleId)?.remove();
    }
    function paint() {
      frame = 0;
      const scope = root || doc.body;
      if (!running || !scope || domFallback) return;
      const cfg = getCfg();
      const anchorRanges = [];
      const tailRanges = [];
      const runs = [];
      let block = null, previous = null;
      for (const node of collectTextNodes(scope, cfg)) {
        const owner = node.parentElement.closest("p,li,h1,h2,h3,h4,h5,h6,div,td,article,section") || scope;
        const gap = doc.createRange();
        if (previous) {
          gap.setStartAfter(previous);
          gap.setEndBefore(node);
        }
        if (owner !== block || !previous || gap.toString() || gap.cloneContents().querySelector?.("br,input,textarea,[contenteditable]")) runs.push([]);
        runs[runs.length - 1].push(node);
        block = owner;
        previous = node;
      }
      for (const nodes of runs) {
        const ranges = rangesFor(nodes, cfg, doc);
        anchorRanges.push(...ranges.anchors);
        tailRanges.push(...ranges.tails);
      }
      let style = doc.getElementById(styleId);
      if (!style) {
        style = doc.createElement("style");
        style.id = styleId;
        (doc.head || doc.documentElement).appendChild(style);
      }
      style.textContent = styleText(cfg).replaceAll(ANCHOR_NAME, anchorName).replaceAll(TAIL_NAME, tailName);
      const view = doc.defaultView;
      const anchors = new view.Highlight();
      for (const range of anchorRanges) anchors.add(range);
      view.CSS.highlights.set(anchorName, anchors);
      for (const name of tailNames) view.CSS.highlights.delete(name);
      tailNames = [];
      if (cfg.dimTail) {
        const colors = /* @__PURE__ */ new Map();
        for (const range of tailRanges) {
          const color = view.getComputedStyle(range.startContainer.parentElement).color;
          if (!colors.has(color)) colors.set(color, new view.Highlight());
          colors.get(color).add(range);
        }
        for (const [color, highlight] of colors) {
          const name = tailName + "-" + tailNames.length;
          tailNames.push(name);
          view.CSS.highlights.set(name, highlight);
          style.textContent += `
::highlight(${name}){color:color-mix(in srgb,${color} ${Math.round(Math.max(0.85, cfg.tailOpacity) * 100)}%,transparent)}`;
        }
      }
    }
    function schedule() {
      if (!running || frame) return;
      frame = doc.defaultView.requestAnimationFrame(paint);
    }
    return {
      start() {
        if (running) return;
        running = true;
        const scope = root || doc.body;
        domFallback = options.domFallback === true || !supported(doc);
        if (domFallback) {
          injectStyle(getCfg(), doc);
          applyTo(scope, getCfg());
          return;
        }
        paint();
        observer = new MutationObserver(schedule);
        observer.observe(scope, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "data-waylight-font"] });
      },
      stop() {
        running = false;
        observer?.disconnect();
        observer = null;
        if (frame) doc.defaultView.cancelAnimationFrame(frame);
        frame = 0;
        if (domFallback) {
          revertAll(root || doc.body);
          removeStyle(doc);
          domFallback = false;
        }
        clear();
      },
      refresh() {
        if (!running) return;
        if (domFallback) {
          const scope = root || doc.body;
          revertAll(scope);
          injectStyle(getCfg(), doc);
          applyTo(scope, getCfg());
          return;
        }
        paint();
      },
      isRunning: () => running,
      isSupported: () => supported(doc)
    };
  }

  // dom/font.js
  var STYLE_ID3 = "waylight-font-style";
  var ROOT_ATTR = "data-waylight-font";
  var nextStyle = 0;
  var READABLE = [
    "body",
    "main",
    "article",
    "section",
    "aside",
    "p",
    "li",
    "dt",
    "dd",
    "blockquote",
    "figcaption",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td"
  ].join(",");
  function extensionUrl(path) {
    try {
      const runtime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime;
      return runtime?.getURL ? runtime.getURL(path) : new URL(path, location.hostname === "waylight.netlify.app" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? document.baseURI : "https://waylight.netlify.app/").href;
    } catch {
      return path;
    }
  }
  function stylesheet(scoped = false) {
    const regular = extensionUrl("fonts/OpenDyslexic-Regular.woff2");
    const bold = extensionUrl("fonts/OpenDyslexic-Bold.woff2");
    const root = scoped ? `[${ROOT_ATTR}]` : `:root[${ROOT_ATTR}]`;
    return `
@font-face{font-family:"Waylight OpenDyslexic";src:url("${regular}") format("woff2");font-style:normal;font-weight:100 600;font-display:swap}
@font-face{font-family:"Waylight OpenDyslexic";src:url("${bold}") format("woff2");font-style:normal;font-weight:700 900;font-display:swap}
${root}[${ROOT_ATTR}="clear"] :where(${READABLE}){
  font-family:Verdana,Tahoma,"Trebuchet MS",Arial,sans-serif!important;
  letter-spacing:.012em!important;
  word-spacing:.045em!important;
  line-height:1.55!important;
}
${root}[${ROOT_ATTR}="dyslexic"] :where(${READABLE}){
  font-family:"Waylight OpenDyslexic",Verdana,Tahoma,sans-serif!important;
  line-height:1.55!important;
}
${root} :where(code,pre,kbd,samp,var,svg,math,[contenteditable="true"],[contenteditable="true"] *){
  font-family:revert!important;letter-spacing:revert!important;word-spacing:revert!important;line-height:revert!important;
}`;
  }
  function applyFont(mode, doc = document, scopeRoot = null, styleId = STYLE_ID3) {
    const root = doc.documentElement;
    const target = scopeRoot || root;
    if (!root || !target) return;
    if (mode === "default") {
      target.removeAttribute(ROOT_ATTR);
      doc.getElementById(styleId)?.remove();
      return;
    }
    let style = doc.getElementById(styleId);
    if (!style) {
      style = doc.createElement("style");
      style.id = styleId;
      (doc.head || root).appendChild(style);
    }
    style.textContent = stylesheet(!!scopeRoot);
    target.setAttribute(ROOT_ATTR, mode === "dyslexic" ? "dyslexic" : "clear");
  }
  function createFont(getCfg, doc = document, scopeRoot = null) {
    let running = false;
    const styleId = STYLE_ID3 + "-" + ++nextStyle;
    return {
      start() {
        running = true;
        applyFont(getCfg().font, doc, scopeRoot, styleId);
      },
      stop() {
        running = false;
        (scopeRoot || doc.documentElement)?.removeAttribute(ROOT_ATTR);
        doc.getElementById(styleId)?.remove();
      },
      refresh() {
        if (running) applyFont(getCfg().font, doc, scopeRoot, styleId);
      },
      isRunning: () => running
    };
  }

  // engine/linefocus.js
  var clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
  function createProgressTracker() {
    let index = 0, progress = 0, furthest = 0, retreat = 0;
    const snapshot = () => ({ index, progress, furthest, minimum: 0 });
    return {
      select(value = 0) {
        index = furthest = Math.max(0, value);
        progress = 0;
        retreat = 0;
        return snapshot();
      },
      restore(value, high = value) {
        index = Math.max(0, value);
        furthest = Math.max(index, high);
        return snapshot();
      },
      feed(dx, width, sensitivity, count) {
        if (!Number.isFinite(dx) || !count) return snapshot();
        const threshold = travelThreshold(width, sensitivity);
        if (dx > 0) retreat = 0;
        if (progress <= 0 && dx < 0) {
          retreat += Math.abs(dx);
          if (retreat < 18) return snapshot();
          retreat = 0;
        }
        progress += dx / threshold;
        if (progress >= 1 - 1e-9 && index < count - 1) {
          index++;
          furthest = Math.max(index, furthest);
          progress = Math.min(0.95, progress - 1);
        } else if (progress < 0 && index > 0) {
          index--;
          progress = Math.max(0, 1 + progress);
        }
        progress = clamp(progress, 0, 1);
        return snapshot();
      },
      step(delta, count) {
        index = clamp(index + delta, 0, Math.max(0, count - 1));
        furthest = Math.max(furthest, index);
        progress = 0;
        return snapshot();
      },
      nudge(delta, count) {
        if (!Number.isFinite(delta) || !count) return snapshot();
        progress += delta;
        while (progress >= 1 && index < count - 1) {
          index++;
          furthest = Math.max(furthest, index);
          progress -= 1;
        }
        while (progress < 0 && index > 0) {
          index--;
          progress += 1;
        }
        progress = clamp(progress, 0, 1);
        return snapshot();
      },
      snapshot
    };
  }
  function overlapRatio(a, b) {
    const overlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const shorter = Math.max(1, Math.min(a.bottom - a.top, b.bottom - b.top));
    return overlap / shorter;
  }
  function buildLines(entries = []) {
    const lines = [];
    for (const entry of entries) {
      if (!entry || !Number.isFinite(entry.top) || !Number.isFinite(entry.bottom)) continue;
      const previous = lines[lines.length - 1];
      const joins = previous && previous.blockId === entry.blockId && overlapRatio(previous, entry) >= 0.5;
      if (!joins) {
        lines.push({
          blockId: entry.blockId,
          top: entry.top,
          bottom: entry.bottom,
          left: entry.left,
          right: entry.right,
          members: [entry.ref]
        });
        continue;
      }
      previous.top = Math.min(previous.top, entry.top);
      previous.bottom = Math.max(previous.bottom, entry.bottom);
      previous.left = Math.min(previous.left, entry.left);
      previous.right = Math.max(previous.right, entry.right);
      previous.members.push(entry.ref);
    }
    return lines;
  }
  function travelThreshold(lineWidth, sensitivity = 1) {
    return clamp(0.55 * Math.max(1, lineWidth), 140, 520) / clamp(sensitivity, 0.5, 3);
  }
  function scrollPlan(rect, viewportH, scrollTop = 0, maxScroll = Infinity) {
    const h = Math.max(1, viewportH);
    const upper = h * 0.22;
    const lower = h * 0.68;
    const center = (rect.top + rect.bottom) / 2;
    if (center >= upper && center <= lower) return { needed: false, top: scrollTop, delta: 0 };
    const targetViewportY = center > lower ? h * 0.32 : h * 0.58;
    const top = clamp(scrollTop + center - targetViewportY, 0, Math.max(0, maxScroll));
    return { needed: Math.abs(top - scrollTop) > 1, top, delta: top - scrollTop };
  }
  function nearestLine(lines, x, y) {
    let best = -1;
    let bestDistance = Infinity;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dy = y < line.top ? line.top - y : y > line.bottom ? y - line.bottom : 0;
      const dx = x < line.left ? line.left - x : x > line.right ? x - line.right : 0;
      const distance = dy * 4 + dx;
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    }
    return best;
  }

  // dom/linefocus.js
  var HOST = "data-waylight-line-focus";
  var CONTROL = "[data-waylight-controls]";
  var SKIP2 = 'script,style,noscript,textarea,input,select,option,button,label,code,pre,kbd,svg,math,canvas,iframe,video,audio,[hidden],[aria-hidden="true"],[' + HOST + "]," + CONTROL;
  var editable = (target) => !!(target?.isContentEditable || target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'));
  var interactive = (target) => editable(target) || !!target?.closest?.('a,button,label,[role="button"],' + CONTROL);
  function measure(doc, root) {
    const view = doc.defaultView, entries = [], styles = /* @__PURE__ */ new WeakMap();
    const styleFor = (el) => {
      if (!styles.has(el)) styles.set(el, view.getComputedStyle(el));
      return styles.get(el);
    };
    const walker = doc.createTreeWalker(root, 5, { acceptNode(node2) {
      if (node2.nodeType === 1) {
        if (node2.matches(SKIP2) || node2.isContentEditable || styleFor(node2).display === "none") return 2;
        return 3;
      }
      return node2.data.trim() && !editable(node2.parentElement) && styleFor(node2.parentElement).visibility !== "hidden" ? 1 : 2;
    } });
    let node;
    while (node = walker.nextNode()) {
      let block = node.parentElement;
      while (block !== root && block.parentElement && styleFor(block).display === "inline") block = block.parentElement;
      const range = doc.createRange();
      range.selectNodeContents(node);
      [...range.getClientRects()].forEach((rect, rectIndex) => {
        if (rect.width > 1 && rect.height > 1) entries.push({
          blockId: block,
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          ref: { node, rectIndex }
        });
      });
    }
    return buildLines(entries);
  }
  function liveRect(line, doc) {
    if (!line) return null;
    const rects = line.members.map(({ node, rectIndex }) => {
      if (!node.isConnected) return null;
      const range = doc.createRange();
      range.selectNodeContents(node);
      return range.getClientRects()[rectIndex];
    }).filter(Boolean);
    if (!rects.length) return null;
    return {
      top: Math.min(...rects.map((r) => r.top)),
      bottom: Math.max(...rects.map((r) => r.bottom)),
      left: Math.min(...rects.map((r) => r.left)),
      right: Math.max(...rects.map((r) => r.right))
    };
  }
  function makeOverlay(doc, root, options, pause, stop, move, capture) {
    const host = doc.createElement("div");
    host.setAttribute(HOST, "");
    Object.assign(host.style, { all: "initial", position: "fixed", inset: "0", zIndex: "2147483647", pointerEvents: "none", display: "block" });
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `<style>
    *{box-sizing:border-box}svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
    #spot{position:absolute;border-radius:3px;pointer-events:none}#guide{position:absolute;bottom:-4px;height:3px;background:#7362ff;border-radius:3px;box-shadow:0 0 8px #7362ff55}
    #spot.tint{background:#8476ff16;outline:1px solid #8476ff80}#spot.glow{background:#483bff25;box-shadow:0 0 24px 12px #4633ff65,inset 0 0 16px #756bff44}
    #bar{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:7px;max-width:calc(100% - 16px);padding:8px;background:#111518;color:#f4f1e9;border:1px solid #746aff;box-shadow:0 8px 26px #0005;pointer-events:auto;touch-action:none;cursor:grab;font:12px/1.4 system-ui,sans-serif}
    #bar.dragging{cursor:grabbing}
    #message{max-width:320px}button{flex:none;background:#22282e;border:1px solid #5e6971;color:#fff;min-height:38px;padding:6px 10px;font:inherit;cursor:pointer}button:focus-visible{outline:2px solid #d8ff36;outline-offset:2px}#exit{background:#d8ff36;color:#070908;border-color:#d8ff36;font-weight:700}
    #bar.compact{bottom:5px;font-size:11px;padding:5px}#bar.compact #message{max-width:210px}#bar.compact .step{display:none}
    @media(max-width:600px){#message{max-width:110px;font-size:11px}.step{display:inline-block;padding:6px 9px}#bar{bottom:8px;gap:4px}#bar.compact #message{max-width:160px}}
  </style><svg aria-hidden="true"><path fill-rule="evenodd"/></svg><div id="spot"><div id="guide"></div></div>
  <div id="bar" role="region" aria-label="Live Focus controls"><span id="message" role="status"></span><button class="step" id="prev" aria-label="Previous line">\u2191</button><button class="step" id="next" aria-label="Next line">\u2193</button><button id="capture">Capture mouse</button><button id="pause">Pause</button><button id="exit">Exit focus</button></div>`;
    (root.closest?.("dialog") || doc.documentElement).append(host);
    const el = (id) => shadow.getElementById(id);
    el("exit").onclick = stop;
    el("pause").onclick = pause;
    el("capture").onclick = capture;
    el("prev").onclick = () => move(-1);
    el("next").onclick = () => move(1);
    el("bar").classList.toggle("compact", !!options.hero);
    return { host, path: shadow.querySelector("path"), spot: el("spot"), guide: el("guide"), bar: el("bar"), message: el("message"), pause: el("pause"), capture: el("capture") };
  }
  function createLineFocus(getCfg, doc = document, root = null, options = {}) {
    const view = doc.defaultView, scope = () => root || doc.body;
    const tracker = createProgressTracker();
    let running = false, engaged = false, overlay, lines = [], frame = 0, observer, resizeObserver;
    let lastX = null, wasLocked = false, touchId = null, lastTouch = 0, captureBlocked = false;
    let barPosition = null, barDrag = null, captureTimer = 0;
    const cursorStyleId = "waylight-line-focus-cursor-style";
    const reduced = () => view.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = () => view.matchMedia("(pointer: coarse)").matches;
    const locked = () => doc.pointerLockElement === scope();
    const state2 = () => ({
      ...tracker.snapshot(),
      running,
      engaged,
      locked: locked(),
      count: lines.length,
      page: lines[tracker.snapshot().index]?.members[0]?.node.parentElement.closest("[data-page]")?.dataset.page
    });
    const notify = () => options.onState?.(state2());
    const exitLock = () => {
      if (locked()) doc.exitPointerLock?.();
    };
    function setCursorHidden(hidden) {
      const root2 = doc.documentElement;
      if (!root2) return;
      if (hidden) {
        let style = doc.getElementById(cursorStyleId);
        if (!style) {
          style = doc.createElement("style");
          style.id = cursorStyleId;
          (doc.head || root2).append(style);
        }
        style.textContent = `html[data-waylight-hide-cursor],html[data-waylight-hide-cursor] body,html[data-waylight-hide-cursor] body *{cursor:none!important}`;
        root2.setAttribute("data-waylight-hide-cursor", "");
        if (overlay) overlay.host.style.cursor = "none";
      } else {
        root2.removeAttribute("data-waylight-hide-cursor");
        doc.getElementById(cursorStyleId)?.remove();
        if (overlay) overlay.host.style.cursor = "";
      }
    }
    function pause() {
      engaged = false;
      lastX = null;
      if (captureTimer) {
        view.clearTimeout(captureTimer);
        captureTimer = 0;
      }
      setCursorHidden(false);
      exitLock();
      render();
    }
    function exit() {
      api2.stop();
      options.onExit?.();
    }
    function boxPath(r) {
      return `M${r.left},${r.top}H${r.right}V${r.bottom}H${r.left}Z`;
    }
    function render() {
      if (!overlay) return;
      const s = tracker.snapshot(), cfg = getCfg();
      const bounds = options.contain && root ? root.getBoundingClientRect() : { top: 0, left: 0, right: view.innerWidth, bottom: view.innerHeight };
      overlay.host.style.clipPath = options.contain ? `inset(${Math.max(0, bounds.top)}px ${Math.max(0, view.innerWidth - bounds.right)}px ${Math.max(0, view.innerHeight - bounds.bottom)}px ${Math.max(0, bounds.left)}px)` : "none";
      if (barPosition) {
        overlay.bar.style.left = `${barPosition.x}px`;
        overlay.bar.style.top = `${barPosition.y}px`;
        overlay.bar.style.bottom = "auto";
      } else {
        overlay.bar.style.left = `${(bounds.left + bounds.right) / 2}px`;
        overlay.bar.style.top = "auto";
        overlay.bar.style.bottom = `${Math.max(10, view.innerHeight - bounds.bottom + 10)}px`;
      }
      const preview = options.hero && !engaged;
      const activeLine = lines[preview ? touch() ? 0 : Math.min(2, lines.length - 1) : s.index];
      const rect = activeLine && (engaged || preview) ? liveRect(activeLine, doc) : null;
      overlay.spot.style.display = rect ? "block" : "none";
      overlay.path.setAttribute("d", "");
      if (rect) {
        const hole = { left: rect.left - 5, right: rect.right + 5, top: rect.top - 3, bottom: rect.bottom + 5 };
        Object.assign(overlay.spot.style, { left: `${hole.left}px`, top: `${hole.top}px`, width: `${hole.right - hole.left}px`, height: `${hole.bottom - hole.top}px` });
        overlay.spot.className = options.hero ? "glow" : cfg.lfBand;
        overlay.guide.style.width = "25%";
        overlay.guide.style.boxShadow = cfg.lfFollow ? "0 0 8px #7362ff66" : "none";
        overlay.guide.style.left = `${s.progress * 75}%`;
        overlay.guide.style.display = cfg.lfBand === "none" ? "none" : "block";
        let path = boxPath(bounds) + boxPath(hole);
        for (const control of doc.querySelectorAll(CONTROL)) {
          const r = control.getBoundingClientRect();
          if (r.width && r.height) path += boxPath(r);
        }
        overlay.path.setAttribute("d", path);
        let bg = "rgb(7,9,8)", el = activeLine.members[0].node.parentElement;
        while (el) {
          const color = view.getComputedStyle(el).backgroundColor;
          if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
            bg = color;
            break;
          }
          el = el.parentElement;
        }
        overlay.path.setAttribute("fill", bg);
        overlay.path.setAttribute("fill-opacity", options.hero ? ".48" : String(cfg.lfDim));
      }
      overlay.message.textContent = touch() ? engaged ? "Use the arrows or slide right. Tap Pause to release." : "Tap a line to begin. Use the arrows to continue." : engaged ? locked() ? "Mouse captured. Move right. Click anywhere to release. Esc also works; Safari may need two presses." : captureBlocked ? "Capture unavailable here. Move right over the text, or use the arrows. Esc pauses." : "Move right to read. Click Pause or press Esc to release." : lines.length ? "Click a line to begin. Move right to continue." : "No readable text here. Try the separate Reader.";
      overlay.pause.hidden = !engaged;
      overlay.capture.hidden = !engaged || locked() || touch() || !cfg.lfCapture || !scope().requestPointerLock || captureBlocked;
      overlay.host.dataset.state = engaged ? "reading" : "ready";
      overlay.host.dataset.line = String(s.index);
      overlay.host.dataset.progress = String(s.progress);
      notify();
    }
    function refresh(preserve = true) {
      if (!running) return;
      const s = tracker.snapshot(), old = lines[s.index]?.members[0], high = lines[s.furthest]?.members[0];
      lines = measure(doc, scope());
      const find = (ref) => ref ? lines.findIndex((line) => line.members.some((m) => m.node === ref.node && m.rectIndex === ref.rectIndex)) : -1;
      const i = find(old), f = find(high);
      if (preserve && i >= 0) tracker.restore(i, f < 0 ? i : f);
      else tracker.select(0);
      render();
    }
    function queueRender() {
      if (!frame) frame = view.requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    }
    function scrollCurrent() {
      if (options.hero) return;
      const line = lines[tracker.snapshot().index];
      if (!line) return;
      const rect = liveRect(line, doc);
      if (!rect) return;
      let scroller = line.members[0].node.parentElement;
      while (scroller && scroller !== doc.body && !(scroller.scrollHeight > scroller.clientHeight + 2 && /auto|scroll/.test(view.getComputedStyle(scroller).overflowY))) scroller = scroller.parentElement;
      const nested = scroller && scroller !== doc.body;
      const bounds = nested ? scroller.getBoundingClientRect() : { top: 0, height: view.innerHeight };
      let visibleTop = Math.max(0, bounds.top), visibleBottom = Math.min(view.innerHeight, bounds.top + bounds.height);
      for (const control of doc.querySelectorAll(CONTROL)) {
        if (!["fixed", "sticky"].includes(view.getComputedStyle(control).position)) continue;
        const r = control.getBoundingClientRect();
        if (r.right <= rect.left || r.left >= rect.right) continue;
        if (r.top <= visibleTop + 1 && r.bottom > visibleTop) visibleTop = r.bottom;
        else if (r.bottom >= visibleBottom - 1 && r.top < visibleBottom) visibleBottom = r.top;
      }
      const bar = overlay.bar.getBoundingClientRect();
      if (bar.top > visibleTop && bar.top < visibleBottom) visibleBottom = bar.top - 8;
      const top = nested ? scroller.scrollTop : view.scrollY;
      const max = nested ? scroller.scrollHeight - scroller.clientHeight : doc.documentElement.scrollHeight - view.innerHeight;
      const plan = scrollPlan({ top: rect.top - visibleTop, bottom: rect.bottom - visibleTop }, Math.max(80, visibleBottom - visibleTop), top, max);
      if (plan.needed) (nested ? scroller : view).scrollTo({ top: plan.top, behavior: reduced() ? "instant" : "smooth" });
    }
    function move(delta) {
      if (!running || !lines.length) return;
      engaged = true;
      tracker.step(delta, lines.length);
      render();
      scrollCurrent();
    }
    function nudge(delta) {
      if (!running || !lines.length) return;
      engaged = true;
      tracker.nudge(delta, lines.length);
      render();
      scrollCurrent();
    }
    function feed(dx) {
      const s = tracker.snapshot(), rect = liveRect(lines[s.index], doc);
      if (!rect) return;
      tracker.feed(dx, rect.right - rect.left, getCfg().lfSensitivity, lines.length);
      queueRender();
      if (s.index !== tracker.snapshot().index) scrollCurrent();
    }
    function begin(event, capture = true) {
      if (!running || !scope().contains(event.target) || interactive(event.target)) return;
      const rects = lines.map((line) => liveRect(line, doc) || line);
      const i = nearestLine(rects, event.clientX, event.clientY);
      if (i < 0) return;
      tracker.select(i);
      engaged = true;
      lastX = event.clientX;
      render();
      if (capture && getCfg().lfCapture) requestCapture();
    }
    function onCaptureError() {
      captureBlocked = true;
      setCursorHidden(engaged && !locked());
      queueRender();
    }
    function requestCapture() {
      if (!scope().requestPointerLock) {
        captureBlocked = true;
        setCursorHidden(true);
        queueRender();
        return;
      }
      captureBlocked = false;
      if (captureTimer) view.clearTimeout(captureTimer);
      try {
        const request = scope().requestPointerLock();
        request?.catch?.(onCaptureError);
      } catch {
        onCaptureError();
      }
      captureTimer = view.setTimeout(() => {
        captureTimer = 0;
        if (engaged && !locked()) onCaptureError();
      }, 250);
    }
    function onClick(event) {
      if (event.composedPath().includes(overlay?.host) || Date.now() - lastTouch < 500) return;
      if (locked()) {
        event.preventDefault();
        event.stopPropagation();
        pause();
        return;
      }
      begin(event);
    }
    function onMouse(event) {
      if (!engaged || !lines.length) return;
      if (!locked() && (!scope().contains(event.target) || interactive(event.target))) {
        lastX = null;
        return;
      }
      const dx = locked() ? event.movementX : lastX === null ? 0 : event.clientX - lastX;
      lastX = event.clientX;
      feed(dx);
    }
    function onTouchStart(event) {
      if (event.pointerType !== "touch" || interactive(event.target)) return;
      lastTouch = Date.now();
      touchId = event.pointerId;
      begin(event, false);
    }
    function onTouchMove(event) {
      if (engaged && event.pointerId === touchId) {
        feed(event.clientX - lastX);
        lastX = event.clientX;
        lastTouch = Date.now();
      }
    }
    function onKey(event) {
      if (editable(event.target) || !running) return;
      if (event.key === "Escape") {
        pause();
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "k") return;
      if (engaged && ["ArrowDown", "ArrowUp", " ", "Spacebar"].includes(event.key)) {
        event.preventDefault();
        move(event.key === "ArrowUp" ? -1 : 1);
      } else if (engaged && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        nudge(event.key === "ArrowRight" ? 0.1 : -0.1);
      }
    }
    function onBarPointerDown(event) {
      if (event.target.closest?.("button,select,input")) return;
      const rect = overlay.bar.getBoundingClientRect();
      barDrag = { pointerId: event.pointerId, x: event.clientX - (rect.left + rect.width / 2), y: event.clientY - rect.top };
      overlay.bar.classList.add("dragging");
      overlay.bar.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }
    function onBarPointerMove(event) {
      if (!barDrag || event.pointerId !== barDrag.pointerId) return;
      const rect = overlay.bar.getBoundingClientRect();
      const half = rect.width / 2;
      const x = Math.min(view.innerWidth - half - 8, Math.max(half + 8, event.clientX - barDrag.x));
      const y = Math.min(view.innerHeight - rect.height - 8, Math.max(8, event.clientY - barDrag.y));
      barPosition = { x, y };
      render();
      event.preventDefault();
    }
    function onBarPointerUp(event) {
      if (!barDrag || event.pointerId !== barDrag.pointerId) return;
      overlay.bar.releasePointerCapture?.(event.pointerId);
      barDrag = null;
      overlay.bar.classList.remove("dragging");
    }
    function onLock() {
      if (captureTimer) {
        view.clearTimeout(captureTimer);
        captureTimer = 0;
      }
      const now = locked();
      if (wasLocked && !now) engaged = false;
      wasLocked = now;
      lastX = null;
      setCursorHidden(engaged && !now && captureBlocked);
      render();
    }
    function onFocus(event) {
      if (editable(event.target)) pause();
    }
    function onVisibility() {
      if (doc.hidden) pause();
    }
    const bindings = [[doc, "mousemove", onMouse], [doc, "click", onClick], [doc, "keydown", onKey], [doc, "pointerlockchange", onLock], [doc, "pointerlockerror", onCaptureError], [doc, "focusin", onFocus], [doc, "visibilitychange", onVisibility], [doc, "pointerdown", onTouchStart], [doc, "pointermove", onTouchMove], [view, "scroll", queueRender], [view, "resize", refresh], [view, "blur", pause]];
    const api2 = {
      start() {
        if (running) return;
        running = true;
        engaged = false;
        setCursorHidden(false);
        overlay = makeOverlay(doc, scope(), options, pause, exit, move, requestCapture);
        refresh(false);
        overlay.bar.addEventListener("pointerdown", onBarPointerDown);
        overlay.bar.addEventListener("pointermove", onBarPointerMove);
        overlay.bar.addEventListener("pointerup", onBarPointerUp);
        for (const [target, type, handler] of bindings) target.addEventListener(type, handler, true);
        observer = new view.MutationObserver((records) => {
          if (records.some((r) => !r.target.closest?.("[" + HOST + "]") && !r.target.parentElement?.closest("[" + HOST + "]"))) refresh();
        });
        observer.observe(scope(), { subtree: true, childList: true, characterData: true });
        resizeObserver = new view.ResizeObserver(() => refresh());
        resizeObserver.observe(scope());
        doc.fonts?.addEventListener("loadingdone", refresh);
      },
      stop() {
        if (!running) return;
        running = false;
        engaged = false;
        if (captureTimer) view.clearTimeout(captureTimer);
        captureTimer = 0;
        setCursorHidden(false);
        exitLock();
        for (const [target, type, handler] of bindings) target.removeEventListener(type, handler, true);
        overlay?.bar.removeEventListener("pointerdown", onBarPointerDown);
        overlay?.bar.removeEventListener("pointermove", onBarPointerMove);
        overlay?.bar.removeEventListener("pointerup", onBarPointerUp);
        observer?.disconnect();
        resizeObserver?.disconnect();
        doc.fonts?.removeEventListener("loadingdone", refresh);
        view.cancelAnimationFrame(frame);
        frame = 0;
        overlay?.host.remove();
        overlay = null;
        lines = [];
        notify();
      },
      refresh,
      pause,
      next: () => move(1),
      previous: () => move(-1),
      select(index = 0) {
        if (!running) api2.start();
        tracker.select(Math.min(index, Math.max(0, lines.length - 1)));
        engaged = true;
        render();
        scrollCurrent();
      },
      isRunning: () => running,
      getState: state2
    };
    return api2;
  }

  // engine/license.js
  var GRACE_DAYS = 14;
  var RECHECK_AFTER_DAYS = 3;
  var DAY = 864e5;
  function assess(license, now = Date.now()) {
    if (!license || !license.key) return { pro: false, shouldRecheck: false, reason: "none" };
    if (license.valid === false) return { pro: false, shouldRecheck: true, reason: "revoked" };
    const checkedAt = Number(license.checkedAt) || 0;
    const age = now - checkedAt;
    if (license.expiresAt) {
      const exp = Date.parse(license.expiresAt);
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
  var onStorageChanged = (handler) => api.storage.onChanged.addListener(handler);
  var onRuntimeMessage = (handler) => api.runtime?.onMessage?.addListener(handler);

  // entries/content.js
  var HOST2 = location.hostname;
  var state = { cfg: normalize({}), on: false };
  var reader = null;
  var font = null;
  var lineFocus = null;
  var safariVisualFallback = /Safari\//.test(navigator.userAgent) && !/Chrome\//.test(navigator.userAgent);
  async function load() {
    const stored = await storageGet(null);
    const pro = assess(stored.license).pro;
    const baseCfg = stored.cfg || {};
    const siteCfg = pro ? stored.siteConfigs?.[HOST2] : null;
    const cfg = normalize({ ...baseCfg, ...siteCfg || {}, pro });
    const sites = stored.sites || {};
    const defaultOn = pro && stored.defaultOn === true;
    const on = cfg.enabled !== false && (HOST2 in sites ? sites[HOST2] : defaultOn);
    return { cfg, on };
  }
  function sync(next) {
    state = next;
    if (!reader) reader = createVisualAnchors(() => state.cfg, document, null, { domFallback: safariVisualFallback });
    if (!font) font = createFont(() => state.cfg);
    if (!lineFocus) lineFocus = createLineFocus(() => state.cfg, document, null, { async onExit() {
      state.cfg.lineFocusOn = false;
      const stored = await storageGet(null);
      if (assess(stored.license).pro && stored.siteConfigs?.[HOST2]) {
        await storageSet({ siteConfigs: { ...stored.siteConfigs, [HOST2]: { ...stored.siteConfigs[HOST2], lineFocusOn: false } } });
      } else await storageSet({ cfg: { ...stored.cfg, lineFocusOn: false } });
    } });
    const syncLayer = (layer, wanted) => {
      if (wanted && !layer.isRunning()) layer.start();
      else if (!wanted && layer.isRunning()) layer.stop();
      else if (wanted) layer.refresh();
    };
    syncLayer(reader, state.on && state.cfg.anchorsOn);
    syncLayer(font, state.on && state.cfg.font !== "default");
    syncLayer(lineFocus, state.on && state.cfg.lineFocusOn);
  }
  async function boot() {
    try {
      sync(await load());
    } catch {
      return;
    }
    onStorageChanged(async () => {
      try {
        sync(await load());
      } catch {
      }
    });
    onRuntimeMessage((message) => {
      if (message?.type === "waylight-sync") {
        load().then(sync);
        return true;
      }
      if (message?.type === "waylight-line-next") lineFocus?.next();
      if (message?.type === "waylight-line-previous") lineFocus?.previous();
    });
  }
  if (document.body) boot();
  else document.addEventListener("DOMContentLoaded", boot, { once: true });
})();
