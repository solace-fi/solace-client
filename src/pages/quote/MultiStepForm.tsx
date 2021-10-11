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
import React, { useEffect, useState, useCallback, useMemo } from 'react'

/* import packages */
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import styled from 'styled-components'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

/* import context */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { BasicData, LiquityPosition, Position, Token } from '../../constants/types'

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
import { Text } from '../../components/atoms/Typography'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { FlexRow } from '../../components/atoms/Layout'
import { StyledDots } from '../../components/atoms/Icon'
import { AssetsModal } from '../../components/organisms/AssetsModal'
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
  timePeriod: '30',
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
  const { appTheme } = useGeneral()
  const { width } = useWindowDimensions()
  const props = { formData, setForm, navigation }
  const [showAssetsModal, setShowAssetsModal] = useState<boolean>(false)
  const formattedAssets: BasicData[] = useMemo(
    () =>
      positions.map((pos: Position) => {
        switch (pos.type) {
          case 'erc20':
            return {
              name: (pos.position as Token).underlying.name,
              address: (pos.position as Token).underlying.address,
            }
          case 'liquity':
            return {
              name: (pos.position as LiquityPosition).positionName,
              address: (pos.position as LiquityPosition).positionAddress,
            }
          case 'other':
          default:
            return {
              name: '',
              address: '',
            }
        }
      }),
    [positions]
  )
  const maxPositionsToDisplay = 4

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const closeModal = useCallback(() => {
    setShowAssetsModal(false)
  }, [])

  const resetForm = () => {
    navigation.go(0)
    setForm({
      target: {
        name: 'positions',
        value: [],
      },
    })
  }

  const getForm = () => {
    switch (step.id) {
      case 'protocol':
        return <ProtocolStep {...props} />
      case 'position':
        return <PositionStep {...props} />
      case 'coverage':
        return <CoverageStep {...props} />
      default:
        return <ConfirmStep {...props} resetForm={resetForm} />
    }
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    resetForm()
  }, [account, chainId])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <FormContent>
      <AssetsModal
        closeModal={closeModal}
        isOpen={showAssetsModal}
        assets={formattedAssets}
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
        // mobile version
        <FormRow mb={0} mt={20} ml={30} mr={30} style={{ justifyContent: 'center' }}>
          <FormCol>
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={((Number(StepNumber[step.id]) + 1) / StepSections.length) * 100}
                text={`${Number(StepNumber[step.id]) + 1} / ${StepSections.length}`}
                strokeWidth={4}
                styles={buildStyles({
                  textSize: '24px',
                  textColor: appTheme == 'light' ? 'rgb(94, 94, 94)' : 'rgb(255,255,255)',
                  trailColor: appTheme == 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                  pathColor: appTheme == 'light' ? 'rgb(94, 94, 94)' : 'rgb(255,255,255)',
                })}
              />
            </div>
          </FormCol>
          <FormCol>
            <Text t2 style={{ marginBottom: '10px' }}>
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
                    <ProtocolTitle t3 light>
                      {protocol.name}
                    </ProtocolTitle>
                  </DeFiAsset>
                </BoxItem>
                <BoxItem>
                  <Text t3 light>
                    {fixed(protocol.yearlyCost * 100, 2)}% <StyledTooltip id={'yearly-cost'} tip={'Yearly Cost'} />
                  </Text>
                </BoxItem>
                <BoxItem>
                  <Text t3 light>
                    {protocol.availableCoverage} {activeNetwork.nativeCurrency.symbol}{' '}
                    <StyledTooltip id={'available-coverage'} tip={'Available Coverage'} />
                  </Text>
                </BoxItem>
                <BoxItem>
                  <Button light onClick={() => resetForm()}>
                    Change
                  </Button>
                </BoxItem>
              </Box>
              {Number(StepNumber[step.id]) == 1 && (
                <Box transparent outlined>
                  <BoxItem>
                    <Text>{loading ? 'Loading Your Positions...' : 'Select Position Below'}</Text>
                  </BoxItem>
                </Box>
              )}
              {Number(StepNumber[step.id]) == 2 && positions.length > 0 && (
                <Box color2>
                  <BoxItem>
                    <FlexRow>
                      {formattedAssets.slice(0, maxPositionsToDisplay).map((data) => {
                        return (
                          <DeFiAsset key={data.address}>
                            <DeFiAssetImage mr={5} key={data.address}>
                              <img src={`https://assets.solace.fi/${data.address.toLowerCase()}`} alt={data.name} />
                            </DeFiAssetImage>
                          </DeFiAsset>
                        )
                      })}
                      {positions.length > maxPositionsToDisplay && <StyledDots size={20} />}
                    </FlexRow>
                  </BoxItem>
                  {positions.length > maxPositionsToDisplay && (
                    <BoxItem>
                      <Button light onClick={() => setShowAssetsModal(true)}>
                        View all assets
                      </Button>
                    </BoxItem>
                  )}

                  <BoxItem>
                    <Button light onClick={() => navigation.go(1)}>
                      Change
                    </Button>
                  </BoxItem>
                </Box>
              )}
            </BoxRow>
          ) : (
            //mobile version
            <CardContainer m={20}>
              <Card color1>
                <FormRow>
                  <FormCol>
                    <DeFiAssetImage mr={10}>
                      <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`} alt={protocol.name} />
                    </DeFiAssetImage>
                  </FormCol>
                  <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                    <Text bold t2 light>
                      {protocol.name}
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>Yearly Cost</FormCol>
                  <FormCol>
                    <Text bold t2 light>
                      {fixed(protocol.yearlyCost * 100, 2)}%
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>Available Coverage</FormCol>
                  <FormCol>
                    <Text bold t2 light>
                      {protocol.availableCoverage} {activeNetwork.nativeCurrency.symbol}
                    </Text>
                  </FormCol>
                </FormRow>
                <ButtonWrapper>
                  <Button light widthP={100} onClick={() => resetForm()}>
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
                <Card color2>
                  <FlexRow>
                    {formattedAssets.slice(0, maxPositionsToDisplay).map((data) => {
                      return (
                        <DeFiAssetImage mr={5} key={data.address}>
                          <img src={`https://assets.solace.fi/${data.address.toLowerCase()}`} alt={data.name} />
                        </DeFiAssetImage>
                      )
                    })}
                    {positions.length > maxPositionsToDisplay && <StyledDots size={20} />}
                  </FlexRow>
                  <ButtonWrapper isColumn>
                    {positions.length > maxPositionsToDisplay && (
                      <Button light widthP={100} onClick={() => setShowAssetsModal(true)}>
                        View all assets
                      </Button>
                    )}
                    <Button light widthP={100} onClick={() => navigation.go(1)}>
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
