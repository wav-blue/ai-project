import React from 'react';
import { CommentsProps } from '../../types/CommentTypes';
import Image from 'next/image';

// interface IProps {
//   currentPage: number;
//   totalContents: number;
//   paginate: (pageNumber: number) => void;
//   contentsPerPage: number;
// }

// const CommentAnalysis: React.FC<CommentAnalysisProps> = ({ commentsProps }) => {
const CommentAnalysis = ({ positiveCount, negativeCount }: CommentsProps) => {
  const analyzeComments = () => {
    // positive와 negative의 비율 계산
    const totalComments = positiveCount + negativeCount;
    const positivePercentage = (positiveCount / totalComments) * 100;
    const negativePercentage = (negativeCount / totalComments) * 100;

    return {
      positivePercentage,
      negativePercentage,
    };
  };

  const renderImages = () => {
    const { positivePercentage, negativePercentage } = analyzeComments();
    if (isNaN(positivePercentage) || isNaN(negativePercentage)) {
      return <div>아직 의견을 남겨 준 제자가 없어요.</div>;
    }
    console.log('Percentage 확인: ', positivePercentage, negativePercentage);

    // 이미지를 반복해서 출력할 숫자 (10으로 나누고 반올림)
    let positiveLength = Math.round(positivePercentage / 10);
    let negativeLength = Math.round(negativePercentage / 10);

    // ex. 55%, 45%인 경우에 6, 5개로 둘다 올림되기 때문에 negative만 1 감소
    if (negativePercentage % 10 === 5) {
      negativeLength -= 1;
    }

    return (
      <div>
        <div className="flex items-center mb-2">
          {/* Smile 이미지 */}
          <Image
            src="/images/happy.png"
            alt="smile"
            className="mr-2"
            width={positivePercentage * 1.5}
            height={positivePercentage * 1.5}
          />

          {/* Angry 이미지 */}
          <Image
            src="/images/angry.png"
            alt="angry"
            width={positivePercentage * 1.5}
            height={positivePercentage * 1.5}
          />
        </div>
        <div>
          <div className="flex items-center">
            {Array.from({ length: positiveLength }).map(function (_, idx) {
              return (
                <Image
                  src="/images/happy.png"
                  alt="smile"
                  width={40}
                  height={40}
                  key={idx}
                />
              );
            })}

            {Array.from({ length: negativeLength }).map(function (_, idx) {
              return (
                <Image
                  src="/images/angry.png"
                  alt="angry"
                  width={40}
                  height={40}
                  key={idx}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 ml-6 bg-pink-50 w-[700px] h-[200px]">
      <h3 className="text-lg font-semibold mb-2">
        다른 제자들의 생각은 어떨까요?
      </h3>
      {renderImages()}
    </div>
  );
};

export default CommentAnalysis;
