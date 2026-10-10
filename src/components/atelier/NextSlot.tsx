import { StepLink } from "./Step";

/** The open slot: the last word of the work, after the story of how it gets made. */
export default function NextSlot() {
  return (
    <section className="atelier-next atelier-section atelier-desktop-only" aria-labelledby="next-title">
      <div className="atelier-depth-row">
        <div className="atelier-scene-text">
          <span className="atelier-track-label">Next</span>
          <h2 id="next-title">We build whatever&rsquo;s next.</h2>
          <p>Bring the idea. We&rsquo;ll find the shape.</p>
          <StepLink href="#queue">Let&rsquo;s talk</StepLink>
        </div>
        <a className="atelier-slot" href="#queue">
          <span>Your project</span>
          <small>Let&rsquo;s see what we can make.</small>
        </a>
      </div>
    </section>
  );
}
