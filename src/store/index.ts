import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { userReducer } from './user/reducer'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: [...getDefaultMiddleware({ thunk: false })],
})
