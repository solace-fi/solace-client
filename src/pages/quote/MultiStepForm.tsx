import React from 'react'
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import { ProtocolStep } from './ProtocolStep'
import { PositionStep } from './PositionStep'
import { CoverageStep } from './CoverageStep'
import { ConfirmStep } from './ConfirmStep'
import { Step, StepsContainer, StepsWrapper, StepsProgress, StepsProgressBar } from '../../components/Progress'
import styled from 'styled-components'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { Box, BoxItem, BoxRow } from '../../components/Box'
import { Button } from '../../components/Button'
import { fixedPositionBalance } from '../../utils/formatting'

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
  protocol: {
    name: '',
    availableCoverage: '',
  },
  lastProtocol: {
    name: '',
    availableCoverage: '',
  },
  position: {
    token: {
      address: '',
      name: '',
      symbol: '',
      decimals: 0,
      balance: '',
    },
    underlying: { address: '', name: '', symbol: '', decimals: 0, balance: '' },
    eth: { balance: '' },
  },
  balances: [],
  coverageLimit: '5000',
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
  const { protocol, position, loading } = formData
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
          <Step>Confirmation</Step>
        </StepsWrapper>
        <StepsProgress>
          <StepsProgressBar></StepsProgressBar>
        </StepsProgress>
      </StepsContainer>
      {Number(StepNumber[step.id]) !== 0 && Number(StepNumber[step.id]) !== 3 && (
        <BoxRow>
          <Box>
            <BoxItem>
              <Protocol>
                <ProtocolImage>
                  <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}.svg`} />
                </ProtocolImage>
                <ProtocolTitle>{protocol.name}</ProtocolTitle>
              </Protocol>
            </BoxItem>
            <BoxItem>2.60%</BoxItem>
            <BoxItem>{protocol.availableCoverage} ETH</BoxItem>
            <BoxItem>
              <Button onClick={() => navigation.go(0)}>Change</Button>
            </BoxItem>
          </Box>
          {Number(StepNumber[step.id]) == 1 && (
            <Box transparent outlined>
              <BoxItem>{loading ? 'Loading Your Positions...' : 'Select Position Below'}</BoxItem>
            </Box>
          )}
          {Number(StepNumber[step.id]) == 2 && !!position.underlying && (
            <Box purple>
              <BoxItem>
                <Protocol>
                  <ProtocolImage>
                    <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}.svg`} />
                  </ProtocolImage>
                  <ProtocolTitle>{position.underlying.name}</ProtocolTitle>
                </Protocol>
              </BoxItem>
              <BoxItem>
                {fixedPositionBalance(position.underlying)} {position.underlying.symbol}
              </BoxItem>
              <BoxItem>
                <Button onClick={() => navigation.go(1)}>Change</Button>
              </BoxItem>
            </Box>
          )}
        </BoxRow>
      )}
      {getForm()}
    </FormContent>
  )
}
