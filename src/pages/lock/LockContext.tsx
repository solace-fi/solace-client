import { BigNumber, Contract } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { createContext, useMemo, useState, useContext, useEffect, useCallback } from 'react'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { ReadToken, TokenInfo } from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useBatchBalances } from '../../hooks/balance/useBalance'
import { ERC20_ABI } from '../../constants/abi'
import { useTokenAllowance, useTokenApprove } from '../../hooks/contract/useToken'
import SOLACE from '../../constants/abi/SOLACE.json'
import { useInputAmount } from '../../hooks/internal/useInputAmount'
import { isAddress } from '../../utils'

type LockContextType = {
  intrface: {
    handleTransactionLoading: (setLoading: boolean) => void
  }
  paymentCoins: {
    batchBalanceData: TokenInfo[]
    coinsOpen: boolean
    setCoinsOpen: (value: boolean) => void
    depositApproval: boolean
    approveCPM: (tokenAddr: string, amount?: BigNumber) => void
  }
  input: {
    enteredDeposit: string
    selectedCoin: ReadToken & { stablecoin: boolean }
    selectedCoinPrice: number
  }
}

const LockContext = createContext<LockContextType>({
  intrface: {
    handleTransactionLoading: () => undefined,
  },
  paymentCoins: {
    batchBalanceData: [],
    coinsOpen: false,
    setCoinsOpen: () => undefined,
    depositApproval: false,
    approveCPM: () => undefined,
  },
  input: {
    enteredDeposit: '',
    selectedCoin: {
      address: SOLACE_TOKEN.address[1],
      ...SOLACE_TOKEN.constants,
      stablecoin: false,
    },
    selectedCoinPrice: 0,
  },
})

const LockManager: React.FC = (props) => {
  const { appTheme, rightSidebar } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { signer, latestBlock } = useProvider()
  const { tokenPriceMapping } = useCachedData()

  const {
    amount: enteredDeposit,
    isAppropriateAmount: isAppropriateDeposit,
    handleInputChange: handleEnteredDeposit,
  } = useInputAmount()

  const [coinsOpen, setCoinsOpen] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)

  const coinOptions = useMemo(
    () => [
      {
        address: SOLACE_TOKEN.address[activeNetwork.chainId],
        ...SOLACE_TOKEN.constants,
        stablecoin: false,
      },
      //   ...(coinsMap[activeNetwork.chainId] ?? []).map((t) => {
      //     return { ...t, stablecoin: true }
      //   }),
    ],
    [activeNetwork]
  )
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions)

  const [selectedCoin, setSelectedCoin] = useState<ReadToken & { stablecoin: boolean }>(coinOptions[0])
  const [selectedCoinPrice, setSelectedCoinPrice] = useState<number>(0)

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const depositApproval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    enteredDeposit && enteredDeposit != '.' ? parseUnits(enteredDeposit, selectedCoin.decimals).toString() : '0'
  )
  const { approve } = useTokenApprove(setTransactionLoading)

  const batchBalanceData = useMemo(() => {
    if (batchBalances.length !== coinOptions.length) return []
    return batchBalances.map((b, i) => {
      const name = coinOptions[i].name
      const price = tokenPriceMapping[name.toLowerCase()]
      let tokenprice = 1
      if (price) tokenprice = price
      return { balance: b.balance, price: tokenprice, ...coinOptions[i] }
    })
  }, [batchBalances, coinOptions, tokenPriceMapping])

  const handleTransactionLoading = useCallback((setLoading: boolean) => {
    setTransactionLoading(setLoading)
  }, [])

  const approveCPM = useCallback(
    async (tokenAddr: string, amount?: BigNumber) => {
      if (!spenderAddress || !isAddress(tokenAddr) || !isAddress(spenderAddress)) return
      await approve(tokenAddr, ERC20_ABI, spenderAddress, amount)
    },
    [spenderAddress, approve]
  )

  useEffect(() => {
    setSelectedCoin(coinOptions[0])
  }, [coinOptions])

  useEffect(() => {
    const price = tokenPriceMapping[selectedCoin.name.toLowerCase()]
    if (price) {
      setSelectedCoinPrice(price)
    } else if (selectedCoin.stablecoin) {
      setSelectedCoinPrice(1)
    }
    let abi = null
    switch (selectedCoin.symbol) {
      case 'SOLACE':
        abi = SOLACE
        break
      default:
        abi = ERC20_ABI
    }
    setContractForAllowance(new Contract(selectedCoin.address, abi, signer))
  }, [selectedCoin, tokenPriceMapping, signer])

  useEffect(() => {
    setSpenderAddress(null)
  }, [activeNetwork, signer])

  const value = useMemo<LockContextType>(
    () => ({
      intrface: {
        handleTransactionLoading,
      },
      paymentCoins: {
        batchBalanceData,
        coinsOpen,
        setCoinsOpen,
        depositApproval,
        approveCPM,
      },
      input: {
        enteredDeposit,
        selectedCoin,
        selectedCoinPrice,
      },
    }),
    [
      handleTransactionLoading,
      approveCPM,
      batchBalanceData,
      coinsOpen,
      setCoinsOpen,
      depositApproval,
      enteredDeposit,
      selectedCoin,
      selectedCoinPrice,
    ]
  )
  return <LockContext.Provider value={value}>{props.children}</LockContext.Provider>
}

export function useLockContext(): LockContextType {
  return useContext(LockContext)
}

export default LockManager
