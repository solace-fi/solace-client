import { SET_QUOTES } from './types'
import { Dispatch } from 'redux'

export const getQuotes = (dispatch: Dispatch): void => {
  dispatch({ type: SET_QUOTES })
}
