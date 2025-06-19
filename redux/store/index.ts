import { configureStore, combineReducers} from '@reduxjs/toolkit'
import walletReducer from '@/redux/slices/walletsSlice'
import clientReducer from '@/redux/slices/clientSlice'
import themeReducer from '@/redux/slices/themeSlice'

const rootReducer = combineReducers({
  wallet: walletReducer,

  client: clientReducer,

  
  theme: themeReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch