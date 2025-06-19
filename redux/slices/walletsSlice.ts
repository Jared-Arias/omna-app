import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import { Wallet } from '@/services/auth/model/auth';

const initialState: { wallets: Wallet[], selectedWallet: string | null , currentIndex: number } = {
  wallets: [],
  selectedWallet: '',
  currentIndex: 0
}

const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    setWallets(state, action: PayloadAction<Wallet[]>) {
      state.wallets = action.payload;
    },
    setSelectedWallet(state, action: PayloadAction<string>) {
      state.selectedWallet = action.payload;
    },
    setCurrentIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
    },
  },
})

export const { setWallets, setSelectedWallet, setCurrentIndex } = walletsSlice.actions;
export default walletsSlice.reducer;