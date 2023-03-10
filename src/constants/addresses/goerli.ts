import { SOLACE_TOKEN, XSOLACE_TOKEN } from '../mappings/token'

export const KEY_ADDRS = {
  SOLACE: SOLACE_TOKEN.address[5],
  XSLOCKER: '0x501Ace47c5b0C2099C4464f681c3fa2ECD3146C1',
  XSOLACE: XSOLACE_TOKEN.address[5],
  MIGRATION: '0xfdFbD12e91B3303C2E7ff8C46679a79E1AB8886b',
}

export const NATIVE_ADDRS = {
  DEPOSIT_HELPER: '0x501acE1652Cb4d7386cdaBCd84CdE26C811F3520',
  GAUGE_CONTROLLER: '0x501acE57a87C6B4Eec1BfD2fF2d600F65C2875aB',
  UW_LOCK_VOTING: '0x501ACe9cc96E4eE51a4c2098d040EE15F6f3e77F',
  UW_LOCKER: '0x501aCeFC6a6ff5Aa21c27D7D9D58bedCA94f7BC9',
  UWP: '0x501ACEb41708De16FbedE3b31f3064919E9d7F23',
  UWE: '0x501ACE809013C8916CAAe439e9653bc436172919',
  FLUX_MEGA_ORACLE: '0x501AcE8E475B7fD921fcfeBB365374cA62cED1a5',
  SOLACE_MEGA_ORACLE: '0x501acEC7AD3F8bb5Fc3C925dcAC1C4077e2bb7C5',
  BRIBE_CONTROLLER: '0x501Ace5093F43FBF578d081f2d93B5f42e905f90',
}
