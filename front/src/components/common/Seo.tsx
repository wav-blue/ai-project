import Head from "next/head";

interface SEOProps {
  title: string;
}

 const Seo = (props: SEOProps) => {
  const { title } = props;

  return (
    <Head>
      <title>{`AI Guru | ${title}`}</title>
      <meta name="description" content="똑똑한 연애 AI 구루에게 연애 고민을 털어놓고 솔루션을 받아보세요!" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="AI 구루 : AI로 환생한 러브 마스터" />
      <meta property="og:description" content="AI 구루에게 연애 상담을 받아보세요." />
      <meta property="og:url" content="http://kdt-ai-9-team01.elicecoding.com" />
      <meta property="og:locale" content="ko_KR" />
    </Head>
  );
}

export default Seo;
