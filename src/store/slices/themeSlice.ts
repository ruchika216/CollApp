import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeType } from '../../theme';

interface ThemeState {
  mode: ThemeType;
}

const initialState: ThemeState = {
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.mode = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
