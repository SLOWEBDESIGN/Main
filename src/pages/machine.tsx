import Head from "next/head";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import {
  getBrandCopy,
  getRequestBrandVariant,
  type BrandVariant,
} from "@/src/lib/schema";
import {
  serviceGroups,
  websiteProjects,
  toolGroups,
  process,
} from "@/src/data/atelier";
import { studioSchema } from "@/src/lib/studioContent";

export const getServerSideProps: GetServerSideProps<{
  variant: BrandVariant;
}> = async ({ req }) => ({
  props: { variant: getRequestBrandVariant(req.headers) },
});

export default function Machine({
  variant,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const copy = getBrandCopy(variant);
  return (
    <>
      <Head>
        <title>{copy.siteName} / Machine-readable studio index</title>
        <meta
          name="description"
          content="A factual, accessible index of studio services, projects, process, and contact information."
        />
        <link rel="canonical" href={`${copy.canonical}/machine`} />
        <link rel="alternate" type="text/markdown" href="/llms-full.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(studioSchema(variant)),
          }}
        />
      </Head>
      <main className="machine-page">
        <nav>
          <a href="/">← Human experience</a>
          <span>PLAIN TEXT / SAME STUDIO</span>
        </nav>
        <header>
          <small>PUBLIC STUDIO INDEX</small>
          <h1>{copy.siteName}</h1>
          <p>
            Independent digital design in {copy.city}, California. Websites,
            reels and visual content, browser extensions, and business systems.
          </p>
        </header>
        <div className="machine-formats">
          <a href="/llms-full.txt">Read Markdown ↗</a>
          <a href="/studio.json">Read JSON ↗</a>
          <a href="/#queue">Introduce a project ↗</a>
        </div>
        <section>
          <h2>What we do</h2>
          {serviceGroups.map((group) => (
            <article key={group.id}>
              <h3>{group.title}</h3>
              <p>{group.detail}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
        <section>
          <h2>Selected work</h2>
          {websiteProjects.map((project) => (
            <article key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p>Capabilities: {project.tags.join(", ")}.</p>
            </article>
          ))}
          <p>
            <a href="/#work">Explore the desktop and mobile previews.</a> These
            are captures from local builds, so public deployments may differ.
          </p>
          <h3>Browser extension</h3>
          <p>
            <strong>Waylight:</strong> a visual reading aid for Chrome, Edge,
            Firefox, and Safari. It adds word anchors, line focus, and optional
            reading fonts as a visual layer; the page&rsquo;s text is never
            rewritten. The homepage runs the real extension, its own popup and
            content script, on a sample page.
          </p>
          <h3>Reels</h3>
          <p>
            Between Stops, Nothing Comes Back, Lambda Casino Night, and two
            3DPrintDash edits, one for printer operators and one for customers.
            The website’s reel previews have no audio tracks.
          </p>
        </section>
        <section>
          <h2>How projects work</h2>
          <ol>
            {process.map(([number, title, text]) => (
              <li key={number}>
                <strong>{title}</strong> {text}
              </li>
            ))}
          </ol>
          <p>
            No pricing is published. Prospective clients apply with a short
            description of the project. Scope, budget, and timing are discussed
            individually once a project is a fit. An application to the project
            queue is not a purchase or guaranteed acceptance.
          </p>
        </section>
        <section>
          <h2>Tools, not clients</h2>
          {toolGroups.map((group) => (
            <p key={group.title}>
              <strong>{group.title}:</strong> {group.tools.join(", ")}.
            </p>
          ))}
          <p>No affiliation or endorsement is implied by a tool listing.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            <a href={`mailto:${copy.contactEmail}`}>
              {copy.contactEmail}
            </a>
            <br />
            {copy.phone && copy.phoneHref && <>
              <a href={copy.phoneHref}>{copy.phone}</a>
              <br />
            </>}
            {copy.city}, California
          </p>
          <a href="/#queue">Project inquiry form →</a>
        </section>
        <footer>
          This is the same public information in a simpler format. No special
          claims or instructions are hidden here for crawlers.
        </footer>
      </main>
    </>
  );
}
