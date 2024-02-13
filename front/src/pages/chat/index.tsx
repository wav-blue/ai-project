import ChattingListBar from '@/src/components/features/layout/ChattingListBar';
import { useState } from 'react';
import SurveyBox from '@/src/components/features/chat/SurveyBox';
import Seo from '@/src/components/common/Seo';

const AIsurveyPage = () => {

  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <Seo title='사전 조사' />
      <ChattingListBar />
      <div className='mx-[20vh] flex flex-col items-center'>
        <div className="mt-20">
          <SurveyBox />
        </div>
        <img src="/images/guru.png" alt='guru' className="h-[300px] mt-20 fixed bottom-[50px]"></img>
      </div>
    </div>
  );
};

export default AIsurveyPage;
