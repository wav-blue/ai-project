import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  page: 1
};

export const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    savePage: (state, action) => {
      state.page = action.payload;
    },
    resetPage: state => {
      Object.assign(state, initialState);
    },
  },
});

export const { savePage, resetPage } = pageSlice.actions;
export default pageSlice.reducer;
