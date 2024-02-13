import { useMemberShip } from '@/src/hooks/api/user';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { MembershipType } from '../../types/UserTypes';

const HandleServices = () => {
  const [data, setData] = useState<MembershipType>();
  const [service, setService] = useState('없음');
  const membership = useMemberShip();

  useEffect(() => {
    if(membership.data) {
      setData(membership.data.data)
      setService(membership.data.data.usingService)
    }

    if(membership.error) {
      console.log(membership.error);
      
    }
  }, [membership.data, membership.error])

  return (
    <div className="flex flex-col items-center gap-5 mt-[20vh]">
      <div className="mb-10 username text-2xl font-bold">
        멤버십
      </div>
      <div>이용중인 서비스: {service}</div>
      {service === '없음' &&
        <Link href="/payment">
        <button className="p-1 mb-4 rounded-md hover:bg-[#c0bbbc] drop-shadow-lg z-10">
          멤버십 가입
        </button>
      </Link>}
      {data?.remainChances &&
        <div>
          남은 횟수: {data?.remainChances}
        </div>
      }
    </div>
  );
};

export default HandleServices;
