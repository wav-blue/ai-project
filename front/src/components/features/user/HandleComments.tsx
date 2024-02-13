import { useUserComment } from '@/src/hooks/api/user';
import { useEffect, useState } from 'react';
import { CommentsProps } from '../../types/CommentTypes';
import Comments from '../comment/Comments';

const HandleComments = () => {
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState<CommentsProps>();
  let limit = 15;
  const getComments = useUserComment(`?page=${page}&limit=${limit}`);

  useEffect(() => {
    if (getComments.data?.data) {
      setComments(getComments.data?.data);
    }
  }, [getComments.data]);

  return (
    <div className="flex flex-col mt-[20vh]">
      <div className="mb-10 username text-2xl font-bold">
        댓글 관리
      </div>
      {comments && 
        <Comments 
          count={comments.count} 
          list={comments.list}             
          positiveCount={comments.positiveCount}
          negativeCount={comments.negativeCount}
        />}
    </div>
  );
};

export default HandleComments;
