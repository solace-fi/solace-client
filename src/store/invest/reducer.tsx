import {
  SET_INVESTMENTS,
  SET_REWARDS,
  GET_CAPITAL_POOL_APR,
  GET_LIQUIDITY_POOL_APR,
  SET_BALANCE,
  SET_STAKE,
  CLAIM_REWARDS,
} from './types'
import { AnyAction } from 'redux'

interface Investment {
  name: string
  capital: number
}

interface Reward {
  name: string
  capital: number
}

interface InvestmentList {
  investments: Array<Investment>
  rewards: Array<Reward>
  balance: number
  staked: number
}

const initialState: InvestmentList = { investments: [], rewards: [], balance: 0, staked: 0 }

export const userReducer = (state = initialState, action: AnyAction): InvestmentList => {
  const { type, payload } = action
  switch (type) {
    case SET_INVESTMENTS: {
      return {
        ...state,
        investments: payload,
      }
    }
    case SET_REWARDS: {
      return {
        ...state,
        rewards: payload,
      }
    }
    default:
      return state
  }
}
