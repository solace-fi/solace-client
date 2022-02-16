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
import { ProductContract } from '../../constants/types'

/* import context */
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { Search } from '../../components/atoms/Input'
import { DeFiAsset, DeFiAssetImage, ProtocolTitle } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormCol } from '../../components/atoms/Form'
import { Scrollable, Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'

/* import hooks */
import { useGetAvailableCoverages, useGetYearlyCosts } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed, truncateValue } from '../../utils/formatting'

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

  const handleAvailableCoverage = (protocol: string) => truncateValue(availableCoverages[protocol] ?? '0', 2)

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
                  .filter((protocol: ProductContract) =>
                    protocol.name.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((protocol: ProductContract) => {
                    return (
                      <TableRow
                        key={protocol.name}
                        onClick={haveErrors ? undefined : () => handleChange(protocol.name)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableData>
                          <DeFiAsset>
                            <DeFiAssetImage mr={10}>
                              <img
                                src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`}
                                alt={protocol.name}
                              />
                            </DeFiAssetImage>
                            <ProtocolTitle t3>{protocol.name}</ProtocolTitle>
                          </DeFiAsset>
                        </TableData>
                        <TableData>{fixed(getAdjustedYearlyCost(yearlyCosts[protocol.name]) * 100, 2)}%</TableData>
                        <TableData>
                          {handleAvailableCoverage(protocol.name)} {activeNetwork.nativeCurrency.symbol}
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
                .filter((protocol: ProductContract) => protocol.name.toLowerCase().includes(searchValue.toLowerCase()))
                .map((protocol: ProductContract) => {
                  return (
                    <Card key={protocol.name} onClick={haveErrors ? undefined : () => handleChange(protocol.name)}>
                      <Flex stretch between mb={24}>
                        <FormCol>
                          <DeFiAssetImage mr={10}>
                            <img src={`https://assets.solace.fi/${protocol.name.toLowerCase()}`} alt={protocol.name} />
                          </DeFiAssetImage>
                        </FormCol>
                        <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                          <Text bold t2>
                            {protocol.name}
                          </Text>
                        </FormCol>
                      </Flex>
                      <Flex stretch between mb={24}>
                        <FormCol>Yearly Cost</FormCol>
                        <FormCol>
                          <Text bold t2>
                            {fixed(getAdjustedYearlyCost(yearlyCosts[protocol.name]) * 100, 2)}%
                          </Text>
                        </FormCol>
                      </Flex>
                      <Flex stretch between mb={24}>
                        <FormCol>Coverage Available</FormCol>
                        <FormCol>
                          <Text bold t2>
                            {handleAvailableCoverage(protocol.name)} {activeNetwork.nativeCurrency.symbol}
                          </Text>
                        </FormCol>
                      </Flex>
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
