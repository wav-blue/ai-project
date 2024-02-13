import {
  formats,
  modules,
} from '@/src/components/features/board/EditorSetting';
import { useRouter } from 'next/router';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { useEditBoard, useHandleImage } from '@/src/hooks/api/board';

interface BoardCardTypeMini {
  post: any;
}

const BoardEdit = ({ post }: BoardCardTypeMini) => {
  const router = useRouter();
  const [content, setContent] = useState(post.content);
  const [title, setTitle] = useState(post.title);
  //태그항목추가
  const selectList = ['free', 'divorce', 'love', 'marriage'];
  const [selectedTag, setSelectedTag] = useState(post.tag);
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTag(e.target.value);
  };

  let newContent = '';
  const imgHook = useHandleImage();
  const boardEdit = useEditBoard();
  const boardId = post.boardId;

  const handleEdit = async () => {
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
          setContent(newContent);
          boardEdit.mutate({
            title: title,
            content: newContent,
            tag: selectedTag,
            boardId: boardId,
          });
        }
      } else if (!parse) {
        boardEdit.mutate({
          title: title,
          content: content,
          tag: selectedTag,
          boardId: boardId,
        });
      }
    }
  };

  if (boardEdit.isSuccess && boardEdit.data) {
    router.push(`/board/${boardId}`);
  }

  if (boardEdit.error) {
    console.log(boardEdit.error);
  }

  return (
    <div>
      <div>게시글 수정 페이지</div>
      <input
        type="text"
        style={{
          width: '700px',
          height: '35px',
          marginTop: '20px',
          paddingLeft: '10px',
        }}
        placeholder="제목을 입력하세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div>
        <select onChange={() =>handleSelect} value={selectedTag}>
          {selectList.map(item => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <hr />
        <p>
          Selected: <b>{selectedTag}</b>
        </p>
      </div>
      <ReactQuill
        style={{
          width: '82%',
          height: '60vh',
          marginBottom: '5vh',
          marginTop: '2.5vh',
        }}
        theme="snow"
        modules={modules}
        formats={formats}
        value={content}
        onChange={e => setContent(e)}
      />
      <button onClick={handleEdit}>수정완료</button>
    </div>
  );
};

export default BoardEdit;
