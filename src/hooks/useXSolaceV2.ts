import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'

export const useXSolaceV2 = () => {
  const { keyContracts } = useContracts()
  const { account, library } = useWallet()
  const { chainId } = useNetwork()
}
