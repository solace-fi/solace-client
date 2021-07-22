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
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY } from '../../constants'

/* import context */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/Table'
import { Search } from '../../components/Input'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'

/* import hooks */
import { useGetAvailableCoverages, useGetYearlyCosts } from '../../hooks/usePolicy'

/* import utils */
import { fixed, getNativeTokenUnit } from '../../utils/formatting'

/*************************************************************************************

  styled components

  *************************************************************************************/
const ActionsContainer = styled.div`
  padding-top: 20px;
  display: flex;
  align-items: center;
  ${Search} {
    width: 300px;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const availableCoverages = useGetAvailableCoverages()
  const yearlyCosts = useGetYearlyCosts()
  const { products, setSelectedProtocolByName } = useContracts()
  const wallet = useWallet()

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
    return availableCoverages[protocol].split('.')[0]
  }

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <ActionsContainer>
        <Search type="search" placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
      </ActionsContainer>
      <Table isQuote>
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
                    wallet.errors.length > 0
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
                      <ProtocolTitle>{protocol}</ProtocolTitle>
                    </Protocol>
                  </TableData>
                  <TableData>
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
                  <TableData>
                    {handleAvailableCoverage(protocol)} {getNativeTokenUnit(wallet.chainId)}
                  </TableData>
                  <TableData textAlignRight>
                    <Button disabled={wallet.errors.length > 0}>Select</Button>
                  </TableData>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </Fragment>
  )
}
