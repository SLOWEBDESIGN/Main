import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import type { BrandVariant } from "@/src/lib/schema";

// Loaded only when the final revision is opened. Preview mode skips the nested
// revision stack and freezes media; this is shared markup, not another website.
const CurrentHome = dynamic(() => import("./AtelierHome"), { ssr: false });
const WIDTH = 1440;

export default function ModernRevisionPreview({ variant, theme, onReady }: {
  variant: BrandVariant;
  theme: "light" | "dark";
  onReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ scale: 1, height: 900 });
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    // Shadow DOM isolates duplicate section/form IDs and styles. Main-page
    // anchors and labels cannot accidentally target this inert miniature.
    const shadow = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    const styles = document.createElement("div");
    const mount = document.createElement("div");
    mount.className = "modern-revision-native";
    const rules = document.createElement("style");
    rules.textContent = `
      :host { display:block; overflow:hidden; pointer-events:none; }
      .modern-revision-native { position:absolute; top:0; left:0; width:${WIDTH}px; transform-origin:top left; }
      .modern-revision-native > .atelier { position:relative; width:${WIDTH}px; }
      .modern-revision-native .atelier-hero { height:900px; min-height:900px; max-height:900px; }
      .modern-revision-native .atelier-nav { position:absolute; }
      .modern-revision-native .atelier-architecture { position:absolute; top:900px; bottom:0; background-size:${WIDTH}px auto; background-repeat:repeat-y; }
      .modern-revision-native .atelier-hero-title h1 { font-size:80px; }
      .modern-revision-native .atelier-reveal { opacity:1; transform:none; }
      .modern-revision-native .atelier-service-card { position:relative; top:auto; }
      .modern-revision-native *, .modern-revision-native *::before, .modern-revision-native *::after { animation:none!important; transition:none!important; }
      .modern-revision-native .atelier-design-constellation [data-star],
      .modern-revision-native .atelier-design-constellation line { opacity:1; stroke-dashoffset:0; }
    `;
    const syncStyles = () => {
      styles.replaceChildren(...Array.from(document.head.querySelectorAll("style, link[rel='stylesheet']"),
        (node) => node.cloneNode(true)));
    };
    syncStyles();
    shadow.replaceChildren(styles, rules, mount);
    setTarget(mount);
    // Also follows local CSS hot updates without coupling to page components.
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      // React removes its portal children; keep the mounting node until then.
    };
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element || !target) return;
    const measure = () => {
      const scale = element.clientWidth / WIDTH;
      const height = target.offsetHeight * scale;
      if (!scale || !height) return;
      target.style.transform = `scale(${scale})`;
      setSize((old) => old.scale === scale && old.height === height ? old : { scale, height });
      if (target.querySelector(".atelier")) ready.current();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(target);
    measure();
    // Late fonts can change the full page height after the first render.
    let alive = true;
    void document.fonts.ready.then(() => { if (alive) measure(); });
    return () => { alive = false; observer.disconnect(); };
  }, [target]);

  return <div ref={host} className="atelier-modern-revision" style={{ height: size.height }} aria-hidden="true">
    {target && createPortal(<CurrentHome variant={variant} preview previewTheme={theme} />, target)}
  </div>;
}
