import { Head, Html, Main, NextScript } from "next/document";

const Document = () => (
  <Html className="h-full bg-white">
    <Head>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <body className="h-full">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
