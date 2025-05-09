import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        {/* Preload PapaParse library */}
        <link 
          rel="preload" 
          href="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js" 
          as="script"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Load PapaParse before any client-side scripts */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </Html>
  );
}
