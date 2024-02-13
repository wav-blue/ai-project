import { RootState } from '@/src/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/src/store/user';
import { useEmailLogin } from '@/src/hooks/api/user';
import Link from 'next/link';

const WelcomePage = () => {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      
      
    </div>
    
  );
};

export default WelcomePage;
