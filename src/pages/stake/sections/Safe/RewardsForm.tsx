import React from 'react'
import { Button, ButtonWrapper } from '../../../../components/atoms/Button'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { LockData } from '../../../../constants/types'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { useStakingRewards } from '../../../../hooks/useStakingRewards'
import { FunctionName } from '../../../../constants/enums'
import { StyledForm } from '../../atoms/StyledForm'

export default function RewardsForm({ lock }: { lock: LockData }): JSX.Element {
  const { handleToast, handleContractCallError, gasConfig } = useInputAmount()
  const { harvestLockRewards, compoundLockRewards } = useStakingRewards()

  const callHarvestLockRewards = async () => {
    await harvestLockRewards([lock.xsLockID], gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callHarvestLockRewards', err, FunctionName.HARVEST_LOCK))
  }

  const callCompoundLockRewards = async () => {
    await compoundLockRewards([lock.xsLockID], gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callCompoundLockRewards', err, FunctionName.COMPOUND_LOCK))
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
            ? 'Rewards are accrued per second. Depositing, withdrawing, or changing a lockup period harvests rewards for you. You may compound your rewards if you wish to stake them.'
            : "You don't have any rewards to collect. Stake SOLACE to earn rewards!"
        }
      />
      <StyledForm>
        <ButtonWrapper>
          <Button secondary info noborder disabled={lock.pendingRewards.isZero()} onClick={callHarvestLockRewards}>
            Harvest
          </Button>
          <Button secondary info noborder disabled={lock.pendingRewards.isZero()} onClick={callCompoundLockRewards}>
            Compound
          </Button>
        </ButtonWrapper>
      </StyledForm>
    </div>
  )
}
