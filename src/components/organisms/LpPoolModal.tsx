/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    LpPoolModal
      hooks

  *************************************************************************************/

/* import packages */
import React, { useMemo } from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'

/* import constants */
import { FunctionName } from '../../constants/enums'

/* import components */
import { PoolModalProps } from './PoolModalRouter'
import { Erc721PoolModalGeneric } from './Erc721PoolModalGeneric'

/* import hooks */
import { useUserWalletLpBalance, useDepositedLpBalance } from '../../hooks/useBalance'
import { useLpFarm } from '../../hooks/useLpFarm'

/* import utils */

export const LpPoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { keyContracts } = useContracts()
  const { lpFarm } = useMemo(() => keyContracts, [keyContracts])
  const userLpTokenInfo = useUserWalletLpBalance()
  const depositedLpTokenInfo = useDepositedLpBalance()
  const { depositLp, withdrawLp } = useLpFarm()

  return (
    <Erc721PoolModalGeneric
      modalTitle={modalTitle}
      func={func}
      isOpen={isOpen}
      closeModal={closeModal}
      farmContract={lpFarm}
      depositFunc={{
        name: FunctionName.DEPOSIT_LP_SIGNED,
        func: depositLp,
      }}
      withdrawFunc={{
        name: FunctionName.WITHDRAW_LP,
        func: withdrawLp,
      }}
      userNftTokenInfo={userLpTokenInfo}
      depositedNftTokenInfo={depositedLpTokenInfo}
    />
  )
}
