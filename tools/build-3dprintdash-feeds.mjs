/**
 * Regenerate the 3D Print Dash service site's RSS feeds from their JSON files.
 *
 * That site (status / blog / changelog / incidents / security / subprocessors) is hosted
 * out of this repo's public/3dprintdash/ because it must NOT share infrastructure with the
 * 3D Print Dash app it reports on: a status page that dies with the thing it monitors is
 * worthless at the only moment it matters. It is plain static HTML and is deliberately
 * untouched by this site's Next build.
 *
 * Static hosting cannot build a feed on request, so the feed is a real file that has to be
 * rewritten when the JSON changes. Run this after editing blog/posts.json or
 * incidents/incidents.json, then commit both:
 *
 *   node tools/build-3dprintdash-feeds.mjs
 *
 * No dependencies on purpose. This repo has no package.json and should not grow one: the
 * whole point of it is that any host can serve it with no build step.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "3dprintdash");

/** The hostname the pages are SERVED on, not this repo's own domain. */
const SITE = "https://status.3dprintdash.com";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

/** RFC-822, which is what RSS wants. Dates in the JSON are plain YYYY-MM-DD. */
const rfc822 = (d) => new Date(`${d}T12:00:00Z`).toUTCString();

function feed({ out, title, description, path, items }) {
  const entries = [...items]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((i) => {
      const link = i.link ?? `${SITE}${path}${i.slug ? `${i.slug}/` : ""}`;
      return `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(i.guid ?? link + "#" + i.date)}</guid>
      <pubDate>${rfc822(i.date)}</pubDate>
      <description>${esc(i.summary ?? i.impact ?? i.body ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${SITE}${path}</link>
    <atom:link href="${SITE}${path}feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(description)}</description>
    <language>en-us</language>
${entries}
  </channel>
</rss>
`;
  writeFileSync(join(ROOT, out), xml);
  console.log(`${out}  (${items.length} item${items.length === 1 ? "" : "s"})`);
}

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

feed({
  out: "blog/feed.xml",
  title: "3D Print Dash — Blog",
  description: "Posts about 3D printing, distributed manufacturing, and how 3D Print Dash is built.",
  path: "/blog/",
  items: read("blog/posts.json"),
});

feed({
  out: "incidents/feed.xml",
  title: "3D Print Dash — Incidents",
  description: "Incident reports for 3D Print Dash: what happened, and what changed because of it.",
  path: "/incidents/",
  items: read("incidents/incidents.json").map((i) => ({ ...i, link: `${SITE}/incidents/` })),
});
