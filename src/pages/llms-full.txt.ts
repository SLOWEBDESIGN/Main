import type { GetServerSideProps } from "next";
import { studioMarkdown } from "@/src/lib/studioContent";
import { getRequestBrandVariant } from "@/src/lib/schema";
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("Vary", "Host, X-Forwarded-Host");
  res.end(studioMarkdown(getRequestBrandVariant(req.headers)));
  return { props: {} };
};
export default function TextIndex() {
  return null;
}
