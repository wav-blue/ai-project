import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user';
import chatReducer from './chat'
import pageReducer from './page'
import paymentReducer from './payment'

export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    page: pageReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
