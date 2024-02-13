import type { AppProps } from 'next/app';
import '../styles/global.css';
import Layout from '../components/features/layout/Layout';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '../utils/ErrorBoundary';
import FallbackComponent from '../utils/ErrorBoundary';
import { useRouter } from 'next/router';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // '/payment'로 시작하는 경로일 때만 특정 CSS 적용
    if (router.pathname.startsWith('/payment')) {
      require('../../public/style.css');
    }
  }, [router.pathname]);

  return (
    <Suspense fallback={<div>로딩중</div>}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ErrorBoundary fallback={FallbackComponent}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ErrorBoundary>
        </Provider>
      </QueryClientProvider>
    </Suspense>
  );
}
