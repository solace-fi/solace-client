import { useState, useEffect, useCallback, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'
import { GasConfiguration, LocalTx, TxResult } from '../constants/types'
import { BigNumber } from 'ethers'
import { DEADLINE, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { getPermitErc20Signature } from '../utils/signature'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'
import { useXSolaceBalance } from './useBalance'
import { floatUnits, truncateBalance } from '../utils/formatting'
import { useCachedData } from '../context/CachedDataManager'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { useProvider } from '../context/ProviderManager'
import { useReadToken } from './useToken'

export const useXSolaceV1 = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { account, library } = useWallet()
  const { chainId } = useNetwork()

  const stake_v1 = async (parsedAmount: BigNumber, gasConfig: GasConfiguration) => {
    if (!solace || !xSolaceV1 || !account) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(
      account,
      chainId,
      library,
      xSolaceV1.address,
      solace,
      parsedAmount
    )
    const tx = await xSolaceV1.stakeSigned(account, parsedAmount, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xSolace.stakeSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STAKE_V1,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const unstake_v1 = async (parsedAmount: BigNumber, gasConfig: GasConfiguration): Promise<TxResult> => {
    if (!xSolaceV1) return { tx: null, localTx: null }
    const tx = await xSolaceV1.unstake(parsedAmount, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xSolace.unstake'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.UNSTAKE_V1,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { stake_v1, unstake_v1 }
}

export const useXSolaceV1Details = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const xSolaceBalance = useXSolaceBalance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)
  const [userShare, setUserShare] = useState<string>('0')
  const [xSolacePerSolace, setXSolacePerSolace] = useState<string>('1')
  const [solacePerXSolace, setSolacePerXSolace] = useState<string>('1')

  const getXSolaceUserPoolShare = useCallback(async () => {
    if (!xSolaceV1 || xSolaceBalance == '0') return
    try {
      const totalSupply = await xSolaceV1.totalSupply()
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(xSolaceBalance) / floatUnits(totalSupply, readXSolaceToken.decimals)
        : 0
      setUserShare(userShare.toString())
    } catch (err) {
      console.log('error getXSolaceUserPoolShare ', err)
    }
  }, [xSolaceV1, xSolaceBalance, readXSolaceToken])

  const getXSolacePerSolace = useCallback(async () => {
    if (!xSolaceV1 || !readSolaceToken || !readXSolaceToken) return
    try {
      const amount = await xSolaceV1.solaceToXSolace(parseUnits('1', readSolaceToken.decimals))
      setXSolacePerSolace(formatUnits(amount, readXSolaceToken.decimals))
    } catch (err) {
      console.log('error getXSolacePerSolace ', err)
    }
  }, [xSolaceV1, readSolaceToken, readXSolaceToken])

  const getSolacePerXSolace = useCallback(async () => {
    if (!xSolaceV1) return
    try {
      const amount = await xSolaceV1.xSolaceToSolace(parseUnits('1', readXSolaceToken.decimals))
      setSolacePerXSolace(formatUnits(amount, readSolaceToken.decimals))
    } catch (err) {
      console.log('error getSolacePerXSolace ', err)
    }
  }, [xSolaceV1, readSolaceToken, readXSolaceToken])

  useEffect(() => {
    getXSolaceUserPoolShare()
    getXSolacePerSolace()
    getSolacePerXSolace()
  }, [latestBlock, version, getXSolaceUserPoolShare, getSolacePerXSolace, getXSolacePerSolace])

  return { userShare, xSolacePerSolace, solacePerXSolace }
}

export const useStakingApyV1 = () => {
  const { latestBlock } = useProvider()
  const [stakingApy, setStakingApy] = useState<string>('-%')
  const { keyContracts } = useContracts()
  const { xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])

  const getStakingAPY = useCallback(async () => {
    if (!latestBlock || !xSolaceV1) return
    try {
      const amount = await xSolaceV1.solaceToXSolace(parseUnits('1', 18))
      const apy = (1 / parseFloat(formatUnits(amount, 18)) - 1) * 100
      const formattedApy = `${truncateBalance(apy, 2, false)}%`
      setStakingApy(formattedApy)
    } catch (err) {
      console.log('error getStakingAPY ', err)
    }
  }, [xSolaceV1, latestBlock])

  useEffect(() => {
    if (!latestBlock) return
    getStakingAPY()
  }, [latestBlock, getStakingAPY])

  return { stakingApy }
}
