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
import { BondModalV1 } from '../../components/organisms/bond/v1/BondModalV1'
import { BondModalV2 } from '../../components/organisms/bond/v2/BondModalV2'
import { Loader } from '../../components/atoms/Loader'
import { HyperLink } from '../../components/atoms/Link'
import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content } from '../../components/atoms/Layout'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useBondTellerDetailsV1 } from '../../hooks/useBondTellerV1'
import { useBondTellerDetailsV2 } from '../../hooks/useBondTellerV2'

/* import utils */
import { truncateValue } from '../../utils/formatting'
import { ModalCell } from '../../components/atoms/Modal'
import { VerticalSeparator } from '../stake/components/VerticalSeparator'

function Bond(): any {
  /*

  hooks

  */
  const { haveErrors } = useGeneral()
  const { activeNetwork } = useNetwork()
  const [selectedBondDetail, setSelectedBondDetail] = useState<BondTellerDetails | undefined>(undefined)
  const { width } = useWindowDimensions()

  const [showBondModalV1, setShowBondModalV1] = useState<boolean>(false)
  const [showBondModalV2, setShowBondModalV2] = useState<boolean>(false)

  const [showV2Bonds, setShowV2Bonds] = useState<boolean>(true)
  const [showV1Bonds, setShowV1Bonds] = useState<boolean>(false)

  const btdV1 = useBondTellerDetailsV1(showV1Bonds)
  const btdV2 = useBondTellerDetailsV2(showV2Bonds)

  const currentTellerDetailsV1 = useMemo(() => btdV1.tellerDetails, [btdV1.tellerDetails])
  const currentTellerDetailsV2 = useMemo(() => btdV2.tellerDetails, [btdV2.tellerDetails])

  const canBondV1 = useMemo(() => activeNetwork.config.availableFeatures.bondingV1, [
    activeNetwork.config.availableFeatures.bondingV1,
  ])
  const canBondV2 = useMemo(() => activeNetwork.config.availableFeatures.bondingV2, [
    activeNetwork.config.availableFeatures.bondingV2,
  ])

  /*

  local functions

  */

  const openModalV1 = (toggle: boolean, selectedBond?: BondTellerDetails) => {
    if (selectedBond) setSelectedBondDetail(selectedBond)
    setShowBondModalV1(toggle)
  }

  const openModalV2 = (toggle: boolean, selectedBond?: BondTellerDetails) => {
    if (selectedBond) setSelectedBondDetail(selectedBond)
    setShowBondModalV2(toggle)
  }

  /*

  useEffect hooks

  */

  useEffect(() => {
    if (!selectedBondDetail) return
    const matchingBondV1 = currentTellerDetailsV1.find(
      (tellerDetail) =>
        tellerDetail.tellerData.teller.contract.address.toLowerCase() ==
        selectedBondDetail.tellerData.teller.contract.address.toLowerCase()
    )
    if (matchingBondV1) {
      setSelectedBondDetail(matchingBondV1)
      return
    }
    const matchingBondV2 = currentTellerDetailsV2.find(
      (tellerDetail) =>
        tellerDetail.tellerData.teller.contract.address.toLowerCase() ==
        selectedBondDetail.tellerData.teller.contract.address.toLowerCase()
    )
    if (matchingBondV2) {
      setSelectedBondDetail(matchingBondV2)
      return
    }
  }, [selectedBondDetail, currentTellerDetailsV1, currentTellerDetailsV2])

  return (
    <>
      <BondModalV1
        closeModal={() => openModalV1(false)}
        isOpen={showBondModalV1}
        selectedBondDetail={selectedBondDetail}
      />
      <BondModalV2
        closeModal={() => openModalV2(false)}
        isOpen={showBondModalV2}
        selectedBondDetail={selectedBondDetail}
      />
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
        <Content>
          <Card>
            <div style={{ gridTemplateColumns: '1fr 0fr 1fr', display: 'grid', position: 'relative' }}>
              <ModalCell
                pt={5}
                pb={10}
                pl={0}
                pr={0}
                onClick={() => {
                  setShowV1Bonds(true)
                  setShowV2Bonds(false)
                }}
                jc={'center'}
                style={{ cursor: 'pointer', backgroundColor: !showV1Bonds ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
              >
                <Text t1 bold info={showV1Bonds}>
                  V1
                </Text>
              </ModalCell>
              <VerticalSeparator />
              <ModalCell
                pt={5}
                pb={10}
                pl={0}
                pr={0}
                onClick={() => {
                  setShowV1Bonds(false)
                  setShowV2Bonds(true)
                }}
                jc={'center'}
                style={{ cursor: 'pointer', backgroundColor: !showV2Bonds ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
              >
                <Text t1 bold info={showV2Bonds}>
                  V2
                </Text>
              </ModalCell>
            </div>
          </Card>
        </Content>
        {canBondV1 || canBondV2 ? (
          <>
            {(btdV1.mounting && showV1Bonds && canBondV1) || (btdV2.mounting && showV2Bonds && canBondV2) ? (
              <Content>
                <Loader />
              </Content>
            ) : (
              <>
                {showV2Bonds &&
                  (canBondV2 && currentTellerDetailsV2.length > 0 ? (
                    width > BKPT_4 ? (
                      <Content>
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
                              {currentTellerDetailsV2.map((tellerDetail, i) => (
                                <TableRow
                                  key={i}
                                  onClick={
                                    haveErrors || tellerDetail.tellerData.teller.isDisabled
                                      ? undefined
                                      : () => openModalV2(true, tellerDetail)
                                  }
                                  style={{ cursor: 'pointer' }}
                                >
                                  <TableData>
                                    <FlexRow jc={'center'}>
                                      {tellerDetail.principalData ? (
                                        <DeFiAssetImage noborder>
                                          <img
                                            src={`https://assets.solace.fi/${tellerDetail.tellerData.principalAddr.toLowerCase()}`}
                                            alt={tellerDetail.tellerData.teller.name}
                                          />
                                        </DeFiAssetImage>
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
                      </Content>
                    ) : (
                      // mobile version
                      <Content>
                        <Scrollable maxMobileHeight={65}>
                          <CardContainer cardsPerRow={2}>
                            {currentTellerDetailsV2.map((tellerDetail, i) => (
                              <Card key={i} onClick={haveErrors ? undefined : () => openModalV2(true, tellerDetail)}>
                                <FlexCol style={{ alignItems: 'center' }}>
                                  <FormRow>
                                    <FlexRow>
                                      {tellerDetail.principalData ? (
                                        <DeFiAssetImage mr={10} noborder>
                                          <img
                                            src={`https://assets.solace.fi/${tellerDetail.principalData.principalProps.name.toLowerCase()}`}
                                            alt={tellerDetail.tellerData.teller.name}
                                          />
                                        </DeFiAssetImage>
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
                      </Content>
                    )
                  ) : (
                    <HeroContainer>
                      <Text t1 textAlignCenter mb={20}>
                        No V2 bonds found.
                      </Text>
                    </HeroContainer>
                  ))}
                {showV1Bonds &&
                  (canBondV1 && currentTellerDetailsV1.length > 0 ? (
                    width > BKPT_4 ? (
                      <Content>
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
                              {currentTellerDetailsV1.map((tellerDetail, i) => (
                                <TableRow
                                  key={i}
                                  onClick={
                                    haveErrors || tellerDetail.tellerData.teller.isDisabled
                                      ? undefined
                                      : () => openModalV1(true, tellerDetail)
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
                      </Content>
                    ) : (
                      // mobile version
                      <Content>
                        <Scrollable maxMobileHeight={65}>
                          <CardContainer cardsPerRow={2}>
                            {currentTellerDetailsV1.map((tellerDetail, i) => (
                              <Card key={i} onClick={haveErrors ? undefined : () => openModalV1(true, tellerDetail)}>
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
                      </Content>
                    )
                  ) : (
                    <HeroContainer>
                      <Text t1 textAlignCenter mb={20}>
                        No V1 bonds found.
                      </Text>
                    </HeroContainer>
                  ))}
              </>
            )}
          </>
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
