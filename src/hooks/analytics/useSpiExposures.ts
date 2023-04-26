import { formatUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { PolicyExposure, ProtocolExposureType } from '../../pages/analytics/constants'
import { mapNumberToLetter } from '../../utils/mapProtocols'

export const useSpiExposures = () => {
  const { statsCache } = useCachedData()
  const [protocolExposureData, setProtocolExposureData] = useState<ProtocolExposureType[]>([])

  useEffect(() => {
    const aggregateSpiExposures = async () => {
      if (
        !statsCache ||
        !statsCache.spi ||
        Object.keys(statsCache.spi).length == 0 ||
        (!statsCache.positions && !statsCache.positions_cleaned) ||
        !statsCache.series
      )
        return
      const positions = statsCache.positions || statsCache.positions_cleaned
      const series = statsCache.series
      const policyOf: {
        [key: string]: PolicyExposure
      } = {} // map account -> policy

      // assign stored policy data for each policyholder
      statsCache.spi.ethereum_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'ethereum'
        policyOf[policy.policyholder] = policy
      })
      statsCache.spi.aurora_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'aurora'
        policyOf[policy.policyholder] = policy
      })
      statsCache.spi.polygon_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'polygon'
        policyOf[policy.policyholder] = policy
      })
      statsCache.spi.fantom_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'fantom'
        policyOf[policy.policyholder] = policy
      })
      const policyholders: string[] = Object.keys(policyOf)

      const protocols: ProtocolExposureType[] = []

      // for each policy holder, get their covered positions, and overall exposure
      policyholders.forEach((policyholder: string) => {
        if (!positions.hasOwnProperty(policyholder)) {
          return
        }
        const coveredPositionsOfPolicyholder =
          positions[policyholder].positions_cleaned || positions[policyholder].positions
        const policyExposure = Math.min(
          coveredPositionsOfPolicyholder.reduce((a: any, b: any) => a + b.balanceUSD, 0),
          parseFloat(formatUnits(policyOf[policyholder].coverLimit, 18))
        )
        policyOf[policyholder].policyHolder = policyholder
        policyOf[policyholder].exposure = policyExposure
        const policy = policyOf[policyholder]

        // for each covered position of this policy holder, update the protocols data
        coveredPositionsOfPolicyholder.forEach((coveredPosition: any) => {
          const foundProtocols = protocols.filter(
            (protocol: any) => protocol.appId == coveredPosition.appId && protocol.network == coveredPosition.network
          )
          let protocol: any = {}
          if (foundProtocols.length > 1) console.log('warning in exposures')
          if (foundProtocols.length == 0) {
            // new protocol found. create new entry
            protocol = {
              appId: coveredPosition.appId,
              network: coveredPosition.network,
              balanceUSD: 0,
              coverLimit: 0,
              highestPosition: 0,
              totalExposure: 0,
              totalLossPayoutAmount: 0,
              premiumsPerYear: 0,
              policies: [],
              positions: [],
            }
            protocols.push(protocol)
            // map to series
            const foundSeries = series.data.protocolMap.filter((s: any) => s.appId == coveredPosition.appId)
            if (foundSeries.length > 1) console.log('protocols series uhh')
            if (foundSeries.length == 0) {
              // unknown protocol
              protocol.tier = 'F'
              protocol.category = 'unknown'
              protocol.rol = series.data.rateCard[0].rol
            } else {
              const tier = foundSeries[0].tier
              protocol.tier = mapNumberToLetter(tier)
              protocol.category = foundSeries[0].category
              protocol.rol = series.data.rateCard[tier].rol
            }
          } else protocol = foundProtocols[0]

          const balanceUSD = parseFloat(coveredPosition.balanceUSD)
          const coverLimit = parseFloat(formatUnits(policy.coverLimit, 18))
          const totalLossPayoutAmount = Math.min(coverLimit, balanceUSD)
          const premiumsPerYear = totalLossPayoutAmount * protocol.rol
          protocol.balanceUSD += balanceUSD
          protocol.coverLimit += coverLimit
          protocol.highestPosition = Math.max(protocol.highestPosition, balanceUSD)
          protocol.totalLossPayoutAmount += totalLossPayoutAmount
          protocol.premiumsPerYear += premiumsPerYear
          coveredPosition.premiumsPerYear = premiumsPerYear
          protocol.policies.push(policy)
          protocol.positions.push(coveredPosition)
        })
      })
      const adjustedProtocols = protocols.map((p: ProtocolExposureType) => {
        return {
          ...p,
          totalExposure: Math.min(p.balanceUSD, p.coverLimit),
        }
      })
      setProtocolExposureData(adjustedProtocols)
    }
    aggregateSpiExposures()
  }, [statsCache])

  return protocolExposureData
}
