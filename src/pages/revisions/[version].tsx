import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import { RedesignHome } from "@/src/components/RedesignHome";
import { StudioHome } from "@/src/components/studio/StudioHome";

// The preserved local versions are also the source for the portfolio captures.
// Old contact and booking controls are inert; inquiries belong on the current site.
const viewOnly = { inert: "" } as Record<string, string>;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ["1", "2"].map((version) => ({ params: { version } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps<{ version: number }> = async ({ params }) => ({
  props: { version: Number(params?.version) },
});

export default function RevisionArchive({ version }: { version: number }) {
  return (
    <>
      <Head>
        <title>SLO Web Design | Revision {version} archive</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div {...viewOnly}>
        {version === 1 ? <RedesignHome variant="slowebdesign" /> : <StudioHome variant="slowebdesign" />}
      </div>
    </>
  );
}
