import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import { GasConfiguration, LocalTx, Option } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { FunctionName, TransactionCondition } from '../constants/enums'

export const useOptionsDetails = () => {
  const { optionsFarming } = useContracts()
  const [optionsDetails, setOptionsDetails] = useState<Option[]>([])
  const { latestBlock } = useCachedData()
  const { account, library } = useWallet()
  const [latestBlockTimestamp, setLatestBlockTimestamp] = useState<number>(0)

  const exerciseOption = async (
    _optionId: string,
    gasConfig: GasConfiguration
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!optionsFarming || !_optionId) return { tx: null, localTx: null }
    const tx = await optionsFarming.exerciseOption(_optionId, {
      ...gasConfig,
      gasLimit: 161379,
    })
    const txHash = tx.hash
    const localTx: LocalTx = {
      hash: txHash,
      type: FunctionName.EXERCISE_OPTION,
      value: `Option #${String(_optionId)}`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  useEffect(() => {
    const getOptionDetails = async () => {
      if (!optionsFarming || !account) return
      try {
        const optionIds: BigNumber[] = await optionsFarming.listTokensOfOwner(account)
        const optionsFields = await Promise.all(optionIds.map(async (optionId) => optionsFarming.getOption(optionId)))
        const options: Option[] = []
        for (let i = 0; i < optionsFields.length; i++) {
          options.push({
            id: optionIds[i],
            ...optionsFields[i],
          })
        }
        setOptionsDetails(options)
      } catch (err) {
        console.log('getOptionDetails', err)
      }
    }
    getOptionDetails()
  }, [optionsFarming, account, latestBlock])

  useEffect(() => {
    if (!library || !latestBlock) return
    setLatestBlockTimestamp(latestBlock.timestamp)
  }, [latestBlock, library])

  return { optionsDetails, latestBlockTimestamp, exerciseOption }
}
