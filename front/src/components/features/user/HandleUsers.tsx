import { useRouter } from 'next/router';
import * as Api from '../../../utils/api'

const HandleUsers = () => {
  const router = useRouter()

  const handleResign = async () => {
    try {
      if(window.confirm('탈퇴 이후에 계정 정보를 복구할 수 없습니다. \n 정말로 탈퇴하시겠습니까?')) {
        const res = await Api.post('/user/resign')
        alert('탈퇴에 성공했습니다.')
      }
      router.push('/')
    }
    catch {
      alert('회원 탈퇴에 실패했습니다. 관리자에게 문의하세요.')
    }
  }

  return (
    <>
      <div className="flex flex-col mt-[20vh] ml-[10vw] gap-3">
        <div className="mb-3 center-container">
          <div className="mb-3 username text-2xl font-bold">
            마이페이지
          </div>

          <div className="mt-3">
            <input
              className="border rounded p-2"
              type="text"
              placeholder="현재 비밀번호"
            ></input>
          </div>
          <div className="mt-3">
            <input
              className="border rounded p-2"
              type="text"
              placeholder="비밀번호입력"
            ></input>
          </div>
          <div className="mt-3">
            <input
              className="border rounded p-2"
              type="text"
              placeholder="비밀번호확인"
            ></input>
          </div>
          <div className="mt-3">비밀번호 변경</div>
          <button className="mt-[20vh] text-slate-400" onClick={handleResign}>회원탈퇴</button>
        </div>
      </div>
    </>
  );
};

export default HandleUsers;
