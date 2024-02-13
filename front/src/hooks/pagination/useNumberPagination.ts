import { useEffect, useState } from "react";

interface UsePaginationArgs {
  totalElements: number;
  defaultPage: number;
}
const useNumberPagination = ({ totalElements, defaultPage }: UsePaginationArgs) => {
  const [nowPage, setNowPage] = useState(defaultPage);
  const pages: number[] = []; // totalElements와 현재 클릭된 nowPage 기준으로 그려져야될 Page Block들;

  const handleClickPage = (page: number) => {
    setNowPage(page);
  };
  const handleClickNext = () => {};
  const handleClickPrev = () => {};

  return {
    pages,
    nowPage,
    handleClickPage,
    handleClickNext,
    handleClickPrev,
  };
};
export default useNumberPagination;