import { SET_QUOTES } from './types'
import { AnyAction } from 'redux'

interface Quote {
  name: string
  rate: number
}

interface QuoteList {
  quotes: Array<Quote>
}

const initialState: QuoteList = { quotes: [] }

export const userReducer = (state = initialState, action: AnyAction): QuoteList => {
  const { type, payload } = action
  switch (type) {
    case SET_QUOTES: {
      return {
        ...state,
        quotes: payload,
      }
    }
    default:
      return state
  }
}
