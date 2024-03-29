import { SOLACE_TOKEN, XSOLACE_TOKEN } from '../mappings/token'

export const KEY_ADDRS = {
  SOLACE: SOLACE_TOKEN.address[1313161554],
  XSLOCKER: '0x501Ace47c5b0C2099C4464f681c3fa2ECD3146C1',
  XSOLACE: XSOLACE_TOKEN.address[1313161554],
}

export const TELLER_ADDRS_V2 = {
  DAI_TELLER: '0x501ACe677634Fd09A876E88126076933b686967a',
  ETH_TELLER: '0x501ACe95141F3eB59970dD64af0405f6056FB5d8',
  USDC_TELLER: '0x501ACE7E977e06A3Cb55f9c28D5654C9d74d5cA9',
  WBTC_TELLER: '0x501aCEF0d0c73BD103337e6E9Fd49d58c426dC27',
  USDT_TELLER: '0x501ACe5CeEc693Df03198755ee80d4CE0b5c55fE',
  FRAX_TELLER: '0x501aCef4F8397413C33B13cB39670aD2f17BfE62',
  NEAR_TELLER: '0x501aCe71a83CBE03B1467a6ffEaeB58645d844b4',
  AURORA_TELLER: '0x501Ace35f0B7Fad91C199824B8Fe555ee9037AA3',
}

export const NATIVE_ADDRS = {
  DEPOSIT_HELPER: '',
  GAUGE_CONTROLLER: '',
  UW_LOCK_VOTING: '',
  UW_LOCKER: '',
  UWP: '',
  UWE: '',
  FLUX_MEGA_ORACLE: '',
  SOLACE_MEGA_ORACLE: '',
  BRIBE_CONTROLLER: '',
}

export const SPECIAL_ADDRS = {
  BSOLACE: '0x1BDA7007C9e3Bc33267E883864137aF8eb53CC2D',
  BRIDGE_WRAPPER: '0x501ACE45014539C5574055794d8a82A3d31fcb54',
}
