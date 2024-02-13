import Seo from '@/src/components/common/Seo';
import Link from 'next/link';

const KakaoLoginPage = () => {

  const handleLogin = async () => {
    try {
      location.href = 'http://kdt-ai-9-team01.elicecoding.com:5001/api/user/login/kakao'
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <Seo title='카카오 소셜 로그인' />
      <div className="my-20">
        간편하게 로그인하고 다양한 서비스를 사용해보세요!
      </div>

      <button className="flex items-center justify-center h-10 w-60 mb-2 rounded-md shadow bg-yellow-500 text-center" onClick={handleLogin}>
        <img src="/images/kakao.png" className="h-full mr-2"></img>
        카카오 계정으로 로그인
      </button>
      
      <Link href="/login">
        <div className="flex items-center justify-center  text-center">
          다른 방법으로 시작하기
        </div>
      </Link>
    </div>
  );
};

export default KakaoLoginPage;
