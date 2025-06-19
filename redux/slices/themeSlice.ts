import {createSlice, PayloadAction} from '@reduxjs/toolkit'

const initialState: { theme?: string } = {
  theme: 'dark'
}

const theme = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<string>) {
      state.theme = action.payload;
    },
    updateTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setTheme, updateTheme } = theme.actions;
export default theme.reducer;