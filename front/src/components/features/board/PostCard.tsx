import Link from 'next/link';
import { useRouter } from 'next/router';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ko';
const PostCard = (props: BoardDataType) => {
  //const { title, date, postId } = post;
  const { title, createdAt, boardId, tag } = props;
  //한국시간으로 변경하는 로직
  function changeUtcTimeToKst(date: any) {
    // 플러그인 사용
    dayjs.extend(utc);
    dayjs.locale('ko');

    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  //게시글 신고 관련
  const router = useRouter();
  const handleReport = async () => {
    console.log(`신고 화면으로 이동!`);
    router.push({
      pathname: `/board/report`,
      query: {
        boardId,
      },
    });
  };
  return (
    <>
      <Link href={`/board/${boardId}`}>
        <div className="flex justify-center w-[400px] min-h-10 bg-[#fde68a] ">
          <div className="w-5/6 bg-white flex flex-col">
            <div className="font-bold text-xl">{title}</div>
            <div className="text-slate-700">
              {changeUtcTimeToKst(createdAt)}
            </div>
            <div className="text-lg">[{tag}]</div>
          </div>
        </div>
      </Link>
      {/* <button onClick={handleReport}>신고</button> */}
    </>
  );
};

export default PostCard;
