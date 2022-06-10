import { LocalSolaceRiskProtocol } from '../constants/types'

export default function mapEditableProtocols(
  editableProtocols: LocalSolaceRiskProtocol[]
): { [key: string]: LocalSolaceRiskProtocol } {
  const map: { [key: string]: LocalSolaceRiskProtocol } = {}
  editableProtocols.forEach((protocol) => {
    map[protocol.appId.toLowerCase()] = protocol
  })
  return map
}
