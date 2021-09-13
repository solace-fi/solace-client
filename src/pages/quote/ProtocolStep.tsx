/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import context
    import components
    import hooks
    import utils

    styled components

    ProtocolStep function
      custom hooks
      useState hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import packages */
import styled from 'styled-components'
import useDebounce from '@rooks/use-debounce'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import context */
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralProvider'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { Search } from '../../components/atoms/Input'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/atoms/Protocol'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Content } from '../../components/atoms/Layout'
import { Heading2 } from '../../components/atoms/Typography'

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

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    justify-content: center;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const availableCoverages = useGetAvailableCoverages()
  const yearlyCosts = useGetYearlyCosts()
  const { products, setSelectedProtocolByName } = useContracts()
  const { errors } = useGeneral()
  const { width } = useWindowDimensions()
  const { activeNetwork } = useNetwork()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [searchValue, setSearchValue] = useState<string>('')

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const handleChange = (selectedProtocol: any) => {
    setSelectedProtocolByName(selectedProtocol.name)
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

  const handleAvailableCoverage = (protocol: string) => {
    if (!availableCoverages[protocol]) return '0'
    return truncateBalance(availableCoverages[protocol], 2)
  }

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <ActionsContainer>
        <Search type="search" placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
      </ActionsContainer>
      <Content>
        {width > MAX_MOBILE_SCREEN_WIDTH ? (
          <Table canHover>
            <TableHead>
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
                      onClick={
                        errors.length > 0
                          ? undefined
                          : () =>
                              handleChange({
                                name: protocol,
                                availableCoverage: handleAvailableCoverage(protocol),
                                yearlyCost:
                                  parseFloat(yearlyCosts[protocol] ?? '0') *
                                  Math.pow(10, 6) *
                                  NUM_BLOCKS_PER_DAY *
                                  DAYS_PER_YEAR,
                              })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <TableData>
                        <Protocol>
                          <ProtocolImage mr={10}>
                            <img src={`https://assets.solace.fi/${protocol.toLowerCase()}`} />
                          </ProtocolImage>
                          <ProtocolTitle high_em h3>
                            {protocol}
                          </ProtocolTitle>
                        </Protocol>
                      </TableData>
                      <TableData high_em>
                        {fixed(
                          parseFloat(yearlyCosts[protocol] ?? '0') *
                            Math.pow(10, 6) *
                            NUM_BLOCKS_PER_DAY *
                            DAYS_PER_YEAR *
                            100,
                          2
                        )}
                        %
                      </TableData>
                      <TableData high_em>
                        {handleAvailableCoverage(protocol)} {activeNetwork.nativeCurrency.symbol}
                      </TableData>
                      <TableData textAlignRight>
                        <Button disabled={errors.length > 0}>Select</Button>
                      </TableData>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        ) : (
          // mobile version
          <CardContainer cardsPerRow={2}>
            {products
              .map((product) => {
                return product.name
              })
              .filter((protocol: string) => protocol.toLowerCase().includes(searchValue.toLowerCase()))
              .map((protocol: string) => {
                return (
                  <Card
                    key={protocol}
                    onClick={
                      errors.length > 0
                        ? undefined
                        : () =>
                            handleChange({
                              name: protocol,
                              availableCoverage: handleAvailableCoverage(protocol),
                              yearlyCost:
                                parseFloat(yearlyCosts[protocol] ?? '0') *
                                Math.pow(10, 6) *
                                NUM_BLOCKS_PER_DAY *
                                DAYS_PER_YEAR,
                            })
                    }
                  >
                    <FormRow>
                      <FormCol>
                        <ProtocolImage mr={10}>
                          <img src={`https://assets.solace.fi/${protocol.toLowerCase()}`} />
                        </ProtocolImage>
                      </FormCol>
                      <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                        <Heading2 high_em>{protocol}</Heading2>
                      </FormCol>
                    </FormRow>
                    <FormRow>
                      <FormCol>Yearly Cost</FormCol>
                      <FormCol>
                        <Heading2 high_em>
                          {fixed(
                            parseFloat(yearlyCosts[protocol] ?? '0') *
                              Math.pow(10, 6) *
                              NUM_BLOCKS_PER_DAY *
                              DAYS_PER_YEAR *
                              100,
                            2
                          )}
                          %
                        </Heading2>
                      </FormCol>
                    </FormRow>
                    <FormRow>
                      <FormCol>Coverage Available</FormCol>
                      <FormCol>
                        <Heading2 high_em>
                          {handleAvailableCoverage(protocol)} {activeNetwork.nativeCurrency.symbol}
                        </Heading2>
                      </FormCol>
                    </FormRow>
                  </Card>
                )
              })}
          </CardContainer>
        )}
      </Content>
    </Fragment>
  )
}
