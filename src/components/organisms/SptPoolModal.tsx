/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    SptPoolModal
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'

/* import constants */
import { FunctionName } from '../../constants/enums'

/* import components */
import { PoolModalProps } from './PoolModalRouter'
import { Erc721PoolModalGeneric } from './Erc721PoolModalGeneric'

/* import hooks */
import { useUserWalletPolicies, useDepositedPolicies } from '../../hooks/useBalance'
import { useSptFarm } from '../../hooks/useSptFarm'

/* import utils */

export const SptPoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { sptFarm } = useContracts()
  const userPolicyTokenInfo = useUserWalletPolicies()
  const depositedUserPolicyTokenInfo = useDepositedPolicies()
  const { depositPolicy, withdrawPolicy } = useSptFarm()

  return (
    <Erc721PoolModalGeneric
      modalTitle={modalTitle}
      func={func}
      isOpen={isOpen}
      closeModal={closeModal}
      farmContract={sptFarm}
      depositFunc={{
        name: FunctionName.DEPOSIT_POLICY_SIGNED,
        func: depositPolicy,
      }}
      withdrawFunc={{
        name: FunctionName.WITHDRAW_POLICY,
        func: withdrawPolicy,
      }}
      userNftTokenInfo={userPolicyTokenInfo}
      depositedNftTokenInfo={depositedUserPolicyTokenInfo}
    />
  )
}
