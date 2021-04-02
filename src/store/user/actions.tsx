import { CONNECT_USER, DISCONNECT_USER } from './types'
import { Dispatch } from 'redux'

export const connectUser = (dispatch: Dispatch): void => {
  dispatch({ type: CONNECT_USER })
}

export const disconnectUser = (dispatch: Dispatch): void => {
  dispatch({ type: DISCONNECT_USER })
}
