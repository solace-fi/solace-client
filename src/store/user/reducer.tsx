import { CONNECT_USER, DISCONNECT_USER } from './types'
import { AnyAction } from 'redux'

interface UserState {
  userAddress: string | null
}

const initialState: UserState = { userAddress: null }

export const userReducer = (state = initialState, action: AnyAction): UserState => {
  const { type, payload } = action
  switch (type) {
    case CONNECT_USER: {
      const { userAddr } = payload
      return {
        ...state,
        userAddress: userAddr,
      }
    }
    case DISCONNECT_USER: {
      return {
        ...state,
        userAddress: null,
      }
    }
    default:
      return state
  }
}
