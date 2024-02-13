import Link from 'next/link';
//import styles from './Pagination.module.scss';
import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface IProps {
  currentPage: number;
  totalContents: number;
  bNumber: string | string[] | undefined;
  paginate: (pageNumber: number) => void;
  contentsPerPage: number;
}

function Pagination({
  totalContents,
  bNumber,
  contentsPerPage,
  paginate,
}: IProps) {
  // const router = useRouter();
  // const { boardNumber } = router.query;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const maxPageNum = Math.ceil(totalContents / contentsPerPage);
  const page_num_per_block = 5; //한 블록 당 페이지 개수
  // 현재 블록 위치 : 올림(현재페이지 / 한 블록 당 페이지 개수)
  const nowBlock = Math.ceil(currentPage / page_num_per_block);
  // 한 블록에서 페이지 시작 번호 : 현재블록 *  한 블록 당 페이지 개수 - ( 한 블록 당 페이지 개수 -1)
  const start_page = nowBlock * page_num_per_block - (page_num_per_block - 1);
  let left_start_page = 1;
  if (nowBlock == 1) {
    console.log('현재 블럭은 첫번째 블럭입니다 : ', nowBlock);
  } else {
    left_start_page =
      (nowBlock - 1) * page_num_per_block - (page_num_per_block - 1);
  }

  //마지막 블럭 게산
  const lastBlock = Math.ceil(maxPageNum / page_num_per_block);
  let right_start_page = maxPageNum;

  if (nowBlock == lastBlock) {
    console.log('현재 블럭은 마지막 블럭입니다 : ', nowBlock);
  } else {
    right_start_page =
      (nowBlock + 1) * page_num_per_block - (page_num_per_block - 1);
  }

  const pageNumbers: number[] = [];
  for (let i = start_page; i <= start_page + 4; i++) {
    start_page + 4;
    console.log('start_page : ', start_page);
    console.log('maxPageNum : ', maxPageNum);
    if (i <= maxPageNum) {
      pageNumbers.push(i);
    } else {
      console.log('마지막 페이지입니다.(더 이상 페이지가 없습니다.)');
    }
  }

  const updatePageNumbers = (page: number) => {
    return pageNumbers.slice(0, 5);
  };

  const [, setCurrentNumbers] = useState(updatePageNumbers(1));

  const visiblePageNumbers = updatePageNumbers(currentPage);

  const goToFirstPage = () => {
    setCurrentPage(1);
    paginate(1);
  };

  const goToLastPage = () => {
    setCurrentPage(maxPageNum);
    paginate(maxPageNum);
  };

  const handleClick = (number: number) => {
    setCurrentPage(number);
    setCurrentNumbers(updatePageNumbers(number));
    paginate(number);
  };

  const goToBlock = (number: number) => {
    setCurrentPage(number);
    setCurrentNumbers(updatePageNumbers(number));
    paginate(number);
  };

  return (
    <>
      <div className="flex justify-center items-center gap-4 m-16">
        <div className="flex justify-center items-center gap-4 m-16">
          <li>
            <Link
              href={`${bNumber}?page=1`}
              onClick={() => goToFirstPage()}
              className='border-none rounded-md px-8 py-8 m-0 bg-black text-white text-1rem transition duration-300 ease-in-out hover:bg-tomato hover:cursor-pointer hover:transform-translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" aria-current="true"'
            >
              {'<<'}
            </Link>
          </li>
          <li>
            <Link
              href={`${bNumber}?page=${left_start_page}`}
              onClick={() => goToBlock(left_start_page)}
              className='border-none rounded-md px-8 py-8 m-0 bg-black text-white text-1rem transition duration-300 ease-in-out hover:bg-tomato hover:cursor-pointer hover:transform-translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" aria-current="true"'
            >
              {'<'}
            </Link>
          </li>
          {visiblePageNumbers.map(number => {
            return (
              <>
                <li key={number}>
                  {currentPage == number ? (
                    <Link
                      href={`${bNumber}`}
                      onClick={() => handleClick(number)}
                      className='border-none rounded-md px-8 py-8 m-0 bg-gray-400 text-white text-1rem transition duration-300 ease-in-out hover:bg-tomato hover:cursor-pointer hover:transform-translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" aria-current="true"'
                    >
                      {number}
                    </Link>
                  ) : (
                    <Link
                      href={`${bNumber}?page=${number}`}
                      onClick={() => handleClick(number)}
                      className='border-none rounded-md px-8 py-8 m-0 bg-black text-white text-1rem transition duration-300 ease-in-out hover:bg-tomato hover:cursor-pointer hover:transform-translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" aria-current="true"'
                    >
                      {number}
                    </Link>
                  )}
                </li>
              </>
            );
          })}
          <li>
            <Link
              href={`${bNumber}?page=${right_start_page}`}
              onClick={() => goToBlock(right_start_page)}
              className='border-none rounded-md px-8 py-8 m-0 bg-black text-white text-1rem transition duration-300 ease-in-out hover:bg-tomato hover:cursor-pointer hover:transform-translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" aria-current="true"'
            >
              {'>'}
            </Link>
          </li>
          <li>
            <Link
              href={`${bNumber}?page=${maxPageNum}`}
              onClick={() => goToLastPage()}
              className='border-none rounded-md px-8 py-8 m-0 bg-black text-white text-1rem transition duration-300 ease-in-out hover:bg-tomato hover:cursor-pointer hover:transform-translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" aria-current="true"'
            >
              {'>>'}
            </Link>
          </li>
        </div>
      </div>
    </>
  );
}

export default Pagination;
