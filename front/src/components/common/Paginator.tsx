import { FC } from "react";
import useNumberPagination from "@/src/hooks/pagination/useNumberPagination";

interface PaginatorProps {
  totalElements: number;
  defaultPage: number;
}

const Paginator: FC<PaginatorProps> = ({ totalElements, defaultPage }) => {
  const { pages, handleClickNext, handleClickPrev, handleClickPage } =
    useNumberPagination({ totalElements, defaultPage });

  return (
    <div className={"app-paginator-wrapper"}>
      <span onClick={handleClickPrev}>prev</span>
      {pages.map((page, index) => (
        <span
          onClick={() => handleClickPage(page)}
          key={`page-number-button-${index}`}
        >
          {page}
        </span>
      ))}
      <span onClick={handleClickNext}>next</span>
    </div>
  );
};
export default Paginator;