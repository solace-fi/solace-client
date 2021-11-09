/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import context
    import components
    import hooks
    import utils

    styled components

    ProtocolStep
      hooks
      local functions
      Render

  *************************************************************************************/

/* import packages */
import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import useDebounce from '@rooks/use-debounce'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, BKPT_3 } from '../../constants'

/* import context */
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralProvider'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { Search } from '../../components/atoms/Input'
import { DeFiAsset, DeFiAssetImage, ProtocolTitle } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Scrollable } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'

/* import hooks */
import { useGetAvailableCoverages, useGetYearlyCosts } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed, truncateBalance } from '../../utils/formatting'

/*************************************************************************************

  styled components

  *************************************************************************************/
const ActionsContainer = styled.div`
  padding: 20px 5px 0;
  display: flex;
  align-items: center;
  ${Search} {
    width: 300px;
  }

  @media screen and (max-width: ${BKPT_3}px) {
    justify-content: center;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ setForm, navigation }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const availableCoverages = useGetAvailableCoverages()
  const yearlyCosts = useGetYearlyCosts()
  const { products, setSelectedProtocolByName } = useContracts()
  const { haveErrors } = useGeneral()
  const { width } = useWindowDimensions()
  const { activeNetwork } = useNetwork()
  const [searchValue, setSearchValue] = useState<string>('')

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const handleChange = (selectedProtocolName: string) => {
    const selectedProtocol = {
      name: selectedProtocolName,
      availableCoverage: handleAvailableCoverage(selectedProtocolName),
      yearlyCost: getAdjustedYearlyCost(yearlyCosts[selectedProtocolName]),
    }
    setSelectedProtocolByName(selectedProtocolName)
    setForm({
      target: {
        name: 'protocol',
        value: selectedProtocol,
      },
    })
    navigation.next()
  }

  const handleSearch = useDebounce((searchValue: string) => {
    setSearchValue(searchValue)
  }, 300)

  const handleAvailableCoverage = (protocol: string) => truncateBalance(availableCoverages[protocol] ?? '0', 2)

  const getAdjustedYearlyCost = (yearlyCost: string) =>
    parseFloat(yearlyCost ?? '0') * Math.pow(10, 6) * NUM_BLOCKS_PER_DAY * DAYS_PER_YEAR

  return (
    <Fragment>
      <ActionsContainer>
        <Search type="search" placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
      </ActionsContainer>
      <Fragment>
        {width > BKPT_3 ? (
          <Scrollable style={{ padding: '0 10px 0 10px' }}>
            <Table canHover style={{ borderSpacing: '0px 7px' }}>
              <TableHead sticky>
                <TableRow>
                  <TableHeader>Protocol</TableHeader>
                  <TableHeader>Yearly Cost</TableHeader>
                  <TableHeader>Coverage Available</TableHeader>
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {products
                  .map((product) => {
                    return product.name
                  })
                  .filter((protocol: string) => protocol.toLowerCase().includes(searchValue.toLowerCase()))
                  .map((protocol: string) => {
                    return (
                      <TableRow
                        key={protocol}
                        onClick={haveErrors ? undefined : () => handleChange(protocol)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableData>
                          <DeFiAsset>
                            <DeFiAssetImage mr={10}>
                              <img src={`https://assets.solace.fi/${protocol.toLowerCase()}`} alt={protocol} />
                            </DeFiAssetImage>
                            <ProtocolTitle t3>{protocol}</ProtocolTitle>
                          </DeFiAsset>
                        </TableData>
                        <TableData>{fixed(getAdjustedYearlyCost(yearlyCosts[protocol]) * 100, 2)}%</TableData>
                        <TableData>
                          {handleAvailableCoverage(protocol)} {activeNetwork.nativeCurrency.symbol}
                        </TableData>
                        <TableData textAlignRight>
                          <Button disabled={haveErrors} info>
                            Select
                          </Button>
                        </TableData>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </Scrollable>
        ) : (
          // mobile version
          <Scrollable maxMobileHeight={65}>
            <CardContainer cardsPerRow={2}>
              {products
                .map((product) => {
                  return product.name
                })
                .filter((protocol: string) => protocol.toLowerCase().includes(searchValue.toLowerCase()))
                .map((protocol: string) => {
                  return (
                    <Card key={protocol} onClick={haveErrors ? undefined : () => handleChange(protocol)}>
                      <FormRow>
                        <FormCol>
                          <DeFiAssetImage mr={10}>
                            <img src={`https://assets.solace.fi/${protocol.toLowerCase()}`} alt={protocol} />
                          </DeFiAssetImage>
                        </FormCol>
                        <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                          <Text bold t2>
                            {protocol}
                          </Text>
                        </FormCol>
                      </FormRow>
                      <FormRow>
                        <FormCol>Yearly Cost</FormCol>
                        <FormCol>
                          <Text bold t2>
                            {fixed(getAdjustedYearlyCost(yearlyCosts[protocol]) * 100, 2)}%
                          </Text>
                        </FormCol>
                      </FormRow>
                      <FormRow>
                        <FormCol>Coverage Available</FormCol>
                        <FormCol>
                          <Text bold t2>
                            {handleAvailableCoverage(protocol)} {activeNetwork.nativeCurrency.symbol}
                          </Text>
                        </FormCol>
                      </FormRow>
                    </Card>
                  )
                })}
            </CardContainer>
          </Scrollable>
        )}
      </Fragment>
    </Fragment>
  )
}
