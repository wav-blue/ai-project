import Link from 'next/link';
import { useRouter } from 'next/router';
import MyPageButton from './MyPageButton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import withAuth from '@/src/hocs/withAuth';

const NavButtons = () => {
  const router = useRouter();
  const position = router.pathname;
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user.user);

  const handleNavigation = (path: string) => {
    
    if (userState.userId === '0') {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  return (
    <div className="absolute top-0 right-0 m-6 z-10">
      {position.includes('write' || 'edit') && (
        <div className="flex flex-row gap-6">
          <Link href="/board">
            <button>
              <img
                src="/images/parthenon.png"
                className="rounded-full h-[30px] w-[30px]"
              ></img>
            </button>
          </Link>
          <Link href="/">
            <button>
              <img
                src="/images/guru.png"
                className="rounded-full h-[33px] w-[33px]"
              ></img>
            </button>
          </Link>
          <MyPageButton />
        </div>
      )}

      {position.includes('/board') && !position.includes('write' || 'edit') && (
        <div className="flex flex-row gap-6">
          <Link href="/board">
            <button>
              <img
                src="/images/parthenon.png"
                className="rounded-full h-[30px] w-[30px]"
              ></img>
            </button>
          </Link>

          <button
            className="flex items-start"
            onClick={() => handleNavigation('/board/write')}
          >
            <img
              src="/images/writing.png"
              className="rounded-full h-[30px] w-[30px]"
            ></img>
          </button>

          <Link href="/">
            <button>
              <img
                src="/images/guru.png"
                className="rounded-full h-[33px] w-[33px]"
              ></img>
            </button>
          </Link>
          <MyPageButton />
        </div>
      )}

      {!position.includes('write') &&
        !position.includes('board') &&
        position != '/' && (
          <div className="flex flex-row gap-6">
            <Link href="/board">
              <button>
                <img
                  src="/images/parthenon.png"
                  className="rounded-full h-[30px] w-[30px]"
                ></img>
              </button>
            </Link>
            <Link href="/">
              <button>
                <img
                  src="/images/guru.png"
                  className="rounded-full h-[33px] w-[33px]"
                ></img>
              </button>
            </Link>
            <MyPageButton />
          </div>
        )}

      {position === '/' && (
        <div className="flex flex-row gap-6">
          <Link href="/board">
            <button>
              <img
                src="/images/parthenon.png"
                className="rounded-full h-[30px] w-[30px]"
              ></img>
            </button>
          </Link>
          <MyPageButton />
        </div>
      )}
    </div>
  );
};

export default withAuth(NavButtons);
