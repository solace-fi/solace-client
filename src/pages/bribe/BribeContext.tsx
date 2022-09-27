import { BigNumber } from 'ethers'
import React, { createContext, useContext, useMemo } from 'react'
import { ZERO } from '../../constants'
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
    userAvailableVotePowerBPS: BigNumber
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
    userAvailableVotePowerBPS: ZERO,
  },
})

const BribeManager: React.FC = (props) => {
  const {
    bribeTokens,
    gaugeBribeInfo,
    bribeTokensLoading,
    gaugeBribeInfoLoading,
    claimableBribes,
    availableVotePowerBPS,
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
        userAvailableVotePowerBPS: availableVotePowerBPS,
      },
    }),
    [bribeTokens, gaugeBribeInfo, bribeTokensLoading, gaugeBribeInfoLoading, claimableBribes, availableVotePowerBPS]
  )

  return <BribeContext.Provider value={value}>{props.children}</BribeContext.Provider>
}

export function useBribeContext(): BribeContextType {
  return useContext(BribeContext)
}

export default BribeManager
