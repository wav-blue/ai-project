import { Component, ComponentType, createElement, ReactNode, ErrorInfo } from 'react'

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
}

type FallbackProps = {
  error: CustomError | null;
}

type ErrorBoundaryProps = {
  fallback: ComponentType<FallbackProps>;
  children: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false, // 오류 발생 여부를 state로 저장
      error: null, // 발생한 오류 정보를 state 상태로 저장
    }
  };
    
  // 하위 컴포넌트에서 오류의 정보를 return을 통해서 state에 저장
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true, 
      error, 
    }
  }

  // 오류 정보와 상세 정보를 파라미터로. 오류를 로깅하는 역할
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log({ error, errorInfo })
  }

  render() {
    const { state, props } = this;
    const { hasError, error } = state;
    const { fallback, children } = props;
    const fallbackProps: FallbackProps = {
      error,
    }

    const fallbackComponent = createElement(fallback, fallbackProps);

    // 오류 발생 여부를 체크하여 조건부 렌더링 처리
    return hasError ? fallbackComponent : children;
  }
}

interface CustomError extends Error {
  status?: number;
}

const FallbackComponent = ({ error }: FallbackProps) => {
  if (error && error.status) return <p>{error.status} 에러 발생</p>
  return <p>프론트 코드 오류</p>
}

export default FallbackComponent