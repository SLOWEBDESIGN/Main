import type { GetServerSideProps } from "next";
import { studioSchema } from "@/src/lib/studioContent";
import { getRequestBrandVariant } from "@/src/lib/schema";
import { extensionProject, serviceGroups, websiteProjects, toolGroups } from "@/src/data/atelier";
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Vary", "Host, X-Forwarded-Host");
  res.end(
    JSON.stringify({
      studio: studioSchema(getRequestBrandVariant(req.headers)),
      services: serviceGroups,
      projects: websiteProjects.map(({ url: _url, ...project }) => project),
      tools: toolGroups,
      extension: extensionProject,
      pricing:
        "No published pricing. Scope and budget are discussed individually after an application.",
      previewNote:
        "Website previews are captures of local builds. The Waylight preview runs the real extension on a sample page.",
    }),
  );
  return { props: {} };
};
export default function StudioJson() {
  return null;
}
