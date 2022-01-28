/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import context
    import components
    import hooks

    Bond
      hooks
      local functions
      Render

  *************************************************************************************/

/* import packages */
import React, { useEffect, useMemo, useState } from 'react'

/* import constants */
import { BKPT_4 } from '../../constants'
import { BondTellerDetails } from '../../constants/types'

/* import context */
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { DeFiAssetImage } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { FlexCol, FlexRow, HeroContainer, Scrollable } from '../../components/atoms/Layout'
import { BondModal } from '../../components/organisms/bond/BondModal'
import { Loader } from '../../components/atoms/Loader'
import { HyperLink } from '../../components/atoms/Link'
import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content } from '../../components/atoms/Layout'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useBondTellerDetailsV1 } from '../../hooks/useBondTellerV1'

/* import utils */
import { truncateValue } from '../../utils/formatting'

function Bond(): any {
  /*

  hooks

  */
  const { haveErrors } = useGeneral()
  const { activeNetwork } = useNetwork()
  const [showBondModal, setShowBondModal] = useState<boolean>(false)
  const [selectedBondDetail, setSelectedBondDetail] = useState<BondTellerDetails | undefined>(undefined)
  const { width } = useWindowDimensions()
  const { tellerDetails, mounting } = useBondTellerDetailsV1()
  const currentTellerDetails = useMemo(() => tellerDetails, [tellerDetails])
  const canBondV1 = useMemo(() => activeNetwork.config.availableFeatures.bondingV1, [
    activeNetwork.config.availableFeatures.bondingV1,
  ])

  /*

  local functions

  */

  const openModal = (toggle: boolean, selectedBond?: BondTellerDetails) => {
    if (selectedBond) setSelectedBondDetail(selectedBond)
    setShowBondModal(toggle)
  }

  /*

  useEffect hooks

  */

  useEffect(() => {
    if (!selectedBondDetail) return
    const matchingBond = currentTellerDetails.find(
      (tellerDetail) =>
        tellerDetail.tellerData.teller.contract.address.toLowerCase() ==
        selectedBondDetail.tellerData.teller.contract.address.toLowerCase()
    )
    if (!matchingBond) return
    setSelectedBondDetail(matchingBond)
  }, [selectedBondDetail, currentTellerDetails])

  return (
    <>
      <BondModal closeModal={() => openModal(false)} isOpen={showBondModal} selectedBondDetail={selectedBondDetail} />
      <Text t4 pt={10} pb={10}>
        You can bond by selling your assets for SOLACE at a discounted price.
        <HyperLink
          t4
          href={'https://medium.com/solace-fi/bonds-staking-and-other-ways-to-get-solace-99e71ed3cf2'}
          target="_blank"
          rel="noopener noreferrer"
          info
        >
          {' '}
          More information on bonding here.
        </HyperLink>
        {canBondV1 ? (
          <Content>
            {mounting ? (
              <Loader />
            ) : currentTellerDetails.length > 0 ? (
              width > BKPT_4 ? (
                <Scrollable style={{ padding: '0 10px 0 10px' }}>
                  <Table canHover style={{ borderSpacing: '0px 7px' }}>
                    <TableHead sticky>
                      <TableRow>
                        <TableHeader></TableHeader>
                        <TableHeader>Bond</TableHeader>
                        <TableHeader>Price</TableHeader>
                        <TableHeader>ROI</TableHeader>
                        <TableHeader></TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentTellerDetails.map((tellerDetail, i) => (
                        <TableRow
                          key={i}
                          onClick={
                            haveErrors || tellerDetail.tellerData.teller.isDisabled
                              ? undefined
                              : () => openModal(true, tellerDetail)
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <TableData>
                            <FlexRow jc={'center'}>
                              {tellerDetail.principalData ? (
                                tellerDetail.principalData.token0 && tellerDetail.principalData.token1 ? (
                                  <>
                                    <DeFiAssetImage mr={5} noborder>
                                      <img
                                        src={`https://assets.solace.fi/${tellerDetail.principalData.token0.toLowerCase()}`}
                                        alt={tellerDetail.principalData.token0.toLowerCase()}
                                      />
                                    </DeFiAssetImage>
                                    <DeFiAssetImage noborder>
                                      <img
                                        src={`https://assets.solace.fi/${tellerDetail.principalData.token1.toLowerCase()}`}
                                        alt={tellerDetail.principalData.token1.toLowerCase()}
                                      />
                                    </DeFiAssetImage>
                                  </>
                                ) : (
                                  <DeFiAssetImage noborder>
                                    <img
                                      src={`https://assets.solace.fi/${tellerDetail.tellerData.principalAddr.toLowerCase()}`}
                                      alt={tellerDetail.tellerData.teller.name}
                                    />
                                  </DeFiAssetImage>
                                )
                              ) : (
                                <Loader height={10} width={10} />
                              )}
                            </FlexRow>
                          </TableData>
                          <TableData>{tellerDetail.tellerData.teller.name}</TableData>
                          <TableData>
                            <Text fade={tellerDetail.tellerData.usdBondPrice <= 0}>
                              {tellerDetail.tellerData.usdBondPrice > 0
                                ? `$${truncateValue(tellerDetail.tellerData.usdBondPrice, 4)}`
                                : `USD price not found`}
                            </Text>
                          </TableData>
                          <TableData>
                            <Text>{truncateValue(tellerDetail.tellerData.bondRoi, 2, false)}%</Text>
                          </TableData>
                          <TableData textAlignRight>
                            <Button disabled={haveErrors || tellerDetail.tellerData.teller.isDisabled} info>
                              {tellerDetail.tellerData.teller.isDisabled ? 'Disabled' : 'Bond'}
                            </Button>
                          </TableData>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollable>
              ) : (
                // mobile version
                <Scrollable maxMobileHeight={65}>
                  <CardContainer cardsPerRow={2}>
                    {currentTellerDetails.map((tellerDetail, i) => (
                      <Card key={i} onClick={haveErrors ? undefined : () => openModal(true, tellerDetail)}>
                        <FlexCol style={{ alignItems: 'center' }}>
                          <FormRow>
                            <FlexRow>
                              {tellerDetail.principalData ? (
                                tellerDetail.principalData.token0 && tellerDetail.principalData.token1 ? (
                                  <>
                                    <DeFiAssetImage mr={10} noborder>
                                      <img
                                        src={`https://assets.solace.fi/${tellerDetail.principalData.token0.toLowerCase()}`}
                                        alt={tellerDetail.principalData.token0.toLowerCase()}
                                      />
                                    </DeFiAssetImage>
                                    <DeFiAssetImage mr={10} noborder>
                                      <img
                                        src={`https://assets.solace.fi/${tellerDetail.principalData.token1.toLowerCase()}`}
                                        alt={tellerDetail.principalData.token1.toLowerCase()}
                                      />
                                    </DeFiAssetImage>
                                  </>
                                ) : (
                                  <DeFiAssetImage mr={10} noborder>
                                    <img
                                      src={`https://assets.solace.fi/${tellerDetail.principalData.principalProps.name.toLowerCase()}`}
                                      alt={tellerDetail.tellerData.teller.name}
                                    />
                                  </DeFiAssetImage>
                                )
                              ) : (
                                <Loader height={10} width={10} />
                              )}
                            </FlexRow>
                          </FormRow>
                          <FlexCol style={{ display: 'flex', alignItems: 'center' }}>
                            <Text t2 mb={20}>
                              {tellerDetail.tellerData.teller.name}
                            </Text>
                          </FlexCol>
                        </FlexCol>
                        <FormRow>
                          <FormCol>Price</FormCol>
                          <FormCol>
                            <Text bold t2 fade={tellerDetail.tellerData.usdBondPrice <= 0}>
                              {tellerDetail.tellerData.usdBondPrice > 0
                                ? `$${truncateValue(tellerDetail.tellerData.usdBondPrice, 4)}`
                                : `USD price not found`}
                            </Text>
                          </FormCol>
                        </FormRow>
                        <FormRow>
                          <FormCol>ROI</FormCol>
                          <FormCol>
                            <Text bold t2>
                              {truncateValue(tellerDetail.tellerData.bondRoi, 2, false)}%
                            </Text>
                          </FormCol>
                        </FormRow>
                      </Card>
                    ))}
                  </CardContainer>
                </Scrollable>
              )
            ) : (
              <HeroContainer>
                <Text t1 textAlignCenter mb={20}>
                  No bonds found.
                </Text>
              </HeroContainer>
            )}
          </Content>
        ) : (
          <Content>
            <Box error pt={10} pb={10} pl={15} pr={15}>
              <TextSpan light textAlignLeft>
                <StyledInfo size={30} />
              </TextSpan>
              <Text light bold style={{ margin: '0 auto' }}>
                Bonding is not available on this network.
              </Text>
            </Box>
          </Content>
        )}
      </Text>
    </>
  )
}

export default Bond
