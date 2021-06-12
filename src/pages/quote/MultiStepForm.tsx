import React from 'react'
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import { ProtocolStep } from './ProtocolStep'
import { PositionStep } from './PositionStep'
import { CoverageStep } from './CoverageStep'
import { ConfirmStep } from './ConfirmStep'
import { Step, StepsContainer, StepsWrapper, StepsProgress, StepsProgressBar } from '../../components/Progress'
import styled from 'styled-components'

interface useStepType {
  step: any
  navigation: any
}

export interface formProps {
  formData: any
  setForm: SetForm
  navigation: any
}

const defaultData = {
  protocol: {},
  lastProtocol: {},
  position: {},
  balances: [],
  coverageLimit: '50',
  timePeriod: '180',
  loading: false,
}

enum StepNumber {
  'protocol' = 0,
  'position' = 1,
  'coverage' = 2,
  'confirm' = 3,
}

const FormContent = styled.div`
  display: grid;
  align-content: start;
  gap: 50px;
`

const steps = [{ id: 'protocol' }, { id: 'position' }, { id: 'coverage' }, { id: 'confirm' }]

export const MultiStepForm = () => {
  const [formData, setForm] = useForm(defaultData)
  const { step, navigation }: useStepType = useStep({
    steps,
    initialStep: 0,
  })

  const props = { formData, setForm, navigation }

  const getForm = () => {
    switch (step.id) {
      case 'protocol':
        return <ProtocolStep {...props} />
      case 'position':
        return <PositionStep {...props} />
      case 'coverage':
        return <CoverageStep {...props} />
      default:
        return <ConfirmStep {...props} />
    }
  }

  return (
    <FormContent>
      <StepsContainer step={Number(StepNumber[step.id]) + 1}>
        <StepsWrapper>
          <Step>Select Protocol</Step>
          <Step>Select Position</Step>
          <Step>Choose Limit &amp; Period</Step>
          <Step>Confirm</Step>
        </StepsWrapper>
        <StepsProgress>
          <StepsProgressBar></StepsProgressBar>
        </StepsProgress>
      </StepsContainer>
      {getForm()}
    </FormContent>
  )
}
