import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { PaymentInfoType } from '../components/types/PaymentTypes';

const initialState = {
  info: {
    membership: '',
    price: 0
  }
}

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    saveInfo: (state, action: PayloadAction<PaymentInfoType>) => {
      state.info = action.payload.info;
    },
  },
});

export const { saveInfo } = paymentSlice.actions;
export default paymentSlice.reducer;
