import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>{`AI Guru | 러브 마스터 `}</title>
        <meta name="description" content="똑똑한 연애 AI 구루에게 연애 고민을 털어놓고 솔루션을 받아보세요!" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI 구루 : AI로 환생한 러브 마스터" />
        <meta property="og:description" content="AI 구루에게 연애 상담을 받아보세요." />
        <meta property="og:url" content="http://kdt-ai-9-team01.elicecoding.com" />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
