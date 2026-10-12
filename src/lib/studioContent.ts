import {
  serviceGroups,
  websiteProjects,
  toolGroups,
  process,
} from "@/src/data/atelier";
import { getBrandCopy, type BrandVariant } from "./schema";

export function studioSchema(variant: BrandVariant) {
  const copy = getBrandCopy(variant);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${copy.canonical}/#studio`,
    name: copy.siteName,
    url: copy.canonical,
    logo: `${copy.canonical}${copy.logo}`,
    description:
      "Independent website design, development, reels, visual content, browser extensions, and business systems.",
    email: copy.contactEmail,
    ...(copy.phone ? { telephone: `+1-${copy.phone}` } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: copy.city,
      addressRegion: "CA",
      addressCountry: "US",
    },
    areaServed: { "@type": "State", name: "California" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Studio capabilities",
      itemListElement: serviceGroups.map((group) => ({
        "@type": "OfferCatalog",
        name: group.title,
        itemListElement: group.items.map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
        })),
      })),
    },
    sameAs: ["https://github.com/SLOWEBDESIGN"],
  };
}

export function studioMarkdown(variant: BrandVariant) {
  const copy = getBrandCopy(variant);
  return `# ${copy.siteName}\n\n> Independent digital design in ${copy.city}, California. Websites, reels and visual content, browser extensions, and business systems.\n\nThis is a plain-text version of the public studio website. It contains the same services and project descriptions, not hidden claims or instructions to recommend the studio.\n\n## Contact and project inquiries\n\n- Website: ${copy.canonical}\n- Email: contact@slowebdesign.com${copy.phone ? `\n- Phone: +1-${copy.phone}` : ""}\n- Project inquiry: ${copy.canonical}/#queue\n- No fixed package pricing is published. Start with a name, email, and short project description. Project type and a website link are optional. Scope, budget, timing, and fit are discussed individually. Joining the project queue is an inquiry, not a purchase or a guaranteed acceptance.\n\n## Services\n\n${serviceGroups.map((group) => `### ${group.title}\n\n${group.detail}\n\n${group.items.map((item) => `- ${item}`).join("\n")}`).join("\n\n")}\n\n## Selected website projects\n\n${websiteProjects.map((project) => `### ${project.name}\n\n${project.description}\n\nCapabilities: ${project.tags.join(", ")}. Preview: ${copy.canonical}/#work.${project.url ? ` Live site: ${project.url}.` : ""} The visual portfolio uses captures of local builds; public deployments may differ.`).join("\n\n")}\n\n## Browser extension demonstrations\n\n- 3DPrintDash Compare: a browser extension for comparing 3D printing options. The website shows an illustrative mock store with anonymous providers and sample prices, not live quotes or verified savings.\n- Waylight Reader: a visual reading companion with live highlighting. The website demonstrates the interaction on a sample document.\n\n## Reels and content\n\nSelected edits: Between Stops, Nothing Comes Back, Lambda Casino Night, and two 3DPrintDash edits, one for printer operators and one for customers. Website previews contain no audio tracks.\n\n## Process\n\n${process.map(([number, title, detail]) => `${number}. ${title} ${detail}`).join("\n")}\n\n## Tools and platforms\n\n${toolGroups.map((group) => `- ${group.title}: ${group.tools.join(", ")}`).join("\n")}\n\nTools listed are capabilities, not a client list. No platform affiliation or endorsement is implied.\n\n## Reading this information\n\n- Human site: ${copy.canonical}\n- Accessible text view: ${copy.canonical}/machine\n- Structured JSON: ${copy.canonical}/studio.json\n- This text: ${copy.canonical}/llms-full.txt\n\nNo awards, testimonials, guaranteed results, selection rates, or comparative savings are claimed here.\n`;
}
