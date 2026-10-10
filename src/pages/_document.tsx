import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
} from 'next/document';
import { getBrandCopy, getRequestBrandVariant, type BrandVariant } from '@/src/lib/schema';

export default class MyDocument extends Document<{ variant: BrandVariant }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initial = await Document.getInitialProps(ctx);
    return { ...initial, variant: getRequestBrandVariant(ctx.req?.headers ?? {}) };
  }

  render() {
    const copy = getBrandCopy(this.props.variant);
    return (
      <Html lang="en">
        <Head>
          {/* Favicon */}
          <link id="studio-favicon" rel="icon" type="image/svg+xml" href={copy.favicon} />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#111111" />
          <link rel="manifest" href="/brand.webmanifest" />
          <meta name="theme-color" content="#3d5e3f" />

          {/* Google Analytics */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                  `,
                }}
              />
            </>
          )}

          {/* Meta */}
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
