import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ChatResponseType, } from '../components/types/ChatTypes';


const initialState: ChatResponseType = {
  response: [['', 'title'] , ['input', 'output']]
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    saveResult: (state, action: PayloadAction<ChatResponseType>) => {
      state.response = action.payload.response;
    },
  },
});

export const { saveResult } = chatSlice.actions;
export default chatSlice.reducer;
