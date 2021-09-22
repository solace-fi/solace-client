import { NetworkConfig, Token } from '../../../constants/types'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig): Promise<Token[]> => {
  // mainnet addresses
  let TROVE_MANAGER_ADDRESS = '0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2'
  let LQTY_STAKING_ADDRESS = '0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d'
  let STABILITY_POOL_ADDRESS = '0x66017D22b0f8556afDd19FC67041899Eb65a21bb'
  if (activeNetwork.chainId == 4) {
    TROVE_MANAGER_ADDRESS = '0x04d630Bff6dea193Fd644dEcfC460db249854a02'
    LQTY_STAKING_ADDRESS = '0x988749E04e5B0863Da4E0Fdb1EaD85C1FA59fCe3'
    STABILITY_POOL_ADDRESS = '0xB8eb11f9eFF55378dfB692296C32DF020f5CC7fF'
  }
}
