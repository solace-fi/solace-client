import React from 'react'
import { Button, ButtonWrapper } from '../../../../components/atoms/Button'
import InformationBox from '../../components/InformationBox'
import { LockData } from '@solace-fi/sdk-nightly'
import { useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { useStakingRewards } from '../../../../hooks/stake/useStakingRewards'
import { FunctionName, InfoBoxType } from '../../../../constants/enums'
import { StyledForm } from '../../atoms/StyledForm'

export default function RewardsForm({ lock }: { lock: LockData }): JSX.Element {
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { harvestLockRewards, compoundLockRewards } = useStakingRewards()

  const callHarvestLockRewards = async () => {
    await harvestLockRewards([lock.xsLockID])
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callHarvestLockRewards', err, FunctionName.HARVEST_LOCK))
  }

  const callCompoundLockRewards = async () => {
    await compoundLockRewards([lock.xsLockID], false)
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
