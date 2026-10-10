import type { CSSProperties } from "react";
import { serviceGroups } from "@/src/data/atelier";
import { groups as presence } from "@/src/components/CapabilityEcosystem";
import { StepLink } from "./Step";

/** What the studio makes, as panels that stack as you scroll, then the presence map. */
export default function ServiceStack() {
  return (
    <section id="capabilities" className="atelier-capabilities atelier-section">
      <div className="atelier-overview">
        <span className="atelier-overview-label">The full picture</span>
        <div className="atelier-overview-body">
          <h2 className="atelier-statement">More than the front page.</h2>
          <p>The website gets the attention. The thinking behind it connects everything else.</p>
        </div>
      </div>
      <div className="atelier-stack">
        {serviceGroups.map((group, index) => (
          <article key={group.id} className="atelier-stack-panel" style={{ "--i": index } as CSSProperties}>
            <div className={`atelier-service-art art-${index}`} aria-hidden="true"><i /><i /><i /><i /></div>
            <header>
              <h3>{group.title}</h3>
              <p>{group.short}</p>
            </header>
            <div className="atelier-stack-body">
              <p>{group.detail}</p>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              <StepLink quiet href="#queue">Bring us your version of this</StepLink>
            </div>
          </article>
        ))}
      </div>
      <div className="atelier-overview atelier-presence atelier-desktop-only">
        <span className="atelier-overview-label">Your online presence</span>
        <div className="atelier-overview-body">
          <p className="atelier-statement-sm">Start with a website. Expand only where the idea needs more room.</p>
          <p>One connected system, with enough depth to make the next step possible.</p>
          <div className="atelier-presence-grid">
            {presence.map((group) => (
              <div key={group.id}>
                <h4>{group.label}</h4>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="atelier-footnote">
            We are not a law firm. Copyright and IP support means implementation guidance and workflow assistance, not legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}
