/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import components
    import utils

    interfaces
    enums
    variables
    styled components

    MultiStepForm function
      Hook variables
      Local helper functions
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect } from 'react'

/* import packages */
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import styled from 'styled-components'

/* import components */
import { ProtocolStep } from './ProtocolStep'
import { PositionStep } from './PositionStep'
import { CoverageStep } from './CoverageStep'
import { ConfirmStep } from './ConfirmStep'
import { Step, StepsContainer, StepsWrapper, StepsProgress, StepsProgressBar } from '../../components/Progress'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { Box, BoxItem, BoxRow } from '../../components/Box'
import { Button } from '../../components/Button'

/* import utils */
import { fixed, fixedPositionBalance } from '../../utils/formatting'
import { useWallet } from '../../context/WalletManager'

/************************************************************************************* 

    interfaces

  *************************************************************************************/
interface useStepType {
  step: any
  navigation: any
}

export interface formProps {
  formData: any
  setForm: SetForm
  navigation: any
}

/************************************************************************************* 

    enums

  *************************************************************************************/
enum StepNumber {
  'protocol' = 0,
  'position' = 1,
  'coverage' = 2,
  'confirm' = 3,
}

/************************************************************************************* 

    variables 

  *************************************************************************************/

const defaultData = {
  protocol: {
    name: '',
    availableCoverage: '',
    yearlyCost: 0,
  },
  lastProtocol: {
    name: '',
    availableCoverage: '',
    yearlyCost: 0,
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

const steps = [{ id: 'protocol' }, { id: 'position' }, { id: 'coverage' }, { id: 'confirm' }]

/************************************************************************************* 

    styled components 

  *************************************************************************************/

const FormContent = styled.div`
  display: grid;
  align-content: start;
  gap: 50px;
`

export const MultiStepForm = () => {
  /*************************************************************************************

  Hook variables

  *************************************************************************************/
  const [formData, setForm] = useForm(defaultData)
  const { protocol, position, loading } = formData
  const { step, navigation }: useStepType = useStep({
    steps,
    initialStep: 0,
  })
  const { account, chainId } = useWallet()

  const props = { formData, setForm, navigation }

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/

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

  useEffect(() => {
    if (Number(StepNumber[step.id]) == 2) {
      navigation.go(0)
    }
  }, [account, chainId])

  /*************************************************************************************

  Render

  *************************************************************************************/

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
            <BoxItem>{fixed(protocol.yearlyCost * 100, 2)}%</BoxItem>
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
