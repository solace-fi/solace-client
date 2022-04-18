import { useState, useEffect, useCallback, useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useWallet } from '../../context/WalletManager'
import { LocalTx, TxResult } from '../../constants/types'
import { BigNumber } from 'ethers'
import { DEADLINE, ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { getPermitErc20Signature } from '../../utils/signature'
import { FunctionGasLimits } from '../../constants/mappings/gas'
import { useXSolaceBalance } from '../balance/useBalance'
import { floatUnits } from '../../utils/formatting'
import { useCachedData } from '../../context/CachedDataManager'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { useProvider } from '../../context/ProviderManager'
import { useGetFunctionGas } from '../provider/useGas'
import { SOLACE_TOKEN, XSOLACE_V1_TOKEN } from '../../constants/mappings/token'

export const useXSolaceV1 = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { account, library } = useWallet()
  const { chainId } = useNetwork()
  const { gasConfig } = useGetFunctionGas()

  const stake_v1 = async (parsedAmount: BigNumber) => {
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

  const unstake_v1 = async (parsedAmount: BigNumber): Promise<TxResult> => {
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
  const { xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const xSolaceBalance = useXSolaceBalance()
  const [userShare, setUserShare] = useState<string>('0')
  const [xSolacePerSolace, setXSolacePerSolace] = useState<string>('1')
  const [solacePerXSolace, setSolacePerXSolace] = useState<string>('1')

  const getXSolaceUserPoolShare = useCallback(async () => {
    if (!xSolaceV1 || xSolaceBalance == '0') return
    try {
      const totalSupply = await xSolaceV1.totalSupply()
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(xSolaceBalance) / floatUnits(totalSupply, XSOLACE_V1_TOKEN.constants.decimals)
        : 0
      setUserShare(userShare.toString())
    } catch (err) {
      console.log('error getXSolaceUserPoolShare ', err)
    }
  }, [xSolaceV1, xSolaceBalance])

  const getXSolacePerSolace = useCallback(async () => {
    if (!xSolaceV1 || !SOLACE_TOKEN || !XSOLACE_V1_TOKEN) return
    try {
      const amount = await xSolaceV1.solaceToXSolace(parseUnits('1', SOLACE_TOKEN.constants.decimals))
      setXSolacePerSolace(formatUnits(amount, XSOLACE_V1_TOKEN.constants.decimals))
    } catch (err) {
      console.log('error getXSolacePerSolace ', err)
    }
  }, [xSolaceV1])

  const getSolacePerXSolace = useCallback(async () => {
    if (!xSolaceV1) return
    try {
      const amount = await xSolaceV1.xSolaceToSolace(parseUnits('1', XSOLACE_V1_TOKEN.constants.decimals))
      setSolacePerXSolace(formatUnits(amount, SOLACE_TOKEN.constants.decimals))
    } catch (err) {
      console.log('error getSolacePerXSolace ', err)
    }
  }, [xSolaceV1])

  useEffect(() => {
    getXSolaceUserPoolShare()
    getXSolacePerSolace()
    getSolacePerXSolace()
  }, [latestBlock, version, getXSolaceUserPoolShare, getSolacePerXSolace, getXSolacePerSolace])

  return { userShare, xSolacePerSolace, solacePerXSolace }
}
