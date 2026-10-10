import type { GetServerSideProps } from "next";
import { getBrandCopy, getRequestBrandVariant } from "@/src/lib/schema";
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const copy = getBrandCopy(getRequestBrandVariant(req.headers));
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Vary", "Host, X-Forwarded-Host");
  res.end(
    `# ${copy.siteName}\n\n> Independent digital design in ${copy.city}, California. Websites, reels, visual content, extensions, and business systems.\n\n## Public information\n\n- [Full studio information](${copy.canonical}/llms-full.txt): Services, selected projects, process, tools, and contact details.\n- [Accessible studio index](${copy.canonical}/machine): The same information in readable HTML.\n- [Structured data](${copy.canonical}/studio.json): Public studio facts in JSON.\n- [Visual portfolio](${copy.canonical}/#work): Local-build previews.\n- [Project inquiries](${copy.canonical}/#queue): Introduce a project.\n`,
  );
  return { props: {} };
};
export default function Index() {
  return null;
}
