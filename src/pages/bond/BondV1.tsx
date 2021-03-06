/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import context
    import components
    import hooks

    BondV1
      hooks
      local functions
      Render

  *************************************************************************************/

/* import packages */
import React, { useEffect, useMemo, useState } from 'react'

/* import constants */
import { BKPT_4, BKPT_5 } from '../../constants'
import { BondTellerFullDetails } from '../../constants/types'

/* import context */
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { DeFiAssetImage } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../../components/atoms/Card'
import { Flex, HeroContainer, Scrollable, Content } from '../../components/atoms/Layout'
import { BondModalV1 } from '../../components/organisms/bond/v1/BondModalV1'
import { Loader } from '../../components/atoms/Loader'
import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useBondTellerFullDetailsV1 } from '../../hooks/bond/useBondTellerV1'

export const BondV1 = () => {
  /*

  hooks

  */
  const { haveErrors, rightSidebar } = useGeneral()
  const { activeNetwork } = useNetwork()
  const [selectedBondDetail, setSelectedBondDetail] = useState<BondTellerFullDetails | undefined>(undefined)
  const { width } = useWindowDimensions()

  const [showBondModal, setShowBondModal] = useState<boolean>(false)

  const canBond = useMemo(() => !activeNetwork.config.restrictedFeatures.noBondingV1, [
    activeNetwork.config.restrictedFeatures.noBondingV1,
  ])

  const btd = useBondTellerFullDetailsV1(true)

  const currentTellerDetails = useMemo(() => btd.tellerDetails, [btd.tellerDetails])

  /*

  local functions

  */

  const openModal = (toggle: boolean, selectedBond?: BondTellerFullDetails) => {
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
    if (matchingBond) {
      setSelectedBondDetail(matchingBond)
      return
    }
  }, [selectedBondDetail, currentTellerDetails])

  return (
    <>
      <BondModalV1 closeModal={() => openModal(false)} isOpen={showBondModal} selectedBondDetail={selectedBondDetail} />
      {canBond ? (
        <>
          {btd.mounting && canBond ? (
            <Content>
              <Loader />
            </Content>
          ) : (
            <>
              {canBond && currentTellerDetails.length > 0 ? (
                width > (rightSidebar ? BKPT_5 : BKPT_4) ? (
                  <Content>
                    <Text bold t1 mb={10} warning>
                      V1 Bonds
                    </Text>
                    <Scrollable style={{ padding: '0 10px 0 10px' }}>
                      <Table canHover style={{ borderSpacing: '0px 7px' }}>
                        <TableHead sticky>
                          <TableRow>
                            <TableHeader></TableHeader>
                            <TableHeader>Bond</TableHeader>
                            <TableHeader></TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentTellerDetails.map((tellerDetail, i) => (
                            <TableRow
                              key={i}
                              onClick={
                                haveErrors || tellerDetail.metadata.isDisabled
                                  ? undefined
                                  : () => openModal(true, tellerDetail)
                              }
                              style={{ cursor: 'pointer' }}
                            >
                              <TableData>
                                <Flex justifyCenter>
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
                                          src={`https://assets.solace.fi/${tellerDetail.principalData.principalProps.name.toLowerCase()}`}
                                          alt={tellerDetail.metadata.name}
                                        />
                                      </DeFiAssetImage>
                                    )
                                  ) : (
                                    <Loader height={10} width={10} />
                                  )}
                                </Flex>
                              </TableData>
                              <TableData>{tellerDetail.metadata.name}</TableData>
                              <TableData textAlignRight>
                                <Button disabled={haveErrors || tellerDetail.metadata.isDisabled} info>
                                  {tellerDetail.metadata.isDisabled ? 'Disabled' : 'Redeem'}
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
                    <Text bold t1 mb={10} warning>
                      V1 Bonds
                    </Text>
                    <Scrollable maxMobileHeight={'65vh'}>
                      <CardContainer cardsPerRow={2}>
                        {currentTellerDetails.map((tellerDetail, i) => (
                          <Card key={i} onClick={haveErrors ? undefined : () => openModal(true, tellerDetail)}>
                            <Flex col style={{ alignItems: 'center' }}>
                              <Flex stretch between mb={24}>
                                <Flex>
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
                                          alt={tellerDetail.metadata.name}
                                        />
                                      </DeFiAssetImage>
                                    )
                                  ) : (
                                    <Loader height={10} width={10} />
                                  )}
                                </Flex>
                              </Flex>
                              <Flex style={{ alignItems: 'center' }}>
                                <Text t2 mb={20}>
                                  {tellerDetail.metadata.name}
                                </Text>
                              </Flex>
                            </Flex>
                          </Card>
                        ))}
                      </CardContainer>
                    </Scrollable>
                  </Content>
                )
              ) : (
                <HeroContainer>
                  <Text t1 textAlignCenter mb={20}>
                    No bonds found.
                  </Text>
                </HeroContainer>
              )}
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
              V1 Bonding is not available on this network.
            </Text>
          </Box>
        </Content>
      )}
    </>
  )
}
