import { LocalSolaceRiskProtocol } from '../constants/types'
import { SolaceRiskProtocol } from '@solace-fi/sdk-nightly'

export function mapEditableProtocols(
  editableProtocols: LocalSolaceRiskProtocol[]
): { [key: string]: LocalSolaceRiskProtocol } {
  const map: { [key: string]: LocalSolaceRiskProtocol } = {}
  editableProtocols.forEach((protocol) => {
    map[protocol.appId.toLowerCase()] = protocol
  })
  return map
}

export function mapUniqueRiskProtocols(protocols: SolaceRiskProtocol[]): { [key: string]: LocalSolaceRiskProtocol } {
  const protocolsByName: { [key: string]: LocalSolaceRiskProtocol } = {}
  let index = 0
  protocols.forEach((p) => {
    if (protocolsByName[p.appId.toLowerCase()]) {
      protocolsByName[p.appId.toLowerCase()].balanceUSD += p.balanceUSD
      protocolsByName[p.appId.toLowerCase()].networks.push(p.network)
    } else {
      protocolsByName[p.appId.toLowerCase()] = { ...p, index, networks: [p.network] }
      index++
    }
  })
  return protocolsByName
}
