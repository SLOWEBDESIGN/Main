import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
} from 'next/document';

export default class MyDocument extends Document<DocumentProps> {
  render() {
    return (
      <Html lang="en">
        <Head>
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
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Preconnect */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Georgia:ital@0;1&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* Static form for Netlify Forms detection at build time */}
          {/* This hidden form helps Netlify's form parser detect the contact form during the build process */}
          {/* The actual form is rendered dynamically in the ContactForm component */}
          <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" style={{ display: 'none' }}>
            <input type="text" name="name" />
            <input type="text" name="business" />
            <input type="email" name="email" />
            <input type="tel" name="phone" />
            <input type="url" name="website" />
            <select name="businessType">
              <option></option>
            </select>
            <select name="budget">
              <option></option>
            </select>
            <select name="services">
              <option></option>
            </select>
            <textarea name="description"></textarea>
            <input type="radio" name="contactMethod" value="email" />
            <input type="radio" name="contactMethod" value="phone" />
            <input type="radio" name="contactMethod" value="both" />
            <input type="hidden" name="bot-field" />
            <input type="hidden" name="form-name" value="contact" />
          </form>
        </body>
      </Html>
    );
  }
}
