(function () {
  'use strict';
  if (window.__studioShortcutsInstalled || /(^|\.)3dprintdash\.com$/.test(location.hostname) || location.pathname.indexOf('/3dprintdash/') === 0) return;
  window.__studioShortcutsInstalled = true;
  function editable(target) { return target instanceof Element && !!target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'); }
  var lastToggle = 0;
  function toggleTheme() {
    if (Date.now() - lastToggle < 150) return;
    lastToggle = Date.now();
    if (!window.dispatchEvent(new CustomEvent('studio:toggle-theme', { cancelable: true }))) return;
    var nativeToggle = document.querySelector('#theme-toggle, #themeToggle, button[aria-label^="Switch to"][aria-label$="mode"]');
    if (nativeToggle) { nativeToggle.click(); return; }
    var root = document.documentElement;
    root.dataset.studioShortcutTheme = (root.dataset.studioShortcutTheme || 'light') === 'light' ? 'dark' : 'light';
    // A generic fallback for single-theme demos. Their authored default is
    // unchanged until a visitor deliberately invokes a theme shortcut.
    if (!document.getElementById('studio-shortcut-theme-style')) {
      var style = document.createElement('style'); style.id = 'studio-shortcut-theme-style';
      style.textContent = 'html[data-studio-shortcut-theme="dark"]{filter:invert(.9) hue-rotate(180deg);background:#f4f4f4;color-scheme:dark}html[data-studio-shortcut-theme="dark"] img,html[data-studio-shortcut-theme="dark"] video,html[data-studio-shortcut-theme="dark"] canvas{filter:invert(1) hue-rotate(180deg)}';
      document.head.appendChild(style);
    }
  }
  document.addEventListener('keydown', function (event) {
    var key = event.key.toLowerCase(), command = event.ctrlKey || event.metaKey;
    var saveOrPrint = command && (key === 's' || key === 'p');
    var sourceOrInspect = (command && key === 'u') || (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].indexOf(key) !== -1)
      || (event.metaKey && event.altKey && ['i', 'j', 'u', 'c'].indexOf(key) !== -1) || event.key === 'F12';
    var copy = command && key === 'c' && !editable(event.target);
    if (saveOrPrint || sourceOrInspect || copy) { event.preventDefault(); event.stopImmediatePropagation(); toggleTheme(); }
  }, true);
  document.addEventListener('copy', function (event) { if (!editable(event.target)) { event.preventDefault(); toggleTheme(); } }, true);
  document.addEventListener('contextmenu', function (event) { if (!editable(event.target)) { event.preventDefault(); toggleTheme(); } }, true);
  document.addEventListener('dragstart', function (event) { if (event.target instanceof Element && event.target.closest('img,a') && !editable(event.target)) event.preventDefault(); }, true);
  // A real 390px iframe triggers responsive CSS; a narrower body does not.
  function installPreview() {
    if (window !== window.top || !document.querySelector('script[data-demo-preview]')) return;
    var host = document.createElement('aside'); host.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000';
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>:host{font:13px system-ui}button{font:inherit;border:1px solid #8c989e;padding:10px 14px;background:#eff2f2;color:#18212b;cursor:pointer}.actions{display:flex;gap:6px}.preview{position:fixed;inset:0;background:#18212bed;display:none;align-items:center;justify-content:center;padding:64px 20px 20px;box-sizing:border-box}.preview.is-open{display:flex}iframe{width:390px;max-width:100%;height:100%;border:1px solid #8c989e;background:white}.close{position:absolute;top:16px;right:20px}.caption{position:absolute;top:26px;color:white}.actions{position:relative}@media(max-width:800px){:host{display:none}}</style><div class="preview"><span class="caption">Mobile layout · 390px preview</span><button class="close" type="button">Back to desktop</button></div><div class="actions"><button class="mobile" type="button">Mobile preview</button><button class="theme" type="button">Light / dark</button></div>';
    var panel = shadow.querySelector('.preview'), opener = shadow.querySelector('.mobile');
    shadow.querySelector('.theme').addEventListener('click', toggleTheme);
    opener.addEventListener('click', function () {
      var frame = document.createElement('iframe'); frame.title = 'Mobile website preview'; frame.src = location.href; frame.referrerPolicy = 'no-referrer';
      panel.appendChild(frame); panel.classList.add('is-open'); shadow.querySelector('.close').focus();
    });
    function close() { panel.classList.remove('is-open'); var frame = panel.querySelector('iframe'); if (frame) frame.remove(); opener.focus(); }
    shadow.querySelector('.close').addEventListener('click', close);
    shadow.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    document.body.appendChild(host);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installPreview, { once: true }); else installPreview();
}());
