import { useEffect, useState } from 'react';
import { useWriteComment } from '@/src/hooks/api/comment';
import { useRouter } from 'next/router';

const CommentInput = ({ onDataChange }: any) => {
  const [isRefresh, setIsRefresh] = useState(false);
  const sendDataToParent = () => {
    console.log('sendDataToParent 1111111111');
    setIsRefresh(true);
    console.log('sendDataToParent 222222222');
    onDataChange(isRefresh); // 콜백 함수 호출하여 데이터 전달
    console.log('sendDataToParent 33333333333');
  };

  const [userInput, setUserInput] = useState('');
  const router = useRouter();
  const boardId = router.query;

  const writeComment = useWriteComment();

  const handleSubmit = async () => {
    writeComment.mutate({
      boardId: boardId.postId,
      content: userInput,
    });
    console.log('동작 확인');
  };
  useEffect(() => {
    if (writeComment.isSuccess && writeComment.data) {
      console.log('댓글 작성 성공');
      setUserInput('');
      setIsRefresh(true);
      sendDataToParent();
    }
  }, [writeComment.data, writeComment.isSuccess]);

  return (
    <div className="flex flex-row gap-10">
      <input
        className="bg-white p-4 m-1 border-2 border-red-300 w-5/6"
        type="text"
        placeholder="댓글을 입력해 주세요"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
      ></input>
      <button
        className="rounded border-2 w-1/12 border-gray-300"
        onClick={handleSubmit}
      >
        작성
      </button>
    </div>
  );
};

export default CommentInput;
