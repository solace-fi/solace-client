import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import { Option } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useContracts } from '../context/ContractsManager'

export const useOptionsDetails = (optionHolder: string | undefined): Option[] => {
  const { optionsFarming } = useContracts()
  const [optionsDetails, setOptionsDetails] = useState<Option[]>([])
  const { latestBlock } = useCachedData()

  useEffect(() => {
    const getOptionDetails = async () => {
      if (!optionsFarming || !optionHolder) return
      try {
        const optionIds: BigNumber[] = await optionsFarming.listTokensOfOwner(optionHolder)
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
  }, [optionsFarming, optionHolder, latestBlock])

  return optionsDetails
}
