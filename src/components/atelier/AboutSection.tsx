import { capabilities } from "@/src/data/atelier";

// Web copies with all metadata stripped; the originals stay off the site.
const photos = [
  { src: "/media/about/ben-helicopter.jpg", alt: "Ben standing next to a helicopter on an airfield", width: 960, height: 720 },
  { src: "/media/about/ben-desk.jpg", alt: "Ben at his desk, with a project open on a wide monitor", width: 960, height: 720 },
  { src: "/media/about/ben-portrait.jpg", alt: "Ben, outdoors", width: 900, height: 1200 },
];

/** The person behind the studio, after the application on purpose: the work comes first. */
export default function AboutSection({ city }: { city: string }) {
  return (
    <section id="about" className="atelier-about atelier-section">
      <div className="atelier-about-card">
        <img className="atelier-about-portrait" src="/media/about/ben-kitchen.jpg" alt="Ben in a kitchen with two others, making sausage" width={960} height={720} loading="lazy" />
        <div className="atelier-about-head">
          <span className="atelier-overview-label">About</span>
          <h2>I&rsquo;m Ben.</h2>
          <p className="atelier-statement-sm">Like a good doctor, I give second opinions, and I ask for them.</p>
        </div>
        <div className="atelier-about-text">
          <p>
            Other builders sometimes bring me their tricky cases, and when your project needs a specialist, I call one in. I&rsquo;ve
            been building for the web for years, and went professional in spring 2026, when this studio opened.
          </p>
          <p className="atelier-desktop-only">
            I work from {city}, California, with the full Adobe Creative Cloud suite, DaVinci Resolve, and Blender. The studio
            stays small on purpose, which is why there&rsquo;s a queue.
          </p>
        </div>
        <ul className="atelier-about-photos" aria-label="More photos of Ben">
          {photos.map((photo) => (
            <li key={photo.src}>
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
      <div className="atelier-overview atelier-desktop-only">
        <span className="atelier-overview-label">What I bring to every project</span>
        <dl className="atelier-bring">
          {capabilities.map(([title, description]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
