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
import React, { Fragment, useEffect, useMemo, useState } from 'react'

/* import constants */
import { BKPT_4 } from '../../constants'
import { BondTellerDetails } from '../../constants/types'

/* import context */
import { useGeneral } from '../../context/GeneralProvider'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { DeFiAssetImage } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { FlexCol, FlexRow, HeroContainer, Scrollable } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { BondModal } from '../../components/organisms/BondModal'
import { Loader } from '../../components/atoms/Loader'
import { HyperLink } from '../../components/atoms/Link'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useBondTellerDetails } from '../../hooks/useBondTeller'
import { usePairPrice } from '../../hooks/usePair'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

function Bond(): any {
  /*

  hooks

  */
  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const [showBondModal, setShowBondModal] = useState<boolean>(false)
  const [selectedBondDetail, setSelectedBondDetail] = useState<BondTellerDetails | undefined>(undefined)
  const { width } = useWindowDimensions()
  const { tellerDetails, mounting } = useBondTellerDetails()
  const currentTellerDetails = useMemo(() => tellerDetails, [tellerDetails])

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
    <Fragment>
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
      </Text>
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
                  <TableHeader>Price Per SOLACE</TableHeader>
                  <TableHeader>Return on Investment</TableHeader>
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTellerDetails.map((tellerDetail, i) => (
                  <TableRow
                    key={i}
                    onClick={haveErrors ? undefined : () => openModal(true, tellerDetail)}
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
                          ? `$${truncateBalance(tellerDetail.tellerData.usdBondPrice, 4)}`
                          : `USD price not found`}
                      </Text>
                    </TableData>
                    <TableData>
                      <Text>{truncateBalance(tellerDetail.tellerData.bondRoi, 2, false)}%</Text>
                    </TableData>
                    <TableData textAlignRight>
                      <Button disabled={haveErrors} info>
                        Bond
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
                    <FormCol>Price Per SOLACE</FormCol>
                    <FormCol>
                      <Text bold t2 fade={tellerDetail.tellerData.usdBondPrice <= 0}>
                        {tellerDetail.tellerData.usdBondPrice > 0
                          ? `$${truncateBalance(tellerDetail.tellerData.usdBondPrice, 4)}`
                          : `USD price not found`}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow>
                    <FormCol>Return on Investment</FormCol>
                    <FormCol>
                      <Text bold t2>
                        {truncateBalance(tellerDetail.tellerData.bondRoi, 2, false)}%
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
    </Fragment>
  )
}

export default Bond
