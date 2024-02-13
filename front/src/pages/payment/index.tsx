import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { saveInfo } from '@/src/store/payment';
import { PaymentType } from '@/src/components/types/PaymentTypes';
import { useRouter } from 'next/router';
import withAuth from '@/src/hocs/withAuth';
import Seo from '@/src/components/common/Seo';

const PaymentPage = () => {
  const userId = useSelector((state: RootState) => state.user.user.userId);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClick = (payment: PaymentType) => {
    dispatch(saveInfo({ info: payment }));
    router.push('/payment/checkout');
  };

  return (
    <div className="mt-24 text-3xl font-semibold flex flex-col items-center">
      <Seo title='결제' />
      <h2 className="mb-10">원하는 멤버십을 선택하세요.</h2>

      <div className="flex flex-col gap-4 items-center">
        <div className="flex-1 border-2 border-stone-500 p-4 w-[500px] mt-10 mb-10 bg-white/90">
          <div className="mb-4">
            <button
              className="text-white bg-yellow-500 px-4 py-2 rounded hover:bg-[#e99801]"
              onClick={() =>
                handleClick({ membership: 'membership_product_1', price: 6990 })
              }
            >
              Basic Plan
            </button>
          </div>
          <div className="text-lg">가격</div>
          <div className="text-xl font-bold">월 6,990원</div>
          <div className="text-lg">질문 횟수</div>
          <div className="text-xl font-bold">50건</div>
        </div>

        <div className="flex-1 border-2 border-stone-500 p-4 w-[500px] bg-white/90">
          <div className="mb-4">
            <button
              className="text-white bg-pink-500 px-4 py-2 rounded hover:bg-[#eb125a]"
              onClick={() =>
                handleClick({
                  membership: 'membership_product_2',
                  price: 12990,
                })
              }
            >
              Premium Plan
            </button>
          </div>
          <div className="text-lg">가격</div>
          <div className="text-xl font-bold">월 12,990원</div>
          <div className="text-lg">질문 횟수</div>
          <div className="text-xl font-bold">무제한</div>
        </div>
      </div>
    </div>
  )
};

export default withAuth(PaymentPage);
