import React, { createContext, useContext, useMemo } from 'react'
import { Bribe, GaugeBribeInfo, TokenInfo } from '../../constants/types'
import { useBribeControllerHelper } from '../../hooks/bribe/useBribeController'

type BribeContextType = {
  intrface: {
    bribeTokensLoading: boolean
    gaugeBribeInfoLoading: boolean
  }
  bribes: {
    claimableBribes: Bribe[]
    bribeTokens: TokenInfo[]
    gaugeBribeInfo: GaugeBribeInfo[]
  }
}

const BribeContext = createContext<BribeContextType>({
  intrface: {
    bribeTokensLoading: true,
    gaugeBribeInfoLoading: true,
  },
  bribes: {
    claimableBribes: [],
    bribeTokens: [],
    gaugeBribeInfo: [],
  },
})

const BribeManager: React.FC = (props) => {
  const {
    bribeTokens,
    gaugeBribeInfo,
    bribeTokensLoading,
    gaugeBribeInfoLoading,
    claimableBribes,
  } = useBribeControllerHelper()

  const value = useMemo<BribeContextType>(
    () => ({
      intrface: {
        bribeTokensLoading,
        gaugeBribeInfoLoading,
      },
      bribes: {
        claimableBribes,
        bribeTokens,
        gaugeBribeInfo,
      },
    }),
    [bribeTokens, gaugeBribeInfo, bribeTokensLoading, gaugeBribeInfoLoading, claimableBribes]
  )

  return <BribeContext.Provider value={value}>{props.children}</BribeContext.Provider>
}

export function useBribeContext(): BribeContextType {
  return useContext(BribeContext)
}

export default BribeManager
