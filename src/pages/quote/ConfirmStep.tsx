import React from 'react'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { Heading1, Heading2 } from '../../components/Text'
import { formProps } from './MultiStepForm'

export const ConfirmStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const CongratsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  `

  return (
    <CongratsContainer>
      <Heading1>Confirmed!</Heading1>
      <Heading2>You are now covered by Solace and can manage your policy on the dashboard.</Heading2>
      <div style={{ marginTop: '24px' }}>
        <Button secondary>Go to Dashboard</Button>
      </div>
    </CongratsContainer>
  )
}
