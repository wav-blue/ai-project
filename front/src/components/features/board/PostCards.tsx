import Link from 'next/link';
import PostCard from './PostCard';

const PostCards = ({ count, list }: BoardDataTypeList) => {
  //console.log('dummyData 1111111111111', dummyData);
  //const list = dummyData.list;
  //console.log('list(dummyData.list)', list);
  return (
    <div className="flex flex-col gap-5">
      {list &&
        list.map((data: BoardDataType, idx: number) => (
          <PostCard key={idx} {...data} />
        ))}
    </div>
  );
};

export default PostCards;
