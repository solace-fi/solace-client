import { useState, useEffect, useCallback } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'
import { GasConfiguration, LocalTx, TxResult } from '../constants/types'
import { BigNumber } from 'ethers'
import { DEADLINE, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { getPermitErc20Signature } from '../utils/signature'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'
import { useSolaceBalance, useXSolaceBalance } from './useBalance'
import { floatUnits, truncateBalance } from '../utils/formatting'
import { useCachedData } from '../context/CachedDataManager'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { useProvider } from '../context/ProviderManager'

export const useXSolace = () => {
  const { solace, xSolace } = useContracts()
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
  const { xSolace } = useContracts()
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const solaceBalData = useSolaceBalance()
  const xSolaceBalData = useXSolaceBalance()
  const [userShare, setUserShare] = useState<string>('0')
  const [xSolacePerSolace, setXSolacePerSolace] = useState<string>('1')
  const [solacePerXSolace, setSolacePerXSolace] = useState<string>('1')

  const getXSolaceUserPoolShare = useCallback(async () => {
    if (!xSolace || xSolaceBalData.xSolaceBalance == '0') return
    try {
      const totalSupply = await xSolace.totalSupply()
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(xSolaceBalData.xSolaceBalance) / floatUnits(totalSupply, xSolaceBalData.tokenData.decimals)
        : 0
      setUserShare(userShare.toString())
    } catch (err) {
      console.log('error getXSolaceUserPoolShare ', err)
    }
  }, [xSolace, xSolaceBalData])

  const getXSolacePerSolace = useCallback(async () => {
    if (!xSolace) return
    try {
      const amount = await xSolace.solaceToXSolace(parseUnits('1', solaceBalData.tokenData.decimals))
      setXSolacePerSolace(formatUnits(amount, xSolaceBalData.tokenData.decimals))
    } catch (err) {
      console.log('error getXSolacePerSolace ', err)
    }
  }, [xSolace, solaceBalData, xSolaceBalData])

  const getSolacePerXSolace = useCallback(async () => {
    if (!xSolace) return
    try {
      const amount = await xSolace.xSolaceToSolace(parseUnits('1', xSolaceBalData.tokenData.decimals))
      setSolacePerXSolace(formatUnits(amount, solaceBalData.tokenData.decimals))
    } catch (err) {
      console.log('error getSolacePerXSolace ', err)
    }
  }, [xSolace, solaceBalData, xSolaceBalData])

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
  const { xSolace } = useContracts()

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
