/* Ctrl+Z / Cmd+Z = "take me back" on the secondary pages (FAQ, legal, press, status,
   careers, 404). People land on these from a footer link, sometimes from inside the app,
   and want a quick way back to wherever they were. Undo has no meaning on a static page,
   so the shortcut is repurposed as Back. Never while typing in a field (real undo matters
   there), and only the plain combo (Ctrl+Shift+Z and friends stay untouched). A direct
   visit with no history goes to the homepage instead. The homepage and /pricing are
   destinations, not detours, so they deliberately do NOT load this file. */
(function () {
  function inField(t) {
    return t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
  }
  document.addEventListener("keydown", function (e) {
    var mod = e.ctrlKey || e.metaKey;
    if (!mod || e.shiftKey || e.altKey || (e.key || "").toLowerCase() !== "z") return;
    if (inField(e.target)) return;
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = "/";
  });
})();
