/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import context
    import components
    import hooks

    BondV2
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
import { Flex, HeroContainer, Scrollable, Content } from '../../components/atoms/Layout'
import { BondModalV2 } from '../../components/organisms/bond/v2/BondModalV2'
import { Loader } from '../../components/atoms/Loader'
import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useBondTellerDetailsV2 } from '../../hooks/bond/useBondTellerV2'

/* import utils */
import { truncateValue } from '../../utils/formatting'

export const BondV2 = () => {
  /*

  hooks

  */
  const { haveErrors } = useGeneral()
  const { activeNetwork } = useNetwork()
  const [selectedBondDetail, setSelectedBondDetail] = useState<BondTellerDetails | undefined>(undefined)
  const { width } = useWindowDimensions()

  const [showBondModal, setShowBondModal] = useState<boolean>(false)

  const canBond = useMemo(() => !activeNetwork.config.restrictedFeatures.noBondingV2, [
    activeNetwork.config.restrictedFeatures.noBondingV2,
  ])

  const btd = useBondTellerDetailsV2(true)

  const currentTellerDetails = useMemo(() => btd.tellerDetails, [btd.tellerDetails])

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
    if (matchingBond) {
      setSelectedBondDetail(matchingBond)
      return
    }
  }, [selectedBondDetail, currentTellerDetails])

  return (
    <>
      <BondModalV2 closeModal={() => openModal(false)} isOpen={showBondModal} selectedBondDetail={selectedBondDetail} />
      {canBond ? (
        <>
          {btd.mounting && canBond ? (
            <Content>
              <Loader />
            </Content>
          ) : (
            <>
              {canBond && currentTellerDetails.length > 0 ? (
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
                                <Flex justifyCenter>
                                  {tellerDetail.principalData ? (
                                    <DeFiAssetImage noborder>
                                      <img
                                        src={`https://assets.solace.fi/${tellerDetail.principalData.principalProps.name.toLowerCase()}`}
                                        alt={tellerDetail.tellerData.teller.name}
                                      />
                                    </DeFiAssetImage>
                                  ) : (
                                    <Loader height={10} width={10} />
                                  )}
                                </Flex>
                              </TableData>
                              <TableData>{tellerDetail.tellerData.teller.name}</TableData>
                              <TableData>
                                <Text t3 fade={tellerDetail.tellerData.usdBondPrice <= 0}>
                                  {tellerDetail.tellerData.usdBondPrice > 0
                                    ? `$${truncateValue(tellerDetail.tellerData.usdBondPrice, 4)}`
                                    : `USD price not found`}
                                </Text>
                              </TableData>
                              <TableData>
                                <Text t3>{truncateValue(tellerDetail.tellerData.bondRoi, 2, false)}%</Text>
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
                                          alt={tellerDetail.tellerData.teller.name}
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
                                  {tellerDetail.tellerData.teller.name}
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
              Bonding is not available on this network.
            </Text>
          </Box>
        </Content>
      )}
    </>
  )
}
