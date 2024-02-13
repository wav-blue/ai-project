import { RootState } from '@/src/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/src/store/user';
import { useEmailLogin } from '@/src/hooks/api/user';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Seo from '@/src/components/common/Seo';

const EmailLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const userState = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

   const emailLogin = useEmailLogin()
 
  const handleSubmit = () => {
    emailLogin.mutate({email: email, password: password});
  };

  useEffect(() => {
    console.log(userState);
  }, [userState]);

  useEffect(() => {
    if (emailLogin.isSuccess && emailLogin.data) {
      const userData = emailLogin.data.data;
      dispatch(login({ user: userData }));
      console.log(userData)
      alert('로그인 성공');
      router.push('/');
    }

    if (emailLogin.error) {
      alert('로그인에 실패했습니다.');
    }
  }, [emailLogin.isSuccess, emailLogin.data, emailLogin.error, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <Seo title='email 로그인' />
      <div className="my-20">
        간편하게 로그인하고 다양한 서비스를 사용해보세요!
      </div>
      <div className="flex flex-col items-center">
        <div className="form flex flex-col gap-4 my-10 w-60">
          <input
            type="text"
            placeholder="email을 입력해주세요."
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border-2 border-black"
            autoComplete='off'
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border-2 border-black"
            autoComplete='off'
          />
          <button type='submit' className="flex items-center justify-center h-10 w-15 mb-2 rounded-md shadow bg-white text-center" onClick={handleSubmit}> 로그인</button>
        </div>

        <Link href="/login">
          <div className="flex items-center justify-center  text-center">
            다른 방법으로 로그인
          </div>
        </Link>
      </div>
    </div>
    
  );
};

export default EmailLoginPage;
