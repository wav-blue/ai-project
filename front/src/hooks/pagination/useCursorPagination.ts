import { useState, useEffect, useCallback } from 'react';

interface FetchMoreResult {
  data: any[];
  nextCursor: string | null;
}

interface UseInfiniteScrollProps {
  initialCursor: string;
  fetchMore: (cursor: string) => Promise<FetchMoreResult>;
}

export const useInfiniteScroll = ({ initialCursor, fetchMore }: UseInfiniteScrollProps) => {
  const [data, setData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 데이터 불러오는 함수
  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;

    setLoading(true);
    try {
      const { data: newData, nextCursor } = await fetchMore(cursor);
      setData((prevData) => [...newData, ...prevData]); // 새로운 데이터를 기존 데이터 앞에 추가
      setCursor(nextCursor);
    } catch (err) {
    if (err instanceof Error) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, fetchMore]);

  // Intersection Observer를 이용한 스크롤 감지 및 데이터 로딩
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '100px', // 뷰포트 상단으로부터 100px 전에 로딩 시작
        threshold: 0.01, // 타겟 요소가 1% 보일 때 콜백 실행
      }
    );

    // 스크롤 감지할 요소 설정
    const anchorElement = document.getElementById('infinite-scroll-anchor');
    if (anchorElement) {
      observer.observe(anchorElement);
    }

    return () => {
      if (anchorElement) {
        observer.disconnect();
      }
    };
  }, [loadMore]);

  return { data, loading, error, loadMore };
};