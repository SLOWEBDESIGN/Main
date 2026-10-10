import { useEffect, useState, type MouseEvent } from "react";
import { StepLink } from "./Step";

/**
 * A corner button, where a chat launcher usually sits, that takes you to how the work
 * gets made. It waits until the hero is behind you, and steps aside while that section,
 * the application form, or the closing small print is on screen, so it never covers them.
 */
export default function HowItWorksButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = ["#approach", "#queue", ".atelier-closing", ".atelier-fineprint"].flatMap((selector) => {
      const element = document.querySelector(selector);
      return element ? [element] : [];
    });
    const onScreen = new Set<Element>();
    let pastHero = false;
    const sync = () => setVisible(pastHero && onScreen.size === 0);
    const onScroll = () => {
      const next = window.scrollY > window.innerHeight * 0.8;
      if (next !== pastHero) {
        pastHero = next;
        sync();
      }
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      sync();
    }, { threshold: 0.15 });
    targets.forEach((element) => observer.observe(element));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("approach");
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", "#approach");
  };

  // Hidden with visibility, so it also leaves the tab order until it shows.
  return (
    <div className={`atelier-howto atelier-desktop-only${visible ? " is-visible" : ""}`}>
      <StepLink href="#approach" large onClick={go}>How does it work?</StepLink>
    </div>
  );
}
