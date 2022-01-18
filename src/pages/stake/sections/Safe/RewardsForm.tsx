import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { LockData } from '../../../../constants/types'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { useStakingRewards } from '../../../../hooks/useStakingRewards'
import { FunctionName } from '../../../../constants/enums'
import { parseUnits } from 'ethers/lib/utils'
import { ZERO } from '../../../../constants'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 30px;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  width: 521px;
`

export default function RewardsForm({ lock }: { lock: LockData }): JSX.Element {
  const { handleToast, handleContractCallError, gasConfig } = useInputAmount()
  const { harvestLockRewards } = useStakingRewards()

  const callHarvestLockRewards = async () => {
    await harvestLockRewards([lock.xsLockID], gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callHarvestLockRewards', err, FunctionName.HARVEST_LOCK))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    callHarvestLockRewards()
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
        text="Rewards are accrued by the second. Depositing or withdrawing SOLACE, or extending a lockup period also harvests rewards for you."
      />
      <StyledForm onSubmit={onSubmit}>
        <Button secondary info noborder disabled={parseUnits(lock.pendingRewards, 18).eq(ZERO)}>
          Harvest
        </Button>
      </StyledForm>
    </div>
  )
}
