import { getTokens as comp4Tokens } from '../utils/positionGetters/compoundPositionGetter/rinkeby/getTokens'
import { getBalances as comp4Balances } from '../utils/positionGetters/compoundPositionGetter/rinkeby/getBalances'

export const policyConfig: any = {
  '4': {
    productsRev: {
      '0x57149Ad6B4c3051023CF46b3978692936C49154E': 'Compound',
    },
    getTokens: comp4Tokens,
    getBalances: comp4Balances,
    initialized: false,
  },
}
