import React from 'react'
import { Button } from '../../../../components/atoms/Button'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { LockData } from '../../../../constants/types'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { useStakingRewards } from '../../../../hooks/useStakingRewards'
import { FunctionName } from '../../../../constants/enums'
import { StyledForm } from '../../atoms/StyledForm'

export default function RewardsForm({ lock }: { lock: LockData }): JSX.Element {
  const { handleToast, handleContractCallError, gasConfig } = useInputAmount()
  const { harvestLockRewards } = useStakingRewards()

  const callHarvestLockRewards = async () => {
    await harvestLockRewards([lock.xsLockID], gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callHarvestLockRewards', err, FunctionName.HARVEST_LOCK))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox
        type={InfoBoxType.info}
        text={
          !lock.pendingRewards.isZero()
            ? 'Rewards are accrued by the second. Depositing or withdrawing SOLACE, or extending a lockup period also harvests rewards for you.'
            : "You don't have any rewards to collect. Stake SOLACE to earn rewards!"
        }
      />
      <StyledForm>
        <Button secondary info noborder disabled={lock.pendingRewards.isZero()} onClick={callHarvestLockRewards}>
          Harvest
        </Button>
      </StyledForm>
    </div>
  )
}
