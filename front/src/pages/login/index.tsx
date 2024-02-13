import Seo from '@/src/components/common/Seo';
import Link from 'next/link';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <Seo title='로그인' />
      <div className="my-20">
        구루의 회원이 되고 프리미엄 서비스를 사용해보세요!
      </div>

      <Link href="/login/google">
        <div className="flex items-center justify-center h-10 w-60 mb-2 rounded-md shadow bg-white text-center">
          <img src="/images/google.png" className="h-full mr-2"></img>
          구글 계정으로 로그인
        </div>
      </Link>
      <Link href="/login/kakao">
        <div className="flex items-center justify-center h-10 w-60 mb-2 rounded-md shadow bg-white text-center">
          <img src="/images/kakao.png" className="h-full mr-2"></img>
          카카오 계정으로 로그인
        </div>
      </Link>
      <Link href="/login/email">
        <div className="flex items-center justify-center h-10 w-60 mb-2 rounded-md shadow bg-white text-center">
          이메일 계정으로 로그인
        </div>
      </Link>
      <Link href="/register">
        <div className="flex items-center justify-center h-10 w-60 mb-2 rounded-md shadow bg-white text-center">
          이메일 계정으로 회원가입
        </div>
      </Link>
    </div>
  );
};

export default LoginPage;
