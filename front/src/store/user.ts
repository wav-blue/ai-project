import { createSlice } from '@reduxjs/toolkit';
import { LoginResponseType } from '../components/types/UserTypes';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: LoginResponseType = {
  user: {
    userId: '0',
    logintype: '안함',
    // mebership: {
    //   userId: '',
    //   start_at: defaultDate,
    //   end_at: defaultDate,
    //   usingService: '',
    //   remainChances: 5,
    //   created_at: defaultDate,
    //   updated_at: defaultDate,
    //   deleted_at: defaultDate,
    // }
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginResponseType>) => {
      state.user = action.payload.user;
    },
    logout: state => {
      Object.assign(state, initialState);
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
