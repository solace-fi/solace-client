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
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

/* import context */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'

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
import { Heading2, Text } from '../../components/atoms/Typography'

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

const StepSections = [
  { name: 'Select Protocol', description: 'Which protocol do you want coverage for?' },
  { name: 'Select Position', description: 'What asset do you want to cover?' },
  { name: 'Choose Limit & Period', description: 'How much and for how long?' },
  { name: 'Confirmation', description: 'Coverage policy successfully purchased!' },
]

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
  coverAmount: '1',
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
  const { account } = useWallet()
  const { activeNetwork, chainId } = useNetwork()
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
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <StepsContainer step={Number(StepNumber[step.id]) + 1}>
          <StepsWrapper>
            {StepSections.map((section, i) => (
              <Step key={i}>{section.name}</Step>
            ))}
          </StepsWrapper>
          <StepsProgress>
            <StepsProgressBar></StepsProgressBar>
          </StepsProgress>
        </StepsContainer>
      ) : (
        <FormRow mb={0} mt={20} ml={30} mr={30} style={{ justifyContent: 'center' }}>
          <FormCol>
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={((Number(StepNumber[step.id]) + 1) / StepSections.length) * 100}
                text={`${Number(StepNumber[step.id]) + 1} / ${StepSections.length}`}
                strokeWidth={4}
                styles={buildStyles({
                  textSize: '24px',
                  textColor: 'white',
                  trailColor: 'rgba(255,255,255,0.1)',
                  pathColor: `rgb(255,255,255)`,
                })}
              />
            </div>
          </FormCol>
          <FormCol>
            <Text h2>{StepSections[Number(StepNumber[step.id])].name}</Text>
            <Text t3>{StepSections[Number(StepNumber[step.id])].description}</Text>
          </FormCol>
        </FormRow>
      )}
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
                <BoxItem>
                  {protocol.availableCoverage} {activeNetwork.nativeCurrency.symbol}
                </BoxItem>
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
                    <Heading2>
                      {protocol.availableCoverage} {activeNetwork.nativeCurrency.symbol}
                    </Heading2>
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
