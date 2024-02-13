import { useRouter } from "next/router";
import { useValidation } from "../hooks/api/user";
import { useEffect, ComponentType, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../store/user";
import { RootState } from '@/src/store';

const withAuth = <P extends {}>(WrappedComponent: ComponentType<P>) => {
  return function AuthComponent (props: P) {
    const router = useRouter();
    const validation = useValidation();
    const dispatch = useDispatch();
    const userState = useSelector((state: RootState) => state.user.user);



    useEffect(() => {
      const pathSegment = router.pathname.split('/')[1];
      const isNumeric = !isNaN(parseInt(pathSegment));
      const privatePaths = ['/mypage', '/board/write', '/board/edit']

      validation.executeQuery();

      if (validation.data) {
        dispatch(login({ user: validation.data.data }));
      }

      if (validation.error && (privatePaths.includes(router.pathname) || isNumeric)) {
        if (userState.userId !== '0') {
          dispatch(logout())
        }
        router.push('/login')
      }

      const checkAuth = () => {
        validation.executeQuery();
        if (validation.data) {
          dispatch(login({ user: validation.data.data }));
        }
      };

      const interval = setInterval(() => {
        checkAuth();
      }, 600000);

      return () => clearInterval(interval);
    }, [router, validation, router.pathname]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;