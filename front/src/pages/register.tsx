import { useEffect, useState } from 'react';
import { useRegister } from '../hooks/api/user';
import { useRouter } from 'next/router';
import * as Api from '../utils/api';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const router = useRouter();

  const register = useRegister();

  const handleSubmit = () => {
    register.mutate({ email: email, password: password, logintype: 'EMAIL' });
  };

  if (register.isSuccess) {
    alert(`${email}님 환영합니다.`);
    router.push('/login');
  }

  if (register.error) {
    console.log(register.error);
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <div className="form flex flex-col gap-4 my-10 w-full max-w-[350px] min-h-500 border-2 bg-white">
        <div className="my-10 flex justify-center">회원가입</div>
        <input
          type="text"
          placeholder="email을 입력해주세요."
          onChange={e => setEmail(e.target.value)}
          className="border-2 border-black"
        />
        <input
          type="password"
          placeholder="비밀번호를 입력해주세요."
          onChange={e => setPassword(e.target.value)}
          className="border-2 border-black"
        />
        {confirm !== password ? (
          <input
            type="password"
            placeholder="비밀번호를 다시 한 번 입력해주세요."
            onChange={e => setConfirm(e.target.value)}
            className="border-2 border-[#cf0404]"
          />
        ) : (
          <input
            type="password"
            placeholder="비밀번호를 다시 한 번 입력해주세요."
            onChange={e => setConfirm(e.target.value)}
            className="border-2 border-black"
          />
        )}
        <button className="border-2" onClick={handleSubmit}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
