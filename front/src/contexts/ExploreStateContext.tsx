import { createContext, useContext, useReducer } from 'react';

// 초기 상태
const initialState = {
  page: 1,
  limit: 20,
  type: 'All',
  riskLv: 'All',
  loc: 'All',
  sect: 'All',
  exchg: 'All',
  weather: 'All',
  search: '',
  currency: 'KRW',
  priceOrder: 'neutral',
  lossOrder: 'neutral',
  priceChgOrder: 'neutral',
};

// Reducer 함수 정의
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LIMIT':
      return { ...state, limit: action.payload };
    case 'SET_TYPE':
      return { ...state, type: action.payload };
    case 'SET_RISK_LV':
      return { ...state, riskLv: action.payload };
    case 'SET_LOC':
      return { ...state, loc: action.payload };
    case 'SET_SECT':
      return { ...state, sect: action.payload };
    case 'SET_EXCHG':
      return { ...state, exchg: action.payload };
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_PRICE_ORDER':
      return { ...state, priceOrder: action.payload };
    case 'SET_LOSS_ORDER':
      return { ...state, lossOrder: action.payload };
    case 'SET_PRICE_CHG_ORDER':
      return { ...state, priceChgOrder: action.payload };
    case 'RESET_VALUE':
      return initialState;
    default:
      return state;
  }
};

const ExploreStateContext = createContext(initialState);

// Explore 상태 훅
export const useExploreState = () => useContext(ExploreStateContext);

// ExploreStateProvider 컴포넌트
// export const ExploreStateProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   return (
//     <ExploreStateContext.Provider value={{ state, dispatch }}>
//       {children}
//     </ExploreStateContext.Provider>
//   );
// };
