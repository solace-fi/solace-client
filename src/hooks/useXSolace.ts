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

export const useXSolace = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { account, library } = useWallet()
  const { chainId } = useNetwork()

  const stake = async (parsedAmount: BigNumber, txVal: string, gasConfig: GasConfiguration) => {
    if (!solace || !xSolace || !account) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(account, chainId, library, xSolace.address, solace, parsedAmount)
    const tx = await xSolace.stakeSigned(account, parsedAmount, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xSolace.stakeSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STAKE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const unstake = async (parsedAmount: BigNumber, txVal: string, gasConfig: GasConfiguration): Promise<TxResult> => {
    if (!xSolace) return { tx: null, localTx: null }
    const tx = await xSolace.unstake(parsedAmount, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xSolace.unstake'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.UNSTAKE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { stake, unstake }
}

export const useXSolaceDetails = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const xSolaceBalance = useXSolaceBalance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolace)
  const [userShare, setUserShare] = useState<string>('0')
  const [xSolacePerSolace, setXSolacePerSolace] = useState<string>('1')
  const [solacePerXSolace, setSolacePerXSolace] = useState<string>('1')

  const getXSolaceUserPoolShare = useCallback(async () => {
    if (!xSolace || xSolaceBalance == '0') return
    try {
      const totalSupply = await xSolace.totalSupply()
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(xSolaceBalance) / floatUnits(totalSupply, readXSolaceToken.decimals)
        : 0
      setUserShare(userShare.toString())
    } catch (err) {
      console.log('error getXSolaceUserPoolShare ', err)
    }
  }, [xSolace, xSolaceBalance, readSolaceToken, readXSolaceToken])

  const getXSolacePerSolace = useCallback(async () => {
    if (!xSolace || !readSolaceToken || !readXSolaceToken) return
    try {
      const amount = await xSolace.solaceToXSolace(parseUnits('1', readSolaceToken.decimals))
      setXSolacePerSolace(formatUnits(amount, readXSolaceToken.decimals))
    } catch (err) {
      console.log('error getXSolacePerSolace ', err)
    }
  }, [xSolace, readSolaceToken, readXSolaceToken])

  const getSolacePerXSolace = useCallback(async () => {
    if (!xSolace) return
    try {
      const amount = await xSolace.xSolaceToSolace(parseUnits('1', readXSolaceToken.decimals))
      setSolacePerXSolace(formatUnits(amount, readSolaceToken.decimals))
    } catch (err) {
      console.log('error getSolacePerXSolace ', err)
    }
  }, [xSolace, readSolaceToken, readXSolaceToken])

  useEffect(() => {
    getXSolaceUserPoolShare()
    getXSolacePerSolace()
    getSolacePerXSolace()
  }, [latestBlock, version, getXSolaceUserPoolShare, getSolacePerXSolace, getXSolacePerSolace])

  return { userShare, xSolacePerSolace, solacePerXSolace }
}

export const useStakingApy = () => {
  const { latestBlock } = useProvider()
  const [stakingApy, setStakingApy] = useState<string>('-%')
  const { keyContracts } = useContracts()
  const { xSolace } = useMemo(() => keyContracts, [keyContracts])

  const getStakingAPY = useCallback(async () => {
    if (!latestBlock || !xSolace) return
    try {
      const amount = await xSolace.solaceToXSolace(parseUnits('1', 18))
      const apy = (1 / parseFloat(formatUnits(amount, 18)) - 1) * 100
      const formattedApy = `${truncateBalance(apy, 2, false)}%`
      setStakingApy(formattedApy)
    } catch (err) {
      console.log('error getStakingAPY ', err)
    }
  }, [xSolace, latestBlock])

  useEffect(() => {
    if (!latestBlock) return
    getStakingAPY()
  }, [latestBlock, getStakingAPY])

  return { stakingApy }
}
