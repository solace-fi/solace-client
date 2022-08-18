import { BigNumber } from 'ethers'
import React, { createContext, useMemo, useState, useContext, useEffect, useCallback } from 'react'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { ReadToken, TokenInfo } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useBatchBalances } from '../../hooks/balance/useBalance'
import { ERC20_ABI } from '../../constants/abi'
import { useTokenApprove } from '../../hooks/contract/useToken'
import { isAddress } from '../../utils'
import { TokenSelectionModal } from '../../components/organisms/TokenSelectionModal'
import { useTokenHelper } from '../../hooks/lock/useUnderwritingHelper'
import { useCachedData } from '../../context/CachedDataManager'
import { ZERO } from '@solace-fi/sdk-nightly'

type LockContextType = {
  intrface: {
    tokensLoading: boolean
    transactionLoading: boolean
    balancesLoading: boolean
    handleTransactionLoading: (setLoading: boolean) => void
  }
  paymentCoins: {
    batchBalanceData: TokenInfo[]
    coinsOpen: boolean
    handleCoinsOpen: (value: boolean) => void
    approveCPM: (spenderAddress: string, tokenAddr: string, amount?: BigNumber) => void
  }
  input: {
    selectedCoin?: ReadToken
    handleSelectedCoin: (coin: string) => void
  }
}

const LockContext = createContext<LockContextType>({
  intrface: {
    tokensLoading: false,
    transactionLoading: false,
    balancesLoading: false,
    handleTransactionLoading: () => undefined,
  },
  paymentCoins: {
    batchBalanceData: [],
    coinsOpen: false,
    handleCoinsOpen: () => undefined,
    approveCPM: () => undefined,
  },
  input: {
    selectedCoin: undefined,
    handleSelectedCoin: () => undefined,
  },
})

const LockManager: React.FC = (props) => {
  const { activeNetwork } = useNetwork()

  const [coinsOpen, setCoinsOpen] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)

  const { loading: tokensLoading, tokens } = useTokenHelper()

  const coinOptions = useMemo(
    () => [
      {
        address: SOLACE_TOKEN.address[activeNetwork.chainId],
        ...SOLACE_TOKEN.constants,
        price: undefined,
        balance: ZERO,
      },
      ...tokens,
    ],
    [activeNetwork, tokens]
  )
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions)
  const { tokenPriceMapping } = useCachedData()

  const [selectedCoin, setSelectedCoin] = useState<ReadToken | undefined>(undefined)

  const { approve } = useTokenApprove(setTransactionLoading)

  const batchBalanceData = useMemo(() => {
    if (batchBalances.length !== coinOptions.length) return []
    return batchBalances.map((b, i) => {
      const name = coinOptions[i].name
      const price = coinOptions[i].price ?? tokenPriceMapping[name.toLowerCase()]
      let tokenprice = 1
      if (price) tokenprice = price
      return { ...coinOptions[i], balance: b.balance, price: tokenprice }
    })
  }, [batchBalances, coinOptions])

  const handleSelectedCoin = useCallback(
    (addr: string) => {
      const coin = coinOptions.find((c) => c.address === addr)
      if (coin) {
        setSelectedCoin(coin)
      }
    },
    [coinOptions]
  )

  const handleCoinsOpen = useCallback((value: boolean) => {
    setCoinsOpen(value)
  }, [])

  const handleTransactionLoading = useCallback((setLoading: boolean) => {
    setTransactionLoading(setLoading)
  }, [])

  const approveCPM = useCallback(
    async (spenderAddress: string, tokenAddr: string, amount?: BigNumber) => {
      if (!isAddress(tokenAddr) || !isAddress(spenderAddress)) return
      await approve(tokenAddr, ERC20_ABI, spenderAddress, amount)
    },
    [approve]
  )

  useEffect(() => {
    if (coinOptions.length > 0) setSelectedCoin(coinOptions[0])
  }, [coinOptions])

  const value = useMemo<LockContextType>(
    () => ({
      intrface: {
        transactionLoading,
        balancesLoading,
        tokensLoading,
        handleTransactionLoading,
      },
      paymentCoins: {
        batchBalanceData,
        coinsOpen,
        handleCoinsOpen,
        approveCPM,
      },
      input: {
        selectedCoin,
        handleSelectedCoin,
      },
    }),
    [
      handleTransactionLoading,
      tokensLoading,
      approveCPM,
      batchBalanceData,
      coinsOpen,
      handleCoinsOpen,
      selectedCoin,
      handleSelectedCoin,
      transactionLoading,
      balancesLoading,
    ]
  )
  return (
    <LockContext.Provider value={value}>
      <TokenSelectionModal
        show={coinsOpen}
        balanceData={batchBalanceData.map((item) => {
          return { ...item, price: 0 }
        })}
        handleSelectedCoin={handleSelectedCoin}
        handleCloseModal={() => handleCoinsOpen(false)}
      />
      {props.children}
    </LockContext.Provider>
  )
}

export function useLockContext(): LockContextType {
  return useContext(LockContext)
}

export default LockManager
