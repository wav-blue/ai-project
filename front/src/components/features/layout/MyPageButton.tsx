import { login, logout } from '@/src/store/user';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogout, useValidation } from '@/src/hooks/api/user';
import { RootState } from '@/src/store';
import withAuth from '@/src/hocs/withAuth';

const MyPageButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user.user);
  const userLogout = useLogout();

  const handleLogout = async () => { 
    userLogout.executeQuery()
  }

  const handleNavigate = (path: string) => {
    if (path === '/login') {
      router.push(path);
    } else if (path === '/mypage') {
      if (isLogin) {
        router.push(path);
      } else {
        alert('로그인이 필요합니다.');
      }
    }
    setIsOpen(false);
  };

  useEffect(() => {
    // 로그아웃 성공 시에만 `isLogin` 상태를 false로 설정
    if (userLogout.data) {
      setIsLogin(false);
      router.push('/')
    } else {
      // 로그아웃 데이터가 없으면 `userState`를 기반으로 `isLogin` 상태를 업데이트
      setIsLogin(userState.userId !== '0');
    }
  }, [userState, userLogout.data]);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        <img
          src="/images/user.png"
          className="rounded-full h-[30px] w-[30px] z-10"
        />
      </button>
      {isOpen && (
        <div
          className="grid grid-cols-1 divide-y mt-2 w-32 bg-white/70 border-2 border-white p-1 rounded-md drop-shadow-xl absolute z-10 right-0"
          onMouseLeave={() => setIsOpen(false)}
        >
          { !isLogin && (
            <button 
              className="rounded-md hover:bg-[#ffffff] drop-shadow-lg z-10"
              onClick={() => handleNavigate('/login')}>
                로그인
            </button>
          )}
          { isLogin &&
          (
            <div className="flex flex-col gap-2">
              <button 
                className="p-1 mb-2 rounded-md hover:bg-[#ffffff drop-shadow-lg z-10"
                onClick={handleLogout}>
                  로그아웃
              </button>
              <button 
                className="p-1 mb-2 rounded-md hover:bg-[#d4d0d1 drop-shadow-lg z-10"
                onClick={() => handleNavigate('/mypage')}>마이페이지</button>
            </div>
          )
          }
          
        </div>
      )}
    </div>
  );
};

export default withAuth(MyPageButton);
