import { formatUnits } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { NetworkConfig } from '../../constants/types'
import { networks } from '../../context/NetworkManager'
import { numberAbbreviate, truncateValue } from '../../utils/formatting'
import { Policy } from '@solace-fi/sdk-nightly'
import { useCachedData } from '../../context/CachedDataManager'

export const useTotalActivePolicies = () => {
  const { minute } = useCachedData()
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')
  const [totalActiveCoverLimit, setTotalActiveCoverLimit] = useState<string>('-')

  useEffect(() => {
    const getPolicyCount = async () => {
      const policy = new Policy()

      const countedNetworks = networks.filter((n) => n.config.keyContracts.solaceCoverProduct && !n.isTestnet)
      const rpcUrlMapping: { [key: number]: string } = countedNetworks.reduce(
        (urls: any, network: NetworkConfig) => ({
          ...urls,
          [network.chainId]: network.rpc.httpsUrl,
        }),
        {}
      )

      const data = await policy.getTotalActivePolicies_All(rpcUrlMapping)
      setTotalActivePolicies(numberAbbreviate(data.totalPolicies.toString()))
      setTotalActiveCoverLimit(truncateValue(formatUnits(data.totalActiveCoverLimit, 18), 2))
    }
    getPolicyCount()
  }, [minute])

  return { totalActivePolicies, totalActiveCoverLimit }
}
