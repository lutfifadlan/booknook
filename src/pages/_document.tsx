import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-gradient-to-r from-blue-50 to-gray-100">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap" rel="stylesheet" />
      </Head>
      <body className="h-full font-indie">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}