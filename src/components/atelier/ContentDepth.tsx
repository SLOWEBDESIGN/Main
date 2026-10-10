import { useState, type CSSProperties } from "react";
import { bins, formats, workflow } from "@/src/data/contentStudio";
import { StepButton, StepLink } from "./Step";

/**
 * Everything the creative suite makes possible, folded away under the reels so the
 * application follows them directly. One step opens the whole list.
 */
export default function ContentDepth() {
  const [open, setOpen] = useState(false);
  return (
    <section className="atelier-content-depth atelier-section atelier-desktop-only" aria-label="Content creation options">
      <div className="atelier-more">
        <StepButton quiet aria-expanded={open} aria-controls="content-options" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide content creation options" : "Expand content creation options"}
        </StepButton>
      </div>
      <div id="content-options" className="atelier-content-options" hidden={!open}>
        <div className="atelier-overview">
          <span className="atelier-overview-label">The whole suite</span>
          <div className="atelier-overview-body">
            <h2 className="atelier-statement-sm">
              The full Adobe Creative Cloud suite and DaVinci Resolve, on the same team that builds your site.
            </h2>
            <p>We shoot, edit, design, and deliver in the sizes your customers actually scroll.</p>
          </div>
        </div>
        <div className="atelier-overview">
          <span className="atelier-overview-label">Every size, from one edit</span>
          <ul className="atelier-formats">
            {formats.map((format) => (
              <li key={format.name}>
                <span className="atelier-frame" style={{ aspectRatio: format.ratio } as CSSProperties} aria-hidden="true" />
                <strong>{format.name}</strong>
                <small>{format.use}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="atelier-overview">
          <span className="atelier-overview-label">From brief to delivery</span>
          <ol className="atelier-workflow">{workflow.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>
        <div className="atelier-overview">
          <span className="atelier-overview-label">What we make with each app</span>
          <div className="atelier-bins">
            {bins.map((bin) => (
              <details key={bin.id}>
                <summary>
                  <strong>{bin.name}</strong>
                  <span>{bin.make.length} kinds of work</span>
                  <i aria-hidden="true" />
                </summary>
                <div>
                  <ul className="atelier-bin-apps">
                    {bin.apps.map(([mark, name]) => <li key={name}><b aria-hidden="true">{mark}</b>{name}</li>)}
                  </ul>
                  <ul className="atelier-bin-make">{bin.make.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </details>
            ))}
            <StepLink quiet href="#queue">Talk about a campaign</StepLink>
          </div>
        </div>
      </div>
    </section>
  );
}
