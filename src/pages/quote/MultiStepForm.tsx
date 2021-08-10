/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import context
    import constants
    import components
    import hooks
    import utils

    interfaces
    enums
    variables
    styled components

    MultiStepForm function
      custom hooks
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect } from 'react'

/* import packages */
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import styled from 'styled-components'

/* import context */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH, ZERO } from '../../constants'

/* import components */
import { ProtocolStep } from './ProtocolStep'
import { PositionStep } from './PositionStep'
import { CoverageStep } from './CoverageStep'
import { ConfirmStep } from './ConfirmStep'
import { Step, StepsContainer, StepsWrapper, StepsProgress, StepsProgressBar } from '../../components/atoms/Progress'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/atoms/Protocol'
import { Box, BoxItem, BoxRow } from '../../components/atoms/Box'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Heading2 } from '../../components/atoms/Typography'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed, fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'

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
  position: {
    token: {
      address: '',
      name: '',
      symbol: '',
      decimals: 0,
      balance: ZERO,
    },
    underlying: { address: '', name: '', symbol: '', decimals: 0, balance: ZERO },
    eth: { balance: ZERO },
  },
  balances: [],
  coverageLimit: '5000',
  timePeriod: '5',
  loading: true,
}

const steps = [{ id: 'protocol' }, { id: 'position' }, { id: 'coverage' }, { id: 'confirm' }]

/************************************************************************************* 

    styled components 

  *************************************************************************************/

const FormContent = styled.div`
  display: grid;
  align-content: start;
  gap: 20px;
`

export const MultiStepForm = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const [formData, setForm] = useForm(defaultData)
  const { protocol, position, loading } = formData
  const { step, navigation }: useStepType = useStep({
    steps,
    initialStep: 0,
  })
  const { account, chainId } = useWallet()
  const { width } = useWindowDimensions()
  const props = { formData, setForm, navigation }

  /*************************************************************************************

  Local functions

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

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (Number(StepNumber[step.id]) == 2 || Number(StepNumber[step.id]) == 1) {
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
        <>
          {width > MAX_MOBILE_SCREEN_WIDTH ? (
            <BoxRow>
              <Box>
                <BoxItem>
                  <Protocol>
                    <ProtocolImage mr={10}>
                      <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`} />
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
                      <ProtocolImage mr={10}>
                        <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}`} />
                      </ProtocolImage>
                      <ProtocolTitle>{position.underlying.name}</ProtocolTitle>
                    </Protocol>
                  </BoxItem>
                  <BoxItem>
                    {truncateBalance(fixedTokenPositionBalance(position.underlying))} {position.underlying.symbol}
                  </BoxItem>
                  <BoxItem>
                    <Button onClick={() => navigation.go(1)}>Change</Button>
                  </BoxItem>
                </Box>
              )}
            </BoxRow>
          ) : (
            //mobile version
            <CardContainer m={20}>
              <Card blue>
                <FormRow>
                  <FormCol>
                    <ProtocolImage mr={10}>
                      <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`} />
                    </ProtocolImage>
                  </FormCol>
                  <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                    <Heading2>{protocol.name}</Heading2>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Yearly Cost</FormCol>
                  <FormCol>
                    <Heading2>{fixed(protocol.yearlyCost * 100, 2)}%</Heading2>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Available Coverage</FormCol>
                  <FormCol>
                    <Heading2>{protocol.availableCoverage} ETH</Heading2>
                  </FormCol>
                </FormRow>
                <ButtonWrapper>
                  <Button widthP={100} onClick={() => navigation.go(0)}>
                    Change
                  </Button>
                </ButtonWrapper>
              </Card>
              {Number(StepNumber[step.id]) == 1 && (
                <Card transparent p={0}>
                  <Box transparent outlined>
                    <BoxItem>{loading ? 'Loading Your Positions...' : 'Select Position Below'}</BoxItem>
                  </Box>
                </Card>
              )}
              {Number(StepNumber[step.id]) == 2 && !!position.underlying && (
                <Card purple>
                  <FormRow>
                    <Protocol>
                      <ProtocolImage mr={10}>
                        <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}`} />
                      </ProtocolImage>
                      <ProtocolTitle>{position.underlying.name}</ProtocolTitle>
                    </Protocol>
                  </FormRow>
                  <FormRow>
                    <FormCol>Position Amount</FormCol>
                    <FormCol>
                      {truncateBalance(fixedTokenPositionBalance(position.underlying))} {position.underlying.symbol}
                    </FormCol>
                  </FormRow>
                  <ButtonWrapper>
                    <Button widthP={100} onClick={() => navigation.go(1)}>
                      Change
                    </Button>
                  </ButtonWrapper>
                </Card>
              )}
            </CardContainer>
          )}
        </>
      )}
      {getForm()}
    </FormContent>
  )
}
