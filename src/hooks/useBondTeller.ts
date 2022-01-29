import { BondTellerDetails, BondToken } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { BigNumber } from 'ethers'
import { listTokensOfOwner } from '../utils/contract'

export const useUserBondDataV2 = () => {
  const { keyContracts } = useContracts()

  const getUserBondDataV2 = async (selectedBondDetail: BondTellerDetails, account: string) => {
    const ownedTokenIds: BigNumber[] = await listTokensOfOwner(selectedBondDetail.tellerData.teller.contract, account)
    const ownedBondData = await Promise.all(
      ownedTokenIds.map(async (id) => await selectedBondDetail.tellerData.teller.contract.bonds(id))
    )
    const ownedBonds: BondToken[] = ownedTokenIds.map((id, idx) => {
      return {
        id,
        payoutAmount: ownedBondData[idx].payoutAmount,
        payoutAlreadyClaimed: ownedBondData[idx].payoutAlreadyClaimed,
        principalPaid: ownedBondData[idx].principalPaid,
        vestingStart: ownedBondData[idx].vestingStart,
        localVestingTerm: ownedBondData[idx].localVestingTerm,
      }
    })
    return ownedBonds
  }
}
