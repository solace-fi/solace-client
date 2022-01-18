import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'

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

export default function RewardsForm(): JSX.Element {
  const availableRewards = 1
  // const solaceBalance = useSolaceBalance()
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('clickity click')
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
          availableRewards
            ? 'Every action like “Extending Lock” or “Deposit” automatically collects rewards.'
            : "You don't have any rewards to collect. Stake SOLACE to earn rewards!"
        }
      />
      <StyledForm onSubmit={onSubmit}>
        {availableRewards > 0 ? (
          <Button secondary info noborder>
            Collect
          </Button>
        ) : (
          <Button disabled>Collect</Button>
        )}
      </StyledForm>
    </div>
  )
}
