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
import React, { useEffect, useState, useCallback } from 'react'

/* import packages */
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import styled from 'styled-components'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

/* import context */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { Token } from '../../constants/types'

/* import components */
import { ProtocolStep } from './ProtocolStep'
import { PositionStep } from './PositionStep'
import { CoverageStep } from './CoverageStep'
import { ConfirmStep } from './ConfirmStep'
import { Step, StepsContainer, StepsWrapper, StepsProgress, StepsProgressBar } from '../../components/atoms/Progress'
import { DeFiAsset, DeFiAssetImage, ProtocolTitle } from '../../components/atoms/DeFiAsset'
import { Box, BoxItem, BoxRow } from '../../components/atoms/Box'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Heading2, Text } from '../../components/atoms/Typography'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { FlexRow } from '../../components/atoms/Layout'
import { StyledDots } from '../../components/atoms/Icon'
import { AssetsModal } from '../../components/molecules/AssetsModal'
/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed } from '../../utils/formatting'

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
  positions: [],
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
  const { protocol, positions, loading } = formData
  const { step, navigation }: useStepType = useStep({
    steps,
    initialStep: 0,
  })
  const { account } = useWallet()
  const { activeNetwork, chainId } = useNetwork()
  const { width } = useWindowDimensions()
  const props = { formData, setForm, navigation }
  const [showAssetsModal, setShowAssetsModal] = useState<boolean>(false)
  const maxPositionsToDisplay = 4

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

  const closeModal = useCallback(() => {
    setShowAssetsModal(false)
  }, [])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (Number(StepNumber[step.id]) == 2 || Number(StepNumber[step.id]) == 1) {
      navigation.go(0)
    }
    setForm({
      target: {
        name: 'positions',
        value: [],
      },
    })
  }, [account, chainId])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <FormContent>
      <AssetsModal
        closeModal={closeModal}
        isOpen={showAssetsModal}
        assets={positions}
        modalTitle={'Selected Positions'}
      />
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <StepsContainer step={Number(StepNumber[step.id]) + 1}>
          <StepsWrapper>
            {StepSections.map((section) => (
              <Step key={section.name}>{section.name}</Step>
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
            <Text high_em h2 style={{ marginBottom: '10px' }}>
              {StepSections[Number(StepNumber[step.id])].name}
            </Text>
            <Text t4>{StepSections[Number(StepNumber[step.id])].description}</Text>
          </FormCol>
        </FormRow>
      )}
      {Number(StepNumber[step.id]) !== 0 && Number(StepNumber[step.id]) !== 3 && (
        <>
          {width > MAX_MOBILE_SCREEN_WIDTH ? (
            <BoxRow>
              <Box>
                <BoxItem>
                  <DeFiAsset>
                    <DeFiAssetImage mr={10}>
                      <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`} alt={protocol.name} />
                    </DeFiAssetImage>
                    <ProtocolTitle high_em h3>
                      {protocol.name}
                    </ProtocolTitle>
                  </DeFiAsset>
                </BoxItem>
                <BoxItem>
                  <Text t3 high_em>
                    {fixed(protocol.yearlyCost * 100, 2)}% <StyledTooltip id={'yearly-cost'} tip={'Yearly Cost'} />
                  </Text>
                </BoxItem>
                <BoxItem>
                  <Text t3 high_em>
                    {protocol.availableCoverage} {activeNetwork.nativeCurrency.symbol}{' '}
                    <StyledTooltip id={'available-coverage'} tip={'Available Coverage'} />
                  </Text>
                </BoxItem>
                <BoxItem>
                  <Button onClick={() => navigation.go(0)}>Change</Button>
                </BoxItem>
              </Box>
              {Number(StepNumber[step.id]) == 1 && (
                <Box transparent outlined>
                  <BoxItem>
                    <Text high_em>{loading ? 'Loading Your Positions...' : 'Select Position Below'}</Text>
                  </BoxItem>
                </Box>
              )}
              {Number(StepNumber[step.id]) == 2 && positions.length > 0 && (
                <Box purple>
                  <BoxItem>
                    <FlexRow>
                      {positions.slice(0, maxPositionsToDisplay).map((position: Token) => (
                        <DeFiAsset key={position.underlying.address}>
                          <DeFiAssetImage mr={5}>
                            <img
                              src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}`}
                              alt={position.underlying.name}
                            />
                          </DeFiAssetImage>
                        </DeFiAsset>
                      ))}
                      {positions.length > maxPositionsToDisplay && <StyledDots size={20} />}
                    </FlexRow>
                  </BoxItem>
                  {positions.length > maxPositionsToDisplay && (
                    <BoxItem>
                      <Button onClick={() => setShowAssetsModal(true)}>View all assets</Button>
                    </BoxItem>
                  )}

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
                    <DeFiAssetImage mr={10}>
                      <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`} alt={protocol.name} />
                    </DeFiAssetImage>
                  </FormCol>
                  <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                    <Heading2 high_em>{protocol.name}</Heading2>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Yearly Cost</FormCol>
                  <FormCol>
                    <Heading2 high_em>{fixed(protocol.yearlyCost * 100, 2)}%</Heading2>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Available Coverage</FormCol>
                  <FormCol>
                    <Heading2 high_em>
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
              {Number(StepNumber[step.id]) == 2 && positions.length > 0 && (
                <Card purple>
                  <FlexRow>
                    {positions.slice(0, maxPositionsToDisplay).map((position: Token) => (
                      <DeFiAssetImage mr={5} key={position.underlying.address}>
                        <img
                          src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}`}
                          alt={position.underlying.name}
                        />
                      </DeFiAssetImage>
                    ))}
                    {positions.length > maxPositionsToDisplay && <StyledDots size={20} />}
                  </FlexRow>
                  <ButtonWrapper isColumn>
                    {positions.length > maxPositionsToDisplay && (
                      <Button widthP={100} onClick={() => setShowAssetsModal(true)}>
                        View all assets
                      </Button>
                    )}

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
