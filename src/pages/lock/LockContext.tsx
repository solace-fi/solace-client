import { BigNumber } from 'ethers'
import React, { createContext, useMemo, useState, useContext, useEffect, useCallback, useRef } from 'react'
import { PoolTokenInfo, ReadToken, VoteLockData } from '../../constants/types'
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
import { floatUnits } from '../../utils/formatting'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'

type LockContextType = {
  intrface: {
    tokensLoading: boolean
    transactionLoading: boolean
    balancesLoading: boolean
    locksLoading: boolean
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
    userLocks: VoteLockData[]
    minLockDuration: BigNumber
    maxLockDuration: BigNumber
    maxNumLocks: BigNumber
  }
}

const LockContext = createContext<LockContextType>({
  intrface: {
    tokensLoading: false,
    transactionLoading: false,
    balancesLoading: false,
    locksLoading: false,
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
    userLocks: [],
    minLockDuration: ZERO,
    maxLockDuration: ZERO,
    maxNumLocks: ZERO,
  },
})

const LockManager: React.FC = (props) => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const { positiveVersion } = useCachedData()
  const [coinsOpen, setCoinsOpen] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)
  const [currentDelegate, setCurrentDelegate] = useState(ZERO_ADDRESS)
  const [delegateModalOpen, setDelegateModalOpen] = useState(false)
  const [stakedBalance, setStakedBalance] = useState<BigNumber>(ZERO)

  const { loading: tokensLoading, tokens } = useTokenHelper()
  const { delegateOf } = useUwLockVoting()
  const {
    totalStakedBalance,
    minLockDuration: getMinLockDuration,
    maxLockDuration: getMaxLockDuration,
    maxNumLocks: getMaxNumLocks,
    getAllLockIDsOf,
    locks: getLock,
  } = useUwLocker()
  const coinOptions = useMemo(() => [...tokens], [tokens])
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions)
  const { tokenPriceMapping } = useCachedData()
  const fetchingLocks = useRef(false)

  const [selectedCoin, setSelectedCoin] = useState<ReadToken | undefined>(undefined)
  const [minLockDuration, setMinLockDuration] = useState<BigNumber>(ZERO)
  const [maxLockDuration, setMaxLockDuration] = useState<BigNumber>(ZERO)
  const [maxNumLocks, setMaxNumLocks] = useState<BigNumber>(ZERO)
  const [userLocks, setUserLocks] = useState<
    {
      lockID: BigNumber
      amount: BigNumber
      end: BigNumber
    }[]
  >([])
  const [locksLoading, setLocksLoading] = useState(true)

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
  }, [delegateOf, account, positiveVersion])

  useEffect(() => {
    if (coinOptions.length > 0) setSelectedCoin(coinOptions[0])
  }, [coinOptions])

  useEffect(() => {
    const getUserLockData = async () => {
      if (fetchingLocks.current) return
      if (!account) {
        setStakedBalance(ZERO)
        setUserLocks([])
        return
      }
      fetchingLocks.current = true
      const [staked, lockIDs] = await Promise.all([totalStakedBalance(account), getAllLockIDsOf(account)])
      const voteLocks = await Promise.all(lockIDs.map((lockID) => getLock(lockID)))

      const locks = lockIDs.map((lockID, index) => ({ ...voteLocks[index], lockID }))
      const sortedLocks = locks.sort((a, b) => {
        return floatUnits(b.amount.sub(a.amount), 18)
      })
      setStakedBalance(staked)
      setUserLocks(sortedLocks ?? [])
      setLocksLoading(false)
      fetchingLocks.current = false
    }
    getUserLockData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNetwork, account, latestBlock, positiveVersion])

  useEffect(() => {
    const getLockerConstants = async () => {
      const _minLockDuration = await getMinLockDuration()
      const _maxLockDuration = await getMaxLockDuration()
      const _maxNumLocks = await getMaxNumLocks()
      setMinLockDuration(_minLockDuration)
      setMaxLockDuration(_maxLockDuration)
      setMaxNumLocks(_maxNumLocks)
    }
    getLockerConstants()
  }, [activeNetwork, latestBlock, getMinLockDuration, getMaxLockDuration, getMaxNumLocks])

  useEffect(() => {
    setLocksLoading(true)
  }, [account, activeNetwork])

  const value = useMemo<LockContextType>(
    () => ({
      intrface: {
        transactionLoading,
        balancesLoading,
        tokensLoading,
        locksLoading,
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
      locker: {
        stakedBalance,
        userLocks,
        minLockDuration,
        maxLockDuration,
        maxNumLocks,
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
      currentDelegate,
      delegateModalOpen,
      handleDelegateModalOpen,
      stakedBalance,
      minLockDuration,
      maxLockDuration,
      maxNumLocks,
      userLocks,
      locksLoading,
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
