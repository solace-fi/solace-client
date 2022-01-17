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

export default function DepositForm(): JSX.Element {
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
        text="Every action like “Extending Lock” or “Deposit” automatically collects rewards."
      />
      <StyledForm onSubmit={onSubmit}>
        <Button secondary info noborder>
          Stake
        </Button>
      </StyledForm>
    </div>
  )
}
