import { BigNumber } from 'ethers'
import React, { createContext, useMemo, useState, useContext, useEffect, useCallback } from 'react'
import { PoolTokenInfo, ReadToken, TokenInfo } from '../../constants/types'
import { useBatchBalances } from '../../hooks/balance/useBalance'
import { ERC20_ABI } from '../../constants/abi'
import { useTokenApprove } from '../../hooks/contract/useToken'
import { isAddress } from '../../utils'
import { TokenSelectionModal } from '../../components/organisms/TokenSelectionModal'
import { useTokenHelper } from '../../hooks/lock/useUnderwritingHelper'
import { useCachedData } from '../../context/CachedDataManager'
import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { useUwLockVoting } from '../../hooks/lock/useUwLockVoting'
import { DelegateModal } from './organisms/DelegateModal'
import { useUwLocker } from '../../hooks/lock/useUwLocker'

type LockContextType = {
  intrface: {
    tokensLoading: boolean
    transactionLoading: boolean
    balancesLoading: boolean
    handleTransactionLoading: (setLoading: boolean) => void
  }
  paymentCoins: {
    batchBalanceData: PoolTokenInfo[]
    coinsOpen: boolean
    handleCoinsOpen: (value: boolean) => void
    approveCPM: (spenderAddress: string, tokenAddr: string, amount?: BigNumber) => void
  }
  input: {
    selectedCoin?: ReadToken
    handleSelectedCoin: (coin: string) => void
  }
  delegateData: {
    delegate: string
    delegateModalOpen: boolean
    handleDelegateModalOpen: (value: boolean) => void
  }
  locker: {
    stakedBalance: BigNumber
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
  delegateData: {
    delegate: ZERO_ADDRESS,
    delegateModalOpen: false,
    handleDelegateModalOpen: () => undefined,
  },
  locker: {
    stakedBalance: ZERO,
  },
})

const LockManager: React.FC = (props) => {
  const { account } = useWeb3React()
  const [coinsOpen, setCoinsOpen] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)
  const [currentDelegate, setCurrentDelegate] = useState(ZERO_ADDRESS)
  const [delegateModalOpen, setDelegateModalOpen] = useState(false)
  const [stakedBalance, setStakedBalance] = useState<BigNumber>(ZERO)

  const { loading: tokensLoading, tokens } = useTokenHelper()
  const { delegateOf } = useUwLockVoting()
  const { totalStakedBalance } = useUwLocker()
  const coinOptions = useMemo(() => [...tokens], [tokens])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalances, tokenPriceMapping])

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

  const handleDelegateModalOpen = useCallback((value: boolean) => {
    setDelegateModalOpen(value)
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
    const getMyDelegate = async () => {
      if (!account) {
        setCurrentDelegate(ZERO_ADDRESS)
        return
      }
      const delegate = await delegateOf(account)
      setCurrentDelegate(delegate)
    }
    getMyDelegate()
  }, [delegateOf, account])

  useEffect(() => {
    if (coinOptions.length > 0) setSelectedCoin(coinOptions[0])
  }, [coinOptions])

  useEffect(() => {
    const getStakedBalance = async () => {
      if (!account) {
        setStakedBalance(ZERO)
        return
      }
      const staked = await totalStakedBalance(account)
      setStakedBalance(staked)
    }
    getStakedBalance()
  }, [totalStakedBalance, account])

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
      delegateData: {
        delegate: currentDelegate,
        delegateModalOpen,
        handleDelegateModalOpen,
      },
      locker: { stakedBalance },
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
      currentDelegate,
      delegateModalOpen,
      handleDelegateModalOpen,
      stakedBalance,
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
      <DelegateModal show={delegateModalOpen} handleCloseModal={() => handleDelegateModalOpen(false)} />
      {props.children}
    </LockContext.Provider>
  )
}

export function useLockContext(): LockContextType {
  return useContext(LockContext)
}

export default LockManager
