import {
  formats,
  modules,
} from '@/src/components/features/board/EditorSetting';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import Link from 'next/link';
import { useHandleImage, useWriteBoard } from '@/src/hooks/api/board';


const BoardWrite = () => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  //태그속성추가
  const [tag, setTag] = useState('love');
  let newContent = '';
  // content에서 이미지의 src를 추출 및 디코딩하는 커스텀훅
  const imgHook = useHandleImage();

  const boardWrite = useWriteBoard();

  const handleWrite = async () => {
    if (typeof window !== 'undefined') {
      const parse = await imgHook.parse(content, title);

      if (parse.filenames) {
        const preUrls = await imgHook.getUrl(parse.filenames);
        const imgUrls = await imgHook.imgToS3(preUrls, parse.decodedImages);

        if (imgUrls) {
          newContent = imgHook.change(
            content,
            imgUrls,
            parse.base64ImageIndexes,
          );
          
          boardWrite.mutate({ title: title, content: newContent, tag: tag });
        }
      } else {
        boardWrite.mutate({ title: title, content: content, tag: tag });
      }
    }
    //boardWrite.mutate({ title: title, content: content, tag: tag });
  };

  if (boardWrite.isSuccess && boardWrite.data) {
    const response = boardWrite.data.data;
    const boardId = response.boardId;
    router.push(`/board/${boardId}`);
  }

  if (boardWrite.error) {
    console.log(boardWrite.error);
  }

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="text-3xl font-bold mb-6 mt-20">글쓰기</div>
      <input
        className="flex justify-start w-4/5 h-[6vh] mt-10 mb-4 px-4 border border-gray-300 rounded"
        type="text"
        placeholder="제목을 입력하세요"
        onChange={e => setTitle(e.target.value)}
      />
      <select
        className="flex justify-end w-36 h-10 px-4 mr-24 border border-gray-300 rounded"
        onChange={e => setTag(e.target.value)}
      >
        <option value="free">일상고민</option>
        <option value="divorce">이혼</option>
        <option value="love" selected>
          사랑
        </option>
        <option value="marriage">결혼</option>
      </select>
      <ReactQuill
        className="w-[82%] h-[60vh] mb-20 mt-5"
        theme="snow"
        modules={modules}
        formats={formats}
        value={content}
        onChange={e => setContent(e)}
      />
      <div className="flex flex-row">
        <button
          className="w-20 h-10 mr-10 bg-blue-500 text-white rounded hover:bg-blue-700"
          onClick={handleWrite}
        >
          게시
        </button>
        <br />
        <Link href="/board/">
          <button className="w-20 h-10  bg-gray-300 rounded hover:bg-gray-400">
            취소
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BoardWrite;
