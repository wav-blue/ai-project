import {
  ChatResponseType,
  SendingMessageType,
} from '@/src/components/types/ChatTypes';
import { useBaseMutation, useBaseQuery } from './reactQueryConfig';
import * as Api from '../../utils/api';

// 자신이 작성한 게시글 목록 조회
export const useMyBoard = (page: number) => {
  return useBaseQuery(`/boards/my?page=${page}&limit=15`, 'myBoard');
};

interface WriteBoardType {
  title: string;
  content: string;
  tag: string;
}

export const useWriteBoard = () => {
  return useBaseMutation(`/boards`, 'post');
};

export const useEditBoard = () => {
  return useBaseMutation(`/boards`, 'put');
};

// Base64 데이터: 이미지 파일을 64비트 인코딩한 데이터. FileReader()를 통해 변환할 수 있다. quill에서 툴바 옵션으로 넣은 image에 이 과정이 포함되어있다.
// Base64 데이터를 Blob으로 변환하는 함수
const base64ToBlob = (base64: string, mimeType: string) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes.buffer], { type: mimeType });
};

// HTML 컨텐츠에서 이미지를 파싱하고 디코딩하는 함수
const parseAndDecodeImages = async (content: string, title: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');
  const decodedImages: Blob[] = [];
  const filenames: string[] = [];
  const base64ImageIndexes: number[] = [];

  images.forEach((img, idx) => {
    if (img.src.startsWith('https://') || !img.src.startsWith('data:image/')) {
      return;
    }

    const base64Data = img.src.split(',')[1]; // src에서 Base64 데이터만 추출
    const matches = /data:image\/([a-zA-Z]+);base64/.exec(img.src);
    const mimeType = matches && matches[1] ? `image/${matches[1]}` : 'unknown';
    const blob = base64ToBlob(base64Data, mimeType);
    decodedImages.push(blob); // Blob 객체로 저장

    // 이미지 데이터의 확장자 추출
    const extension = matches && matches[1] ? matches[1] : 'unknown';
    filenames.push(`${title}${base64Data.length}.${extension}`);

    // Base64 인코딩된 이미지의 인덱스 저장
    // [1번째 이미지의 img태그 인덱스, ...]
    base64ImageIndexes.push(idx);
  });

  return { decodedImages, filenames, base64ImageIndexes };
};

// presigned-url 요청 함수
const getPreUrl = async (bodyData: string[]) => {
  try {
    const response = await Api.put('/boards/images', { files: bodyData });
    return response.data;
  } catch (err) {
    console.log('presigned url 요청 실패:', err);
  }
};

// 클라 --> S3 전송함수
const putImageToS3 = async (urls: string[], bodyData: Blob[]) => {
  const imgUrls: string[] = [];
  try {
    await Promise.all(
      urls.map(async (url, idx) => {
        const response = await Api.put(url, bodyData[idx]);
        const imgUrl = response.request.responseURL.split('?')[0];
        console.log(response); // 응답값의 형식을 확인하고 올바른 이미지 url을 파싱해야함
        console.log('imgUrl:', imgUrl);
        imgUrls.push(imgUrl);
      }),
    );
  } catch (err) {
    console.log('S3 이미지 전송 오류:', err);
  }
  console.log('imgUrls:', imgUrls);
  return imgUrls;
};

// HTML 컨텐츠에서 이미지를 파싱하고 src를 imgUrl로 변경하는 함수
const updateImageSrcInContent = (
  content: string,
  imgUrls: string[],
  base64ImageIndexes: number[],
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');

  //정확히 해당하는 위치의 src만 변경한다.
  base64ImageIndexes.forEach((index, urlIndex) => {
    if (imgUrls[urlIndex]) {
      images[index].src = imgUrls[urlIndex];
    }
  });

  return doc.body.innerHTML;
};

export const useHandleImage = () => {
  const parse = parseAndDecodeImages;
  const getUrl = getPreUrl;
  const imgToS3 = putImageToS3;
  const change = updateImageSrcInContent;

  return { parse, getUrl, imgToS3, change };
};

//댓글 신고 접수
export const useReportBoard = () => {
  return useBaseMutation('/boards/report', 'post');
  //return useBaseMutation('/board/report', 'post', 'boardComment');
};
