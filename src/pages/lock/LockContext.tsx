import { BigNumber } from 'ethers'
import React, { createContext, useMemo, useState, useContext, useEffect, useCallback } from 'react'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { ReadToken } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useBatchBalances } from '../../hooks/balance/useBalance'
import { ERC20_ABI } from '../../constants/abi'
import { useTokenApprove } from '../../hooks/contract/useToken'
import { isAddress } from '../../utils'
import { coinsMap } from '../../constants/mappings/whitelistedTokensForNative'
import { TokenSelectionModal } from '../../components/organisms/TokenSelectionModal'

type LockContextType = {
  intrface: {
    transactionLoading: boolean
    balancesLoading: boolean
    handleTransactionLoading: (setLoading: boolean) => void
  }
  paymentCoins: {
    batchBalanceData: (ReadToken & { balance: BigNumber })[]
    coinsOpen: boolean
    setCoinsOpen: (value: boolean) => void
    approveCPM: (spenderAddress: string, tokenAddr: string, amount?: BigNumber) => void
  }
  input: {
    selectedCoin: ReadToken
    handleSelectedCoin: (coin: string) => void
  }
}

const LockContext = createContext<LockContextType>({
  intrface: {
    transactionLoading: false,
    balancesLoading: false,
    handleTransactionLoading: () => undefined,
  },
  paymentCoins: {
    batchBalanceData: [],
    coinsOpen: false,
    setCoinsOpen: () => undefined,
    approveCPM: () => undefined,
  },
  input: {
    selectedCoin: {
      address: SOLACE_TOKEN.address[1],
      ...SOLACE_TOKEN.constants,
    },
    handleSelectedCoin: () => undefined,
  },
})

const LockManager: React.FC = (props) => {
  const { activeNetwork } = useNetwork()

  const [coinsOpen, setCoinsOpen] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)

  const coinOptions = useMemo(
    () => [
      {
        address: SOLACE_TOKEN.address[activeNetwork.chainId],
        ...SOLACE_TOKEN.constants,
      },
      ...(coinsMap[activeNetwork.chainId] ?? []),
    ],
    [activeNetwork]
  )
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions)

  const [selectedCoin, setSelectedCoin] = useState<ReadToken>(coinOptions[0])

  const { approve } = useTokenApprove(setTransactionLoading)

  const batchBalanceData = useMemo(() => {
    if (batchBalances.length !== coinOptions.length) return []
    return batchBalances.map((b, i) => {
      return { balance: b.balance, ...coinOptions[i] }
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
    setSelectedCoin(coinOptions[0])
  }, [coinOptions])

  const value = useMemo<LockContextType>(
    () => ({
      intrface: {
        transactionLoading,
        balancesLoading,
        handleTransactionLoading,
      },
      paymentCoins: {
        batchBalanceData,
        coinsOpen,
        setCoinsOpen,
        approveCPM,
      },
      input: {
        selectedCoin,
        handleSelectedCoin,
      },
    }),
    [
      handleTransactionLoading,
      approveCPM,
      batchBalanceData,
      coinsOpen,
      setCoinsOpen,
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
        handleCloseModal={() => setCoinsOpen(false)}
      />
      {props.children}
    </LockContext.Provider>
  )
}

export function useLockContext(): LockContextType {
  return useContext(LockContext)
}

export default LockManager
